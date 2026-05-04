"use client";

import { useState } from "react";
import { useTransportState } from "../../hooks/useTransportState";
import TransportTable from "@/components/transport/TransportTable";
import ResultMatrix   from "@/components/transport/ResultMatrix";
import StepViewer     from "@/components/transport/StepViewer";
import type { TransportResult } from "../../algorithms/northWest";
import { useRouter } from 'next/navigation';
// ─── Paleta (misma que el resto del proyecto) ─────────────────────────────────
// ─── Paleta (idéntica al resto del proyecto) ──────────────────────────────────
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
 
// ─── Estilos de botones ───────────────────────────────────────────────────────
// filled  → fondo sólido (solo Resolver)
// ghost   → borde visible + fondo sutil (todos los demás)
const btnGhost = (color: string, colorDim: string): CSSProperties => ({
  display:      "flex",
  alignItems:   "center",
  gap:          6,
  padding:      "8px 15px",
  background:   colorDim,
  border:       `1px solid ${color}`,
  borderRadius: 7,
  color:        color,
  cursor:       "pointer",
  fontFamily:   "'Courier New', monospace",
  fontSize:     11,
  fontWeight:   "bold",
  letterSpacing: 0.5,
  transition:   "all 0.14s",
  whiteSpace:   "nowrap" as const,
});
 
const btnFilled = (color: string): CSSProperties => ({
  display:      "flex",
  alignItems:   "center",
  gap:          6,
  padding:      "8px 18px",
  background:   color,
  border:       `1px solid ${color}`,
  borderRadius: 7,
  color:        "#0a0a0a",
  cursor:       "pointer",
  fontFamily:   "'Courier New', monospace",
  fontSize:     11,
  fontWeight:   "bold",
  letterSpacing: 0.5,
  transition:   "all 0.14s",
  whiteSpace:   "nowrap" as const,
});
 
// ─── Componente botón ghost reutilizable ──────────────────────────────────────
function Btn({
  color, colorDim, filled = false, onClick, children, asLabel = false,
}: {
  color: string; colorDim: string; filled?: boolean;
  onClick?: () => void; children: React.ReactNode; asLabel?: boolean;
}) {
  const style = filled ? btnFilled(color) : btnGhost(color, colorDim);
 
  if (asLabel) {
    return (
      <label style={{ ...style, cursor: "pointer" }}>
        {children}
      </label>
    );
  }
 
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}
 
// ─── Divisor vertical ─────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ width: 1, background: P.border, alignSelf: "stretch", margin: "0 2px" }} />;
}
 
// ─── Encabezado de sección ────────────────────────────────────────────────────
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
 
