import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import swaggerJson from "../build/swagger.json";
import { closeConnection, connectToRabbitMQ } from "./messaging";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Use tsoa generated routes
RegisterRoutes(app);

// Serve Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerJson);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "user-service" });
});

app.listen(PORT, async () => {
  await connectToRabbitMQ();
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/docs`
  );

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await closeConnection();
    process.exit(0);
  });
});
