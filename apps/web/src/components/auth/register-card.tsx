import { Button } from "@components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router";
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
import { getApiErrorMessage } from "@/lib/api-error";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import {
  createRegisterValidator,
  type RegisterInput,
} from "@DeparkHackaton/validators";
import PasswordInput from "@components/password-input";
import { useMutation } from "@tanstack/react-query";
import API from "@/lib/axios-wrapper";
import { toast } from "sonner";
import { cn } from "cn";
import { type RefreshResponseDto } from "@DeparkHackaton/dto";
import { type ApiResponse } from "@DeparkHackaton/shared";

const registerValidator = createRegisterValidator();

type FieldErrors = Partial<Record<string, string>>;

export default function RegisterCard() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const response = await API.post<ApiResponse<RefreshResponseDto>>(
        "/auth/register",
        input,
      );
      return response.data;
    },
    onSuccess: (data) => {
      navigate("/login");
      toast.success("Registration successful!", {
        position: "top-right",
      });
      toast.success(
        data.message ?? "You can now log in with your credentials!",
        {
          position: "top-right",
        },
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Registration failed!"), {
        position: "top-right",
      });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const gender = form.get("gender") as string;
    const age = form.get("age") as string;

    const result = registerValidator.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      userName: form.get("userName"),
      gender: gender || undefined,
      age: age ? Number(age) : undefined,
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
    mutation.mutate(result.data);
  }

  const { isPending } = mutation;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details below to register.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.userName}>
              <FieldLabel htmlFor="userName">Username</FieldLabel>
              <Input
                id="userName"
                name="userName"
                autoComplete="username"
                aria-invalid={!!errors.userName}
              />
              <FieldError errors={[{ message: errors.userName }]} />
            </Field>
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
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
              <FieldError errors={[{ message: errors.password }]} />
            </Field>
            <Field data-invalid={!!errors.gender}>
              <FieldLabel htmlFor="gender">Gender (optional)</FieldLabel>
              <NativeSelect id="gender" name="gender" defaultValue="">
                <NativeSelectOption value="">
                  Prefer not to say
                </NativeSelectOption>
                <NativeSelectOption value="male">Male</NativeSelectOption>
                <NativeSelectOption value="female">Female</NativeSelectOption>
                <NativeSelectOption value="other">Other</NativeSelectOption>
              </NativeSelect>
              <FieldError errors={[{ message: errors.gender }]} />
            </Field>
            <Field data-invalid={!!errors.age}>
              <FieldLabel htmlFor="age">Age (optional)</FieldLabel>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                aria-invalid={!!errors.age}
              />
              <FieldError errors={[{ message: errors.age }]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full cursor-pointer">
            Register
          </Button>
        </CardFooter>
        <span
          className={cn(
            "text-left cursor-pointer align-middle block w-full h-fit px-2 py-1",
            {
              "opacity-50 pointer-events-none": isPending,
            },
          )}
          onMouseUp={() => {
            if (!isPending) {
              navigate("/login");
            }
          }}
        >
          Already have an account? Log in
        </span>
      </form>
    </Card>
  );
}
