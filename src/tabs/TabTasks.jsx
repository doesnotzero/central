import React, { useState } from 'react';
import { C } from '../theme.config.js';
import { todayStr, addDaysInput, dayDiff, taskBucket } from '../utils/helpers.js';
import { Card, Tag, Btn, Inp, Modal, SectionTitle } from '../components/ui/index.jsx';

const TabTasks = ({state,dispatch})=>{
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",priority:"medium",tag:"",dueDate:""});
  const [filter,setFilter]=useState("all");
  const [prioFilter,setPrioFilter]=useState("all");
  const prios=[["high","#ef4444","Alta"],["medium",C.orange,"Média"],["low","#6b7280","Baixa"]];
  const taskTemplates=[
    {label:"Responder cliente",title:"Responder cliente no WhatsApp",tag:"cliente",priority:"high",dueDate:todayStr()},
    {label:"Enviar proposta",title:"Enviar proposta comercial",tag:"comercial",priority:"high",dueDate:todayStr()},
    {label:"Revisar edição",title:"Revisar edição e anotar ajustes",tag:"produção",priority:"medium",dueDate:addDaysInput(1)},
    {label:"Cobrar pagamento",title:"Cobrar pagamento pendente",tag:"dinheiro",priority:"high",dueDate:todayStr()},
  ];
  const priorityWeight={high:0,medium:1,low:2};
  const inc=state.tasks.filter(t=>!t.completed).sort((a,b)=>(dayDiff(a.dueDate)??9999)-(dayDiff(b.dueDate)??9999)||(priorityWeight[a.priority]??1)-(priorityWeight[b.priority]??1));
  const done=state.tasks.filter(t=>t.completed);
  const buckets=[
    {id:"all",label:"Todas",items:inc,color:C.orange},
    {id:"overdue",label:"Atrasadas",items:inc.filter(t=>taskBucket(t)==="overdue"),color:"#ef4444"},
    {id:"today",label:"Hoje",items:inc.filter(t=>taskBucket(t)==="today"),color:"#10b981"},
    {id:"week",label:"Semana",items:inc.filter(t=>taskBucket(t)==="week"),color:"#3b82f6"},
    {id:"noDate",label:"Sem prazo",items:inc.filter(t=>taskBucket(t)==="noDate"),color:"#6b7280"},
  ];
  const active=buckets.find(b=>b.id===filter)||buckets[0];
  const activeItems=prioFilter==="all"?active.items:active.items.filter(t=>t.priority===prioFilter);
  const dueTag=t=>{const b=taskBucket(t),diff=dayDiff(t.dueDate);if(b==="overdue")return {txt:`${Math.abs(diff)}d atraso`,c:"#ef4444"};if(b==="today")return {txt:"hoje",c:"#10b981"};if(b==="week")return {txt:`${diff}d`,c:"#3b82f6"};if(b==="later")return {txt:new Date(t.dueDate+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"}),c:"#8b5cf6"};return null;};
  return (
    <div>
      <SectionTitle action={<Btn onClick={()=>setShowAdd(true)} size="sm">+ Nova</Btn>}>TAREFAS INTELIGENTES ({inc.length})</SectionTitle>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
        {buckets.map(b=><button key={b.id} onClick={()=>setFilter(b.id)} style={{padding:"10px 8px",borderRadius:12,border:"1px solid",borderColor:filter===b.id?b.color:C.border,background:filter===b.id?`${b.color}14`:"rgba(255,255,255,.025)",color:filter===b.id?b.color:C.muted,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,fontFamily:"var(--font-display)"}}>{b.items.length}</div><div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",marginTop:2}}>{b.label}</div></button>)}
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
        {[["all",C.orange,"Todas"],...prios].map(([k,c,l])=><button key={k} onClick={()=>setPrioFilter(k)} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:prioFilter===k?c:C.border,background:prioFilter===k?`${c}14`:"transparent",color:prioFilter===k?c:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
      </div>
      {activeItems.length===0&&<Card style={{textAlign:"center",padding:"24px 20px"}}><div style={{fontSize:26,marginBottom:8}}>✓</div><div style={{fontSize:13,color:C.muted}}>Nada nesse filtro.</div></Card>}
      {activeItems.map(t=>{const p=prios.find(p=>p[0]===t.priority),d=dueTag(t);return(
        <Card key={t.id} style={{marginBottom:8,padding:"12px 16px"}}>
          <div className="client-list-row" style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:22,height:22,borderRadius:7,border:`2px solid ${C.border}`,background:"transparent",cursor:"pointer",flexShrink:0,transition:"all .2s"}} onMouseEnter={e=>e.target.style.borderColor=C.orange} onMouseLeave={e=>e.target.style.borderColor=C.border}/>
            <div style={{flex:1}}><div style={{fontSize:13,color:"#e2e2e2"}}>{t.title}</div>{t.dueDate&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📅 {t.dueDate}</div>}</div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>{d&&<Tag color={d.c}>{d.txt}</Tag>}{t.tag&&<Tag color="#6b7280">{t.tag}</Tag>}<Tag color={p?.[1]||C.orange}>{p?.[2]}</Tag><button onClick={()=>dispatch({type:"REMOVE_TASK",id:t.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button></div>
          </div>
        </Card>
      );})}
      {done.length>0&&<>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",margin:"16px 0 10px"}}>CONCLUÍDAS ({done.length})</div>
        {done.slice(0,5).map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7,opacity:.4}}>
            <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:22,height:22,borderRadius:7,background:`${C.orange}30`,border:`2px solid ${C.orange}`,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✓</button>
            <span style={{flex:1,fontSize:13,color:C.muted,textDecoration:"line-through"}}>{t.title}</span>
            {t.completedAt&&<span style={{fontSize:10,color:C.muted}}>{t.completedAt}</span>}
            <button onClick={()=>dispatch({type:"REMOVE_TASK",id:t.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button>
          </div>
        ))}
      </>}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Nova Tarefa">
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Começar sem digitar</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {taskTemplates.map(t=><button key={t.label} onClick={()=>setForm(f=>({...f,title:t.title,tag:t.tag,priority:t.priority,dueDate:t.dueDate}))} style={{padding:"7px 11px",borderRadius:9,border:`1px solid ${form.title===t.title?C.orange:C.border}`,background:form.title===t.title?`${C.orange}15`:"rgba(255,255,255,.035)",color:form.title===t.title?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{t.label}</button>)}
          </div>
        </div>
        <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Descreva a tarefa..."/>
        <Inp label="Tag" value={form.tag} onChange={v=>setForm(f=>({...f,tag:v}))} placeholder="Ex: marca, projeto..."/>
        <Inp label="Prazo" value={form.dueDate} onChange={v=>setForm(f=>({...f,dueDate:v}))} type="date"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Prioridade</div>
          <div style={{display:"flex",gap:7}}>{prios.map(([k,c,l])=><button key={k} onClick={()=>setForm(f=>({...f,priority:k}))} style={{padding:"6px 13px",borderRadius:9,border:"1px solid",borderColor:form.priority===k?c:C.border,background:form.priority===k?`${c}15`:"transparent",color:form.priority===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>)}</div>
        </div>
        <Btn onClick={()=>{if(!form.title)return;dispatch({type:"ADD_TASK",task:form});setForm({title:"",priority:"medium",tag:"",dueDate:""});setShowAdd(false);}}>💾 Criar</Btn>
      </Modal>
    </div>
  );
};

export default TabTasks;
