import { AppError } from "@/utils/app-error.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import { mongo } from "mongoose";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.httpStatusCode).json(
      ApiResponse.from({
        httpStatusCode: err.httpStatusCode,
        message: err.message,
        formErrors: err.formErrors,
      }),
    );
  }

  if (err instanceof mongo.MongoServerError) {
    //convert mongo db error to app error
    const mongoError = handleMongoError(err);
    return res.status(mongoError.httpStatusCode).json(
      ApiResponse.from({
        httpStatusCode: mongoError.httpStatusCode,
        message: mongoError.message,
        formErrors: mongoError.formErrors,
      }),
    );
  }

  return res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json(ApiResponse.internalServerError(err.message));
}

function handleMongoError(err: mongo.MongoServerError) {
  switch (err.code) {
    // DuplicateKey (12582 is the legacy code)
    case 11000:
    case 11001:
    case 12582: {
      const fields = Object.keys(err.keyPattern ?? {});
      return AppError.conflict(
        fields.length
          ? `${fields.join(", ")} already exists`
          : "Duplicate value",
      );
    }
    // WriteConflict
    case 112:
      return AppError.conflict("Write conflict, please try again");
    // DocumentValidationFailure
    case 121:
      return AppError.unprocessableEntity("Document validation failed");
    // BadValue, FailedToParse, TypeMismatch
    case 2:
    case 9:
    case 14:
      return AppError.badRequest("Invalid value");
    // ConflictingUpdateOperators
    case 40:
      return AppError.badRequest("Conflicting update operations");
    // ImmutableField
    case 66:
      return AppError.badRequest("Cannot modify an immutable field");
    // BSONObjectTooLarge
    case 10334:
      return AppError.from({
        message: "Request payload is too large",
        httpStatusCode: HttpStatusCode.PAYLOAD_TOO_LARGE,
      });
    default:
      return AppError.internal("Something went wrong");
  }
}
