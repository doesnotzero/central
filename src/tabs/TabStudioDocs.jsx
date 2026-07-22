import React, { useState } from 'react';
import { ChipSelector } from '../components/form-fields/ChipSelector.jsx';
import { CurrencyInput } from '../components/form-fields/CurrencyInput.jsx';
import { DurationPicker } from '../components/form-fields/DurationPicker.jsx';
import { OptionCards } from '../components/form-fields/OptionCards.jsx';
import { TimeInput } from '../components/form-fields/TimeInput.jsx';

const FORMAT_OPTIONS = [
  { label: "16:9 YouTube", value: "16:9" },
  { label: "9:16 Reels", value: "9:16" },
  { label: "1:1 Feed", value: "1:1" },
  { label: "4K Master", value: "4K master" },
  { label: "Multiformato", value: "multiformato" }
];

const TONE_OPTIONS = [
  { label: "Premium", value: "Premium" },
  { label: "Documental", value: "Documental" },
  { label: "Direto", value: "Direto" },
  { label: "Emocional", value: "Emocional" },
  { label: "Técnico", value: "Técnico" },
  { label: "Jovem", value: "Jovem" }
];

const PAYMENT_OPTIONS = [
  { label: "50/50", value: "50% entrada, 50% na entrega" },
  { label: "30/70", value: "30% entrada, 70% na entrega" },
  { label: "100% aprovação", value: "100% na aprovação" },
  { label: "100% entrega", value: "100% na entrega" },
  { label: "Parcelado", value: "Parcelado conforme cronograma" }
];

const stringList = value => String(value || "").split(",").map(item => item.trim()).filter(Boolean);

