import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import { dbConfig } from "./src/config/database";

dotenv.config();

export default {
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: dbConfig,
} satisfies Config;
