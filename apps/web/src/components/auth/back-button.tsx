import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@components/ui/button";
import { cn } from "@/lib/utils";

export default function BackButton() {
  return (
    <Link
      to="/"
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "absolute top-4 left-4 z-10 md:top-6 md:left-6",
      )}
    >
      <ArrowLeft />
      Back
    </Link>
  );
}
