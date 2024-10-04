const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  createTask,
  editTask,
  deleteTask,
  getAllUsers,
  getCurrentUser,
} = require("../controllers/authController");

// Rutas de autenticación
router.post("/register", registerUser);
router.post("/login", loginUser);

// Rutas de tareas (CRUD)
router.post("/tasks", createTask); // Crear tarea
router.put("/tasks/:taskId", editTask); // Editar tarea
router.delete("/tasks/:taskId", deleteTask); // Eliminar tarea

router.get('/usuarioLogeado', getCurrentUser); 
// Ruta para obtener todos los usuarios
router.get("/users", getAllUsers);

module.exports = router;
