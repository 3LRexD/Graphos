"use client";
import { JSX } from "react";
import type { ToolMode } from "../../types";
import { P } from "../canvas/palette";

interface Props {
  mode: ToolMode;
  isMatrixOpen: boolean; // NUEVO
  onMode: (m: ToolMode) => void;
  onToggleMatrix: () => void; // NUEVO
  onClear: () => void;
}

const ICONS = {
  add: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
  move: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  connect: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  delete: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

const TOOLS: { id: ToolMode; icon: JSX.Element; label: string; danger?: boolean }[] = [
  { id: "add",     icon: ICONS.add,     label: "Añadir Nodo" },
  { id: "move",    icon: ICONS.move,    label: "Mover Lienzo/Nodo" },
  { id: "connect", icon: ICONS.connect, label: "Conectar Nodos" },
  { id: "edit",    icon: ICONS.edit,    label: "Editar Valores" },
  { id: "delete",  icon: ICONS.delete,  label: "Eliminar Elemento", danger: true },
];

export default function BottomToolbar({ mode, isMatrixOpen, onMode, onToggleMatrix, onClear }: Props) {
  return (
    <div style={{
      position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 6, background: "#111111", border: "1px solid #222",
      borderRadius: "40px", padding: "8px 16px", zIndex: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    }}>
      {TOOLS.map((t) => {
        const isActive = mode === t.id;
        return (
          <button key={t.id} title={t.label} onClick={() => onMode(t.id)}
            style={{ width: 36, height: 36, border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: isActive ? "#FFF" : (t.danger ? P.red : "#888"), background: isActive ? (t.danger ? P.red : "#333") : "transparent" }}>
            {t.icon}
          </button>
        );
      })}

      <div style={{ width: 1, height: 24, background: "#333", margin: "0 8px" }} />

      <button title="Limpiar lienzo" onClick={onClear} style={{ width: 36, height: 36, border: "none", borderRadius: "10px", cursor: "pointer", color: "#888", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#E0E0E0"} onMouseLeave={(e) => e.currentTarget.style.color = "#888"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* BOTÓN MATRIZ AHORA ABRE EL MINI SECTOR */}
      <button title="Matriz de Adyacencia" onClick={onToggleMatrix} style={{ width: 36, height: 36, border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: isMatrixOpen ? P.purple : "#888", background: isMatrixOpen ? P.purpleDim : "transparent" }} onMouseEnter={(e) => { if(!isMatrixOpen) e.currentTarget.style.color = "#E0E0E0" }} onMouseLeave={(e) => { if(!isMatrixOpen) e.currentTarget.style.color = "#888" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      </button>
    </div>
  );
}