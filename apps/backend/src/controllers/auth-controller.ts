import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { LoginInput, RegisterInput } from "@DeparkHackaton/validators";
import {
  ensureUserNotExistByEmail,
  ensureUserNotExistByUserName,
} from "@/services/user-service.js";
import bcrypt from "bcrypt";
import { User } from "@/models/user-entity.js";
import { issueTokenPair } from "@/services/token-service.js";
import { AppError } from "@/utils/app-error.js";

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

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash!);

  if (!user || !passwordMatches) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokenPair(
    user._id.toString(),
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(HttpStatusCode.OK).json(
    ApiResponse.ok(
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          gender: user.gender,
          age: user.age,
        },
      },
      "Logged in successfully",
    ),
  );
}

export async function logout(_req: Request, _res: Response) {}
