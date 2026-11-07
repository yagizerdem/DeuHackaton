import { useState } from "react";
import { createLoginValidator } from "@DeparkHackaton/validators";
import DefaultLayout from "@/layouts/default-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const loginValidator = createLoginValidator();

type FieldErrors = Partial<Record<string, string>>;

export default function LoginPage() {
  const [errors, setErrors] = useState<FieldErrors>({});

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
    <DefaultLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-4">
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
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                  />
                  <FieldError errors={[{ message: errors.password }]} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="mt-6">
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DefaultLayout>
  );
}
