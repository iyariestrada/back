import express from "express";
import cors from "cors";
import db from "./database/db.js";
import expedienteRoutes from "./routes/routes.js";
import dotenv from "dotenv";
import citasRoutes from './routes/citasRoutes.js';
import observacionesRoutes from './routes/observacionesRoutes.js';
import pacienteEstadoRoutes from './routes/pacienteEstadoRoutes.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/expedientes", expedienteRoutes);
app.use('/citas', citasRoutes);
app.use('/observaciones', observacionesRoutes);
app.use('/estado', pacienteEstadoRoutes);

try {
  db.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

/*app.get('/', (req, res) => {
    res.send('Hello World');
});*/

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
