import { isAxiosError } from "axios";

// The backend answers errors with an ApiResponse body ({ message, ... }), so
// prefer that message over the generic axios one ("Request failed with status code 401").
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}
