import DefaultLayout from "@/layouts/default-layout";
import SiteHeader from "@components/home/site-header";
import HeroSection from "@components/home/hero-section";
import HowItWorksSection from "@components/home/how-it-works-section";
import FeaturesSection from "@components/home/features-section";
import CtaSection from "@components/home/cta-section";
import SiteFooter from "@components/home/site-footer";

export default function Home() {
  return (
    <DefaultLayout>
      <SiteHeader />
      <main className="w-full">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </DefaultLayout>
  );
}
