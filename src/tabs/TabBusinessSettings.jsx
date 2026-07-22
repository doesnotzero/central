import React, { useState, useEffect } from 'react';
import { C, APP_NAME } from '../theme.config.js';
import { BRANDING } from '../config/branding.js';
import { DEFAULT_BUSINESS, normalizeBusiness } from '../constants/index.js';
import { Card, Tag, Btn, Inp, Txt, Bar, Modal, SectionTitle, LogoUploader, LogoMark } from '../components/ui/index.jsx';

export const SecurityPanel = ({session,cloudStatus,privacyMode,lockEnabled,setLockEnabled,onLockNow,open,onToggle,isAdmin})=>{
  const cloudLabel=cloudStatus==="synced"?"Nuvem ativa":cloudStatus==="syncing"?"Salvando":"Local";
  const cloudColor=cloudStatus==="synced"?"#10b981":cloudStatus==="syncing"?"#eab308":C.muted;
  return (
    <div style={{display:"grid",gap:7,marginBottom:10}}>
      <button onClick={onToggle} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit",minHeight:38}}>
        <span>Segurança</span>
        <span style={{display:"flex",alignItems:"center",gap:8,color:session?"#10b981":C.muted}}>
          {isAdmin?"Admin":session?"GitHub":"Local"} <span style={{color:C.muted}}>{open?"▴":"▾"}</span>
        </span>
      </button>
      {open&&<>
        <div className="security-chip"><span>Acesso</span><span style={{color:isAdmin?"#10b981":"#eab308"}}>{isAdmin?"Admin":"Restrito"}</span></div>
        <div className="security-chip"><span>Dados</span><span style={{color:cloudColor}}>{cloudLabel}</span></div>
        <div className="security-chip"><span>Privacidade</span><span style={{color:privacyMode?C.orange:C.muted}}>{privacyMode?"Oculta":"Normal"}</span></div>
        <button onClick={()=>setLockEnabled(v=>!v)} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit"}}>
          <span>Bloqueio</span><span style={{color:lockEnabled?"#10b981":C.muted}}>{lockEnabled?"5 min":"off"}</span>
        </button>
        <button onClick={onLockNow} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit",color:C.orange}}>
          <span>Bloquear agora</span><span>⌁</span>
        </button>
      </>}
    </div>
  );
};

