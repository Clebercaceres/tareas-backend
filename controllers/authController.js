const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let users = [];
let tasks = []; // Arreglo para almacenar las tareas

// Registro de usuario
const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword, avatar } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const userExists = users.find(
        (user) => user.username === username || user.email === email
    );

    if (userExists) {
        return res.status(400).json({ message: "El nombre de usuario o el correo ya están en uso" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({ username, email, password: hashedPassword, avatar });

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el registro", error });
    }
};

// Inicio de sesión
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    const user = users.find(
        (user) => user.username === identifier || user.email === identifier
    );

    if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    res.json({ token, username: user.username, avatar: user.avatar });
};

// Crear una nueva tarea
const createTask = (req, res) => {
    const { title, description } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find((user) => user.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        const newTask = {
            id: tasks.length + 1,
            title,
            description,
            username: user.username,
        };

        tasks.push(newTask);

        res.status(201).json({ message: "Tarea creada", task: newTask });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la tarea", error });
    }
};

// Editar una tarea
const editTask = (req, res) => {
    const { taskId } = req.params;
    const { title, description } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find((user) => user.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        const task = tasks.find((task) => task.id == taskId && task.username === user.username);

        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        task.title = title;
        task.description = description;

        res.json({ message: "Tarea actualizada", task });
    } catch (error) {
        res.status(500).json({ message: "Error al editar la tarea", error });
    }
};

// Eliminar una tarea
const deleteTask = (req, res) => {
    const { taskId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find((user) => user.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        const taskIndex = tasks.findIndex((task) => task.id == taskId && task.username === user.username);

        if (taskIndex === -1) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        tasks.splice(taskIndex, 1);

        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la tarea", error });
    }
};

module.exports = { registerUser, loginUser, createTask, editTask, deleteTask };
