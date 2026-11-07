import { Request, Response } from "express";
import { HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";

// Express 5 forwards rejected promises from async handlers to errorHandler.
const notImplemented = (action: string) =>
  AppError.from({
    message: `${action} is not implemented yet`,
    httpStatusCode: HttpStatusCode.NOT_IMPLEMENTED,
  });

export async function register(_req: Request, _res: Response) {
  // TODO: validate body, hash password, create User, issue session
  throw notImplemented("register");
}

export async function login(_req: Request, _res: Response) {
  // TODO: validate body, find User, compare password, issue session
  throw notImplemented("login");
}

export async function logout(_req: Request, _res: Response) {
  // TODO: clear session
  throw notImplemented("logout");
}
