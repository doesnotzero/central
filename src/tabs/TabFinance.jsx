import React, { useState } from 'react';

export default function TabFinance({state,dispatch,privacyMode,shared}){
  const {C,Card,Tag,Btn,SectionTitle,Inp,Txt,Modal,inputDate,todayStr,PAG_COLORS,fmtMoney} = shared;
  const clients=state.clients||[];
  const entries=state.financeEntries||[];
  const [showAdd,setShowAdd]=useState(false);
  const [filter,setFilter]=useState("all");
  const FE={type:"entrada",title:"",value:"",status:"pago",category:"serviço",date:inputDate(),clientId:"",notes:""};
  const [form,setForm]=useState(FE);
  const contractEntries=clients.map(c=>({id:`client-${c.id}`,source:"client",type:"entrada",title:c.name,value:Number(c.value||0),status:c.payment||"pendente",category:c.service||"Contrato",date:c.contract||c.nextMeeting||todayStr(),clientId:c.id,clientName:c.name}));
  const ledger=[...entries.map(e=>({...e,source:"manual",clientName:clients.find(c=>String(c.id)===String(e.clientId))?.name})),...contractEntries].filter(e=>Number(e.value||0)>0);
  const paid=ledger.filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const expensesPaid=ledger.filter(e=>e.type==="despesa"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const receivable=ledger.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const overdue=ledger.filter(e=>e.status==="atrasado");
  const pending=ledger.filter(e=>e.type==="entrada"&&e.status==="pendente");
  const profit=paid-expensesPaid;
  const filtered=ledger.filter(e=>filter==="all"||e.type===filter||e.status===filter).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const save=()=>{if(!form.title||!form.value)return;dispatch({type:"ADD_FINANCE_ENTRY",entry:{...form,value:Number(form.value)}});setForm(FE);setShowAdd(false);};
  const summary=[
    {label:"Recebido",value:paid,color:"#10b981"},
    {label:"A receber",value:receivable,color:"#eab308"},
    {label:"Despesas",value:expensesPaid,color:"#ef4444"},
    {label:"Lucro",value:profit,color:profit>=0?"#3b82f6":"#ef4444"},
  ];
  const actionCards=[
    {title:"Cobrar atrasados",value:overdue.length,amount:overdue.reduce((a,e)=>a+Number(e.value||0),0),filter:"atrasado",color:"#ef4444",text:"Itens que precisam de ação agora."},
    {title:"Receber pendentes",value:pending.length,amount:pending.reduce((a,e)=>a+Number(e.value||0),0),filter:"pendente",color:"#eab308",text:"Contratos e entradas ainda não pagos."},
    {title:"Registrar movimento",value:"+",amount:0,filter:"new",color:C.orange,text:"Entrada, despesa ou compromisso novo."},
  ];
  return (
    <div className="ops-page">
      <div className="ops-header finance">
        <div>
          <div className="ops-kicker">Financeiro</div>
          <h1>Caixa da produtora</h1>
          <p>Primeiro veja o que cobrar, depois o que entrou, saiu e ficou pendente.</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)} size="sm">Novo lançamento</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}} className="mobile-two-grid">
        {actionCards.map(card=>(
          <button key={card.title} onClick={()=>card.filter==="new"?setShowAdd(true):setFilter(card.filter)} style={{textAlign:"left",padding:"16px",borderRadius:18,border:`1px solid ${card.color}35`,background:`linear-gradient(135deg,${card.color}12,rgba(255,255,255,.025))`,color:"#fff",fontFamily:"inherit",cursor:"pointer"}}>
            <div style={{fontSize:10,color:card.color,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:10}}>Próxima ação</div>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:18,fontWeight:900,fontFamily:"'Syne',sans-serif",lineHeight:1.1}}>{card.title}</div>
                <div style={{fontSize:12,color:"#aaa",lineHeight:1.45,marginTop:6}}>{card.text}</div>
              </div>
              <div style={{fontSize:26,color:card.color,fontWeight:900,fontFamily:"'Syne',sans-serif"}}>{card.value}</div>
            </div>
            {card.amount>0&&<div style={{fontSize:13,color:card.color,fontWeight:900,marginTop:12}}>{fmtMoney(card.amount,privacyMode)}</div>}
          </button>
        ))}
      </div>
      <div className="ops-summary">
        {summary.map(item=>(
          <button key={item.label} className="ops-metric" onClick={()=>setFilter(item.label==="Despesas"?"despesa":item.label==="A receber"?"pendente":"all")}>
            <strong style={{color:item.color}}>{fmtMoney(item.value,privacyMode)}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <Card className="ops-panel">
        <SectionTitle action={<div className="ops-filters">{["all","pendente","atrasado","entrada","despesa"].map(f=><button key={f} onClick={()=>setFilter(f)} className={filter===f?"active":""}>{f==="all"?"todos":f}</button>)}</div>}>MOVIMENTOS DO CAIXA</SectionTitle>
        <div className="ops-ledger">
          {filtered.length===0&&<div className="ops-empty">Nenhum lançamento nesse filtro.</div>}
          {filtered.slice(0,18).map(e=>(
            <div key={e.id} className="ops-ledger-row">
              <div>
                <strong className="private-data">{e.title}</strong>
                <span>{e.clientName||e.category||"Sem cliente"} · {e.category} · {e.date||"sem data"}</span>
              </div>
              <div>
                <Tag color={e.type==="despesa"?"#ef4444":"#10b981"}>{e.type}</Tag>
                <Tag color={PAG_COLORS[e.status]||C.orange}>{e.status}</Tag>
                <b style={{color:e.type==="despesa"?"#ef4444":"#10b981"}}>{e.type==="despesa"?"-":"+"}{fmtMoney(e.value,privacyMode)}</b>
                {e.source==="manual"&&<button onClick={()=>dispatch({type:"REMOVE_FINANCE_ENTRY",id:e.id})} aria-label="Remover">×</button>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Novo lançamento" wide>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Equipamento, sinal cliente..."/>
          <Inp label="Valor (R$)" value={form.value} onChange={v=>setForm(f=>({...f,value:v}))} type="number" placeholder="0"/>
          <Inp label="Categoria" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="serviço, equipe, tráfego..."/>
          <Inp label="Data" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/>
        </div>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 14px"}}>
          <div className="field-block"><div>Tipo</div><div>{["entrada","despesa"].map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} className={form.type===t?"active":""}>{t}</button>)}</div></div>
          <div className="field-block"><div>Status</div><div>{Object.entries(PAG_COLORS).map(([k])=><button key={k} onClick={()=>setForm(f=>({...f,status:k}))} className={form.status===k?"active":""}>{k}</button>)}</div></div>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Cliente</div><select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none"}}><option value="">Sem vínculo</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <Txt label="Notas" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} rows={2}/>
        <Btn onClick={save} disabled={!form.title||!form.value} style={{width:"100%",justifyContent:"center"}}>Salvar lançamento</Btn>
      </Modal>
    </div>
  );
};
