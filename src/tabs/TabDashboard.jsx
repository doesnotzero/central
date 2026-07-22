import React from 'react';
import { APP_NAME, C } from '../theme.config.js';
import { PROFILE_PRESETS, normalizeClientStatus } from '../constants/index.js';
import { dayDiff, taskBucket, fmtDashboardMoney } from '../utils/helpers.js';
import { Card, Tag, Btn, EyeToggle, SectionTitle } from '../components/ui/index.jsx';

const DONE_STATUSES = ["entregue", "pago"];
const isActiveClient = (c) => !DONE_STATUSES.includes(normalizeClientStatus(c));
const plural = (n, s, p) => (n === 1 ? s : p);

// ── Fonte ÚNICA de verdade das métricas do dashboard ───────────────────
// Toda a "Hoje" consome daqui. Uma métrica = uma fórmula.
const computeMetrics = (state) => {
  const clients = state.clients || [];
  const entries = state.financeEntries || [];
  const tasks = state.tasks || [];
  const videos = clients.flatMap((c) => (c.videos || []).map((v) => ({ client: c, video: v })));
  const proposals = clients.flatMap((c) => (c.proposals || []));

  const activeClients = clients.filter(isActiveClient);
  const pipeline = activeClients.reduce((a, c) => a + Number(c.value || 0) * (Number(c.closeProbability || c.probability || 50) / 100), 0);
  const receivable =
    clients.filter((c) => c.payment !== "pago").reduce((a, c) => a + Number(c.value || 0), 0) +
    entries.filter((e) => e.type === "entrada" && e.status !== "pago").reduce((a, e) => a + Number(e.value || 0), 0);

  const openVideos = videos.filter((v) => v.video.status !== "entregue");
  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => taskBucket(t) === "overdue");
  const todayTasks = pendingTasks.filter((t) => taskBucket(t) === "today");
  const overduePayments = clients.filter((c) => c.payment === "atrasado");
  const pendingFollowUps = clients.filter((c) => c.followUpDate && dayDiff(c.followUpDate) <= 0 && isActiveClient(c));
  const projectSteps = clients.flatMap((c) =>
    (c.videos || []).flatMap((v) =>
      (v.productionSchedule || [])
        .filter((s) => !s.done && s.date && v.status !== "entregue")
        .map((s) => ({ client: c, video: v, step: s, diff: dayDiff(s.date) }))
    )
  );
  const lateProjectSteps = projectSteps.filter((x) => x.diff < 0);
  const todayProjectSteps = projectSteps.filter((x) => x.diff === 0);
  const upcomingMeetings = clients
    .filter((c) => {
      if (!c.nextMeeting) return false;
      const diff = Math.ceil((new Date(c.nextMeeting) - new Date()) / 86400000);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => new Date(a.nextMeeting) - new Date(b.nextMeeting));
  const openReviews = (state.reviewDeliverables || []).filter((r) => !["aprovado", "approved"].includes(String(r.status || "").toLowerCase()));
  const tasksDue = overdueTasks.length + todayTasks.length;

  return {
    clients, entries, tasks, proposals, activeClients, pipeline, receivable,
    openVideos, pendingTasks, overdueTasks, todayTasks, overduePayments,
    pendingFollowUps, lateProjectSteps, todayProjectSteps, upcomingMeetings, openReviews, tasksDue,
  };
};

