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

export default function GraphEditor() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mode, setMode] = useState<string>('add'); // Modos: add, connect, move, edit, delete

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

        // NUEVO: Función para detectar si hicimos clic sobre el número de una arista
        const getEdgeAt = (x: number, y: number): GraphEdge | null => {
            const hitRadius = 15; // Área de clic alrededor del número
            
            for (let i = data.edges.length - 1; i >= 0; i--) {
                const edge = data.edges[i];
                let textX = 0;
                let textY = 0;

                if (edge.from === edge.to) {
                    // Posición del texto del bucle
                    textX = edge.from.x;
                    textY = edge.from.y - NODE_RADIUS * 2.8;
                } else {
                    // Posición del texto de la curva
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
                    // BUCLE
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
                        
                        // Fondo para el texto
                        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                        const textWidth = ctx.measureText(edge.weight).width;
                        ctx.fillRect(node.x - textWidth/2 - 4, node.y - NODE_RADIUS * 2.8 - 8, textWidth + 8, 16);

                        ctx.fillStyle = '#A855F7';
                        ctx.fillText(edge.weight, node.x, node.y - NODE_RADIUS * 2.8);
                    }

                } else {
                    // CURVA NORMAL
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
            
            // Verificamos si tocamos un nodo, y si no, verificamos si tocamos una arista
            const clickedNode = getNodeAt(x, y);
            const clickedEdge = !clickedNode ? getEdgeAt(x, y) : null;

            switch (modeRef.current) {
                case 'add':
                    if (!clickedNode) {
                        data.nodes.push({
                            id: data.nodeIdCounter++,
                            x, y, label: `q${data.nodeIdCounter - 1}`,
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
                    // Si clicamos un NODO
                    if (clickedNode) {
                        const newLabel = prompt("Nuevo nombre del nodo:", clickedNode.label);
                        if (newLabel) clickedNode.label = newLabel.substring(0, 4);
                    } 
                    // Si clicamos una ARISTA (su número)
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
                    // Si clicamos un NODO, lo borramos con sus conexiones
                    if (clickedNode) {
                        data.nodes = data.nodes.filter(n => n !== clickedNode);
                        data.edges = data.edges.filter(e => e.from !== clickedNode && e.to !== clickedNode);
                    } 
                    // Si clicamos una ARISTA, borramos SOLO esa arista
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
            
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
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
                
                {/* Cambié el valor del modo de 'deleteNode' a 'delete' */}
                <button className={`tool-btn ${mode === 'delete' ? 'active' : ''}`} onClick={() => setMode('delete')}>❌ Borrar</button>
                <button className="tool-btn danger" onClick={clearCanvas}>🗑️ Limpiar</button>
            </div>
        </div>
    );
}