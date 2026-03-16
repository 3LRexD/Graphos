"use client";
import { P } from "../canvas/palette";
import { overlayS, modalS, ghostS } from "../styles";

interface Props { onClose: () => void; }

const GUIDE_ITEMS = [
  ["✦ Nodo",      "Clic en el lienzo para crear nodos numerados."],
  ["⤷ Conectar",  "Arrastra de un nodo a otro. Se previenen ciclos y auto-conexiones."],
  ["◆ CPM/PERT",  "Tiempo temprano (cyan) y tardío (rojo) en cada nodo. Ruta crítica en rojo."],
  ["◇ Johnson",   "Selecciona origen (verde) y destino (rojo) en el grafo, luego Resolver."],
  ["▶ Resolver",  "Ejecuta el algoritmo con animación visual progresiva paso a paso."],
  ["🎨 Fondo",    "Elige fondo predefinido o sube tu propia imagen."],
  ["⬆/⬇",        "Importar y exportar grafos en JSON. También exporta JPG o PDF."],
] as const;

export default function GuideModal({ onClose }: Props) {
  return (
    <div style={overlayS} onClick={onClose}>
      <div style={{ ...modalS, maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
          <span style={{ color: P.purple, fontSize: "1rem" }}>📖 Guía Rápida</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer" }}>✕</button>
        </div>

        {GUIDE_ITEMS.map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 12, marginBottom: 13 }}>
            <span style={{ color: P.purpleBright, minWidth: 90, fontSize: 11, fontWeight: "bold" }}>{k}</span>
            <span style={{ color: P.muted, fontSize: 11, lineHeight: 1.6 }}>{v}</span>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "1.4rem" }}>
          <button
            onClick={onClose}
            style={{ ...ghostS, background: P.purple, color: P.bg, borderColor: P.purple }}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}