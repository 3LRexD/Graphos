"use client";
import type { GNode, GEdge, CPMOutput, JohnsonOutput } from "@/types";
import type { HungarianOutput } from "@/algorithms/hungarian";
import { P } from "@/components/canvas/palette";
import ActivityTable  from "@/components/panels/ActivityTable";
import JohnsonTable   from "@/components/panels/JohnsonTable";
import MatrixTable    from "@/components/panels/MatrixTable";
import HungarianTable from "@/components/panels/Hungariantable";

type PanelTab = "activity" | "matrix";

interface Props {
  open:        boolean;
  tab:         PanelTab;
  algoMode:    string;
  nodes:       GNode[];
  edges:       GEdge[];
  cpmResult:   CPMOutput;
  jResult:     JohnsonOutput;
  hResult:     HungarianOutput;
  originNode:  GNode | null;
  destNode:    GNode | null;
  jStep:       "origin" | "dest" | "done";
  onTabChange: (t: PanelTab) => void;
  onClose:     () => void;
}

export default function SidePanel({
  open, tab, algoMode,
  nodes, edges,
  cpmResult, jResult, hResult,
  originNode, destNode, jStep,
  onTabChange, onClose,
}: Props) {
  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";

  const title =
    algoMode === "cpm"          ? "Tabla de Proyecto (PERT/CPM)"  :
    algoMode === "johnson"      ? "Resultados — Johnson"           :
    algoMode === "hungarian-min"? "Asignación Mínima — Húngaro"   :
    algoMode === "hungarian-max"? "Asignación Máxima — Húngaro"   :
    "Análisis del Grafo";

  const tabLabel = (t: PanelTab) =>
    t === "activity"
      ? isHungarian         ? "Asignación"
        : algoMode === "johnson" ? "Ruta"
        : "Actividades"
      : "Matriz";

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.35)" }}
        />
      )}

      <div style={{
        position:      "absolute",
        top:           0,
        right:         open ? 0 : -540,
        width:         510,
        height:        "100%",
        background:    P.surface,
        borderLeft:    `1px solid ${P.border}`,
        transition:    "right 0.26s cubic-bezier(0.4,0,0.2,1)",
        zIndex:        50,
        display:       "flex",
        flexDirection: "column",
        boxShadow:     open ? "-8px 0 30px rgba(0,0,0,0.8)" : "none",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${P.border}`, gap: 8 }}>
          <span style={{ color: P.text, fontSize: "0.85rem", fontWeight: 300, letterSpacing: 1 }}>
            {title}
          </span>

          {(["activity", "matrix"] as PanelTab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              style={{
                marginLeft:    t === "activity" ? "auto" : 0,
                padding:       "4px 11px",
                background:    tab === t ? P.purpleDim : "transparent",
                color:         tab === t ? P.purple    : P.muted,
                border:        `1px solid ${tab === t ? P.purple : "transparent"}`,
                borderRadius:  4,
                fontSize:      10,
                letterSpacing: 1,
                cursor:        "pointer",
                fontFamily:    "inherit",
                textTransform: "uppercase" as const,
              }}
            >
              {tabLabel(t)}
            </button>
          ))}

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", marginLeft: 4, fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {tab === "matrix" ? (
            <MatrixTable nodes={nodes} edges={edges} />
          ) : isHungarian ? (
            <HungarianTable result={hResult} algoMode={algoMode} />
          ) : algoMode === "johnson" ? (
            <JohnsonTable
              nodes={nodes}
              originNode={originNode}
              destNode={destNode}
              jStep={jStep}
              jResult={jResult}
            />
          ) : (
            <ActivityTable nodes={nodes} edges={edges} cpmResult={cpmResult} />
          )}
        </div>
      </div>
    </>
  );
}