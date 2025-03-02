import { UserService } from "../services/users.service";
import { Body, Controller, Get, Path, Post, Route, Tags } from "tsoa";

import amqp from "amqplib";
import { publishUserEvent } from "../messaging";

const userService = new UserService();

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
};

@Route("api/users")
@Tags("Users")
export class UsersController extends Controller {
  @Post("register")
  public async register(
    @Body() requestBody: RegisterRequest
  ): Promise<UserResponse> {
    const { email, password, name, role } = requestBody;

    const existingUser = await userService.findByEmail(email);

    if (existingUser) {
      this.setStatus(400);
      throw new Error("User already exists");
    }

    const user = await userService.createUser({
      email,
      password,
      name,
      role,
    });

    await publishUserEvent(user, "user.registered");
    const token = userService.generateToken(user);

    this.setStatus(201);
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  }

  @Post("login")
  public async login(@Body() requestBody: LoginRequest): Promise<UserResponse> {
    return {
      id: "temp-id",
      email: requestBody.email,
      name: "User",
      role: "user",
      token: "temp-token",
    };
  }
}
