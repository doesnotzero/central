// ── HELPER FUNCTIONS ────────────────────────────────────────────────────
// Utility functions extracted from App.jsx.

import { C, APP_NAME, SALES_EMAIL } from "../theme.config.js";
import {
  SK, DEFAULT_BUSINESS, DEFAULT_SUBSCRIPTION,
  AUDIOVISUAL_PRESETS, STUDIO_DOCUMENTS, PRODUCTION_KNOWLEDGE,
  PREMIUM_CHECKLIST_CATALOG, PRODUCTION_PIPELINE, DOC_FIELD_CONFIG,
  normalizeClientStatus,
} from "../constants/index.js";

// ── STORAGE ──
export const persist = (s) => { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} };
export const hydrate = () => { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } };

// ── DATE HELPERS ──
export const todayStr = () => new Date().toDateString();
export const inputDate = () => new Date().toISOString().slice(0, 10);
export const addDaysInput = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
export const weekKey = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(new Date(d).setDate(diff)).toDateString();
};
export const parseDateOnly = (d) => (d ? new Date(d + "T00:00") : null);
export const dayDiff = (d) => {
  if (!d) return null;
  const a = parseDateOnly(d);
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
};
export const taskBucket = (t) => {
  const diff = dayDiff(t.dueDate);
  if (diff === null) return "noDate";
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "week";
  return "later";
};

// ── CURRENCY / FORMATTING ──
export const fmtCurrency = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
export const fmtMoney = (v, priv) => (priv ? "R$ ••••••" : fmtCurrency(v));
export const fmtDashboardMoney = (v, priv) => (priv ? "Oculto" : fmtCurrency(v));
export const timeToMins = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const formatTimer = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

// ── USER / SESSION ──
export const firstName = (v) => String(v || "").trim().split(/\s+/)[0] || "";
export const getUserName = (session) => {
  const meta = session?.user?.user_metadata || {};
  const raw = meta.full_name || meta.name || meta.user_name || session?.user?.email?.split("@")[0] || "";
  const clean = firstName(raw.replace(/[._-]+/g, " "));
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";
};
export const onboardingKey = (session) => `dnz_onboarding_${session?.user?.id || "guest"}`;

// ── SUBSCRIPTION / ACCESS ──
export const getSubscription = (state) => ({ ...DEFAULT_SUBSCRIPTION, ...(state.subscription || {}) });
export const hasAdminAccess = (_state, _required = "admin", isAdmin = false) => !!isAdmin;
export const operationReadiness = (state) => {
  const clients = state.clients || [];
  const projects = clients.flatMap((c) => c.videos || []);
  const entries = state.financeEntries || [];
  const proposals = clients.flatMap((c) => c.proposals || []);
  const configured = !!state.business?.onboarded;
  const revenue =
    clients.reduce((a, c) => a + Number(c.value || 0), 0) +
    entries.filter((e) => e.type === "entrada").reduce((a, e) => a + Number(e.value || 0), 0);
  const done = [
    { label: "Negócio configurado", ok: configured, tab: "business" },
    { label: "CRM com pelo menos 3 clientes/leads", ok: clients.length >= 3, tab: "clients" },
    { label: "Projeto audiovisual criado", ok: projects.length > 0, tab: "projects" },
    { label: "Proposta salva no histórico", ok: proposals.length > 0, tab: "proposta" },
    { label: "Financeiro com valor mapeado", ok: revenue > 0, tab: "finance" },
    { label: "Backup/relatório preparado", ok: !!localStorage.getItem("dcc_last_backup") || Object.keys(state.reviews || {}).length > 0, tab: "export" },
  ];
  return {
    items: done,
    score: Math.round((done.filter((i) => i.ok).length / done.length) * 100),
    revenue,
    clients: clients.length,
    projects: projects.length,
    proposals: proposals.length,
  };
};

// ── AUDIOVISUAL HELPERS ──
export const audiovisualChecklistText = (p) =>
  (p?.checklist || ["Briefing", "Roteiro", "Captação", "Edição", "Revisão", "Entrega"]).join("\n");

export const presetById = (id) =>
  AUDIOVISUAL_PRESETS.find((p) => p.id === id) ||
  AUDIOVISUAL_PRESETS.find((p) => p.type === id) ||
  AUDIOVISUAL_PRESETS[1];

