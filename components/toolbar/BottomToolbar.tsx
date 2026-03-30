"use client";
import type { ToolMode, AlgoMode } from "@/types";
import { P } from "@/components/canvas/palette";
import { getAlgoColor, getVariant, ALGO_FAMILIES } from "@/algorithms/registry";

interface Props {
  mode:         ToolMode;
  algoMode:     AlgoMode;
  isAnimating:  boolean;
  panelOpen:    boolean;
  onMode:       (m: ToolMode) => void;
  onOpenAlgo:   () => void;
  onSolve:      () => void;
  onClearAlgo:  () => void;
  onTogglePanel:() => void;
  onOpenMatrix: () => void;
  onClear:      () => void;
}

// Extraemos los SVGs de la versión antigua
const ICONS = {
  add: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
  connect: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  move: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  delete: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  clear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  matrix: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
};

const TOOLS: { id: ToolMode; icon: React.ReactNode; label: string; danger?: boolean }[] = [
  { id: "add",     icon: ICONS.add,     label: "AÑADIR" },
  { id: "connect", icon: ICONS.connect, label: "CONECTAR" },
  { id: "move",    icon: ICONS.move,    label: "MOVER" },
  { id: "edit",    icon: ICONS.edit,    label: "EDITAR" },
  { id: "delete",  icon: ICONS.delete,  label: "BORRAR", danger: true },
];

// Divisor un poco más alto para acompañar los botones nuevos
const DIV: React.CSSProperties = { width: 1, height: 36, background: P.border, margin: "0 3px" };

export default function BottomToolbar({
  mode, algoMode, isAnimating,
  panelOpen,
  onMode, onOpenAlgo, onSolve, onClearAlgo, onTogglePanel, onOpenMatrix, onClear,
}: Props) {
  const isNeutral   = algoMode === "none";
  const variant     = getVariant(algoMode);
  const family      = ALGO_FAMILIES.find((f) => f.directMode === algoMode || f.variants?.some((v) => v.id === algoMode));
  const accentColor = isNeutral ? P.purple : getAlgoColor(algoMode);

  // Label shown in the algo button
  const algoLabel = isNeutral
    ? "⬡  Pizarra"
    : `${variant?.icon ?? family?.icon ?? "◆"}  ${variant?.label ?? family?.label ?? algoMode}`;

  // Estilos compartidos para los botones con ícono + texto
  const textStyle: React.CSSProperties = {
    fontSize: 9, 
    fontWeight: "bold", 
    letterSpacing: 0.5,
    fontFamily: "'Courier New', monospace"
  };

  return (
    <div style={{
      position:       "absolute",
      bottom:         18,
      left:           "50%",
      transform:      "translateX(-50%)",
      display:        "flex",
      alignItems:     "center",
      gap:            3,
      background:     "rgba(5,5,5,0.96)",
      backdropFilter: "blur(24px)",
      border:         `1px solid ${P.border}`,
      borderRadius:   12,
      padding:        "6px 8px",
      zIndex:         20,
      boxShadow:      "0 6px 48px rgba(0,0,0,0.95)",
      userSelect:     "none",
    }}>

      {/* ── Tool buttons ─────────────────────────────────────────────────── */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => onMode(t.id)}
          style={{
            width:        52, 
            height:       50,
            border:       "1px solid",
            borderRadius: 7,
            cursor:       "pointer",
            display:      "flex", 
            flexDirection:"column",
            alignItems:   "center", 
            justifyContent: "center",
            gap:          4,
            transition:   "all 0.12s",
            color:        mode === t.id ? P.bg : t.danger ? P.red : P.muted,
            background:   mode === t.id ? (t.danger ? P.red : P.purple) : "transparent",
            borderColor:  mode === t.id ? "transparent" : t.danger ? `${P.red}33` : "transparent",
          }}
        >
          {t.icon}
          <span style={textStyle}>{t.label}</span>
        </button>
      ))}

      <div style={DIV} />

      {/* ── Clear canvas ─────────────────────────────────────────────────── */}
      <button title="Limpiar lienzo" onClick={onClear}
        style={{ 
          width: 52, height: 50, border: "none", borderRadius: 7, cursor: "pointer", 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          color: "#e05555", background: "transparent", transition: "all 0.12s"
        }}>
        {ICONS.clear}
        <span style={{...textStyle, color: "#e05555"}}>LIMPIAR</span>
      </button>

      <div style={DIV} />

      {/* ── Matrix button ────────────────────────────────────────────────── */}
      <button title="Abrir Matriz" onClick={onOpenMatrix}
        style={{ 
          width: 52, height: 50, border: "1px solid transparent", borderRadius: 7, cursor: "pointer", 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          color: P.muted, background: "transparent", transition: "all 0.12s" 
        }}>
        {ICONS.matrix}
        <span style={textStyle}>MATRIZ</span>
      </button>

      <div style={DIV} />

      {/* ── Algorithm selector — PRIMARY BUTTON ──────────────────────────── */}
      <button
        title="Seleccionar Algoritmo"
        onClick={onOpenAlgo}
        style={{
          height:       34,
          padding:      "0 14px",
          border:       `1px solid ${accentColor}`,
          borderRadius: 7,
          cursor:       "pointer",
          fontSize:     11,
          letterSpacing:1,
          background:   isNeutral ? "transparent" : `${accentColor}18`,
          color:        accentColor,
          transition:   "all 0.18s",
          whiteSpace:   "nowrap",
          fontFamily:   "'Courier New', monospace",
          fontWeight:   "bold",
          minWidth:     120,
        }}
      >
        {algoLabel}
      </button>

      {/* Clear algo — only when algo is active */}
      {!isNeutral && (
        <button title="Salir del modo" onClick={onClearAlgo}
          style={{ width: 24, height: 24, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, color: P.muted, background: "transparent", marginLeft: -2 }}>
          ✕
        </button>
      )}

      <div style={DIV} />

      {/* ── Solve — ALWAYS VISIBLE ───────────────────────────────────────── */}
      <button
        title={isNeutral ? "Selecciona un algoritmo primero" : "Resolver con animación"}
        onClick={isNeutral ? undefined : onSolve}
        disabled={isAnimating}
        style={{
          height:       34,
          padding:      "0 16px",
          border:       "none",
          borderRadius: 7,
          cursor:       isNeutral || isAnimating ? "not-allowed" : "pointer",
          fontSize:     12,
          letterSpacing:1,
          fontWeight:   "bold",
          background:   isNeutral   ? "#1a1a1a"
                      : isAnimating ? `${accentColor}44`
                      : accentColor,
          color:        isNeutral   ? P.muted : P.bg,
          opacity:      isAnimating ? 0.7 : 1,
          transition:   "all 0.18s",
          whiteSpace:   "nowrap",
          fontFamily:   "'Courier New', monospace",
          boxShadow:    isNeutral || isAnimating ? "none" : `0 0 16px ${accentColor}44`,
        }}
      >
        {isAnimating ? "● Ejecutando" : "▶ Resolver"}
      </button>

      <div style={DIV} />

      {/* ── Results panel toggle ─────────────────────────────────────────── */}
      <button
        title="Panel de Resultados"
        onClick={onTogglePanel}
        style={{
          width:        34, height: 34,
          border:       "none",
          borderRadius: 7,
          cursor:       "pointer",
          fontSize:     16,
          color:        panelOpen ? accentColor : P.muted,
          background:   "transparent",
          display:      "flex", alignItems: "center", justifyContent: "center",
          transition:   "color 0.15s",
        }}
      >
        ≡
      </button>
    </div>
  );
}