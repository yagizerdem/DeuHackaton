import HttpStatusCode from "@utils/http-status-code.js";

// add custom machine code types for each spesific error that can occur in backend
export type MachineCode = HttpStatusCode | "MACHINE_ERROR";
