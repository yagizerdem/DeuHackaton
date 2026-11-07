import { FormErrors } from "./form-errors.js";
import { HttpStatusCode } from "./http-status-code.js";

export interface ApiResponseOptions {
  httpStatusCode: HttpStatusCode;
  message: string;
  formErrors?: FormErrors;
}

export default class ApiResponse {
  public readonly httpStatusCode: HttpStatusCode;
  public readonly message: string;
  public readonly formErrors?: FormErrors;
  constructor(
    httpStatusCode: HttpStatusCode,
    message: string,
    formErrors?: FormErrors,
  ) {
    this.httpStatusCode = httpStatusCode;
    this.message = message;
    this.formErrors = formErrors;
  }
}
