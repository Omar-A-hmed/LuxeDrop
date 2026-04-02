import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export default function CTAOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(canvasRef, { amount: 0.1 });

  useEffect(() => {
    if (!isInView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let animationId: number;
    let ang = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        W = canvas.width = parent.offsetWidth;
        H = canvas.height = parent.offsetHeight;
      }
    };

    const rings = [
      { r: 140, n: 40, speed: 0.002, phase: 0 },
      { r: 220, n: 60, speed: -0.0015, phase: 1.2 },
      { r: 320, n: 80, speed: 0.001, phase: 2.4 }
    ];

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      ang += 0.004;
      
      rings.forEach(rg => {
        for (let i = 0; i < rg.n; i++) {
          const a = (i / rg.n) * Math.PI * 2 + ang * rg.speed * 200 + rg.phase;
          const x = W / 2 + Math.cos(a) * rg.r;
          const y = H / 2 + Math.sin(a) * rg.r;
          const pulse = 0.3 + 0.3 * Math.sin(ang * 3 + i * 0.5);
          
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 168, 86, ${pulse})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isInView]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
}
