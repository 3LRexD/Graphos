"use client";
import { JSX } from "react/jsx-runtime";
import type { ToolMode } from "../../types";
import { P } from "../canvas/palette";

interface Props {
  mode: ToolMode;
  isMatrixOpen: boolean;
  onMode: (m: ToolMode) => void;
  onToggleMatrix: () => void;
  onClear: () => void;
}

const ICONS = {
  add: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
  move: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  connect: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  delete: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

// Hemos acortado los labels para que quepan perfecto debajo del ícono
const TOOLS: { id: ToolMode; icon: JSX.Element; label: string; danger?: boolean }[] = [
  { id: "add",     icon: ICONS.add,     label: "AÑADIR" },
  { id: "move",    icon: ICONS.move,    label: "MOVER" },
  { id: "connect", icon: ICONS.connect, label: "CONECTAR" },
  { id: "edit",    icon: ICONS.edit,    label: "EDITAR" },
  { id: "delete",  icon: ICONS.delete,  label: "BORRAR", danger: true },
];

export default function BottomToolbar({ mode, isMatrixOpen, onMode, onToggleMatrix, onClear }: Props) {
  
  // Estilo base para los botones para no repetir código
  const btnBaseStyle: React.CSSProperties = {
    width: 62,           // Botón más ancho para que quepa el texto
    height: 52,          // Botón más alto para acomodar ícono + texto
    border: "none", 
    borderRadius: "10px", 
    cursor: "pointer", 
    display: "flex", 
    flexDirection: "column", // Pone el ícono arriba y el texto abajo
    alignItems: "center", 
    justifyContent: "center", 
    gap: "6px",          // Espacio entre el ícono y el texto
    transition: "all 0.2s ease",
    fontFamily: "'Courier New', monospace"
  };

  const textStyle: React.CSSProperties = {
    fontSize: 9, 
    fontWeight: "bold", 
    letterSpacing: 0.5
  };

  return (
    <div style={{
      position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 4, 
      background: "#111111", border: "1px solid #222",
      borderRadius: "16px", // Radio un poco menor para que parezca un panel sólido
      padding: "8px 12px", zIndex: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    }}>
      
      {/* ── HERRAMIENTAS PRINCIPALES ── */}
      {TOOLS.map((t) => {
        const isActive = mode === t.id;
        return (
          <button 
            key={t.id} 
            title={t.label} 
            onClick={() => onMode(t.id)}
            style={{ 
              ...btnBaseStyle, 
              color: isActive ? "#FFF" : (t.danger ? P.red : "#888"), 
              background: isActive ? (t.danger ? P.red : "#333") : "transparent" 
            }}
          >
            {t.icon}
            <span style={textStyle}>{t.label}</span>
          </button>
        );
      })}

      {/* ── SEPARADOR ── */}
      <div style={{ width: 1, height: 32, background: "#333", margin: "0 6px" }} /> 

      {/* ── BOTÓN LIMPIAR ── */}
      <button 
        title="Limpiar lienzo" 
        onClick={onClear} 
        style={{ ...btnBaseStyle, color: "#888", background: "transparent" }} 
        onMouseEnter={(e) => e.currentTarget.style.color = "#E0E0E0"} 
        onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span style={textStyle}>LIMPIAR</span>
      </button>

      {/* ── BOTÓN MATRIZ ── */}
      <button 
        title="Matriz de Adyacencia" 
        onClick={onToggleMatrix} 
        style={{ 
          ...btnBaseStyle, 
          color: isMatrixOpen ? P.purple : "#888", 
          background: isMatrixOpen ? P.purpleDim : "transparent" 
        }} 
        onMouseEnter={(e) => { if(!isMatrixOpen) e.currentTarget.style.color = "#E0E0E0" }} 
        onMouseLeave={(e) => { if(!isMatrixOpen) e.currentTarget.style.color = "#888" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span style={textStyle}>MATRIZ</span> 
      </button>

    </div>
  );
}