// ─── Página principal ─────────────────────────────────────────────────────────
export default function NorthWestPage() {
  const state            = useTransportState();
  const router           = useRouter();
  const [showExamples, setShowExamples] = useState(false);
 
  const result = state.result && !state.result.error
    ? (state.result as TransportResult)
    : null;
 
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) state.importJSON(f);
    e.target.value = "";
  };
 
  return (
    <div style={{
      minHeight:  "100vh",
      background: P.bg,
      fontFamily: "'Courier New', monospace",
      color:      P.text,
    }}>
 
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
 
      {/* ── Encabezado ── */}
      <div style={{ textAlign: "center", padding: "2.2rem 1rem 1.4rem" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>U.U</div>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 400, color: P.text,
          letterSpacing: 2, marginBottom: 6, margin: "0 0 6px",
        }}>
          Algoritmo North West Corner
        </h1>
        <p style={{ color: P.muted, fontSize: 11, margin: 0 }}>
          Método de la esquina noroeste para problemas de transporte
        </p>
      </div>
 
      {/* ── Panel principal ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem 3rem" }}>
 
        {/* ════════════════════════════════════════════════════════════════
            BARRA DE HERRAMIENTAS
            Fila 1: acciones principales + resolver
            Fila 2: importar / exportar / limpiar + volver a algoritmos
        ════════════════════════════════════════════════════════════════ */}
        <div style={{
          background:   P.surface,
          border:       `1px solid ${P.border}`,
          borderRadius: 10,
          padding:      "12px 16px",
          marginBottom: "1.4rem",
          display:      "flex",
          flexDirection:"column",
          gap:          10,
        }}>
 
          {/* Fila 1: estructura + objetivo + resolver + ejemplos */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
 
            {/* Estructura de la tabla */}
            <Btn color={P.purple} colorDim={P.purpleDim} onClick={state.addRow}>
              + Agregar Fila
            </Btn>
            <Btn color={P.purple} colorDim={P.purpleDim} onClick={state.addCol}>
              + Agregar Columna
            </Btn>
            <Btn color={P.red} colorDim={P.redDim} onClick={state.removeRow}>
              − Eliminar Fila
            </Btn>
            <Btn color={P.red} colorDim={P.redDim} onClick={state.removeCol}>
              − Eliminar Columna
            </Btn>
 
            <Divider />
 
            {/* Objetivo: alterna minimizar / maximizar */}
            <Btn
              color={state.objective === "minimize" ? P.red : P.orange}
              colorDim={state.objective === "minimize" ? P.redDim : P.orangeDim}
              onClick={() =>
                state.setObjective(state.objective === "minimize" ? "maximize" : "minimize")
              }
            >
              {state.objective === "minimize" ? "↓ Minimizar" : "↑ Maximizar"}
            </Btn>
 
            {/* Resolver — único botón filled */}
            <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.solve}>
              ▶ Resolver
            </Btn>
 
            <Divider />
 
            {/* Ejemplos con dropdown */}
            <div style={{ position: "relative" }}>
              <Btn
                color={P.yellow}
                colorDim={P.yellowDim}
                onClick={() => setShowExamples(v => !v)}
              >
                ★ Ejemplos
              </Btn>
              {showExamples && (
                <>
                  {/* click-away */}
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    onClick={() => setShowExamples(false)}
                  />
                  <div style={{
                    position:     "absolute",
                    top:          "calc(100% + 6px)",
                    left:         0,
                    background:   P.surface,
                    border:       `1px solid ${P.border}`,
                    borderRadius: 7,
                    overflow:     "hidden",
                    zIndex:       50,
                    minWidth:     180,
                    boxShadow:    "0 10px 28px rgba(0,0,0,0.8)",
                  }}>
                    {[
                      { label: "Ejemplo 1 — Minimizar", idx: 0 },
                      { label: "Ejemplo 2 — Maximizar", idx: 1 },
                    ].map(ex => (
                      <button
                        key={ex.idx}
                        onClick={() => { state.loadExample(ex.idx); setShowExamples(false); }}
                        style={{
                          display:    "block", width: "100%",
                          padding:    "10px 14px",
                          background: "transparent", border: "none",
                          color:      P.text, cursor: "pointer",
                          fontSize:   11, fontFamily: "'Courier New', monospace",
                          textAlign:  "left", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
 
          {/* ── Separador entre filas ── */}
          <div style={{ height: 1, background: P.border }} />
 
          {/* Fila 2: importar / exportar / limpiar + separador + volver */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
 
            {/* Importar — label para abrir file picker */}
            <Btn color={P.white} colorDim={P.purpleDim} asLabel>
              ⬆ Importar JSON
              <input
                type="file" accept=".json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </Btn>
 
            {/* Exportar JSON */}
            <Btn color={P.white} colorDim={P.purpleDim} onClick={state.exportJSON}>
              ⬇ Exportar JSON
            </Btn>
 
            {/* Limpiar */}
            <Btn color={P.white} colorDim={P.redDim} onClick={state.clear}>
              ✕ Limpiar
            </Btn>
 
            {/* Separador */}
            <div style={{ flex: 1 }} />
 
            {/* ── Botón volver a algoritmos ── */}
            {/* Lleva al usuario de vuelta al editor con el modal de selección abierto.
                Usamos ?showSelector=true como señal para que GraphEditor abra el modal. */}
            <Btn
              color={P.green}
              colorDim={P.greenDim}
              onClick={() => router.push("/editor?showSelector=true")}
            >
              ⟵ Cambiar algoritmo
            </Btn>
          </div>
        </div>
 
        {/* ── Tabla de input ── */}
        <div style={{
          background:   P.surface,
          border:       `1px solid ${P.border}`,
          borderRadius: 8,
          padding:      "1rem",
          marginBottom: "2rem",
        }}>
          <TransportTable
            costs={state.costs}
            supply={state.supply}
            demand={state.demand}
            rowLabels={state.rowLabels}
            colLabels={state.colLabels}
            totalSupply={state.totalSupply}
            totalDemand={state.totalDemand}
            onCostChange={state.setCostCell}
            onSupplyChange={state.setSupplyCell}
            onDemandChange={state.setDemandCell}
            onRowLabel={state.setRowLabel}
            onColLabel={state.setColLabel}
          />
        </div>
 
        {/* ── Resultados ── */}
        {result && (
          <>
            <SectionHeader icon="📊" title="Resultados" />
            <div style={sectionCard}>
              <ResultMatrix result={result} />
            </div>
 
            <SectionHeader icon="≡" title="Iteraciones del Algoritmo" />
            <div style={sectionCard}>
              <StepViewer
                result={result}
                currentStep={state.currentStep}
                onNext={state.nextStep}
                onPrev={state.prevStep}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 

// ─── Estilos ──────────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";

const toolBtnStyle = (color: string, filled = false): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 5,
  padding: "8px 14px",
  background:   filled ? color : `${color}15`,
  border:       `1px solid ${color}66`,
  borderRadius: 6,
  color:        filled ? "#0a0a0a" : color,
  cursor:       "pointer",
  fontFamily:   "'Courier New', monospace",
  fontSize:     11,
  fontWeight:   filled ? "bold" : "normal",
  transition:   "all 0.15s",
  whiteSpace:   "nowrap" as const,
});

const sectionCard: CSSProperties = {
  background:   "#111",
  border:       "1px solid #2a2a2a",
  borderRadius: 8,
  padding:      "1.2rem",
  marginBottom: "1.5rem",
};

const dropItem: CSSProperties = {
  display: "block", width: "100%", padding: "9px 14px",
  background: "transparent", border: "none",
  color: "#E0E0E0", cursor: "pointer", fontSize: 11,
  fontFamily: "'Courier New', monospace",
  textAlign: "left", transition: "background 0.1s",
};