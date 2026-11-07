import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { FormErrors } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";

export function validator(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        (formErrors[key] ??= []).push(issue.message);
      }
      return next(AppError.badRequest("Validation failed", { formErrors }));
    }

    req.body = result.data;
    next();
  };
}
