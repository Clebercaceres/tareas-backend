const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db"); // Asegúrate de que la ruta sea correcta

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDB();

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Ocurrió un error en el servidor", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutado en puerto ${PORT}`);
});
