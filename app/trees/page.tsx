"use client";

import { useState, useEffect, useRef, CSSProperties, JSX } from "react";
import { useBSTState } from "../../hooks/useTreeState";
import { useRouter } from "next/navigation";
import type {
  BSTNode,
  TraversalType,
  RebuildMode,
  TraversalResult,
  BSTBuildResult,
  RebuildResult,
} from "../../algorithms/tree";

// ─── Node animation keyframes (injected once) ────────────────────────────────
const ANIM_STYLE = `
@keyframes nodePopIn {
  0%   { transform: scale(0) translate(0,0); opacity: 0; }
  60%  { transform: scale(1.18) translate(0,0); opacity: 1; }
  100% { transform: scale(1) translate(0,0); opacity: 1; }
}
@keyframes edgeDraw {
  from { stroke-dashoffset: 1; opacity: 0; }
  to   { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
  50%       { filter: drop-shadow(0 0 14px currentColor); }
}
`;

// ─── Build animation speed (ms per node stagger step) ────────────────────────
const BUILD_ANIM_STAGGER_MS = 220;   // delay between each node appearing
const BUILD_NODE_DURATION   = "1.2s"; // how long each node's pop-in lasts
const BUILD_EDGE_DURATION   = "1.0s"; // how long each edge draw lasts

// ─── Paleta ───────────────────────────────────────────────────────────────────
const P = {
  bg:        "#0a0a0a",
  surface:   "#111111",
  border:    "#2a2a2a",
  purple:    "#A855F7",
  purpleDim: "rgba(168,85,247,0.15)",
  cyan:      "#00e5ff",
  cyanDim:   "rgba(0,229,255,0.12)",
  red:       "#ff0055",
  redDim:    "rgba(255,0,85,0.12)",
  green:     "#00ff88",
  greenDim:  "rgba(0,255,136,0.12)",
  yellow:    "#ffd600",
  yellowDim: "rgba(255,214,0,0.12)",
  orange:    "#ff9800",
  orangeDim: "rgba(255,152,0,0.12)",
  text:      "#E0E0E0",
  muted:     "#555",
  white:     "#ffffff",
};

// ─── Button helpers ───────────────────────────────────────────────────────────
const btnGhost = (color: string, colorDim: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 15px",
  background: colorDim, border: `1px solid ${color}`,
  borderRadius: 7, color,
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

const btnFilled = (color: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 18px",
  background: color, border: `1px solid ${color}`,
  borderRadius: 7, color: "#0a0a0a",
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

function Btn({
  color, colorDim, filled = false, onClick, children, disabled = false,
}: {
  color: string; colorDim: string; filled?: boolean;
  onClick?: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  const style = filled ? btnFilled(color) : btnGhost(color, colorDim);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...style, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, background: P.border, alignSelf: "stretch", margin: "0 2px" }} />;
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: "0.8rem", marginTop: "0.5rem",
      color: "#D8B4FE", fontSize: 14, fontWeight: 400, letterSpacing: 1,
      fontFamily: "'Courier New', monospace",
    }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );
}

// ─── BST Tree SVG renderer ────────────────────────────────────────────────────
const NODE_R = 22;
const H_GAP  = 52;
const V_GAP  = 72;

interface LayoutNode {
  node: BSTNode;
  x: number;
  y: number;
  depth: number;
}

function computeLayout(
  node: BSTNode | null,
  depth: number,
  counter: { v: number },
  result: LayoutNode[]
) {
  if (!node) return;
  computeLayout(node.left,  depth + 1, counter, result);
  const x = counter.v * H_GAP;
  const y = depth * V_GAP;
  result.push({ node, x, y, depth });
  counter.v++;
  computeLayout(node.right, depth + 1, counter, result);
}

