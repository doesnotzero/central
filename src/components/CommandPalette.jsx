import React, { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

export default function CommandPalette({open,onClose,state,setTab,dispatch,shared}){
  const {C,Modal,Tag,SectionTitle,STATUS_COLORS,VIDEO_COLORS} = shared;
  const brandName = state.business?.brandName || "sua marca";
  const [q,setQ]=useState("");
  useEffect(()=>{if(open)setQ("");},[open]);
  const debouncedQ=useDebouncedValue(q,180);
  const term=debouncedQ.trim().toLowerCase();
  const commands=useMemo(()=>[
    {type:"Produto",title:"Video Review",meta:"Revisões, comentários por timecode e aprovação",color:"#06b6d4",run:()=>setTab("videoReview")},
    {type:"Comercial",title:"Abrir CRM",meta:"Clientes, pipeline e próximos contatos",color:"#10b981",run:()=>setTab("clients")},
    {type:"Comercial",title:"Criar proposta",meta:"Escopo, entregáveis, valor e PDF comercial",color:C.orange,run:()=>setTab("proposta")},
    {type:"Produção",title:"Novo projeto",meta:"Briefing, etapas, prazos e entrega audiovisual",color:"#8b5cf6",run:()=>setTab("projects")},
    {type:"Marca",title:"Brand Book",meta:`Guia visual ${brandName} e exportação PDF`,color:C.orange,run:()=>setTab("brandbook")},
    {type:"Documento",title:"Documentos",meta:"Briefing, roteiro, callsheet e checklist",color:"#3b82f6",run:()=>setTab("studio")},
    {type:"Caixa",title:"Caixa operacional",meta:"Recebimentos, despesas e pendências",color:"#eab308",run:()=>setTab("finance")},
    {type:"Ação",title:"Nova atividade",meta:"Cria uma tarefa operacional para classificar depois",color:C.orange,run:()=>dispatch({type:"ADD_TASK",task:{title:debouncedQ.trim()||"Nova atividade",priority:"medium",tag:"operacao",dueDate:""}})},
  ].filter(i=>!term||`${i.title} ${i.meta}`.toLowerCase().includes(term)).slice(0,6),[term,debouncedQ,dispatch,setTab,brandName,C.orange]);
  const items=useMemo(()=>[
    ...state.tasks.map(t=>({type:"Tarefa",tab:"tasks",title:t.title,meta:[t.tag,t.dueDate,t.completed?"concluída":"pendente"].filter(Boolean).join(" · "),color:t.completed?"#6b7280":C.orange})),
    ...(state.clients||[]).map(c=>({type:"Cliente",tab:"clients",title:c.name,meta:[c.service,c.status,c.payment,c.leadTemp,c.nextAction].filter(Boolean).join(" · "),color:STATUS_COLORS[c.status]||"#10b981"})),
    ...(state.clients||[]).flatMap(c=>(c.videos||[]).map(v=>({type:"Projeto",tab:"projects",title:v.title,meta:[c.name,v.type,v.status,v.deadline].filter(Boolean).join(" · "),color:VIDEO_COLORS[v.status]||"#8b5cf6"}))),
    ...(state.studioDocs||[]).map(d=>({type:"Documento",tab:"studio",title:d.title||d.type||"Documento",meta:[d.type,d.preset,d.createdAt].filter(Boolean).join(" · "),color:"#3b82f6"})),
    ...(state.reviewDeliverables||[]).map(r=>({type:"Review",tab:"videoReview",title:r.title||"Video Review",meta:[r.clientName,r.status,r.updatedAt].filter(Boolean).join(" · "),color:"#06b6d4"})),
  ].filter(i=>!term||`${i.type} ${i.title} ${i.meta}`.toLowerCase().includes(term)).slice(0,18),[state,term]);
  return (
    <Modal open={open} onClose={onClose} title="Busca Global" wide>
      <input autoFocus aria-label="Buscar no sistema" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar ou digitar uma ação..." style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",marginBottom:14}}/>
      {commands.length>0&&<><SectionTitle>COMANDOS RÁPIDOS</SectionTitle><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginBottom:14}}>{commands.map((i,idx)=><button key={idx} onClick={()=>{i.run();onClose();}} style={{display:"flex",alignItems:"center",gap:10,textAlign:"left",padding:"11px 12px",borderRadius:12,border:`1px solid ${i.color}35`,background:`${i.color}10`,cursor:"pointer",fontFamily:"inherit"}}><Tag color={i.color}>{i.type}</Tag><span style={{minWidth:0}}><span style={{display:"block",fontSize:12,fontWeight:900,color:"#eee"}}>{i.title}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{i.meta}</span></span></button>)}</div></>}
      {items.length===0&&commands.length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"18px 0"}}>Nada encontrado.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:420,overflowY:"auto"}}>
        {items.map((i,idx)=>(
          <button key={idx} onClick={()=>{setTab(i.tab);onClose();}} style={{display:"flex",alignItems:"center",gap:12,textAlign:"left",padding:"12px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)",cursor:"pointer",fontFamily:"inherit"}}>
            <Tag color={i.color}>{i.type}</Tag>
            <span style={{flex:1,minWidth:0}}><span className={["Cliente","Projeto","Nota"].includes(i.type)?"private-data":""} style={{display:"block",fontSize:13,fontWeight:800,color:"#eee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.title}</span><span className={["Cliente","Projeto","Nota"].includes(i.type)?"private-data":""} style={{display:"block",fontSize:11,color:C.muted,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.meta||"Sem detalhes"}</span></span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
