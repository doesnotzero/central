// ── NOTIFICATION COMPONENTS ─────────────────────────────────────────────
// NotificationsBanner, ContextAlert, SystemHealth — extracted from App.jsx.

import React, { useState, useEffect } from "react";
import { C } from "../theme.config.js";
import { normalizeClientStatus } from "../constants/index.js";
import { todayStr, taskBucket, dayDiff } from "../utils/helpers.js";
import { Bar, Tag, Card, SectionTitle } from "./ui/index.jsx";

// ── NotificationsBanner ──
export const NotificationsBanner = ({ state, setTab }) => {
  const today = todayStr();
  const now = new Date();
  const storageKey = `dnz_notifications_${today}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const msgs = [];
  const meetings = (state.clients || []).filter((c) => {
    if (!c.nextMeeting) return false;
    const diff = Math.ceil((new Date(c.nextMeeting) - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 1;
  });
  meetings.forEach((c) => {
    const diff = Math.ceil((new Date(c.nextMeeting) - now) / (1000 * 60 * 60 * 24));
    msgs.push({ id: `meet_${c.id}`, icon: "📅", color: "#3b82f6", text: `Reunião com ${c.name} ${diff === 0 ? "hoje" : "amanhã"}`, action: () => setTab("clients") });
  });
  const overdue = (state.clients || []).filter((c) => c.payment === "atrasado");
  if (overdue.length > 0) msgs.push({ id: "overdue", icon: "💰", color: "#ef4444", text: `${overdue.length} pagamento${overdue.length > 1 ? "s" : ""} em atraso`, action: () => setTab("clients") });
  const pendVids = (state.clients || []).reduce((a, c) => (c.videos || []).filter((v) => v.status !== "entregue").length + a, 0);
  if (pendVids > 3) msgs.push({ id: "vids", icon: "🎬", color: "#8b5cf6", text: `${pendVids} vídeos pendentes de entrega`, action: () => setTab("clients") });
  const visible = msgs.filter((m) => !dismissed.includes(m.id));
  const dismiss = (id) => setDismissed((prev) => {
    const next = [...new Set([...prev, id])];
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    return next;
  });
  useEffect(() => {
    if (visible.length === 0) return;
    const t = setTimeout(() => setDismissed((prev) => {
      const next = [...new Set([...prev, ...visible.map((m) => m.id)])];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    }), 8500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((m) => m.id).join("|"), storageKey]);
  if (visible.length === 0) return null;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 14px 0" }}>
      {visible.map((m) => (
        <div key={m.id} className="notification-slide" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${m.color}10`, border: `1px solid ${m.color}30`, borderRadius: 12, marginBottom: 6, cursor: "pointer" }} onClick={() => { m.action(); dismiss(m.id); }}>
          <span style={{ fontSize: 16 }}>{m.icon}</span>
          <span className={m.id?.startsWith("meet_") ? "private-data" : ""} style={{ flex: 1, fontSize: 13, color: "#e2e2e2" }}>{m.text}</span>
          <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>Ver →</span>
          <button onClick={(e) => { e.stopPropagation(); dismiss(m.id); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
        </div>
      ))}
    </div>
  );
};

