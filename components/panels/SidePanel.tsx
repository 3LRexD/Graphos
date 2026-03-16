"use client";
import { useState, useRef, useEffect } from "react";
import type { GNode, GEdge, CPMOutput, JohnsonOutput } from "../../types";
import { P } from "../canvas/palette";
import ActivityTable from "./ActivityTable";
import JohnsonTable  from "./JohnsonTable";

interface Props {
  open:       boolean;
  algoMode:   string;
  nodes:      GNode[];
  edges:      GEdge[];
  cpmResult:  CPMOutput;
  jResult:    JohnsonOutput;
  originNode: GNode | null;
  destNode:   GNode | null;
  jStep:      "origin" | "dest" | "done";
  onClose:    () => void;
  onAlgoSelect: (id: string) => void;
  onSolve:      () => void;
  isAnimating:  boolean;
}

const sectionTitle: React.CSSProperties = { fontSize: 10, fontWeight: "bold", letterSpacing: 1.5, color: "#777", marginBottom: 10, marginTop: 24 };
const cardStyle: React.CSSProperties = { background: "#161616", border: "1px solid #222", borderRadius: "10px", padding: "16px", marginBottom: 16 };

export default function SidePanel({
  open, algoMode, nodes, edges, cpmResult, jResult,
  originNode, destNode, jStep, onClose,
  onAlgoSelect, onSolve, isAnimating
}: Props) {
  
  const [panelWidth, setPanelWidth] = useState(380);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'ew-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getConsoleLogs = () => {
    if (algoMode === "none") return <span style={{color: "#555"}}>{">"} Selecciona un algoritmo para comenzar.</span>;
    if (isAnimating) return <><span style={{color: P.purple}}>{">"} Ejecutando algoritmo...</span><br/><span style={{color: "#555"}}>{">"} Por favor espere.</span></>;
    if (algoMode === "cpm" && cpmResult && cpmResult.error === false) return <><span style={{color: P.green}}>{">"} CPM completado con éxito.</span><br/><span style={{color: P.cyan}}>{">"} Duración total: {cpmResult.maxTE}</span></>;
    if (algoMode === "johnson" && jResult && jResult.error === false) return <><span style={{color: P.green}}>{">"} Johnson completado.</span><br/><span style={{color: P.cyan}}>{">"} Costo óptimo: {jResult.totalCost}</span></>;
    return <><span style={{color: P.green}}>{">"} Listo para ejecutar...</span><br/><span style={{color: "#555"}}>{">"} Esperando inicio de ejecución.</span></>;
  };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 40, background: "transparent" }} />}

      <div style={{
        position: "absolute", top: 0, right: open ? 0 : -panelWidth,
        width: panelWidth, height: "100%", background: "#0a0a0a", borderLeft: "1px solid #1a1a1a",
        transition: isDragging.current ? "none" : "right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        zIndex: 50, display: "flex", flexDirection: "column",
        boxShadow: open ? "-10px 0 40px rgba(0,0,0,0.8)" : "none", fontFamily: "'Courier New', monospace"
      }}>
        
        <div onMouseDown={handleMouseDown} style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 6, cursor: "ew-resize", zIndex: 60 }} />

        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #1a1a1a", gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>Panel de Algoritmos</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginLeft: "auto", fontSize: 18 }}>›</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px 24px" }}>
          
          <div style={sectionTitle}>ALGORITMO</div>
          <select value={algoMode} onChange={(e) => onAlgoSelect(e.target.value)} style={{ width: "100%", padding: "12px", background: "#161616", color: "#FFF", border: "1px solid #222", borderRadius: "8px", outline: "none", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
            <option value="none">- Pizarra de Grafos -</option>
            <option value="cpm">CPM / PERT (Ruta Crítica)</option>
            <option value="johnson">Dijkstra / Johnson (Camino Más Corto)</option>
          </select>

          {algoMode !== "none" && (
            <>
              <div style={{...cardStyle, marginTop: 24}}>
                <h4 style={{ color: "#FFF", margin: "0 0 16px 0", fontSize: 14 }}>Parámetros</h4>
                {algoMode === "johnson" && (
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}><label style={{ display: "block", color: "#888", fontSize: 10, marginBottom: 6 }}>Nodo Origen</label><div style={{ padding: "8px 12px", background: "#0a0a0a", border: "1px solid #222", borderRadius: "6px", color: originNode ? P.green : "#555", fontSize: 12 }}>{originNode ? originNode.label : "Clic..."}</div></div>
                    <div style={{ flex: 1 }}><label style={{ display: "block", color: "#888", fontSize: 10, marginBottom: 6 }}>Nodo Destino</label><div style={{ padding: "8px 12px", background: "#0a0a0a", border: "1px solid #222", borderRadius: "6px", color: destNode ? P.red : "#555", fontSize: 12 }}>{destNode ? destNode.label : "Clic..."}</div></div>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", color: "#888", fontSize: 10, marginBottom: 8 }}>Velocidad de Animación</label>
                  <div style={{ display: "flex", gap: 4 }}><div style={{ height: 4, flex: 1, background: "#FFF", borderRadius: 2 }}></div><div style={{ height: 4, flex: 1, background: "#333", borderRadius: 2 }}></div><div style={{ height: 4, flex: 1, background: "#333", borderRadius: 2 }}></div></div>
                </div>
              </div>

              <div style={sectionTitle}>EJECUCIÓN</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onSolve} disabled={isAnimating} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: P.purple, color: "#FFF", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", opacity: isAnimating ? 0.7 : 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>{isAnimating ? "Ejecutando..." : "Ejecutar"}
                </button>
                <button title="Paso a paso (Próximamente)" disabled style={{ width: 44, background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#555", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                </button>
              </div>
            </>
          )}

          <div style={sectionTitle}>RESULTADOS (CONSOLA)</div>
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "16px", color: "#444", fontSize: 12, lineHeight: 1.6, minHeight: 80 }}>
            {getConsoleLogs()}
          </div>

          {algoMode !== "none" && (
            <div style={{ marginTop: 24, borderTop: "1px solid #222", paddingTop: 24, paddingBottom: 40 }}>
              {algoMode === "johnson" && jResult && jResult.error === false ? (
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <JohnsonTable nodes={nodes} originNode={originNode} destNode={destNode} jStep={jStep} jResult={jResult} />
                </div>
              ) : algoMode === "cpm" && cpmResult && cpmResult.error === false ? (
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <ActivityTable nodes={nodes} edges={edges} cpmResult={cpmResult} />
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </>
  );
}