import { useEffect, useRef } from "react";
import { BaseProvider } from "@providers/base-provider";
import ThemeToggle from "@components/theme-toggle";

interface ParticleLayoutProps {
  children: React.ReactNode;
}

const SQUARE_COUNT = 28;
const MIN_SIZE = 24;
const MAX_SIZE = 110;
const MAX_SPEED = 0.6;

interface Square {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  alpha: number;
}

function FloatingSquares() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let squares: Square[] = [];
    let frame = 0;

    const spawn = (): Square => {
      const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
      const heading = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * MAX_SPEED;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        vx: Math.cos(heading) * speed,
        vy: Math.sin(heading) * speed,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.008,
        alpha: 0.05 + Math.random() * 0.15,
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      squares = Array.from({ length: SQUARE_COUNT }, spawn);
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // read per frame so squares follow the active light/dark theme
      const styles = getComputedStyle(canvas);
      const fill = styles.getPropertyValue("--stitch-secondary").trim();
      const stroke = styles.getPropertyValue("--stitch-primary").trim();

      for (const s of squares) {
        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.spin;
        // bounce off every edge so squares keep floating around the screen
        if (s.x <= 0 || s.x + s.size >= window.innerWidth) s.vx *= -1;
        if (s.y <= 0 || s.y + s.size >= window.innerHeight) s.vy *= -1;

        ctx.save();
        ctx.translate(s.x + s.size / 2, s.y + s.size / 2);
        ctx.rotate(s.angle);
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = s.alpha;
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.globalAlpha = s.alpha + 0.1;
        ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.restore();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 size-full bg-background"
    />
  );
}

export default function ParticleLayout({ children }: ParticleLayoutProps) {
  return (
    <BaseProvider>
      <div className="relative isolate min-h-screen w-full">
        <FloatingSquares />
        <div className="fixed top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </BaseProvider>
  );
}
