import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbConfig } from "../config/database";
import * as schema from "./schema";

// Create pool using the config
const pool = new Pool(dbConfig);

export const db = drizzle(pool, { schema });

export { dbConfig };
