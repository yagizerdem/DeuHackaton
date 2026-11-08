import DefaultLayout from "@/layouts/default-layout";
import SiteHeader from "@components/shared/site-header";
import SiteFooter from "@components/shared/site-footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <DefaultLayout>
      <SiteHeader />
      {children}
      <SiteFooter />
    </DefaultLayout>
  );
}
