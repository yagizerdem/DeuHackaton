import { useState } from "react";
import { useNavigate } from "react-router";
import { createRegisterValidator } from "@DeparkHackaton/validators";
import DefaultLayout from "@layouts/default-layout";
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
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import ParticleLayout from "@layouts/particle-layout";
import RegisterCard from "@/components/auth/register-card";

const registerValidator = createRegisterValidator();

type FieldErrors = Partial<Record<string, string>>;

export default function RegisterPage() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

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
    // TODO: send result.data to the register endpoint
  }

  return (
    <DefaultLayout>
      <ParticleLayout>
        <div className="flex min-h-svh w-full items-center justify-center p-4">
          <RegisterCard />
        </div>
      </ParticleLayout>
    </DefaultLayout>
  );
}
