import { eq } from "drizzle-orm";
import { db } from "../db";
import { NewUser, User, users } from "../db/schema";
import jwt from "jsonwebtoken";
export class UserService {
  async createUser(
    userData: Omit<NewUser, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const hashedPassword = await Bun.password.hash(userData.password);

    const user = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    return user[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  }

  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "test-123!", {
      expiresIn: "1w",
    });
  }
}
