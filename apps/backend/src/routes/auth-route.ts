import { Router } from "express";
import { login, logout, register } from "@controllers/auth-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { validator } from "@/middlewares/validator.js";
import { createRegisterValidator } from "@DeparkHackaton/validators";

export const authRouter = Router();

authRouter.post(
  "/register",
  validator(createRegisterValidator()),
  asyncWrapper(register),
);

authRouter.post("/login", asyncWrapper(login));

authRouter.post("/logout", asyncWrapper(logout));
