export interface BgPreset {
  id: string;
  label: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

export const BG_PRESETS: BgPreset[] = [
  {
    id: "dark",
    label: "Dark Grid",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#151515";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },
  },
  {
    id: "dots",
    label: "Dot Matrix",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#202020";
      for (let x = 20; x < w; x += 30)
        for (let y = 20; y < h; y += 30) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
    },
  },
  {
    id: "blueprint",
    label: "Blueprint",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#020c1b";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,100,200,0.2)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,150,255,0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 150) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 150) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },
  },
  {
    id: "purple",
    label: "Purple Mist",
    draw: (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.3);
      g.addColorStop(0, "#180a2a");
      g.addColorStop(1, "#050508");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(168,85,247,0.07)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 35) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 35) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },
  },
  {
    id: "circuit",
    label: "Circuit",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#050d08";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,255,136,0.1)";
      ctx.lineWidth = 1;
      const step = 50;
      for (let x = 0; x < w; x += step) {
        for (let y = 0; y < h; y += step) {
          if ((x + y) % 100 === 0) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + step, y); ctx.stroke();
          }
          if ((x * y) % 150 === 0) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + step); ctx.stroke();
          }
          if ((x + y) % 200 === 0) {
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,255,136,0.25)"; ctx.fill();
          }
        }
      }
    },
  },
];