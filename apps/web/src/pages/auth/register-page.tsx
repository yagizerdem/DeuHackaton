import DefaultLayout from "@layouts/default-layout";
import ParticleLayout from "@layouts/particle-layout";
import BackButton from "@components/auth/back-button";
import RegisterCard from "@components/auth/register-card";

export default function RegisterPage() {
  return (
    <DefaultLayout>
      <ParticleLayout>
        <div className="relative flex min-h-svh w-full items-center justify-center p-4">
          <BackButton />
          <RegisterCard />
        </div>
      </ParticleLayout>
    </DefaultLayout>
  );
}
