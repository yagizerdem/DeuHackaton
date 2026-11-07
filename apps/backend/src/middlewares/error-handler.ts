import { AppError } from "@/utils/app-error.js";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
  }

  //   res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json();
}