export const presetDeliverables = (p) => {
  const map = {
    reel: ["1 vídeo vertical 9:16", "Capa/thumbnail", "Legenda revisada", "Arquivo final em MP4"],
    institucional: ["Vídeo principal 16:9", "Versão curta para redes", "Thumbnail", "Arquivo final em alta"],
    evento: ["Aftermovie", "Cortes curtos para redes", "Seleção de melhores takes", "Arquivo final em alta"],
    edicao: ["Corte final", "Versão com legenda", "Arquivo editável quando combinado", "Exportação em MP4"],
    drone: ["Takes aéreos tratados", "Vídeo final com drone", "Banco de imagens aéreas", "Arquivo final em alta"],
    doc: ["Mini documentário", "Teaser curto", "Cortes de entrevista", "Arquivo master"],
    trafego: ["Criativo principal", "2 variações de gancho", "Versão com legenda", "Arquivo pronto para anúncios"],
    stories: ["10 stories editados", "Capa visual", "Textos/legendas", "Arquivos verticais"],
  };
  return (map[p?.id] || ["Vídeo final", "Versão para redes", "Thumbnail", "Arquivo final"]).map((text) => ({ text, done: false }));
};

export const presetBriefing = (p) => ({
  objective:
    p?.id === "trafego"
      ? "Gerar conversão com mensagem direta"
      : p?.id === "doc"
        ? "Contar uma história com narrativa forte"
        : "Apresentar a marca com clareza e impacto",
  audience: "",
  reference: "",
  duration: p?.id === "reel" || p?.id === "stories" ? "15-45s" : p?.id === "doc" ? "5-15 min" : "60-120s",
  format: p?.type || "gravação",
  location: "",
  shootDate: "",
  notes: "",
});

export const presetSchedule = (p, deadline = "") => [
  { key: "briefing", label: "Briefing aprovado", date: addDaysInput(1), done: false },
  { key: "script", label: "Roteiro / plano", date: addDaysInput(3), done: false },
  { key: "capture", label: p?.type === "edição" ? "Arquivos recebidos" : "Captação", date: addDaysInput(6), done: false },
  { key: "firstCut", label: "Primeira versão", date: addDaysInput(10), done: false },
  { key: "review", label: "Revisão do cliente", date: addDaysInput(12), done: false },
  { key: "delivery", label: "Entrega final", date: deadline || addDaysInput(14), done: false },
];

export const buildPremiumChecklist = (presetId) => {
  const profile = productionProfile(presetId);
  return Object.fromEntries(
    Object.entries(PREMIUM_CHECKLIST_CATALOG).map(([key, items]) => [
      key,
      [...items, ...(key === "producao" ? profile?.checklist || [] : [])]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((text) => ({ text, done: false })),
    ])
  );
};

export const buildVideoProject = (form) => {
  const p = presetById(form.presetId) || AUDIOVISUAL_PRESETS.find((x) => x.title === form.title) || AUDIOVISUAL_PRESETS[1];
  return {
    title: form.title || p.title,
    type: form.type || p.type,
    status: "pendente",
    deadline: form.deadline || "",
    link: form.link || "",
    presetId: p.id,
    checklist: (form.checklist || p.checklist || []).map((text) => (typeof text === "string" ? { text, done: false } : text)),
    deliverables: presetDeliverables(p),
    productionSchedule: presetSchedule(p, form.deadline),
    briefing: presetBriefing(p),
    productionPipeline: { briefing: false, roteiro: false, decupagem: false, callsheet: false, checklist: false, entrega: false },
    premiumChecklist: buildPremiumChecklist(p.id),
    links: { briefing: "", drive: form.link || "", reference: "", review: "", delivery: "" },
  };
};

// ── STUDIO DOC HELPERS ──
export const productionProfile = (presetId) => PRODUCTION_KNOWLEDGE[presetId] || PRODUCTION_KNOWLEDGE.institucional;
export const studioDocById = (id) => STUDIO_DOCUMENTS.find((d) => d.id === id) || STUDIO_DOCUMENTS[0];
export const docConfig = (id) => DOC_FIELD_CONFIG[id] || DOC_FIELD_CONFIG.callsheet;
export const studioEsc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
export const studioDate = (v) => (v ? new Date(v + "T00:00").toLocaleDateString("pt-BR") : "A definir");
export const studioLines = (v) => String(v || "").split(/\n|,/).map((x) => x.trim()).filter(Boolean);

