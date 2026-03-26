"use client";
import { useRef, useEffect, useState, useCallback } from "react";

import type { GNode, GEdge, ToolMode, AlgoMode, PromptCfg } from "@/types";
import { computeCPM, computeJohnson, wouldCycle, computeHungarian } from "@/algorithms";
import type { CPMOutput, JohnsonOutput } from "@/types";
import type { HungarianOutput } from "@/algorithms/hungarian";
import { useToast, useAnimation, useGraphState } from "@/hooks";
import { P }                      from "@/components/canvas/palette";
import { BG_PRESETS }             from "@/components/canvas/backgrounds";
import { drawNode, NODE_R }       from "@/components/canvas/drawNode";
import { drawEdge, edgeMidpoint } from "@/components/canvas/drawEdge";
import TopToolbar           from "@/components/toolbar/TopToolbar";
import BottomToolbar        from "@/components/toolbar/BottomToolbar";
import SidePanel            from "@/components/panels/SidePanel";
import PromptModal          from "@/components/modals/PromptModal";
import GuideModal           from "@/components/modals/GuideModal";
import BgModal              from "@/components/modals/BgModal";
import AlgoSelector         from "@/components/toolbar/AlgoSelector";
import HungarianMatrixEditor from "@/components/modals/Hungarianmatrixeditor";

