"use client";
import { useState, useRef, useEffect } from "react";
import type { GNode, GEdge } from "../../types";
import { P } from "../canvas/palette";
import MatrixTable from "./MatrixTable";

interface Props {
  nodes:   GNode[];
  edges:   GEdge[];
  onClose: () => void;
}

export default function MatrixWidget({ nodes, edges, onClose }: Props) {
  // Estado para la posición de la ventana. Empezará flotando en la esquina inferior izquierda.
  const [pos, setPos] = useState({ x: 20, y: 400 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initX: 0, initY: 0 });

  // Cuando se carga, la ponemos dinámicamente cerca del fondo (para que no se salga de la pantalla)
  useEffect(() => {
    setPos({ x: 20, y: window.innerHeight - 350 });
  }, []);

  // Lógica de movimiento
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      // Actualizamos la posición, usando Math.round para mantener la nitidez perfecta del texto
      setPos({
        x: Math.round(dragRef.current.initX + dx),
        y: Math.round(dragRef.current.initY + dy)
      });
    };

    const onMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y
    };
    document.body.style.cursor = 'grabbing';
  };

  return (
    <div style={{
      position: "fixed", // fixed es mejor que absolute para mover libremente por la pantalla
      left: pos.x,
      top: pos.y,
      zIndex: 100,
      background: "#0a0a0a",
      border: "1px solid #222",
      borderRadius: "10px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
      display: "flex",
      flexDirection: "column",
      width: "max-content", // LA MAGIA: Se adapta al tamaño exacto de tu tabla
      maxHeight: "85vh",    // Tope para que no sobrepase tu pantalla
      overflow: "hidden"    // Corta las barras blancas
    }}>
      
      {/* ── HEADER DEL WIDGET (ZONA PARA ARRASTRAR) ── */}
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "12px 16px", borderBottom: "1px solid #1a1a1a", 
          cursor: "grab", background: "#111" // Fondo un poquito más gris para indicar que se agarra
        }}
      >
        <span style={{ color: "#FFF", fontSize: 13, fontWeight: "bold", fontFamily: "'Courier New', monospace", pointerEvents: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2" style={{marginRight: 8, verticalAlign: 'middle'}}>
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Matriz de Adyacencia
        </span>
        {/* El stopPropagation evita que al darle a la X se empiece a arrastrar la ventana por error */}
        <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      
      {/* ── CONTENIDO DE LA TABLA ── */}
      <div style={{ padding: "16px", overflow: "auto" }}>
        <MatrixTable nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}