import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userRoutes } from "./routes/users.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "user-service" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
