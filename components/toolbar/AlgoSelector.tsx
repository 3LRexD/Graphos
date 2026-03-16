"use client";
import { P } from "../canvas/palette";
import { ALGO_REGISTRY } from "../../algorithms";
import { overlayS, modalS, ghostS } from "../styles";

interface Props {
  currentMode: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function AlgoSelector({ currentMode, onSelect, onClose }: Props) {
  return (
    <div style={overlayS} onClick={onClose}>
      <div style={{ ...modalS, maxWidth: 460, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 6 }}>
          SELECCIONAR MODO
        </div>
        <div style={{ color: P.text, fontSize: "1rem", marginBottom: "1.4rem" }}>
          Algoritmo del Grafo
        </div>

        {/* Grid: 2 columns, expands naturally as more algorithms are added */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(ALGO_REGISTRY.length, 2)}, 1fr)`,
          gap: 12,
          marginBottom: "1.2rem",
        }}>
          {ALGO_REGISTRY.map((algo) => {
            const isActive = currentMode === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => { onSelect(algo.id); onClose(); }}
                style={{
                  padding:    "1.1rem",
                  border:     `1px solid ${isActive ? algo.color : P.border}`,
                  borderRadius: 8,
                  cursor:     "pointer",
                  textAlign:  "center",
                  background: isActive ? algo.colorDim : "transparent",
                  fontFamily: "'Courier New', monospace",
                  transition: "all 0.18s",
                }}
              >
                <div style={{ color: algo.color, fontSize: "1.5rem", marginBottom: 7 }}>
                  {algo.icon}
                </div>
                <div style={{ color: P.white, fontWeight: "bold", marginBottom: 5, fontSize: 13 }}>
                  {algo.label}
                </div>
                <div style={{ color: P.muted, fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {algo.description.join("\n")}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={onClose} style={ghostS}>Cancelar</button>
      </div>
    </div>
  );
}