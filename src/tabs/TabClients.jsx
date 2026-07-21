import React, { useState } from 'react';
import { C } from '../theme.config.js';
import {
  CLIENT_PIPELINE, normalizeClientStatus, clientStageLabel,
  STATUS_COLORS, PAG_COLORS, TEMP_COLORS, VIDEO_STATUS, VIDEO_COLORS,
  AUDIOVISUAL_PRESETS, RELATIONSHIP_TYPES
} from '../constants/index.js';
import {
  dayDiff, addDaysInput, fmtCurrency, fmtMoney,
  relationType, relationMeta, buildVideoProject,
  presetById, audiovisualChecklistText
} from '../utils/helpers.js';
import { Card, Tag, Btn, Inp, Txt, Modal, Divider, SectionTitle, PremiumEmpty } from '../components/ui/index.jsx';
import { ChipSelector } from '../components/form-fields/ChipSelector.jsx';
import { CurrencyInput } from '../components/form-fields/CurrencyInput.jsx';
import { MaskedInput } from '../components/form-fields/MaskedInput.jsx';
import { OptionCards } from '../components/form-fields/OptionCards.jsx';
import { BrandedButton } from '../components/ui/BrandedButton.jsx';
import { BrandedCard } from '../components/ui/BrandedCard.jsx';
import { useWhitelabel } from '../hooks/useWhitelabel.jsx';

