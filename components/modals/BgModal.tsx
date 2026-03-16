"use client";
import { P } from "../canvas/palette";
import { BG_PRESETS } from "../canvas/backgrounds";
import { overlayS, modalS, ghostS } from "../styles";

interface Props {
  bgPreset: string;
  bgImage: string | null;
  onSelectPreset: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export default function BgModal({ bgPreset, bgImage, onSelectPreset, onUpload, onClose }: Props) {
  return (
    <div style={overlayS} onClick={onClose}>
      <div style={{ ...modalS, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: "1.1rem" }}>
          FONDO DEL LIENZO
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "1rem" }}>
          {BG_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelectPreset(p.id); onClose(); }}
              style={{
                padding: "9px 6px",
                border: `1px solid ${bgPreset === p.id && !bgImage ? P.purple : P.border}`,
                borderRadius: 5, cursor: "pointer",
                background: bgPreset === p.id && !bgImage ? P.purpleDim : "transparent",
                color: bgPreset === p.id && !bgImage ? P.purple : P.muted,
                fontFamily: "'Courier New', monospace", fontSize: 11,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, padding: "9px 14px",
          border: `1px solid ${P.border}`, borderRadius: 5,
          cursor: "pointer", color: P.muted, fontSize: 11,
        }}>
          📁 Subir imagen personalizada
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={onUpload} />
        </label>

        {bgImage && (
          <div style={{ marginTop: 7, color: P.green, fontSize: 11, textAlign: "center" }}>
            ✓ Imagen personalizada activa
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={onClose} style={ghostS}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}