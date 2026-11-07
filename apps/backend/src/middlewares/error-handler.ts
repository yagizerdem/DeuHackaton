import { AppError } from "@/utils/app-error.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.httpStatusCode).json(
      ApiResponse.from({
        httpStatusCode: err.httpStatusCode,
        message: err.message,
        formErrors: err.formErrors,
      }),
    );
  }

  return res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json(ApiResponse.internalServerError(err.message));
}
