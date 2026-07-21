// ── STATE MANAGEMENT ────────────────────────────────────────────────────
// Initial state + reducer extracted from App.jsx.

import {
  DEFAULT_BUSINESS, DEFAULT_SUBSCRIPTION, XP_TABLE,
  normalizeBusiness,
} from "../constants/index.js";

export const DEFAULT_GSD_AGENT = {
  enabled: true,
  name: "GSD",
  label: "Get Shit Done",
  mode: "execution",
  mission: "Guardar contexto operacional e transformar decisão solta em próxima ação clara.",
  currentFocus: "",
  operatingRules: [
    "Capturar contexto antes que ele se perca",
    "Separar fato, decisão e próxima ação",
    "Puxar o usuário de volta para execução quando houver dispersão",
  ],
  memory: [],
  lastActivatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const normalizeGsdAgent = (agent) => ({
  ...DEFAULT_GSD_AGENT,
  ...(agent || {}),
  memory: Array.isArray(agent?.memory) ? agent.memory : [],
});

// ── INITIAL STATE ──
export const INIT = {
  habits: [
    { id: 1, title: "Treinar", icon: "💪", color: "#f97316", streak: 0, best: 0, completedDates: [] },
    { id: 2, title: "Ler", icon: "📚", color: "#3b82f6", streak: 0, best: 0, completedDates: [] },
    { id: 3, title: "Meditar", icon: "🧘", color: "#8b5cf6", streak: 0, best: 0, completedDates: [] },
    { id: 4, title: "Criar conteúdo", icon: "🎬", color: "#10b981", streak: 0, best: 0, completedDates: [] },
  ],
  goals: [
    { id: 1, level: "annual", title: "Consolidar marca e linguagem visual", progress: 35, status: "active", logs: [] },
    { id: 2, level: "quarterly", title: "Lançar novo projeto audiovisual", progress: 60, status: "active", logs: [] },
    { id: 3, level: "monthly", title: "Criar 12 conteúdos premium", progress: 75, status: "active", logs: [] },
  ],
  tasks: [],
  notes: [],
  clients: [],
  financeEntries: [],
  studioDocs: [],
  reviews: {},
  reviewDeliverables: [],
  business: DEFAULT_BUSINESS,
  subscription: DEFAULT_SUBSCRIPTION,
  gsdAgent: DEFAULT_GSD_AGENT,
  scheduleBlocks: {},
  focusDayPriorities: [],
  focusSessions: 0,
  xp: 0,
  totalHabitsCompleted: 0,
  totalTasksCompleted: 0,
  unlockedBadges: [],
  pomodoroSettings: { work: 25, shortBreak: 5, longBreak: 15 },
  mission: {
    mission: "Construir linguagem, narrativa e direção criativa que inspire pessoas e deixe um legado cultural real.",
    vision: "Ser referência mundial em direção criativa e narrativa visual.",
    purpose: "Dar forma ao invisível. Transformar ideias e histórias em algo que permanece.",
  },
};

// ── REDUCER ──
export function reducer(s, a) {
  switch (a.type) {
    case "HYDRATE":
      return { ...INIT, ...a.p, business: normalizeBusiness(a.p?.business), subscription: { ...DEFAULT_SUBSCRIPTION, ...(a.p?.subscription || {}) }, gsdAgent: normalizeGsdAgent(a.p?.gsdAgent) };
    case "UPDATE_BUSINESS":
      return { ...s, business: normalizeBusiness({ ...s.business, ...a.data }) };
    case "SET_SUBSCRIPTION":
      return { ...s, subscription: { ...DEFAULT_SUBSCRIPTION, ...(s.subscription || {}), ...a.data, updatedAt: new Date().toISOString() } };
    case "UPDATE_GSD_AGENT":
      return { ...s, gsdAgent: normalizeGsdAgent({ ...s.gsdAgent, ...a.data, updatedAt: new Date().toISOString() }) };
    case "ADD_GSD_CONTEXT": {
      const entry = { id: Date.now(), type: "context", text: "", tags: [], createdAt: new Date().toISOString(), ...a.entry };
      return { ...s, gsdAgent: normalizeGsdAgent({ ...s.gsdAgent, memory: [entry, ...(s.gsdAgent?.memory || [])], updatedAt: new Date().toISOString() }) };
    }
    case "REMOVE_GSD_CONTEXT":
      return { ...s, gsdAgent: normalizeGsdAgent({ ...s.gsdAgent, memory: (s.gsdAgent?.memory || []).filter((m) => m.id !== a.id), updatedAt: new Date().toISOString() }) };
    case "CLEAR_GSD_CONTEXT":
      return { ...s, gsdAgent: normalizeGsdAgent({ ...s.gsdAgent, memory: [], updatedAt: new Date().toISOString() }) };
    case "ADD_HABIT":
      return { ...s, habits: [...s.habits, a.habit] };
    case "REMOVE_HABIT":
      return { ...s, habits: s.habits.filter((h) => h.id !== a.id) };
    case "TOGGLE_HABIT": {
      let xpGain = 0;
      const habits = s.habits.map((h) => {
        if (h.id !== a.id) return h;
        const done = h.completedDates.includes(a.date);
        const dates = done ? h.completedDates.filter((d) => d !== a.date) : [...h.completedDates, a.date];
        const streak = done ? Math.max(0, h.streak - 1) : h.streak + 1;
        if (!done) xpGain = XP_TABLE.habit;
        return { ...h, completedDates: dates, streak, best: Math.max(h.best, streak) };
      });
      return { ...s, habits, xp: s.xp + xpGain, totalHabitsCompleted: s.totalHabitsCompleted + (xpGain > 0 ? 1 : 0) };
    }
    case "ADD_TASK":
      return { ...s, tasks: [...s.tasks, { id: Date.now(), completed: false, priority: "medium", createdAt: new Date().toLocaleDateString("pt-BR"), ...a.task }] };
    case "TOGGLE_TASK": {
      const gain = s.tasks.find((t) => t.id === a.id && !t.completed) ? XP_TABLE.task : 0;
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toLocaleDateString("pt-BR") : null } : t)),
        xp: s.xp + gain,
        totalTasksCompleted: s.totalTasksCompleted + (gain > 0 ? 1 : 0),
      };
    }
    case "REMOVE_TASK":
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case "ADD_GOAL":
      return { ...s, goals: [...s.goals, { id: Date.now(), status: "active", logs: [], ...a.goal }] };
    case "UPDATE_GOAL":
      return { ...s, goals: s.goals.map((g) => (g.id === a.id ? { ...g, ...a.data } : g)) };
    case "REMOVE_GOAL":
      return { ...s, goals: s.goals.filter((g) => g.id !== a.id) };
    case "ADD_GOAL_LOG":
      return { ...s, goals: s.goals.map((g) => (g.id === a.id ? { ...g, logs: [...(g.logs || []), { id: Date.now(), date: new Date().toLocaleDateString("pt-BR"), dateRaw: new Date().toISOString(), ...a.log }] } : g)) };
    case "REMOVE_GOAL_LOG":
      return { ...s, goals: s.goals.map((g) => (g.id === a.goalId ? { ...g, logs: g.logs.filter((l) => l.id !== a.logId) } : g)) };
    case "ADD_NOTE":
      return { ...s, notes: [{ id: Date.now(), createdAt: new Date().toLocaleDateString("pt-BR"), ...a.note }, ...s.notes] };
    case "REMOVE_NOTE":
      return { ...s, notes: s.notes.filter((n) => n.id !== a.id) };
    case "EDIT_NOTE":
      return { ...s, notes: s.notes.map((n) => (n.id === a.id ? { ...n, ...a.data } : n)) };
    case "ADD_STUDIO_DOC":
      return { ...s, studioDocs: [{ id: Date.now(), createdAt: new Date().toISOString(), ...a.doc }, ...(s.studioDocs || [])] };
    case "REMOVE_STUDIO_DOC":
      return { ...s, studioDocs: (s.studioDocs || []).filter((d) => d.id !== a.id) };
    case "UPDATE_REVIEW":
      return { ...s, reviews: { ...s.reviews, [a.weekKey]: { ...(s.reviews[a.weekKey] || {}), [a.field]: a.value } } };
    case "ADD_REVIEW_DELIVERABLE":
      return { ...s, reviewDeliverables: [{ id: Date.now(), version: 1, status: "waiting_review", revision_round: 1, createdAt: new Date().toISOString(), comments: [], ...a.deliverable }, ...(s.reviewDeliverables || [])] };
    case "UPDATE_REVIEW_DELIVERABLE":
      return { ...s, reviewDeliverables: (s.reviewDeliverables || []).map((d) => (d.id === a.id ? { ...d, ...a.data, updatedAt: new Date().toISOString() } : d)) };
    case "REMOVE_REVIEW_DELIVERABLE":
      return { ...s, reviewDeliverables: (s.reviewDeliverables || []).filter((d) => d.id !== a.id) };
    case "ADD_REVIEW_COMMENT":
      return { ...s, reviewDeliverables: (s.reviewDeliverables || []).map((d) => (d.id === a.deliverableId ? { ...d, comments: [...(d.comments || []), { id: Date.now(), createdAt: new Date().toISOString(), resolved: false, ...a.comment }] } : d)) };
    case "UPDATE_MISSION":
      return { ...s, mission: { ...s.mission, [a.field]: a.value } };
    case "UNLOCK_BADGE":
      return (s.unlockedBadges || []).includes(a.id) ? s : { ...s, unlockedBadges: [...(s.unlockedBadges || []), a.id] };
    case "ADD_CLIENT":
      return { ...s, clients: [...(s.clients || []), { id: Date.now(), interactions: [], videos: [], createdAt: new Date().toLocaleDateString("pt-BR"), ...a.client }] };
    case "UPDATE_CLIENT":
      return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, ...a.data } : c)) };
    case "REMOVE_CLIENT":
      return { ...s, clients: s.clients.filter((c) => c.id !== a.id) };
    case "ADD_CLIENT_PROPOSAL":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: [...(c.proposals || []), { id: Date.now(), createdAt: new Date().toLocaleDateString("pt-BR"), status: "rascunho", ...a.proposal }] } : c)) };
    case "UPDATE_CLIENT_PROPOSAL":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: (c.proposals || []).map((p) => (p.id === a.proposalId ? { ...p, ...a.data } : p)) } : c)) };
    case "REMOVE_CLIENT_PROPOSAL":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: (c.proposals || []).filter((p) => p.id !== a.proposalId) } : c)) };
    case "ADD_CLIENT_INTERACTION":
      return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, interactions: [...(c.interactions || []), { id: Date.now(), date: new Date().toLocaleDateString("pt-BR"), ...a.interaction }] } : c)) };
    case "REMOVE_CLIENT_INTERACTION":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, interactions: c.interactions.filter((i) => i.id !== a.intId) } : c)) };
    case "ADD_CLIENT_VIDEO":
      return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, videos: [...(c.videos || []), { id: Date.now(), status: "pendente", ...a.video }] } : c)) };
    case "UPDATE_CLIENT_VIDEO":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, videos: c.videos.map((v) => (v.id === a.videoId ? { ...v, ...a.data } : v)) } : c)) };
    case "REMOVE_CLIENT_VIDEO":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, videos: c.videos.filter((v) => v.id !== a.videoId) } : c)) };
    case "ADD_FINANCE_ENTRY":
      return { ...s, financeEntries: [{ id: Date.now(), createdAt: new Date().toISOString(), ...a.entry }, ...(s.financeEntries || [])] };
    case "UPDATE_FINANCE_ENTRY":
      return { ...s, financeEntries: (s.financeEntries || []).map((e) => (e.id === a.id ? { ...e, ...a.data } : e)) };
    case "REMOVE_FINANCE_ENTRY":
      return { ...s, financeEntries: (s.financeEntries || []).filter((e) => e.id !== a.id) };
    case "ADD_SCHEDULE_BLOCK": {
      const prev = s.scheduleBlocks[a.day] || [];
      return { ...s, scheduleBlocks: { ...s.scheduleBlocks, [a.day]: [...prev, { id: Date.now(), ...a.block }] } };
    }
    case "REMOVE_SCHEDULE_BLOCK": {
      const prev = s.scheduleBlocks[a.day] || [];
      return { ...s, scheduleBlocks: { ...s.scheduleBlocks, [a.day]: prev.filter((b) => b.id !== a.id) } };
    }
    case "SET_FOCUS_PRIORITIES":
      return { ...s, focusDayPriorities: a.priorities };
    case "COMPLETE_FOCUS_PRIORITY":
      return { ...s, focusDayPriorities: s.focusDayPriorities.map((p, i) => (i === a.idx ? { ...p, done: !p.done } : p)) };
    case "INC_FOCUS_SESSIONS":
      return { ...s, focusSessions: (s.focusSessions || 0) + 1 };
    case "RESTORE":
      return { ...INIT, ...a.p, business: normalizeBusiness(a.p?.business), subscription: { ...DEFAULT_SUBSCRIPTION, ...(a.p?.subscription || {}) }, gsdAgent: normalizeGsdAgent(a.p?.gsdAgent) };
    case "CLEAR_DATA":
      return INIT;
    default:
      return s;
  }
}
