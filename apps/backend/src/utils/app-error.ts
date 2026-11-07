import { FormErrors, HttpStatusCode } from "@DeparkHackaton/shared";
import { MachineCode } from "@utils/machine-code.js";

type AppErrorOptions = {
  machineCode?: MachineCode;
  isOperational?: boolean;
  formErrors?: FormErrors;
};

export class AppError extends Error {
  public readonly httpStatusCode: HttpStatusCode;
  public readonly machineCode: MachineCode;
  public readonly isOperational: boolean;
  public readonly formErrors?: FormErrors;

  constructor(
    message: string,
    httpStatusCode: HttpStatusCode,
    machineCode: MachineCode,
    isOperational: boolean,
    formErrors?: FormErrors,
  ) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.machineCode = machineCode;
    this.isOperational = isOperational;
    this.formErrors = formErrors;
  }

  static from({
    message,
    httpStatusCode,
    machineCode = httpStatusCode,
    isOperational = true,
    formErrors,
  }: {
    message: string;
    httpStatusCode: HttpStatusCode;
    machineCode?: MachineCode;
    isOperational?: boolean;
    formErrors?: FormErrors;
  }) {
    return new AppError(
      message,
      httpStatusCode,
      machineCode,
      isOperational,
      formErrors,
    );
  }

  static badRequest(message = "Bad request", options: AppErrorOptions = {}) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.BAD_REQUEST,
      ...options,
    });
  }

  static unauthorized(message = "Unauthorized", options: AppErrorOptions = {}) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.UNAUTHORIZED,
      ...options,
    });
  }

  static forbidden(message = "Forbidden", options: AppErrorOptions = {}) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.FORBIDDEN,
      ...options,
    });
  }

  static notFound(
    message = "Resource not found",
    options: AppErrorOptions = {},
  ) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.NOT_FOUND,
      ...options,
    });
  }

  static conflict(message = "Conflict", options: AppErrorOptions = {}) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.CONFLICT,
      ...options,
    });
  }

  static unprocessableEntity(
    message = "Unprocessable entity",
    options: AppErrorOptions = {},
  ) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
      ...options,
    });
  }

  static tooManyRequests(
    message = "Too many requests",
    options: AppErrorOptions = {},
  ) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.TOO_MANY_REQUESTS,
      ...options,
    });
  }

  static internal(
    message = "Internal server error",
    options: AppErrorOptions = {},
  ) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      ...options,
    });
  }

  static serviceUnavailable(
    message = "Service unavailable",
    options: AppErrorOptions = {},
  ) {
    return AppError.from({
      message,
      httpStatusCode: HttpStatusCode.SERVICE_UNAVAILABLE,
      ...options,
    });
  }
}
