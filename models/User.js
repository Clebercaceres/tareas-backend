const mongoose = require('mongoose');

// Definición del esquema de la tarea
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: String,
    priority: String,
    deadline: {
        type: Date,
        required: true
    }
});

// Definición del esquema del usuario
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: String,
    tasks: [TaskSchema]  // Aquí se anidan las tareas directamente en el usuario
});

// Modelos de Mongoose
const User = mongoose.model('User', UserSchema);

// Exporta el modelo User
module.exports = User;