// ── RELATIONSHIP HELPERS ──
export const relationType = (c) => c?.relationshipType || "cliente";
export const relationMeta = (c) => {
  const type = relationType(c);
  if (type === "recorrente") return c.monthlyValue ? `Mensal: ${fmtCurrency(c.monthlyValue)}` : "Contrato mensal";
  if (type === "parceria") return c.barterDetails || c.partnerTerms || "Parceria / permuta";
  if (type === "freelancer") {
    const rate = Number(c.freelancerRate);
    const formattedRate = c.freelancerRate ? (Number.isFinite(rate) ? fmtCurrency(rate) : c.freelancerRate) : "";
    return [c.freelancerRole, formattedRate].filter(Boolean).join(" · ") || "Freelancer";
  }
  return c.service || "Cliente comercial";
};
export const isFollowPending = (c) => c.followUpDate && dayDiff(c.followUpDate) <= 0 && !["entregue", "pago"].includes(normalizeClientStatus(c));

// ── STUDIO DOC TEMPLATES ──
export const studioDocTemplates = ({ form, business, client, project }) => {
  const doc = studioDocById(form.docType);
  const config = docConfig(form.docType);
  const preset = presetById(form.presetId);
  const profile = productionProfile(preset.id);
  const customCrew = studioLines(form.crew);
  const customEquipment = studioLines(form.equipment);
  const scope = studioLines(form.scope);
  const risks = studioLines(form.risks);
  const fieldValue = (key) => form[key] || "";
  const moneyField = (v) => (v ? fmtCurrency(v) : "A definir");
  const fields = [
    ["Cliente", client?.name || form.clientName || "Cliente a definir"],
    ["Projeto", project?.video?.title || form.title || preset.title],
    ["Tipo", doc.label],
    ["Formato", form.format || preset.type],
    ["Prazo final", studioDate(form.deadline)],
    ["Orçamento base", form.budget ? fmtCurrency(form.budget) : fmtCurrency(project?.client?.value || preset.value || 0)],
  ];
  const docFields = (config.fields || [])
    .filter((f) => fieldValue(f.key))
    .map((f) => [f.label, f.type === "date" ? studioDate(fieldValue(f.key)) : f.type === "number" ? moneyField(fieldValue(f.key)) : fieldValue(f.key)]);
  const section = (title, items, klass = "") =>
    items?.length
      ? `<div class="doc-section ${klass}"><h2>${studioEsc(title)}</h2><div class="doc-list">${items.map((i) => `<div class="doc-item">${studioEsc(i)}</div>`).join("")}</div></div>`
      : "";
  const prose = (title, text) => (String(text || "").trim() ? section(title, studioLines(text)) : "");
  const table = (title, rows, heads) =>
    rows?.length
      ? `<div class="doc-section"><h2>${studioEsc(title)}</h2><table class="doc-table"><thead><tr>${heads.map((h) => `<th>${studioEsc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${studioEsc(c || "A definir")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      : "";
  const fieldGrid = `<div class="doc-grid">${[...fields, ...docFields].map(([k, v]) => `<div class="doc-field"><div class="doc-field-label">${studioEsc(k)}</div><div class="doc-field-value">${studioEsc(v)}</div></div>`).join("")}</div>`;
  const baseSections = [
    section("Padrões Profissionais Aplicados", profile.principles),
    section("Escopo e Entregáveis", scope.length ? scope : presetDeliverables(preset).map((x) => x.text)),
    section("Equipe Recomendada", customCrew.length ? customCrew : profile.crew),
    section("Equipamentos e Técnica", customEquipment.length ? customEquipment : profile.equipment),
    section("Riscos e Cuidados", risks.length ? risks : ["Confirmar autorizações de imagem e locação", "Manter backup duplicado dos arquivos", "Definir responsáveis por aprovação e revisões", "Prever margem para clima, deslocamento e imprevistos"]),
  ];
  const sceneRows = studioLines(form.scenes || form.shotList)
    .map((line, i) => [String(i + 1), ...line.split("|").map((x) => x.trim()).slice(0, 4)]);
  const variants = {
    briefing: [
      section("Objetivo e Público", [
        form.objective || presetBriefing(preset).objective,
        form.audience ? `Público prioritário: ${form.audience}` : "Público prioritário: a definir",
        form.brandMessage ? `Mensagem central: ${form.brandMessage}` : "Mensagem central a definir",
        form.approvalCriteria ? `Critério de aprovação: ${form.approvalCriteria}` : "Critério de aprovação: alinhamento criativo + escopo",
      ]),
      prose("Pontos Obrigatórios", form.mandatoryPoints),
      section("Perguntas de Direção", ["Qual transformação o público precisa perceber?", "Que prova visual sustenta a promessa?", "Que emoção deve guiar montagem e trilha?", "Quais restrições legais, de marca ou linguagem existem?"]),
      baseSections[0],
      baseSections[4],
    ],
    roteiro: [
      section("Beat Sheet", studioLines(form.scenes).length ? studioLines(form.scenes) : [form.hook || "Gancho inicial", form.logline || "Apresentação da promessa", form.cta || "Fechamento / CTA"]),
      prose("Texto, Locução e Falas", form.voiceover),
      section("Direção de Cena", ["Priorizar ações filmáveis e falas objetivas", "Prever respiros para B-roll e cortes de apoio", "Manter ritmo compatível com canal e duração", "Validar linguagem com público e posicionamento do cliente"]),
      baseSections[1],
    ],
    callsheet: [
      table(
        "Agenda do Dia",
        studioLines(form.scheduleRows).map((x) => {
          const p = x.split("|").map((y) => y.trim());
          return [p[0] || "Horário", p[1] || p[0] || "Atividade", p[2] || "Responsável", p[3] || ""];
        }),
        ["Horário", "Atividade", "Responsável", "Obs."]
      ),
      prose("Talentos / Participantes", form.talent),
      baseSections[2],
      baseSections[3],
      baseSections[4],
    ],
    decupagem: [
      table(
        "Lista de Planos",
        sceneRows.map((r) => [r[0], r[1] || "Cena", r[2] || "Plano", r[3] || form.lenses || "Lente", r[4] || form.cameraMovement || "Movimento"]),
        ["#", "Cena", "Plano", "Lente", "Movimento"]
      ),
      section("Direção Técnica", [
        form.lenses && `Lentes: ${form.lenses}`,
        form.cameraMovement && `Movimento: ${form.cameraMovement}`,
        form.audioPlan && `Áudio: ${form.audioPlan}`,
        form.coverageNotes && `Cobertura: ${form.coverageNotes}`,
      ].filter(Boolean)),
      baseSections[0],
      baseSections[3],
    ],
    orcamento: [
      table("Composição do Investimento", [
        ["Equipe", moneyField(form.crewCost)],
        ["Equipamentos / locação", moneyField(form.equipmentCost)],
        ["Pós-produção", moneyField(form.postCost)],
        ["Total proposto", moneyField(form.budget)],
      ], ["Categoria", "Valor"]),
      prose("Escopo Incluído", form.scope),
      section("Condições Comerciais", [
        form.paymentTerms || "Condições a definir",
        form.assumptions || "Alterações fora do escopo exigem nova aprovação",
        "Direitos, deslocamento e uso comercial devem estar descritos em contrato",
      ]),
    ],
    cronograma: [
      table("Linha do Tempo", [
        ["Início", studioDate(form.startDate)],
        ["Captação", studioDate(form.shootDate)],
        ["Primeiro corte", studioDate(form.firstCutDate)],
        ["Entrega final", studioDate(form.deadline)],
      ], ["Marco", "Data"]),
      prose("Marcos do Projeto", form.milestones),
      section("Aprovação e Dependências", [
        form.approvalRounds && `Rodadas: ${form.approvalRounds}`,
        form.buffer && `Buffer: ${form.buffer}`,
        form.dependencies && `Dependências: ${form.dependencies}`,
      ].filter(Boolean)),
      baseSections[4],
    ],
    checklist: [
      section("Pacotes Técnicos", [
        form.cameraPackage && `Câmera: ${form.cameraPackage}`,
        form.audioPackage && `Áudio: ${form.audioPackage}`,
        form.lightPackage && `Luz: ${form.lightPackage}`,
        form.dataWorkflow && `Dados: ${form.dataWorkflow}`,
      ].filter(Boolean)),
      prose("Pré-set", form.preflight),
      section("Checklist Operacional", profile.checklist),
      prose("Fechamento de Set", form.wrapChecklist),
      baseSections[4],
    ],
    entrega: [
      section("Pacote de Entrega", [
        form.deliveryLinks && `Links: ${form.deliveryLinks}`,
        form.formats && `Formatos: ${form.formats}`,
        form.versions && `Versões: ${form.versions}`,
        form.storagePolicy && `Arquivamento: ${form.storagePolicy}`,
        form.acceptanceCriteria && `Aceite: ${form.acceptanceCriteria}`,
      ].filter(Boolean)),
      prose("Itens Entregues", form.scope),
      prose("Observações Finais", form.deliveryNotes),
      section("Aceite", [
        "Cliente recebe links e especificações",
        "Prazo de revisão final deve ser confirmado",
        "Materiais ficam arquivados conforme política combinada",
        "Novas alterações após aceite entram como novo escopo",
      ]),
    ],
  };
  const content = (variants[doc.id] || baseSections).filter(Boolean).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${studioEsc(doc.label)} - ${studioEsc(form.title || preset.title)}</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f4ee;color:#141414;font-family:Arial,sans-serif}.doc-page{max-width:860px;margin:0 auto;background:#f7f4ee;min-height:100vh;padding:48px}.doc-kicker{font-size:10px;color:${doc.color};font-weight:900;letter-spacing:.18em;text-transform:uppercase}.doc-title{font-size:42px;line-height:.95;font-weight:900;margin:10px 0 12px;color:#111}.doc-muted{color:#666;line-height:1.45}.doc-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:22px;border-bottom:3px solid ${doc.color}}.doc-brand{text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.12em;font-weight:900}.doc-section{margin-top:26px;padding-top:15px;border-top:1px solid #d9d3ca}.doc-section h2{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:${doc.color};margin:0 0 10px}.doc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:22px}.doc-field{border:1px solid #ded7cc;background:#fffdf8;padding:11px}.doc-field-label{font-size:9px;color:#888;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.doc-field-value{font-size:12px;color:#1a1a1a;font-weight:700;line-height:1.45}.doc-list{display:grid;gap:7px}.doc-item{font-size:12px;line-height:1.48;padding:9px 11px;border-left:3px solid ${doc.color};background:#fffdf8}.doc-table{width:100%;border-collapse:collapse;background:#fffdf8;font-size:12px}.doc-table th{text-align:left;color:${doc.color};font-size:9px;text-transform:uppercase;letter-spacing:.1em;border:1px solid #ded7cc;padding:8px}.doc-table td{border:1px solid #ded7cc;padding:9px;vertical-align:top;line-height:1.4}.doc-footer{margin-top:42px;padding-top:18px;border-top:1px solid #d9d3ca;display:flex;justify-content:space-between;gap:24px;color:#777;font-size:11px}@media print{body{background:#fff}.doc-page{padding:32px;max-width:none}.doc-section{break-inside:avoid}.doc-grid{grid-template-columns:1fr 1fr}}</style></head><body><main class="doc-page"><header class="doc-header"><div><div class="doc-kicker">${studioEsc(APP_NAME)} Studio · ${studioEsc(doc.label)}</div><h1 class="doc-title">${studioEsc(form.title || project?.video?.title || preset.title)}</h1><div class="doc-muted">${studioEsc(config.tone || doc.desc)}</div></div><div class="doc-brand">${studioEsc(business.brandName || APP_NAME)}<br>${studioEsc(business.proposalEmail || SALES_EMAIL)}<br>${new Date().toLocaleDateString("pt-BR")}</div></header>${fieldGrid}${content}${form.notes ? section("Notas Adicionais", studioLines(form.notes)) : ""}<footer class="doc-footer"><div>${studioEsc(business.brandName || APP_NAME)} · Documento operacional</div><div>Gerado em ${new Date().toLocaleString("pt-BR")}</div></footer></main></body></html>`;
};
