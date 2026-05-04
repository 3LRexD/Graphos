"use client";
import { useState } from "react";
import type { GNode, GEdge, CPMOutput, DijkstraMaxOutput } from "@/types";
import type { DijkstraMinOutput } from "@/types";
import type { KruskalOutput } from "@/types";
import type { HungarianOutput, HungarianResult } from "@/algorithms/hungarian";
import { P } from "@/components/canvas/palette";
import { getAlgoColor, getVariant, ALGO_FAMILIES } from "@/algorithms/registry";

type AlgoMode = string;

interface Props {
  open:        boolean;
  algoMode:    AlgoMode;
  nodes:       GNode[];
  edges:       GEdge[];
  cpmResult:   CPMOutput;
  jResult:     any;
  dijkstraMinResult?: DijkstraMinOutput;
  dijkstraMaxResult?: DijkstraMaxOutput;
  hResult:     HungarianOutput;
  kResult:     KruskalOutput;
  originNode:  GNode | null;
  destNode:    GNode | null;
  jStep:       "origin" | "dest" | "done";
  dStep?:      "origin" | "dest" | "done";
  isAnimating: boolean;
  onReplay:    () => void;
  onClose:     () => void;
}

type Tab = "result" | "steps" | "console";

export default function ExecutionPanel({
  open, algoMode, nodes, edges,
  cpmResult, jResult, dijkstraMinResult, dijkstraMaxResult, hResult, kResult,
  originNode, destNode, jStep, dStep,
  isAnimating, onReplay, onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("result");

  const isNeutral   = algoMode === "none";
  const accentColor = isNeutral ? P.purple : getAlgoColor(algoMode);
  const variant     = getVariant(algoMode);
  const family      = ALGO_FAMILIES.find((f) => f.directMode === algoMode || f.variants?.some((v) => v.id === algoMode));
  const algoLabel   = variant?.label ?? family?.label ?? "Pizarra";

  const tabs: { id: Tab; label: string }[] = [
    { id: "result",  label: "Resultado" },
    { id: "steps",   label: "Pasos" },
    { id: "console", label: "Consola" },
  ];

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.3)" }} />}

      <div style={{
        position:      "absolute",
        top:           0,
        right:         open ? 0 : -500,
        width:         460,
        height:        "100%",
        background:    P.surface,
        borderLeft:    `1px solid ${P.border}`,
        transition:    "right 0.26s cubic-bezier(0.4,0,0.2,1)",
        zIndex:        50,
        display:       "flex",
        flexDirection: "column",
        boxShadow:     open ? "-8px 0 40px rgba(0,0,0,0.85)" : "none",
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: "13px 16px", borderBottom: `1px solid ${P.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isNeutral ? P.muted : accentColor,
              boxShadow:  isNeutral ? "none" : `0 0 8px ${accentColor}`,
            }} />
            <span style={{ color: P.text, fontSize: "0.85rem", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
              {isNeutral ? "Sin algoritmo activo" : algoLabel}
            </span>
            <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 15 }}>✕</button>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding:      "5px 12px",
                  background:   tab === t.id ? `${accentColor}18` : "transparent",
                  color:        tab === t.id ? accentColor : P.muted,
                  border:       `1px solid ${tab === t.id ? accentColor + "55" : "transparent"}`,
                  borderRadius: 5,
                  fontSize:     10,
                  letterSpacing:1,
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                  textTransform:"uppercase" as const,
                  transition:   "all 0.14s",
                }}
              >
                {t.label}
              </button>
            ))}

            {!isNeutral && (
              <button
                onClick={onReplay}
                disabled={isAnimating}
                title="Repetir animación"
                style={{
                  marginLeft:   "auto",
                  padding:      "5px 10px",
                  background:   "transparent",
                  color:        isAnimating ? P.muted : accentColor,
                  border:       `1px solid ${isAnimating ? P.border : accentColor + "55"}`,
                  borderRadius: 5,
                  fontSize:     10,
                  cursor:       isAnimating ? "not-allowed" : "pointer",
                  fontFamily:   "inherit",
                  opacity:      isAnimating ? 0.5 : 1,
                }}
              >
                ↺ Replay
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {isNeutral ? (
            <NeutralState />
          ) : tab === "result" ? (
            <ResultTab
              algoMode={algoMode}
              nodes={nodes} edges={edges}
              cpmResult={cpmResult}
              jResult={jResult}
              dijkstraMinResult={dijkstraMinResult}
              dijkstraMaxResult={dijkstraMaxResult}
              hResult={hResult}
              kResult={kResult}
              originNode={originNode}
              destNode={destNode}
              jStep={jStep}
              dStep={dStep}
              accentColor={accentColor}
            />
          ) : tab === "steps" ? (
            <StepsTab algoMode={algoMode} cpmResult={cpmResult} jResult={jResult} dijkstraMinResult={dijkstraMinResult} dijkstraMaxResult={dijkstraMaxResult} hResult={hResult} accentColor={accentColor} />
          ) : (
            <ConsoleTab algoMode={algoMode} cpmResult={cpmResult} jResult={jResult} dijkstraMinResult={dijkstraMinResult} dijkstraMaxResult={dijkstraMaxResult} hResult={hResult} kResult={kResult} nodes={nodes} accentColor={accentColor} />
          )}
        </div>
      </div>
    </>
  );
}

function NeutralState() {
  return (
    <div style={{ textAlign: "center", marginTop: "3rem", fontFamily: "'Courier New', monospace" }}>
      <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.3 }}>◎</div>
      <div style={{ color: P.muted, fontSize: 12, lineHeight: 1.9 }}>
        Selecciona un algoritmo<br />y presiona <span style={{ color: P.purpleBright }}>▶ Resolver</span><br />para ver los resultados aquí.
      </div>
    </div>
  );
}

function ResultTab({ algoMode, nodes, edges, cpmResult, jResult, dijkstraMinResult, dijkstraMaxResult, hResult, kResult, originNode, destNode, jStep, dStep, accentColor }: any) {
  const isCPM      = algoMode === "cpm" || algoMode === "johnson-max";
  const isJohnson  = algoMode === "johnson-min";
  const isDijkstraMin = algoMode === "dijkstra-min";
  const isDijkstraMax = algoMode === "dijkstra-max";
  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";
  const isKruskal  = algoMode === "kruskal";

  if (isCPM && cpmResult) {
    if ("error" in cpmResult && cpmResult.error) return <Err msg="Ciclo detectado — CPM requiere un DAG válido." />;
    if (!cpmResult.error) {
      const res = cpmResult;
      const activeNodes = nodes
        .filter((n: GNode) => edges.some((e: typeof edges[number]) => e.from.id === n.id || e.to.id === n.id))
        .sort((a: GNode, b: GNode) => a.id - b.id);

      return (
        <div style={{ fontFamily: "'Courier New', monospace" }}>
          {activeNodes.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid #e11d48` }}>
                    {(["Actividad", "Predecesor", "Tiempo"] as const).map((h) => (
                      <th key={h} style={{ padding: "13px 8px", color: "#e11d48", fontWeight: "bold", fontSize: 13, textAlign: "center" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeNodes.map((nd: GNode, idx: number) => {
                    const incoming = edges.filter((e: typeof edges[number]) => e.to.id === nd.id);
                    const preds    = incoming.map((e: typeof edges[number]) => e.from.label).join(", ") || "-";
                    const dur      = incoming.length > 0
                      ? incoming[0].weight
                      : (edges.find((e: typeof edges[number]) => e.from.id === nd.id)?.weight || "0");
                       
                    return (
                      <tr key={idx} style={{
                        borderBottom: `1px solid #1a1a1a`,
                        background: idx % 2 === 0 ? "transparent" : "#111",
                      }}>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                          {nd.label}
                        </td>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#888", fontSize: 14 }}>
                          {preds}
                        </td>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#06b6d4", fontWeight: "bold", fontSize: 15 }}>
                          {dur}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <SectionLabel label="RESULTADOS FINALES — PERT/CPM" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Nodo", "TE", "TL", "Holgura", "Crítico"].map((h) => (
                  <th key={h} style={{ padding: "6px 5px", color: P.purpleBright, fontWeight: 400, fontSize: 10, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a: GNode, b: GNode) => a.id - b.id).map((nd: GNode, i: number) => {
                const te = res.TE[nd.id] ?? 0;
                const tl = res.TL[nd.id] === Infinity ? Infinity : (res.TL[nd.id] ?? 0);
                const slack = tl === Infinity ? Infinity : tl - te;
                const crit  = slack === 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #181818", background: crit ? P.redDim : "transparent" }}>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.text, fontWeight: crit ? "bold" : "normal" }}>{nd.label}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: P.cyan }}>{te}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: P.red }}>{tl === Infinity ? "∞" : tl}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.muted, fontWeight: crit ? "bold" : "normal" }}>{slack === Infinity ? "∞" : slack}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.muted, fontSize: 10 }}>{crit ? "●" : "○"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TotalBox label="Duración Total del Proyecto:" value={`${res.maxTE} unidades`} color={P.red} />
        </div>
      );
    }
  }

  if (isJohnson && jResult) {
    if (jResult.error === "no_path") return <Err msg="No existe ruta entre los nodos seleccionados." />;
    if (jResult.error === false) {
      const res = jResult;
      return (
        <div style={{ fontFamily: "'Courier New', monospace" }}>
          <SelectionBadges origin={originNode} dest={destNode} />
          <SectionLabel label="RUTA ÓPTIMA" />
          <PathRow nodes={nodes} pathNodes={res.pathNodes} color={accentColor} />
          <SectionLabel label="DISTANCIAS MÍNIMAS" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Nodo", "Dist. Mínima", "En Ruta"].map((h) => (
                  <th key={h} style={{ padding: "6px 5px", color: P.purpleBright, fontWeight: 400, fontSize: 10, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a: GNode, b: GNode) => a.id - b.id).map((nd: GNode, i: number) => {
                const d = res.dist[nd.id];
                const on = res.pathNodes.includes(nd.id);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #181818", background: on ? P.cyanDim : "transparent" }}>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: on ? P.white : P.text, fontWeight: on ? "bold" : "normal" }}>{nd.label}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: d === Infinity ? P.muted : accentColor }}>{d === Infinity ? "∞" : d}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: on ? accentColor : P.muted, fontSize: 10 }}>{on ? "●" : "○"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TotalBox label="Costo Total Mínimo:" value={`${res.totalCost} unidades`} color={accentColor} />
        </div>
      );
    }
    return <Hint msg={jStep === "origin" ? "Haz clic en el nodo ORIGEN en el grafo." : jStep === "dest" ? "Haz clic en el nodo DESTINO en el grafo." : "Presiona ▶ Resolver."} />;
  }

  if (isDijkstraMin && dijkstraMinResult) {
    if (dijkstraMinResult.error === "no_path") return <Err msg="No existe ruta entre los nodos seleccionados." />;
    if (dijkstraMinResult.error === false) {
      const res = dijkstraMinResult;
      return (
        <div style={{ fontFamily: "'Courier New', monospace" }}>
          <SelectionBadges origin={originNode} dest={destNode} />
          <SectionLabel label="RUTA ÓPTIMA — CAMINO MÍNIMO" />
          <PathRow nodes={nodes} pathNodes={res.pathNodes} color={accentColor} />
          <SectionLabel label="DISTANCIAS MÍNIMAS" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Nodo", "Distancia", "En Ruta"].map((h) => (
                  <th key={h} style={{ padding: "6px 5px", color: P.purpleBright, fontWeight: 400, fontSize: 10, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a: GNode, b: GNode) => a.id - b.id).map((nd: GNode, i: number) => {
                const d = res.dist[nd.id];
                const on = res.pathNodes.includes(nd.id);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #181818", background: on ? `${accentColor}22` : "transparent" }}>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: on ? P.white : P.text, fontWeight: on ? "bold" : "normal" }}>{nd.label}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: d === Infinity ? P.muted : accentColor }}>{d === Infinity ? "∞" : d}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: on ? accentColor : P.muted, fontSize: 10 }}>{on ? "●" : "○"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TotalBox 
            label="Costo Total Mínimo:" 
            value={`${res.totalCost} unidades`} 
            color={accentColor} 
          />
        </div>
      );
    }
    const stepMsg = dStep === "origin" ? "Haz clic en el nodo ORIGEN en el grafo." : dStep === "dest" ? "Haz clic en el nodo DESTINO en el grafo." : "Presiona ▶ Resolver.";
    return <Hint msg={stepMsg} />;
  }

  if (isDijkstraMax && dijkstraMaxResult) {
    if ("error" in dijkstraMaxResult && dijkstraMaxResult.error) return <Err msg="Ciclo detectado — Dijkstra Máximo requiere un DAG válido." />;
    if (!dijkstraMaxResult.error) {
      const res = dijkstraMaxResult;
      const activeNodes = nodes
        .filter((n: GNode) => edges.some((e: typeof edges[number]) => e.from.id === n.id || e.to.id === n.id))
        .sort((a: GNode, b: GNode) => a.id - b.id);

      return (
        <div style={{ fontFamily: "'Courier New', monospace" }}>
          {activeNodes.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid #e11d48` }}>
                    {(["Actividad", "Predecesor", "Tiempo"] as const).map((h) => (
                      <th key={h} style={{ padding: "13px 8px", color: "#e11d48", fontWeight: "bold", fontSize: 13, textAlign: "center" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeNodes.map((nd: GNode, idx: number) => {
                    const incoming = edges.filter((e: typeof edges[number]) => e.to.id === nd.id);
                    const preds    = incoming.map((e: typeof edges[number]) => e.from.label).join(", ") || "-";
                    const dur      = incoming.length > 0
                      ? incoming[0].weight
                      : (edges.find((e: typeof edges[number]) => e.from.id === nd.id)?.weight || "0");
                       
                    return (
                      <tr key={idx} style={{
                        borderBottom: `1px solid #1a1a1a`,
                        background: idx % 2 === 0 ? "transparent" : "#111",
                      }}>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                          {nd.label}
                        </td>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#888", fontSize: 14 }}>
                          {preds}
                        </td>
                        <td style={{ padding: "14px 8px", textAlign: "center", color: "#06b6d4", fontWeight: "bold", fontSize: 15 }}>
                          {dur}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <SectionLabel label="RESULTADOS FINALES — DIJKSTRA MÁXIMO (CPM)" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Nodo", "TE", "TL", "Holgura", "Crítico"].map((h) => (
                  <th key={h} style={{ padding: "6px 5px", color: P.purpleBright, fontWeight: 400, fontSize: 10, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a: GNode, b: GNode) => a.id - b.id).map((nd: GNode, i: number) => {
                const te = res.TE[nd.id] ?? 0;
                const tl = res.TL[nd.id] === Infinity ? Infinity : (res.TL[nd.id] ?? 0);
                const slack = tl === Infinity ? Infinity : tl - te;
                const crit  = slack === 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #181818", background: crit ? P.redDim : "transparent" }}>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.text, fontWeight: crit ? "bold" : "normal" }}>{nd.label}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: P.cyan }}>{te}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: P.red }}>{tl === Infinity ? "∞" : tl}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.muted, fontWeight: crit ? "bold" : "normal" }}>{slack === Infinity ? "∞" : slack}</td>
                    <td style={{ padding: "6px 5px", textAlign: "center", color: crit ? P.red : P.muted, fontSize: 10 }}>{crit ? "●" : "○"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TotalBox label="Duración Total Máxima:" value={`${res.maxTE} unidades`} color={accentColor} />
        </div>
      );
    }
  }

  if (isHungarian && hResult) {
    if (hResult.error === "empty")         return <Err msg="No hay nodos." />;
    if (hResult.error === "no_edges")      return <Err msg="Agrega aristas con pesos." />;
    if (hResult.error === "not_bipartite") return <Err msg="Estructura no bipartita. Dibuja aristas Agente → Tarea." />;
    
    const res = hResult as HungarianResult;
    
    return (
      <div style={{ fontFamily: "'Courier New', monospace" }}>
        <SectionLabel label="MATRIZ DE COSTOS / GANANCIAS" />
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 13, color: P.text }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 16px 8px 4px", color: P.muted, fontSize: 11, textAlign: "left", borderBottom: `1px solid #333` }}>↓ \ →</th>
                {res.taskNodes.map((t: any) => (
                  <th key={t.id} style={{ padding: "8px 20px", color: P.purpleBright, textAlign: "center" }}>{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {res.agentNodes.map((agent: any, r: number) => (
                <tr key={agent.id}>
                  <td style={{ padding: "10px 16px 10px 4px", color: P.purpleBright, fontWeight: "bold", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{agent.label}</td>
                  
                  {res.taskNodes.map((task: any, c: number) => {
                    const isAssigned = res.assignments.some((a: any) => a.agentId === agent.id && a.taskId === task.id);
                    const val  = res.matrix[r]?.[c];
                    const isBig = val === undefined || val >= 1e8;
                    
                    return (
                      <td key={task.id} style={{
                        padding: "10px 20px",
                        textAlign: "center",
                        verticalAlign: "middle",
                        background: isAssigned ? `${accentColor}18` : "transparent",
                        color: isAssigned ? accentColor : (isBig ? "#333" : P.text),
                        border: isAssigned ? `1px solid ${accentColor}44` : "1px solid transparent",
                        fontWeight: isAssigned ? "bold" : "normal",
                      }}>
                        {isBig ? "—" : val}
                        {isAssigned && <span style={{ marginLeft: 6, fontSize: 11 }}>✓</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionLabel label="ASIGNACIÓN ÓPTIMA" />
        {res.assignments.map((a: any, i: number) => (
          <div key={i} style={{ 
            display: "flex", alignItems: "center", padding: "12px 14px", 
            background: "transparent", border: `1px solid #222`, borderRadius: 6, marginBottom: 8 
          }}>
            <span style={{ padding: "4px 10px", borderRadius: 4, background: `${P.purple}18`, border: `1px solid ${P.purple}55`, color: P.purpleBright, fontSize: 13, fontWeight: "bold" }}>
              {a.agentLabel}
            </span>
            
            <span style={{ color: accentColor, margin: "0 12px" }}>→</span>
            
            <span style={{ padding: "4px 10px", borderRadius: 4, background: `${accentColor}18`, border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 13, fontWeight: "bold" }}>
              {a.taskLabel}
            </span>
            
            <span style={{ marginLeft: "auto", color: P.muted, fontSize: 11 }}>
              Costo: <strong style={{ color: accentColor, marginLeft: 6, fontSize: 13 }}>{a.cost}</strong>
            </span>
          </div>
        ))}
        
        <TotalBox
          label="Costo Total Mínimo:"
          value={`${res.totalCost} unidades`}
          color={accentColor}
        />
      </div>
    );
  }

  if (isKruskal && kResult) {
    if ("error" in kResult && kResult.error) {
      const errorMsg = kResult.error === "disconnected_graph" 
        ? "El grafo no está conectado. Todos los nodos deben estar conectados."
        : "Aristas insuficientes para formar un árbol de expansión.";
      return <Err msg={errorMsg} />;
    }
    if (kResult.error === false) {
      const res = kResult;
      return (
        <div style={{ fontFamily: "'Courier New', monospace" }}>
          <SectionLabel label="ARISTAS DEL ÁRBOL MÍNIMO (MST)" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Origen", "Destino", "Peso"].map((h) => (
                  <th key={h} style={{ padding: "6px 5px", color: P.purpleBright, fontWeight: 400, fontSize: 10, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {res.mstEdges.map((edge: GEdge, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #181818", background: i % 2 === 0 ? "transparent" : "#0f0f0f" }}>
                  <td style={{ padding: "6px 5px", textAlign: "center", color: P.cyan }}>{edge.from.label}</td>
                  <td style={{ padding: "6px 5px", textAlign: "center", color: P.cyan }}>{edge.to.label}</td>
                  <td style={{ padding: "6px 5px", textAlign: "center", color: P.yellow, fontWeight: "bold" }}>{edge.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TotalBox label="Peso Total del MST:" value={`${res.totalWeight} unidades`} color={P.yellow} />
          <SectionLabel label="INFORMACIÓN DEL MST" />
          <div style={{ padding: "10px 12px", background: P.yellowDim, border: `1px solid ${P.yellow}44`, borderRadius: 5, fontSize: 11, color: P.text }}>
            <div style={{ marginBottom: 6 }}>✓ Aristas seleccionadas: <strong style={{ color: P.yellow }}>{res.mstEdges.length}</strong></div>
            <div>✓ Nodos conectados: <strong style={{ color: P.yellow }}>{nodes.length}</strong></div>
          </div>
        </div>
      );
    }
  }

  return <Hint msg="Presiona ▶ Resolver para ver los resultados." />;
}

function StepsTab({ algoMode, cpmResult, jResult, dijkstraMinResult, dijkstraMaxResult, hResult, accentColor }: any) {
  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";
  const steps = isHungarian && hResult && !hResult.error ? hResult.steps : null;

  if (!steps || steps.length === 0) {
    return <Hint msg="Los pasos se muestran después de ejecutar el algoritmo." />;
  }

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      {steps.map((step: any, i: number) => (
        <div key={i} style={{ marginBottom: "1.8rem" }}>
          <div style={{ fontSize: 12, color: accentColor, marginBottom: 8, letterSpacing: 1, fontWeight: "bold" }}>
            {i + 1}. {step.description}
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {step.matrix.map((row: number[], r: number) => (
                  <tr key={r}>
                    {row.map((val: number, c: number) => (
                      <td key={c} style={{
                        padding: "8px 14px", 
                        textAlign: "center",
                        border:     `1px solid #333`, 
                        color:      val === 0 ? accentColor : val >= 1e8 ? "#333" : "#aaa",
                        fontWeight: val === 0 ? "bold" : "normal",
                        background: val === 0 ? `${accentColor}18` : "transparent",
                      }}>
                        {val >= 1e8 ? "—" : val < 0 ? `(${Math.abs(val)})` : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConsoleTab({ algoMode, cpmResult, jResult, dijkstraMinResult, dijkstraMaxResult, hResult, kResult, nodes, accentColor }: any) {
  const lines: string[] = [];
  const isCPM      = algoMode === "cpm" || algoMode === "johnson-max";
  const isJohnson  = algoMode === "johnson-min";
  const isDijkstraMin = algoMode === "dijkstra-min";
  const isDijkstraMax = algoMode === "dijkstra-max";
  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";
  const isKruskal  = algoMode === "kruskal";

  if (isCPM && cpmResult && !cpmResult.error) {
    const res = cpmResult;
    lines.push(`[CPM] Modo: ${algoMode}`);
    lines.push(`[CPM] Nodos procesados: ${nodes.length}`);
    lines.push(`[CPM] Duración total: ${res.maxTE}`);
    lines.push(`[CPM] Aristas críticas: ${res.critEdges.size}`);
    lines.push(`[CPM] Orden topológico: ${res.topo.join(" → ")}`);
    [...nodes].sort((a: GNode, b: GNode) => a.id - b.id).forEach((n: GNode) => {
      const te = res.TE[n.id] ?? 0, tl = res.TL[n.id];
      const slack = tl === Infinity ? "∞" : tl - te;
      lines.push(`  Nodo ${n.label}: TE=${te} TL=${tl === Infinity ? "∞" : tl} Holgura=${slack}${slack === 0 ? " [CRÍTICO]" : ""}`);
    });
  } else if (isJohnson && jResult && jResult.error === false) {
    lines.push(`[JOHNSON] Origen → Destino`);
    lines.push(`[JOHNSON] Costo total: ${jResult.totalCost}`);
    lines.push(`[JOHNSON] Ruta: ${jResult.pathNodes.join(" → ")}`);
    lines.push(`[JOHNSON] Aristas en ruta: ${jResult.pathEdges.length}`);
  } else if (isDijkstraMin && dijkstraMinResult && dijkstraMinResult.error === false) {
    lines.push(`[DIJKSTRA MIN] Origen → Destino`);
    lines.push(`[DIJKSTRA MIN] Costo total: ${dijkstraMinResult.totalCost}`);
    lines.push(`[DIJKSTRA MIN] Ruta: ${dijkstraMinResult.pathNodes.join(" → ")}`);
    lines.push(`[DIJKSTRA MIN] Aristas en ruta: ${dijkstraMinResult.pathEdges.length}`);
  } else if (isDijkstraMax && dijkstraMaxResult && !dijkstraMaxResult.error) {
    const res = dijkstraMaxResult;
    lines.push(`[DIJKSTRA MAX] Modo CPM-like`);
    lines.push(`[DIJKSTRA MAX] Nodos procesados: ${nodes.length}`);
    lines.push(`[DIJKSTRA MAX] Duración máxima: ${res.maxTE}`);
    lines.push(`[DIJKSTRA MAX] Aristas críticas: ${res.critEdges.size}`);
    lines.push(`[DIJKSTRA MAX] Orden topológico: ${res.topo.join(" → ")}`);
    [...nodes].sort((a: GNode, b: GNode) => a.id - b.id).forEach((n: GNode) => {
      const te = res.TE[n.id] ?? 0, tl = res.TL[n.id];
      const slack = tl === Infinity ? "∞" : tl - te;
      lines.push(`  Nodo ${n.label}: TE=${te} TL=${tl === Infinity ? "∞" : tl} Holgura=${slack}${slack === 0 ? " [CRÍTICO]" : ""}`);
    });
  } else if (isHungarian && hResult && !hResult.error) {
    const res = hResult as HungarianResult;
    lines.push(`[HUNGARIAN] Modo: ${algoMode === "hungarian-min" ? "Minimizar" : "Maximizar"}`);
    lines.push(`[HUNGARIAN] Agentes: ${res.agentNodes.length} | Tareas: ${res.taskNodes.length}`);
    lines.push(`[HUNGARIAN] Total: ${res.totalCost}`);
    res.assignments.forEach((a) => {
      lines.push(`  ${a.agentLabel} → ${a.taskLabel}  (${a.cost})`);
    });
  } else if (isKruskal && kResult && kResult.error === false) {
    lines.push(`[KRUSKAL] Árbol de Expansión Mínima (MST)`);
    lines.push(`[KRUSKAL] Nodos: ${nodes.length}`);
    lines.push(`[KRUSKAL] Aristas en MST: ${kResult.mstEdges.length}`);
    lines.push(`[KRUSKAL] Peso total: ${kResult.totalWeight}`);
    lines.push(`[KRUSKAL] Aristas seleccionadas:`);
    kResult.mstEdges.forEach((edge: GEdge) => {
      lines.push(`  ${edge.from.label} → ${edge.to.label}  (peso: ${edge.weight})`);
    });
  } else {
    lines.push("[INFO] Sin resultados disponibles.");
    lines.push("[INFO] Ejecuta el algoritmo para ver la salida.");
  }

  return (
    <div style={{
      background:   "#060606",
      border:       `1px solid ${P.border}`,
      borderRadius: 6,
      padding:      "12px 14px",
      fontFamily:   "'Courier New', monospace",
      fontSize:     11,
      lineHeight:   1.9,
      color:        P.muted,
      minHeight:    200,
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.startsWith("[") ? accentColor : P.muted }}>{l}</div>
      ))}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8, marginTop: 14 }}>{label}</div>;
}
function TotalBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ marginTop: 12, padding: "9px 12px", background: `${color}18`, borderRadius: 5, border: `1px solid ${color}44`, display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'Courier New', monospace" }}>
      <span style={{ color: P.muted }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}
function Hint({ msg }: { msg: string }) {
  return <div style={{ color: P.muted, fontSize: 11, textAlign: "center", marginTop: "2rem", fontFamily: "'Courier New', monospace", lineHeight: 1.8 }}>{msg}</div>;
}
function Err({ msg }: { msg: string }) {
  return <div style={{ color: P.red, fontSize: 11, textAlign: "center", marginTop: "2rem", fontFamily: "'Courier New', monospace", lineHeight: 1.8 }}>⚠ {msg}</div>;
}
function SelectionBadges({ origin, dest }: { origin: GNode | null; dest: GNode | null }) {
  if (!origin && !dest) return null;
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {origin && <div style={{ flex: 1, padding: "6px 10px", background: P.greenDim, border: `1px solid ${P.green}44`, borderRadius: 4, fontSize: 11, fontFamily: "'Courier New', monospace" }}><span style={{ color: P.muted }}>Origen: </span><strong style={{ color: P.green }}>{origin.label}</strong></div>}
      {dest   && <div style={{ flex: 1, padding: "6px 10px", background: P.redDim,   border: `1px solid ${P.red}44`,   borderRadius: 4, fontSize: 11, fontFamily: "'Courier New', monospace" }}><span style={{ color: P.muted }}>Destino: </span><strong style={{ color: P.red }}>{dest.label}</strong></div>}
    </div>
  );
}
function PathRow({ nodes, pathNodes, color }: { nodes: GNode[]; pathNodes: number[]; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 14, padding: "10px 12px", background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 5, fontFamily: "'Courier New', monospace" }}>
      {pathNodes.map((nid, i) => {
        const nd = nodes.find((n: GNode) => n.id === nid);
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ padding: "2px 8px", background: "#1a1a1a", border: `1px solid ${color}`, borderRadius: 3, color: P.white, fontSize: 12, fontWeight: "bold" }}>{nd?.label}</span>
            {i < pathNodes.length - 1 && <span style={{ color }}> → </span>}
          </span>
        );
      })}
    </div>
  );
}