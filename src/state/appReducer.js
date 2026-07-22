// ── APP STATE: defaults, normalizers, INIT e reducer ───────────────────
// Núcleo de estado do workspace, extraído do App.jsx (Fase 2 / arquitetura).
// Funções puras — fáceis de testar isoladamente.

import { BRANDING, DEFAULT_BUSINESS_CONFIG } from "../config/branding";

export const DEFAULT_SUBSCRIPTION = {
  plan: "admin",
  status: "active",
  source: "admin",
  startedAt: new Date().toISOString(),
  expiresAt: null,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_BUSINESS = {
  ...DEFAULT_BUSINESS_CONFIG,
};

export const normalizeBusiness = (b) => {
  const next = { ...DEFAULT_BUSINESS, ...(b || {}) };
  const legacyBrands = ["central" + "is", "ne" + "xo", "ne" + "xo studio"];
  if (legacyBrands.includes(String(next.brandName || "").toLowerCase())) next.brandName = BRANDING.brandName;
  return next;
};

export const INIT = {
  tasks: [], notes: [], clients: [], financeEntries: [], studioDocs: [], reviews: {}, reviewDeliverables: [],
  business: DEFAULT_BUSINESS,
  subscription: DEFAULT_SUBSCRIPTION,
  scheduleBlocks: {},
};

// ── REDUCER ────────────────────────────────────────────────────────────
export function reducer(s, a) {
  switch (a.type) {
    case "HYDRATE": return { ...INIT, ...a.p, business: normalizeBusiness(a.p?.business), subscription: { ...DEFAULT_SUBSCRIPTION, ...(a.p?.subscription || {}) } };
    case "UPDATE_BUSINESS": return { ...s, business: normalizeBusiness({ ...s.business, ...a.data }) };
    case "SET_SUBSCRIPTION": return { ...s, subscription: { ...DEFAULT_SUBSCRIPTION, ...(s.subscription || {}), ...a.data, updatedAt: new Date().toISOString() } };
    case "ADD_TASK": return { ...s, tasks: [...s.tasks, { id: Date.now(), completed: false, priority: "medium", createdAt: new Date().toLocaleDateString("pt-BR"), ...a.task }] };
    case "TOGGLE_TASK":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toLocaleDateString("pt-BR") : null } : t)) };
    case "REMOVE_TASK": return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case "ADD_NOTE": return { ...s, notes: [{ id: Date.now(), createdAt: new Date().toLocaleDateString("pt-BR"), ...a.note }, ...s.notes] };
    case "REMOVE_NOTE": return { ...s, notes: s.notes.filter((n) => n.id !== a.id) };
    case "EDIT_NOTE": return { ...s, notes: s.notes.map((n) => (n.id === a.id ? { ...n, ...a.data } : n)) };
    case "ADD_STUDIO_DOC": return { ...s, studioDocs: [{ id: Date.now(), createdAt: new Date().toISOString(), ...a.doc }, ...(s.studioDocs || [])] };
    case "REMOVE_STUDIO_DOC": return { ...s, studioDocs: (s.studioDocs || []).filter((d) => d.id !== a.id) };
    case "UPDATE_REVIEW": return { ...s, reviews: { ...s.reviews, [a.weekKey]: { ...(s.reviews[a.weekKey] || {}), [a.field]: a.value } } };
    case "ADD_REVIEW_DELIVERABLE": return { ...s, reviewDeliverables: [{ id: Date.now(), version: 1, status: "waiting_review", revision_round: 1, createdAt: new Date().toISOString(), comments: [], ...a.deliverable }, ...(s.reviewDeliverables || [])] };
    case "UPDATE_REVIEW_DELIVERABLE": return { ...s, reviewDeliverables: (s.reviewDeliverables || []).map((d) => (d.id === a.id ? { ...d, ...a.data, updatedAt: new Date().toISOString() } : d)) };
    case "REMOVE_REVIEW_DELIVERABLE": return { ...s, reviewDeliverables: (s.reviewDeliverables || []).filter((d) => d.id !== a.id) };
    case "ADD_REVIEW_COMMENT": return { ...s, reviewDeliverables: (s.reviewDeliverables || []).map((d) => (d.id === a.deliverableId ? { ...d, comments: [...(d.comments || []), { id: Date.now(), createdAt: new Date().toISOString(), resolved: false, ...a.comment }] } : d)) };
    case "ADD_CLIENT": return { ...s, clients: [...(s.clients || []), { id: Date.now(), interactions: [], videos: [], createdAt: new Date().toLocaleDateString("pt-BR"), ...a.client }] };
    case "UPDATE_CLIENT": return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, ...a.data } : c)) };
    case "REMOVE_CLIENT": return { ...s, clients: s.clients.filter((c) => c.id !== a.id) };
    case "ADD_CLIENT_PROPOSAL": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: [...(c.proposals || []), { id: Date.now(), createdAt: new Date().toLocaleDateString("pt-BR"), status: "rascunho", ...a.proposal }] } : c)) };
    case "UPDATE_CLIENT_PROPOSAL": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: (c.proposals || []).map((p) => (p.id === a.proposalId ? { ...p, ...a.data } : p)) } : c)) };
    case "REMOVE_CLIENT_PROPOSAL": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, proposals: (c.proposals || []).filter((p) => p.id !== a.proposalId) } : c)) };
    case "ADD_CLIENT_INTERACTION": return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, interactions: [...(c.interactions || []), { id: Date.now(), date: new Date().toLocaleDateString("pt-BR"), ...a.interaction }] } : c)) };
    case "REMOVE_CLIENT_INTERACTION": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, interactions: c.interactions.filter((i) => i.id !== a.intId) } : c)) };
    case "ADD_CLIENT_VIDEO": return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, videos: [...(c.videos || []), { id: Date.now(), status: "pendente", ...a.video }] } : c)) };
    case "UPDATE_CLIENT_VIDEO": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, videos: c.videos.map((v) => (v.id === a.videoId ? { ...v, ...a.data } : v)) } : c)) };
    case "REMOVE_CLIENT_VIDEO": return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, videos: c.videos.filter((v) => v.id !== a.videoId) } : c)) };
    case "ADD_FINANCE_ENTRY": return { ...s, financeEntries: [{ id: Date.now(), createdAt: new Date().toISOString(), ...a.entry }, ...(s.financeEntries || [])] };
    case "UPDATE_FINANCE_ENTRY": return { ...s, financeEntries: (s.financeEntries || []).map((e) => (e.id === a.id ? { ...e, ...a.data } : e)) };
    case "REMOVE_FINANCE_ENTRY": return { ...s, financeEntries: (s.financeEntries || []).filter((e) => e.id !== a.id) };
    case "ADD_SCHEDULE_BLOCK": {
      const prev = s.scheduleBlocks[a.day] || [];
      return { ...s, scheduleBlocks: { ...s.scheduleBlocks, [a.day]: [...prev, { id: Date.now(), ...a.block }] } };
    }
    case "REMOVE_SCHEDULE_BLOCK": {
      const prev = s.scheduleBlocks[a.day] || [];
      return { ...s, scheduleBlocks: { ...s.scheduleBlocks, [a.day]: prev.filter((b) => b.id !== a.id) } };
    }
    case "RESTORE": return { ...INIT, ...a.p, business: normalizeBusiness(a.p?.business), subscription: { ...DEFAULT_SUBSCRIPTION, ...(a.p?.subscription || {}) } };
    case "CLEAR_DATA": return INIT;
    default: return s;
  }
}
