import type { GNode } from "../../types/graph";
import { P } from "./palette";

export const NODE_R = 26; // Tamaño ideal para el diseño de tu foto

interface DrawNodeOpts {
  selected?: boolean;
  tempStart?: boolean;
  cpmData?: any; 
  algoMode?: string;
  animHighlight?: boolean;
  animColor?: string;
  originNode?: GNode | null;
  destNode?: GNode | null;
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: GNode,
  opts: DrawNodeOpts = {}
) {
  const { x, y } = node;
  const {
    selected, tempStart, cpmData, algoMode,
    animHighlight, animColor, originNode, destNode,
  } = opts;

  const isOrigin = originNode?.id === node.id;
  const isDest   = destNode?.id  === node.id;

  ctx.save();

  // ── Fondo Oscuro (Minimalista como en tu imagen) ──
  ctx.beginPath();
  ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
  ctx.fillStyle = "#151515"; // Gris casi negro
  ctx.fill();

  // ── Borde y Brillo ──
  // Solo brilla si interactúas con él. Si no, es un gris sutil.
  if (selected || tempStart || animHighlight || isOrigin || isDest) {
    let glowColor: string = P.purple;
  let bColor: string = P.border;
    if (animHighlight) glowColor = animColor || P.red;
    else if (isOrigin) glowColor = P.green;
    else if (isDest) glowColor = P.red;
    
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.5;
  } else {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#444444"; // Borde gris sutil
    ctx.lineWidth = 1.5;
  }
  
  ctx.stroke();
  ctx.restore();

  // ── Textos ──
  const cpm = (cpmData && "error" in cpmData && !cpmData.error) ? cpmData : null;

  if (algoMode !== "none" && cpm) {
    // Diseño dividido de CPM/PERT
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, NODE_R, 0, Math.PI * 2); ctx.clip();
    ctx.beginPath(); ctx.moveTo(x - NODE_R, y); ctx.lineTo(x + NODE_R, y);
    ctx.strokeStyle = "#333333"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + NODE_R); ctx.stroke();
    ctx.restore();

    ctx.fillStyle    = animHighlight ? "#ffffff" : P.text;
    ctx.font         = "bold 11px 'Courier New', monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, x, y - NODE_R / 2.5);

    ctx.font      = "10px 'Courier New', monospace";
    ctx.fillStyle = P.cyan;
    ctx.fillText(String(cpm.TE[node.id] ?? 0), x - NODE_R / 2.5, y + NODE_R / 2.2);
    ctx.fillStyle = P.red;
    ctx.fillText(
      String(cpm.TL[node.id] === Infinity ? "∞" : (cpm.TL[node.id] ?? 0)),
      x + NODE_R / 2.5, y + NODE_R / 2.2
    );
  } else {
    // Nodo normal (Solo su nombre)
    ctx.fillStyle    = "#E0E0E0"; 
    ctx.font         = "bold 13px 'Courier New', monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, x, y);
  }
}