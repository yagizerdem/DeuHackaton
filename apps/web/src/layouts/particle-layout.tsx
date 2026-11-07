import { useEffect, useRef } from "react";
import { BaseProvider } from "@providers/base-provider";

interface ParticleLayoutProps {
  children: React.ReactNode;
}

const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789";
const FONT_SIZE = 18;
const FRAME_MS = 50;

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let drops: number[] = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const columns = Math.ceil(window.innerWidth / FONT_SIZE);
      drops = Array.from({ length: columns }, () => -Math.random() * 50);
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < FRAME_MS) return;
      last = now;

      // translucent fill leaves the fading trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.fillStyle = "#22c55e";

      drops.forEach((y, i) => {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(glyph, i * FONT_SIZE, y * FONT_SIZE);
        drops[i] =
          y * FONT_SIZE > window.innerHeight && Math.random() > 0.975
            ? 0
            : y + 1;
      });
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
      className="pointer-events-none fixed inset-0 -z-10 size-full bg-black"
    />
  );
}

export default function ParticleLayout({ children }: ParticleLayoutProps) {
  return (
    <BaseProvider>
      <div className="relative isolate min-h-screen w-full">
        <MatrixRain />
        {children}
      </div>
    </BaseProvider>
  );
}
