import { BaseProvider } from "@providers/base-provider";
import { Toaster } from "@/components/ui/sonner";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <BaseProvider>
      <div className="w-full h-full ">{children}</div>
      <Toaster />
    </BaseProvider>
  );
}
