import React, { useState } from 'react';
import { APP_NAME, C } from '../theme.config.js';
import { QUOTES, PROFILE_PRESETS, normalizeClientStatus } from '../constants/index.js';
import { dayDiff, taskBucket, fmtCurrency, fmtDashboardMoney } from '../utils/helpers.js';
import { Card, Tag, Btn, EyeToggle, SectionTitle } from '../components/ui/index.jsx';

const RevenueOSScore = ({state,setTab,privacyMode,isAdmin,onToggleMoney})=>{
  const clients=state.clients||[],projects=clients.flatMap(c=>(c.videos||[])),entries=state.financeEntries||[];
  const proposals=clients.flatMap(c=>(c.proposals||[]));
  const checks=[
    {label:"CRM com clientes",done:clients.length>0,tab:"clients",hint:"Cadastre seu primeiro lead ou cliente."},
    {label:"Propostas no histórico",done:proposals.length>0,tab:"proposta",hint:"Crie proposta vinculada ao cliente."},
    {label:"Produção mapeada",done:projects.length>0,tab:"projects",hint:"Use presets audiovisuais para abrir projetos."},
    {label:"Financeiro previsível",done:entries.length>0||clients.some(c=>Number(c.value||0)>0),tab:"finance",hint:"Registre contratos, entradas ou despesas."},
    {label:"Negócio configurado",done:!!state.business?.onboarded,tab:"business",hint:"Configure marca, WhatsApp e ticket médio."},
    {label:"Brand Book disponível",done:true,tab:"brandbook",hint:"Revise logo, cores, voz e exportação."},
  ];
  const score=Math.round(checks.filter(c=>c.done).length/checks.length*100);
  const pipeline=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).reduce((a,c)=>a+Number(c.value||0)*(Number(c.closeProbability||c.probability||50)/100),0);
  return (
    <Card style={{padding:"18px",background:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(255,255,255,.025))",borderColor:"rgba(249,115,22,.2)",overflow:"hidden"}}>
      <div className="revenue-score-grid">
        <div style={{textAlign:"center"}}>
          <div style={{width:128,height:128,borderRadius:"50%",margin:"0 auto",display:"grid",placeItems:"center",background:`conic-gradient(${score>=70?"#10b981":score>=40?C.orange:"#eab308"} ${score*3.6}deg, rgba(255,255,255,.07) 0deg)`,boxShadow:"0 24px 70px rgba(0,0,0,.35)"}}>
            <div style={{width:104,height:104,borderRadius:"50%",background:"#151515",display:"grid",placeItems:"center"}}>
              <div><div style={{fontSize:30,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1}}>{score}%</div><div style={{fontSize:9,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",marginTop:4}}>{APP_NAME}</div></div>
            </div>
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{minWidth:0,flex:"1 1 220px"}}>
              <div style={{fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase"}}>Radar operacional</div>
              <div style={{fontSize:17,color:"#fff",fontWeight:900,fontFamily:"'Syne',sans-serif",marginTop:4}}>Próximas decisões da {state.business?.brandName||APP_NAME}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"flex-end",flexWrap:"wrap",maxWidth:"100%"}}>
              <EyeToggle hidden={privacyMode} onClick={onToggleMoney}/>
              <Tag color="#10b981">{privacyMode?"Pipeline oculto":`${fmtCurrency(pipeline)} pipeline`}</Tag>
            </div>
          </div>
          <div style={{display:"grid",gap:7}}>
            {checks.map(c=><button key={c.label} onClick={()=>setTab(c.tab)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"8px 0",border:"none",borderBottom:`1px solid ${C.border}`,background:"transparent",color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <span><span style={{fontSize:12,fontWeight:900,color:c.done?"#10b981":"#eee"}}>{c.done?"✓":"○"} {c.label}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{c.done?"Pronto":c.hint}</span></span>
              <span style={{fontSize:10,color:c.done?"#10b981":C.orange,fontWeight:900}}>{c.done?"OK":"abrir"}</span>
            </button>)}
          </div>
        </div>
      </div>
    </Card>
  );
};

const ExecutiveBriefing = ({state,setTab,privacyMode})=>{
  const clients=state.clients||[];
  const projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const entries=state.financeEntries||[];
  const activeClients=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length;
  const pipelineValue=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).reduce((a,c)=>a+Number(c.value||0)*(Number(c.closeProbability||50)/100),0);
  const productionOpen=projects.filter(p=>p.video.status!=="entregue").length;
  const receivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const tasksDue=(state.tasks||[]).filter(t=>!t.completed&&["overdue","today"].includes(taskBucket(t))).length;
  const cards=[
    {label:"Receita prevista",value:fmtDashboardMoney(pipelineValue,privacyMode),note:`${activeClients} cliente${activeClients===1?" em negociação":"s em negociação"}`,tab:"clients",color:"#10b981",money:true},
    {label:"Produção aberta",value:productionOpen,note:"projetos ainda não entregues",tab:"projects",color:"#8b5cf6"},
    {label:"A receber",value:fmtDashboardMoney(receivable,privacyMode),note:"contratos e lançamentos pendentes",tab:"finance",color:"#3b82f6",money:true},
    {label:"Agenda crítica",value:tasksDue,note:"tarefas para hoje ou atrasadas",tab:"tasks",color:C.orange},
  ];
  return (
    <div className="elite-briefing">
      {cards.map(card=>(
        <button key={card.label} className="elite-brief-card" style={{"--accent":card.color,textAlign:"left",fontFamily:"inherit"}} onClick={()=>setTab(card.tab)}>
          <div className="elite-brief-label">{card.label}</div>
          <div className={`elite-brief-value ${card.money?"money":""}`}>{card.value}</div>
          <div className="elite-brief-note">{card.note}</div>
          <div className="elite-brief-action">Abrir área</div>
        </button>
      ))}
    </div>
  );
};

const TabDashboard = ({state,dispatch,quoteIdx,setTab,privacyMode,setPrivacyMode,userName,isAdmin})=>{
  const [revealDashboardMoney,setRevealDashboardMoney]=useState(false);
  const [showDashboardDetails,setShowDashboardDetails]=useState(false);
  const pendingTasks=state.tasks.filter(t=>!t.completed);
  const overdueTasks=pendingTasks.filter(t=>taskBucket(t)==="overdue");
  const todayTasks=pendingTasks.filter(t=>taskBucket(t)==="today");
  const totalReceivable=(state.clients||[]).filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0);
  const overduePayments=(state.clients||[]).filter(c=>c.payment==="atrasado");
  const pendingFollowUps=(state.clients||[]).filter(c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&!["entregue","pago"].includes(normalizeClientStatus(c)));
  const pendingVideos=(state.clients||[]).reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0);
  const projectSteps=(state.clients||[]).flatMap(c=>(c.videos||[]).flatMap(v=>(v.productionSchedule||[]).filter(s=>!s.done&&s.date&&v.status!=="entregue").map(s=>({client:c,video:v,step:s,diff:dayDiff(s.date)}))));
  const lateProjectSteps=projectSteps.filter(x=>x.diff<0);
  const todayProjectSteps=projectSteps.filter(x=>x.diff===0);
  const upcomingMeetings=(state.clients||[]).filter(c=>{if(!c.nextMeeting)return false;const diff=Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24));return diff>=0&&diff<=7;}).sort((a,b)=>new Date(a.nextMeeting)-new Date(b.nextMeeting));
  const lastBackup=localStorage.getItem("dcc_last_backup");
  const backupDays=lastBackup?Math.floor((new Date()-new Date(lastBackup))/(1000*60*60*24)):null;
  const attention=[
    overdueTasks.length&&{label:`${overdueTasks.length} tarefa${overdueTasks.length>1?"s":""} atrasada${overdueTasks.length>1?"s":""}`,tab:"tasks",color:"#ef4444"},
    todayTasks.length&&{label:`${todayTasks.length} tarefa${todayTasks.length>1?"s":""} para hoje`,tab:"tasks",color:"#10b981"},
    overduePayments.length&&{label:`${overduePayments.length} pagamento${overduePayments.length>1?"s":""} atrasado${overduePayments.length>1?"s":""}`,tab:"clients",color:"#ef4444"},
    pendingFollowUps.length&&{label:`${pendingFollowUps.length} follow-up${pendingFollowUps.length>1?"s":""} pendente${pendingFollowUps.length>1?"s":""}`,tab:"clients",color:"#f97316"},
    lateProjectSteps.length&&{label:`${lateProjectSteps.length} marco${lateProjectSteps.length>1?"s":""} de produção atrasado${lateProjectSteps.length>1?"s":""}`,tab:"projects",color:"#ef4444"},
    todayProjectSteps.length&&{label:`${todayProjectSteps.length} entrega${todayProjectSteps.length>1?"s":""} de produção hoje`,tab:"projects",color:"#8b5cf6"},
    upcomingMeetings.length&&{label:`${upcomingMeetings.length} ${upcomingMeetings.length>1?"reuniões":"reunião"} na semana`,tab:"clients",color:"#3b82f6"},
    pendingVideos>0&&{label:`${pendingVideos} vídeo${pendingVideos>1?"s":""} em produção`,tab:"clients",color:"#8b5cf6"},
    (backupDays===null||backupDays>=7)&&{label:backupDays===null?"Backup ainda não registrado":`Backup há ${backupDays} dias`,tab:"export",color:"#eab308"},
  ].filter(Boolean);
  const dailyActions=[
    overdueTasks.length&&{title:"Resolver atividades atrasadas",text:`${overdueTasks.length} atividade${overdueTasks.length>1?"s":""} ficou para trás.`,tab:"tasks",color:"#ef4444"},
    pendingFollowUps.length&&{title:"Responder clientes",text:`${pendingFollowUps.length} follow-up${pendingFollowUps.length>1?"s":""} pede retorno hoje.`,tab:"clients",color:"#f97316"},
    lateProjectSteps.length&&{title:"Destravar produção",text:`${lateProjectSteps.length} marco${lateProjectSteps.length>1?"s":""} de projeto em atraso.`,tab:"projects",color:"#8b5cf6"},
    overduePayments.length&&{title:"Cobrar pendências",text:`${overduePayments.length} pagamento${overduePayments.length>1?"s":""} em atraso.`,tab:"finance",color:"#eab308"},
    todayTasks.length&&{title:"Executar as atividades de hoje",text:`${todayTasks.length} atividade${todayTasks.length>1?"s":""} para finalizar hoje.`,tab:"tasks",color:"#10b981"},
    upcomingMeetings.length&&{title:"Preparar reunião",text:`${upcomingMeetings.length} ${upcomingMeetings.length>1?"reuniões":"reunião"} nos próximos dias.`,tab:"clients",color:"#3b82f6"},
  ].filter(Boolean);
  const primaryAction=dailyActions[0]||{title:"Comece por um cliente",text:`Cadastre ou atualize um cliente para ${state.business?.brandName||APP_NAME} organizar proposta, produção e revisão.`,tab:"clients",color:C.orange};
  const dashboardPrivacy=privacyMode||!revealDashboardMoney;
  const toggleDashboardMoney=()=>{
    if(dashboardPrivacy){
      setPrivacyMode?.(false);
      setRevealDashboardMoney(true);
    }else{
      setRevealDashboardMoney(false);
    }
  };
  const selectProfile=p=>{
    dispatch({type:"UPDATE_BUSINESS",data:{profile:p.id,type:p.type,ticketAverage:p.ticket,mainServices:p.services,onboarded:true}});
  };
  const quickActions=[
    {title:"Novo cliente",text:"Pacotes, origem e próxima ação por botões.",tab:"clients",color:"#10b981"},
    {title:"Nova atividade",text:"Modelos prontos para comercial e produção.",tab:"tasks",color:C.orange},
    {title:"Novo projeto",text:"Briefing, cronograma e checklist saem de presets.",tab:"projects",color:"#8b5cf6"},
    {title:"Documento PDF",text:"Escolha o tipo e gere com a estrutura correta.",tab:"studio",color:"#06b6d4"},
  ];
  return (
    <div className="page-stack">
      <Card className="elite-dashboard-hero">
        <div className="elite-dashboard-grid">
          <div>
            <div className="elite-kicker">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div>
            <div style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1,marginTop:8}}>Bom trabalho, {userName||"criador"}.</div>
            <p style={{fontSize:14,color:"#aaa",lineHeight:1.6,maxWidth:620,margin:"12px 0 0"}}>Seu cockpit mostra o que merece decisão agora: receita prevista, produção aberta, próximos compromissos e execução do dia.</p>
            <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:C.muted}}>Atualizado {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
              <EyeToggle hidden={dashboardPrivacy} onClick={toggleDashboardMoney}/>
            </div>
          </div>
          <div className="elite-command-panel">
            <div style={{fontSize:10,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:8}}>Direção do dia</div>
            <p style={{margin:"0 0 12px",fontSize:13,color:"#d6d6d6",lineHeight:1.55}}>"{QUOTES[quoteIdx%QUOTES.length]}"</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="elite-secondary" onClick={()=>setTab("videoReview")} style={{minHeight:38,padding:"0 10px"}}>Video Review</button>
              <button className="elite-secondary" onClick={()=>setTab("clients")} style={{minHeight:38,padding:"0 10px"}}>CRM</button>
            </div>
          </div>
        </div>
      </Card>
      <div className="dashboard-shell">
        <div className="dashboard-main">
          <Card className="dashboard-action-card">
            <div className="page-hero-row">
              <div>
                <div style={{fontSize:11,color:primaryAction.color,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:7}}>O QUE FAZER AGORA</div>
                <div style={{fontSize:28,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:900,lineHeight:1.05}}>{primaryAction.title}</div>
                <p style={{fontSize:13,color:"#aaa",lineHeight:1.55,margin:"8px 0 0",maxWidth:680}}>{primaryAction.text} Esta tela prioriza decisão e ação, sem despejar tudo de uma vez.</p>
              </div>
              <Btn onClick={()=>setTab(primaryAction.tab)} style={{background:`linear-gradient(135deg,${primaryAction.color},${C.orangeD})`,justifyContent:"center"}}>Abrir agora</Btn>
            </div>
            <div className="summary-strip" style={{marginTop:18}}>
              {[
                {label:"Clientes para responder",value:pendingFollowUps.length,color:"#f97316",tab:"clients"},
                {label:"Projetos ativos",value:pendingVideos,color:"#8b5cf6",tab:"projects"},
                {label:"Documentos salvos",value:(state.studioDocs||[]).length,color:"#06b6d4",tab:"studio"},
                {label:"A receber",value:fmtDashboardMoney(totalReceivable,dashboardPrivacy),color:"#eab308",tab:"finance",money:true},
              ].map(item=><button key={item.label} onClick={()=>setTab(item.tab)} className="metric-tile" style={{textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
                <div className={`metric-value ${item.money?"money":""}`} style={{color:item.color}}>{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </button>)}
            </div>
          </Card>
          <ExecutiveBriefing state={state} setTab={setTab} privacyMode={dashboardPrivacy}/>
          <Card style={{padding:"16px 18px",background:"rgba(255,255,255,.035)",borderColor:"rgba(255,255,255,.09)"}}>
            <SectionTitle>ALERTAS E DECISÕES</SectionTitle>
            {attention.length===0&&<div style={{fontSize:13,color:C.muted}}>Sem alertas críticos agora. O sistema está limpo para execução.</div>}
            {attention.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {attention.slice(0,6).map((a,i)=><button key={i} onClick={()=>setTab(a.tab)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 12px",borderRadius:12,border:`1px solid ${a.color}30`,background:`${a.color}10`,color:"#eee",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><span style={{fontSize:13,fontWeight:800}}>{a.label}</span><span style={{fontSize:11,color:a.color,fontWeight:900}}>Abrir</span></button>)}
            </div>}
          </Card>
        </div>
        <aside className="dashboard-rail">
          <RevenueOSScore state={state} setTab={setTab} privacyMode={dashboardPrivacy} isAdmin={isAdmin} onToggleMoney={toggleDashboardMoney}/>
          <Card>
            <SectionTitle>COMEÇAR RÁPIDO</SectionTitle>
            <div className="dashboard-quick-grid">
              {quickActions.map(item=><button key={item.title} onClick={()=>setTab(item.tab)} className="dashboard-quick-card" style={{"--quick-color":`${item.color}33`,"--quick-strong":item.color,"--quick-bg":`${item.color}12`}}>
                <div style={{fontSize:13,color:item.color,fontWeight:900,marginBottom:5}}>{item.title}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.45}}>{item.text}</div>
              </button>)}
            </div>
          </Card>
          {!state.business?.profile&&<Card>
            <SectionTitle>PERFIL</SectionTitle>
            <p style={{fontSize:12,color:C.muted,lineHeight:1.5,margin:"-4px 0 12px"}}>Escolha uma base e o sistema adapta serviços e ticket.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {PROFILE_PRESETS.map(p=><button key={p.id} onClick={()=>selectProfile(p)} style={{textAlign:"left",padding:"11px",borderRadius:13,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)",color:"#eee",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{fontSize:12,color:"#fff",fontWeight:900,marginBottom:5}}>{p.label}</div>
                <Tag color={C.orange}>{fmtDashboardMoney(p.ticket,dashboardPrivacy)}</Tag>
              </button>)}
            </div>
          </Card>}
        </aside>
	      </div>

	      <div style={{display:"flex",justifyContent:"center"}}>
	        <button onClick={()=>setShowDashboardDetails(v=>!v)} className="elite-secondary" style={{minHeight:38,padding:"0 14px"}}>
	          {showDashboardDetails?"Ocultar detalhes":"Ver detalhes do dia"}
	        </button>
	      </div>

	      {showDashboardDetails&&<div className="summary-strip">
	        {[
          {v:(state.reviewDeliverables||[]).filter(r=>!["aprovado","approved"].includes(String(r.status||"").toLowerCase())).length,l:"Reviews pendentes",c:"#06b6d4",icon:"◉"},
          {v:pendingTasks.length,l:"Atividades abertas",c:"#fb923c",icon:"✓"},
          {v:pendingVideos,l:"Projetos abertos",c:"#8b5cf6",icon:"▶"},
          {v:(state.clients||[]).filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length,l:"Clientes ativos",c:"#10b981",icon:"◆"},
        ].map((s,i)=>(
          <Card key={i} style={{padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{s.l}</div>
          </Card>
        ))}
	      </div>}

	      {showDashboardDetails&&<div className="split-layout">
        <div className="dense-list">
          {pendingTasks.length>0&&(
            <Card style={{padding:"16px 18px"}}>
              <SectionTitle>PRÓXIMAS ATIVIDADES</SectionTitle>
              {pendingTasks.slice(0,5).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.border}`,background:"transparent",cursor:"pointer",flexShrink:0,transition:"border-color .2s"}} onMouseEnter={e=>e.target.style.borderColor=C.orange} onMouseLeave={e=>e.target.style.borderColor=C.border}/>
                  <span style={{flex:1,fontSize:13,color:"#ccc"}}>{t.title}</span>
                  {t.dueDate&&<Tag color={taskBucket(t)==="overdue"?"#ef4444":taskBucket(t)==="today"?"#10b981":C.orange}>{new Date(t.dueDate+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</Tag>}
                </div>
              ))}
            </Card>
          )}
          {upcomingMeetings.length>0&&(
            <Card style={{padding:"16px 18px",background:"rgba(59,130,246,.05)",borderColor:"rgba(59,130,246,.2)"}}>
              <SectionTitle>REUNIÕES ESTA SEMANA</SectionTitle>
              {upcomingMeetings.map(c=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div className="private-data" style={{fontSize:13,fontWeight:700,color:"#e2e2e2"}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.service||""}</div></div>
                  <Tag color="#3b82f6">{new Date(c.nextMeeting+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</Tag>
                </div>
              ))}
            </Card>
          )}
          {totalReceivable>0&&(
            <Card style={{padding:"16px 18px",background:"rgba(234,179,8,.05)",borderColor:"rgba(234,179,8,.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,color:"#eab308",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>VALORES A RECEBER</div><div style={{fontSize:22,fontWeight:800,color:"#eab308",fontFamily:"'Syne',sans-serif",marginTop:4}}>{fmtDashboardMoney(totalReceivable,dashboardPrivacy)}</div></div>
                <span style={{fontSize:28}}>R$</span>
              </div>
            </Card>
          )}
        </div>
        <aside className="side-panel">
          <Card style={{padding:"16px 18px"}}>
            <SectionTitle>VIDEO REVIEW</SectionTitle>
            {(state.reviewDeliverables||[]).slice(0,4).map(r=>(
              <button key={r.id||r.token||r.title} onClick={()=>setTab("videoReview")} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{minWidth:0}}><span className="private-data" style={{display:"block",fontSize:12,fontWeight:900,color:"#eee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.title||"Review sem título"}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{r.status||"aguardando"}</span></span>
                <span style={{fontSize:10,color:"#06b6d4",fontWeight:900}}>abrir</span>
              </button>
            ))}
            {!(state.reviewDeliverables||[]).length&&<div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Nenhum review aberto. Use esta área para enviar links de aprovação para clientes.</div>}
          </Card>
          <Card style={{padding:"16px 18px"}}>
            <SectionTitle>DOCUMENTOS</SectionTitle>
            {(state.studioDocs||[]).slice(0,4).map(d=>(
              <button key={d.id||d.title} onClick={()=>setTab("studio")} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{minWidth:0}}><span style={{display:"block",fontSize:12,fontWeight:900,color:"#eee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.title||d.type||"Documento"}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{d.type||"PDF operacional"}</span></span>
                <span style={{fontSize:10,color:"#3b82f6",fontWeight:900}}>abrir</span>
              </button>
            ))}
            {!(state.studioDocs||[]).length&&<div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Briefing, roteiro, callsheet e checklist aparecem aqui quando forem salvos.</div>}
          </Card>
        </aside>
	      </div>}
	    </div>
  );
};

export default TabDashboard;
