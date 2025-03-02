import express from "express";
import dotenv from "dotenv";

import { connectToRabbitMQ } from "./messaging/rabbitmq";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3002", 10);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Email Service" });
});

app.listen(PORT, () => {
  console.log(`Email service is running on port ${PORT}`);
  connectToRabbitMQ();
});
