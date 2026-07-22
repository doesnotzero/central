import React, { useState } from 'react';
import { C, APP_NAME, APP_SUBTITLE } from '../theme.config.js';
import { normalizeBusiness, SERVICES_CATALOG, AUDIOVISUAL_PRESETS } from '../constants/index.js';
import { fmtCurrency, presetById, presetDeliverables } from '../utils/helpers.js';
import { Card, Tag, Btn, Inp, Txt, Modal, Divider, SectionTitle } from '../components/ui/index.jsx';

const TabProposta = ({state,dispatch})=>{
  const emptyClient={name:"",company:"",email:"",phone:"",city:"",cnpj:""};
  const [client,setClient]=useState(emptyClient);
  const [loadedClientId,setLoadedClientId]=useState("");
  const [loadedProjectId,setLoadedProjectId]=useState("");
  const [selected,setSelected]=useState([]);
  const [customService,setCustomService]=useState({name:"",price:""});
  const [showCustom,setShowCustom]=useState(false);
  const [discount,setDiscount]=useState(0);
  const [payTerms,setPayTerms]=useState("50% na assinatura + 50% na entrega");
  const [deadline,setDeadline]=useState("");
  const [notes,setNotes]=useState("");
  const [validity,setValidity]=useState("15");
  const [proposalStatus,setProposalStatus]=useState("rascunho");
  const [autoProjectDone,setAutoProjectDone]=useState(false);
  const [generating,setGenerating]=useState(false);
  const business=normalizeBusiness(state?.business);
  const savedClients=state?.clients||[];
  const savedProjects=savedClients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));

  const total=selected.reduce((a,s)=>a+s.price*s.qty,0);
  const discountVal=Math.round(total*discount/100);
  const finalTotal=total-discountVal;

  const toggleService=(svc)=>{
    const y=window.scrollY||document.documentElement.scrollTop||0;
    setSelected(prev=>{
      const ex=prev.find(s=>s.id===svc.id);
      if(ex) return prev.filter(s=>s.id!==svc.id);
      return [...prev,{...svc,qty:1,customPrice:svc.price}];
    });
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"auto"}));
  };
  const updateQty=(id,qty)=>setSelected(prev=>prev.map(s=>s.id===id?{...s,qty:Math.max(1,qty)}:s));
  const updatePrice=(id,price)=>setSelected(prev=>prev.map(s=>s.id===id?{...s,customPrice:Number(price)||0,price:Number(price)||0}:s));
  const addCustom=()=>{
    if(!customService.name||!customService.price)return;
    setSelected(prev=>[...prev,{id:`custom_${Date.now()}`,name:customService.name,desc:"Serviço personalizado",price:Number(customService.price),qty:1,customPrice:Number(customService.price)}]);
    setCustomService({name:"",price:""});setShowCustom(false);
  };
  const loadClient=c=>{setLoadedClientId(c.id);setLoadedProjectId("");setAutoProjectDone(false);setClient({name:c.name||"",company:c.name||"",email:c.email||"",phone:c.phone||"",city:business.proposalCity||"",cnpj:""});};
  const loadProject=p=>{
    loadClient(p.client);
    setLoadedProjectId(p.video.id);
    const preset=presetById(p.video.presetId||p.video.type);
    const base=SERVICES_CATALOG.find(s=>s.name===(p.client.service||preset.service))||{id:`project_${p.video.id}`,name:p.client.service||preset.service,desc:p.video.title,price:Number(p.client.value||preset.value||0)};
    setSelected([{...base,id:`project_${p.video.id}`,name:p.video.title||base.name,desc:`${p.client.name} · ${p.video.type}`,price:Number(p.client.value||base.price||0),qty:1,customPrice:Number(p.client.value||base.price||0)}]);
    setDeadline(p.video.deadline||"");
    setNotes(`Escopo: ${(p.video.deliverables||presetDeliverables(preset)).map(d=>d.text||d).join(", ")}.`);
  };
  const saveProposalToCRM=()=>{
    if(!loadedClientId){alert("Selecione um cliente em 'Criar a partir do sistema' antes de salvar no CRM.");return;}
    const proposal={
      status:proposalStatus,
      clientName:client.name,
      projectId:loadedProjectId||null,
      projectTitle:selected[0]?.name||"",
      services:selected.map(s=>({id:s.id,name:s.name,desc:s.desc,qty:s.qty,price:s.price})),
      total:finalTotal,
      subtotal:total,
      discount,
      payTerms,
      deadline,
      validity,
      notes
    };
    dispatch({type:"ADD_CLIENT_PROPOSAL",clientId:loadedClientId,proposal});
    dispatch({type:"ADD_CLIENT_INTERACTION",id:loadedClientId,interaction:{type:"proposta",note:`Proposta ${proposalStatus} salva: ${fmtCurrency(finalTotal)}`}});
    // Fecha o ciclo: proposta aceita vira projeto de produção automaticamente.
    if(proposalStatus==="aceita" && !loadedProjectId && !autoProjectDone){
      const preset=presetById(selected[0]?.id?.replace?.("project_","")||"institucional");
      dispatch({type:"ADD_CLIENT_VIDEO",id:loadedClientId,video:{
        title:selected[0]?.name||"Projeto aprovado",
        type:preset?.type||"gravação",
        presetId:preset?.id||"institucional",
        status:"pendente",
        value:finalTotal,
        deadline:deadline||"",
        deliverables:selected.map(s=>({text:s.name,done:false})),
        fromProposal:true
      }});
      dispatch({type:"UPDATE_CLIENT",id:loadedClientId,data:{status:"em_producao",value:finalTotal}});
      dispatch({type:"ADD_CLIENT_INTERACTION",id:loadedClientId,interaction:{type:"projeto",note:`Projeto criado automaticamente a partir da proposta aceita: ${selected[0]?.name||"Projeto"}`}});
      setAutoProjectDone(true);
    }
  };

  const generatePDF=()=>{
    setGenerating(true);
    const now=new Date();
    const docNum=String(Date.now()).slice(-5);
    const servicesHTML=selected.map(s=>`
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e">
          <div style="font-size:14px;font-weight:700;color:#fff">${s.name}</div>
          <div style="font-size:12px;color:#555;margin-top:2px">${s.desc||""}</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:center;color:#aaa;font-size:13px">${s.qty}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:right;color:#e2e2e2;font-size:13px;font-weight:600">${fmtCurrency(s.price)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:right;color:#ff2400;font-size:14px;font-weight:800">${fmtCurrency(s.price*s.qty)}</td>
      </tr>
    `).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Proposta — ${client.name||"Cliente"}</title>
    <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0d0d0d;color:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;padding:50px;max-width:880px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:50px;padding-bottom:30px;border-bottom:2px solid #ff2400}
    .brand-name{font-size:30px;font-weight:900;color:#fff;letter-spacing:.05em}
    .brand-sub{font-size:11px;color:#ff2400;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin-top:4px}
    .doc-label{font-size:10px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-align:right}
    .doc-num{font-size:22px;font-weight:900;color:#ff2400;text-align:right;margin-top:4px}
    .doc-date{font-size:11px;color:#333;text-align:right;margin-top:4px}
    .section{margin-bottom:40px}
    .section-title{font-size:11px;font-weight:800;color:#ff2400;text-transform:uppercase;letter-spacing:.15em;margin-bottom:18px;padding-bottom:8px;border-bottom:1px solid #1a1a1a}
    .client-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .field{background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:12px 16px}
    .field-label{font-size:10px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
    .field-value{font-size:14px;color:#e2e2e2;font-weight:500}
    table{width:100%;border-collapse:collapse;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e}
    thead{background:#1a1a1a}
    th{padding:12px 16px;font-size:11px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-align:left}
    th:nth-child(2){text-align:center}th:nth-child(3){text-align:right}th:nth-child(4){text-align:right}
    .totals{background:#141414;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;margin-top:12px}
    .total-row{display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #1e1e1e}
    .total-final{background:linear-gradient(135deg,rgba(255,36,0,.15),rgba(0,0,0,0));border:1px solid rgba(255,36,0,.3);border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}
    .terms-box{background:#111;border-radius:12px;padding:22px 24px}
    .terms-title{font-size:11px;color:#333;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
    .terms-text{font-size:12px;color:#3a3a3a;line-height:1.8}
    .footer{margin-top:50px;padding-top:20px;border-top:1px solid #1a1a1a;display:flex;justify-content:space-between;align-items:center}
    .sign-area{border-top:1px solid #2a2a2a;padding-top:8px;font-size:10px;color:#333;width:220px;text-align:center}
    @media print{body{padding:30px}}
    </style></head><body>
    <div class="header">
      <div><div class="brand-name">${(business.brandName||APP_NAME).toUpperCase()}</div><div class="brand-sub">${business.type||APP_SUBTITLE} · Propostas e operação comercial</div></div>
      <div><div class="doc-label">Proposta Comercial</div><div class="doc-num">#${docNum}</div><div class="doc-date">${now.toLocaleDateString("pt-BR")}</div></div>
    </div>
    <div class="section">
      <div class="section-title">📋 Dados do Cliente</div>
      <div class="client-grid">
        ${client.name?`<div class="field"><div class="field-label">Nome / Responsável</div><div class="field-value">${client.name}</div></div>`:""}
        ${client.company?`<div class="field"><div class="field-label">Empresa</div><div class="field-value">${client.company}</div></div>`:""}
        ${client.email?`<div class="field"><div class="field-label">Email</div><div class="field-value">${client.email}</div></div>`:""}
        ${client.phone?`<div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${client.phone}</div></div>`:""}
        ${client.city?`<div class="field"><div class="field-label">Cidade</div><div class="field-value">${client.city}</div></div>`:""}
        ${client.cnpj?`<div class="field"><div class="field-label">CNPJ</div><div class="field-value">${client.cnpj}</div></div>`:""}
        ${deadline?`<div class="field"><div class="field-label">Prazo de Entrega</div><div class="field-value">${new Date(deadline+"T00:00").toLocaleDateString("pt-BR")}</div></div>`:""}
        <div class="field"><div class="field-label">Validade da Proposta</div><div class="field-value">${validity} dias</div></div>
      </div>
    </div>
    ${selected.length>0?`
    <div class="section">
      <div class="section-title">🎬 Escopo de Serviços</div>
      <table>
        <thead><tr><th>Serviço</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead>
        <tbody>${servicesHTML}</tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span style="font-size:13px;color:#666">Subtotal</span><span style="font-size:13px;color:#aaa;font-weight:600">${fmtCurrency(total)}</span></div>
        ${discount>0?`<div class="total-row"><span style="font-size:13px;color:#666">Desconto (${discount}%)</span><span style="font-size:13px;color:#10b981;font-weight:600">-${fmtCurrency(discountVal)}</span></div>`:""}
      </div>
      <div class="total-final">
        <div><div style="font-size:12px;color:#ff2400;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Valor Total do Projeto</div>${notes?`<div style="font-size:12px;color:#555;margin-top:6px;max-width:380px">${notes}</div>`:""}</div>
        <div style="font-size:38px;font-weight:900;color:#fff">${fmtCurrency(finalTotal)}</div>
      </div>
    </div>`:""} 
    <div class="section">
      <div class="section-title">💳 Condições Comerciais</div>
      <div class="field" style="margin-bottom:0"><div class="field-label">Forma de Pagamento</div><div class="field-value" style="margin-top:6px">${payTerms}</div></div>
    </div>
    <div class="terms-box">
      <div class="terms-title">Termos & Condições</div>
      <div class="terms-text">Esta proposta tem validade de ${validity} dias a partir da data de emissão. Os prazos de entrega serão definidos após confirmação e aprovação do projeto. Qualquer alteração de escopo após o início da produção estará sujeita a revisão de valores. O pagamento deverá ser realizado conforme acordado. Todos os direitos de imagem e produção audiovisual serão transferidos ao cliente após quitação total do contrato.</div>
    </div>
    <div class="footer">
      <div><div class="sign-area">Equipe ${business.brandName||APP_NAME}<br>${business.proposalEmail||"Responsável comercial"}</div></div>
      <div><div class="sign-area">${client.name||"Cliente"}<br>Responsável pela contratação</div></div>
    </div>
    </body></html>`;
    const w=window.open("","_blank");
    w.document.write(html);w.document.close();
    setTimeout(()=>{w.print();setGenerating(false);},800);
  };

  const isSelected=(id)=>selected.some(s=>s.id===id);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:C.orange}}>COMERCIAL</div>
            <div className="page-title">Propostas</div>
            <p className="page-subtitle">Monte uma proposta com a identidade da {business.brandName||APP_NAME}, exporte em PDF e salve no histórico do cliente.</p>
          </div>
        </div>
      </Card>

      {(savedClients.length>0||savedProjects.length>0)&&<Card>
        <SectionTitle>CRIAR A PARTIR DO SISTEMA</SectionTitle>
        {savedClients.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Clientes</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{savedClients.slice(0,8).map(c=><button key={c.id} onClick={()=>loadClient(c)} className="private-data" style={{padding:"7px 10px",borderRadius:10,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)",color:"#ddd",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"inherit"}}>{c.name}</button>)}</div>
        </div>}
        {savedProjects.length>0&&<div>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Projetos</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}} className="modal-grid">{savedProjects.slice(0,6).map(p=><button key={`${p.client.id}-${p.video.id}`} onClick={()=>loadProject(p)} style={{textAlign:"left",padding:"10px 12px",borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(59,130,246,.055)",color:"#ddd",cursor:"pointer",fontFamily:"inherit"}}>
            <div className="private-data" style={{fontSize:12,fontWeight:900,color:"#fff"}}>{p.video.title}</div>
            <div className="private-data" style={{fontSize:10,color:C.muted,marginTop:3}}>{p.client.name} · {p.video.status}</div>
          </button>)}</div>
        </div>}
      </Card>}

      {/* Client Info */}
      <Card>
        <SectionTitle>DADOS DO CLIENTE</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Inp label="Nome / Responsável" value={client.name} onChange={v=>setClient(c=>({...c,name:v}))} placeholder="Nome do cliente"/>
          <Inp label="Empresa" value={client.company} onChange={v=>setClient(c=>({...c,company:v}))} placeholder="Nome da empresa"/>
          <Inp label="Email" value={client.email} onChange={v=>setClient(c=>({...c,email:v}))} placeholder="email@empresa.com"/>
          <Inp label="WhatsApp" value={client.phone} onChange={v=>setClient(c=>({...c,phone:v}))} placeholder="(48) 99999-9999"/>
          <Inp label="Cidade" value={client.city} onChange={v=>setClient(c=>({...c,city:v}))} placeholder="Florianópolis, SC"/>
          <Inp label="CNPJ / CPF" value={client.cnpj} onChange={v=>setClient(c=>({...c,cnpj:v}))} placeholder="Opcional"/>
        </div>
      </Card>

      {/* Services */}
      <Card>
        <SectionTitle action={<Btn onClick={()=>setShowCustom(true)} size="sm" variant="ghost">+ Personalizado</Btn>}>SERVIÇOS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {SERVICES_CATALOG.map(svc=>{
            const sel=isSelected(svc.id);
            return (
              <div key={svc.id} onClick={()=>toggleService(svc)} style={{padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?"#3b82f6":C.border}`,background:sel?"rgba(59,130,246,.1)":C.surface,cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                  <div style={{fontSize:13,fontWeight:700,color:sel?"#fff":"#ccc"}}>{svc.name}</div>
                  <div style={{fontSize:10,color:sel?"#3b82f6":C.muted,fontWeight:700,flexShrink:0,marginLeft:6}}>{sel?"✓":""}</div>
                </div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{svc.desc}</div>
                <div style={{fontSize:13,fontWeight:800,color:sel?"#3b82f6":C.orange}}>{fmtCurrency(svc.price)}</div>
              </div>
            );
          })}
        </div>

        {/* Selected services editor */}
        {selected.length>0&&(
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:4}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>SERVIÇOS SELECIONADOS</div>
            {selected.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"10px 14px",background:"rgba(59,130,246,.07)",borderRadius:10,border:"1px solid rgba(59,130,246,.2)"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#e2e2e2"}}>{s.name}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:700}}>QTD</div>
                    <input type="number" min="1" value={s.qty} onChange={e=>updateQty(s.id,+e.target.value)} style={{width:48,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:"#fff",fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:700}}>VALOR (R$)</div>
                    <input type="number" min="0" value={s.price} onChange={e=>updatePrice(s.id,e.target.value)} style={{width:90,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:"#fff",fontSize:13,fontWeight:700,outline:"none",textAlign:"right"}}/>
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:"#3b82f6",minWidth:90,textAlign:"right"}}>{fmtCurrency(s.price*s.qty)}</div>
                  <button onClick={()=>setSelected(prev=>prev.filter(x=>x.id!==s.id))} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conditions */}
      <Card>
        <SectionTitle>CONDIÇÕES COMERCIAIS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Desconto (%)</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input type="range" min={0} max={50} value={discount} onChange={e=>setDiscount(+e.target.value)} style={{flex:1,accentColor:C.orange}}/>
              <span style={{fontSize:15,fontWeight:800,color:C.orange,minWidth:36}}>{discount}%</span>
            </div>
          </div>
          <Inp label="Validade da proposta (dias)" value={validity} onChange={setValidity} placeholder="15" type="number"/>
        </div>
        <Inp label="Prazo de entrega" value={deadline} onChange={setDeadline} type="date"/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Forma de pagamento</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {["50% na assinatura + 50% na entrega","100% na assinatura","30% na assinatura + 70% na entrega","Parcelado em 3x","A combinar"].map(opt=>(
              <button key={opt} onClick={()=>setPayTerms(opt)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${payTerms===opt?C.orange:C.border}`,background:payTerms===opt?`${C.orange}12`:"transparent",color:payTerms===opt?C.orange:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                {payTerms===opt?"● ":"○ "}{opt}
              </button>
            ))}
          </div>
        </div>
        <Txt label="Observações / Escopo adicional" value={notes} onChange={setNotes} placeholder="Inclui revisões ilimitadas, direitos de imagem..." rows={3}/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Status da proposta</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {["rascunho","enviada","aceita","recusada"].map(s=><button key={s} onClick={()=>setProposalStatus(s)} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:proposalStatus===s?C.orange:C.border,background:proposalStatus===s?`${C.orange}15`:"transparent",color:proposalStatus===s?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>)}
          </div>
          {proposalStatus==="aceita"&&!loadedProjectId&&<div style={{marginTop:9,fontSize:11,color:"#10b981",lineHeight:1.5,display:"flex",gap:7,alignItems:"flex-start"}}><span>✓</span><span>Ao salvar no CRM, um <strong>projeto de produção</strong> será criado automaticamente e o cliente vai pra <strong>Em produção</strong>.</span></div>}
        </div>
      </Card>

      {/* Summary */}
      {selected.length>0&&(
        <Card style={{background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(0,0,0,0))",borderColor:"rgba(59,130,246,.25)"}}>
          <SectionTitle>RESUMO FINANCEIRO</SectionTitle>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:C.muted}}>Subtotal</span>
            <span style={{fontSize:13,color:"#e2e2e2",fontWeight:600}}>{fmtCurrency(total)}</span>
          </div>
          {discount>0&&(
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,color:C.muted}}>Desconto ({discount}%)</span>
              <span style={{fontSize:13,color:"#10b981",fontWeight:700}}>-{fmtCurrency(discountVal)}</span>
            </div>
          )}
          <Divider/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>Total Final</span>
            <span style={{fontSize:28,fontWeight:900,color:"#3b82f6",fontFamily:"var(--font-display)"}}>{fmtCurrency(finalTotal)}</span>
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="mobile-actions">
        <Btn onClick={saveProposalToCRM} disabled={selected.length===0} variant="ghost" style={{justifyContent:"center",fontSize:14,padding:"14px 20px"}}>Salvar no CRM</Btn>
        <Btn onClick={generatePDF} disabled={generating||selected.length===0} variant="proposal" style={{justifyContent:"center",fontSize:15,padding:"14px 20px"}}>
          {generating?"Gerando PDF...":"Gerar PDF"}
        </Btn>
      </div>
      {selected.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:-8}}>Selecione pelo menos um serviço para gerar a proposta</div>}

      <Modal open={showCustom} onClose={()=>setShowCustom(false)} title="Serviço Personalizado">
        <Inp label="Nome do serviço" value={customService.name} onChange={v=>setCustomService(c=>({...c,name:v}))} placeholder="Ex: Consultoria de marca"/>
        <Inp label="Valor (R$)" value={customService.price} onChange={v=>setCustomService(c=>({...c,price:v}))} placeholder="0" type="number"/>
        <Btn onClick={addCustom}>+ Adicionar serviço</Btn>
      </Modal>
    </div>
  );
};

export default TabProposta;