// animKey changes whenever the tree root changes, triggering re-animation
function BSTTreeSVG({
  root,
  highlightedValues = [],
  visitedValues     = [],
  currentValue,
  animKey,
}: {
  root: BSTNode;
  highlightedValues?: number[];
  visitedValues?: number[];
  currentValue?: number;
  animKey?: string | number;
}) {
  const layout: LayoutNode[] = [];
  computeLayout(root, 0, { v: 0 }, layout);

  const minX = Math.min(...layout.map(n => n.x));
  const maxX = Math.max(...layout.map(n => n.x));
  const maxY = Math.max(...layout.map(n => n.y));

  const offX = -minX + 40;
  const offY = 40;
  const svgW = Math.max(maxX - minX + NODE_R * 2 + 80, 300);
  const svgH = maxY + NODE_R * 2 + 60;

  const byVal = new Map<number, LayoutNode>();
  layout.forEach(l => byVal.set(l.node.val, l));

  const edges: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];

  layout.forEach(({ node, x, y }, layoutIdx) => {
    const cx = x + offX;
    const cy = y + offY;

    // ── Edges with draw animation
    if (node.left) {
      const cl = byVal.get(node.left.val)!;
      const dx = cl.x + offX - cx;
      const dy = cl.y + offY - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      edges.push(
        <line
          key={`e-${node.val}-l-${animKey}`}
          x1={cx} y1={cy}
          x2={cl.x + offX} y2={cl.y + offY}
          stroke={P.border} strokeWidth={1.5}
          strokeDasharray={len}
          strokeDashoffset={len}
          style={{
            animation: `edgeDraw ${BUILD_EDGE_DURATION} ease forwards`,
            animationDelay: `${layoutIdx * BUILD_ANIM_STAGGER_MS + BUILD_ANIM_STAGGER_MS}ms`,
          }}
        />
      );
    }
    if (node.right) {
      const cr = byVal.get(node.right.val)!;
      const dx = cr.x + offX - cx;
      const dy = cr.y + offY - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      edges.push(
        <line
          key={`e-${node.val}-r-${animKey}`}
          x1={cx} y1={cy}
          x2={cr.x + offX} y2={cr.y + offY}
          stroke={P.border} strokeWidth={1.5}
          strokeDasharray={len}
          strokeDashoffset={len}
          style={{
            animation: `edgeDraw ${BUILD_EDGE_DURATION} ease forwards`,
            animationDelay: `${layoutIdx * BUILD_ANIM_STAGGER_MS + BUILD_ANIM_STAGGER_MS}ms`,
          }}
        />
      );
    }

    const isCurrent    = node.val === currentValue;
    const isVisited    = visitedValues.includes(node.val);
    const isHighlighted = highlightedValues.includes(node.val);

    let stroke    = P.border;
    let fill      = "#111";
    let textColor = P.text;

    if (isCurrent) {
      stroke = P.cyan;   fill = "rgba(0,229,255,0.18)";
    } else if (isVisited) {
      stroke = P.green;  fill = "rgba(0,255,136,0.12)"; textColor = P.green;
    } else if (isHighlighted) {
      stroke = P.purple; fill = P.purpleDim;
    }

    // stagger delay per node, based on in-order position (layoutIdx)
    const delay = `${layoutIdx * BUILD_ANIM_STAGGER_MS}ms`;

    nodes.push(
      <g
        key={`n-${node.val}-${animKey}`}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `nodePopIn ${BUILD_NODE_DURATION} cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: delay,
        }}
      >
        <circle
          cx={cx} cy={cy} r={NODE_R}
          fill={fill}
          stroke={stroke}
          strokeWidth={isCurrent ? 2.5 : 1.5}
          style={{
            filter: isCurrent
              ? `drop-shadow(0 0 6px ${P.cyan}88)`
              : isVisited
                ? `drop-shadow(0 0 4px ${P.green}55)`
                : "none",
            transition: "fill 0.25s ease, stroke 0.25s ease",
          }}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fill={isCurrent ? P.cyan : textColor}
          fontFamily="'Courier New', monospace"
          fontSize={node.val.toString().length > 3 ? 9 : 12}
          fontWeight="bold"
          style={{ transition: "fill 0.25s" }}
        >
          {node.val}
        </text>
      </g>
    );
  });

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {edges}
      {nodes}
    </svg>
  );
}

// ─── Traversal sequence pills ──────────────────────────────────────────────────
function TraversalSequence({
  sequence,
  visitedValues,
  currentValue,
}: {
  sequence: number[];
  visitedValues: number[];
  currentValue: number | undefined;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {sequence.map((v, i) => {
        const isCurrent = v === currentValue;
        const isVisited = visitedValues.includes(v);
        let bg    = "#0a0a0a";
        let color = P.muted;
        let border = P.border;

        if (isCurrent) { bg = P.cyanDim;   color = P.cyan;   border = P.cyan;   }
        else if (isVisited) { bg = P.greenDim; color = P.green;  border = P.green;  }

        return (
          <span
            key={i}
            style={{
              padding: "4px 10px",
              background: bg, border: `1px solid ${border}`,
              borderRadius: 4, color,
              fontFamily: "'Courier New', monospace", fontSize: 12,
              fontWeight: "bold",
              transition: "all 0.25s",
            }}
          >
            {v}
          </span>
        );
      })}
    </div>
  );
}

// ─── Traversal mode selector ──────────────────────────────────────────────────
const TRAVERSAL_OPTIONS: { value: TraversalType; label: string; desc: string }[] = [
  { value: "inorder",   label: "In-order",   desc: "Izquierda → Raíz → Derecha  ·  Produce salida ordenada" },
  { value: "preorder",  label: "Pre-order",  desc: "Raíz → Izquierda → Derecha  ·  Útil para copiar el árbol" },
  { value: "postorder", label: "Post-order", desc: "Izquierda → Derecha → Raíz  ·  Útil para eliminación" },
];

// ─── Rebuild mode selector ────────────────────────────────────────────────────
const REBUILD_OPTIONS: { value: RebuildMode; label: string }[] = [
  { value: "inorder+preorder",  label: "In-order + Pre-order"  },
  { value: "inorder+postorder", label: "In-order + Post-order" },
];

// ─── Serialise a BSTNode tree into a plain nested object ─────────────────────
function serializeNode(node: BSTNode | null): object | null {
  if (!node) return null;
  return {
    val:   node.val,
    left:  serializeNode(node.left),
    right: serializeNode(node.right),
  };
}

// ─── JSON Export – pure download (no prompt) ─────────────────────────────────
function downloadTreeAsJSON(
  tree: BSTBuildResult | RebuildResult,
  filename: string,
  values?: number[],
) {
  const safe = (filename.trim() || "bst_tree").replace(/\.json$/i, "") + ".json";

  const payload: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    nodeCount:  tree.nodeCount,
    height:     tree.height,
    sequences: {
      inorder:   tree.inorder,
      preorder:  tree.preorder,
      postorder: tree.postorder,
    },
    tree: serializeNode(tree.root),
  };
  if (values) payload.insertionOrder = values;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = safe;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export modal ─────────────────────────────────────────────────────────────
function ExportModal({
  tree,
  values,
  onClose,
}: {
  tree: BSTBuildResult | RebuildResult;
  values?: number[];
  onClose: () => void;
}) {
  const [name, setName] = useState("bst_tree");
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the modal opens
  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleDownload = () => {
    downloadTreeAsJSON(tree, name, values);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleDownload();
    if (e.key === "Escape") onClose();
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Dialog */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: P.surface, border: `1px solid ${P.yellow}55`,
          borderRadius: 12, padding: "1.6rem 1.8rem",
          width: "min(420px, 90vw)",
          boxShadow: `0 0 40px ${P.yellow}22`,
          fontFamily: "'Courier New', monospace",
        }}
      >
        <div style={{ fontSize: 13, color: P.yellow, fontWeight: "bold", marginBottom: "0.4rem", letterSpacing: 1 }}>
          ⬇ Exportar JSON
        </div>
        <div style={{ fontSize: 10, color: P.muted, marginBottom: "1rem" }}>
          El archivo se guardará como <span style={{ color: P.cyan }}>{(name.trim() || "bst_tree").replace(/\.json$/i, "")}.json</span>
        </div>

        <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 6 }}>
          NOMBRE DEL ARCHIVO
        </label>
        <input
          ref={nameRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="bst_tree"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "9px 12px",
            background: "#0a0a0a", border: `1px solid ${P.yellow}88`,
            borderRadius: 6, color: P.text,
            fontFamily: "'Courier New', monospace", fontSize: 13, outline: "none",
            marginBottom: "1.2rem",
          }}
          onFocus={e => (e.target.style.borderColor = P.yellow)}
          onBlur={e => (e.target.style.borderColor = `${P.yellow}88`)}
        />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn color={P.muted} colorDim="transparent" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn color={P.yellow} colorDim={P.yellowDim} filled onClick={handleDownload}>
            ⬇ Descargar
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── JSON Import panel ────────────────────────────────────────────────────────
function JSONImportPanel({
  onImport,
  onClose,
}: {
  onImport: (nums: number[]) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseAndImport = (raw: string) => {
    setError(null);
    try {
      const obj = JSON.parse(raw);
      let nums: number[] | null = null;

      // Accept array directly, or insertionOrder, or sequences.inorder
      if (Array.isArray(obj)) {
        nums = obj.map(Number);
      } else if (Array.isArray(obj.insertionOrder)) {
        nums = obj.insertionOrder.map(Number);
      } else if (obj.sequences?.inorder && Array.isArray(obj.sequences.inorder)) {
        nums = obj.sequences.inorder.map(Number);
      }

      if (!nums || nums.length === 0) {
        setError("No se encontró una lista de números válida en el JSON.");
        return;
      }
      if (nums.some(n => isNaN(n) || !isFinite(n))) {
        setError("El JSON contiene valores no numéricos.");
        return;
      }
      onImport(nums.slice(0, 30));
      onClose();
    } catch {
      setError("JSON inválido. Verifica el formato del archivo.");
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setText(content);
      parseAndImport(content);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      marginTop: 8, padding: "1rem",
      background: "#0a0a0a", border: `1px solid ${P.border}`,
      borderRadius: 8,
    }}>
      <SectionHeader icon="" title="Importar desde JSON" />
      <p style={{ fontSize: 10, color: P.muted, marginBottom: 8 }}>
        Acepta: array de números, <code style={{ color: P.cyan }}>insertionOrder</code>, o <code style={{ color: P.cyan }}>sequences.inorder</code>.
      </p>

      {/* File picker */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept=".json,application/json"
          onChange={handleFile}
          style={{ display: "none" }} />
        <Btn color={P.cyan} colorDim={P.cyanDim}
          onClick={() => fileRef.current?.click()}>
          Seleccionar archivo .json
        </Btn>
        <span style={{ color: P.muted, fontSize: 10 }}>o pega el JSON abajo</span>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'[\n  38, 27, 43, 3, 9, 82, 10\n]\n\n// o pega tu JSON exportado aquí'}
        rows={6}
        style={{
          width: "100%", padding: "10px 12px", boxSizing: "border-box",
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 6, color: P.text, resize: "vertical",
          fontFamily: "'Courier New', monospace", fontSize: 11, outline: "none",
        }}
        onFocus={e => (e.target.style.borderColor = P.cyan)}
        onBlur={e => (e.target.style.borderColor = P.border)}
      />

      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: P.red }}>⚠ {error}</div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn color={P.green} colorDim={P.greenDim} filled
          onClick={() => parseAndImport(text)}>
          ✓ Importar
        </Btn>
        <Btn color={P.muted} colorDim="transparent" onClick={onClose}>
          ✕ Cancelar
        </Btn>
      </div>
    </div>
  );
}

// ─── Instructions modal ──────────────────────────────────────────────────────
function InstructionsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: "1.4rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: "0.6rem",
        color: P.cyan, fontSize: 12, fontWeight: "bold", letterSpacing: 0.8,
      }}>
        <span>{icon}</span><span>{title}</span>
      </div>
      <div style={{ fontSize: 11, color: P.text, lineHeight: 1.75, paddingLeft: 4 }}>
        {children}
      </div>
    </div>
  );

  const Tag = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <span style={{
      display: "inline-block",
      padding: "1px 8px", marginLeft: 4,
      background: color + "22", border: `1px solid ${color}55`,
      borderRadius: 4, color, fontSize: 10, fontFamily: "'Courier New', monospace",
      verticalAlign: "middle",
    }}>{children}</span>
  );

  const Rule = () => (
    <div style={{ borderTop: `1px solid ${P.border}`, margin: "1.2rem 0" }} />
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: P.surface, border: `1px solid ${P.cyan}44`,
          borderRadius: 12, padding: "1.8rem 2rem",
          width: "min(640px, 95vw)", maxHeight: "85vh",
          overflowY: "auto", boxShadow: `0 0 50px ${P.cyan}18`,
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.4rem" }}>
          <div>
            <div style={{ fontSize: 16, color: P.cyan, fontWeight: "bold", letterSpacing: 1.5, marginBottom: 4 }}>
              Instrucciones
            </div>
            <div style={{ fontSize: 10, color: P.muted }}>
              Árbol Binario de Búsqueda (BST) — Guía de uso
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: `1px solid ${P.border}`,
              borderRadius: 6, color: P.muted,
              cursor: "pointer", fontSize: 16, lineHeight: 1,
              padding: "4px 10px", fontFamily: "'Courier New', monospace",
            }}
          >✕</button>
        </div>

        {/* ── What is a BST ── */}
        <Section icon="" title="¿QUÉ ES UN BST?">
          Un <strong style={{ color: P.purple }}>Árbol Binario de Búsqueda</strong> es una estructura de datos donde cada nodo
          tiene como máximo dos hijos. Para cualquier nodo con valor <Tag color={P.cyan}>N</Tag>:
          <ul style={{ margin: "0.6rem 0 0 1rem", padding: 0, listStyle: "disc" }}>
            <li>Todos los valores en el <strong style={{ color: P.green }}>subárbol izquierdo</strong> son <strong>menores</strong> que <Tag color={P.cyan}>N</Tag></li>
            <li>Todos los valores en el <strong style={{ color: P.yellow }}>subárbol derecho</strong> son <strong>mayores</strong> que <Tag color={P.cyan}>N</Tag></li>
            <li>Los valores <strong style={{ color: P.red }}>duplicados</strong> son ignorados</li>
          </ul>
        </Section>

        <Rule />

        {/* ── Build tab ── */}
        <Section icon="" title="PESTAÑA: BUILD TREE">
          Construye el árbol ingresando números uno a uno o generando un conjunto aleatorio.
          <ul style={{ margin: "0.6rem 0 0 1rem", padding: 0, listStyle: "disc" }}>
            <li><strong style={{ color: P.purple }}>Entrada manual</strong> — escribe un número y pulsa <Tag color={P.purple}>Enter</Tag> o <Tag color={P.purple}>+ Agregar</Tag>. El árbol se actualiza en tiempo real con cada número.</li>
            <li><strong style={{ color: P.purple }}>Generador aleatorio</strong> — define cantidad, mínimo y máximo, luego pulsa <Tag color={P.purple}>Generar</Tag>. Después presiona <Tag color={P.cyan}>BUILD TREE</Tag> para construir.</li>
            <li>El <strong style={{ color: P.yellow }}>primer número ingresado</strong> siempre será la raíz del árbol.</li>
            <li>Máximo <Tag color={P.red}>30 nodos</Tag>. Puedes eliminar valores individuales con <Tag color={P.red}>×</Tag>.</li>
          </ul>
        </Section>

        <Rule />

        {/* ── Traversals tab ── */}
        <Section icon="" title="PESTAÑA: TRAVERSALS">
          Visualiza paso a paso cómo se recorre el árbol construido.
          <ul style={{ margin: "0.6rem 0 0 1rem", padding: 0, listStyle: "disc" }}>
            <li><Tag color={P.cyan}>In-order</Tag> <span style={{ color: P.muted }}>(Izq → Raíz → Der)</span> — produce los valores en orden ascendente.</li>
            <li><Tag color={P.purple}>Pre-order</Tag> <span style={{ color: P.muted }}>(Raíz → Izq → Der)</span> — útil para copiar o serializar el árbol.</li>
            <li><Tag color={P.yellow}>Post-order</Tag> <span style={{ color: P.muted }}>(Izq → Der → Raíz)</span> — útil para eliminar o liberar el árbol.</li>
          </ul>
          <div style={{ marginTop: "0.6rem" }}>
            Selecciona el tipo, pulsa <Tag color={P.cyan}>▶ Ejecutar</Tag> y usa los controles
            <Tag color={P.muted}>⟨ Anterior</Tag> <Tag color={P.muted}>Siguiente ⟩</Tag> o
            <Tag color={P.green}>▶ Play</Tag> para una animación automática.
          </div>
          <div style={{ marginTop: "0.5rem", color: P.muted }}>
            Colores en el árbol:
            <Tag color={P.cyan}>Visitando ahora</Tag>
            <Tag color={P.green}>Ya visitado</Tag>
            <Tag color={P.purple}>En ruta</Tag>
          </div>
        </Section>

        <Rule />

        {/* ── Rebuild tab ── */}
        <Section icon="" title="PESTAÑA: REBUILD TREE">
          Reconstruye un árbol únicamente a partir de sus secuencias de recorrido,
          sin necesidad de conocer el orden de inserción original.
          <ul style={{ margin: "0.6rem 0 0 1rem", padding: 0, listStyle: "disc" }}>
            <li>Necesitas <strong style={{ color: P.yellow }}>In-order</strong> más <strong style={{ color: P.yellow }}>Pre-order</strong>, o bien <strong style={{ color: P.yellow }}>In-order</strong> más <strong style={{ color: P.yellow }}>Post-order</strong>.</li>
            <li>Ingresa cada secuencia separada por espacios o comas.</li>
            <li>Pulsa <Tag color={P.purple}>Usar árbol actual</Tag> para rellenar automáticamente desde el árbol activo.</li>
            <li>Pulsa <Tag color={P.yellow}>Reconstruir</Tag> para generar y visualizar el árbol.</li>
          </ul>
        </Section>

        <Rule />

        {/* ── Import / Export ── */}
        <Section icon="" title="IMPORTAR / EXPORTAR">
          <ul style={{ margin: 0, padding: 0, listStyle: "disc", marginLeft: "1rem" }}>
            <li><Tag color={P.yellow}>⬇ Exportar JSON</Tag> — guarda el árbol actual (estructura, secuencias y orden de inserción) en un archivo <code style={{ color: P.cyan }}>.json</code>. Puedes elegir el nombre del archivo.</li>
            <li><Tag color={P.orange}>⬆ Importar JSON</Tag> — carga valores desde un <code style={{ color: P.cyan }}>.json</code> exportado previamente. Acepta un array directo, el campo <code style={{ color: P.cyan }}>insertionOrder</code>, o <code style={{ color: P.cyan }}>sequences.inorder</code>.</li>
          </ul>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: "1rem", paddingTop: "1rem",
          borderTop: `1px solid ${P.border}`,
          fontSize: 10, color: P.muted, textAlign: "center",
        }}>
          Pulsa <Tag color={P.muted}>Esc</Tag> o haz clic fuera para cerrar
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const state  = useBSTState();
  const router = useRouter();
  const inputRef  = useRef<HTMLInputElement>(null);
  const playRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // JSON import panel toggle
  const [showImport, setShowImport] = useState(false);

  // Export modal
  const [showExport, setShowExport] = useState(false);

  // Instructions modal
  const [showInstructions, setShowInstructions] = useState(false);

  // animKey: changes whenever the "displayed" tree root changes → re-triggers CSS animations
  const [animKey, setAnimKey] = useState(0);
  const prevRootRef = useRef<BSTNode | null>(null);

  const traversal = state.currentTraversal;
  // Only show the tree relevant to the active tab
  const tree =
    state.activeTab === "rebuild"
      ? state.currentRebuild
      : state.currentTree ?? state.currentRebuild;

  // The root used for visualization and traversal — also tab-scoped
  const activeRoot =
    state.activeTab === "rebuild"
      ? (state.currentRebuild?.root ?? null)
      : state.activeRoot;

  const currentStepData = traversal?.steps[state.traversalStep];
  const progress = traversal
    ? ((state.traversalStep + 1) / traversal.steps.length) * 100
    : 0;

  // Fire animKey update whenever the active tree root changes
  useEffect(() => {
    if (activeRoot !== prevRootRef.current) {
      prevRootRef.current = activeRoot;
      setAnimKey(k => k + 1);
    }
  }, [activeRoot]);

  // Also re-animate when traversal result is freshly computed (step reset to 0)
  useEffect(() => {
    if (traversal) setAnimKey(k => k + 1);
  }, [traversal]);

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isPlaying && traversal) {
      playRef.current = setInterval(() => { state.nextStep(); }, state.playSpeed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [state.isPlaying, state.playSpeed, traversal]);

  // Pause at last step
  useEffect(() => {
    if (traversal && state.traversalStep >= traversal.steps.length - 1 && state.isPlaying) {
      state.pause();
    }
  }, [state.traversalStep, traversal, state.isPlaying]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      state.addValue(state.inputText);
    }
  };

  const highlightedValues = currentStepData?.path ?? [];
  const visitedValues     = currentStepData?.visited ?? [];
  const currentValue      = currentStepData?.visiting !== -1 ? currentStepData?.visiting : undefined;

  return (
    <div style={{
      minHeight: "100vh", background: P.bg,
      fontFamily: "'Courier New', monospace", color: P.text,
    }}>
      {/* ── Inject animation keyframes once ── */}
      <style>{ANIM_STYLE}</style>

      {/* ── Instructions modal ── */}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      {/* ── Export modal ── */}
      {showExport && tree && (
        <ExportModal
          tree={tree}
          values={state.currentTree?.values}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* ── Toast ── */}
      {state.toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: P.redDim, border: `1px solid ${P.red}`,
          borderRadius: 6, padding: "10px 24px", color: P.red,
          fontSize: 12, zIndex: 999, backdropFilter: "blur(10px)",
          maxWidth: "90vw", textAlign: "center",
        }}>
          {state.toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "2.2rem 1rem 1.4rem" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}></div>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 400, color: P.text,
          letterSpacing: 2, margin: "0 0 6px",
        }}>
          Visualizador de Árbol Binario de Búsqueda
        </h1>
        <p style={{ color: P.muted, fontSize: 11, margin: 0 }}>
          Construye un BST, explora recorridos y reconstruye árboles desde secuencias
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1rem 3rem" }}>

        {/* ════ TOOLBAR ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: "1.4rem",
          display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        }}>
          <Btn color={P.green} colorDim={P.greenDim}
            onClick={() => router.push("/editor?showSelector=true")}>
            ⟵ Cambiar algoritmo
          </Btn>
          <Divider />
          <Btn color={P.red} colorDim={P.redDim} onClick={state.clear}>
            ✕ Limpiar todo
          </Btn>
          <Divider />
          {/* JSON Export */}
          <Btn
            color={P.yellow} colorDim={P.yellowDim}
            disabled={!tree}
            onClick={() => { if (tree) setShowExport(true); }}
          >
            ⬇ Exportar JSON
          </Btn>
          {/* JSON Import toggle */}
          <Btn
            color={P.orange} colorDim={P.orangeDim}
            onClick={() => setShowImport(v => !v)}
          >
            ⬆ Importar JSON
          </Btn>
          {/* Instructions */}
          <Btn
            color={P.cyan} colorDim={P.cyanDim}
            onClick={() => setShowInstructions(true)}
          >
            Instrucciones
          </Btn>
        </div>

        {/* JSON Import panel (collapsible) */}
        {showImport && (
          <JSONImportPanel
            onImport={nums => {
              state.loadValues(nums);
              setShowImport(false);
            }}
            onClose={() => setShowImport(false)}
          />
        )}

        {/* ════ TAB SWITCHER ════ */}
        <div style={{
          display: "flex", gap: 0,
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 10, overflow: "hidden", marginBottom: "1.4rem",
        }}>
          {(["build", "traversal", "rebuild"] as const).map((tab, i) => {
            const labels = ["Build Tree", "Traversals", "Rebuild Tree"];
            const active = state.activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => state.setActiveTab(tab)}
                style={{
                  flex: 1, padding: "12px 8px",
                  background: active ? P.purpleDim : "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: active ? `2px solid ${P.purple}` : "2px solid transparent",
                  color: active ? P.purple : P.muted,
                  cursor: "pointer", fontFamily: "'Courier New', monospace",
                  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
                  transition: "all 0.14s",
                }}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>

        {/* ════ BUILD TREE PANEL ════ */}
        {state.activeTab === "build" && (
          <>
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
            }}>
              <SectionHeader icon="" title="Ingresar Números" />
              <p style={{ fontSize: 10, color: P.muted, marginBottom: "0.8rem" }}>
                El primer número ingresado será la raíz. Los menores van a la izquierda, los mayores a la derecha.
              </p>

              {/* Input row */}
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  ref={inputRef}
                  type="number"
                  value={state.inputText}
                  onChange={e => state.setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un número y presiona Enter"
                  style={{
                    flex: 1, minWidth: 200, padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 13, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.purple)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={() => state.addValue(state.inputText)}>
                  + Agregar
                </Btn>
              </div>

              {/* Number chips */}
              {state.values.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {state.values.map((v, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px",
                      background: i === 0 ? "rgba(168,85,247,0.25)" : P.purpleDim,
                      border: `1px solid ${i === 0 ? P.purple : P.purple + "44"}`,
                      borderRadius: 20, color: P.purple,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                    }}>
                      {i === 0 && <span style={{ fontSize: 9, color: P.yellow }}>ROOT</span>}
                      <span>{v}</span>
                      <button onClick={() => state.removeValue(i)} style={{
                        background: "none", border: "none", color: P.red,
                        cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: P.muted, fontSize: 11, padding: "8px 0" }}>
                  Sin elementos — agrega números para construir el árbol
                </div>
              )}

              <div style={{ marginTop: 10, fontSize: 10, color: P.muted }}>
                {state.totalValues} / 30 nodos
              </div>
            </div>

            {/* Random generator */}
            <RandomPanel onGenerate={(nums) => { state.loadValues(nums); }} />

            {/* Build button — hidden during live preview; shown only for random/batch mode */}
            {state.livePreview ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "12px", marginBottom: "1.5rem",
                background: P.purpleDim, border: `1px solid ${P.purple}55`,
                borderRadius: 8, fontSize: 12, color: P.purple,
                fontFamily: "'Courier New', monospace",
              }}>
                <span style={{
                  display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                  background: P.purple,
                  boxShadow: `0 0 6px ${P.purple}`,
                  animation: "glowPulse 1.6s ease-in-out infinite",
                }} />
                Vista en vivo activa — el árbol se actualiza al agregar números
              </div>
            ) : (
              <button
                onClick={() => { state.build(); }}
                style={{
                  ...btnFilled(P.cyan),
                  width: "100%", justifyContent: "center",
                  padding: "14px", marginBottom: "1.5rem", fontSize: 13,
                }}
              >
                BUILD TREE
              </button>
            )}
          </>
        )}

        {/* ════ TRAVERSAL PANEL ════ */}
        {state.activeTab === "traversal" && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
          }}>
            <SectionHeader icon="" title="Modo de Recorrido" />

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              {TRAVERSAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { state.setTraversalType(opt.value as TraversalType); }}
                  style={{
                    ...btnGhost(
                      state.traversalType === opt.value ? P.cyan : P.muted,
                      state.traversalType === opt.value ? P.cyanDim : "transparent"
                    ),
                    borderColor: state.traversalType === opt.value ? P.cyan : P.border,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 10, color: P.muted, marginBottom: "1rem",
              padding: "6px 10px", background: "#0a0a0a",
              borderRadius: 5, border: `1px solid ${P.border}`,
            }}>
              {TRAVERSAL_OPTIONS.find(o => o.value === state.traversalType)?.desc}
            </div>

            <Btn color={P.cyan} colorDim={P.cyanDim} filled
              onClick={state.runTraversal}
              disabled={!state.activeRoot}>
              ▶ Ejecutar Recorrido
            </Btn>

            {!state.activeRoot && (
              <div style={{ marginTop: 8, fontSize: 11, color: P.orange }}>
                ⚠ Construye un árbol primero en la pestaña "Build Tree"
              </div>
            )}

            {/* Traversal result + playback */}
            {traversal && (
              <>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>SECUENCIA:</div>
                  <TraversalSequence
                    sequence={traversal.sequence}
                    visitedValues={visitedValues}
                    currentValue={currentValue}
                  />
                </div>

                {/* Progress bar */}
                <div style={{
                  height: 3, background: P.border, borderRadius: 2,
                  margin: "14px 0 10px", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: `linear-gradient(90deg, ${P.purple}, ${P.cyan})`,
                    borderRadius: 2, transition: "width 0.2s",
                  }} />
                </div>

                {/* Step description */}
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${P.border}`,
                  borderRadius: 6, padding: "10px 14px",
                  fontSize: 12, color: P.text, marginBottom: 14,
                  minHeight: 38, display: "flex", alignItems: "center",
                }}>
                  <span style={{ color: P.cyan, marginRight: 8 }}>
                    [{state.traversalStep + 1}/{traversal.steps.length}]
                  </span>
                  {currentStepData?.description}
                </div>

                {/* Playback controls */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={() => state.goToStep(0)} disabled={state.traversalStep === 0}>
                    ⏮ Inicio
                  </Btn>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={state.prevStep} disabled={state.traversalStep === 0}>
                    ◀ Anterior
                  </Btn>
                  {state.isPlaying ? (
                    <Btn color={P.orange} colorDim={P.orangeDim} onClick={state.pause}>
                      ⏸ Pausar
                    </Btn>
                  ) : (
                    <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.play}
                      disabled={state.traversalStep >= traversal.steps.length - 1 && !state.isPlaying}>
                      ▶ Reproducir
                    </Btn>
                  )}
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={state.nextStep} disabled={state.traversalStep >= traversal.steps.length - 1}>
                    Siguiente ▶
                  </Btn>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={() => state.goToStep(traversal.steps.length - 1)}
                    disabled={state.traversalStep >= traversal.steps.length - 1}>
                    Final ⏭
                  </Btn>

                  <Divider />

                  {/* Speed */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: P.muted }}>Velocidad:</span>
                    {[
                      { label: "Lento",  ms: 1000 },
                      { label: "Normal", ms: 600  },
                      { label: "Rápido", ms: 250  },
                      { label: "Turbo",  ms: 80   },
                    ].map(sp => (
                      <button key={sp.ms}
                        onClick={() => state.setPlaySpeed(sp.ms)}
                        style={{
                          padding: "4px 9px",
                          background: state.playSpeed === sp.ms ? P.cyanDim : "transparent",
                          border: `1px solid ${state.playSpeed === sp.ms ? P.cyan : P.border}`,
                          borderRadius: 5,
                          color: state.playSpeed === sp.ms ? P.cyan : P.muted,
                          cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 10,
                        }}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber */}
                <div style={{ marginTop: 14 }}>
                  <input
                    type="range" min={0} max={traversal.steps.length - 1}
                    value={state.traversalStep}
                    onChange={e => state.goToStep(Number(e.target.value))}
                    style={{ width: "100%", accentColor: P.purple, cursor: "pointer" }}
                  />
                </div>

                {/* Step list */}
                <SectionHeader icon="" title="Lista de Pasos" />
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${P.border}`,
                  borderRadius: 8, padding: "1rem",
                  maxHeight: 260, overflowY: "auto",
                }}>
                  {traversal.steps.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => state.goToStep(idx)}
                      style={{
                        padding: "8px 12px",
                        background: idx === state.traversalStep ? P.purpleDim : "transparent",
                        border: `1px solid ${idx === state.traversalStep ? P.purple : "transparent"}`,
                        borderRadius: 5, marginBottom: 3,
                        cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start",
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={e => {
                        if (idx !== state.traversalStep)
                          (e.currentTarget as HTMLDivElement).style.background = "#1a1a1a";
                      }}
                      onMouseLeave={e => {
                        if (idx !== state.traversalStep)
                          (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }}
                    >
                      <span style={{
                        color: idx === state.traversalStep ? P.purple : P.muted,
                        fontSize: 10, minWidth: 30, paddingTop: 1,
                      }}>#{step.iteration}</span>
                      <span style={{ fontSize: 11, color: P.text, flex: 1 }}>
                        {step.description}
                      </span>
                      {step.visiting !== -1 && (
                        <span style={{
                          fontSize: 10, color: P.cyan,
                          fontFamily: "'Courier New', monospace",
                        }}>
                          val={step.visiting}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ REBUILD TREE PANEL ════ */}
        {state.activeTab === "rebuild" && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
          }}>
            <SectionHeader icon="" title="Reconstruir Árbol desde Secuencias" />
            <p style={{ fontSize: 10, color: P.muted, marginBottom: "1rem" }}>
              Ingresa dos secuencias de recorrido para reconstruir el árbol. Todos los nodos deben estar presentes en ambas secuencias.
            </p>

            {/* Rebuild mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              {REBUILD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => state.setRebuildMode(opt.value as RebuildMode)}
                  style={{
                    ...btnGhost(
                      state.rebuildMode === opt.value ? P.yellow : P.muted,
                      state.rebuildMode === opt.value ? P.yellowDim : "transparent"
                    ),
                    borderColor: state.rebuildMode === opt.value ? P.yellow : P.border,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sequence inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  SECUENCIA IN-ORDER (separada por espacios o comas)
                </label>
                <input
                  type="text"
                  value={state.rebuildInorder}
                  onChange={e => state.setRebuildInorder(e.target.value)}
                  placeholder="ej: 3 9 10 27 38 43 82"
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.yellow)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  SECUENCIA {state.rebuildMode === "inorder+preorder" ? "PRE-ORDER" : "POST-ORDER"}
                  {" "}(separada por espacios o comas)
                </label>
                <input
                  type="text"
                  value={state.rebuildSecond}
                  onChange={e => state.setRebuildSecond(e.target.value)}
                  placeholder={
                    state.rebuildMode === "inorder+preorder"
                      ? "ej: 38 27 3 9 10 43 82"
                      : "ej: 3 10 9 27 82 43 38"
                  }
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.yellow)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
              <Btn color={P.purple} colorDim={P.purpleDim}
                onClick={state.prefillRebuildFromCurrent}
                disabled={!state.activeRoot}>
                Usar árbol actual
              </Btn>
              <Btn color={P.yellow} colorDim={P.yellowDim} filled onClick={state.doRebuild}>
               Reconstruir
              </Btn>
              <Btn color={P.red} colorDim={P.redDim} onClick={state.clearRebuild}>
                ✕ Limpiar
              </Btn>
            </div>

            {/* Rebuild result info */}
            {state.currentRebuild && (
              <div style={{
                padding: "10px 14px",
                background: P.greenDim, border: `1px solid ${P.green}44`,
                borderRadius: 6, fontSize: 11, color: P.green,
              }}>
                ✓ Árbol reconstruido correctamente — {state.currentRebuild.nodeCount} nodos, altura {state.currentRebuild.height}
              </div>
            )}
          </div>
        )}

        {/* ════ TREE STATS ════ */}
        {tree && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "1.2rem",
          }}>
            {[
              { label: "Nodos",     value: tree.nodeCount,           color: P.cyan   },
              { label: "Altura",    value: tree.height,              color: P.purple },
              { label: "Raíz",      value: tree.root?.val ?? "-",    color: P.green  },
              { label: "In-order",  value: tree.inorder.join(", "),  color: P.yellow },
            ].map(s => (
              <div key={s.label} style={{
                background: P.surface, border: `1px solid ${P.border}`,
                borderRadius: 8, padding: "10px 16px", flex: "1 1 100px", minWidth: 100,
              }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>{s.label}</div>
                <div style={{
                  fontSize: typeof s.value === "string" && s.value.length > 10 ? 10 : 16,
                  color: s.color, fontWeight: "bold",
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ TREE VISUALIZATION ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "0.8rem" }}>
            <SectionHeader icon="" title="Visualización del Árbol" />
            {/* Export button inline near the tree */}
            {tree && (
              <Btn color={P.yellow} colorDim={P.yellowDim}
                onClick={() => setShowExport(true)}>
                ⬇ Exportar JSON
              </Btn>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 12 }}>
            {[
              { color: P.cyan,   label: "Visitando ahora" },
              { color: P.green,  label: "Ya visitado"     },
              { color: P.purple, label: "En ruta"         },
              { color: "#444",   label: "Sin visitar"     },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: color, borderRadius: "50%" }} />
                <span style={{ fontSize: 10, color: P.muted, fontFamily: "'Courier New', monospace" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* SVG tree */}
          <div style={{
            background: "#0a0a0a", border: `1px solid ${P.border}`,
            borderRadius: 6, overflowX: "auto", minHeight: 180,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0.5rem",
          }}>
            {activeRoot ? (
              <BSTTreeSVG
                root={activeRoot}
                highlightedValues={highlightedValues}
                visitedValues={visitedValues}
                currentValue={currentValue}
                animKey={animKey}
              />
            ) : (
              <div style={{ color: P.muted, fontSize: 12, padding: "2rem", textAlign: "center" }}>
                {state.activeTab === "rebuild"
                  ? "Ingresa las secuencias y presiona \"Reconstruir\" para visualizar el árbol"
                  : "Agrega números y presiona \"BUILD TREE\" para visualizar el árbol"}
              </div>
            )}
          </div>
        </div>

        {/* ════ TRAVERSAL SEQUENCES (always visible when tree exists) ════ */}
        {tree && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
          }}>
            <SectionHeader icon="" title="Secuencias de Recorrido" />
            {[
              { label: "In-order",   values: tree.inorder,   color: P.cyan   },
              { label: "Pre-order",  values: tree.preorder,  color: P.purple },
              { label: "Post-order", values: tree.postorder, color: P.yellow },
            ].map(({ label, values, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 6 }}>{label.toUpperCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {values.map((v, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: "#0a0a0a", border: `1px solid ${color}33`,
                      borderRadius: 4, color,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Random panel ─────────────────────────────────────────────────────────────
function RandomPanel({ onGenerate }: { onGenerate: (nums: number[]) => void }) {
  const [open, setOpen]   = useState(false);
  const [count, setCount] = useState(7);
  const [min, setMin]     = useState(1);
  const [max, setMax]     = useState(99);

  const generate = () => {
    if (min >= max) return;
    const set = new Set<number>();
    let tries = 0;
    while (set.size < count && tries < 500) {
      set.add(Math.floor(Math.random() * (max - min + 1)) + min);
      tries++;
    }
    onGenerate([...set]);
    setOpen(false);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Btn color={P.purple} colorDim={P.purpleDim} onClick={() => setOpen(v => !v)}>
        🎲 {open ? "Cerrar Aleatorio" : "Aleatorio"}
      </Btn>
      {open && (
        <div style={{
          marginTop: 8, padding: "1rem",
          background: "#0a0a0a", border: `1px solid ${P.border}`,
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            {[
              { label: "Número de nodos", val: count, set: setCount, min: 1, max: 20 },
              { label: "Valor mínimo",    val: min,   set: setMin,   min: -999, max: 999 },
              { label: "Valor máximo",    val: max,   set: setMax,   min: -999, max: 999 },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type="number"
                  value={f.val}
                  min={f.min} max={f.max}
                  onChange={e => f.set(Number(e.target.value))}
                  style={{
                    width: 90, padding: "7px 10px",
                    background: P.surface, border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.purple)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
            ))}
            <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={generate}>
              Generar
            </Btn>
          </div>
          {min >= max && (
            <div style={{ marginTop: 8, fontSize: 10, color: P.red }}>
              ⚠ El valor mínimo debe ser menor que el máximo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
