import React, { useState } from 'react';

export default function TabAnalytics({state,privacyMode,shared}){
  const {C,Card,Bar,WeekChart,RevenueChart,getLevel,xpToNext,todayStr,fmtMoney,STATUS_COLORS,BADGES,CLIENT_PIPELINE,normalizeClientStatus} = shared;
  const today=todayStr(),lv=getLevel(state.xp);
  const todayDone=state.habits.filter(h=>h.completedDates?.includes(today)).length;
  const avgStreak=state.habits.length?Math.round(state.habits.reduce((a,h)=>a+h.streak,0)/state.habits.length):0;
  const avgGoal=state.goals.length?Math.round(state.goals.reduce((a,g)=>a+g.progress,0)/state.goals.length):0;
  const totalRev=(state.clients||[]).reduce((a,c)=>a+Number(c.value||0),0);
  const paidRev=(state.clients||[]).filter(c=>c.payment==="pago").reduce((a,c)=>a+Number(c.value||0),0);
  const pendingTasks=state.tasks.filter(t=>!t.completed).length;
  const overdue=(state.clients||[]).filter(c=>c.payment==="atrasado").length;
  const pendingVideos=(state.clients||[]).reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0);
  const pipelineStats=(CLIENT_PIPELINE||[]).map(stage=>({key:stage.key,label:stage.label,count:(state.clients||[]).filter(c=>normalizeClientStatus(c)===stage.key).length,color:stage.color||STATUS_COLORS[stage.key]||C.orange}));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:"rgba(59,130,246,.06)",borderColor:"rgba(59,130,246,.2)",padding:"18px 20px"}}>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>ANALYTICS OPERACIONAL</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}} className="mobile-kpi-grid">
          {[
            {v:pendingTasks,l:"Atividades abertas",c:"#eab308"},
            {v:pendingVideos,l:"Vídeos em produção",c:"#8b5cf6"},
            {v:overdue,l:"Pagamentos atrasados",c:"#ef4444"},
          ].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:3}}>{s.l}</div></div>)}
        </div>
      </Card>
      <Card style={{background:`${lv.color}08`,borderColor:`${lv.color}20`,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><span style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Nível: </span><span style={{fontSize:15,fontWeight:800,color:lv.color,fontFamily:"'Syne',sans-serif"}}>{lv.name}</span></div>
          <span style={{fontSize:22,fontWeight:800,color:C.orange,fontFamily:"'Syne',sans-serif"}}>{state.xp} XP</span>
        </div>
        {xpToNext(state.xp)&&<Bar v={xpToNext(state.xp).pct} color={lv.color} h={7}/>}
      </Card>
      <Card><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>HÁBITOS — SEMANA ATUAL</div><WeekChart habits={state.habits}/></Card>
      {(state.clients||[]).length>0&&<Card><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>RECEITA — ÚLTIMOS 6 MESES</div><RevenueChart clients={state.clients} privacyMode={privacyMode}/></Card>}
      {(state.clients||[]).length>0&&(
        <Card>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>PIPELINE COMERCIAL</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:8}} className="mobile-kpi-grid">
            {pipelineStats.map(p=><div key={p.key} style={{textAlign:"center",padding:"12px 8px",borderRadius:12,background:`${p.color}0c`,border:`1px solid ${p.color}25`}}><div style={{fontSize:22,fontWeight:800,color:p.color,fontFamily:"'Syne',sans-serif"}}>{p.count}</div><div style={{fontSize:10,color:C.muted,marginTop:3,textTransform:"capitalize"}}>{p.label}</div></div>)}
          </div>
        </Card>
      )}
      <div className="mobile-two-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {v:`${todayDone}/${state.habits.length}`,l:"Hábitos hoje",c:C.orange},
          {v:avgStreak,l:"Streak médio",c:"#fb923c"},
          {v:`${avgGoal}%`,l:"Progresso metas",c:"#8b5cf6"},
          {v:state.xp,l:"XP Total",c:lv.color},
          {v:fmtMoney(paidRev,privacyMode),l:"Receita recebida",c:"#10b981"},
          {v:fmtMoney(totalRev-paidRev,privacyMode),l:"A receber",c:"#eab308"},
        ].map((s,i)=><Card key={i} style={{padding:"14px",textAlign:"center"}}><div style={{fontSize:i>3?12:22,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.l}</div></Card>)}
      </div>
      <Card>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>PROGRESSO DAS METAS</div>
        {state.goals.map(g=>(
          <div key={g.id} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#ccc",flex:1,paddingRight:8}}>{g.title.substring(0,38)}{g.title.length>38?"...":""}</span><span style={{fontSize:12,fontWeight:700,color:C.orange}}>{g.progress}%</span></div>
            <Bar v={g.progress} h={5}/>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>CONQUISTAS</div>
        <div style={{fontSize:24,fontWeight:800,color:C.orange,fontFamily:"'Syne',sans-serif"}}>{(state.unlockedBadges||[]).length}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> / {BADGES.length}</span></div>
        <Bar v={Math.round((state.unlockedBadges||[]).length/BADGES.length*100)} h={6} color="#eab308"/>
      </Card>
    </div>
  );
};
