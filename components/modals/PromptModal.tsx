// src/components/modals/PromptModal.tsx
"use client";
import type { PromptCfg } from "../../types";
import { P } from "../canvas/palette";

interface Props {
  prompt: PromptCfg;
  onChange: (value: string) => void;
  onOk: () => void;
  onCancel: () => void;
}

export default function PromptModal({ prompt, onChange, onOk, onCancel }: Props) {
  if (!prompt.open) return null;

  // Manejador para cerrar con la tecla Escape o aceptar con Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter") onOk();
  };

  // Estilos base para reutilizar
  const btnBaseStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    transition: "all 0.1s ease"
  };

  return (
    <>
      {/* ── FONDO OSCURO (BACKDROP) ── */}
      <div 
        onClick={onCancel} // Cierra al hacer clic fuera
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
          backdropFilter: "blur(2px)",      // Ligero desenfoque para dar foco
          zIndex: 200,                      // Por encima de todo
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', monospace"
        }}
      >
        {/* ── VENTANA DEL MODAL ── */}
        <div 
          onClick={(e) => e.stopPropagation()} // Evita que el clic interno cierre el modal
          onKeyDown={handleKeyDown}            // Escucha teclas
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: "10px",
            width: "300px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ color: "#FFF", fontSize: 13, fontWeight: "bold" }}>
              {prompt.title}
            </span>
            <button onClick={onCancel} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          
          {/* CUERPO (INPUT) */}
          <div style={{ padding: "16px" }}>
            <input 
              type="text" 
              value={prompt.value} 
              onChange={(e) => onChange(e.target.value)}
              placeholder={prompt.placeholder}
              autoFocus // Enfoca automáticamente al abrir
              style={{
                width: "100%",
                padding: "10px",
                background: "#161616",
                color: "#FFF",
                border: "1px solid #222",
                borderRadius: "6px",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 12,
                boxSizing: "border-box" // Asegura que el padding no infle el tamaño
              }}
            />
            {/* Mensaje de error (si existe) */}
            {prompt.error && (
              <div style={{ color: P.red, fontSize: 10, marginTop: 6, paddingLeft: 2 }}>
                ⚠ {prompt.error}
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 16px", background: "#111", borderTop: "1px solid #1a1a1a" }}>
            <button 
              onClick={onCancel} 
              style={{ ...btnBaseStyle, background: "transparent", color: "#888", border: "1px solid #333" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#222"; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}
            >
              Cancelar
            </button>
            <button 
              onClick={onOk} 
              style={{ ...btnBaseStyle, background: P.purple, color: "#FFF", boxShadow: `0 0 15px ${P.purple}44` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = P.purpleBright; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = P.purple; }}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}