// ── ContextAlert ──
export const ContextAlert = ({ tab, state, setTab, notify }) => {
  const clients = state.clients || [];
  const entries = state.financeEntries || [];
  const projects = clients.flatMap((c) => (c.videos || []).map((v) => ({ client: c, video: v })));
  const overdueTasks = (state.tasks || []).filter((t) => !t.completed && taskBucket(t) === "overdue").length;
  const todayTasks = (state.tasks || []).filter((t) => !t.completed && taskBucket(t) === "today").length;
  const followUps = clients.filter((c) => c.followUpDate && dayDiff(c.followUpDate) <= 0 && !["entregue", "pago"].includes(normalizeClientStatus(c))).length;
  const overduePayments = clients.filter((c) => c.payment === "atrasado").length + entries.filter((e) => e.status === "atrasado").length;
  const projectDue = projects.filter((p) => p.video.status !== "entregue" && dayDiff(p.video.deadline) !== null && dayDiff(p.video.deadline) <= 3).length;
  const map = {
    dashboard: overdueTasks ? { txt: `${overdueTasks} tarefa${overdueTasks > 1 ? "s" : ""} atrasada${overdueTasks > 1 ? "s" : ""} precisa de atenção.`, go: "tasks", cta: "Ver tarefas" } : null,
    tasks: todayTasks ? { txt: `${todayTasks} tarefa${todayTasks > 1 ? "s" : ""} vence${todayTasks > 1 ? "m" : ""} hoje.`, go: null, cta: "Ok" } : null,
    clients: followUps ? { txt: `${followUps} follow-up${followUps > 1 ? "s" : ""} pendente${followUps > 1 ? "s" : ""} no CRM.`, go: null, cta: "Revisar" } : null,
    projects: projectDue ? { txt: `${projectDue} projeto${projectDue > 1 ? "s" : ""} com prazo próximo.`, go: null, cta: "Revisar" } : null,
    finance: overduePayments ? { txt: `${overduePayments} item${overduePayments > 1 ? "s" : ""} financeiro${overduePayments > 1 ? "s" : ""} em atraso.`, go: null, cta: "Ver agora" } : null,
    export: { txt: "Antes do deploy ou de mudanças grandes, gere um backup JSON atualizado.", go: null, cta: "Entendi" },
  };
  const item = map[tab];
  const alertKey = `dnz_context_alert_${todayStr()}_${tab}_${item ? String(item.txt).slice(0, 28) : "none"}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(alertKey) === "1");
  useEffect(() => setDismissed(localStorage.getItem(alertKey) === "1"), [alertKey]);
  useEffect(() => {
    if (!item || dismissed) return;
    const t = setTimeout(() => { localStorage.setItem(alertKey, "1"); setDismissed(true); }, 9500);
    return () => clearTimeout(t);
  }, [alertKey, dismissed, !!item]);
  const close = () => { localStorage.setItem(alertKey, "1"); setDismissed(true); };
  if (!item) return null;
  if (dismissed) return null;
  return (
    <div className="context-alert">
      <div>
        <div style={{ fontSize: 11, color: C.orange, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Notificação</div>
        <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.45 }}>{item.txt}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => { if (item.go) setTab(item.go); else notify?.("Tudo certo por aqui", "info"); close(); }}>{item.cta}</button>
        <button onClick={close} aria-label="Fechar notificação" style={{ width: 28, height: 28, padding: 0, display: "grid", placeItems: "center" }}>×</button>
      </div>
    </div>
  );
};

// ── SystemHealth ──
export const SystemHealth = ({ state, setTab }) => {
  const clients = state.clients || [];
  const entries = state.financeEntries || [];
  const lastBackup = localStorage.getItem("dcc_last_backup");
  const overdueTasks = (state.tasks || []).filter((t) => !t.completed && taskBucket(t) === "overdue").length;
  const followUps = clients.filter((c) => c.followUpDate && dayDiff(c.followUpDate) <= 0 && !["entregue", "pago"].includes(normalizeClientStatus(c))).length;
  const lateMoney = clients.filter((c) => c.payment === "atrasado").length + entries.filter((e) => e.status === "atrasado").length;
  const backupDays = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const checks = [
    { ok: overdueTasks === 0, label: overdueTasks ? `${overdueTasks} tarefa(s) atrasada(s)` : "Atividades em dia", tab: "tasks" },
    { ok: followUps === 0, label: followUps ? `${followUps} follow-up(s) pendente(s)` : "CRM em dia", tab: "clients" },
    { ok: lateMoney === 0, label: lateMoney ? `${lateMoney} financeiro(s) atrasado(s)` : "Financeiro sob controle", tab: "finance" },
    { ok: backupDays <= 7, label: backupDays <= 7 ? "Backup recente" : "Backup recomendado", tab: "export" },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return (
    <div className="health-grid">
      <Card style={{ padding: "16px", background: "rgba(59,130,246,.06)", borderColor: "rgba(59,130,246,.2)" }}>
        <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>SAÚDE DO SISTEMA</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: score >= 75 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444", fontFamily: "'Syne',sans-serif" }}>{score}%</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Pronto para operar e preparar deploy.</div>
        <Bar v={score} color={score >= 75 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"} h={6} />
      </Card>
      <Card style={{ padding: "14px 16px" }}>
        <SectionTitle>CHECKLIST INTELIGENTE</SectionTitle>
        {checks.map((c) => (
          <button key={c.label} onClick={() => setTab(c.tab)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, color: "#ddd", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ fontSize: 13 }}>{c.label}</span>
            <Tag color={c.ok ? "#10b981" : "#eab308"}>{c.ok ? "ok" : "ação"}</Tag>
          </button>
        ))}
      </Card>
    </div>
  );
};
