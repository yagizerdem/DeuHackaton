import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { Button } from "@components/ui/button";

interface AuthModalProps {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function AuthModal({
  label,
  onClose,
  children,
}: AuthModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    const tween = gsap
      .timeline()
      .fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power1.out" },
        0,
      )
      .fromTo(
        panelRef.current,
        { opacity: 0, y: 32, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
        0.05,
      );
    return () => {
      tween.kill();
    };
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    gsap
      .timeline({ onComplete: onClose })
      .to(panelRef.current, {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 0.2,
        ease: "power2.in",
      })
      .to(backdropRef.current, { opacity: 0, duration: 0.2 }, 0.05);
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && close();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        aria-hidden
        className="absolute inset-0 bg-background/40 backdrop-blur-md"
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex max-h-[calc(100svh-2rem)] w-full max-w-md justify-center overflow-y-auto"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          className="absolute top-3 right-3 z-10 cursor-pointer"
          onClick={close}
        >
          <X />
        </Button>
        {children}
      </div>
    </div>
  );
}
