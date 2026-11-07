import HttpStatusCode from "@utils/http-status-code.js";

export class AppError extends Error {
  public readonly httpStatusCode: HttpStatusCode;
  constructor(message: string, httpStatusCode: HttpStatusCode) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }
}
