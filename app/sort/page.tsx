"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { useSortState } from "../../hooks/useSortState";
import { useRouter } from "next/navigation";
import type { SortResult, SortAlgorithm } from "../../algorithms/sort";

// ─── Paleta (idéntica al proyecto Northwest) ──────────────────────────────────
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

// ─── Button helpers ───────────────────────────────────────────────────────────
const btnGhost = (color: string, colorDim: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 15px",
  background: colorDim, border: `1px solid ${color}`,
  borderRadius: 7, color,
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

const btnFilled = (color: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 18px",
  background: color, border: `1px solid ${color}`,
  borderRadius: 7, color: "#0a0a0a",
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

function Btn({
  color, colorDim, filled = false, onClick, children, disabled = false,
}: {
  color: string; colorDim: string; filled?: boolean;
  onClick?: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  const style = filled ? btnFilled(color) : btnGhost(color, colorDim);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, background: P.border, alignSelf: "stretch", margin: "0 2px" }} />;
}

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

// ─── Bar visualizer ───────────────────────────────────────────────────────────
function SortBars({
  array, comparing, swapping, sorted, pivot, maxVal,
}: {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
  maxVal: number;
}) {
  const n = array.length;
  const barWidth = Math.max(18, Math.min(60, Math.floor(700 / n) - 4));

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 3,
      height: 220,
      padding: "0 8px 0",
      overflowX: "auto",
      justifyContent: n <= 15 ? "center" : "flex-start",
    }}>
      {array.map((val, i) => {
        const isComparing = comparing.includes(i);
        const isSwapping  = swapping.includes(i);
        const isSorted    = sorted.includes(i);
        const isPivot     = pivot === i;

        let barColor = "#444";
        if (isSorted) barColor = P.green;
        else if (isSwapping) barColor = P.red;
        else if (isPivot) barColor = P.yellow;
        else if (isComparing) barColor = P.cyan;

        const heightPct = maxVal > 0 ? Math.max(4, (val / maxVal) * 180) : 10;

        return (
          <div
            key={i}
            style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            3,
              transition:     "all 0.25s ease",
            }}
          >
            {/* Value label on top */}
            <span style={{
              fontSize:   Math.min(11, Math.max(8, barWidth - 2)),
              color:      barColor,
              fontFamily: "'Courier New', monospace",
              fontWeight: "bold",
              transition: "color 0.25s",
            }}>
              {val}
            </span>
            {/* Bar */}
            <div style={{
              width:         barWidth,
              height:        heightPct,
              background:    barColor,
              borderRadius:  "3px 3px 0 0",
              boxShadow:     isComparing || isSwapping || isPivot
                ? `0 0 10px ${barColor}88`
                : "none",
              transition:    "height 0.25s ease, background 0.25s ease, box-shadow 0.25s",
              position:      "relative",
            }}>
              {/* Pivot indicator */}
              {isPivot && (
                <div style={{
                  position: "absolute", top: -14, left: "50%",
                  transform: "translateX(-50%)",
                  color: P.yellow, fontSize: 10,
                }}>▼</div>
              )}
            </div>
            {/* Index */}
            <span style={{
              fontSize:   9,
              color:      P.muted,
              fontFamily: "'Courier New', monospace",
            }}>
              {i}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { color: P.cyan,   label: "Comparando" },
    { color: P.red,    label: "Intercambiando" },
    { color: P.yellow, label: "Pivote" },
    { color: P.green,  label: "Ordenado" },
    { color: "#444",   label: "Sin procesar" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 12 }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: P.muted, fontFamily: "'Courier New', monospace" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Algorithm selector ───────────────────────────────────────────────────────
const ALGORITHMS: { value: SortAlgorithm; label: string; desc: string }[] = [
  { value: "bubble",    label: "Bubble Sort",    desc: "O(n²) — compara e intercambia pares adyacentes" },
  { value: "selection", label: "Selection Sort", desc: "O(n²) — selecciona el mínimo cada pasada" },
  { value: "insertion", label: "Insertion Sort", desc: "O(n²) — inserta elementos en posición correcta" },
  { value: "merge",     label: "Merge Sort",     desc: "O(n log n) — divide y fusiona sublistas" },
  { value: "quick",     label: "Quick Sort",     desc: "O(n log n) avg — divide por pivote" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SortPage() {
  const state = useSortState();
  const router = useRouter();
  const [showAlgoMenu, setShowAlgoMenu] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const result = state.result && !state.result.error
    ? (state.result as SortResult)
    : null;

  const currentStepData = result?.steps[state.currentStep];
  const maxVal = result
    ? Math.max(...result.original, 1)
    : state.values.length
    ? Math.max(...state.values, 1)
    : 100;

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isPlaying && result) {
      playRef.current = setInterval(() => {
        state.nextStep();
      }, state.playSpeed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [state.isPlaying, state.playSpeed, result]);

  // Pause when reaching last step
  useEffect(() => {
    if (result && state.currentStep >= result.steps.length - 1 && state.isPlaying) {
      state.pause();
    }
  }, [state.currentStep, result, state.isPlaying]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      state.addValue(state.inputText);
    }
  };

  const selectedAlgo = ALGORITHMS.find(a => a.value === state.algorithm)!;
  const progress = result ? ((state.currentStep + 1) / result.steps.length) * 100 : 0;

  return (
    <div style={{
      minHeight: "100vh", background: P.bg,
      fontFamily: "'Courier New', monospace", color: P.text,
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

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "2.2rem 1rem 1.4rem" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>⟨⟩</div>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 400, color: P.text,
          letterSpacing: 2, margin: "0 0 6px",
        }}>
          Visualizador de Algoritmos de Ordenamiento
        </h1>
        <p style={{ color: P.muted, fontSize: 11, margin: 0 }}>
          Ingresa números, elige un algoritmo y observa el proceso paso a paso
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1rem 3rem" }}>

        {/* ════ TOOLBAR ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: "1.4rem",
          display: "flex", flexDirection: "column", gap: 10,
        }}>

          {/* Fila 1: algoritmo + resolver + ejemplos */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>

            {/* Algorithm selector */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAlgoMenu(v => !v)}
                style={btnGhost(P.purple, P.purpleDim)}
              >
                ⚙ {selectedAlgo.label} ▾
              </button>
              {showAlgoMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowAlgoMenu(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: P.surface, border: `1px solid ${P.border}`,
                    borderRadius: 7, overflow: "hidden", zIndex: 50,
                    minWidth: 260, boxShadow: "0 10px 28px rgba(0,0,0,0.8)",
                  }}>
                    {ALGORITHMS.map(a => (
                      <button
                        key={a.value}
                        onClick={() => { state.setAlgorithm(a.value); setShowAlgoMenu(false); }}
                        style={{
                          display: "block", width: "100%",
                          padding: "10px 14px",
                          background: state.algorithm === a.value ? P.purpleDim : "transparent",
                          border: "none",
                          borderLeft: state.algorithm === a.value ? `2px solid ${P.purple}` : "2px solid transparent",
                          color: P.text, cursor: "pointer", textAlign: "left",
                          fontFamily: "'Courier New', monospace",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={e => (e.currentTarget.style.background = state.algorithm === a.value ? P.purpleDim : "transparent")}
                      >
                        <div style={{ fontSize: 11, fontWeight: "bold", color: P.purple }}>{a.label}</div>
                        <div style={{ fontSize: 10, color: P.muted, marginTop: 2 }}>{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Divider />

            {/* Solve */}
            <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.solve}>
              ▶ Resolver
            </Btn>

            <Divider />

            {/* Examples */}
            <div style={{ position: "relative" }}>
              <Btn color={P.yellow} colorDim={P.yellowDim} onClick={() => setShowExamples(v => !v)}>
                ★ Ejemplos
              </Btn>
              {showExamples && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowExamples(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: P.surface, border: `1px solid ${P.border}`,
                    borderRadius: 7, overflow: "hidden", zIndex: 50,
                    minWidth: 180, boxShadow: "0 10px 28px rgba(0,0,0,0.8)",
                  }}>
                    {[
                      { label: "Ejemplo 1 — 7 elementos", idx: 0 },
                      { label: "Ejemplo 2 — 7 elementos", idx: 1 },
                      { label: "Ejemplo 3 — 8 elementos", idx: 2 },
                    ].map(ex => (
                      <button
                        key={ex.idx}
                        onClick={() => { state.loadExample(ex.idx); setShowExamples(false); }}
                        style={{
                          display: "block", width: "100%", padding: "10px 14px",
                          background: "transparent", border: "none",
                          color: P.text, cursor: "pointer", fontSize: 11,
                          fontFamily: "'Courier New', monospace", textAlign: "left",
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

            <Divider />

            {/* Clear */}
            <Btn color={P.red} colorDim={P.redDim} onClick={state.clear}>
              ✕ Limpiar
            </Btn>

            <Divider />

            {/* Back Button */}
            <Btn
              color={P.green}
              colorDim={P.greenDim}
              onClick={() => router.push("/editor?showSelector=true")}
            >
              ⟵ Cambiar algoritmo
            </Btn>
          </div>
        </div>

        {/* ════ INPUT SECTION ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
        }}>
          <SectionHeader icon="✏" title="Ingresar Números" />

          {/* Input row */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
            <input
              ref={inputRef}
              type="number"
              value={state.inputText}
              onChange={e => state.setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un número y presiona Enter"
              style={{
                flex: 1, padding: "9px 14px",
                background: "#0a0a0a", border: `1px solid ${P.border}`,
                borderRadius: 6, color: P.text,
                fontFamily: "'Courier New', monospace", fontSize: 13,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = P.purple)}
              onBlur={e => (e.target.style.borderColor = P.border)}
            />
            <Btn
              color={P.purple} colorDim={P.purpleDim}
              onClick={() => state.addValue(state.inputText)}
            >
              + Agregar
            </Btn>
          </div>

          {/* Chips */}
          {state.values.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {state.values.map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "4px 10px",
                    background: P.purpleDim, border: `1px solid ${P.purple}44`,
                    borderRadius: 20, color: P.purple,
                    fontFamily: "'Courier New', monospace", fontSize: 12,
                  }}
                >
                  <span>{v}</span>
                  <button
                    onClick={() => state.removeValue(i)}
                    style={{
                      background: "none", border: "none",
                      color: P.red, cursor: "pointer",
                      fontSize: 12, lineHeight: 1, padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: P.muted, fontSize: 11, padding: "8px 0" }}>
              Sin elementos — agrega números o carga un ejemplo
            </div>
          )}

          {/* Counter */}
          <div style={{
            marginTop: 10, fontSize: 10, color: P.muted,
            display: "flex", justifyContent: "space-between",
          }}>
            <span>{state.totalValues} / 30 elementos</span>
            <span style={{ color: state.totalValues > 0 ? P.purple : P.muted }}>
              {state.totalValues > 0 ? `Algoritmo: ${selectedAlgo.label}` : ""}
            </span>
          </div>
        </div>

        {/* ════ RESULTS ════ */}
        {result && (
          <>
            {/* Stats bar */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 12,
              marginBottom: "1.2rem",
            }}>
              {[
                { label: "Algoritmo",      value: result.algorithmName, color: P.purple },
                { label: "Pasos totales",  value: result.steps.length,  color: P.cyan   },
                { label: "Comparaciones",  value: result.totalComparisons, color: P.yellow },
                { label: "Intercambios",   value: result.totalSwaps,    color: P.orange  },
              ].map(s => (
                <div key={s.label} style={{
                  background: P.surface, border: `1px solid ${P.border}`,
                  borderRadius: 8, padding: "10px 16px", flex: "1 1 100px",
                  minWidth: 100,
                }}>
                  <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 16, color: s.color, fontWeight: "bold" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Visualizer */}
            <SectionHeader icon="📊" title="Visualización" />
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
            }}>
              <Legend />

              {/* Bars */}
              {currentStepData && (
                <SortBars
                  array={currentStepData.array}
                  comparing={currentStepData.comparing}
                  swapping={currentStepData.swapping}
                  sorted={currentStepData.sorted}
                  pivot={currentStepData.pivot}
                  maxVal={maxVal}
                />
              )}

              {/* Progress bar */}
              <div style={{
                height: 3, background: P.border, borderRadius: 2,
                margin: "14px 0 10px", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${progress}%`,
                  background: `linear-gradient(90deg, ${P.purple}, ${P.cyan})`,
                  borderRadius: 2, transition: "width 0.2s",
                }} />
              </div>

              {/* Step description */}
              <div style={{
                background: "#0a0a0a", border: `1px solid ${P.border}`,
                borderRadius: 6, padding: "10px 14px",
                fontSize: 12, color: P.text, marginBottom: 14,
                minHeight: 38, display: "flex", alignItems: "center",
              }}>
                <span style={{ color: P.cyan, marginRight: 8 }}>
                  [{state.currentStep + 1}/{result.steps.length}]
                </span>
                {currentStepData?.description}
              </div>

              {/* Playback controls */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={() => state.goToStep(0)}
                  disabled={state.currentStep === 0}>
                  ⏮ Inicio
                </Btn>
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={state.prevStep}
                  disabled={state.currentStep === 0}>
                  ◀ Anterior
                </Btn>
                {state.isPlaying ? (
                  <Btn color={P.orange} colorDim={P.orangeDim} onClick={state.pause}>
                    ⏸ Pausar
                  </Btn>
                ) : (
                  <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.play}
                    disabled={state.currentStep >= result.steps.length - 1 && !state.isPlaying}>
                    ▶ Reproducir
                  </Btn>
                )}
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={state.nextStep}
                  disabled={state.currentStep >= result.steps.length - 1}>
                  Siguiente ▶
                </Btn>
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={() => state.goToStep(result.steps.length - 1)}
                  disabled={state.currentStep >= result.steps.length - 1}>
                  Final ⏭
                </Btn>

                <Divider />

                {/* Speed */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: P.muted }}>Velocidad:</span>
                  {[
                    { label: "Lento",   ms: 1000 },
                    { label: "Normal",  ms: 600  },
                    { label: "Rápido",  ms: 250  },
                    { label: "Turbo",   ms: 80   },
                  ].map(sp => (
                    <button
                      key={sp.ms}
                      onClick={() => state.setPlaySpeed(sp.ms)}
                      style={{
                        padding: "4px 9px",
                        background: state.playSpeed === sp.ms ? P.cyanDim : "transparent",
                        border: `1px solid ${state.playSpeed === sp.ms ? P.cyan : P.border}`,
                        borderRadius: 5, color: state.playSpeed === sp.ms ? P.cyan : P.muted,
                        cursor: "pointer", fontFamily: "'Courier New', monospace",
                        fontSize: 10,
                      }}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubber */}
              <div style={{ marginTop: 14 }}>
                <input
                  type="range"
                  min={0}
                  max={result.steps.length - 1}
                  value={state.currentStep}
                  onChange={e => state.goToStep(Number(e.target.value))}
                  style={{ width: "100%", accentColor: P.purple, cursor: "pointer" }}
                />
              </div>
            </div>

            {/* Final result */}
            <SectionHeader icon="✓" title="Arreglo Final" />
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
            }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 6 }}>ORIGINAL</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.original.map((v, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: "#0a0a0a", border: `1px solid ${P.border}`,
                      borderRadius: 4, color: P.muted,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                    }}>{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 6 }}>ORDENADO</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.sorted.map((v, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: P.greenDim, border: `1px solid ${P.green}66`,
                      borderRadius: 4, color: P.green,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                      fontWeight: "bold",
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step list */}
            <SectionHeader icon="≡" title="Lista de Pasos" />
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: "1rem", marginBottom: "1.5rem",
              maxHeight: 300, overflowY: "auto",
            }}>
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => state.goToStep(idx)}
                  style={{
                    padding: "8px 12px",
                    background: idx === state.currentStep ? P.purpleDim : "transparent",
                    border: `1px solid ${idx === state.currentStep ? P.purple : "transparent"}`,
                    borderRadius: 5, marginBottom: 3,
                    cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => {
                    if (idx !== state.currentStep)
                      (e.currentTarget as HTMLDivElement).style.background = "#1e1e1e";
                  }}
                  onMouseLeave={e => {
                    if (idx !== state.currentStep)
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <span style={{
                    color: idx === state.currentStep ? P.purple : P.muted,
                    fontSize: 10, minWidth: 30, paddingTop: 1,
                  }}>#{step.iteration}</span>
                  <span style={{ fontSize: 11, color: P.text, flex: 1 }}>{step.description}</span>
                  <span style={{
                    fontSize: 10, color: P.muted,
                    fontFamily: "'Courier New', monospace",
                  }}>[{step.array.join(", ")}]</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}