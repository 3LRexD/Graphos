// components/GraphEditor.tsx
"use client";

import { useRef, useEffect, useState } from 'react';

interface GraphNode {
    id: number;
    x: number;
    y: number;
    label: string;
    color: string;
}

interface GraphEdge {
    from: GraphNode;
    to: GraphNode;
    weight: string; 
}

interface GraphState {
    nodes: GraphNode[];
    edges: GraphEdge[];
    nodeIdCounter: number;
    selectedNode: GraphNode | null;
    isDragging: boolean;
    tempStartNode: GraphNode | null;
    mouseX: number;
    mouseY: number;
}

// Interfaz para controlar nuestra ventana emergente bonita
interface PromptConfig {
    isOpen: boolean;
    title: string;
    value: string;
    placeholder: string;
    error: string;
    onConfirm: ((val: string) => void) | null;
    onCancel: (() => void) | null;
}

export default function GraphEditor() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mode, setMode] = useState<string>('add');
    const [showMatrix, setShowMatrix] = useState<boolean>(false);
    const [showGuide, setShowGuide] = useState<boolean>(false); // Estado para la mini guía

    // Estado para el modal de edición personalizado
    const [customPrompt, setCustomPrompt] = useState<PromptConfig>({
        isOpen: false, title: '', value: '', placeholder: '', error: '', onConfirm: null, onCancel: null
    });

    const graphData = useRef<GraphState>({
        nodes: [],
        edges: [],
        nodeIdCounter: 1,
        selectedNode: null,
        isDragging: false,
        tempStartNode: null,
        mouseX: 0,
        mouseY: 0
    });

    const modeRef = useRef<string>(mode);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const data = graphData.current;
        const NODE_RADIUS = 25; 

        const resizeCanvas = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                draw();
            }
        };

        const getDistance = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);

        const getNodeAt = (x: number, y: number): GraphNode | null => {
            for (let i = data.nodes.length - 1; i >= 0; i--) {
                if (getDistance(x, y, data.nodes[i].x, data.nodes[i].y) <= NODE_RADIUS) {
                    return data.nodes[i];
                }
            }
            return null;
        };

        const getEdgeAt = (x: number, y: number): GraphEdge | null => {
            const hitRadius = 15; 
            for (let i = data.edges.length - 1; i >= 0; i--) {
                const edge = data.edges[i];
                let textX = 0, textY = 0;

                if (edge.from === edge.to) {
                    textX = edge.from.x;
                    textY = edge.from.y - NODE_RADIUS * 2.8;
                } else {
                    const dx = edge.to.x - edge.from.x;
                    const dy = edge.to.y - edge.from.y;
                    const dist = Math.hypot(dx, dy);
                    const nx = -dy / dist;
                    const ny = dx / dist;
                    const curveOffset = 30;
                    textX = edge.from.x + dx/2 + nx * curveOffset;
                    textY = edge.from.y + dy/2 + ny * curveOffset;
                }

                if (getDistance(x, y, textX, textY) <= hitRadius) return edge;
            }
            return null;
        };

        const drawArrowhead = (x: number, y: number, angle: number) => {
            const headlen = 12; 
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            data.edges.forEach(edge => {
                ctx.strokeStyle = '#666666'; 
                ctx.fillStyle = '#A855F7'; 

                if (edge.from === edge.to) {
                    const node = edge.from;
                    const cp1x = node.x - NODE_RADIUS * 2;
                    const cp1y = node.y - NODE_RADIUS * 3.5;
                    const cp2x = node.x + NODE_RADIUS * 2;
                    const cp2y = node.y - NODE_RADIUS * 3.5;
                    
                    const startAngle = Math.PI * 1.25; 
                    const endAngle = Math.PI * 1.75;   
                    
                    const startX = node.x + NODE_RADIUS * Math.cos(startAngle);
                    const startY = node.y + NODE_RADIUS * Math.sin(startAngle);
                    const endX = node.x + NODE_RADIUS * Math.cos(endAngle);
                    const endY = node.y + NODE_RADIUS * Math.sin(endAngle);

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
                    ctx.stroke();

                    const arrowAngle = Math.atan2(endY - cp2y, endX - cp2x);
                    drawArrowhead(endX, endY, arrowAngle);

                    if (edge.weight) {
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                        const textWidth = ctx.measureText(edge.weight).width;
                        ctx.fillRect(node.x - textWidth/2 - 4, node.y - NODE_RADIUS * 2.8 - 8, textWidth + 8, 16);
                        ctx.fillStyle = '#A855F7';
                        ctx.fillText(edge.weight, node.x, node.y - NODE_RADIUS * 2.8);
                    }

                } else {
                    const dx = edge.to.x - edge.from.x;
                    const dy = edge.to.y - edge.from.y;
                    const dist = Math.hypot(dx, dy);
                    const nx = -dy / dist;
                    const ny = dx / dist;
                    const curveOffset = 30; 
                    
                    const cx = edge.from.x + dx/2 + nx * curveOffset;
                    const cy = edge.from.y + dy/2 + ny * curveOffset;

                    const angleStart = Math.atan2(cy - edge.from.y, cx - edge.from.x);
                    const angleEnd = Math.atan2(edge.to.y - cy, edge.to.x - cx);

                    const startX = edge.from.x + NODE_RADIUS * Math.cos(angleStart);
                    const startY = edge.from.y + NODE_RADIUS * Math.sin(angleStart);
                    const endX = edge.to.x - NODE_RADIUS * Math.cos(angleEnd);
                    const endY = edge.to.y - NODE_RADIUS * Math.sin(angleEnd);

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.quadraticCurveTo(cx, cy, endX, endY);
                    ctx.stroke();

                    drawArrowhead(endX, endY, angleEnd);

                    if (edge.weight) {
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                        const textWidth = ctx.measureText(edge.weight).width;
                        ctx.fillRect(cx - textWidth/2 - 4, cy - 8, textWidth + 8, 16);
                        ctx.fillStyle = '#A855F7';
                        ctx.fillText(edge.weight, cx, cy);
                    }
                }
            });

            if (modeRef.current === 'connect' && data.tempStartNode) {
                ctx.beginPath();
                ctx.moveTo(data.tempStartNode.x, data.tempStartNode.y);
                ctx.lineTo(data.mouseX, data.mouseY);
                ctx.strokeStyle = '#A855F7';
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            data.nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                ctx.lineWidth = 2;
                ctx.strokeStyle = (node === data.selectedNode || node === data.tempStartNode) ? '#A855F7' : '#333333';
                ctx.stroke();

                ctx.fillStyle = '#E0E0E0';
                ctx.font = '400 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label, node.x, node.y);
            });
        };

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedNode = getNodeAt(x, y);
            const clickedEdge = !clickedNode ? getEdgeAt(x, y) : null;

            switch (modeRef.current) {
                case 'add':
                    if (!clickedNode) {
                        const newId = data.nodeIdCounter++;
                        data.nodes.push({ id: newId, x, y, label: `${newId}`, color: '#111111' });
                    }
                    break;
                case 'move':
                    if (clickedNode) { data.selectedNode = clickedNode; data.isDragging = true; }
                    break;
                case 'connect':
                    if (clickedNode) data.tempStartNode = clickedNode;
                    break;
                case 'edit':
                    if (clickedNode) {
                        // REEMPLAZO: Custom Prompt para el Nodo
                        setCustomPrompt({
                            isOpen: true,
                            title: "Editar Nombre del Nodo",
                            value: clickedNode.label,
                            placeholder: "Ej: q1, A, Inicio",
                            error: "",
                            onConfirm: (val) => {
                                clickedNode.label = val.substring(0, 4);
                                setCustomPrompt(prev => ({ ...prev, isOpen: false }));
                                draw();
                            },
                            onCancel: () => setCustomPrompt(prev => ({ ...prev, isOpen: false }))
                        });
                    } 
                    else if (clickedEdge) {
                        // REEMPLAZO: Custom Prompt para la Arista
                        setCustomPrompt({
                            isOpen: true,
                            title: "Editar Peso de la Conexión",
                            value: clickedEdge.weight,
                            placeholder: "Solo números (Ej: 10)",
                            error: "",
                            onConfirm: (val) => {
                                if (isNaN(Number(val)) || val.trim() === "") {
                                    setCustomPrompt(prev => ({ ...prev, error: "❌ Por favor ingrese SOLO NÚMEROS válidos." }));
                                    return; // Evita que se cierre la ventana
                                }
                                clickedEdge.weight = val.trim();
                                setCustomPrompt(prev => ({ ...prev, isOpen: false }));
                                draw();
                            },
                            onCancel: () => setCustomPrompt(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                    break;
                case 'delete':
                    if (clickedNode) {
                        data.nodes = data.nodes.filter(n => n !== clickedNode);
                        data.edges = data.edges.filter(e => e.from !== clickedNode && e.to !== clickedNode);
                    } 
                    else if (clickedEdge) {
                        data.edges = data.edges.filter(e => e !== clickedEdge);
                    }
                    break;
            }
            draw();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            data.mouseX = e.clientX - rect.left;
            data.mouseY = e.clientY - rect.top;

            if (modeRef.current === 'move' && data.isDragging && data.selectedNode) {
                data.selectedNode.x = data.mouseX;
                data.selectedNode.y = data.mouseY;
                draw();
            } else if (modeRef.current === 'connect' && data.tempStartNode) {
                draw();
            }
        };

        const handleMouseUp = () => {
            if (modeRef.current === 'move') {
                data.isDragging = false;
                data.selectedNode = null;
            } else if (modeRef.current === 'connect' && data.tempStartNode) {
                const targetNode = getNodeAt(data.mouseX, data.mouseY);
                if (targetNode) {
                    const exists = data.edges.some(e => e.from === data.tempStartNode && e.to === targetNode);
                    
                    if (!exists) {
                        // Guardamos las referencias actuales para usarlas cuando el modal se apruebe
                        const fromNode = data.tempStartNode;
                        const toNode = targetNode;

                        // REEMPLAZO: Custom Prompt para Nueva Conexión
                        setCustomPrompt({
                            isOpen: true,
                            title: "Peso de la Nueva Conexión",
                            value: "1",
                            placeholder: "Solo números (Ej: 1, 5, 10)",
                            error: "",
                            onConfirm: (val) => {
                                if (isNaN(Number(val)) || val.trim() === "") {
                                    setCustomPrompt(prev => ({ ...prev, error: "❌ Por favor ingrese SOLO NÚMEROS válidos." }));
                                    return; 
                                }
                                data.edges.push({ from: fromNode, to: toNode, weight: val.trim() });
                                setCustomPrompt(prev => ({ ...prev, isOpen: false }));
                                draw();
                            },
                            onCancel: () => {
                                setCustomPrompt(prev => ({ ...prev, isOpen: false }));
                                draw();
                            }
                        });
                    }
                }
                data.tempStartNode = null;
                draw();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        setTimeout(resizeCanvas, 50);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, []); 

    const clearCanvas = () => {
        if(confirm('¿Seguro que deseas borrar el lienzo completo?')) {
            graphData.current.nodes = [];
            graphData.current.edges = [];
            graphData.current.nodeIdCounter = 1; 
            
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // Funciones de Exportar e Importar (Se mantienen igual)
   // ====== FUNCIONES DE EXPORTAR E IMPORTAR MEJORADAS ======
    const handleExport = () => {
        // Usamos nuestro modal personalizado para pedir el nombre
        setCustomPrompt({
            isOpen: true,
            title: "Guardar Grafo",
            value: "mi-grafo",
            placeholder: "Nombre del archivo (ej: tarea-grafos)",
            error: "",
            onConfirm: (fileName) => {
                // Validamos que no deje el nombre en blanco
                if (!fileName || fileName.trim() === "") {
                    setCustomPrompt(prev => ({ ...prev, error: "❌ Por favor ingrese un nombre para el archivo." }));
                    return; 
                }

                const data = graphData.current;
                const exportObj = {
                    nodes: data.nodes,
                    edges: data.edges.map(e => ({ from: e.from.id, to: e.to.id, weight: e.weight })),
                    nodeIdCounter: data.nodeIdCounter
                };
                
                const dataStr = JSON.stringify(exportObj, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url; 
                
                // Aseguramos que termine siempre en .json aunque el usuario olvide ponerlo
                const safeName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
                link.download = safeName; 
                link.click();
                
                URL.revokeObjectURL(url);
                setCustomPrompt(prev => ({ ...prev, isOpen: false })); // Cerramos la ventanita
            },
            onCancel: () => setCustomPrompt(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target?.result as string);
                if (parsedData.nodes && parsedData.edges) {
                    const newNodes = parsedData.nodes;
                    const newEdges = parsedData.edges.map((e: any) => ({
                        from: newNodes.find((n: any) => n.id === e.from),
                        to: newNodes.find((n: any) => n.id === e.to),
                        weight: e.weight
                    })).filter((e: any) => e.from && e.to); 
                    
                    graphData.current.nodes = newNodes;
                    graphData.current.edges = newEdges;
                    graphData.current.nodeIdCounter = parsedData.nodeIdCounter || 1;
                    
                    window.dispatchEvent(new Event('resize'));
                } else {
                    alert("El archivo JSON no tiene un formato válido para este editor.");
                }
            } catch (error) { 
                alert("Error al leer el archivo. Asegúrate de que sea un JSON válido."); 
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Permite volver a importar el mismo archivo si haces cambios
    };

    // FUNCIÓN ÚNICA Y ACADÉMICA: Calcula grados, conexiones y renderiza la tabla minimalista
    const renderAdjacencyMatrix = () => {
        const { nodes, edges } = graphData.current;
        const n = nodes.length;

        if (n === 0) {
            return <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#666' }}>El lienzo está vacío. Crea nodos para analizar la matriz.</div>;
        }

        const sortedNodes = [...nodes].sort((a, b) => a.id - b.id);
        const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
        
        const nodeIndexMap = new Map();
        sortedNodes.forEach((node, index) => nodeIndexMap.set(node.id, index));

        edges.forEach(edge => {
            const fromIdx = nodeIndexMap.get(edge.from.id);
            const toIdx = nodeIndexMap.get(edge.to.id);
            if (fromIdx !== undefined && toIdx !== undefined) {
                matrix[fromIdx][toIdx] = parseFloat(edge.weight) || 0;
            }
        });

        // 1. Calculamos los Grados (Suma de pesos)
        const outDegree = matrix.map(row => row.reduce((a, b) => a + b, 0));
        const inDegree = matrix[0].map((_, i) => matrix.map(row => row[i]).reduce((a, b) => a + b, 0));

        // 2. NUEVO: Calculamos los Contadores (Cantidad de conexiones ignorando el peso)
        const outCount = matrix.map(row => row.filter(val => val > 0).length);
        const inCount = matrix[0].map((_, i) => matrix.map(row => row[i]).filter(val => val > 0).length);

        const activeEmitters = outDegree.filter(s => s > 0).length;
        const activeReceivers = inDegree.filter(s => s > 0).length;

        const cellStyle = { width: '45px', height: '45px', textAlign: 'center' as const, fontSize: '15px', fontWeight: '400' };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', color: '#E0E0E0', userSelect: 'none', width: '100%' }}>
                    <tbody>
                        {/* Cabecera superior */}
                        <tr style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ ...cellStyle, color: '#666', fontSize: '12px' }}>Origen \ Destino</td>
                            {sortedNodes.map(node => (
                                <td key={`h-${node.id}`} style={{ ...cellStyle, color: '#D8B4FE', fontWeight: 'bold' }}>{node.label}</td>
                            ))}
                            {/* Grado de Salida */}
                            <td style={{ ...cellStyle, color: '#A855F7', borderLeft: '1px dashed #333', fontSize: '12px', fontWeight: 'bold' }}>Grado Salida</td>
                            {/* NUEVO: Columna de Contador */}
                            <td style={{ ...cellStyle, color: '#888', borderLeft: '1px dotted #222', fontSize: '11px', paddingLeft: '5px' }}>Nº Conex.</td>
                        </tr>

                        {/* Filas de la matriz */}
                        {sortedNodes.map((node, i) => (
                            <tr key={`r-${node.id}`} style={{ borderBottom: '1px solid #1A1A1A' }}>
                                <td style={{ ...cellStyle, color: '#D8B4FE', fontWeight: 'bold' }}>{node.label}</td>
                                
                                {matrix[i].map((val, j) => (
                                    <td key={`c-${i}-${j}`} style={{
                                        ...cellStyle,
                                        backgroundColor: val === 0 ? 'transparent' : 'rgba(168, 85, 247, 0.1)',
                                        color: val === 0 ? '#444' : '#FFF',
                                        borderRadius: '4px' 
                                    }}>
                                        {val}
                                    </td>
                                ))}
                                
                                {/* Total Grado Salida */}
                                <td style={{
                                    ...cellStyle,
                                    borderLeft: '1px dashed #333',
                                    color: outDegree[i] > 0 ? '#A855F7' : '#555',
                                    fontWeight: outDegree[i] > 0 ? 'bold' : 'normal'
                                }}>
                                    {outDegree[i]}
                                </td>
                                
                                {/* NUEVO: Valor del Contador de Salida */}
                                <td style={{
                                    ...cellStyle,
                                    borderLeft: '1px dotted #222',
                                    color: outCount[i] > 0 ? '#D8B4FE' : '#444',
                                    fontSize: '13px'
                                }}>
                                    {outCount[i]}
                                </td>
                            </tr>
                        ))}

                        {/* Fila Inferior 1: Grado de Entrada (Suma de pesos) */}
                        <tr style={{ borderBottom: '1px dotted #222' }}>
                            <td style={{ ...cellStyle, color: '#A855F7', fontSize: '12px', fontWeight: 'bold' }}>Grado Entrada</td>
                            {inDegree.map((sum, j) => (
                                <td key={`s-${j}`} style={{
                                    ...cellStyle,
                                    color: sum > 0 ? '#A855F7' : '#555',
                                    fontWeight: sum > 0 ? 'bold' : 'normal'
                                }}>
                                    {sum}
                                </td>
                            ))}
                            <td style={{ ...cellStyle, borderLeft: '1px dashed #333' }}></td>
                            <td style={{ ...cellStyle, borderLeft: '1px dotted #222' }}></td>
                        </tr>

                        {/* NUEVO: Fila Inferior 2: Contador de Entrada (Cantidad de conexiones) */}
                        <tr>
                            <td style={{ ...cellStyle, color: '#888', fontSize: '11px' }}>Nº Conex.</td>
                            {inCount.map((cnt, j) => (
                                <td key={`cnt-${j}`} style={{
                                    ...cellStyle,
                                    color: cnt > 0 ? '#D8B4FE' : '#444',
                                    fontSize: '13px'
                                }}>
                                    {cnt}
                                </td>
                            ))}
                            <td style={{ ...cellStyle, borderLeft: '1px dashed #333' }}></td>
                            <td style={{ ...cellStyle, borderLeft: '1px dotted #222' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Académico */}
                <div style={{ marginTop: '3rem', width: '100%', padding: '1rem', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #222' }}>
                    <h4 style={{ color: '#D8B4FE', marginBottom: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>Análisis Topológico</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', color: '#888', fontSize: '13px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p>Nodos Emisores</p>
                            <strong style={{ color: '#FFF', fontSize: '1.2rem' }}>{activeEmitters} <span style={{fontSize: '0.9rem', color: '#555'}}>/ {n}</span></strong>
                        </div>
                        <div style={{ width: '1px', background: '#333' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <p>Nodos Receptores</p>
                            <strong style={{ color: '#FFF', fontSize: '1.2rem' }}>{activeReceivers} <span style={{fontSize: '0.9rem', color: '#555'}}>/ {n}</span></strong>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {/* CANVAS PRINCIPAL */}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}></canvas>
            
            {/* ====== BOTONES SUPERIORES (Importar/Exportar y Guía) ====== */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 10 }}>
                <label className="tool-btn" style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #333', cursor: 'pointer' }}>
                    # Importar
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                </label>
                <button className="tool-btn" style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #333' }} onClick={handleExport}>
                    # Exportar
                </button>
            </div>

            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                <button className="tool-btn" style={{ background: 'rgba(10,10,10,0.8)', color: '#D8B4FE', border: '1px solid #D8B4FE' }} onClick={() => setShowGuide(true)}>
                    # Guía Rápida
                </button>
            </div>

            {/* BARRA DE HERRAMIENTAS FLOTANTE INFERIOR */}
            <div className="floating-toolbar">
                <button className={`tool-btn ${mode === 'add' ? 'active' : ''}`} onClick={() => setMode('add')}>➕ Nodo</button>
                <button className={`tool-btn ${mode === 'connect' ? 'active' : ''}`} onClick={() => setMode('connect')}>🔗 Conectar</button>
                <button className={`tool-btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}>🖐️ Mover</button>
                <button className={`tool-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>✏️ Editar</button>
                <div className="toolbar-divider"></div>
                <button className={`tool-btn ${mode === 'delete' ? 'active' : ''}`} onClick={() => setMode('delete')}>❌ Borrar</button>
                <button className="tool-btn danger" onClick={clearCanvas}>🗑️ Limpiar</button>
                <div className="toolbar-divider"></div>
                <button className="tool-btn" style={{ color: '#A855F7', borderColor: '#A855F7' }} onClick={() => setShowMatrix(true)}>📊 Matriz</button>
            </div>

            {/* ====== 1. MODAL: VENTANA EMERGENTE PERSONALIZADA (EDICIÓN Y PESOS) ====== */}
            {customPrompt.isOpen && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div style={{
                        background: '#0A0A0A', padding: '2rem', borderRadius: '8px',
                        border: '1px solid #A855F7', boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
                        width: '350px', textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#FFF', marginBottom: '1rem', fontWeight: 400 }}>{customPrompt.title}</h3>
                        <input 
                            autoFocus
                            type="text" 
                            value={customPrompt.value}
                            placeholder={customPrompt.placeholder}
                            onChange={(e) => setCustomPrompt({...customPrompt, value: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && customPrompt.onConfirm?.(customPrompt.value)}
                            style={{
                                width: '100%', padding: '10px', background: '#1A1A1A', color: '#FFF',
                                border: '1px solid #333', borderRadius: '4px', marginBottom: '10px',
                                outline: 'none', textAlign: 'center', fontSize: '1rem'
                            }}
                        />
                        {customPrompt.error && <p style={{ color: '#E53E3E', fontSize: '0.85rem', marginBottom: '10px' }}>{customPrompt.error}</p>}
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1rem' }}>
                            <button onClick={() => customPrompt.onCancel?.()} style={{
                                padding: '8px 20px', background: 'transparent', color: '#888',
                                border: '1px solid #333', borderRadius: '4px', cursor: 'pointer'
                            }}>Cancelar</button>
                            <button onClick={() => customPrompt.onConfirm?.(customPrompt.value)} style={{
                                padding: '8px 20px', background: '#A855F7', color: '#FFF',
                                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== 2. MODAL: GUÍA RÁPIDA ====== */}
            {showGuide && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60
                }}>
                    <div style={{
                        background: '#111', padding: '2.5rem', borderRadius: '8px', border: '1px solid #333',
                        maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                    }}>
                        <h2 style={{ color: '#A855F7', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 400 }}>📖 Guía del Editor</h2>
                        
                        <ul style={{ listStyle: 'none', padding: 0, color: '#CCC', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <li><strong style={{ color: '#FFF' }}>➕ Nodo:</strong> Haz clic en cualquier parte vacía del lienzo para crear un estado.</li>
                            <li><strong style={{ color: '#FFF' }}>🔗 Conectar:</strong> Haz clic en un nodo de origen y luego en uno de destino. Te pedirá el peso. <br/><span style={{fontSize:'0.85rem', color:'#888'}}>(Puedes hacer clic en el mismo nodo para crear un Bucle/Estado Absorbente).</span></li>
                            <li><strong style={{ color: '#FFF' }}>🖐️ Mover:</strong> Mantén presionado un nodo y arrástralo para organizar tu grafo.</li>
                            <li><strong style={{ color: '#FFF' }}>✏️ Editar:</strong> Haz clic en un nodo para cambiar su nombre, o en el número de una flecha para cambiar su peso.</li>
                            <li><strong style={{ color: '#FFF' }}>❌ Borrar:</strong> Toca un nodo para borrarlo (y sus flechas) o toca el número de una flecha para borrar solo esa conexión.</li>
                        </ul>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button onClick={() => setShowGuide(false)} style={{
                                padding: '10px 30px', background: '#A855F7', color: '#FFF',
                                border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem'
                            }}>¡Entendido!</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== 3. MODAL: MATRIZ DE ADYACENCIA (Mantenido igual) ====== */}
            {showMatrix && (
                <div onClick={() => setShowMatrix(false)} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)', zIndex: 40
                }}/>
            )}
            <div style={{
                position: 'absolute', top: 0, right: showMatrix ? '0' : '-450px', width: '450px', height: '100%',
                backgroundColor: '#050505', borderLeft: '1px solid #222', boxShadow: '-10px 0 40px rgba(168, 85, 247, 0.1)', 
                transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: 50, display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #222' }}>
                    <h2 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 300, letterSpacing: '1px' }}>Matriz de Adyacencia</h2>
                    <button onClick={() => setShowMatrix(false)} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    {renderAdjacencyMatrix()}
                </div>
            </div>
        </div>
    );
}