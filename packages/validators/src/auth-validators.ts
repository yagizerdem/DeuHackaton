import { z } from "zod";

export function createRegisterValidator() {
  const userSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(128),
    userName: z.string().trim().min(3).max(20),
    gender: z.enum(["male", "female", "other"]).optional(),
    age: z.number().int().min(0).optional(),
  });
  return userSchema;
}

export interface RegisterInput
  extends z.infer<ReturnType<typeof createRegisterValidator>> {}

export function createLoginValidator() {
  const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1).max(128),
  });
  return loginSchema;
}

export interface LoginInput
  extends z.infer<ReturnType<typeof createLoginValidator>> {}