export const OnboardingGuide = ({session,state,setTab,onDone})=>{
  if(!session?.user)return null;
  const steps=[
    {id:"client",label:"Cadastre seu primeiro cliente",desc:"É a base para proposta, projeto e cobrança.",done:(state.clients||[]).length>0,tab:"clients"},
    {id:"project",label:"Crie um projeto",desc:"Transforme o cliente em produção real.",done:(state.clients||[]).some(c=>(c.videos||[]).length>0),tab:"projects"},
    {id:"doc",label:"Gere um documento",desc:"Use briefing, roteiro, callsheet ou checklist.",done:(state.studioDocs||[]).length>0,tab:"studio"},
    {id:"finance",label:"Marque uma cobrança",desc:"Registre valor a receber ou contrato.",done:(state.financeEntries||[]).length>0||(state.clients||[]).some(c=>Number(c.value||0)>0),tab:"finance"},
  ];
  const doneCount=steps.filter(s=>s.done).length;
  if(doneCount===steps.length)return null;
  return (
    <div className="onboarding-panel" role="region" aria-label="Primeiros passos">
      <div className="onboarding-head">
        <div>
          <div style={{fontSize:10,color:"#3b82f6",fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:5}}>Primeiros passos</div>
          <div style={{fontSize:15,color:"#fff",fontWeight:900,fontFamily:"var(--font-display)"}}>{doneCount}/{steps.length} configurado</div>
        </div>
        <button onClick={onDone} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
      </div>
      <div className="onboarding-body">
        <Bar v={doneCount/steps.length*100} color="#3b82f6" h={5}/>
        <div style={{marginTop:8}}>
          {steps.map(s=>(
            <button key={s.id} className={`onboarding-step ${s.done?"done":""}`} onClick={()=>setTab(s.tab)}>
              <span className="onboarding-check">{s.done?"✓":"○"}</span>
              <span style={{minWidth:0}}>
                <span style={{display:"block",fontSize:12,fontWeight:900,color:s.done?"#10b981":"#eee"}}>{s.label}</span>
                <span style={{display:"block",fontSize:11,color:C.muted,marginTop:2,lineHeight:1.35}}>{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BusinessOnboarding = ({open,business,dispatch,onClose})=>{
  const [form,setForm]=useState({...DEFAULT_BUSINESS,...business,mainServices:((business?.mainServices||DEFAULT_BUSINESS.mainServices).join(", "))});
  useEffect(()=>{if(open)setForm({...DEFAULT_BUSINESS,...business,mainServices:((business?.mainServices||DEFAULT_BUSINESS.mainServices).join(", "))});},[open,business]);
  const save=()=>{
    const services=String(form.mainServices||"").split(",").map(s=>s.trim()).filter(Boolean);
    dispatch({type:"UPDATE_BUSINESS",data:{...form,mainServices:services,onboarded:true,ticketAverage:Number(form.ticketAverage||0)}});
    onClose?.();
  };
  return (
    <Modal open={open} onClose={onClose} title="Configurar seu negócio" wide>
      <div className="modal-section primary">
        <div style={{fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:6}}>Onboarding comercial</div>
        <p style={{margin:0,fontSize:13,color:"#bbb",lineHeight:1.55}}>Esses dados personalizam propostas, WhatsApp comercial, textos e a identidade do sistema.</p>
      </div>
      <div className="form-grid-2">
        <Inp label="Nome da marca" value={form.brandName} onChange={v=>setForm(f=>({...f,brandName:v}))} placeholder={`Ex: ${BRANDING.brandName}`}/>
        <Inp label="Tipo de negócio" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} placeholder="Produtora, social media, agência..."/>
        <Inp label="Ticket médio (R$)" value={form.ticketAverage} onChange={v=>setForm(f=>({...f,ticketAverage:v}))} type="number" placeholder="2500"/>
        <Inp label="WhatsApp comercial" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))} placeholder={BRANDING.whatsapp||"5500000000000"}/>
        <Inp label="Nome da empresa" value={form.companyName} onChange={v=>setForm(f=>({...f,companyName:v}))} placeholder="Razão social ou nome fantasia"/>
        <Inp label="Email comercial" value={form.proposalEmail} onChange={v=>setForm(f=>({...f,proposalEmail:v}))} placeholder="contato@empresa.com"/>
        <Inp label="Documento" value={form.proposalDocument} onChange={v=>setForm(f=>({...f,proposalDocument:v}))} placeholder="CNPJ / CPF"/>
        <Inp label="Cidade" value={form.proposalCity} onChange={v=>setForm(f=>({...f,proposalCity:v}))} placeholder="Florianópolis, SC"/>
        <LogoUploader value={form.logoUrl} onChange={v=>setForm(f=>({...f,logoUrl:v}))} color={form.primaryColor||C.orange}/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Cor principal</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input type="color" value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{width:46,height:38,borderRadius:10,border:`1px solid ${C.border}`,background:"transparent"}}/>
            <input value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>
        </div>
      </div>
      <Txt label="Serviços principais" value={form.mainServices} onChange={v=>setForm(f=>({...f,mainServices:v}))} placeholder="Vídeo institucional, reels, eventos..." rows={3}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <Btn onClick={onClose} variant="ghost">Depois</Btn>
        <Btn onClick={save}>Salvar configuração</Btn>
      </div>
    </Modal>
  );
};

const TabBusinessSettings = ({state,dispatch})=>{
  const business=normalizeBusiness(state.business);
  const [form,setForm]=useState({...business,mainServices:(business.mainServices||[]).join(", ")});
  useEffect(()=>setForm({...business,mainServices:(business.mainServices||[]).join(", ")}),[state.business]);
  const save=()=>dispatch({type:"UPDATE_BUSINESS",data:{...form,mainServices:String(form.mainServices||"").split(",").map(s=>s.trim()).filter(Boolean),ticketAverage:Number(form.ticketAverage||0),onboarded:true}});
  return (
    <div className="page-stack">
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:business.primaryColor||C.orange}}>CONFIGURAÇÕES DO NEGÓCIO</div>
            <div className="page-title">{business.brandName||APP_NAME}</div>
            <p className="page-subtitle">Ajuste identidade, dados comerciais e padrões usados em propostas e contato de venda.</p>
          </div>
          <div style={{width:58,height:58,borderRadius:18,border:`1px solid ${(business.primaryColor||C.orange)}55`,background:`${business.primaryColor||C.orange}18`,display:"grid",placeItems:"center",overflow:"hidden"}}>
            <LogoMark business={business} size={58}/>
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>PERFIL COMERCIAL</SectionTitle>
        <div className="form-grid-2">
          <Inp label="Nome da marca" value={form.brandName} onChange={v=>setForm(f=>({...f,brandName:v}))}/>
          <Inp label="Tipo de negócio" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}/>
          <Inp label="Ticket médio (R$)" value={form.ticketAverage} onChange={v=>setForm(f=>({...f,ticketAverage:v}))} type="number"/>
          <Inp label="WhatsApp comercial" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))}/>
          <Inp label="Nome da empresa" value={form.companyName} onChange={v=>setForm(f=>({...f,companyName:v}))}/>
          <Inp label="Email comercial" value={form.proposalEmail} onChange={v=>setForm(f=>({...f,proposalEmail:v}))}/>
          <Inp label="Documento" value={form.proposalDocument} onChange={v=>setForm(f=>({...f,proposalDocument:v}))}/>
          <Inp label="Cidade" value={form.proposalCity} onChange={v=>setForm(f=>({...f,proposalCity:v}))}/>
          <LogoUploader value={form.logoUrl} onChange={v=>setForm(f=>({...f,logoUrl:v}))} color={form.primaryColor||C.orange}/>
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Cor principal</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <input type="color" value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{width:46,height:38,borderRadius:10,border:`1px solid ${C.border}`,background:"transparent"}}/>
              <input value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
            </div>
          </div>
        </div>
        <Txt label="Serviços principais" value={form.mainServices} onChange={v=>setForm(f=>({...f,mainServices:v}))} rows={3}/>
        <Btn onClick={save}>Salvar negócio</Btn>
      </Card>
    </div>
  );
};

export default TabBusinessSettings;
