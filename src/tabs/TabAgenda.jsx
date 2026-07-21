import React, { useState } from 'react';
import { C } from '../theme.config.js';
import { VIDEO_COLORS } from '../constants/index.js';
import { timeToMins, dayDiff, taskBucket } from '../utils/helpers.js';
import { Card, Tag, Btn, Inp, Modal, SectionTitle, PremiumEmpty } from '../components/ui/index.jsx';

const DAYS_AGENDA = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];

const TabAgenda = ({state,dispatch,setTab})=>{
  const todayDow=new Date().getDay()===0?6:new Date().getDay()-1;
  const [selDay,setSelDay]=useState(todayDow);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",start:"08:00",end:"09:00",color:"#f97316",category:"trabalho"});
  const blocks=(state.scheduleBlocks[selDay]||[]).slice().sort((a,b)=>timeToMins(a.start)-timeToMins(b.start));
  const categories=["trabalho","criação","reunião","pausa","pessoal","estudo"];
  const catColors={trabalho:"#f97316",criação:"#8b5cf6",reunião:"#3b82f6",pausa:"#6b7280",pessoal:"#10b981",estudo:"#eab308"};
  const clients=state.clients||[],projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const agendaItems=[
    ...state.tasks.filter(t=>!t.completed&&t.dueDate).map(t=>({tab:"tasks",kind:"Tarefa",title:t.title,date:t.dueDate,color:taskBucket(t)==="overdue"?"#ef4444":C.orange})),
    ...clients.filter(c=>c.nextMeeting).map(c=>({tab:"clients",kind:"Reunião",title:c.name,date:c.nextMeeting,color:"#3b82f6",private:true})),
    ...clients.filter(c=>c.followUpDate).map(c=>({tab:"clients",kind:"Follow-up",title:c.name,date:c.followUpDate,color:"#10b981",private:true})),
    ...projects.filter(p=>p.video.deadline&&p.video.status!=="entregue").map(p=>({tab:"projects",kind:"Projeto",title:p.video.title,date:p.video.deadline,color:VIDEO_COLORS[p.video.status]||"#8b5cf6",private:true})),
    ...projects.flatMap(p=>(p.video.productionSchedule||[]).filter(s=>s.date&&!s.done&&p.video.status!=="entregue").map(s=>({tab:"projects",kind:"Produção",title:`${p.video.title} · ${s.label}`,date:s.date,color:"#8b5cf6",private:true}))),
    ...(state.financeEntries||[]).filter(e=>e.date&&e.status!=="pago").map(e=>({tab:"finance",kind:e.type==="despesa"?"Despesa":"Financeiro",title:e.title,date:e.date,color:e.type==="despesa"?"#ef4444":"#eab308"})),
  ].map(i=>({...i,diff:dayDiff(i.date)})).filter(i=>i.diff!==null&&i.diff<=7).sort((a,b)=>a.diff-b.diff).slice(0,10);
  const addBlock=()=>{
    if(!form.title)return;
    dispatch({type:"ADD_SCHEDULE_BLOCK",day:selDay,block:{...form,color:catColors[form.category]||form.color}});
    setForm({title:"",start:"08:00",end:"09:00",color:"#f97316",category:"trabalho"});setShowAdd(false);
  };
  const totalMins=Object.values(state.scheduleBlocks).flat().reduce((a,b)=>{const dur=timeToMins(b.end||"09:00")-timeToMins(b.start||"08:00");return a+(dur>0?dur:0);},0);
  return (
    <div>
      <Card style={{padding:"16px 18px",marginBottom:14,background:"rgba(59,130,246,.06)",borderColor:"rgba(59,130,246,.2)"}}>
        <SectionTitle>AGENDA INTELIGENTE</SectionTitle>
        {agendaItems.length===0&&<div style={{fontSize:13,color:C.muted}}>Agenda limpa nos próximos 7 dias. Use blocos semanais para reservar produção, reunião e revisão.</div>}
        {agendaItems.map((i,idx)=><button key={idx} onClick={()=>setTab(i.tab)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}>
          <Tag color={i.color}>{i.kind}</Tag>
          <span className={i.private?"private-data":""} style={{flex:1,minWidth:0,fontSize:13,color:"#ddd",fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.title}</span>
          <span style={{fontSize:11,color:i.diff<0?"#ef4444":i.diff===0?"#10b981":C.muted,fontWeight:900}}>{i.diff<0?`${Math.abs(i.diff)}d atraso`:i.diff===0?"hoje":`${i.diff}d`}</span>
        </button>)}
      </Card>
      <div style={{display:"flex",gap:10,marginBottom:16,justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:C.muted}}>🕐 {Math.round(totalMins/60)}h planejadas na semana</div>
        <Btn onClick={()=>setShowAdd(true)} size="sm">+ Bloco</Btn>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto"}}>
        {DAYS_AGENDA.map((d,i)=>{
          const hasBlocks=(state.scheduleBlocks[i]||[]).length>0;
          return <button key={i} onClick={()=>setSelDay(i)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid",borderColor:selDay===i?C.orange:C.border,background:selDay===i?`${C.orange}15`:"transparent",color:selDay===i?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,position:"relative",transition:"all .15s"}}>
            {d.substring(0,3)}{i===todayDow&&<span style={{display:"block",width:4,height:4,borderRadius:"50%",background:C.orange,margin:"2px auto 0"}}/>}{hasBlocks&&i!==todayDow&&<span style={{display:"block",width:4,height:4,borderRadius:"50%",background:"#444",margin:"2px auto 0"}}/>}
          </button>;
        })}
      </div>
      {blocks.length===0&&<PremiumEmpty icon="□" title={`Nenhum bloco para ${DAYS_AGENDA[selDay]}`} text="Planeje produção, revisão, reunião ou pausa para transformar a semana em execução." action={<Btn onClick={()=>setShowAdd(true)} size="sm">Criar bloco</Btn>}/>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {blocks.map(b=>{
          const dur=timeToMins(b.end||"09:00")-timeToMins(b.start||"08:00");
          return (
            <div key={b.id} className="card-hover" style={{display:"flex",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,borderLeft:`4px solid ${b.color||C.orange}`,transition:"all .2s"}}>
              <div style={{minWidth:80}}>
                <div style={{fontSize:13,fontWeight:800,color:b.color||C.orange,fontFamily:"'Syne',sans-serif"}}>{b.start}</div>
                <div style={{fontSize:11,color:C.muted}}>{b.end} · {dur>0?`${Math.round(dur/60*10)/10}h`:"—"}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#e2e2e2"}}>{b.title}</div>
                <Tag color={b.color||C.orange}>{b.category||"trabalho"}</Tag>
              </div>
              <button onClick={()=>dispatch({type:"REMOVE_SCHEDULE_BLOCK",day:selDay,id:b.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          );
        })}
      </div>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={`Novo bloco — ${DAYS_AGENDA[selDay]}`}>
        <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Edição do reel"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <Inp label="Início" value={form.start} onChange={v=>setForm(f=>({...f,start:v}))} type="time"/>
          <Inp label="Fim" value={form.end} onChange={v=>setForm(f=>({...f,end:v}))} type="time"/>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Categoria</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {categories.map(cat=><button key={cat} onClick={()=>setForm(f=>({...f,category:cat,color:catColors[cat]}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:form.category===cat?catColors[cat]:C.border,background:form.category===cat?`${catColors[cat]}15`:"transparent",color:form.category===cat?catColors[cat]:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{cat}</button>)}
          </div>
        </div>
        <Btn onClick={addBlock}>💾 Adicionar</Btn>
      </Modal>
    </div>
  );
};

export default TabAgenda;
