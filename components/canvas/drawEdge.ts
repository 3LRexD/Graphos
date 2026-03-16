import type { GEdge } from "../../types/graph";
import { NODE_R } from "./drawNode";
import { P } from "./palette";

// ─── Arrow head ───────────────────────────────────────────────────────────────
export function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  lw: number
) {
  const h = 12 + lw;
  ctx.save();
  
  // Si pasamos el color gris normal de la línea, forzamos la flecha a ser morada
  const isDefault = (color === "#3a3a3a" || color === "#666666" || color === P.border);
  ctx.fillStyle = isDefault ? P.purple : color;
  
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - h * Math.cos(angle - Math.PI / 8), y - h * Math.sin(angle - Math.PI / 8));
  ctx.lineTo(x - h * Math.cos(angle + Math.PI / 8), y - h * Math.sin(angle + Math.PI / 8));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Weight badge (Número flotante) ───────────────────────────────────────────
export function weightBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: string,
  color: string
) {
  ctx.save();
  ctx.font         = "bold 12px 'Courier New', monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur   = 0;
  
  // Si la línea es gris, el texto será de tu morado brillante
  const isDefault = (color === "#3a3a3a" || color === "#666666" || color === P.border);
  ctx.fillStyle = isDefault ? P.purpleBright : color;
  
  // Dibujamos el texto desplazado un poquito en Y para que no cruce justo encima de la línea
  ctx.fillText(w, x, y + 10);
  ctx.restore();
}

// ─── Edge ─────────────────────────────────────────────────────────────────────
export function drawEdge(
  ctx: CanvasRenderingContext2D,
  edge: GEdge,
  color: string,
  lw: number,
  glow?: string
) {
  const { from, to, weight } = edge;
  ctx.save();
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 16; }
  
  ctx.strokeStyle = color;
  ctx.lineWidth   = lw;

  if (from === to) {
    const n    = from;
    const sa   = Math.PI * 1.25;
    const ea   = Math.PI * 1.75;
    const cp1x = n.x - NODE_R * 2, cp1y = n.y - NODE_R * 3.5;
    const cp2x = n.x + NODE_R * 2, cp2y = n.y - NODE_R * 3.5;
    const sx   = n.x + NODE_R * Math.cos(sa), sy = n.y + NODE_R * Math.sin(sa);
    const ex   = n.x + NODE_R * Math.cos(ea), ey = n.y + NODE_R * Math.sin(ea);
    
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.stroke();
    arrowHead(ctx, ex, ey, Math.atan2(ey - cp2y, ex - cp2x), color, lw);
    
    if (weight) weightBadge(ctx, n.x, n.y - NODE_R * 2.8 - 6, weight, color);
  } else {
    const dx   = to.x - from.x, dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const nx   = -dy / dist, ny = dx / dist;
    const off  = 28;
    const cx   = from.x + dx / 2 + nx * off;
    const cy   = from.y + dy / 2 + ny * off;
    const as_  = Math.atan2(cy - from.y, cx - from.x);
    const ae   = Math.atan2(to.y - cy, to.x - cx);
    const sx   = from.x + NODE_R * Math.cos(as_), sy = from.y + NODE_R * Math.sin(as_);
    const ex   = to.x   - NODE_R * Math.cos(ae),  ey = to.y   - NODE_R * Math.sin(ae);
    
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
    arrowHead(ctx, ex, ey, ae, color, lw);
    
    if (weight) weightBadge(ctx, cx, cy, weight, color);
  }

  ctx.restore();
}

export function edgeMidpoint(edge: GEdge): { x: number; y: number } {
  const { from, to } = edge;
  if (from === to) return { x: from.x, y: from.y - NODE_R * 2.8 };
  const dx   = to.x - from.x, dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const nx   = -dy / dist, ny = dx / dist;
  return { x: from.x + dx / 2 + nx * 28, y: from.y + dy / 2 + ny * 28 };
}