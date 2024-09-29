const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let users = [];

const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword, avatar } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const userExists = users.find(
        (user) => user.username === username || user.email === email
    );

    if (userExists) {
        return res
            .status(400)
            .json({ message: "El nombre de usuario o el correo ya están en uso" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({ username, email, password: hashedPassword, avatar });

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el registro", error });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    const user = users.find(user => user.username === identifier || user.email === identifier);

    if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username, avatar: user.avatar });
};

module.exports = { registerUser, loginUser };
