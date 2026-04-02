import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// --- CUSTOM HOOK FOR SIMULATIONS ---
function useSimulation(animate: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(canvasRef, { amount: 0.1 });
  const frameRef = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      frameRef.current += 1;
      animate(ctx, canvas.width, canvas.height, frameRef.current);
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isInView, animate]);

  return canvasRef;
}

// --- SIMULATION COMPONENTS ---

export const FlowSimulation = () => {
  const hubsRef = useRef<any[]>([]);
  const packetsRef = useRef<any[]>([]);

  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    if (hubsRef.current.length === 0) {
      for (let i = 0; i < 18; i++) {
        hubsRef.current.push({
          x: 60 + Math.random() * (W - 120),
          y: 40 + Math.random() * (H - 80),
          r: 3 + Math.random() * 4,
          type: i < 3 ? 'mega' : i < 8 ? 'mid' : 'small',
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    if (packetsRef.current.length < 60) {
      const from = Math.floor(Math.random() * hubsRef.current.length);
      let to = Math.floor(Math.random() * hubsRef.current.length);
      while (to === from) to = Math.floor(Math.random() * hubsRef.current.length);
      packetsRef.current.push({
        from, to,
        progress: 0,
        speed: 0.003 + Math.random() * 0.005,
        size: 1 + Math.random() * 2,
        trail: []
      });
    }

    ctx.fillStyle = 'rgba(8, 8, 12, 0.25)';
    ctx.fillRect(0, 0, W, H);

    // Hub connections
    for (let i = 0; i < hubsRef.current.length; i++) {
      for (let j = i + 1; j < hubsRef.current.length; j++) {
        const dx = hubsRef.current[i].x - hubsRef.current[j].x;
        const dy = hubsRef.current[i].y - hubsRef.current[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 220) {
          ctx.beginPath();
          ctx.moveTo(hubsRef.current[i].x, hubsRef.current[i].y);
          ctx.lineTo(hubsRef.current[j].x, hubsRef.current[j].y);
          ctx.strokeStyle = `rgba(212, 168, 86, ${(1 - d / 220) * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw hubs
    hubsRef.current.forEach(h => {
      h.pulse += 0.04;
      const pr = h.r * 2.5 + Math.sin(h.pulse) * 1.5;
      ctx.beginPath(); ctx.arc(h.x, h.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 86, 0.04)`; ctx.fill();
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      const bright = h.type === 'mega' ? 0.9 : h.type === 'mid' ? 0.6 : 0.35;
      ctx.fillStyle = `rgba(212, 168, 86, ${bright})`; ctx.fill();
    });

    // Move packets
    packetsRef.current.forEach((p, idx) => {
      p.progress += p.speed;
      const hf = hubsRef.current[p.from];
      const ht = hubsRef.current[p.to];
      const mx = (hf.x + ht.x) / 2 + (Math.random() - 0.5) * 60;
      const my = (hf.y + ht.y) / 2 + (Math.random() - 0.5) * 60;
      const t = p.progress;
      const x = (1 - t) * (1 - t) * hf.x + 2 * (1 - t) * t * mx + t * t * ht.x;
      const y = (1 - t) * (1 - t) * hf.y + 2 * (1 - t) * t * my + t * t * ht.y;
      p.trail.push({ x, y });
      if (p.trail.length > 12) p.trail.shift();

      if (p.progress >= 1) {
        packetsRef.current.splice(idx, 1);
        return;
      }

      p.trail.forEach((pt: any, i: number) => {
        const a = (i / p.trail.length) * 0.5;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 86, ${a})`; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 168, 86, 0.9)'; ctx.fill();
    });
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const PulseSimulation = () => {
  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    ctx.fillStyle = 'rgba(8, 8, 12, 0.3)';
    ctx.fillRect(0, 0, W, H);

    const waves = [
      { freq: 1.2, amp: 0.22, phase: 0, speed: 0.018, color: 'rgba(212, 168, 86,' },
      { freq: 2.1, amp: 0.12, phase: 1.2, speed: 0.031, color: 'rgba(255, 255, 255,' },
      { freq: 3.7, amp: 0.07, phase: 2.4, speed: 0.053, color: 'rgba(212, 168, 86,' },
      { freq: 5.2, amp: 0.04, phase: 0.8, speed: 0.071, color: 'rgba(255, 255, 255,' },
    ];

    waves.forEach((w, wi) => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const px = x / W;
        const wy = H / 2 + Math.sin(px * w.freq * Math.PI * 4 + w.phase + frame * w.speed) * w.amp * H;
        if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
      }
      const alpha = wi === 0 ? 0.8 : wi === 1 ? 0.4 : wi === 2 ? 0.25 : 0.15;
      ctx.strokeStyle = w.color + alpha + ')';
      ctx.lineWidth = wi === 0 ? 2 : 1;
      ctx.stroke();
    });

    ctx.beginPath();
    for (let x = 0; x <= W; x += 1) {
      const px = x / W;
      let y = 0;
      waves.forEach(w => { y += Math.sin(px * w.freq * Math.PI * 4 + w.phase + frame * w.speed) * w.amp; });
      const wy = H / 2 + y * H * 0.7;
      if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = 'rgba(212, 168, 86, 0.9)'; ctx.lineWidth = 2.5; ctx.stroke();
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const AutoSimulation = () => {
  const gridRef = useRef<number[][]>([]);
  const CELL = 8;

  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    const cols = Math.floor(W / CELL);
    const rows = Math.floor(H / CELL);

    if (gridRef.current.length === 0 || gridRef.current.length !== rows || gridRef.current[0].length !== cols) {
      gridRef.current = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < 0.3 ? 1 : 0));
    }

    if (frame % 4 === 0) {
      const next = Array.from({ length: rows }, () => new Array(cols).fill(0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let n = 0;
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + rows) % rows, nc = (c + dc + cols) % cols;
            n += gridRef.current[nr][nc];
          }
          next[r][c] = gridRef.current[r][c] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        }
      }
      gridRef.current = next;
      if (frame % 200 === 0) {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (Math.random() < 0.01) gridRef.current[r][c] = 1;
      }
    }

    ctx.fillStyle = 'rgba(8, 8, 12, 0.6)'; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridRef.current[r][c]) {
          ctx.fillStyle = 'rgba(212, 168, 86, 0.85)';
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const GravitySimulation = () => {
  const bodiesRef = useRef<any[]>([]);

  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    if (bodiesRef.current.length === 0) {
      for (let i = 0; i < 24; i++) {
        const mass = 1 + Math.random() * 8;
        bodiesRef.current.push({
          x: W * 0.2 + Math.random() * W * 0.6, y: H * 0.2 + Math.random() * H * 0.6,
          vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
          mass, r: 2 + mass * 0.6,
          trail: []
        });
      }
      bodiesRef.current.push({ x: W / 2, y: H / 2, vx: 0, vy: 0, mass: 60, r: 7, trail: [], fixed: true });
    }

    ctx.fillStyle = 'rgba(8, 8, 12, 0.2)'; ctx.fillRect(0, 0, W, H);

    bodiesRef.current.forEach((b, i) => {
      if (b.fixed) return;
      let ax = 0, ay = 0;
      bodiesRef.current.forEach((other, j) => {
        if (i === j) return;
        const dx = other.x - b.x, dy = other.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 10;
        const force = 0.4 * other.mass / (dist * dist);
        ax += force * (dx / dist); ay += force * (dy / dist);
      });
      b.vx += ax; b.vy += ay;
      b.vx *= 0.995; b.vy *= 0.995;
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0 || b.x > W) b.vx *= -0.8;
      if (b.y < 0 || b.y > H) b.vy *= -0.8;
      b.x = Math.max(0, Math.min(W, b.x));
      b.y = Math.max(0, Math.min(H, b.y));
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 20) b.trail.shift();
    });

    bodiesRef.current.forEach(b => {
      if (b.trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(b.trail[0].x, b.trail[0].y);
        b.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = b.fixed ? 'rgba(212, 168, 86, 0.3)' : `rgba(212, 168, 86, ${0.1 + b.mass * 0.015})`;
        ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      const bright = b.fixed ? 1 : 0.4 + b.mass * 0.04;
      ctx.fillStyle = `rgba(212, 168, 86, ${bright})`; ctx.fill();
    });
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const FluidSimulation = () => {
  const partsRef = useRef<any[]>([]);
  const H_SMOOTH = 35, REST_DENS = 4, K = 0.08, VISC = 0.3;

  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    if (partsRef.current.length === 0) {
      for (let i = 0; i < 180; i++) {
        partsRef.current.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
          density: 0, pressure: 0
        });
      }
    }

    const kernel = (r: number, h: number) => r < h ? (1 - r / h) * (1 - r / h) : 0;

    if (frame % 2 === 0) {
      partsRef.current.forEach(p => {
        p.density = 0;
        partsRef.current.forEach(q => {
          const dx = p.x - q.x, dy = p.y - q.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          p.density += kernel(r, H_SMOOTH);
        });
        p.pressure = K * (p.density - REST_DENS);
      });
      partsRef.current.forEach((p, i) => {
        let fx = 0, fy = 0;
        partsRef.current.forEach((q, j) => {
          if (i === j) return;
          const dx = p.x - q.x, dy = p.y - q.y;
          const r = Math.sqrt(dx * dx + dy * dy) + 0.001;
          if (r < H_SMOOTH) {
            const press = -(p.pressure + q.pressure) / (2) * kernel(r, H_SMOOTH) / r;
            fx += press * dx; fy += press * dy;
            const visc = VISC * (q.vx - p.vx) * kernel(r, H_SMOOTH);
            const viscy = VISC * (q.vy - p.vy) * kernel(r, H_SMOOTH);
            fx += visc; fy += viscy;
          }
        });
        fy += 0.05;
        p.vx += fx * 0.04; p.vy += fy * 0.04;
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -0.6; } if (p.x > W) { p.x = W; p.vx *= -0.6; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.6; } if (p.y > H) { p.y = H; p.vy *= -0.6; }
      });
    }

    ctx.fillStyle = 'rgba(8, 8, 12, 0.3)'; ctx.fillRect(0, 0, W, H);
    partsRef.current.forEach(p => {
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const alpha = 0.3 + Math.min(spd * 0.2, 0.6);
      const r = 2 + Math.min(p.density * 0.3, 3);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 86, ${alpha})`; ctx.fill();
    });
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const RDSimulation = () => {
  const stateRef = useRef<{ A: Float32Array, B: Float32Array, A2: Float32Array, B2: Float32Array, cW: number, cH: number } | null>(null);
  const SCALE = 3;
  const DA = 1.0, DB = 0.5;
  const F = 0.037, K = 0.060;

  const animate = (ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) => {
    const cW = Math.floor(W / SCALE);
    const cH = Math.floor(H / SCALE);

    if (!stateRef.current || stateRef.current.cW !== cW || stateRef.current.cH !== cH) {
      const A = new Float32Array(cW * cH).fill(1);
      const B = new Float32Array(cW * cH).fill(0);
      for (let i = 0; i < 18; i++) {
        const cx = 4 + Math.floor(Math.random() * (cW - 8));
        const cy = 4 + Math.floor(Math.random() * (cH - 8));
        const rad = 2 + Math.floor(Math.random() * 3);
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const idx = (cy + dy) * cW + (cx + dx);
            if (idx >= 0 && idx < A.length) {
              A[idx] = 0.5 + Math.random() * 0.1;
              B[idx] = 0.25 + Math.random() * 0.15;
            }
          }
        }
      }
      stateRef.current = { A, B, A2: new Float32Array(cW * cH), B2: new Float32Array(cW * cH), cW, cH };
    }

    const { A, B, A2, B2 } = stateRef.current;

    for (let s = 0; s < 7; s++) {
      for (let y = 1; y < cH - 1; y++) {
        for (let x = 1; x < cW - 1; x++) {
          const i = y * cW + x;
          const a = A[i], b = B[i];
          const lapA = A[i - 1] + A[i + 1] + A[i - cW] + A[i + cW] - 4 * a;
          const lapB = B[i - 1] + B[i + 1] + B[i - cW] + B[i + cW] - 4 * b;
          const abb = a * b * b;
          A2[i] = Math.max(0, Math.min(1, a + (DA * lapA - abb + F * (1 - a))));
          B2[i] = Math.max(0, Math.min(1, b + (DB * lapB + abb - (K + F) * b)));
        }
      }
      A.set(A2);
      B.set(B2);
    }

    const id = ctx.createImageData(cW, cH);
    for (let i = 0; i < cW * cH; i++) {
      const v = Math.max(0, Math.min(1, A[i] - B[i]));
      const bVal = B[i];
      id.data[i * 4] = Math.floor(bVal * 80);
      id.data[i * 4 + 1] = Math.floor(v * 40 + bVal * 180);
      id.data[i * 4 + 2] = Math.floor(v * 10 + bVal * 30);
      id.data[i * 4 + 3] = 255;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cW;
    tempCanvas.height = cH;
    tempCanvas.getContext('2d')?.putImageData(id, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, W, H);
    ctx.restore();
  };

  const canvasRef = useSimulation(animate);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default function SimulationSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="simulation-section" ref={containerRef} className="min-h-[100dvh] py-32 bg-brand-dark overflow-hidden relative flex flex-col justify-center">
      {/* Immersive Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,86,0.03)_0,transparent_70%)]" />
      </div>

      <div className="relative z-10 text-center mb-24 px-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block"
        >
          Neural Architecture
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-serif italic mb-8 text-white"
        >
          The Next Dimension <br className="hidden md:block" /> of Intelligence
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed text-sm md:text-base"
        >
          Experience the underlying architecture of our predictive engine. Every particle, node, and wave represents actual commerce dynamics running on our infrastructure in real-time.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Flow Simulation - Large */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="md:col-span-2 lg:col-span-2 h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/5 relative group hover:border-brand-gold/30 transition-all duration-500"
        >
          <div className="absolute top-8 left-8 z-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand-gold/80 font-bold">Global Order Flow</span>
            </div>
            <h3 className="text-2xl font-serif italic text-white">Supply Chain Network</h3>
          </div>
          <FlowSimulation />
          <div className="absolute bottom-8 left-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-xs text-zinc-400 max-w-xs">Visualizing transaction propagation across distributed nodes in the LuxeDrop ecosystem.</p>
          </div>
        </motion.div>

        {/* Pulse Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/5 relative group hover:border-brand-gold/30 transition-all duration-500"
        >
          <div className="absolute top-8 left-8 z-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand-gold/80 font-bold">Market Pulse</span>
            </div>
            <h3 className="text-2xl font-serif italic text-white">Demand Oscillator</h3>
          </div>
          <PulseSimulation />
        </motion.div>

        {/* Auto Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/5 relative group hover:border-brand-gold/30 transition-all duration-500"
        >
          <div className="absolute top-8 left-8 z-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand-gold/80 font-bold">Conversion Automaton</span>
            </div>
            <h3 className="text-2xl font-serif italic text-white">Funnel Growth</h3>
          </div>
          <AutoSimulation />
        </motion.div>

        {/* Gravity Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/5 relative group hover:border-brand-gold/30 transition-all duration-500"
        >
          <div className="absolute top-8 left-8 z-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand-gold/80 font-bold">Revenue Gravity</span>
            </div>
            <h3 className="text-2xl font-serif italic text-white">Product Clusters</h3>
          </div>
          <GravitySimulation />
        </motion.div>

        {/* Fluid Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/5 relative group hover:border-brand-gold/30 transition-all duration-500"
        >
          <div className="absolute top-8 left-8 z-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand-gold/80 font-bold">Traffic Fluid</span>
            </div>
            <h3 className="text-2xl font-serif italic text-white">Visitor Dynamics</h3>
          </div>
          <FluidSimulation />
        </motion.div>
      </div>
    </section>
  );
}
