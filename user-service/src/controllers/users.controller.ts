import type { Request, Response } from "express";
import { UserService } from "../services/users.service";

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      console.log({ email, password, name, role });
      res.status(201).json({ message: "User registered" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    res.status(200).json({ message: "User logged in" });
  }
}
