import { Body, Controller, Inject, Post, Route, Tags } from "tsoa";
import { UserService } from "../services/users.service";
import { RabbitMQClient } from "../messaging/rabbitmq";
import { UserEventPublisher } from "../messaging/publishers";

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  role: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
};

@Route("api/users")
@Tags("Users")
export class UsersController extends Controller {
  private userService: UserService;
  private userEventPublisher: UserEventPublisher;

  constructor() {
    super();
    this.userService = new UserService();
    this.userEventPublisher = new UserEventPublisher(
      RabbitMQClient.getInstance()
    );
  }

  @Post("register")
  public async register(
    @Body() requestBody: RegisterRequest
  ): Promise<UserResponse> {
    const { email, password, name, role } = requestBody;
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      this.setStatus(400);
      throw new Error("User already exists");
    }

    const user = await this.userService.createUser({
      email,
      password,
      name,
      role,
    });

    try {
      await this.userEventPublisher.publishUserEvent(user, "user.registered");
    } catch (error) {
      console.error("Failed to publish user registration event:", error);
      // Continue with the registration process even if event publishing fails
    }

    const token = this.userService.generateToken(user);

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
