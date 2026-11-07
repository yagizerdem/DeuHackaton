import { Microscope, Sprout } from "lucide-react";
import { Button } from "@components/ui/button";
import ThemeToggle from "@components/theme-toggle";
import { Fragment, useState } from "react";
import AuthModal from "@components/auth/auth-modal";
import LoginCard from "@components/auth/login-card";
import RegisterCard from "@components/auth/register-card";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#resources", label: "Resources" },
];

export default function SiteHeader() {
  const [modal, setModal] = useState<"login" | "register" | null>(null);

  return (
    <Fragment>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border/30 bg-background/90 px-4 py-2 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-6">
          <a href="#" className="group flex items-center gap-2">
            <Sprout className="size-6 fill-primary/20 text-primary transition-transform group-hover:scale-105" />
            <span className="font-stitch-headline text-stitch-headline-md font-medium tracking-tight text-primary">
              Plant Protection Assistant
            </span>
          </a>
          <nav className="ml-6 hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-stitch-body text-stitch-body-md font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => setModal("login")}
            className="hidden cursor-pointer font-stitch-body sm:inline-flex"
          >
            Log In
          </Button>
          <Button
            onClick={() => setModal("register")}
            className="cursor-pointer font-stitch-body"
          >
            <Microscope />
            Sign Up
          </Button>
        </div>
      </header>
      {modal && (
        <AuthModal
          label={modal === "login" ? "Log in" : "Sign up"}
          onClose={() => setModal(null)}
        >
          {modal === "login" ? <LoginCard /> : <RegisterCard />}
        </AuthModal>
      )}
    </Fragment>
  );
}
