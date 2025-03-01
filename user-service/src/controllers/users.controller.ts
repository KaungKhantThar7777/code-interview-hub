import type { Request, Response } from "express";
import { UserService } from "../services/users.service";

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      const existingUser = await userService.findByEmail(email);

      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const user = await userService.createUser({
        email,
        password,
        name,
        role,
      });

      const token = userService.generateToken(user);
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    res.status(200).json({ message: "User logged in" });
  }
}
