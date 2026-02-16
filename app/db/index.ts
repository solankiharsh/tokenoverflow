import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(d1: AnyD1Database) {
	return drizzle(d1, { schema });
}

export { schema };
