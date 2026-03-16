"use client";
import { useState } from "react";
import { P } from "../canvas/palette";

interface Props {
  algoMode: string;             // NUEVO
  isAnimating: boolean;         // NUEVO
  onSolve: () => void;          // NUEVO
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJSON: () => void;
  onExportImage: (type: "jpg" | "pdf") => void;
  onOpenBg: () => void;
  onOpenGuide: () => void;
  onOpenAlgo: () => void;
}

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
  background: "transparent", border: "1px solid #333", borderRadius: "8px",
  color: "#AAA", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace",
  transition: "all 0.2s ease"
};

export default function TopToolbar({ 
  algoMode, isAnimating, onSolve, // Usamos las nuevas props
  onImport, onExportJSON, onExportImage, onOpenBg, onOpenGuide, onOpenAlgo 
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      {/* ── IZQUIERDA: Importar / Exportar (Queda igual) ── */}
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, zIndex: 20 }}>
        {/* ... (Todo tu código izquierdo de importar/exportar se mantiene exacto) ... */}
        <label style={btnStyle} onMouseEnter={(e) => e.currentTarget.style.background = "#181818"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importar
          <input type="file" accept=".json" style={{ display: "none" }} onChange={onImport} />
        </label>
        <div style={{ position: "relative" }}>
          <button style={btnStyle} onClick={() => setExportOpen((v) => !v)} onMouseEnter={(e) => e.currentTarget.style.background = "#181818"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </button>
          {exportOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden", minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.8)", zIndex: 100 }}>
              {[ { l: "📋 JSON", a: () => { onExportJSON(); setExportOpen(false); } }, { l: "🖼 JPG", a: () => { onExportImage("jpg"); setExportOpen(false); } }, { l: "📄 PDF", a: () => { onExportImage("pdf"); setExportOpen(false); } } ].map((item) => (
                <button key={item.l} onClick={item.a} onMouseEnter={(e) => (e.currentTarget.style.background = "#222")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", color: "#E0E0E0", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace", textAlign: "left", transition: "background 0.1s" }}>{item.l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DERECHA: Utilidades y Algoritmos ── */}
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "flex-start", gap: 12, zIndex: 20 }}>
        
        <div style={{ display: "flex", gap: 6, marginRight: 10 }}>
          <button style={btnStyle} onClick={onOpenBg} onMouseEnter={(e) => e.currentTarget.style.background = "#181818"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>Fondo</button>
          <button style={btnStyle} onClick={onOpenGuide} onMouseEnter={(e) => e.currentTarget.style.background = "#181818"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Guía</button>
        </div>

        {/* Contenedor relativo para apilar Algoritmos y el Play chiquito */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button onClick={onOpenAlgo} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", background: P.purple, border: "none", borderRadius: "8px", color: "#FFF", cursor: "pointer", fontSize: 12, fontWeight: "bold", fontFamily: "'Courier New', monospace", boxShadow: `0 0 20px ${P.purple}44`, transition: "transform 0.1s ease" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Algoritmos
          </button>

          {/* BOTÓN MINI-PLAY CUADRADITO */}
          {algoMode !== "none" && (
            <button 
              onClick={onSolve} 
              disabled={isAnimating}
              title="Ejecución Rápida"
              style={{
                width: 32, height: 32, background: isAnimating ? "#333" : "#222", border: "1px solid #444", borderRadius: "8px", color: isAnimating ? "#666" : P.green,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: isAnimating ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if(!isAnimating) { e.currentTarget.style.background = "#333"; e.currentTarget.style.borderColor = P.green; } }}
              onMouseLeave={(e) => { if(!isAnimating) { e.currentTarget.style.background = "#222"; e.currentTarget.style.borderColor = "#444"; } }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          )}
        </div>
      </div>
      {exportOpen && <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setExportOpen(false)} />}
    </>
  );
}