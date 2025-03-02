import { UserService } from "../services/users.service";
import { Body, Controller, Get, Path, Post, Route, Tags } from "tsoa";

const userService = new UserService();

/**
 * User registration request
 */
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  role: string;
};

/**
 * User login request
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * User response object
 */
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
  /**
   * Register a new user
   */
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

  /**
   * Login a user
   */
  @Post("login")
  public async login(@Body() requestBody: LoginRequest): Promise<UserResponse> {
    // Implementation will go here
    return {
      id: "temp-id",
      email: requestBody.email,
      name: "User",
      role: "user",
      token: "temp-token",
    };
  }
}
