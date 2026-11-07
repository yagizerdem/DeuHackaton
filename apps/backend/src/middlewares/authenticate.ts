import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@/services/token-service.js";
import { User } from "@/models/user-entity.js";
import { AppError } from "@utils/app-error.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; email: string; userName: string };
  }
}

// Accepts the access token from the Authorization header ("Bearer <token>")
// or from the accessToken cookie that login/refresh set.
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token: unknown = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : req.cookies?.accessToken;

  if (typeof token !== "string" || !token) {
    throw AppError.unauthorized("Authentication required");
  }

  const { userId } = verifyAccessToken(token);

  // the account may have been deleted since the token was issued
  const user = await User.findById(userId).select("email userName");
  if (!user) {
    throw AppError.unauthorized("User no longer exists");
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    userName: user.userName,
  };
  next();
}
