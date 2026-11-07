import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { RegisterInput } from "@DeparkHackaton/validators";
import {
  ensureUserNotExistByEmail,
  ensureUserNotExistByUserName,
} from "@/services/user-service.js";
import bcrypt from "bcrypt";
import { User } from "@/models/user-entity.js";

export async function register(_req: Request, _res: Response) {
  const { email, password, userName, gender, age } = _req.body as RegisterInput;

  await ensureUserNotExistByEmail(email);
  await ensureUserNotExistByUserName(userName);

  const hashedPassword: string = await bcrypt.hash(password, 10);

  // register user
  const userFromDb = await User.create({
    email,
    passwordHash: hashedPassword,
    userName,
    gender,
    age,
  });

  return _res.status(HttpStatusCode.CREATED).json(
    ApiResponse.created(
      {
        user: {
          id: userFromDb._id,
          email: userFromDb.email,
          userName: userFromDb.userName,
          gender: userFromDb.gender,
          age: userFromDb.age,
        },
      },
      "User registered successfully",
    ),
  );
}

export async function login(_req: Request, _res: Response) {}

export async function logout(_req: Request, _res: Response) {}
