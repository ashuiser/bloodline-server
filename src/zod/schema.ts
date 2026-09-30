import z from "zod";

export const reqEnvVarsSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
});
