import { useState } from "react";
import { useNavigate } from "react-router";
import { createLoginValidator } from "@DeparkHackaton/validators";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@components/ui/field";
import { Input } from "@components/ui/input";
import PasswordInput from "@components/password-input";

const loginValidator = createLoginValidator();

type FieldErrors = Partial<Record<string, string>>;

export default function LoginCard() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const result = loginValidator.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    // TODO: send result.data to the login endpoint
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to log in.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              <FieldError errors={[{ message: errors.email }]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
              />
              <FieldError errors={[{ message: errors.password }]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full cursor-pointer">
            Log in
          </Button>
        </CardFooter>
        <span
          className="text-left cursor-pointer align-middle block w-full h-fit px-2 py-1"
          onMouseUp={() => navigate("/register")}
        >
          Don't have an account? Register
        </span>
      </form>
    </Card>
  );
}
