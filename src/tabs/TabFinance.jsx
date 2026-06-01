import React, { useState } from 'react';

export default function TabFinance({state,dispatch,privacyMode,shared}){
  const {C,Card,Tag,Btn,SectionTitle,Inp,Txt,Modal,inputDate,todayStr,parseDateOnly,MONTHS,PAG_COLORS,fmtMoney,fmtCurrency} = shared;
  const clients=state.clients||[];
  const entries=state.financeEntries||[];
  const [showAdd,setShowAdd]=useState(false);
  const [filter,setFilter]=useState("all");
  const FE={type:"entrada",title:"",value:"",status:"pago",category:"serviço",date:inputDate(),clientId:"",notes:""};
  const [form,setForm]=useState(FE);
  const total=clients.reduce((a,c)=>a+Number(c.value||0),0);
  const contractEntries=clients.map(c=>({id:`client-${c.id}`,source:"client",type:"entrada",title:c.name,value:Number(c.value||0),status:c.payment||"pendente",category:c.service||"Contrato",date:c.contract||c.nextMeeting||todayStr(),clientId:c.id,clientName:c.name}));
  const ledger=[...entries.map(e=>({...e,source:"manual",clientName:clients.find(c=>String(c.id)===String(e.clientId))?.name})),...contractEntries].filter(e=>Number(e.value||0)>0);
  const paid=ledger.filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const expensesPaid=ledger.filter(e=>e.type==="despesa"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const overdue=ledger.filter(e=>e.status==="atrasado").reduce((a,e)=>a+Number(e.value||0),0);
  const receivable=ledger.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const payable=ledger.filter(e=>e.type==="despesa"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const profit=paid-expensesPaid;
  const weighted=clients.reduce((a,c)=>a+Math.round(Number(c.value||0)*Number(c.probability??50)/100),0);
  const avgTicket=clients.length?Math.round(total/clients.length):0;
  const categoryMap=ledger.reduce((m,e)=>{const k=e.category||"Sem categoria";m[k]=(m[k]||0)+Number(e.value||0)*(e.type==="despesa"?-1:1);return m;},{});
  const topServices=Object.entries(categoryMap).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,5);
  const topClients=[...clients].sort((a,b)=>Number(b.value||0)-Number(a.value||0)).slice(0,5);
  const now=new Date();
  const forecastMonths=Array.from({length:4},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()+i,1);
    const value=ledger.filter(e=>{
      const base=e.date;
      if(!base)return i===0&&e.status!=="pago";
      const bd=parseDateOnly(base);
      return bd.getMonth()===d.getMonth()&&bd.getFullYear()===d.getFullYear();
    }).reduce((a,e)=>a+Number(e.value||0)*(e.type==="despesa"?-1:1),0);
    return {label:MONTHS[d.getMonth()].slice(0,3),value};
  });
  const maxForecast=Math.max(...forecastMonths.map(m=>Math.abs(m.value)),1);
  const filtered=ledger.filter(e=>filter==="all"||e.type===filter||e.status===filter).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const save=()=>{if(!form.title||!form.value)return;dispatch({type:"ADD_FINANCE_ENTRY",entry:{...form,value:Number(form.value)}});setForm(FE);setShowAdd(false);};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:"rgba(16,185,129,.06)",borderColor:"rgba(16,185,129,.22)",padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div><div style={{fontSize:11,color:"#10b981",fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>FINANCEIRO</div>
          <p style={{margin:0,fontSize:13,color:"#aaa",lineHeight:1.5}}>Fluxo de caixa com contratos, lançamentos manuais, despesas e lucro.</p></div>
          <Btn onClick={()=>setShowAdd(true)} size="sm">Novo lançamento</Btn>
        </div>
      </Card>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {v:fmtMoney(paid,privacyMode),l:"Recebido",c:"#10b981"},
          {v:fmtMoney(receivable,privacyMode),l:"A receber",c:"#eab308"},
          {v:fmtMoney(expensesPaid,privacyMode),l:"Despesas",c:"#ef4444"},
          {v:fmtMoney(profit,privacyMode),l:"Lucro",c:profit>=0?"#3b82f6":"#ef4444"},
        ].map((k,i)=><Card key={i} style={{padding:"14px",textAlign:"center"}}><div style={{fontSize:12,fontWeight:900,color:k.c,fontFamily:"'Syne',sans-serif"}}>{k.v}</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{k.l}</div></Card>)}
      </div>
      <div className="mobile-two-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card style={{padding:"16px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:C.orange,fontFamily:"'Syne',sans-serif"}}>{fmtMoney(avgTicket,privacyMode)}</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>Ticket médio</div></Card>
        <Card style={{padding:"16px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:"#8b5cf6",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(payable+overdue,privacyMode)}</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>Compromissos</div></Card>
      </div>
      <Card>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>PREVISÃO POR MÊS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,height:110}}>
          {forecastMonths.map(m=><div key={m.label} style={{flex:1,textAlign:"center"}}><div style={{height:`${Math.max(8,Math.abs(m.value)/maxForecast*76)}px`,background:m.value>=0?"#3b82f6":"#ef4444",borderRadius:"6px 6px 0 0",boxShadow:"0 0 12px rgba(59,130,246,.25)"}}/><div style={{fontSize:10,color:C.muted,marginTop:6}}>{m.label}</div><div style={{fontSize:10,color:m.value>=0?"#3b82f6":"#ef4444",fontWeight:800}}>{privacyMode?"••••":fmtCurrency(m.value).replace("R$ ","")}</div></div>)}
        </div>
      </Card>
      <Card>
        <SectionTitle action={<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["all","entrada","despesa","pendente","atrasado"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${filter===f?C.orange:C.border}`,background:filter===f?`${C.orange}14`:"transparent",color:filter===f?C.orange:C.muted,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{f==="all"?"todos":f}</button>)}</div>}>LANÇAMENTOS</SectionTitle>
        {filtered.length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"12px 0"}}>Nenhum lançamento nesse filtro.</div>}
        {filtered.slice(0,12).map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{minWidth:0}}><div className="private-data" style={{fontSize:13,color:"#eee",fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.title}</div><div className={e.clientName?"private-data":""} style={{fontSize:11,color:C.muted,marginTop:2}}>{e.category} {e.clientName?`· ${e.clientName}`:""} · {e.date||"sem data"}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}><Tag color={e.type==="despesa"?"#ef4444":"#10b981"}>{e.type}</Tag><Tag color={PAG_COLORS[e.status]||C.orange}>{e.status}</Tag><span style={{fontSize:12,color:e.type==="despesa"?"#ef4444":"#10b981",fontWeight:900}}>{e.type==="despesa"?"-":"+"}{fmtMoney(e.value,privacyMode)}</span>{e.source==="manual"&&<button onClick={()=>dispatch({type:"REMOVE_FINANCE_ENTRY",id:e.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15}}>×</button>}</div>
        </div>)}
      </Card>
      <div className="mobile-two-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>CATEGORIAS</div>
          {topServices.length===0&&<div style={{fontSize:13,color:C.muted}}>Sem dados ainda.</div>}
          {topServices.map(([name,value])=><div key={name} style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:10}}><span style={{fontSize:12,color:"#ccc"}}>{name}</span><span style={{fontSize:12,color:value>=0?"#10b981":"#ef4444",fontWeight:800}}>{fmtMoney(value,privacyMode)}</span></div>)}
        </Card>
        <Card>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>CLIENTES MAIS VALIOSOS</div>
          {topClients.length===0&&<div style={{fontSize:13,color:C.muted}}>Sem dados ainda.</div>}
          {topClients.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:10}}><span className="private-data" style={{fontSize:12,color:"#ccc"}}>{c.name}</span><span style={{fontSize:12,color:"#10b981",fontWeight:800}}>{fmtMoney(c.value,privacyMode)}</span></div>)}
        </Card>
      </div>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Novo lançamento" wide>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Equipamento, sinal cliente..."/>
          <Inp label="Valor (R$)" value={form.value} onChange={v=>setForm(f=>({...f,value:v}))} type="number" placeholder="0"/>
          <Inp label="Categoria" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="serviço, equipe, tráfego..."/>
          <Inp label="Data" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/>
        </div>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 14px"}}>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Tipo</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["entrada","despesa"].map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{padding:"6px 12px",borderRadius:8,border:"1px solid",borderColor:form.type===t?(t==="entrada"?"#10b981":"#ef4444"):C.border,background:form.type===t?`${t==="entrada"?"#10b981":"#ef4444"}15`:"transparent",color:form.type===t?(t==="entrada"?"#10b981":"#ef4444"):C.muted,fontSize:11,fontWeight:800,cursor:"pointer"}}>{t}</button>)}</div></div>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Status</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(PAG_COLORS).map(([k,c])=><button key={k} onClick={()=>setForm(f=>({...f,status:k}))} style={{padding:"6px 12px",borderRadius:8,border:"1px solid",borderColor:form.status===k?c:C.border,background:form.status===k?`${c}15`:"transparent",color:form.status===k?c:C.muted,fontSize:11,fontWeight:800,cursor:"pointer"}}>{k}</button>)}</div></div>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Cliente</div><select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none"}}><option value="">Sem vínculo</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <Txt label="Notas" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} rows={2}/>
        <Btn onClick={save} disabled={!form.title||!form.value} style={{width:"100%",justifyContent:"center"}}>Salvar lançamento</Btn>
      </Modal>
    </div>
  );
};