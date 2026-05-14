"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransportState } from "../../hooks/useTransportState";
import TransportTable from "@/components/transport/TransportTable";
import ResultMatrix from "@/components/transport/ResultMatrix";
import StepViewer from "@/components/transport/StepViewer";
import type { TransportResult } from "../../algorithms/northWest";
import type { CSSProperties } from "react";

const P = {
  bg:"#0a0a0a",surface:"#111111",border:"#2a2a2a",
  purple:"#A855F7",purpleDim:"rgba(168,85,247,0.15)",
  cyan:"#00e5ff",cyanDim:"rgba(0,229,255,0.12)",
  red:"#ff0055",redDim:"rgba(255,0,85,0.12)",
  green:"#00ff88",greenDim:"rgba(0,255,136,0.12)",
  yellow:"#ffd600",yellowDim:"rgba(255,214,0,0.12)",
  orange:"#ff9800",orangeDim:"rgba(255,152,0,0.12)",
  text:"#E0E0E0",muted:"#555",
};

const btnGhost=(color:string,dim:string):CSSProperties=>({
  display:"flex",alignItems:"center",gap:6,padding:"8px 15px",
  background:dim,border:`1px solid ${color}`,borderRadius:7,color,
  cursor:"pointer",fontFamily:"'Courier New',monospace",
  fontSize:11,fontWeight:"bold",letterSpacing:0.5,
  transition:"all 0.14s",whiteSpace:"nowrap" as const,
});
const btnFilled=(color:string):CSSProperties=>({
  display:"flex",alignItems:"center",gap:6,padding:"8px 18px",
  background:color,border:`1px solid ${color}`,borderRadius:7,color:"#0a0a0a",
  cursor:"pointer",fontFamily:"'Courier New',monospace",
  fontSize:11,fontWeight:"bold",letterSpacing:0.5,
  transition:"all 0.14s",whiteSpace:"nowrap" as const,
});

function Btn({color,colorDim,filled=false,onClick,children,asLabel=false}:{
  color:string;colorDim:string;filled?:boolean;
  onClick?:()=>void;children:React.ReactNode;asLabel?:boolean;
}){
  const s=filled?btnFilled(color):btnGhost(color,colorDim);
  if(asLabel)return<label style={{...s,cursor:"pointer"}}>{children}</label>;
  return<button onClick={onClick} style={s}>{children}</button>;
}
function Div(){return<div style={{width:1,background:P.border,alignSelf:"stretch",margin:"0 2px"}}/>;}
function SecH({icon,title}:{icon:string;title:string}){return(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.8rem",marginTop:"0.5rem",color:"#D8B4FE",fontSize:14,letterSpacing:1,fontFamily:"'Courier New',monospace"}}>
    <span>{icon}</span><span>{title}</span>
  </div>
);}

function Modal({onClose,children}:{onClose:()=>void;children:React.ReactNode}){return(
  <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,boxShadow:"0 24px 64px rgba(0,0,0,0.9)",width:"90%",maxWidth:500,fontFamily:"'Courier New',monospace"}}>
      {children}
    </div>
  </div>
);}

