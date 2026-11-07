import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import gsap from "gsap";
import { Button } from "@components/ui/button";
import { useTheme } from "@providers/theme-provider";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function useIsDark() {
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return theme === "system" ? systemDark : theme === "dark";
}

export default function ThemeToggle() {
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const sunRef = useRef<SVGSVGElement>(null);
  const moonRef = useRef<SVGSVGElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const [show, hide] = isDark
      ? [moonRef.current, sunRef.current]
      : [sunRef.current, moonRef.current];
    // first paint snaps to the right icon, later changes animate
    const duration = mounted.current ? 0.5 : 0;
    mounted.current = true;

    const tween = gsap
      .timeline({ defaults: { duration, ease: "back.out(1.7)" } })
      .to(hide, { rotate: 90, scale: 0, opacity: 0, ease: "power2.in" }, 0)
      .fromTo(
        show,
        { rotate: -90, scale: 0, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1 },
        0,
      );

    return () => {
      tween.kill();
    };
  }, [isDark]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative cursor-pointer"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onMouseEnter={(e) =>
        gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })
      }
      onMouseLeave={(e) =>
        gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })
      }
    >
      <Sun ref={sunRef} className="absolute" />
      <Moon ref={moonRef} className="absolute" />
    </Button>
  );
}
