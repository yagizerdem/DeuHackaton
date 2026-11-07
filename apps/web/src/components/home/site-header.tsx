import { Link } from "react-router";
import { Microscope, Sprout } from "lucide-react";
import { buttonVariants } from "@components/ui/button";
import ThemeToggle from "@components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#resources", label: "Resources" },
];

export default function SiteHeader() {
  return (
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
        <Link
          to="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "hidden font-stitch-body sm:inline-flex",
          )}
        >
          Log In
        </Link>
        <Link
          to="/register"
          className={cn(buttonVariants(), "font-stitch-body")}
        >
          <Microscope />
          Sign Up
        </Link>
      </div>
    </header>
  );
}