// Lista única de pendências acionáveis (sem duplicar com KPIs).
const buildAlerts = (m) => [
  m.overdueTasks.length && { label: `${m.overdueTasks.length} ${plural(m.overdueTasks.length, "atividade atrasada", "atividades atrasadas")}`, tab: "tasks", color: "#ef4444" },
  m.pendingFollowUps.length && { label: `${m.pendingFollowUps.length} follow-up ${plural(m.pendingFollowUps.length, "pendente", "pendentes")} com cliente`, tab: "clients", color: "#ff2400" },
  m.lateProjectSteps.length && { label: `${m.lateProjectSteps.length} ${plural(m.lateProjectSteps.length, "marco de produção atrasado", "marcos de produção atrasados")}`, tab: "projects", color: "#ef4444" },
  m.overduePayments.length && { label: `${m.overduePayments.length} ${plural(m.overduePayments.length, "pagamento atrasado", "pagamentos atrasados")}`, tab: "finance", color: "#eab308" },
  m.todayTasks.length && { label: `${m.todayTasks.length} ${plural(m.todayTasks.length, "atividade", "atividades")} para hoje`, tab: "tasks", color: "#10b981" },
  m.todayProjectSteps.length && { label: `${m.todayProjectSteps.length} ${plural(m.todayProjectSteps.length, "entrega de produção", "entregas de produção")} hoje`, tab: "projects", color: "#8b5cf6" },
  m.upcomingMeetings.length && { label: `${m.upcomingMeetings.length} ${plural(m.upcomingMeetings.length, "reunião", "reuniões")} nos próximos 7 dias`, tab: "clients", color: "#3b82f6" },
  m.openReviews.length && { label: `${m.openReviews.length} ${plural(m.openReviews.length, "review aguardando", "reviews aguardando")} aprovação`, tab: "videoReview", color: "#06b6d4" },
].filter(Boolean);