export default function GraphEditor() {
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [mode,             setMode]             = useState<ToolMode>("add");
  const [algoMode,         setAlgoMode]         = useState<AlgoMode>("none");
  const [panelOpen,        setPanelOpen]        = useState(false);
  const [panelTab,         setPanelTab]         = useState<"activity" | "matrix">("activity");
  const [showAlgoModal,    setShowAlgoModal]    = useState(false);
  const [showGuide,        setShowGuide]        = useState(false);
  const [showBgModal,      setShowBgModal]      = useState(false);
  const [showMatrixEditor, setShowMatrixEditor] = useState(false);
  const [bgPreset,         setBgPreset]         = useState("dark");
  const [bgImage,          setBgImage]          = useState<string | null>(null);

  // ── Johnson flow ───────────────────────────────────────────────────────────
  const [jOrigin, setJOrigin] = useState<GNode | null>(null);
  const [jDest,   setJDest]   = useState<GNode | null>(null);
  const [jStep,   setJStep]   = useState<"origin" | "dest" | "done">("origin");

  // ── Algorithm results ──────────────────────────────────────────────────────
  const [cpmResult, setCpmResult] = useState<CPMOutput>(null);
  const [jResult,   setJResult]   = useState<JohnsonOutput>(null);
  const [hResult,   setHResult]   = useState<HungarianOutput>(null);

  // ── Prompt modal ───────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState<PromptCfg>({
    open: false, title: "", value: "", placeholder: "", error: "", onOk: null, onCancel: null,
  });

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { toast, showToast }                                                   = useToast();
  const { animEdges, animNodes, isAnimating, animateCPM, animateJohnson, resetAnim } = useAnimation();
  const { graph, clearGraph }                                                  = useGraphState();

  // ── Mutable refs for canvas closures ──────────────────────────────────────
  const modeRef      = useRef<ToolMode>("add");
  const algoModeRef  = useRef<AlgoMode>("none");
  const jOriginRef   = useRef<GNode | null>(null);
  const jDestRef     = useRef<GNode | null>(null);
  const jStepRef     = useRef<"origin" | "dest" | "done">("origin");
  const cpmRef       = useRef<CPMOutput>(null);
  const jRef         = useRef<JohnsonOutput>(null);
  const animEdgesRef = useRef(animEdges);
  const animNodesRef = useRef(animNodes);
  const bgPresetRef  = useRef("dark");
  const bgImageRef   = useRef<string | null>(null);

  useEffect(() => { modeRef.current      = mode;      }, [mode]);
  useEffect(() => { algoModeRef.current  = algoMode;  }, [algoMode]);
  useEffect(() => { jOriginRef.current   = jOrigin;   }, [jOrigin]);
  useEffect(() => { jDestRef.current     = jDest;     }, [jDest]);
  useEffect(() => { jStepRef.current     = jStep;     }, [jStep]);
  useEffect(() => { cpmRef.current       = cpmResult; }, [cpmResult]);
  useEffect(() => { jRef.current         = jResult;   }, [jResult]);
  useEffect(() => { animEdgesRef.current = animEdges; }, [animEdges]);
  useEffect(() => { animNodesRef.current = animNodes; }, [animNodes]);
  useEffect(() => { bgPresetRef.current  = bgPreset;  }, [bgPreset]);
  useEffect(() => { bgImageRef.current   = bgImage;   }, [bgImage]);

  // ── Background draw ────────────────────────────────────────────────────────
  const drawBg = useCallback(() => {
    const c = bgCanvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const bi = bgImageRef.current;
    if (bi) {
      const img = new Image(); img.src = bi;
      const doIt = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      if (img.complete) doIt(); else img.onload = doIt;
    } else {
      (BG_PRESETS.find((p) => p.id === bgPresetRef.current) || BG_PRESETS[0]).draw(ctx, c.width, c.height);
    }
  }, []);

  // ── Main canvas draw ───────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d"); if (!ctx) return;
    const data   = graph.current;
    const am     = algoModeRef.current;
    const cpm    = cpmRef.current;
    const jd     = jRef.current;
    const aE     = animEdgesRef.current;
    const aN     = animNodesRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Edges
    data.edges.forEach((edge) => {
      const isAnim  = aE.has(edge);
      const isCrit  = am === "cpm"     && cpm && !cpm.error && cpm.critEdges.has(edge);
      const isJPath = am === "johnson" && jd  && jd.error === false && jd.pathEdges.includes(edge);
      let color = "#3a3a3a", lw = 1.5;
      if (isAnim)       { color = am === "cpm" ? P.red : P.cyan; lw = 3.5; }
      else if (isCrit)  { color = P.red;  lw = 2.5; }
      else if (isJPath) { color = P.cyan; lw = 2.5; }
      drawEdge(ctx, edge, color, lw, isAnim ? color : undefined);
    });

    // Temp connection line
    if (modeRef.current === "connect" && data.tempStartNode) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(data.tempStartNode.x, data.tempStartNode.y);
      ctx.lineTo(data.mouseX, data.mouseY);
      ctx.strokeStyle = P.purple; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }

    // Nodes
    data.nodes.forEach((node) => {
      const isAnim  = aN.has(node.id);
      const isCritN = !!(am === "cpm"     && cpm && !cpm.error && aE.size > 0 && [...cpm.critEdges].some((e) => e.from.id === node.id || e.to.id === node.id));
      const isJN    = !!(am === "johnson" && jd  && jd.error === false && aE.size > 0 && jd.pathNodes.includes(node.id));
      drawNode(ctx, node, {
        selected:      node === data.selectedNode,
        tempStart:     node === data.tempStartNode,
        cpmData:       am !== "none" && cpm && !cpm.error ? cpm : null,
        algoMode:      am,
        animHighlight: isAnim || isCritN || isJN,
        animColor:     am === "cpm" ? P.red : P.cyan,
        originNode:    jOriginRef.current,
        destNode:      jDestRef.current,
      });
    });

    // Cycle error
    if (am !== "none" && cpm && "error" in cpm && cpm.error) {
      ctx.fillStyle = P.red; ctx.font = "13px 'Courier New', monospace"; ctx.textAlign = "left";
      ctx.fillText("⚠ Ciclo detectado — El grafo debe ser un DAG válido.", 20, 60);
    }

    // Legends
    if (am === "cpm") {
      ctx.font = "10px 'Courier New', monospace"; ctx.textAlign = "left";
      ctx.fillStyle = P.cyan; ctx.fillText("TE (temprano)", 14, canvas.height - 30);
      ctx.fillStyle = P.red;  ctx.fillText("TL (tardío)",   14, canvas.height - 16);
    }
    if (am === "hungarian-min" || am === "hungarian-max") {
      ctx.font = "10px 'Courier New', monospace"; ctx.textAlign = "left";
      ctx.fillStyle = am === "hungarian-min" ? P.cyan : P.green;
      ctx.fillText("Agentes → origen de aristas   Tareas → destino de aristas", 14, canvas.height - 16);
    }
  }, [graph]);

  // ── Canvas events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas   = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;
    const data = graph.current;

    const getNode = (x: number, y: number) => {
      for (let i = data.nodes.length - 1; i >= 0; i--)
        if (Math.hypot(x - data.nodes[i].x, y - data.nodes[i].y) <= NODE_R) return data.nodes[i];
      return null;
    };
    const getEdge = (x: number, y: number): GEdge | null => {
      for (let i = data.edges.length - 1; i >= 0; i--) {
        const mp = edgeMidpoint(data.edges[i]);
        if (Math.hypot(x - mp.x, y - mp.y) <= 16) return data.edges[i];
      }
      return null;
    };

    const resize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      canvas.width = w; canvas.height = h;
      bgCanvas.width = w; bgCanvas.height = h;
      drawBg(); draw();
    };

    const onDown = (e: MouseEvent) => {
      const r  = canvas.getBoundingClientRect();
      const x  = e.clientX - r.left, y = e.clientY - r.top;
      const cn = getNode(x, y);
      const ce = !cn ? getEdge(x, y) : null;
      const am = algoModeRef.current;

      if (am === "johnson" && cn && modeRef.current !== "delete" && modeRef.current !== "edit") {
        const step = jStepRef.current;
        if (step === "origin") { setJOrigin(cn); setJStep("dest"); draw(); return; }
        if (step === "dest" && cn.id !== jOriginRef.current?.id) { setJDest(cn); setJStep("done"); draw(); return; }
      }

      switch (modeRef.current) {
        case "add":
          if (!cn) { const id = data.nodeIdCounter++; data.nodes.push({ id, x, y, label: `${id}` }); }
          break;
        case "move":
          if (cn) { data.selectedNode = cn; data.isDragging = true; }
          break;
        case "connect":
          if (cn) data.tempStartNode = cn;
          break;
        case "edit":
          if (cn) {
            setPrompt({ open: true, title: "Renombrar Nodo", value: cn.label, placeholder: "Ej: A, q1", error: "",
              onOk:     (v) => { cn.label = v.slice(0, 5); setPrompt((p) => ({ ...p, open: false })); draw(); },
              onCancel: ()  => setPrompt((p) => ({ ...p, open: false })),
            });
          } else if (ce) {
            setPrompt({ open: true, title: "Peso / Duración", value: ce.weight, placeholder: "Solo números", error: "",
              onOk: (v) => {
                if (isNaN(Number(v)) || !v.trim()) { setPrompt((p) => ({ ...p, error: "Solo valores numéricos." })); return; }
                ce.weight = v.trim(); setPrompt((p) => ({ ...p, open: false })); draw();
              },
              onCancel: () => setPrompt((p) => ({ ...p, open: false })),
            });
          }
          break;
        case "delete":
          if (cn) { data.nodes = data.nodes.filter((n) => n !== cn); data.edges = data.edges.filter((e) => e.from !== cn && e.to !== cn); }
          else if (ce) data.edges = data.edges.filter((e) => e !== ce);
          break;
      }
      draw();
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      data.mouseX = e.clientX - r.left;
      data.mouseY = e.clientY - r.top;
      if (modeRef.current === "move" && data.isDragging && data.selectedNode) {
        data.selectedNode.x = data.mouseX;
        data.selectedNode.y = data.mouseY;
      }
      draw();
    };

    const onUp = () => {
      if (modeRef.current === "move") {
        data.isDragging = false; data.selectedNode = null;
      } else if (modeRef.current === "connect" && data.tempStartNode) {
        const target = getNode(data.mouseX, data.mouseY);
        if (target && target.id !== data.tempStartNode.id) {
          if (wouldCycle(data.nodes, data.edges, data.tempStartNode.id, target.id)) {
            showToast("⚠ Esta conexión crearía un ciclo. Los ciclos no están permitidos.");
            data.tempStartNode = null; draw(); return;
          }
          if (!data.edges.some((e) => e.from === data.tempStartNode && e.to === target)) {
            const from = data.tempStartNode, to = target;
            setPrompt({ open: true, title: "Peso de la Conexión", value: "1", placeholder: "Solo números", error: "",
              onOk: (v) => {
                if (isNaN(Number(v)) || !v.trim()) { setPrompt((p) => ({ ...p, error: "Solo valores numéricos." })); return; }
                data.edges.push({ from, to, weight: v.trim() });
                setPrompt((p) => ({ ...p, open: false })); draw();
              },
              onCancel: () => { setPrompt((p) => ({ ...p, open: false })); draw(); },
            });
          }
        }
        data.tempStartNode = null; draw();
      }
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup",   onUp);
    setTimeout(resize, 50);
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup",   onUp);
    };
  }, [draw, drawBg, graph, showToast]);

  useEffect(() => { window.dispatchEvent(new Event("resize")); }, [algoMode, bgPreset, bgImage]);
  useEffect(() => { draw(); }, [animNodes, animEdges, cpmResult, jResult, jOrigin, jDest, draw]);

  // ── Solve ──────────────────────────────────────────────────────────────────
  const solve = () => {
    const { nodes, edges } = graph.current;
    if (nodes.length < 2) { showToast("⚠ Agrega al menos 2 nodos antes de resolver."); return; }

    if (algoMode === "cpm") {
      if (edges.some((e) => !e.weight || isNaN(Number(e.weight)))) { showToast("⚠ Algunas aristas no tienen peso. Usa modo Editar."); return; }
      const res = computeCPM(nodes, edges);
      if (!res) { showToast("⚠ Sin datos para calcular."); return; }
      if (res.error) { showToast("⚠ Ciclo detectado. CPM requiere un DAG válido."); return; }
      setCpmResult(res); setPanelOpen(true); setPanelTab("activity");
      animateCPM(res);

    } else if (algoMode === "johnson") {
      if (!jOrigin || !jDest) { showToast("⚠ Selecciona nodo origen y destino para Johnson."); return; }
      if (edges.some((e) => !e.weight || isNaN(Number(e.weight)))) { showToast("⚠ Algunas aristas no tienen peso. Usa modo Editar."); return; }
      const res = computeJohnson(nodes, edges, jOrigin.id, jDest.id);
      if (!res) { showToast("⚠ Sin datos para calcular."); return; }
      if (res.error === "no_path") { showToast(`⚠ No existe ruta de "${jOrigin.label}" a "${jDest.label}".`); return; }
      setJResult(res); setPanelOpen(true); setPanelTab("activity");
      animateJohnson(res);

    } else if (algoMode === "hungarian-min" || algoMode === "hungarian-max") {
      if (edges.some((e) => !e.weight || isNaN(Number(e.weight)))) { showToast("⚠ Algunas aristas no tienen peso. Usa modo Editar."); return; }
      const res = computeHungarian(nodes, edges, algoMode === "hungarian-min" ? "min" : "max");
      if (!res) { showToast("⚠ Sin datos para calcular."); return; }
      if (res.error === "not_bipartite") { showToast("⚠ El grafo debe ser bipartito.\nDibuja aristas solo de Agentes → Tareas."); return; }
      if (res.error === "no_edges")      { showToast("⚠ Agrega aristas con pesos entre agentes y tareas."); return; }
      setHResult(res); setPanelOpen(true); setPanelTab("activity");
    }
  };

  // ── Matrix editor apply ────────────────────────────────────────────────────
  const onMatrixApply = (agentLabels: string[], taskLabels: string[], mat: number[][]) => {
    let id = 1;
    const agentNodes: GNode[] = agentLabels.map((label) => ({ id: id++, x: 0, y: 0, label }));
    const taskNodes:  GNode[] = taskLabels.map((label)  => ({ id: id++, x: 0, y: 0, label }));
    const nodes = [...agentNodes, ...taskNodes];
    const edges: GEdge[] = [];
    mat.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val !== 0) edges.push({ from: agentNodes[r], to: taskNodes[c], weight: String(val) });
      })
    );
    const hunMode = algoMode === "hungarian-min" ? "min" : "max";
    const res = computeHungarian(nodes, edges, hunMode);
    setHResult(res);
    setPanelOpen(true);
    setPanelTab("activity");
    setShowMatrixEditor(false);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearAll = () => {
    if (!confirm("¿Limpiar todo el lienzo?")) return;
    clearGraph();
    setAlgoMode("none"); setCpmResult(null); setJResult(null); setHResult(null);
    setJOrigin(null); setJDest(null); setJStep("origin");
    resetAnim(); setPanelOpen(false);
    window.dispatchEvent(new Event("resize"));
  };

  const clearAlgo = () => {
    setAlgoMode("none"); setCpmResult(null); setJResult(null); setHResult(null);
    setJOrigin(null); setJDest(null); setJStep("origin");
    resetAnim(); setPanelOpen(false);
  };

  const selectAlgo = (id: string) => {
    setAlgoMode(id as AlgoMode);
    setHResult(null);
    if (id === "johnson") { setJOrigin(null); setJDest(null); setJStep("origin"); setJResult(null); }
    resetAnim();
  };

  const togglePanel = (tab: "activity" | "matrix") => {
    if (panelTab === tab) { setPanelOpen((o) => !o); }
    else { setPanelTab(tab); setPanelOpen(true); }
  };

  const exportJSON = () => {
    setPrompt({ open: true, title: "Guardar Grafo", value: "mi-grafo", placeholder: "Nombre del archivo", error: "",
      onOk: (name) => {
        if (!name.trim()) { setPrompt((p) => ({ ...p, error: "Ingresa un nombre." })); return; }
        const d   = graph.current;
        const obj = { nodes: d.nodes, edges: d.edges.map((e) => ({ from: e.from.id, to: e.to.id, weight: e.weight })), nodeIdCounter: d.nodeIdCounter };
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = name.endsWith(".json") ? name : `${name}.json`; a.click();
        setPrompt((p) => ({ ...p, open: false }));
      },
      onCancel: () => setPrompt((p) => ({ ...p, open: false })),
    });
  };

  const exportImage = (type: "jpg" | "pdf") => {
    const fg = canvasRef.current, bg = bgCanvasRef.current; if (!fg || !bg) return;
    const tmp = document.createElement("canvas"); tmp.width = fg.width; tmp.height = fg.height;
    const tc  = tmp.getContext("2d")!; tc.drawImage(bg, 0, 0); tc.drawImage(fg, 0, 0);
    const url = tmp.toDataURL("image/jpeg", 0.95);
    if (type === "jpg") { const a = document.createElement("a"); a.href = url; a.download = "grafo.jpg"; a.click(); }
    else {
      const w = window.open("", "_blank"); if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>Grafo</title><style>*{margin:0;padding:0;}body{background:#000;}img{width:100%;}@media print{img{width:100%;}}</style></head><body><img src="${url}" onload="window.print();window.close();"/></body></html>`);
      w.document.close();
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target?.result as string);
        if (p.nodes && p.edges) {
          const ns = p.nodes;
          const es = p.edges.map((e: any) => ({ from: ns.find((n: any) => n.id === e.from), to: ns.find((n: any) => n.id === e.to), weight: e.weight })).filter((e: any) => e.from && e.to);
          graph.current.nodes = ns; graph.current.edges = es; graph.current.nodeIdCounter = p.nodeIdCounter || 1;
          window.dispatchEvent(new Event("resize"));
        } else alert("Formato inválido.");
      } catch { alert("Error al leer el archivo."); }
    };
    r.readAsText(f); e.target.value = "";
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { setBgImage(ev.target?.result as string); setBgPreset(""); setShowBgModal(false); };
    r.readAsDataURL(f);
  };

  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";
  const hungarianColor = algoMode === "hungarian-min" ? P.cyan : P.green;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)", overflow: "hidden", fontFamily: "'Courier New', monospace", background: P.bg }}>

      <canvas ref={bgCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <canvas ref={canvasRef}   style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: mode === "add" ? "crosshair" : mode === "delete" ? "not-allowed" : "default" }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", background: "rgba(255,0,85,0.12)", border: `1px solid ${P.red}`, borderRadius: 6, padding: "10px 20px", color: P.red, fontSize: 12, zIndex: 90, backdropFilter: "blur(10px)", maxWidth: "88%", textAlign: "center", whiteSpace: "pre-line" }}>
          {toast}
        </div>
      )}

      {/* Hungarian matrix editor button */}
      {isHungarian && (
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
          <button
            onClick={() => setShowMatrixEditor(true)}
            style={{ background: "rgba(8,8,8,0.92)", border: `1px solid ${hungarianColor}`, borderRadius: 6, padding: "7px 16px", color: hungarianColor, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace", backdropFilter: "blur(10px)" }}
          >
            ⊞ Editar Matriz
          </button>
        </div>
      )}

      {/* Johnson step hint */}
      {algoMode === "johnson" && jStep !== "done" && (
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(8,8,8,0.92)", border: `1px solid ${jStep === "origin" ? P.green : P.red}`, borderRadius: 6, padding: "7px 18px", color: jStep === "origin" ? P.green : P.red, fontSize: 11, zIndex: 30, backdropFilter: "blur(10px)", whiteSpace: "nowrap" }}>
          {jStep === "origin" ? "👆 Haz clic en el nodo ORIGEN" : "👆 Haz clic en el nodo DESTINO"}
        </div>
      )}

      <TopToolbar
        onImport={handleImport}
        onExportJSON={exportJSON}
        onExportImage={exportImage}
        onOpenBg={() => setShowBgModal(true)}
        onOpenGuide={() => setShowGuide(true)}
        // Props movidas aquí:
        algoMode={algoMode}
        isAnimating={isAnimating}
        onOpenAlgo={() => setShowAlgoModal(true)}
        onSolve={solve}
      />

      <BottomToolbar
        mode={mode}
        onMode={setMode}
        onClear={clearAll}
        // Pasamos el estado del panel como indicador de si la matriz está abierta
        isMatrixOpen={panelOpen && panelTab === "matrix"}
        // Pasamos la función que alterna (toggle) específicamente a la pestaña de la matriz
        onToggleMatrix={() => togglePanel("matrix")}
      />

      <SidePanel
        open={panelOpen}
        tab={panelTab}
        algoMode={algoMode}
        nodes={graph.current.nodes}
        edges={graph.current.edges}
        cpmResult={cpmResult}
        jResult={jResult}
        hResult={hResult}
        originNode={jOrigin}
        destNode={jDest}
        jStep={jStep}
        onTabChange={togglePanel}
        onClose={() => setPanelOpen(false)}
      />

      {showAlgoModal && (
        <AlgoSelector
          currentMode={algoMode}
          onSelect={selectAlgo}
          onClose={() => setShowAlgoModal(false)}
        />
      )}

      {showBgModal && (
        <BgModal
          bgPreset={bgPreset}
          bgImage={bgImage}
          onSelectPreset={(id) => { setBgPreset(id); setBgImage(null); }}
          onUpload={handleBgUpload}
          onClose={() => setShowBgModal(false)}
        />
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {showMatrixEditor && (
        <HungarianMatrixEditor
          nodes={graph.current.nodes}
          edges={graph.current.edges}
          onApply={onMatrixApply}
          onClose={() => setShowMatrixEditor(false)}
        />
      )}

      <PromptModal
        prompt={prompt}
        onChange={(v) => setPrompt((p) => ({ ...p, value: v }))}
        onOk={() => prompt.onOk?.(prompt.value)}
        onCancel={() => prompt.onCancel?.()}
      />

    </div>
  );
}