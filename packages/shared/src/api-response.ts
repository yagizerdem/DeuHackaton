import { FormErrors } from "./form-errors.js";
import { HttpStatusCode } from "./http-status-code.js";

export interface ApiResponseOptions<T = unknown> {
  httpStatusCode: HttpStatusCode;
  message: string;
  formErrors?: FormErrors;
  data?: T;
}

export class ApiResponse<T> {
  public readonly httpStatusCode: HttpStatusCode;
  public readonly message: string;
  public readonly formErrors?: FormErrors;
  public readonly data?: T;
  constructor(
    httpStatusCode: HttpStatusCode,
    message: string,
    formErrors?: FormErrors,
    data?: T,
  ) {
    this.httpStatusCode = httpStatusCode;
    this.message = message;
    this.formErrors = formErrors;
    this.data = data;
  }

  static from<T>({
    httpStatusCode,
    message,
    formErrors,
    data,
  }: ApiResponseOptions<T>): ApiResponse<T> {
    return new ApiResponse<T>(httpStatusCode, message, formErrors, data);
  }

  // success

  static ok<T>(data?: T, message = "OK") {
    return ApiResponse.from<T>({
      httpStatusCode: HttpStatusCode.OK,
      message,
      data,
    });
  }

  static created<T>(data?: T, message = "Created") {
    return ApiResponse.from<T>({
      httpStatusCode: HttpStatusCode.CREATED,
      message,
      data,
    });
  }

  static accepted<T>(data?: T, message = "Accepted") {
    return ApiResponse.from<T>({
      httpStatusCode: HttpStatusCode.ACCEPTED,
      message,
      data,
    });
  }

  static noContent(message = "No content") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.NO_CONTENT,
      message,
    });
  }

  // client / server errors

  static badRequest(message = "Bad request", formErrors?: FormErrors) {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.BAD_REQUEST,
      message,
      formErrors,
    });
  }

  static unauthorized(message = "Unauthorized") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.UNAUTHORIZED,
      message,
    });
  }

  static forbidden(message = "Forbidden") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.FORBIDDEN,
      message,
    });
  }

  static notFound(message = "Resource not found") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.NOT_FOUND,
      message,
    });
  }

  static conflict(message = "Conflict") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.CONFLICT,
      message,
    });
  }

  static unprocessableEntity(
    message = "Unprocessable entity",
    formErrors?: FormErrors,
  ) {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message,
      formErrors,
    });
  }

  static tooManyRequests(message = "Too many requests") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.TOO_MANY_REQUESTS,
      message,
    });
  }

  static internalServerError(message = "Internal server error") {
    return ApiResponse.from<never>({
      httpStatusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
