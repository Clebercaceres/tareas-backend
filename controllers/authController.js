const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuario
const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword, avatar } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    try {
        const userExists = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (userExists) {
            return res.status(400).json({ message: "El nombre de usuario o el correo ya están en uso" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, avatar });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el registro", error });
    }
};
// Inicio de sesión
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    // Busca el usuario por username o email
    const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
    }).populate('tasks'); // Popula las tareas del usuario

    if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Genera el token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    // Devuelve el token, el nombre de usuario, el avatar y las tareas
    res.json({
        token,
        username: user.username,
        avatar: user.avatar,
        tasks: user.tasks // Aquí se incluyen las tareas del usuario
    });
};

const createTask = async (req, res) => {
    const { title, description, category, priority, deadline } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id); // Cambia para buscar por ID, que es más seguro

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        // Crea una nueva tarea
        const newTask = {
            title,
            description,
            category,
            priority,
            deadline,
        };

        // Agrega la nueva tarea al array de tareas del usuario
        user.tasks.push(newTask);
        await user.save(); // Guarda el usuario con la nueva tarea

        res.status(201).json({ message: "Tarea creada y añadida al usuario", task: newTask });
    } catch (error) {
        console.error("Error en createTask:", error); // Imprime el error completo en la consola
        res.status(500).json({ message: "Error al crear la tarea", error: error.message });
    }
};



// Editar una tarea
const editTask = async (req, res) => {
    const { taskId } = req.params;
    console.log("editandoooooo============", req.body);

    const { title, description } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id); // Cambia para buscar por ID

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        // Encuentra la tarea por ID
        const task = user.tasks.id(taskId); // Usa `id()` para buscar la tarea en el array

        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        // Actualiza los campos de la tarea
        task.title = title;
        task.description = description;
        await user.save(); // Guarda los cambios en el usuario

        res.json({ message: "Tarea actualizada", task });
    } catch (error) {
        res.status(500).json({ message: "Error al editar la tarea", error });
    }
};


// Eliminar una tarea
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Task ID recibido:", taskId);
    console.log("Token recibido:", token);

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decodificado:", decoded);

        const user = await User.findById(decoded.id);
        console.log("Usuario encontrado:", user);

        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        const task = user.tasks.id(taskId);
        console.log("Tarea encontrada:", task);

        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        // Eliminar la tarea usando pull
        user.tasks.pull(taskId);
        await user.save(); // Guarda los cambios en el usuario

        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        console.error("Error durante la eliminación:", error.message);
        res.status(500).json({ message: "Error al eliminar la tarea", error: error.message });
    }
};




const getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Asegúrate de que tu secreto JWT esté configurado
        const user = await User.findById(decoded.id).populate('tasks'); // Asegúrate de que "User" es tu modelo de usuario

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        console.log(users);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
};

module.exports = { registerUser, loginUser, createTask, editTask, deleteTask, getCurrentUser, getAllUsers };
