import React, { useState } from 'react';
import { C } from '../theme.config.js';
import {
  VIDEO_STATUS, VIDEO_COLORS, AUDIOVISUAL_PRESETS,
  PRODUCTION_PIPELINE, PREMIUM_CHECKLIST_CATALOG
} from '../constants/index.js';
import {
  dayDiff, addDaysInput, presetById, presetDeliverables,
  presetBriefing, presetSchedule, buildPremiumChecklist,
  buildVideoProject
} from '../utils/helpers.js';
import { Card, Tag, Btn, Inp, Txt, Bar, Modal, SectionTitle, PremiumEmpty } from '../components/ui/index.jsx';
import { ChipSelector } from '../components/form-fields/ChipSelector.jsx';
import { OptionCards } from '../components/form-fields/OptionCards.jsx';
import { BrandedButton } from '../components/ui/BrandedButton.jsx';
import { useWhitelabel } from '../hooks/useWhitelabel.jsx';

const TabProjects = ({state,dispatch})=>{
  const { branding } = useWhitelabel();
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [checkTab,setCheckTab]=useState("camera");
  const [form,setForm]=useState({clientId:"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});
  const [searchQuery,setSearchQuery]=useState("");
  const projects=(state.clients||[]).flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const stages=["all",...VIDEO_STATUS];
  const filtered = (() => {
    let result = filter === "all" ? projects : projects.filter(p => p.video.status === filter);
    if (searchQuery !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.video.title.toLowerCase().includes(query) || 
        p.client.name.toLowerCase().includes(query)
      );
    }
    return result;
  })();
  const current=selected&&projects.find(p=>p.client.id===selected.clientId&&p.video.id===selected.videoId);
  const checklist=v=>(v.checklist||["Briefing","Roteiro","Captação","Edição","Revisão","Entrega"]).map(i=>typeof i==="string"?{text:i,done:false}:i);
  const deliverables=v=>(v.deliverables||presetDeliverables(presetById(v.presetId||v.type))).map(i=>typeof i==="string"?{text:i,done:false}:i);
  const schedule=v=>(v.productionSchedule||presetSchedule(presetById(v.presetId||v.type),v.deadline)).map(i=>typeof i==="string"?{label:i,date:"",done:false}:i);
  const briefing=v=>({...presetBriefing(presetById(v.presetId||v.type)),...(v.briefing||{})});
  const projectLinks=v=>({briefing:"",drive:v.link||"",reference:"",review:"",delivery:"",...(v.links||{})});
  const premiumChecklist=v=>{
    const base=buildPremiumChecklist(v.presetId||v.type);
    const saved=v.premiumChecklist||{};
    return Object.fromEntries(Object.keys(base).map(k=>[k,(saved[k]||base[k]).map(i=>typeof i==="string"?{text:i,done:false}:i)]));
  };
  const premiumProgress=v=>{
    const groups=Object.values(premiumChecklist(v)).flat();
    const done=groups.filter(i=>i.done).length;
    return {done,total:groups.length,pct:groups.length?Math.round(done/groups.length*100):0};
  };
  const pipelineState=v=>{
    const saved=v.productionPipeline||{};
    const checks=checklist(v);
    const sched=schedule(v);
    const brief=briefing(v);
    const prem=premiumProgress(v);
    const hasBrief=!!(brief.objective||brief.audience||brief.reference||brief.notes||brief.location||brief.shootDate);
    const byText=t=>checks.some(c=>c.done&&String(c.text).toLowerCase().includes(t));
    const schedDone=k=>sched.some(s=>s.done&&(s.key===k||String(s.label||"").toLowerCase().includes(k)));
    const inferred={
      briefing:hasBrief||byText("briefing"),
      roteiro:byText("roteiro")||byText("gancho")||schedDone("script"),
      decupagem:byText("decupagem")||byText("plano"),
      callsheet:byText("callsheet")||byText("cronograma"),
      checklist:prem.pct>=70||checks.length>0&&checks.every(c=>c.done),
      entrega:v.status==="entregue"||schedDone("delivery")||schedDone("entrega")
    };
    return Object.fromEntries(PRODUCTION_PIPELINE.map(step=>[step.key, saved[step.key]??inferred[step.key]??false]));
  };
  const pipelineProgress=v=>{
    const p=pipelineState(v);
    const done=PRODUCTION_PIPELINE.filter(s=>p[s.key]).length;
    return {done,total:PRODUCTION_PIPELINE.length,pct:Math.round(done/PRODUCTION_PIPELINE.length*100),state:p};
  };
  const update=(p,data,silent=false)=>dispatch({type:"UPDATE_CLIENT_VIDEO",clientId:p.client.id,videoId:p.video.id,data,silent});
  const applyProjectPreset=p=>setForm(f=>({...f,presetId:p.id,title:p.title,type:p.type,deadline:f.deadline||addDaysInput(14),checklist:p.checklist}));
  const projectPresetOptions=AUDIOVISUAL_PRESETS.map(p=>({value:p.id,label:p.label,description:`${p.title} · ${p.type}`,icon:"▦"}));
  const projectTypeOptions=["gravação","edição","motion","drone","entrevista","vertical","evento","documentário","ads"].map(type=>({value:type,label:type}));
  const projectDeadlineOptions=[
    {value:addDaysInput(7),label:"+7 dias"},
    {value:addDaysInput(14),label:"+14 dias"},
    {value:addDaysInput(30),label:"+30 dias"},
    {value:addDaysInput(45),label:"+45 dias"},
  ];
  const recentClientOptions=(state.clients||[]).slice(0,8).map(c=>({value:String(c.id),label:c.name}));
  const smartStatus=(v,checks)=>{
    const done=checks.filter(c=>c.done).map(c=>String(c.text).toLowerCase()).join(" ");
    if(checks.length&&checks.every(c=>c.done))return"entregue";
    if(done.includes("revis"))return"revisão";
    if(done.includes("captação")||done.includes("arquivos recebidos")||done.includes("corte bruto"))return"editando";
    if(done.includes("roteiro")||done.includes("plano"))return"gravando";
    return v.status;
  };
  const dueInfo=v=>{const diff=dayDiff(v.deadline);if(diff===null)return null;if(diff<0)return{txt:`${Math.abs(diff)}d atraso`,c:"#ef4444"};if(diff===0)return{txt:"hoje",c:"#10b981"};if(diff<=7)return{txt:`${diff}d`,c:"#3b82f6"};return{txt:new Date(v.deadline+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"}),c:"#8b5cf6"};};
  const projectMilestones=projects.flatMap(p=>schedule(p.video).filter(s=>s.date&&!s.done&&p.video.status!=="entregue").map(s=>({...s,project:p,diff:dayDiff(s.date)}))).sort((a,b)=>(a.diff??99)-(b.diff??99));
  const lateProjects=projects.filter(p=>p.video.status!=="entregue"&&dayDiff(p.video.deadline)<0).length;
  const activeProjects=projects.filter(p=>p.video.status!=="entregue").length;
  const reviewProjects=projects.filter(p=>p.video.status==="revisão").length;
  return (
    <div className="page-stack">
      <Card className="page-hero" style={{background:"rgba(139,92,246,.06)",borderColor:"rgba(139,92,246,.22)"}}>
        <div className="page-hero-row">
          <div><div className="page-eyebrow" style={{color:"#8b5cf6"}}>PRODUÇÃO AUDIOVISUAL</div>
          <div className="page-title">Projetos em operação</div>
          <p className="page-subtitle">Controle briefing, entregáveis, agenda de produção, arquivos e revisão em uma visão mais limpa.</p></div>
          <Btn onClick={()=>{setForm({clientId:(state.clients||[])[0]?.id||"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});setShowAdd(true);}} size="sm" variant="ghost">Novo</Btn>
        </div>
      </Card>
      <div className="summary-strip">
        <div className="metric-tile"><div className="metric-value" style={{color:"#8b5cf6"}}>{activeProjects}</div><div className="metric-label">Ativos</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:"#eab308"}}>{reviewProjects}</div><div className="metric-label">Em revisão</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:lateProjects?"#ef4444":"#10b981"}}>{lateProjects}</div><div className="metric-label">Atrasados</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:C.orange}}>{projectMilestones.filter(m=>m.diff===0).length}</div><div className="metric-label">Marcos hoje</div></div>
      </div>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
        {stages.map(s=>{
          const count=s==="all"?projects.length:projects.filter(p=>p.video.status===s).length;
          const color=s==="all"?C.orange:VIDEO_COLORS[s]||C.orange;
          return <button key={s} onClick={()=>setFilter(s)} style={{padding:"10px 8px",borderRadius:12,border:"1px solid",borderColor:filter===s?color:C.border,background:filter===s?`${color}14`:"rgba(255,255,255,.025)",color:filter===s?color:C.muted,cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:18,fontWeight:900,fontFamily:"'Syne',sans-serif"}}>{count}</div><div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",marginTop:2}}>{s==="all"?"Todos":s}</div></button>;
        })}
      </div>
      <div className="split-layout">
        <div className="dense-list">
          {filtered.length===0&&<PremiumEmpty icon="▦" title="Nenhum projeto nesta etapa" text="Use um preset audiovisual para criar briefing, entregáveis, agenda e checklist automaticamente." action={<Btn onClick={()=>{setForm({clientId:(state.clients||[])[0]?.id||"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});setShowAdd(true);}} size="sm">Novo projeto</Btn>}/>}
          {filtered.map(p=>{
          const d=dueInfo(p.video),checks=checklist(p.video),done=checks.filter(c=>c.done).length,pct=checks.length?Math.round(done/checks.length*100):0;
          const flow=pipelineProgress(p.video);
          const premium=premiumProgress(p.video);
          const lateSteps=schedule(p.video).filter(x=>x.date&&!x.done&&dayDiff(x.date)<0).length;
          const nextStatus=VIDEO_STATUS[Math.min(VIDEO_STATUS.length-1,VIDEO_STATUS.indexOf(p.video.status)+1)]||"pendente";
          return (
            <Card key={`${p.client.id}-${p.video.id}`} onClick={()=>setSelected({clientId:p.client.id,videoId:p.video.id})} style={{cursor:"pointer",padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:8}}>
                <div style={{minWidth:0}}><div className="private-data" style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{p.video.title}</div><div className="private-data" style={{fontSize:12,color:C.muted,marginTop:2}}>{p.client.name} · {p.video.type}</div></div>
                <Tag color={VIDEO_COLORS[p.video.status]||C.orange}>{p.video.status}</Tag>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>{d&&<Tag color={d.c}>{d.txt}</Tag>}{p.video.link&&<Tag color="#3b82f6">link</Tag>}{lateSteps>0&&<Tag color="#ef4444">{lateSteps} marco atraso</Tag>}<Tag color="#8b5cf6">{done}/{checks.length}</Tag><Tag color="#06b6d4">set {premium.done}/{premium.total}</Tag>{p.video.status!=="entregue"&&<button onClick={e=>{e.stopPropagation();update(p,{status:nextStatus});}} style={{marginLeft:"auto",border:`1px solid ${(VIDEO_COLORS[nextStatus]||C.orange)}45`,background:`${VIDEO_COLORS[nextStatus]||C.orange}12`,color:VIDEO_COLORS[nextStatus]||C.orange,borderRadius:9,padding:"5px 9px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Avançar → {nextStatus}</button>}</div>
              <div className="project-flow" aria-label="Pipeline do projeto">
                {PRODUCTION_PIPELINE.map(step=>(
                  <div key={step.key} className={`project-flow-step ${flow.state[step.key]?"done":step.key===current?.video?.status?"active":""}`}>
                    <div className="project-flow-dot" style={{borderColor:flow.state[step.key]?`${step.color}88`:undefined,color:flow.state[step.key]?step.color:undefined}}>{flow.state[step.key]?"✓":step.label.slice(0,1)}</div>
                    <div className="project-flow-label">{step.label}</div>
                  </div>
                ))}
              </div>
              <Bar v={pct} color={VIDEO_COLORS[p.video.status]||"#8b5cf6"} h={5}/>
            </Card>
          );
          })}
        </div>
        <aside className="side-panel">
          <Card style={{padding:"16px"}}>
            <SectionTitle>PRÓXIMOS MARCOS</SectionTitle>
            {projectMilestones.length===0&&<div style={{fontSize:13,color:C.muted}}>Nenhum marco pendente.</div>}
            {projectMilestones.slice(0,6).map((m,i)=>{
              const color=m.diff<0?"#ef4444":m.diff===0?C.orange:"#3b82f6";
              return <button key={i} onClick={()=>setSelected({clientId:m.project.client.id,videoId:m.project.video.id})} style={{width:"100%",textAlign:"left",padding:"10px 0",border:"none",borderBottom:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#eee",fontWeight:900}}>{m.label}</span><Tag color={color}>{m.diff<0?`${Math.abs(m.diff)}d atraso`:m.diff===0?"hoje":`${m.diff}d`}</Tag></div>
                <div className="private-data" style={{fontSize:11,color:C.muted,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.project.video.title} · {m.project.client.name}</div>
              </button>;
            })}
          </Card>
          <Card style={{padding:"16px"}}>
            <SectionTitle>ATALHOS</SectionTitle>
            <div style={{display:"grid",gap:8}}>
              <Btn onClick={()=>setFilter("pendente")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Pendentes</Btn>
              <Btn onClick={()=>setFilter("editando")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Em edição</Btn>
              <Btn onClick={()=>setFilter("revisão")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Revisão</Btn>
            </div>
          </Card>
        </aside>
      </div>
      <Modal open={!!current} onClose={()=>setSelected(null)} title={current?.video?.title||"Projeto"} wide>
        {current&&(()=>{
          const checks=checklist(current.video);
          const dels=deliverables(current.video);
          const sched=schedule(current.video);
          const brief=briefing(current.video);
          const links=projectLinks(current.video);
          const suggested=smartStatus(current.video,checks);
          const flow=pipelineProgress(current.video);
          const premium=premiumChecklist(current.video);
          const currentPremium=premium[checkTab]||[];
          const premiumStats=premiumProgress(current.video);
          return <div>
            <div className="modal-section primary">
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Prazo" type="date" value={current.video.deadline||""} onChange={v=>update(current,{deadline:v},true)}/>
              <Inp label="Link / pasta" value={current.video.link||""} onChange={v=>update(current,{link:v},true)} placeholder="URL ou caminho"/>
            </div>
            <div style={{marginBottom:14}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Etapa</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{VIDEO_STATUS.map(s=><button key={s} onClick={()=>update(current,{status:s})} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:current.video.status===s?(VIDEO_COLORS[s]||C.orange):C.border,background:current.video.status===s?`${VIDEO_COLORS[s]||C.orange}15`:"transparent",color:current.video.status===s?(VIDEO_COLORS[s]||C.orange):C.muted,fontSize:11,fontWeight:800,cursor:"pointer"}}>{s}</button>)}</div></div>
            {suggested!==current.video.status&&<button onClick={()=>update(current,{status:suggested})} style={{width:"100%",marginBottom:14,padding:"10px 12px",borderRadius:12,border:`1px solid ${(VIDEO_COLORS[suggested]||C.orange)}35`,background:`${VIDEO_COLORS[suggested]||C.orange}10`,color:VIDEO_COLORS[suggested]||C.orange,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Sugestão inteligente: mover para {suggested}</button>}
            </div>

            <div className="modal-section" style={{background:"rgba(255,36,0,.04)",borderColor:"rgba(255,36,0,.18)"}}>
              <SectionTitle>PIPELINE VISUAL</SectionTitle>
              <div className="project-flow">
                {PRODUCTION_PIPELINE.map(step=>{
                  const done=flow.state[step.key];
                  return <button key={step.key} onClick={()=>update(current,{productionPipeline:{...(current.video.productionPipeline||{}),[step.key]:!done}},true)} className={`project-flow-step ${done?"done":""}`} style={{background:"transparent",border:"none",fontFamily:"inherit",cursor:"pointer"}}>
                    <div className="project-flow-dot" style={{borderColor:done?`${step.color}88`:undefined,color:done?step.color:undefined}}>{done?"✓":step.label.slice(0,1)}</div>
                    <div className="project-flow-label">{step.label}</div>
                  </button>;
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginTop:8}}>
                <div style={{fontSize:11,color:C.muted}}>Documentos/etapas concluídos: {flow.done}/{flow.total}</div>
                <Tag color={flow.pct>=70?"#10b981":C.orange}>{flow.pct}% fluxo</Tag>
              </div>
            </div>

            <div className="modal-section">
            <SectionTitle>BRIEFING GUIADO</SectionTitle>
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Objetivo" value={brief.objective} onChange={v=>update(current,{briefing:{...brief,objective:v}},true)} placeholder="O que esse vídeo precisa gerar?"/>
              <Inp label="Público" value={brief.audience} onChange={v=>update(current,{briefing:{...brief,audience:v}},true)} placeholder="Para quem é?"/>
              <Inp label="Referência" value={brief.reference} onChange={v=>update(current,{briefing:{...brief,reference:v}},true)} placeholder="Link ou direção visual"/>
              <Inp label="Duração" value={brief.duration} onChange={v=>update(current,{briefing:{...brief,duration:v}},true)} placeholder="15s, 60s, 5min..."/>
              <Inp label="Formato" value={brief.format} onChange={v=>update(current,{briefing:{...brief,format:v}},true)} placeholder="9:16, 16:9, stories..."/>
              <Inp label="Local" value={brief.location} onChange={v=>update(current,{briefing:{...brief,location:v}},true)} placeholder="Estúdio, cliente, evento..."/>
              <Inp label="Data de captação" type="date" value={brief.shootDate} onChange={v=>update(current,{briefing:{...brief,shootDate:v}},true)}/>
            </div>
            <Txt label="Notas de briefing" value={brief.notes} onChange={v=>update(current,{briefing:{...brief,notes:v}},true)} placeholder="Tom, narrativa, restrições, roteiro, falas..." rows={3}/>
            </div>

            <div className="modal-section">
            <SectionTitle>ENTREGÁVEIS</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}} className="modal-grid">
              {dels.map((d,i)=><div key={i} onClick={()=>update(current,{deliverables:dels.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 10px",borderRadius:10,background:d.done?"rgba(16,185,129,.1)":"rgba(255,255,255,.035)",border:`1px solid ${d.done?"rgba(16,185,129,.25)":C.border}`}}>
                <span style={{width:18,height:18,borderRadius:6,border:`2px solid ${d.done?"#10b981":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#10b981"}}>{d.done?"✓":""}</span>
                <span style={{fontSize:12,color:d.done?C.muted:"#ddd",fontWeight:700,textDecoration:d.done?"line-through":"none"}}>{d.text}</span>
              </div>)}
            </div>

            <SectionTitle>AGENDA DE PRODUÇÃO</SectionTitle>
            {sched.map((s,i)=>{
              const diff=dayDiff(s.date),color=s.done?"#10b981":diff<0?"#ef4444":diff===0?C.orange:"#3b82f6";
              return <div key={s.key||i} style={{display:"grid",gridTemplateColumns:"1fr 150px 32px",gap:8,alignItems:"center",marginBottom:8}}>
                <div style={{padding:"9px 10px",borderRadius:10,background:`${color}0f`,border:`1px solid ${color}28`}}><div style={{fontSize:12,color:"#eee",fontWeight:800}}>{s.label}</div>{diff!==null&&<div style={{fontSize:10,color,marginTop:2,fontWeight:800}}>{diff<0?`${Math.abs(diff)}d atraso`:diff===0?"hoje":`${diff}d`}</div>}</div>
                <input type="date" value={s.date||""} onChange={e=>update(current,{productionSchedule:sched.map((x,j)=>j===i?{...x,date:e.target.value}:x)},true)} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>update(current,{productionSchedule:sched.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{height:32,borderRadius:9,border:`1px solid ${s.done?"#10b981":C.border}`,background:s.done?"rgba(16,185,129,.14)":"transparent",color:s.done?"#10b981":C.muted,cursor:"pointer"}}>{s.done?"✓":"○"}</button>
              </div>;
            })}
            </div>

            <div className="modal-section">
            <SectionTitle>CENTRAL DE ARQUIVOS</SectionTitle>
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Briefing" value={links.briefing} onChange={v=>update(current,{links:{...links,briefing:v}},true)} placeholder="Documento de briefing"/>
              <Inp label="Pasta Drive" value={links.drive} onChange={v=>update(current,{links:{...links,drive:v},link:v},true)} placeholder="Pasta do projeto"/>
              <Inp label="Referências" value={links.reference} onChange={v=>update(current,{links:{...links,reference:v}},true)} placeholder="Moodboard, referências"/>
              <Inp label="Versão para revisão" value={links.review} onChange={v=>update(current,{links:{...links,review:v}},true)} placeholder="Frame.io, Drive..."/>
              <Inp label="Entrega final" value={links.delivery} onChange={v=>update(current,{links:{...links,delivery:v}},true)} placeholder="Link final"/>
            </div>
            <SectionTitle>CHECKLIST AUDIOVISUAL PREMIUM</SectionTitle>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:C.muted}}>Câmera, áudio, luz, produção, dados e pós-produção em padrão de set.</div>
              <Tag color="#06b6d4">{premiumStats.done}/{premiumStats.total}</Tag>
            </div>
            <div className="premium-check-tabs">
              {Object.keys(premium).map(k=>(
                <button key={k} onClick={()=>setCheckTab(k)} className={`premium-check-tab ${checkTab===k?"active":""}`}>{k}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}} className="modal-grid">
              {currentPremium.map((item,i)=>(
                <div key={`${checkTab}-${i}`} onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map((x,j)=>j===i?{...x,done:!x.done}:x)}},true)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 10px",borderRadius:2,background:item.done?"rgba(16,185,129,.1)":"rgba(255,255,255,.035)",border:`1px solid ${item.done?"rgba(16,185,129,.28)":C.border}`}}>
                  <span style={{width:18,height:18,borderRadius:2,border:`2px solid ${item.done?"#10b981":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#10b981",flexShrink:0}}>{item.done?"✓":""}</span>
                  <span style={{fontSize:12,color:item.done?C.muted:"#ddd",fontWeight:700,textDecoration:item.done?"line-through":"none",lineHeight:1.35}}>{item.text}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
              <Btn onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map(x=>({...x,done:true}))}},true)} variant="ghost" size="sm">Marcar categoria</Btn>
              <Btn onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map(x=>({...x,done:false}))}},true)} variant="ghost" size="sm">Limpar categoria</Btn>
            </div>
            <SectionTitle>CHECKLIST DE PRODUÇÃO</SectionTitle>
            {checks.map((c,i)=>(
              <div key={i} onClick={()=>update(current,{checklist:checks.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer",padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,.035)"}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${c.done?"#10b981":C.border}`,background:c.done?"rgba(16,185,129,.18)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#10b981"}}>{c.done?"✓":""}</div>
                <span style={{fontSize:13,color:c.done?C.muted:"#ddd",textDecoration:c.done?"line-through":"none"}}>{c.text}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
              {Object.entries(links).filter(([,v])=>v).map(([k,v])=><Btn key={k} onClick={()=>window.open(v,"_blank")} variant="ghost" size="sm">Abrir {k}</Btn>)}
            </div>
            </div>
          </div>;
        })()}
      </Modal>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Novo Projeto" wide>
        {(state.clients||[]).length===0&&<div style={{fontSize:13,color:C.muted,marginBottom:14}}>Cadastre um cliente antes de criar um projeto.</div>}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Preset audiovisual</div>
          <OptionCards options={projectPresetOptions} value={form.presetId} onChange={id=>applyProjectPreset(presetById(id))}/>
        </div>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Cliente</div>
          {recentClientOptions.length>0&&<div style={{marginBottom:10}}><ChipSelector options={recentClientOptions} value={String(form.clientId||"")} onChange={v=>setForm(f=>({...f,clientId:v}))} size="sm"/></div>}
          <select value={String(form.clientId||"")} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none"}}>
            {(state.clients||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Vídeo institucional"/>
          <Inp label="Prazo" type="date" value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))}/>
          <Inp label="Link / pasta" value={form.link} onChange={v=>setForm(f=>({...f,link:v}))} placeholder="Drive, Frame.io..."/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"0 0 14px"}} className="modal-grid">
          <div>
            <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de prazo</div>
            <ChipSelector options={projectDeadlineOptions} value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))} size="sm"/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Tipo de projeto</div>
            <ChipSelector options={projectTypeOptions} value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} size="sm"/>
          </div>
        </div>
        {form.checklist?.length>0&&<div style={{marginBottom:14,padding:"11px 12px",borderRadius:12,background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:7}}>Checklist aplicado</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{form.checklist.map(i=><Tag key={i} color="#8b5cf6">{i}</Tag>)}</div>
        </div>}
        <Btn disabled={!form.clientId||!form.title} onClick={()=>{dispatch({type:"ADD_CLIENT_VIDEO",id:Number(form.clientId),video:buildVideoProject(form)});setShowAdd(false);}}>Criar projeto</Btn>
      </Modal>
    </div>
  );
};

export default TabProjects;
