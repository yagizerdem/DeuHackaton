import { isValidObjectId } from "mongoose";
import { User } from "@models/user-entity.js";
import { AppError } from "@utils/app-error.js";

export async function ensureUserExistByEmail(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.notFound(`User with email ${email} does not exist`);
  }
  return user;
}

export async function ensureUserExistById(id: string) {
  // an invalid id can never match, so skip the query instead of letting mongoose throw a CastError
  const user = isValidObjectId(id) ? await User.findById(id) : null;
  if (!user) {
    throw AppError.notFound(`User with id ${id} does not exist`);
  }
  return user;
}

export async function ensureUserExistByUserName(userName: string) {
  const user = await User.findOne({ userName });
  if (!user) {
    throw AppError.notFound(`User with username ${userName} does not exist`);
  }
  return user;
}

export async function ensureUserNotExistByEmail(email: string) {
  if (await User.exists({ email })) {
    throw AppError.conflict(`User with email ${email} already exists`);
  }
}

export async function ensureUserNotExistById(id: string) {
  if (isValidObjectId(id) && (await User.exists({ _id: id }))) {
    throw AppError.conflict(`User with id ${id} already exists`);
  }
}

export async function ensureUserNotExistByUserName(userName: string) {
  if (await User.exists({ userName })) {
    throw AppError.conflict(`User with username ${userName} already exists`);
  }
}
