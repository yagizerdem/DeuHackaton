export type FieldErrors = Partial<Record<string, string>>;

// first message per top level field, so a form can show one error under each input
export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    errors[String(issue.path[0])] ??= issue.message;
  }
  return errors;
}

// empty form values become null, which clears the field on the server
export const textOrNull = (value: FormDataEntryValue | null) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
};
