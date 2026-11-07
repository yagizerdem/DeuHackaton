import { HttpStatusCode } from "@DeparkHackaton/shared";

// TypeScript enums cannot extend each other, so MachineCode is a const object
// that spreads every HttpStatusCode member (without the numeric reverse
// mappings) and adds the custom ones.
const httpStatusCodes = Object.fromEntries(
  Object.entries(HttpStatusCode).filter(([key]) => isNaN(Number(key))),
) as { [K in keyof typeof HttpStatusCode]: (typeof HttpStatusCode)[K] };

// add custom machine code types for each spesific error that can occur in backend
export const MachineCode = {
  ...httpStatusCodes,
  MACHINE_ERROR: 600,
} as const;

export type MachineCode = (typeof MachineCode)[keyof typeof MachineCode];
