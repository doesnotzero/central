import React, { useState, useRef } from 'react';
import { C, APP_NAME } from '../theme.config.js';
import { SK, MONTHS, normalizeBusiness, clientStageLabel } from '../constants/index.js';
import { fmtCurrency } from '../utils/helpers.js';
import { encryptBackupPayload, decryptBackupPayload } from '../utils/crypto.js';
import { Card, Tag, Btn, SectionTitle } from '../components/ui/index.jsx';

const TabExport = ({state,dispatch})=>{
  const [month,setMonth]=useState(new Date().getMonth()),[year,setYear]=useState(new Date().getFullYear());
  const [generating,setGenerating]=useState(false);
  const [lastBackup,setLastBackup]=useState(()=>localStorage.getItem("dcc_last_backup"));
  const fileRef=useRef(null);
  const business=normalizeBusiness(state.business);
  const brandName=business.brandName||APP_NAME;
  const REPORTS=[
    {id:"executive",icon:"▦",title:"Resumo executivo",desc:`Indicadores da operação ${brandName}`,color:C.orange},
    {id:"production",icon:"▶",title:"Produção",desc:"Projetos, entregas, prazos e documentos gerados",color:"#8b5cf6"},
    {id:"commercial",icon:"◆",title:"Comercial",desc:"Clientes, propostas, receita prevista e recebimentos",color:"#10b981"},
    {id:"videoReview",icon:"◉",title:"Video Review",desc:"Links enviados, aprovações e ajustes solicitados",color:"#06b6d4"},
  ];
  const [selectedReports,setSelectedReports]=useState(REPORTS.map(r=>r.id));
  const toggleReport=id=>setSelectedReports(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const hasReport=id=>selectedReports.includes(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const exportBackup=()=>{
    if(!window.confirm("O backup JSON contém dados sensíveis como clientes, valores e notas. Gere apenas se for guardar em um local seguro."))return;
    const blob=new Blob([JSON.stringify({...state,_meta:{app:APP_NAME,exportedAt:new Date().toISOString(),containsSensitiveData:true}},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${brandName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-backup-${year}-${String(month+1).padStart(2,"0")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now=new Date().toISOString();
    localStorage.setItem("dcc_last_backup",now);
    setLastBackup(now);
  };
  const exportEncryptedBackup=async()=>{
    try{
      if(!window.confirm("Este backup será criptografado com senha. Sem essa senha, não será possível restaurar os dados. Continuar?"))return;
      const p1=window.prompt("Crie uma senha forte para criptografar o backup:");
      if(!p1||p1.length<8){alert("Use uma senha com pelo menos 8 caracteres.");return;}
      const p2=window.prompt("Repita a senha para confirmar:");
      if(p1!==p2){alert("As senhas não conferem.");return;}
      const payload={...state,_meta:{app:APP_NAME,exportedAt:new Date().toISOString(),containsSensitiveData:true,encrypted:true}};
      const encrypted=await encryptBackupPayload(payload,p1);
      const blob=new Blob([JSON.stringify(encrypted,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`${brandName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-backup-criptografado-${year}-${String(month+1).padStart(2,"0")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const now=new Date().toISOString();
      localStorage.setItem("dcc_last_backup",now);
      setLastBackup(now);
    }catch(err){
      alert(`Não consegui criptografar o backup: ${err.message||"erro desconhecido"}`);
    }
  };
  const clearData=()=>{
    if(!window.confirm("Isso vai apagar todos os dados salvos neste navegador. Você já exportou um backup?"))return;
    if(window.prompt("Digite APAGAR para confirmar a limpeza total")!=="APAGAR")return;
    localStorage.removeItem(SK);
    dispatch({type:"CLEAR_DATA"});
  };
  const importBackup=e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(!window.confirm("Importar este backup vai substituir os dados atuais deste navegador. Continuar?")){e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=async()=>{
      try{
        const data=JSON.parse(reader.result);
        if(!data||typeof data!=="object")throw new Error("invalid");
        if(data._dnzEncryptedBackup){
          const password=window.prompt("Digite a senha deste backup criptografado:");
          if(!password)throw new Error("Senha obrigatória para backup criptografado.");
          const decrypted=await decryptBackupPayload(data,password);
          dispatch({type:"RESTORE",p:decrypted});
        }else{
          dispatch({type:"RESTORE",p:data});
        }
      }catch{
        alert(`Não consegui importar esse backup. Verifique se o arquivo é válido e, se estiver criptografado, se a senha está correta.`);
      }
      e.target.value="";
    };
    reader.readAsText(file);
  };
  const generatePDF=()=>{
    setGenerating(true);
    const today=new Date();
    const clients=state.clients||[];
    const projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
    const entries=state.financeEntries||[];
    const reviews=state.reviewDeliverables||[];
    const activeClients=clients.filter(c=>!["entregue","pago"].includes(normalizeBusiness(state.business)?normalizeBusiness(state.business).brandName?c:true:c)).length;
    const openProjects=projects.filter(p=>p.video.status!=="entregue").length;
    const pendingReviews=reviews.filter(r=>!["aprovado","approved"].includes(String(r.status||"").toLowerCase())).length;
    const paidTotal=clients.filter(c=>c.payment==="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
    const receivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
    const reportName=selectedReports.length===REPORTS.length?`Relatório Executivo ${brandName}`:`Relatório ${REPORTS.filter(r=>hasReport(r.id)).map(r=>r.title).join(" + ")}`;
    const kpi=(label,value,color=C.orange)=>`<div class="kpi"><div class="kpi-val" style="color:${color}">${esc(value)}</div><div class="kpi-label">${esc(label)}</div></div>`;
    const row=(title,meta,value,color=C.orange)=>`<div class="row"><div><strong>${esc(title)}</strong><span>${esc(meta||"")}</span></div><b style="color:${color}">${esc(value||"")}</b></div>`;
    const executiveHTML=hasReport("executive")?`<h2>Resumo executivo</h2><div class="kpi-grid">${kpi("Clientes ativos",clients.filter(c=>!["entregue","pago"].includes((c.status||""))).length,"#10b981")}${kpi("Projetos abertos",openProjects,"#8b5cf6")}${kpi("Reviews pendentes",pendingReviews,"#06b6d4")}${kpi("A receber",fmtCurrency(receivable),"#eab308")}</div>`:"";
    const productionHTML=hasReport("production")?`<h2>Produção audiovisual</h2>${projects.length?projects.map(p=>row(p.video.title||"Projeto sem título",[p.client.name,p.video.type,p.video.deadline&&`prazo ${p.video.deadline}`].filter(Boolean).join(" · "),p.video.status||"em produção","#8b5cf6")).join(""):`<div class="empty">Nenhum projeto cadastrado neste período.</div>`}`:"";
    const commercialHTML=hasReport("commercial")?`<h2>Comercial e caixa</h2>${clients.length?clients.map(c=>row(c.name,[c.service,clientStageLabel(c),c.payment].filter(Boolean).join(" · "),fmtCurrency(c.value||0),c.payment==="pago"?"#10b981":"#eab308")).join(""):`<div class="empty">Nenhum cliente cadastrado.</div>`}<div class="kpi-grid compact">${kpi("Recebido",fmtCurrency(paidTotal),"#10b981")}${kpi("A receber",fmtCurrency(receivable),"#eab308")}${kpi("Propostas",clients.reduce((a,c)=>a+(c.proposals||[]).length,0),C.orange)}${kpi("Clientes",clients.length,"#06b6d4")}</div>`:"";
    const videoReviewHTML=hasReport("videoReview")?`<h2>Video Review</h2>${reviews.length?reviews.map(r=>row(r.title||"Review sem título",[r.clientName,r.status,r.comments?.length?`${r.comments.length} comentários`:null].filter(Boolean).join(" · "),r.status||"aguardando","#06b6d4")).join(""):`<div class="empty">Nenhum link de review cadastrado ainda.</div>`}`:"";
    const emptyHTML=!executiveHTML&&!productionHTML&&!commercialHTML&&!videoReviewHTML?`<div class="empty">Nenhum relatório selecionado.</div>`:"";
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(reportName)} — ${MONTHS[month]} ${year}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0d0d;color:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;padding:40px;max-width:920px;margin:0 auto}h1{font-size:34px;font-weight:900;color:#fff;margin-bottom:4px}h2{font-size:14px;font-weight:900;color:${C.orange};text-transform:uppercase;letter-spacing:.14em;margin:30px 0 14px;padding-bottom:8px;border-bottom:1px solid #333}.hero{background:linear-gradient(135deg,${C.orange}24,rgba(0,0,0,0));border:1px solid ${C.orange}45;border-radius:16px;padding:24px 28px;margin-bottom:28px}.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.kpi-grid.compact{margin-top:18px}.kpi{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px;text-align:center}.kpi-val{font-size:22px;font-weight:900}.kpi-label{font-size:10px;color:#777;margin-top:4px;text-transform:uppercase;letter-spacing:.08em}.row{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:13px 15px;margin-bottom:9px}.row strong{display:block;color:#fff;font-size:14px}.row span{display:block;color:#888;font-size:11px;margin-top:4px;line-height:1.4}.row b{font-size:13px;white-space:nowrap}.empty{padding:18px;background:#171717;border:1px solid #2a2a2a;border-radius:12px;color:#888;text-align:center}@media print{body{padding:20px}.kpi-grid{grid-template-columns:repeat(2,1fr)}}}</style></head><body>
    <div class="hero"><div style="font-size:12px;color:${C.orange};font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:7px">${esc(brandName.toUpperCase())} — ${esc(APP_NAME.toUpperCase())}</div><h1>${esc(reportName)}</h1><div style="color:#777;font-size:13px">${MONTHS[month]} de ${year} · ${today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
    ${executiveHTML}${productionHTML}${commercialHTML}${videoReviewHTML}${emptyHTML}
    <div style="margin-top:40px;padding:16px;background:#151515;border-radius:10px;text-align:center;color:#555;font-size:12px">${esc(brandName)} · ${today.toLocaleDateString("pt-BR")}</div></body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>{w.print();setGenerating(false);},800);
  };
  const clients=state.clients||[];
  const projects=clients.flatMap(c=>c.videos||[]);
  const reviews=state.reviewDeliverables||[];
  const activeProjects=projects.filter(v=>v.status!=="entregue").length;
  const activeClients=clients.filter(c=>!["entregue","pago"].includes(c.status||"")).length;
  const paidTotal=clients.filter(c=>c.payment==="pago").reduce((a,c)=>a+Number(c.value||0),0)+(state.financeEntries||[]).filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const backupDays=lastBackup?Math.floor((new Date()-new Date(lastBackup))/(1000*60*60*24)):null;
  const backupWarn=backupDays===null||backupDays>=7;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:C.orange}}>SISTEMA</div>
            <div className="page-title">Relatórios</div>
            <p className="page-subtitle">Relatórios por área ou documento completo pra imprimir/salvar em PDF, além de backup dos dados.</p>
          </div>
        </div>
      </Card>
      <Card style={{padding:"20px 22px"}}>
        {backupWarn&&<div style={{padding:"10px 12px",borderRadius:12,background:"rgba(234,179,8,.1)",border:"1px solid rgba(234,179,8,.28)",color:"#eab308",fontSize:12,fontWeight:700,marginBottom:14}}>Backup recomendado: {backupDays===null?"nenhum backup registrado":`último backup há ${backupDays} dias`}.</div>}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>Mês</div><select value={month} onChange={e=>setMonth(+e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>{MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}</select></div>
          <div style={{flex:1,minWidth:100}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>Ano</div><select value={year} onChange={e=>setYear(+e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>{[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
        </div>
        <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[
            {v:activeProjects,l:"Projetos ativos",c:C.orange},
            {v:reviews.length,l:"Video Reviews",c:"#06b6d4"},
            {v:activeClients,l:"Clientes ativos",c:"#3b82f6"},
            {v:fmtCurrency(paidTotal),l:"Recebido",c:"#eab308"},
          ].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:i===3?12:22,fontWeight:800,color:s.c,fontFamily:"var(--font-display)"}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{s.l}</div></div>)}
        </div>
        <SectionTitle>RELATÓRIOS INCLUÍDOS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9,marginBottom:16}}>
          {REPORTS.map(r=>{
            const on=hasReport(r.id);
            return <button key={r.id} onClick={()=>toggleReport(r.id)} style={{display:"flex",alignItems:"center",gap:12,textAlign:"left",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${on?r.color:C.border}`,background:on?`${r.color}10`:"rgba(255,255,255,.025)",color:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .18s"}}>
              <span style={{fontSize:20,width:28,textAlign:"center"}}>{r.icon}</span>
              <span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:800,color:on?r.color:"#ddd"}}>{r.title}</span><span style={{display:"block",fontSize:11,color:C.muted,marginTop:2}}>{r.desc}</span></span>
              <span style={{fontSize:18,color:on?r.color:C.muted}}>{on?"✓":"○"}</span>
            </button>;
          })}
        </div>
        <div className="mobile-actions" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Btn onClick={generatePDF} disabled={generating||selectedReports.length===0} style={{justifyContent:"center",fontSize:14,padding:"13px 16px"}}>{generating?"⏳ Gerando...":"📄 Gerar PDF"}</Btn>
          <Btn onClick={exportEncryptedBackup} variant="success" style={{justifyContent:"center",fontSize:14,padding:"13px 16px"}}>Backup criptografado</Btn>
        </div>
        <Btn onClick={exportBackup} variant="ghost" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>Backup JSON sem criptografia</Btn>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={importBackup} style={{display:"none"}}/>
        <Btn onClick={()=>fileRef.current?.click()} variant="ghost" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>↥ Importar backup JSON / criptografado</Btn>
        <Btn onClick={clearData} variant="danger" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>Limpar todos os dados</Btn>
        <div style={{fontSize:11,color:C.muted,marginTop:10,textAlign:"center"}}>Ctrl+P / Cmd+P na nova aba para salvar como PDF</div>
      </Card>
    </div>
  );
};

export default TabExport;
