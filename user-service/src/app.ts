import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import swaggerJson from "../build/swagger.json";
import { RabbitMQClient } from "./messaging/rabbitmq";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

RegisterRoutes(app);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerJson);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "user-service" });
});

app.listen(PORT, async () => {
  const rabbitClient = RabbitMQClient.getInstance();

  await rabbitClient.connect();
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/docs`
  );

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await rabbitClient.close();
    process.exit(0);
  });
});
