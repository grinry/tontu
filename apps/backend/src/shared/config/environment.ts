import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4111),
  HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .url()
    .regex(/^postgres(?:ql)?:\/\//)
    .optional(),
  PGLITE_DATA_DIR: z.string().min(1).default("./.data/pglite"),
  MASTRA_MODEL: z
    .string()
    .regex(/^[^/]+\/.+$/)
    .optional(),
});

export function parseEnvironment(input: NodeJS.ProcessEnv) {
  const environment = environmentSchema.parse(input);
  if (environment.NODE_ENV === "production" && !environment.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required in production; PGlite is local-only.",
    );
  }
  return environment;
}

export function loadEnvironment() {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) loadEnvFile(envPath);
  return parseEnvironment(process.env);
}

export type Environment = ReturnType<typeof parseEnvironment>;
