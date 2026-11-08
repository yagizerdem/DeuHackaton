import AppLayout from "@/layouts/app-layout";
import HeroSection from "@components/home/hero-section";
import HowItWorksSection from "@components/home/how-it-works-section";
import FeaturesSection from "@components/home/features-section";
import CtaSection from "@components/home/cta-section";

export default function Home() {
  return (
    <AppLayout>
      <main className="w-full">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>
    </AppLayout>
  );
}
