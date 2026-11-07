import DefaultLayout from "@layouts/default-layout";
import ParticleLayout from "@layouts/particle-layout";
import BackButton from "@components/auth/back-button";
import LoginCard from "@components/auth/login-card";

export default function LoginPage() {
  return (
    <DefaultLayout>
      <ParticleLayout>
        <div className="relative flex min-h-svh w-full items-center justify-center p-4">
          <BackButton />
          <LoginCard />
        </div>
      </ParticleLayout>
    </DefaultLayout>
  );
}