const TabClients = ({state,dispatch,privacyMode})=>{
  const { branding } = useWhitelabel();
  const [showAdd,setShowAdd]=useState(false),[selected,setSelected]=useState(null);
  const [showInteraction,setShowInteraction]=useState(false),[showVideo,setShowVideo]=useState(false);
  const [intForm,setIntForm]=useState({type:"reunião",note:""});
  const [videoForm,setVideoForm]=useState({title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:"Briefing\nRoteiro\nCaptação\nEdição\nRevisão\nEntrega"});
  const [editClient,setEditClient]=useState(null);
  const [view,setView]=useState("pipeline");
  const [draggingClient,setDraggingClient]=useState(null);
  const [filters,setFilters]=useState({temp:"all",payment:"all",origin:"all",follow:"all"});
  const [segment,setSegment]=useState("all");
  const [searchQuery,setSearchQuery]=useState("");
  const E={name:"",service:"",value:"",status:"lead",payment:"pendente",contract:"",nextMeeting:"",email:"",phone:"",notes:"",nextAction:"",followUpDate:"",leadTemp:"morno",leadSource:"",probability:50,relationshipType:"cliente",monthlyValue:"",barterDetails:"",partnerTerms:"",freelancerRole:"",freelancerRate:"",availability:"",pix:"",portfolio:""};
  const [cf,setCf]=useState(E);
  const clients=state.clients||[],client=clients.find(c=>c.id===selected);
  const totalReceivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0);
  const isFollowPending=c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&! ["entregue","pago"].includes(normalizeClientStatus(c));
  const forecast=c=>Math.round(Number(c.value||0)*Number(c.probability??50)/100);
  const saveClient=()=>{if(!cf.name)return;if(editClient){dispatch({type:"UPDATE_CLIENT",id:editClient,data:cf});setEditClient(null);}else dispatch({type:"ADD_CLIENT",client:cf});setCf(E);setShowAdd(false);};
  const applyClientPreset=p=>setCf(f=>({...f,service:p.service,value:p.value,nextAction:f.nextAction||"Enviar briefing e alinhar prazo",followUpDate:f.followUpDate||addDaysInput(2),leadTemp:f.leadTemp||"morno",probability:f.probability||50,notes:f.notes||`Pacote sugerido: ${p.title}.`}));
  const applyVideoPreset=p=>setVideoForm(f=>({...f,presetId:p.id,title:p.title,type:p.type,deadline:f.deadline||addDaysInput(14),checklist:audiovisualChecklistText(p)}));
  const pipeline=CLIENT_PIPELINE;
  const origins=[...new Set(clients.map(c=>c.leadSource).filter(Boolean))];
  const leadSourceChips=["Indicação","Instagram","WhatsApp","Site","Evento","Prospecção","Networking","Parceria local"];
  const nextActionChips=["Enviar proposta","Pedir briefing","Marcar reunião","Cobrar retorno","Enviar contrato","Criar projeto"];
  const clientPresetOptions=AUDIOVISUAL_PRESETS.map(p=>({value:p.id,label:p.label,description:`${p.service} · ${fmtCurrency(p.value)}`,icon:"▦"}));
  const selectedPresetId=AUDIOVISUAL_PRESETS.find(p=>p.service===cf.service)?.id||"";
  const clientFlowOptions=[
    {value:"cliente",label:"Cliente novo",icon:"+"},
    {value:"recorrente",label:"Mensalista",icon:"↻"},
    {value:"parceria",label:"Permuta",icon:"◇"},
    {value:"freelancer",label:"Freelancer",icon:"✦"},
  ];
  const relationshipOptions=RELATIONSHIP_TYPES.filter(r=>r.id!=="all").map(r=>({value:r.id,label:r.label,description:r.desc,icon:r.id==="recorrente"?"↻":r.id==="parceria"?"◇":r.id==="freelancer"?"✦":"+"}));
  const leadSourceOptions=leadSourceChips.map(item=>({value:item,label:item}));
  const nextActionOptions=nextActionChips.map(item=>({value:item,label:item}));
  const followUpOptions=[
    {value:addDaysInput(0),label:"Hoje"},
    {value:addDaysInput(1),label:"Amanhã"},
    {value:addDaysInput(2),label:"+2 dias"},
    {value:addDaysInput(7),label:"+7 dias"},
  ];
  const meetingShortcutOptions=[
    {value:addDaysInput(0),label:"Hoje"},
    {value:addDaysInput(1),label:"Amanhã"},
    {value:addDaysInput(7),label:"+7 dias"},
    {value:addDaysInput(14),label:"+14 dias"},
  ];
  const filteredClients=clients.filter(c=>
    (segment==="all"||relationType(c)===segment)&&
    (filters.temp==="all"||(c.leadTemp||"morno")===filters.temp)&&
    (filters.payment==="all"||c.payment===filters.payment)&&
    (filters.origin==="all"||c.leadSource===filters.origin)&&
    (filters.follow==="all"||(filters.follow==="pending"?isFollowPending(c):!isFollowPending(c)))&&
    (searchQuery===""||c.name.toLowerCase().includes(searchQuery.toLowerCase())||c.service?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const selectedRelation=RELATIONSHIP_TYPES.find(r=>r.id===segment)||RELATIONSHIP_TYPES[0];
  const selectRelationshipType=type=>setCf(f=>({...f,relationshipType:type,status:type==="freelancer"?"briefing":f.status,payment:type==="parceria"?"pendente":f.payment}));
  const applyClientQuickStart=type=>{
    const presets={
      cliente:{relationshipType:"cliente",status:"lead",leadTemp:"morno",probability:50,leadSource:"Instagram",nextAction:"Pedir briefing",followUpDate:addDaysInput(1)},
      recorrente:{relationshipType:"recorrente",status:"em_producao",payment:"pendente",leadTemp:"quente",probability:70,leadSource:"Indicação",service:"Pacote mensal de conteúdo",nextAction:"Enviar contrato mensal",followUpDate:addDaysInput(2)},
      parceria:{relationshipType:"parceria",status:"briefing",payment:"pendente",leadTemp:"morno",probability:60,leadSource:"Networking",service:"Permuta audiovisual",nextAction:"Alinhar contrapartidas",followUpDate:addDaysInput(2),barterDetails:"Conteúdo audiovisual em troca de divulgação, produto ou serviço."},
      freelancer:{relationshipType:"freelancer",status:"briefing",payment:"pendente",leadTemp:"quente",probability:80,leadSource:"Networking",service:"Freelancer audiovisual",freelancerRole:"Editor / filmmaker",nextAction:"Confirmar disponibilidade",followUpDate:addDaysInput(1)}
    };
    setCf(f=>({...f,...(presets[type]||presets.cliente)}));
  };
  const removeClient=c=>{
    if(!c)return;
    const linked=(c.videos||[]).length+(c.proposals||[]).length+(c.interactions||[]).length;
    const detail=linked?` Isso também remove ${linked} registro${linked!==1?"s":""} vinculados.`:"";
    if(!window.confirm(`Excluir ${c.name}?${detail}`))return;
    dispatch({type:"REMOVE_CLIENT",id:c.id,skipConfirm:true});
    if(String(selected)===String(c.id))setSelected(null);
  };
  const moveClientToStage=(clientId,status)=>{
    const id=Number(clientId);
    if(!id||!status)return;
    dispatch({type:"UPDATE_CLIENT",id,data:{status},silent:true});
    setDraggingClient(null);
  };
  const editClientFromList=c=>{
    setCf({...E,name:c.name,service:c.service||"",value:c.value||"",status:normalizeClientStatus(c),payment:c.payment||"pendente",contract:c.contract||"",nextMeeting:c.nextMeeting||"",email:c.email||"",phone:c.phone||"",notes:c.notes||"",nextAction:c.nextAction||"",followUpDate:c.followUpDate||"",leadTemp:c.leadTemp||"morno",leadSource:c.leadSource||"",probability:c.probability??50,relationshipType:relationType(c),monthlyValue:c.monthlyValue||"",barterDetails:c.barterDetails||"",partnerTerms:c.partnerTerms||"",freelancerRole:c.freelancerRole||"",freelancerRate:c.freelancerRate||"",availability:c.availability||"",pix:c.pix||"",portfolio:c.portfolio||""});
    setEditClient(c.id);
    setShowAdd(true);
  };
  const renderClientSmartForm=()=>(
    <>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Pacote sugerido</div>
        <OptionCards options={clientPresetOptions} value={selectedPresetId} onChange={id=>applyClientPreset(presetById(id))}/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Começar como</div>
        <ChipSelector options={clientFlowOptions} value={cf.relationshipType} onChange={applyClientQuickStart} columns={4}/>
      </div>
      <div style={{marginBottom:16,padding:"14px",borderRadius:16,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Tipo de relação comercial</div>
        <OptionCards options={relationshipOptions} value={cf.relationshipType} onChange={selectRelationshipType}/>
        {cf.relationshipType==="recorrente"&&(
          <div className="client-modal-grid" style={{marginTop:14}}>
            <div style={{marginBottom:18}}><CurrencyInput label="Mensalidade" value={cf.monthlyValue} onChange={v=>setCf(f=>({...f,monthlyValue:v,value:v||f.value}))}/></div>
            <Inp label="Escopo mensal" value={cf.service} onChange={v=>setCf(f=>({...f,service:v}))} placeholder="Ex: 8 reels + gestão de edição"/>
            <Inp label="Contrato até" value={cf.contract} onChange={v=>setCf(f=>({...f,contract:v}))} type="date"/>
          </div>
        )}
        {cf.relationshipType==="parceria"&&(
          <div style={{marginTop:14}}>
            <Txt label="Troca / permuta" value={cf.barterDetails} onChange={v=>setCf(f=>({...f,barterDetails:v}))} placeholder="O que cada lado entrega, limites e valor percebido" rows={2}/>
            <Txt label="Termos da parceria" value={cf.partnerTerms} onChange={v=>setCf(f=>({...f,partnerTerms:v}))} placeholder="Uso de imagem, publicação, créditos, prazos, contrapartidas" rows={2}/>
          </div>
        )}
        {cf.relationshipType==="freelancer"&&(
          <div className="client-modal-grid" style={{marginTop:14}}>
            <Inp label="Função" value={cf.freelancerRole} onChange={v=>setCf(f=>({...f,freelancerRole:v,service:v||f.service}))} placeholder="Editor, filmmaker, áudio..."/>
            <div style={{marginBottom:18}}><CurrencyInput label="Cachê / diária" value={cf.freelancerRate} onChange={v=>setCf(f=>({...f,freelancerRate:v,value:v||f.value}))}/></div>
            <Inp label="Disponibilidade" value={cf.availability} onChange={v=>setCf(f=>({...f,availability:v}))} placeholder="Dias, horários, cidade"/>
            <Inp label="PIX / dados" value={cf.pix} onChange={v=>setCf(f=>({...f,pix:v}))} placeholder="Chave PIX ou dados de pagamento"/>
            <Inp label="Portfólio" value={cf.portfolio} onChange={v=>setCf(f=>({...f,portfolio:v}))} placeholder="Link"/>
          </div>
        )}
      </div>
      <div className="client-modal-grid">
        <Inp label="Nome" value={cf.name} onChange={v=>setCf(f=>({...f,name:v}))} placeholder="Nome do cliente"/>
        <Inp label="Serviço" value={cf.service} onChange={v=>setCf(f=>({...f,service:v}))} placeholder="Ex: Vídeo institucional"/>
        <div style={{marginBottom:18}}><CurrencyInput label="Valor" value={cf.value} onChange={v=>setCf(f=>({...f,value:v}))}/></div>
        <Inp label="Email" value={cf.email} onChange={v=>setCf(f=>({...f,email:v}))} placeholder="email@exemplo.com"/>
        <div style={{marginBottom:18}}><MaskedInput label="WhatsApp" value={cf.phone} onChange={v=>setCf(f=>({...f,phone:v}))} placeholder="(48) 99999-9999"/></div>
        <Inp label="Próxima reunião" value={cf.nextMeeting} onChange={v=>setCf(f=>({...f,nextMeeting:v}))} type="date"/>
        <Inp label="Contrato até" value={cf.contract} onChange={v=>setCf(f=>({...f,contract:v}))} type="date"/>
        <Inp label="Origem personalizada" value={cf.leadSource} onChange={v=>setCf(f=>({...f,leadSource:v}))} placeholder="Instagram, indicação, site..."/>
        <Inp label="Próxima ação livre" value={cf.nextAction} onChange={v=>setCf(f=>({...f,nextAction:v}))} placeholder="Enviar orçamento, cobrar briefing..."/>
        <Inp label="Follow-up" value={cf.followUpDate} onChange={v=>setCf(f=>({...f,followUpDate:v}))} type="date"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"2px 0 16px"}} className="modal-grid">
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Origem rápida</div>
          <ChipSelector options={leadSourceOptions} value={cf.leadSource} onChange={v=>setCf(f=>({...f,leadSource:v}))} size="sm"/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Próxima ação rápida</div>
          <ChipSelector options={nextActionOptions} value={cf.nextAction} onChange={v=>setCf(f=>({...f,nextAction:v,followUpDate:f.followUpDate||addDaysInput(1)}))} size="sm"/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"2px 0 16px"}} className="modal-grid">
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de reunião</div>
          <ChipSelector options={meetingShortcutOptions} value={cf.nextMeeting} onChange={v=>setCf(f=>({...f,nextMeeting:v}))} size="sm"/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de follow-up</div>
          <ChipSelector options={followUpOptions} value={cf.followUpDate} onChange={v=>setCf(f=>({...f,followUpDate:v}))} size="sm"/>
        </div>
      </div>
      <div className="client-modal-controls">
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Etapa do pipeline</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CLIENT_PIPELINE.map(stage=><button key={stage.key} onClick={()=>setCf(f=>({...f,status:stage.key}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:normalizeClientStatus(cf)===stage.key?stage.color:C.border,background:normalizeClientStatus(cf)===stage.key?`${stage.color}15`:"transparent",color:normalizeClientStatus(cf)===stage.key?stage.color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{stage.label}</button>)}</div></div>
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Pagamento</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(PAG_COLORS).map(([k,c])=><button key={k} onClick={()=>setCf(f=>({...f,payment:k}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:cf.payment===k?c:C.border,background:cf.payment===k?`${c}15`:"transparent",color:cf.payment===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{k}</button>)}</div></div>
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Temperatura</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(TEMP_COLORS).map(([k,c])=><button key={k} onClick={()=>setCf(f=>({...f,leadTemp:k}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:cf.leadTemp===k?c:C.border,background:cf.leadTemp===k?`${c}15`:"transparent",color:cf.leadTemp===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{k}</button>)}</div></div>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Probabilidade: {cf.probability}%</div>
          <input type="range" min={0} max={100} step={5} value={cf.probability} onChange={e=>setCf(f=>({...f,probability:+e.target.value}))} style={{width:"100%",accentColor:C.orange}}/>
          <div style={{fontSize:11,color:"#10b981",fontWeight:800,marginTop:4}}>Previsão: {fmtCurrency(Number(cf.value||0)*Number(cf.probability||0)/100)}</div>
        </div>
      </div>
      <Txt label="Observações" value={cf.notes} onChange={v=>setCf(f=>({...f,notes:v}))} placeholder="Briefing, preferências..." rows={3}/>
      <Btn onClick={saveClient} style={{position:"sticky",bottom:-2,width:"100%",justifyContent:"center",marginTop:6,boxShadow:"0 -14px 26px rgba(24,24,24,.95)"}}>Salvar cliente</Btn>
    </>
  );

  if(selected&&client){
    const pv=(client.videos||[]).filter(v=>v.status!=="entregue").length;
    const timeline=[
      client.createdAt&&{date:client.createdAt,type:"Cliente",color:C.orange,title:"Cliente cadastrado",meta:client.service||""},
      client.nextMeeting&&{date:client.nextMeeting,type:"Reunião",color:"#3b82f6",title:"Próxima reunião",meta:client.nextAction||""},
      client.followUpDate&&{date:client.followUpDate,type:"Follow-up",color:isFollowPending(client)?"#ef4444":"#eab308",title:"Follow-up programado",meta:client.nextAction||""},
      ...(client.interactions||[]).map(i=>({date:i.date,type:i.type,color:C.orange,title:i.note,meta:"Interação"})),
      ...(client.videos||[]).map(v=>({date:v.deadline||client.createdAt,type:"Projeto",color:VIDEO_COLORS[v.status]||"#8b5cf6",title:v.title,meta:v.status})),
      ...(client.proposals||[]).map(p=>({date:p.createdAt,type:"Proposta",color:p.status==="aceita"?"#10b981":p.status==="recusada"?"#ef4444":p.status==="enviada"?"#3b82f6":C.orange,title:p.projectTitle||`Proposta ${p.status}`,meta:`${p.status} · ${fmtMoney(p.total,privacyMode)}`})),
      ...(state.financeEntries||[]).filter(e=>String(e.clientId)===String(client.id)).map(e=>({date:e.date,type:e.type==="despesa"?"Despesa":"Receita",color:e.type==="despesa"?"#ef4444":"#10b981",title:e.title,meta:`${e.status} · ${fmtMoney(e.value,privacyMode)}`}))
    ].filter(Boolean).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:C.orange,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:16,transition:"opacity .15s"}} onMouseEnter={e=>e.target.style.opacity=".7"} onMouseLeave={e=>e.target.style.opacity="1"}>← Voltar</button>
        <Card style={{background:`${STATUS_COLORS[normalizeClientStatus(client)]||C.orange}08`,borderColor:`${STATUS_COLORS[normalizeClientStatus(client)]||C.orange}25`,marginBottom:14}}>
          <div className="client-detail-head">
            <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}><Tag color={STATUS_COLORS[normalizeClientStatus(client)]||C.orange}>{clientStageLabel(client)}</Tag><Tag color={PAG_COLORS[client.payment]||C.orange}>{client.payment}</Tag><Tag color={TEMP_COLORS[client.leadTemp]||"#eab308"}>{client.leadTemp||"morno"}</Tag><Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(client))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(client))||RELATIONSHIP_TYPES[1]).label}</Tag>{isFollowPending(client)&&<Tag color="#ef4444">follow-up</Tag>}</div><div className="private-data" style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{client.name}</div>{client.service&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{client.service}</div>}</div>
            <div className="client-detail-value" style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(client.value,privacyMode)}</div><div style={{fontSize:11,color:C.muted}}>contrato</div></div>
          </div>
          <Divider/>
          <div className="mobile-two-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {client.email&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>EMAIL</div><div className="private-data" style={{fontSize:13,color:"#ccc"}}>{client.email}</div></div>}
            {client.phone&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>TELEFONE</div><div className="private-data" style={{fontSize:13,color:"#ccc"}}>{client.phone}</div></div>}
            {client.nextMeeting&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PRÓXIMA REUNIÃO</div><div style={{fontSize:13,color:C.orange,fontWeight:700}}>📅 {new Date(client.nextMeeting+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            {client.contract&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>CONTRATO ATÉ</div><div style={{fontSize:13,color:"#ccc"}}>📋 {new Date(client.contract+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            {client.nextAction&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PRÓXIMA AÇÃO</div><div style={{fontSize:13,color:"#ccc"}}>{client.nextAction}</div></div>}
            {client.followUpDate&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>FOLLOW-UP</div><div style={{fontSize:13,color:isFollowPending(client)?"#ef4444":"#ccc",fontWeight:700}}>{new Date(client.followUpDate+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            <div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PREVISÃO</div><div style={{fontSize:13,color:"#10b981",fontWeight:800}}>{fmtMoney(forecast(client),privacyMode)} · {client.probability??50}%</div></div>
            {client.leadSource&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>ORIGEM</div><div style={{fontSize:13,color:"#ccc"}}>{client.leadSource}</div></div>}
            <div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>TIPO DE RELAÇÃO</div><div style={{fontSize:13,color:"#ccc"}}>{relationMeta(client)}</div></div>
          </div>
          {client.notes&&<><Divider/><div style={{fontSize:13,color:"#bbb",lineHeight:1.5}}>{client.notes}</div></>}
          <Divider/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <BrandedButton onClick={()=>editClientFromList(client)} size="sm" variant="outline">Editar</BrandedButton>
            <BrandedButton onClick={()=>dispatch({type:"UPDATE_CLIENT",id:client.id,data:{payment:client.payment==="pago"?"pendente":"pago"}})} size="sm" variant={client.payment==="pago"?"outline":"primary"}>💰 {client.payment==="pago"?"Marcar pendente":"Marcar pago"}</BrandedButton>
            <BrandedButton onClick={()=>removeClient(client)} size="sm" variant="outline" style={{borderColor: "#ef4444", color: "#ef4444"}}>Excluir cliente</BrandedButton>
          </div>
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle>TIMELINE DO CLIENTE</SectionTitle>
          {timeline.length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Sem eventos registrados.</div>}
          {timeline.slice(0,10).map((e,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"18px 1fr",gap:10,marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:10,height:10,borderRadius:99,background:e.color,boxShadow:`0 0 12px ${e.color}55`,marginTop:4}}/>{i<timeline.length-1&&<span style={{width:1,flex:1,minHeight:24,background:C.border,marginTop:4}}/>}</div>
              <div style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:4}}><Tag color={e.color}>{e.type}</Tag><span style={{fontSize:10,color:C.muted}}>{e.date}</span></div>
                <div className="private-data" style={{fontSize:13,color:"#eee",fontWeight:800,lineHeight:1.35}}>{e.title}</div>
                {e.meta&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{e.meta}</div>}
              </div>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle action={<Btn onClick={()=>setShowVideo(true)} size="sm">+ Vídeo</Btn>}>VÍDEOS ({(client.videos||[]).length}) {pv>0&&<Tag color="#eab308">{pv} pendentes</Tag>}</SectionTitle>
          {(client.videos||[]).length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhum vídeo cadastrado</div>}
          {(client.videos||[]).map(v=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
              <div style={{flex:1}}><div style={{fontSize:13,color:"#e2e2e2",fontWeight:600}}>{v.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{v.type}</div></div>
              <select value={v.status} onChange={e=>dispatch({type:"UPDATE_CLIENT_VIDEO",clientId:client.id,videoId:v.id,data:{status:e.target.value}})} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:VIDEO_COLORS[v.status]||"#fff",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none"}}>
                {VIDEO_STATUS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>dispatch({type:"REMOVE_CLIENT_VIDEO",clientId:client.id,videoId:v.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle>PROPOSTAS ({(client.proposals||[]).length})</SectionTitle>
          {(client.proposals||[]).length===0&&<PremiumEmpty icon="§" title="Nenhuma proposta salva" text="Crie uma proposta a partir deste cliente para registrar rascunhos, envios e aprovações no CRM." action={null}/>}
          {(client.proposals||[]).map(p=>(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 32px",gap:8,alignItems:"center",marginBottom:8,padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}>
              <div><div style={{fontSize:13,color:"#e2e2e2",fontWeight:800}}>{p.projectTitle||"Proposta comercial"}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{p.createdAt} · {fmtMoney(p.total,privacyMode)}</div></div>
              <select value={p.status} onChange={e=>dispatch({type:"UPDATE_CLIENT_PROPOSAL",clientId:client.id,proposalId:p.id,data:{status:e.target.value}})} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 8px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none"}}>
                {["rascunho","enviada","aceita","recusada"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>dispatch({type:"REMOVE_CLIENT_PROPOSAL",clientId:client.id,proposalId:p.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle action={<Btn onClick={()=>setShowInteraction(true)} size="sm">+ Registrar</Btn>}>HISTÓRICO ({(client.interactions||[]).length})</SectionTitle>
          {(client.interactions||[]).length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhuma interação registrada</div>}
          {[...(client.interactions||[])].reverse().map(int=>(
            <div key={int.id} style={{marginBottom:10,padding:"12px 14px",background:"rgba(255,255,255,.03)",borderRadius:12,borderLeft:`3px solid ${C.orange}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",gap:7,alignItems:"center"}}><Tag color={C.orange}>{int.type}</Tag><span style={{fontSize:11,color:C.muted}}>{int.date}</span></div><button onClick={()=>dispatch({type:"REMOVE_CLIENT_INTERACTION",clientId:client.id,intId:int.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button></div>
              <p style={{margin:0,fontSize:13,color:"#ccc",lineHeight:1.5}}>{int.note}</p>
            </div>
          ))}
        </Card>
        <Modal open={showInteraction} onClose={()=>setShowInteraction(false)} title="Registrar Interação">
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Tipo</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["reunião","ligação","email","whatsapp","briefing","entrega","feedback","outro"].map(t=><button key={t} onClick={()=>setIntForm(f=>({...f,type:t}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:intForm.type===t?C.orange:C.border,background:intForm.type===t?`${C.orange}15`:"transparent",color:intForm.type===t?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div></div>
          <Txt label="Anotação" value={intForm.note} onChange={v=>setIntForm(f=>({...f,note:v}))} placeholder="Descreva o que foi discutido..." rows={4}/>
          <Btn onClick={()=>{if(!intForm.note)return;dispatch({type:"ADD_CLIENT_INTERACTION",id:client.id,interaction:{type:intForm.type,note:intForm.note}});setIntForm({type:"reunião",note:""});setShowInteraction(false);}}>💾 Salvar</Btn>
        </Modal>
        <Modal open={showVideo} onClose={()=>setShowVideo(false)} title="Novo Vídeo">
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Preset audiovisual</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {AUDIOVISUAL_PRESETS.map(p=><button key={p.id} onClick={()=>applyVideoPreset(p)} style={{padding:"6px 11px",borderRadius:9,border:"1px solid",borderColor:videoForm.title===p.title?C.orange:C.border,background:videoForm.title===p.title?`${C.orange}15`:"rgba(255,255,255,.025)",color:videoForm.title===p.title?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{p.label}</button>)}
            </div>
          </div>
          <Inp label="Título" value={videoForm.title} onChange={v=>setVideoForm(f=>({...f,title:v}))} placeholder="Ex: Reel institucional"/>
          <Inp label="Prazo" value={videoForm.deadline} onChange={v=>setVideoForm(f=>({...f,deadline:v}))} type="date"/>
          <Inp label="Link / pasta" value={videoForm.link} onChange={v=>setVideoForm(f=>({...f,link:v}))} placeholder="Drive, Frame.io, pasta do projeto..."/>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Tipo</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["gravação","edição","motion","drone","entrevista","vertical","evento","documentário","ads"].map(t=><button key={t} onClick={()=>setVideoForm(f=>({...f,type:t}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:videoForm.type===t?C.orange:C.border,background:videoForm.type===t?`${C.orange}15`:"transparent",color:videoForm.type===t?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div></div>
          <Txt label="Checklist de produção" value={videoForm.checklist} onChange={v=>setVideoForm(f=>({...f,checklist:v}))} rows={5}/>
          <Btn onClick={()=>{if(!videoForm.title)return;dispatch({type:"ADD_CLIENT_VIDEO",id:client.id,video:buildVideoProject({...videoForm,checklist:videoForm.checklist.split("\n").filter(Boolean)})});setVideoForm({title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:"Briefing\nRoteiro\nCaptação\nEdição\nRevisão\nEntrega"});setShowVideo(false);}}>Salvar vídeo</Btn>
        </Modal>
        <Modal open={showAdd} onClose={()=>{setShowAdd(false);setEditClient(null);}} title="Editar Cliente" wide>
          {renderClientSmartForm()}
        </Modal>
      </div>
    );
  }
  return (
    <div>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{clients.filter(c=>["briefing","proposta_enviada","em_producao"].includes(normalizeClientStatus(c))).length}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Em operação</div></Card>
        <Card style={{padding:"14px 16px",textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:privacyMode?18:13,fontWeight:800,color:"#eab308",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(totalReceivable,privacyMode)}</div>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>A receber</div>
        </Card>
        <Card style={{padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#8b5cf6",fontFamily:"'Syne',sans-serif"}}>{clients.reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0)}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Vídeos pendentes</div></Card>
      </div>
      <Card style={{padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8}} className="modal-grid">
          {RELATIONSHIP_TYPES.map(r=>{
            const count=r.id==="all"?clients.length:clients.filter(c=>relationType(c)===r.id).length;
            return <button key={r.id} onClick={()=>setSegment(r.id)} style={{textAlign:"left",padding:"10px 11px",borderRadius:12,border:"1px solid",borderColor:segment===r.id?r.color:C.border,background:segment===r.id?`${r.color}15`:"rgba(255,255,255,.03)",color:segment===r.id?r.color:"#ddd",cursor:"pointer",fontFamily:"inherit"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:".06em"}}>{r.label}</span><span style={{fontSize:14,fontWeight:900}}>{count}</span></div>
              <div style={{fontSize:10,color:C.muted,marginTop:4,lineHeight:1.3}}>{r.desc}</div>
            </button>;
          })}
        </div>
      </Card>
      <div className="client-toolbar" style={{alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:6,padding:4,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:12}}>
          {[["pipeline","Pipeline"],["list","Lista"]].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:"7px 12px",borderRadius:9,border:"none",background:view===k?`${branding.primaryColor}18`:"transparent",color:view===k?branding.primaryColor:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={e=>setSearchQuery(e.target.value)}
          style={{flex:1,maxWidth:200,padding:"7px 12px",borderRadius:9,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.06)",color:"#fff",fontSize:12,outline:"none"}}
        />
        <BrandedButton onClick={()=>{setCf(E);setEditClient(null);setShowAdd(true);}} size="sm">+ Cliente</BrandedButton>
      </div>
      {clients.length>0&&<Card style={{padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}} className="modal-grid">
          <select value={filters.temp} onChange={e=>setFilters(f=>({...f,temp:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Temperatura</option>{Object.keys(TEMP_COLORS).map(k=><option key={k} value={k}>{k}</option>)}</select>
          <select value={filters.payment} onChange={e=>setFilters(f=>({...f,payment:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Pagamento</option>{Object.keys(PAG_COLORS).map(k=><option key={k} value={k}>{k}</option>)}</select>
          <select value={filters.origin} onChange={e=>setFilters(f=>({...f,origin:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Origem</option>{origins.map(o=><option key={o} value={o}>{o}</option>)}</select>
          <select value={filters.follow} onChange={e=>setFilters(f=>({...f,follow:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Follow-up</option><option value="pending">Pendente</option><option value="clear">Em dia</option></select>
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:8}}>{filteredClients.length} em {selectedRelation.label.toLowerCase()} · {clients.length} relações cadastradas</div>
      </Card>}
      {clients.length===0&&<PremiumEmpty icon="◈" title="Comece pelo primeiro cliente" text="Cadastre um lead ou cliente ativo. A partir dele você cria projetos, propostas, follow-ups e previsão de receita." action={<Btn onClick={()=>{setCf(E);setEditClient(null);setShowAdd(true);}} size="sm">Criar cliente</Btn>}/>}
      {clients.length>0&&filteredClients.length===0&&<Card style={{textAlign:"center",padding:"24px 20px",marginBottom:14}}><div style={{fontSize:13,color:C.muted}}>Nenhum cliente combina com esses filtros.</div></Card>}
      {view==="pipeline"&&filteredClients.length>0&&(
        <div className="pipeline-board" style={{marginBottom:16}}>
          {pipeline.map(col=>{
            const items=filteredClients.filter(c=>normalizeClientStatus(c)===col.key);
            const sum=items.reduce((a,c)=>a+Number(c.value||0),0);
            const weighted=items.reduce((a,c)=>a+forecast(c),0);
            return (
              <div key={col.key} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}} onDrop={e=>{e.preventDefault();moveClientToStage(e.dataTransfer.getData("text/plain")||draggingClient,col.key);}} style={{background:"rgba(255,255,255,.025)",border:`1px solid ${draggingClient?`${col.color}55`:C.border}`,borderRadius:14,padding:10,minHeight:160,transition:"border-color .16s ease, background .16s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div><div style={{fontSize:11,color:col.color,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>{col.label}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{items.length} cliente{items.length!==1?"s":""}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:800,color:col.color}}>{fmtMoney(sum,privacyMode)}</div><div style={{fontSize:9,color:C.muted}}>prev. {fmtMoney(weighted,privacyMode)}</div></div>
                </div>
                {items.length===0&&<div style={{border:`1px dashed ${C.border}`,borderRadius:12,padding:"16px 10px",fontSize:12,color:C.muted,textAlign:"center"}}>Vazio</div>}
                {items.map(c=>{
                  const pv=(c.videos||[]).filter(v=>v.status!=="entregue").length;
                  const dtm=c.nextMeeting?Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24)):null;
                  const next=pipeline[pipeline.findIndex(p=>p.key===col.key)+1];
                  return (
                    <div key={c.id} className="card-hover client-drag-card" draggable onDragStart={e=>{e.dataTransfer.setData("text/plain",String(c.id));e.dataTransfer.effectAllowed="move";setDraggingClient(c.id);}} onDragEnd={()=>setDraggingClient(null)} onClick={()=>setSelected(c.id)} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${col.color}22`,borderRadius:12,padding:"12px 12px",marginBottom:8,cursor:"grab",opacity:String(draggingClient)===String(c.id)?.55:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"flex-start",marginBottom:6}}>
                        <div className="private-data" style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1.25}}>{c.name}</div>
                        <div style={{fontSize:11,fontWeight:800,color:"#10b981",whiteSpace:"nowrap"}}>{fmtMoney(forecast(c),privacyMode)}</div>
                      </div>
                      {c.service&&<div style={{fontSize:11,color:C.muted,lineHeight:1.35,marginBottom:5}}>{c.service}</div>}
                      <div style={{fontSize:10,color:"#aaa",lineHeight:1.35,marginBottom:8}}>{relationMeta(c)}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
                        <Tag color={PAG_COLORS[c.payment]||C.orange}>{c.payment}</Tag>
                        <Tag color={TEMP_COLORS[c.leadTemp]||"#eab308"}>{c.leadTemp||"morno"}</Tag>
                        <Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).label}</Tag>
                        <Tag color="#10b981">{c.probability??50}%</Tag>
                        {pv>0&&<Tag color="#8b5cf6">{pv} vídeo{pv>1?"s":""}</Tag>}
                        {dtm!==null&&dtm<=7&&dtm>=0&&<Tag color="#3b82f6">{dtm===0?"hoje":`${dtm}d`}</Tag>}
                        {isFollowPending(c)&&<Tag color="#ef4444">follow-up</Tag>}
                      </div>
                      {c.nextAction&&<div style={{fontSize:11,color:"#bbb",lineHeight:1.35,marginBottom:8}}>Próxima ação: {c.nextAction}</div>}
                      <div style={{fontSize:9,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",margin:"6px 0 8px"}}>Arraste para mudar etapa · clique para abrir</div>
                      <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>{const idx=pipeline.findIndex(p=>p.key===col.key);if(idx>0)dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:pipeline[idx-1].key}});}} title="Recuar" style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,fontWeight:800,cursor:"pointer"}}> Recuar</button>
                        {col.key!==pipeline[pipeline.length-1].key&&<button onClick={()=>{const idx=pipeline.findIndex(p=>p.key===col.key);if(idx<pipeline.length-1)dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:pipeline[idx+1].key}});}} title="Avançar" style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,fontWeight:800,cursor:"pointer"}}>Avançar</button>}
                        {next&&<button onClick={()=>dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:next.key}})} title={`Mover para ${next.label}`} style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${next.color}55`,background:`${next.color}12`,color:next.color,fontSize:10,fontWeight:800,cursor:"pointer"}}>{next.label}</button>}
                        <button onClick={()=>removeClient(c)} title="Excluir cliente" style={{width:30,padding:"5px 6px",borderRadius:7,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:10,fontWeight:900,cursor:"pointer"}}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {view==="list"&&filteredClients.map(c=>{
        const pv=(c.videos||[]).filter(v=>v.status!=="entregue").length;
        const dtm=c.nextMeeting?Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24)):null;
        return (
          <Card key={c.id} onClick={()=>setSelected(c.id)} style={{marginBottom:10,cursor:"pointer"}}>
            <div className="client-list-row" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:7,flexWrap:"wrap"}}>
                  <Tag color={STATUS_COLORS[normalizeClientStatus(c)]||C.orange}>{clientStageLabel(c)}</Tag>
                  <Tag color={PAG_COLORS[c.payment]||C.orange}>{c.payment}</Tag>
                  <Tag color={TEMP_COLORS[c.leadTemp]||"#eab308"}>{c.leadTemp||"morno"}</Tag>
                  <Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).label}</Tag>
                  <Tag color="#10b981">{c.probability??50}%</Tag>
                  {pv>0&&<Tag color="#8b5cf6">{pv} vídeo{pv>1?"s":""}</Tag>}
                  {dtm!==null&&dtm<=7&&dtm>=0&&<Tag color="#3b82f6">reunião em {dtm}d</Tag>}
                  {isFollowPending(c)&&<Tag color="#ef4444">follow-up</Tag>}
                </div>
                <div className="private-data" style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{c.name}</div>
                {c.service&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.service}</div>}
                <div style={{fontSize:11,color:"#aaa",marginTop:5}}>{relationMeta(c)}</div>
                {c.nextAction&&<div style={{fontSize:11,color:"#aaa",marginTop:5}}>Próxima ação: {c.nextAction}</div>}
              </div>
              <div className="client-list-value" style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(c.value,privacyMode)}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>prev. {fmtMoney(forecast(c),privacyMode)}</div>
                {c.nextMeeting&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📅 {new Date(c.nextMeeting+"T00:00").toLocaleDateString("pt-BR")}</div>}
                <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:8}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>editClientFromList(c)} title="Editar cliente" style={{height:28,borderRadius:8,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.045)",color:"#ddd",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",padding:"0 9px"}}>Editar</button>
                  <button onClick={()=>removeClient(c)} title="Excluir cliente" style={{height:28,borderRadius:8,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",padding:"0 9px"}}>Excluir</button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      <Modal open={showAdd} onClose={()=>{setShowAdd(false);setEditClient(null);setCf(E);}} title="Novo Cliente" wide>
        {renderClientSmartForm()}
      </Modal>
    </div>
  );
};

export default TabClients;
