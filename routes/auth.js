const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ruta para el registro de usuario
router.post('/register', registerUser);

// Ruta para el inicio de sesión
router.post('/login', loginUser);

module.exports = router;
