import { Router } from "express";
import { login, logout, register } from "@controllers/auth-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";

export const authRouter = Router();

authRouter.post("/register", asyncWrapper(register));
authRouter.post("/login", asyncWrapper(login));
authRouter.post("/logout", asyncWrapper(logout));
