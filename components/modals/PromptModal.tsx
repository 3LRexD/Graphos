"use client";
import type { PromptCfg } from "../../types";
import { P } from "../canvas/palette";
import { overlayS, modalS, ghostS } from "../styles";

interface Props {
  prompt: PromptCfg;
  onChange: (v: string) => void;
  onOk: () => void;
  onCancel: () => void;
}

export default function PromptModal({ prompt, onChange, onOk, onCancel }: Props) {
  if (!prompt.open) return null;
  return (
    <div style={overlayS}>
      <div style={{ ...modalS, width: 300 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 11 }}>
          {prompt.title.toUpperCase()}
        </div>
        <input
          autoFocus
          type="text"
          value={prompt.value}
          placeholder={prompt.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onOk()}
          style={{
            width: "100%", padding: "9px 11px",
            background: "#0a0a0a", color: P.white,
            border: `1px solid ${P.border}`, borderRadius: 4,
            outline: "none", fontSize: "1rem",
            fontFamily: "'Courier New', monospace",
            boxSizing: "border-box", textAlign: "center",
          }}
        />
        {prompt.error && (
          <p style={{ color: P.red, fontSize: 11, marginTop: 6 }}>{prompt.error}</p>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
          <button onClick={onCancel} style={ghostS}>Cancelar</button>
          <button
            onClick={onOk}
            style={{ ...ghostS, background: P.purple, color: P.bg, borderColor: P.purple, fontWeight: "bold" }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}