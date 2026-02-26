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
    nodeIdCounter: 1;
    selectedNode: GraphNode | null;
    isDragging: boolean;
    tempStartNode: GraphNode | null;
    mouseX: number;
    mouseY: number;
}

export default function GraphEditor() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mode, setMode] = useState<string>('add');
    const [showMatrix, setShowMatrix] = useState<boolean>(false);

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
                let textX = 0;
                let textY = 0;

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

                if (getDistance(x, y, textX, textY) <= hitRadius) {
                    return edge;
                }
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
                // Usamos el ID visualmente como en tu imagen (1, 2, 3...)
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
                        data.nodes.push({
                            id: newId,
                            x, y, label: `${newId}`, // Etiqueta numérica limpia
                            color: '#111111'
                        });
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
                        const newLabel = prompt("Nuevo nombre del nodo:", clickedNode.label);
                        if (newLabel) clickedNode.label = newLabel.substring(0, 4);
                    } 
                    else if (clickedEdge) {
                        let weight = prompt("Ingrese el nuevo valor numérico:", clickedEdge.weight);
                        if (weight !== null) {
                            while (isNaN(Number(weight)) || weight.trim() === "") {
                                weight = prompt("❌ Valor inválido. Por favor ingrese SOLO NÚMEROS:", clickedEdge.weight);
                                if (weight === null) break; 
                            }
                            if (weight !== null) {
                                clickedEdge.weight = weight.trim();
                            }
                        }
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
                        let weight = prompt("Ingrese el valor numérico o peso de la conexión:", "1");
                        if (weight !== null) {
                            while (isNaN(Number(weight)) || weight.trim() === "") {
                                weight = prompt("❌ Valor inválido. Por favor ingrese SOLO NÚMEROS:", "1");
                                if (weight === null) break; 
                            }
                            if (weight !== null) {
                                data.edges.push({ 
                                    from: data.tempStartNode, 
                                    to: targetNode, 
                                    weight: weight.trim() 
                                });
                            }
                        }
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
        if(confirm('¿Borrar todo?')) {
            graphData.current.nodes = [];
            graphData.current.edges = [];
            graphData.current.nodeIdCounter = 1; // Reiniciamos el contador
            
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // FUNCIÓN MEJORADA: Calcula sumas y renderiza la tabla igual a la imagen
    // FUNCIÓN ÚNICA Y ACADÉMICA: Calcula grados y renderiza la tabla minimalista
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

        // Calculamos los Grados (Out-degree y In-degree)
        const outDegree = matrix.map(row => row.reduce((a, b) => a + b, 0));
        const inDegree = matrix[0].map((_, i) => matrix.map(row => row[i]).reduce((a, b) => a + b, 0));

        const activeEmitters = outDegree.filter(s => s > 0).length;
        const activeReceivers = inDegree.filter(s => s > 0).length;

        const cellStyle = { width: '45px', height: '45px', textAlign: 'center' as const, fontSize: '15px', fontWeight: '400' };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', color: '#E0E0E0', userSelect: 'none', width: '100%' }}>
                    <tbody>
                        {/* Cabecera superior (Destinos) */}
                        <tr style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ ...cellStyle, color: '#666', fontSize: '12px' }}>Origen \ Destino</td>
                            {sortedNodes.map(node => (
                                <td key={`h-${node.id}`} style={{ ...cellStyle, color: '#D8B4FE', fontWeight: 'bold' }}>{node.label}</td>
                            ))}
                            {/* Grado de Salida */}
                            <td style={{ ...cellStyle, color: '#A855F7', borderLeft: '1px dashed #333', fontSize: '12px', fontWeight: 'bold' }}>Grado Salida</td>
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
                                        borderRadius: '4px' // Bordes redondeados sutiles en los números activos
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
                            </tr>
                        ))}

                        {/* Fila inferior (Grado de Entrada) */}
                        <tr>
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
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}></canvas>
            
            <div className="floating-toolbar">
                <button className={`tool-btn ${mode === 'add' ? 'active' : ''}`} onClick={() => setMode('add')}>➕ Nodo</button>
                <button className={`tool-btn ${mode === 'connect' ? 'active' : ''}`} onClick={() => setMode('connect')}>🔗 Conectar</button>
                <button className={`tool-btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}>🖐️ Mover</button>
                <button className={`tool-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>✏️ Editar</button>
                
                <div className="toolbar-divider"></div>
                
                <button className={`tool-btn ${mode === 'delete' ? 'active' : ''}`} onClick={() => setMode('delete')}>❌ Borrar</button>
                <button className="tool-btn danger" onClick={clearCanvas}>🗑️ Limpiar</button>
                
                <div className="toolbar-divider"></div>

                <button className="tool-btn" style={{ color: '#A855F7', borderColor: '#A855F7' }} onClick={() => setShowMatrix(true)}>
                    📊 Matriz
                </button>
            </div>

            {showMatrix && (
                <div 
                    onClick={() => setShowMatrix(false)}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)', zIndex: 40
                    }}
                />
            )}

            <div style={{
                position: 'absolute', top: 0, 
                right: showMatrix ? '0' : '-450px', 
                width: '450px', height: '100%',
                backgroundColor: '#050505', // Fondo negro profundo (coincide con tu tema)
                borderLeft: '1px solid #222',
                boxShadow: '-10px 0 40px rgba(168, 85, 247, 0.1)', // Sombra morada sutil
                transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Animación más fluida
                zIndex: 50,
                display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #222' }}>
                    <h2 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 300, letterSpacing: '1px' }}>Matriz de Adyacencia</h2>
                    <button onClick={() => setShowMatrix(false)} style={{
                        background: 'transparent', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.2s'
                    }} onMouseOver={(e) => e.currentTarget.style.color = '#A855F7'} onMouseOut={(e) => e.currentTarget.style.color = '#888'}>
                        ✕
                    </button>
                </div>
                
                <div style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    {renderAdjacencyMatrix()}
                </div>
            </div>
        </div>
    );
}