export default function TabStudioDocs({state,dispatch,shared}){
  const {C,Card,Tag,Btn,SectionTitle,Inp,Txt,normalizeBusiness,addDaysInput,studioDocById,docConfig,presetById,studioDocTemplates,presetBriefing,presetDeliverables,PRODUCTION_PIPELINE,AUDIOVISUAL_PRESETS,STUDIO_DOCUMENTS} = shared;
  const business=normalizeBusiness(state.business);
  const clients=state.clients||[];
  const projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v,key:`${c.id}:${v.id}`})));
  const [form,setForm]=useState({
    docType:"callsheet",
    presetId:"institucional",
    clientId:"",
    projectKey:"",
    title:"Documento de produção",
    clientName:"",
    objective:"",
    audience:"",
    location:"",
    shootDate:"",
    deadline:addDaysInput(14),
    format:"16:9",
    duration:"60-120s",
    budget:"",
    reference:"",
    scope:"",
    crew:"",
    equipment:"",
    risks:"",
    notes:"",
    brandMessage:"",toneOfVoice:"",approvalCriteria:"",mandatoryPoints:"",logline:"",hook:"",cta:"",scenes:"",voiceover:"",callTime:"",wrapTime:"",producerContact:"",scheduleRows:"",talent:"",sceneCount:"",lenses:"",cameraMovement:"",audioPlan:"",shotList:"",coverageNotes:"",crewCost:"",equipmentCost:"",postCost:"",paymentTerms:"",assumptions:"",startDate:"",firstCutDate:"",approvalRounds:"",buffer:"",milestones:"",dependencies:"",productionType:"",cameraPackage:"",audioPackage:"",lightPackage:"",dataWorkflow:"",preflight:"",wrapChecklist:"",deliveryLinks:"",formats:"",versions:"",storagePolicy:"",acceptanceCriteria:"",deliveryNotes:""
  });
  const [generating,setGenerating]=useState(false);
  const [showComposer,setShowComposer]=useState(false);
  const selectedDoc=studioDocById(form.docType);
  const activeDocConfig=docConfig(form.docType);
  const selectedClient=clients.find(c=>String(c.id)===String(form.clientId));
  const selectedProject=projects.find(p=>p.key===form.projectKey);
  const selectedPreset=presetById(form.presetId);
  let html="";
  try{
    html=studioDocTemplates({form,business,client:selectedClient,project:selectedProject});
  }catch(err){
    console.error("Falha ao gerar o documento:",err);
    html=`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:32px;color:#333;background:#f7f4ee"><h2 style="color:#c00">Não foi possível montar a pré-visualização</h2><p>Ajuste os campos do documento e tente novamente. Se persistir, avise o suporte.</p></body></html>`;
  }
  const update=(key,value)=>setForm(f=>({...f,[key]:value}));
  const applyDocType=d=>setForm(f=>({...f,docType:d.id,title:f.title==="Documento de produção"?`${d.label} · ${presetById(f.presetId).title}`:f.title}));
  const applyPreset=p=>{
    const brief=presetBriefing(p);
    setForm(f=>({
      ...f,
      presetId:p.id,
      title:f.title==="Documento de produção"||f.title.includes(" · ")?`${studioDocById(f.docType).label} · ${p.title}`:f.title,
      format:brief.format,
      duration:brief.duration,
      objective:f.objective||brief.objective,
      scope:presetDeliverables(p).map(x=>x.text).join("\n"),
      budget:f.budget||p.value
    }));
  };
  const loadClient=id=>{
    const c=clients.find(x=>String(x.id)===String(id));
    setForm(f=>({...f,clientId:id,clientName:c?.name||"",projectKey:"",budget:c?.value||f.budget}));
  };
  const loadProject=key=>{
    const p=projects.find(x=>x.key===key);
    if(!p){update("projectKey","");return;}
    const preset=presetById(p.video.presetId||p.video.type);
    const brief={...presetBriefing(preset),...(p.video.briefing||{})};
    setForm(f=>({
      ...f,
      projectKey:key,
      clientId:String(p.client.id),
      clientName:p.client.name,
      presetId:preset.id,
      title:p.video.title||`${studioDocById(f.docType).label} · ${preset.title}`,
      objective:brief.objective||f.objective,
      audience:brief.audience||f.audience,
      location:brief.location||f.location,
      shootDate:brief.shootDate||f.shootDate,
      deadline:p.video.deadline||f.deadline,
      format:brief.format||preset.type,
      duration:brief.duration||f.duration,
      budget:p.client.value||preset.value||f.budget,
      reference:brief.reference||f.reference,
      scope:(p.video.deliverables||presetDeliverables(preset)).map(x=>x.text||x).join("\n")
    }));
  };
  const exportPDF=()=>{
    setGenerating(true);
    const w=window.open("","_blank");
    if(!w){setGenerating(false);alert("Permita pop-ups para gerar o PDF.");return;}
    w.document.write(html);w.document.close();
    setTimeout(()=>{w.print();setGenerating(false);},800);
  };
  const saveDoc=()=>{
    dispatch({type:"ADD_STUDIO_DOC",doc:{
      title:form.title||selectedDoc.label,
      docType:form.docType,
      docLabel:selectedDoc.label,
      clientId:form.clientId||null,
      clientName:selectedClient?.name||form.clientName||"",
      projectKey:form.projectKey||"",
      presetId:form.presetId,
      html,
      form
    }});
    if(selectedClient)dispatch({type:"ADD_CLIENT_INTERACTION",id:selectedClient.id,interaction:{type:"documento",note:`${selectedDoc.label} salvo no Studio: ${form.title||selectedPreset.title}`},silent:true});
    const step=PRODUCTION_PIPELINE.find(s=>s.docType===form.docType);
    if(selectedProject&&step)dispatch({type:"UPDATE_CLIENT_VIDEO",clientId:selectedProject.client.id,videoId:selectedProject.video.id,data:{productionPipeline:{...(selectedProject.video.productionPipeline||{}),[step.key]:true}},silent:true});
  };
  const restoreDoc=doc=>{
    if(doc.form)setForm({...form,...doc.form});
    setShowComposer(true);
  };
  const renderSmartField=field=>{
    const value=form[field.key]||"";
    if(field.key==="callTime"||field.key==="wrapTime"||field.type==="time"){
      return <TimeInput key={field.key} label={field.label} value={value} onChange={next=>update(field.key,next)}/>;
    }
    if(field.key==="budget"||field.key.endsWith("Cost")||field.type==="number"){
      return <CurrencyInput key={field.key} label={field.label} value={value} onChange={next=>update(field.key,next)}/>;
    }
    if(field.key==="format"){
      return <div key={field.key} style={{display:"grid",gap:8,marginBottom:18}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase"}}>{field.label}</div>
        <ChipSelector options={FORMAT_OPTIONS} value={value} onChange={next=>update(field.key,next)} />
      </div>;
    }
    if(field.key==="duration"){
      return <DurationPicker key={field.key} label={field.label} value={value} onChange={next=>update(field.key,next)} />;
    }
    if(field.key==="toneOfVoice"){
      return <ChipSelector key={field.key} options={TONE_OPTIONS} value={stringList(value)} onChange={next=>update(field.key,next.join(", "))} multiple />;
    }
    if(field.key==="paymentTerms"){
      return <ChipSelector key={field.key} options={PAYMENT_OPTIONS} value={value} onChange={next=>update(field.key,next)} />;
    }
    return <Inp key={field.key} label={field.label} type={field.type||"text"} value={value} onChange={next=>update(field.key,next)} placeholder={field.placeholder||""}/>;
  };
  return (
    <div className="page-stack">
      <Card className="studio-frame-hero" style={{padding:"20px 22px"}}>
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:C.orange}}>DNZ CENTRAL</div>
            <div className="page-title">Documentos de produção</div>
            <p className="page-subtitle">Preview limpo na página. Briefing, callsheet, orçamento, cronograma e relatório abrem em janela sobreposta quando precisar editar.</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Tag color={selectedDoc.color}>{selectedDoc.label}</Tag>
            <Tag color="#10b981">{(state.studioDocs||[]).length} salvos</Tag>
            <Btn onClick={()=>setShowComposer(true)} style={{borderRadius:2}}>Configurar documento</Btn>
          </div>
        </div>
      </Card>

      <div className="studio-doc-grid">
        <div className="studio-control-stack">
          <Card style={{padding:"12px"}}>
            <SectionTitle>ESCOLHA O DOCUMENTO</SectionTitle>
            <OptionCards
              options={STUDIO_DOCUMENTS.map(d=>({label:d.label,value:d.id,description:d.desc,icon:"▦"}))}
              value={form.docType}
              onChange={id=>applyDocType(studioDocById(id))}
              columns={2}
              compact
            />
          </Card>

          <Card style={{padding:"12px"}}>
            <SectionTitle>PRESET DE PRODUÇÃO</SectionTitle>
            <ChipSelector
              options={AUDIOVISUAL_PRESETS.map(p=>({label:p.label,value:p.id}))}
              value={form.presetId}
              onChange={id=>applyPreset(presetById(id))}
              size="sm"
            />
          </Card>

          <Card style={{padding:"12px",background:"rgba(255,255,255,.025)"}}>
            <SectionTitle>DOCUMENTO ATUAL</SectionTitle>
            <div style={{display:"grid",gap:10}}>
              {[
                ["Tipo",selectedDoc.label],
                ["Preset",selectedPreset.label],
                ["Cliente",selectedClient?.name||form.clientName||"a definir"],
                ["Projeto",selectedProject?.video?.title||form.title||"sem projeto vinculado"],
                ["Prazo",form.deadline?new Date(`${form.deadline}T00:00`).toLocaleDateString("pt-BR"):"sem prazo"],
              ].map(([a,b])=><div key={a} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.muted,fontWeight:900,textTransform:"uppercase",letterSpacing:".08em"}}>{a}</span>
                <span style={{fontSize:12,color:"#ddd",fontWeight:800,textAlign:"right"}}>{b}</span>
              </div>)}
            </div>
            <div className="mobile-actions" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              <Btn onClick={()=>setShowComposer(true)} variant="ghost" style={{justifyContent:"center",borderRadius:2}}>Editar campos</Btn>
              <Btn onClick={exportPDF} disabled={generating} style={{justifyContent:"center",borderRadius:2}}>{generating?"Gerando...":"Exportar PDF"}</Btn>
            </div>
          </Card>

          {showComposer&&<div className="modal-shell" role="presentation">
            <div className="modal-backdrop" onClick={()=>setShowComposer(false)} />
            <div className="scale-in modal-panel wide" role="dialog" aria-modal="true" aria-label="Configurar documento">
              <div className="modal-head">
                <div>
                  <h3 style={{margin:0,fontSize:16,fontWeight:900,color:"#fff",fontFamily:"var(--font-display)"}}>Configurar documento</h3>
                  <div style={{fontSize:10,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",marginTop:4}}>{selectedDoc.label} · {selectedPreset.label}</div>
                </div>
                <button type="button" onClick={()=>setShowComposer(false)} aria-label="Fechar janela" style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>x</button>
              </div>
              <div className="modal-scroll modal-body">
          <div className="studio-form-band" style={{border:"none",background:"transparent",padding:0}}>
            <SectionTitle>BASE DO DOCUMENTO</SectionTitle>
            {(clients.length>0||projects.length>0)&&<div className="form-grid-2">
              <div style={{marginBottom:13}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Cliente</div>
                <select value={form.clientId} onChange={e=>loadClient(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:2,padding:"9px 12px",color:"#fff",fontFamily:"inherit"}}>
                  <option value="">Sem cliente vinculado</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:13}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Projeto</div>
                <select value={form.projectKey} onChange={e=>loadProject(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:2,padding:"9px 12px",color:"#fff",fontFamily:"inherit"}}>
                  <option value="">Criar do zero</option>
                  {projects.map(p=><option key={p.key} value={p.key}>{p.video.title} · {p.client.name}</option>)}
                </select>
              </div>
            </div>}
            <div className="form-grid-2">
              <Inp label="Título" value={form.title} onChange={v=>update("title",v)} placeholder={`Ex: ${selectedDoc.label} campanha inverno`}/>
              <Inp label="Cliente avulso" value={form.clientName} onChange={v=>update("clientName",v)} placeholder="Nome do cliente se não estiver no CRM"/>
            </div>
            <div style={{margin:"8px 0 14px",padding:"12px",borderRadius:2,border:`1px solid ${selectedDoc.color}33`,background:`${selectedDoc.color}0d`}}>
              <div style={{fontSize:10,color:selectedDoc.color,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>{activeDocConfig.title}</div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.45}}>{activeDocConfig.tone}</div>
            </div>
            <div className="form-grid-2">
              {(activeDocConfig.fields||[]).map(renderSmartField)}
            </div>
            {(activeDocConfig.areas||[]).map(area=><Txt key={area.key} label={area.label} value={form[area.key]||""} onChange={v=>update(area.key,v)} placeholder={area.placeholder||""} rows={3}/>) }
            <div style={{marginTop:6}}>
              <SectionTitle>CAMADAS UNIVERSAIS</SectionTitle>
            </div>
            <div className="form-grid-2">
              <Inp label="Locação" value={form.location} onChange={v=>update("location",v)} placeholder="Estúdio, cliente, externa..."/>
              <Inp label="Referência" value={form.reference} onChange={v=>update("reference",v)} placeholder="Filme, link, campanha, mood"/>
              <Inp label="Data de captação" type="date" value={form.shootDate} onChange={v=>update("shootDate",v)}/>
              <Inp label="Prazo final" type="date" value={form.deadline} onChange={v=>update("deadline",v)}/>
              <div style={{display:"grid",gap:8,marginBottom:18}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase"}}>Formato</div>
                <ChipSelector options={FORMAT_OPTIONS} value={form.format} onChange={v=>update("format",v)}/>
              </div>
              <DurationPicker value={form.duration} onChange={v=>update("duration",v)}/>
              <CurrencyInput label="Orçamento base" value={form.budget} onChange={v=>update("budget",v)}/>
            </div>
            <Txt label="Escopo / entregáveis" value={form.scope} onChange={v=>update("scope",v)} placeholder="Um item por linha" rows={4}/>
            <Txt label="Equipe específica" value={form.crew} onChange={v=>update("crew",v)} placeholder="Opcional. Se vazio, o Studio usa equipe recomendada pelo preset." rows={3}/>
            <Txt label="Equipamentos específicos" value={form.equipment} onChange={v=>update("equipment",v)} placeholder="Opcional. Se vazio, o Studio usa o pacote técnico recomendado." rows={3}/>
            <Txt label="Riscos / cuidados" value={form.risks} onChange={v=>update("risks",v)} placeholder="Clima, autorização, ruído, compliance, prazo..." rows={3}/>
            <Txt label="Notas adicionais" value={form.notes} onChange={v=>update("notes",v)} placeholder="Observações que devem aparecer no documento" rows={3}/>
            <div className="mobile-actions" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Btn onClick={()=>{saveDoc();setShowComposer(false);}} variant="ghost" style={{justifyContent:"center",borderRadius:2}}>Salvar histórico</Btn>
              <Btn onClick={exportPDF} disabled={generating} style={{justifyContent:"center",borderRadius:2}}>{generating?"Gerando...":"Exportar PDF"}</Btn>
            </div>
          </div>
              </div>
            </div>
          </div>}

          {(state.studioDocs||[]).length>0&&<Card style={{padding:"16px"}}>
            <SectionTitle>HISTÓRICO DO STUDIO</SectionTitle>
            <div className="studio-history-list">
              {(state.studioDocs||[]).slice(0,8).map(doc=>(
                <div key={doc.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:2,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.03)"}}>
                  <button onClick={()=>restoreDoc(doc)} style={{background:"transparent",border:"none",textAlign:"left",color:"#ddd",fontFamily:"inherit",cursor:"pointer",padding:0}}>
                    <div style={{fontSize:12,fontWeight:900,color:"#fff"}}>{doc.title}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>{doc.docLabel} · {doc.clientName||"sem cliente"} · {new Date(doc.createdAt).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
                  </button>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{const w=window.open("","_blank");w.document.write(doc.html);w.document.close();setTimeout(()=>w.print(),500);}} style={{height:30,borderRadius:2,border:`1px solid ${C.orange}55`,background:`${C.orange}12`,color:C.orange,fontFamily:"inherit",fontSize:10,fontWeight:900,cursor:"pointer",padding:"0 9px"}}>PDF</button>
                    <button onClick={()=>dispatch({type:"REMOVE_STUDIO_DOC",id:doc.id})} style={{height:30,borderRadius:2,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontFamily:"inherit",fontSize:10,fontWeight:900,cursor:"pointer",padding:"0 9px"}}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>}
        </div>

        <aside className="studio-preview-shell">
          <div className="studio-preview-top">
            <span style={{fontSize:10,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase"}}>Preview PDF</span>
            <span style={{fontSize:10,color:C.muted,fontWeight:900}}>{selectedPreset.label}</span>
          </div>
          <div className="studio-preview" style={{padding:0}}>
            <iframe title="Preview do documento" srcDoc={html} style={{width:"100%",height:"100%",border:"none",background:"#f7f4ee"}}/>
          </div>
        </aside>
      </div>
    </div>
  );
};