// Score de setup — só aparece enquanto a operação não está 100% configurada.
const SetupScore = ({ state, setTab }) => {
  const clients = state.clients || [];
  const projects = clients.flatMap((c) => (c.videos || []));
  const entries = state.financeEntries || [];
  const proposals = clients.flatMap((c) => (c.proposals || []));
  const checks = [
    { label: "CRM com clientes", done: clients.length > 0, tab: "clients", hint: "Cadastre seu primeiro lead ou cliente." },
    { label: "Proposta no histórico", done: proposals.length > 0, tab: "proposta", hint: "Crie uma proposta vinculada ao cliente." },
    { label: "Produção mapeada", done: projects.length > 0, tab: "projects", hint: "Abra um projeto a partir de um preset." },
    { label: "Financeiro em uso", done: entries.length > 0 || clients.some((c) => Number(c.value || 0) > 0), tab: "finance", hint: "Registre contratos, entradas ou despesas." },
    { label: "Negócio configurado", done: !!state.business?.onboarded, tab: "business", hint: "Marca, WhatsApp e ticket médio." },
  ];
  const score = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  if (score === 100) return null;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: `conic-gradient(${C.orange} ${score * 3.6}deg, rgba(255,255,255,.07) 0deg)` }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#151515", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>{score}%</div>
        </div>
        <div>
          <SectionTitle>CONFIGURAÇÃO</SectionTitle>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>Complete o setup pra destravar toda a operação.</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {checks.filter((c) => !c.done).map((c) => (
          <button key={c.label} onClick={() => setTab(c.tab)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", border: "none", borderBottom: `1px solid ${C.border}`, background: "transparent", color: "#ddd", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span><span style={{ fontSize: 12, fontWeight: 900, color: "#eee" }}>○ {c.label}</span><span style={{ display: "block", fontSize: 10, color: C.muted, marginTop: 2 }}>{c.hint}</span></span>
            <span style={{ fontSize: 10, color: C.orange, fontWeight: 900 }}>abrir</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

const TabDashboard = ({ state, dispatch, setTab, privacyMode, setPrivacyMode, userName }) => {
  const [reveal, setReveal] = React.useState(false);
  const m = computeMetrics(state);
  const alerts = buildAlerts(m);
  const priv = privacyMode || !reveal;
  const toggleMoney = () => {
    if (priv) { setPrivacyMode?.(false); setReveal(true); } else { setReveal(false); }
  };

  // Ação prioritária do dia (deriva dos mesmos conjuntos, sem lista paralela).
  const nextAction =
    (m.overdueTasks.length && { title: "Resolver atividades atrasadas", text: `${m.overdueTasks.length} ${plural(m.overdueTasks.length, "atividade ficou", "atividades ficaram")} para trás.`, tab: "tasks", color: "#ef4444" }) ||
    (m.pendingFollowUps.length && { title: "Responder clientes", text: `${m.pendingFollowUps.length} follow-up ${plural(m.pendingFollowUps.length, "pede", "pedem")} retorno.`, tab: "clients", color: "#ff2400" }) ||
    (m.lateProjectSteps.length && { title: "Destravar produção", text: `${m.lateProjectSteps.length} ${plural(m.lateProjectSteps.length, "marco de projeto está", "marcos de projeto estão")} em atraso.`, tab: "projects", color: "#8b5cf6" }) ||
    (m.overduePayments.length && { title: "Cobrar pendências", text: `${m.overduePayments.length} ${plural(m.overduePayments.length, "pagamento em atraso", "pagamentos em atraso")}.`, tab: "finance", color: "#eab308" }) ||
    (m.openReviews.length && { title: "Acompanhar reviews", text: `${m.openReviews.length} ${plural(m.openReviews.length, "review aguardando", "reviews aguardando")} aprovação do cliente.`, tab: "videoReview", color: "#06b6d4" }) ||
    (m.todayTasks.length && { title: "Executar o dia", text: `${m.todayTasks.length} ${plural(m.todayTasks.length, "atividade", "atividades")} para hoje.`, tab: "tasks", color: "#10b981" }) ||
    { title: "Comece por um cliente", text: `Cadastre um cliente para a ${state.business?.brandName || APP_NAME} organizar proposta, produção e entrega.`, tab: "clients", color: C.orange };

  const kpis = [
    { label: "Pipeline previsto", value: fmtDashboardMoney(m.pipeline, priv), note: `${m.activeClients.length} ${plural(m.activeClients.length, "cliente em negociação", "clientes em negociação")}`, tab: "clients", color: "#10b981", money: true },
    { label: "A receber", value: fmtDashboardMoney(m.receivable, priv), note: "contratos e lançamentos pendentes", tab: "finance", color: "#eab308", money: true },
    { label: "Produção aberta", value: m.openVideos.length, note: `${plural(m.openVideos.length, "projeto não entregue", "projetos não entregues")}`, tab: "projects", color: "#8b5cf6" },
    { label: "Agenda crítica", value: m.tasksDue, note: "atividades hoje ou atrasadas", tab: "tasks", color: "#ff2400" },
  ];

  const quickActions = [
    { title: "Novo cliente", text: "Cadastre lead ou cliente.", tab: "clients", color: "#10b981" },
    { title: "Novo projeto", text: "Briefing, cronograma e checklist.", tab: "projects", color: "#8b5cf6" },
    { title: "Nova proposta", text: "Orçamento e envio ao cliente.", tab: "proposta", color: "#ff2400" },
    { title: "Documento", text: "Briefing, roteiro, callsheet.", tab: "studio", color: "#06b6d4" },
  ];

  const selectProfile = (p) => dispatch({ type: "UPDATE_BUSINESS", data: { profile: p.id, type: p.type, ticketAverage: p.ticket, mainServices: p.services, onboarded: true } });

  return (
    <div className="page-stack">
      {/* HERO: saudação + ação prioritária do dia */}
      <Card className="elite-dashboard-hero">
        <div className="elite-dashboard-grid">
          <div>
            <div className="elite-kicker">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
            <div style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", lineHeight: 1, marginTop: 8 }}>Bom trabalho, {userName || "criador"}.</div>
            <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6, maxWidth: 560, margin: "12px 0 0" }}>O que exige sua decisão hoje, em ordem de prioridade. Sem ruído.</p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.muted }}>Atualizado {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              <EyeToggle hidden={priv} onClick={toggleMoney} />
            </div>
          </div>
          <div className="elite-command-panel" style={{ "--accent": nextAction.color }}>
            <div style={{ fontSize: 10, color: nextAction.color, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>O que fazer agora</div>
            <div style={{ fontSize: 21, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 900, lineHeight: 1.05, marginBottom: 6 }}>{nextAction.title}</div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#cfcfcf", lineHeight: 1.5 }}>{nextAction.text}</p>
            <Btn onClick={() => setTab(nextAction.tab)} style={{ background: `linear-gradient(135deg,${nextAction.color},${C.orangeD})`, justifyContent: "center", width: "100%" }}>Abrir agora</Btn>
          </div>
        </div>
      </Card>

      <div className="dashboard-shell">
        <div className="dashboard-main">
          {/* KPIs — uma métrica, uma fórmula */}
          <div className="elite-briefing">
            {kpis.map((k) => (
              <button key={k.label} className="elite-brief-card" style={{ "--accent": k.color, textAlign: "left", fontFamily: "inherit" }} onClick={() => setTab(k.tab)}>
                <div className="elite-brief-label">{k.label}</div>
                <div className={`elite-brief-value ${k.money ? "money" : ""}`}>{k.value}</div>
                <div className="elite-brief-note">{k.note}</div>
                <div className="elite-brief-action">Abrir área</div>
              </button>
            ))}
          </div>

          {/* Alertas — única lista de pendências acionáveis */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionTitle>Pendências de hoje</SectionTitle>
            {alerts.length === 0 && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Nada crítico agora. Operação limpa — bom momento pra prospectar ou adiantar produção.</div>}
            {alerts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {alerts.map((a, i) => (
                  <button key={i} onClick={() => setTab(a.tab)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1px solid ${a.color}30`, background: `${a.color}10`, color: "#eee", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: a.color, fontWeight: 900 }}>Abrir →</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <aside className="dashboard-rail">
          <SetupScore state={state} setTab={setTab} />

          <Card>
            <SectionTitle>Começar rápido</SectionTitle>
            <div className="dashboard-quick-grid">
              {quickActions.map((item) => (
                <button key={item.title} onClick={() => setTab(item.tab)} className="dashboard-quick-card" style={{ "--quick-color": `${item.color}33`, "--quick-strong": item.color, "--quick-bg": `${item.color}12` }}>
                  <div style={{ fontSize: 13, color: item.color, fontWeight: 900, marginBottom: 5 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{item.text}</div>
                </button>
              ))}
            </div>
          </Card>

          {m.openReviews.length > 0 && (
            <Card>
              <SectionTitle>Reviews em aberto</SectionTitle>
              {m.openReviews.slice(0, 4).map((r) => (
                <button key={r.id || r.token || r.title} onClick={() => setTab("videoReview")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, color: "#ddd", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ minWidth: 0 }}><span className="private-data" style={{ display: "block", fontSize: 12, fontWeight: 900, color: "#eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title || "Review sem título"}</span><span style={{ display: "block", fontSize: 10, color: C.muted, marginTop: 2 }}>{r.status || "aguardando"}</span></span>
                  <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 900 }}>abrir</span>
                </button>
              ))}
            </Card>
          )}

          {!state.business?.profile && (
            <Card>
              <SectionTitle>Perfil</SectionTitle>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, margin: "-4px 0 12px" }}>Escolha uma base e o sistema adapta serviços e ticket.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PROFILE_PRESETS.map((p) => (
                  <button key={p.id} onClick={() => selectProfile(p)} style={{ textAlign: "left", padding: "11px", borderRadius: 13, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.035)", color: "#eee", cursor: "pointer", fontFamily: "inherit" }}>
                    <div style={{ fontSize: 12, color: "#fff", fontWeight: 900, marginBottom: 5 }}>{p.label}</div>
                    <Tag color={C.orange}>{fmtDashboardMoney(p.ticket, priv)}</Tag>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TabDashboard;