function ExportModal({onConfirm,onClose}:{onConfirm:(n:string)=>void;onClose:()=>void}){
  const [name,setName]=useState("transporte");
  const [err,setErr]=useState("");
  const confirm=()=>{if(!name.trim()){setErr("Ingresa un nombre.");return;}onConfirm(name.trim());onClose();};
  return(
    <Modal onClose={onClose}>
      <div style={{padding:"1.6rem"}}>
        <div style={{fontSize:9,letterSpacing:2,color:P.muted,marginBottom:6}}>EXPORTAR JSON</div>
        <div style={{color:P.text,fontSize:13,marginBottom:"1.2rem"}}>Nombre del archivo</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <input autoFocus value={name} onChange={e=>{setName(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&confirm()} placeholder="ej: mi-problema"
            style={{flex:1,padding:"10px 12px",background:"#0a0a0a",border:`1px solid ${P.border}`,borderRadius:6,color:P.text,outline:"none",fontFamily:"'Courier New',monospace",fontSize:13}}/>
          <span style={{color:P.muted,fontSize:12,whiteSpace:"nowrap"}}>.json</span>
        </div>
        {err&&<p style={{color:P.red,fontSize:11,margin:"4px 0 0"}}>{err}</p>}
        <div style={{display:"flex",gap:8,marginTop:"1.2rem",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={btnGhost(P.muted,"transparent")}>Cancelar</button>
          <button onClick={confirm} style={btnFilled(P.purple)}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

function HelpModal({onClose}:{onClose:()=>void}){
  const [tab,setTab]=useState<"que"|"como"|"ficticias"|"tips">("que");
  const tabs=[{id:"que" as const,label:"Que es"},{id:"como" as const,label:"Como usarlo"},{id:"ficticias" as const,label:"Filas Ficticias"},{id:"tips" as const,label:"Tips"}];
  return(
    <Modal onClose={onClose}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🚚</span>
          <div>
            <div style={{color:P.text,fontSize:13,fontWeight:"bold"}}>Metodo de la Esquina Noroeste</div>
            <div style={{color:P.muted,fontSize:10,marginTop:2}}>Guia de uso</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:18}}>x</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${P.border}`,padding:"0 8px"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 12px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?P.purple:"transparent"}`,color:tab===t.id?P.purple:P.muted,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace",transition:"all 0.14s"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:"1.4rem 1.6rem",maxHeight:360,overflowY:"auto"}}>
        {tab==="que"&&(
          <div style={{lineHeight:1.8,fontSize:12,color:P.text}}>
            <p style={{marginBottom:12}}>El <strong style={{color:P.purple}}>Metodo de la Esquina Noroeste</strong> genera una <strong style={{color:P.cyan}}>solucion basica factible inicial</strong> para problemas de transporte.</p>
            <div style={{display:"flex",gap:10,marginBottom:10}}><span>📦</span><div><div style={{color:P.purple,fontWeight:"bold",marginBottom:2,fontSize:11}}>Problema que resuelve</div><div style={{color:P.muted}}>Distribuir mercancia desde m origenes hacia n destinos minimizando el costo total.</div></div></div>
            <div style={{display:"flex",gap:10,marginBottom:10}}><span>⚠</span><div><div style={{color:P.yellow,fontWeight:"bold",marginBottom:2,fontSize:11}}>Limitacion importante</div><div style={{color:P.muted}}>No garantiza la solucion optima. Es un punto de partida. Para el optimo se aplica despues el Metodo MODI o Stepping-Stone.</div></div></div>
            <div style={{display:"flex",gap:10}}><span>⏱</span><div><div style={{color:P.cyan,fontWeight:"bold",marginBottom:2,fontSize:11}}>Complejidad</div><div style={{color:P.muted}}>O(m + n). Recorre la matriz diagonal desde la esquina superior-izquierda hasta la inferior-derecha.</div></div></div>
          </div>
        )}
        {tab==="como"&&(
          <div style={{fontSize:12,color:P.text}}>
            {[
              {n:1,c:P.purple,t:"Define la tabla",d:"Usa + Fila y + Columna para ajustar el tamanio. Haz clic en los encabezados para renombrar origenes y destinos."},
              {n:2,c:P.cyan,t:"Ingresa los costos",d:"Cada celda costo[i][j] es el precio de enviar 1 unidad del origen i al destino j."},
              {n:3,c:P.green,t:"Ingresa oferta y demanda",d:"La columna Oferta indica cuanto puede producir cada origen. La fila Demanda indica cuanto necesita cada destino."},
              {n:4,c:P.yellow,t:"Elige el objetivo",d:"Minimizar = menor costo de transporte. Maximizar = mayor ganancia o beneficio."},
              {n:5,c:P.purple,t:"Presiona Resolver",d:"El algoritmo recorre desde la esquina noroeste asignando el maximo posible en cada celda antes de avanzar."},
            ].map(s=>(
              <div key={s.n} style={{display:"flex",gap:12,marginBottom:14}}>
                <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,background:`${s.c}22`,border:`1px solid ${s.c}`,display:"flex",alignItems:"center",justifyContent:"center",color:s.c,fontSize:11,fontWeight:"bold"}}>{s.n}</div>
                <div><div style={{color:P.text,fontWeight:"bold",marginBottom:3,fontSize:12}}>{s.t}</div><div style={{color:P.muted,lineHeight:1.7}}>{s.d}</div></div>
              </div>
            ))}
          </div>
        )}
        {tab==="ficticias"&&(
          <div style={{fontSize:12,color:P.text,lineHeight:1.8}}>
            <p style={{marginBottom:12}}>El algoritmo requiere <strong style={{color:P.cyan}}>Suma Oferta = Suma Demanda</strong>. Si no, se agrega automaticamente una fila o columna ficticia.</p>
            <div style={{padding:"10px 14px",marginBottom:12,background:P.cyanDim,borderRadius:6,border:`1px solid ${P.cyan}44`}}>
              <div style={{color:P.cyan,fontWeight:"bold",marginBottom:4}}>Oferta Mayor a Demanda</div>
              <div style={{color:P.muted}}>Se agrega una <strong style={{color:P.yellow}}>columna ficticia con simbolo estrella</strong> con demanda = diferencia y costos = 0. Representa capacidad no utilizada.</div>
            </div>
            <div style={{padding:"10px 14px",marginBottom:12,background:P.redDim,borderRadius:6,border:`1px solid ${P.red}44`}}>
              <div style={{color:P.red,fontWeight:"bold",marginBottom:4}}>Demanda Mayor a Oferta</div>
              <div style={{color:P.muted}}>Se agrega una <strong style={{color:P.yellow}}>fila ficticia con simbolo estrella</strong> con oferta = diferencia y costos = 0. Representa demanda insatisfecha.</div>
            </div>
            <p style={{color:P.muted,fontSize:11}}>Las celdas ficticias se muestran en amarillo y no se incluyen en el costo total real.</p>
          </div>
        )}
        {tab==="tips"&&(
          <div style={{fontSize:12}}>
            {[
              {icon:"📋",tip:"Usa Ejemplos para cargar problemas de practica y ver como funciona el algoritmo paso a paso."},
              {icon:"💾",tip:"Exporta tu problema en JSON con el nombre que quieras para guardarlo y cargarlo mas tarde."},
              {icon:"🔄",tip:"Si cambias entre Minimizar y Maximizar, presiona Resolver de nuevo para recalcular."},
              {icon:"⭐",tip:"Las celdas marcadas con estrella son ficticias. Se agregan automaticamente si el problema no esta balanceado."},
              {icon:"📊",tip:"La seccion Iteraciones muestra paso a paso como el algoritmo recorre la matriz. Usa los botones Anterior y Siguiente para navegar."},
              {icon:"📁",tip:"El formato JSON exportado es compatible con Importar JSON, asi puedes compartir problemas con otros."},
            ].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,padding:"8px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,border:"1px solid #1e1e1e"}}>
                <span style={{fontSize:16,lineHeight:1,marginTop:1}}>{t.icon}</span>
                <span style={{color:P.muted,lineHeight:1.6}}>{t.tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${P.border}`,display:"flex",justifyContent:"flex-end"}}>
        <button onClick={onClose} style={btnFilled(P.purple)}>Entendido!</button>
      </div>
    </Modal>
  );
}

export default function NorthWestPage(){
  const state=useTransportState();
  const router=useRouter();
  const [showExamples,setShowExamples]=useState(false);
  const [showHelp,setShowHelp]=useState(false);
  const [showExport,setShowExport]=useState(false);
  const result=state.result&&!state.result.error?(state.result as TransportResult):null;
  const handleImport=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(f)state.importJSON(f);e.target.value="";
  };
  return(
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"'Courier New',monospace",color:P.text}}>
      {state.toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:P.redDim,border:`1px solid ${P.red}`,borderRadius:6,padding:"10px 24px",color:P.red,fontSize:12,zIndex:999,backdropFilter:"blur(10px)",maxWidth:"90vw",textAlign:"center"}}>
          {state.toast}
        </div>
      )}
      {showHelp&&<HelpModal onClose={()=>setShowHelp(false)}/>}
      {showExport&&<ExportModal onConfirm={name=>state.exportJSON(name)} onClose={()=>setShowExport(false)}/>}
      <div style={{textAlign:"center",padding:"2.2rem 1rem 1.4rem"}}>
        <div style={{fontSize:26,marginBottom:6}}>🚚</div>
        <h1 style={{fontSize:"1.5rem",fontWeight:400,color:P.text,letterSpacing:2,margin:"0 0 6px"}}>Algoritmo North West Corner</h1>
        <p style={{color:P.muted,fontSize:11,margin:0}}>Metodo de la esquina noroeste para problemas de transporte</p>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 1rem 3rem"}}>
        <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"12px 16px",marginBottom:"1.4rem",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            <Btn color={P.purple} colorDim={P.purpleDim} onClick={state.addRow}>+ Agregar Fila</Btn>
            <Btn color={P.purple} colorDim={P.purpleDim} onClick={state.addCol}>+ Agregar Columna</Btn>
            <Btn color={P.red} colorDim={P.redDim} onClick={state.removeRow}>- Eliminar Fila</Btn>
            <Btn color={P.red} colorDim={P.redDim} onClick={state.removeCol}>- Eliminar Columna</Btn>
            <Div/>
            <Btn color={state.objective==="minimize"?P.red:P.orange} colorDim={state.objective==="minimize"?P.redDim:P.orangeDim}
              onClick={()=>state.setObjective(state.objective==="minimize"?"maximize":"minimize")}>
              {state.objective==="minimize"?"Minimizar":"Maximizar"}
            </Btn>
            <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.solve}>Resolver</Btn>
            <Div/>
            <div style={{position:"relative"}}>
              <Btn color={P.yellow} colorDim={P.yellowDim} onClick={()=>setShowExamples(v=>!v)}>Ejemplos</Btn>
              {showExamples&&(
                <>
                  <div style={{position:"fixed",inset:0,zIndex:40}} onClick={()=>setShowExamples(false)}/>
                  <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:P.surface,border:`1px solid ${P.border}`,borderRadius:7,overflow:"hidden",zIndex:50,minWidth:220,boxShadow:"0 10px 28px rgba(0,0,0,0.8)"}}>
                    {[{label:"Ejemplo 1 - Minimizar (balanceado)",idx:0},{label:"Ejemplo 2 - Maximizar (ficticia col.)",idx:1},{label:"Ejemplo 3 - Minimizar (ficticia fila)",idx:2}].map(ex=>(
                      <button key={ex.idx} onClick={()=>{state.loadExample(ex.idx);setShowExamples(false);}}
                        style={{display:"block",width:"100%",padding:"10px 14px",background:"transparent",border:"none",color:P.text,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace",textAlign:"left"}}
                        onMouseEnter={e=>(e.currentTarget.style.background="#1e1e1e")}
                        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{height:1,background:P.border}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            <Btn color={P.purple} colorDim={P.purpleDim} asLabel>
              Importar JSON
              <input type="file" accept=".json" style={{display:"none"}} onChange={handleImport}/>
            </Btn>
            <Btn color={P.purple} colorDim={P.purpleDim} onClick={()=>setShowExport(true)}>Exportar JSON</Btn>
            <Btn color={P.red} colorDim={P.redDim} onClick={state.clear}>Limpiar</Btn>
            <Div/>
            <Btn color={P.yellow} colorDim={P.yellowDim} onClick={()=>setShowHelp(true)}>? Ayuda</Btn>
            <div style={{flex:1}}/>
            <Btn color={P.green} colorDim={P.greenDim} onClick={()=>router.push("/editor?showSelector=true")}>Cambiar algoritmo</Btn>
          </div>
        </div>
        <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"1rem",marginBottom:"2rem"}}>
          <TransportTable costs={state.costs} supply={state.supply} demand={state.demand}
            rowLabels={state.rowLabels} colLabels={state.colLabels}
            totalSupply={state.totalSupply} totalDemand={state.totalDemand}
            onCostChange={state.setCostCell} onSupplyChange={state.setSupplyCell}
            onDemandChange={state.setDemandCell} onRowLabel={state.setRowLabel} onColLabel={state.setColLabel}/>
        </div>
        {result&&(
          <>
            <SecH icon="📊" title="Resultados"/>
            <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:8,padding:"1.2rem",marginBottom:"1.5rem"}}>
              <ResultMatrix result={result}/>
            </div>
            <SecH icon="≡" title="Iteraciones del Algoritmo"/>
            <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:8,padding:"1.2rem",marginBottom:"1.5rem"}}>
              <StepViewer result={result} currentStep={state.currentStep} onNext={state.nextStep} onPrev={state.prevStep}/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}