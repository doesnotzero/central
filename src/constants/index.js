// ── BUSINESS CONSTANTS ──────────────────────────────────────────────────
// Extracted from App.jsx — all data constants used across the workspace.

import { C, APP_NAME, SALES_EMAIL } from "../theme.config.js";
import { BRANDING, DEFAULT_BUSINESS_CONFIG } from "../config/branding.js";

// ── STORAGE ──
export const SK = "dnz_central_v1";
export const IDLE_LOCK_MS = 5 * 60 * 1000;

// ── SUBSCRIPTION / BUSINESS DEFAULTS ──
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
  if (legacyBrands.includes(String(next.brandName || "").toLowerCase()))
    next.brandName = BRANDING.brandName;
  return next;
};

// ── MOTIVATIONAL QUOTES ──
export const QUOTES = [
  "O caos gera ideias. A disciplina constrói o legado.",
  "Consistência vence motivação.",
  "Visão clara + Execução consistente = Legado.",
  "Proteja sua energia criativa.",
  "Menos perfeição, mais progresso.",
  "Cada dia é uma chance de construir algo que dura.",
  "Foque no processo. O resultado vem.",
];

// ── DATE / LOCALE ──
export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ── CRM / PIPELINE ──
export const CLIENT_PIPELINE = [
  { key: "lead", label: "Lead", color: "#3b82f6" },
  { key: "briefing", label: "Briefing", color: "#8b5cf6" },
  { key: "proposta_enviada", label: "Proposta enviada", color: "#eab308" },
  { key: "em_producao", label: "Em produção", color: "#ff2400" },
  { key: "entregue", label: "Entregue", color: "#10b981" },
  { key: "pago", label: "Pago", color: "#06b6d4" },
];

export const normalizeClientStatus = (c) => {
  const s = (c?.status || "lead").toLowerCase();
  if (["prospecto", "lead"].includes(s)) return "lead";
  if (["ativo", "contato", "briefing"].includes(s)) return "briefing";
  if (["proposta", "proposal", "proposta_enviada", "enviada"].includes(s)) return "proposta_enviada";
  if (["pausado", "producao", "produção", "em_producao", "em produção", "recorrente"].includes(s)) return "em_producao";
  if (["concluido", "concluído", "entregue"].includes(s)) return "entregue";
  if (["pago", "paid"].includes(s)) return "pago";
  return "lead";
};

export const clientStageLabel = (c) =>
  CLIENT_PIPELINE.find((stage) => stage.key === normalizeClientStatus(c))?.label || "Lead";

export const STATUS_COLORS = Object.fromEntries(CLIENT_PIPELINE.map((s) => [s.key, s.color]));
export const PAG_COLORS = { pago: "#10b981", pendente: "#eab308", atrasado: "#ef4444", parcial: "#f97316" };
export const VIDEO_STATUS = ["pendente", "gravando", "editando", "revisão", "entregue"];
export const VIDEO_COLORS = { pendente: C.muted, gravando: "#3b82f6", editando: "#8b5cf6", "revisão": "#eab308", entregue: "#10b981" };
export const TEMP_COLORS = { frio: "#3b82f6", morno: "#eab308", quente: "#ef4444" };

// ── SERVICES CATALOG ──
export const SERVICES_CATALOG = [
  { id: "reel", name: "Reel / Short", desc: "Vídeo vertical para redes sociais", price: 800 },
  { id: "institucional", name: "Vídeo Institucional", desc: "Apresentação da empresa/marca", price: 3500 },
  { id: "edicao", name: "Edição de Vídeo", desc: "Edição de material fornecido", price: 600 },
  { id: "motion", name: "Motion Graphics", desc: "Animações e gráficos em movimento", price: 1200 },
  { id: "drone", name: "Filmagem com Drone", desc: "Captação aérea profissional", price: 1500 },
  { id: "doc", name: "Mini Documentário", desc: "Documentário de 5–15 minutos", price: 5000 },
  { id: "foto", name: "Ensaio Fotográfico", desc: "Sessão de fotos profissional", price: 1200 },
  { id: "stories", name: "Pack de Stories", desc: "10 stories editados e entregues", price: 500 },
  { id: "trafego", name: "Criativo para Tráfego", desc: "Vídeo otimizado para anúncios", price: 900 },
  { id: "evento", name: "Cobertura de Evento", desc: "Filmagem + edição do evento", price: 2500 },
  { id: "identidade", name: "Identidade Visual", desc: "Logo, paleta, tipografia", price: 2800 },
  { id: "roteiro", name: "Roteiro / Copywriting", desc: "Criação de roteiro e copy", price: 700 },
];

// ── AUDIOVISUAL PRESETS ──
export const AUDIOVISUAL_PRESETS = [
  { id: "reel", label: "Reel premium", title: "Reel premium", type: "vertical", service: "Reel / Short", value: 800, checklist: ["Gancho", "Roteiro curto", "Captação vertical", "Edição dinâmica", "Legenda", "Aprovação", "Publicação"] },
  { id: "institucional", label: "Institucional", title: "Vídeo institucional", type: "gravação", service: "Vídeo Institucional", value: 3500, checklist: ["Briefing", "Roteiro", "Decupagem", "Captação", "Edição", "Motion", "Revisão", "Entrega"] },
  { id: "evento", label: "Evento", title: "Cobertura de evento", type: "evento", service: "Cobertura de Evento", value: 2500, checklist: ["Briefing", "Cronograma", "Lista de takes", "Captação", "Seleção", "Edição", "Entrega"] },
  { id: "edicao", label: "Edição", title: "Edição de vídeo", type: "edição", service: "Edição de Vídeo", value: 600, checklist: ["Receber arquivos", "Organizar mídia", "Corte bruto", "Trilha e efeitos", "Color", "Revisão", "Exportação"] },
  { id: "drone", label: "Drone", title: "Filmagem com drone", type: "drone", service: "Filmagem com Drone", value: 1500, checklist: ["Autorização do local", "Plano de voo", "Captação aérea", "Backup", "Seleção", "Entrega"] },
  { id: "doc", label: "Mini doc", title: "Mini documentário", type: "documentário", service: "Mini Documentário", value: 5000, checklist: ["Pesquisa", "Entrevistas", "Roteiro documental", "Captação", "Montagem", "Color e som", "Revisão", "Entrega"] },
  { id: "trafego", label: "Criativo ads", title: "Criativo para tráfego", type: "ads", service: "Criativo para Tráfego", value: 900, checklist: ["Objetivo da campanha", "Gancho", "Roteiro direto", "Captação ou assets", "Edição com CTA", "Variações", "Entrega"] },
  { id: "stories", label: "Stories", title: "Pack de stories", type: "vertical", service: "Pack de Stories", value: 500, checklist: ["Pauta", "Roteiro curto", "Assets", "Edição vertical", "Legendas", "Aprovação", "Entrega"] },
];

// ── NICHE PLAYBOOKS ──
export const NICHE_PLAYBOOKS = [
  {
    id: "clinica", niche: "Clínicas e estética",
    promise: "Gerar confiança, autoridade e agenda cheia com prova visual.",
    color: "#10b981", presetId: "reel", service: "Reel / Short", value: 2400,
    leadSource: "Indicação / Instagram",
    nextAction: "Enviar roteiro de autoridade e exemplos de antes/depois",
    tasks: ["Mapear procedimentos com maior margem", "Criar roteiro de autoridade do especialista", "Separar provas sociais e depoimentos", "Definir CTA para agendamento", "Montar pacote mensal de reels"],
    offer: ["4 reels de autoridade", "2 vídeos de prova social", "1 vídeo institucional curto", "Roteiros com CTA para WhatsApp"],
    notes: "Nicho sensível: evitar promessas médicas, usar prova social real e aprovação do cliente.",
  },
  {
    id: "imobiliario", niche: "Imobiliárias e corretores",
    promise: "Transformar imóveis em percepção de valor e captação de leads.",
    color: "#3b82f6", presetId: "drone", service: "Filmagem com Drone", value: 3500,
    leadSource: "Parceria local",
    nextAction: "Solicitar endereço, diferenciais do imóvel e janela de captação",
    tasks: ["Listar imóveis prioritários", "Definir narrativa do imóvel", "Separar pontos de bairro e lifestyle", "Planejar drone e takes internos", "Criar versão vertical para anúncios"],
    offer: ["Vídeo principal do imóvel", "Drone e lifestyle", "3 cortes verticais", "Fotos/capas para anúncio"],
    notes: "Nicho forte para recorrência por carteira de imóveis e parceria mensal.",
  },
  {
    id: "restaurante", niche: "Restaurantes e gastronomia",
    promise: "Aumentar desejo, frequência e ticket com conteúdo sensorial.",
    color: "#f97316", presetId: "stories", service: "Pack de Stories", value: 1800,
    leadSource: "Prospecção local",
    nextAction: "Marcar visita para captar pratos campeões e bastidores",
    tasks: ["Escolher pratos com maior margem", "Criar lista de takes sensoriais", "Definir promoções da semana", "Captar bastidores e equipe", "Programar sequência de stories"],
    offer: ["Pack semanal de stories", "Reels de pratos campeões", "Captação de bastidores", "Criativos para campanha local"],
    notes: "Nicho visual e recorrente; vender pacote mensal simplifica produção.",
  },
  {
    id: "evento", niche: "Eventos e experiências",
    promise: "Registrar energia do evento e vender a próxima edição.",
    color: "#8b5cf6", presetId: "evento", service: "Cobertura de Evento", value: 4500,
    leadSource: "Networking / produtoras",
    nextAction: "Pedir cronograma, atrações e momentos obrigatórios",
    tasks: ["Mapear momentos imperdíveis", "Confirmar credenciais e acesso", "Criar lista de takes por horário", "Planejar entrega rápida pós-evento", "Separar cortes para patrocinadores"],
    offer: ["Aftermovie principal", "Entrega expressa de melhores momentos", "Cortes verticais", "Pacote para patrocinadores"],
    notes: "Nicho exige prazo curto; diferencial é velocidade de entrega e organização.",
  },
];

// ── STUDIO DOCUMENTS ──
export const STUDIO_DOCUMENTS = [
  { id: "briefing", label: "Briefing", color: "#3b82f6", desc: "Objetivo, público, narrativa, formato, referências e critérios de aprovação." },
  { id: "roteiro", label: "Roteiro", color: "#fb923c", desc: "Estrutura narrativa, cenas, mensagem-chave, falas, CTA e direção de ritmo." },
  { id: "callsheet", label: "Callsheet", color: "#f97316", desc: "Ordem do dia, equipe, locação, horários, contatos, segurança e necessidades técnicas." },
  { id: "decupagem", label: "Decupagem", color: "#8b5cf6", desc: "Sequência de planos, intenção de câmera, lentes, áudio, movimento e cobertura." },
  { id: "orcamento", label: "Orçamento", color: "#10b981", desc: "Categorias de produção, equipe, equipamento, pós, taxas, reservas e condições." },
  { id: "cronograma", label: "Cronograma", color: "#eab308", desc: "Pré-produção, captação, pós-produção, revisão, aprovações e entrega final." },
  { id: "checklist", label: "Checklist de Set", color: "#06b6d4", desc: "Câmera, luz, áudio, produção, dados, autorizações e fechamento de set." },
  { id: "entrega", label: "Relatório de Entrega", color: "#ef4444", desc: "Arquivos finais, formatos, versões, pendências, armazenamento e aceite." },
];

// ── PRODUCTION KNOWLEDGE BASE ──
export const PRODUCTION_KNOWLEDGE = {
  reel: {
    principles: ["Gancho forte nos 3 primeiros segundos", "Mensagem única por peça", "Ritmo visual pensado para retenção mobile", "Legenda e CTA visíveis sem depender de áudio"],
    crew: ["Direção/produção enxuta", "Operador de câmera vertical", "Editor com domínio de cortes rápidos", "Assistente para making of e organização"],
    equipment: ["Câmera ou smartphone com captação 4K", "Microfone de lapela quando houver fala", "Luz LED portátil ou luz natural controlada", "Gimbal/tripé compacto", "Backup imediato dos arquivos"],
    checklist: ["Confirmar roteiro curto e CTA", "Testar áudio antes da gravação", "Captar takes de segurança", "Gravar variações de gancho", "Exportar em 9:16 H.264 MP4", "Validar capa e legenda"],
  },
  institucional: {
    principles: ["Narrativa de confiança antes de lista de serviços", "Depoimentos e provas visuais aumentam autoridade", "Cobertura ampla para versões longas e curtas", "Identidade visual consistente em cor, trilha e grafismo"],
    crew: ["Diretor/roteirista", "Diretor de fotografia", "Produtor de set", "Operador de áudio", "Editor e motion designer"],
    equipment: ["Câmera principal + backup", "Kit de lentes wide/normal/tele", "Iluminação key/fill/back", "Microfone boom + lapelas", "Monitor externo", "Tripé/gimbal", "HD/SSD de backup"],
    checklist: ["Aprovar roteiro e perguntas", "Revisar autorizações de imagem", "Separar ambientes limpos", "Confirmar agenda de entrevistados", "Checar ruídos da locação", "Duplicar mídia ao final da diária"],
  },
  evento: {
    principles: ["Priorizar momentos irrepetíveis", "Captar energia, bastidores, público e patrocinadores", "Planejar entregas rápidas para pós-evento", "Ter redundância de bateria, cartões e áudio"],
    crew: ["Produtor de campo", "Cinegrafista principal", "Segundo câmera ou drone quando aplicável", "Editor para highlights", "Assistente de mídia"],
    equipment: ["Duas câmeras quando possível", "Lentes claras", "Microfone direcional", "Estabilizador", "Luz on-camera", "Cartões extras", "Power banks", "Notebook/SSD para backup"],
    checklist: ["Receber cronograma oficial", "Mapear momentos obrigatórios", "Confirmar credenciais", "Definir ponto de backup", "Captar aberturas, público e encerramento", "Entregar teaser rápido"],
  },
  edicao: {
    principles: ["Organização de mídia antes de corte", "Primeiro corte resolve narrativa, não acabamento", "Revisão precisa ter rodada e prazo definidos", "Exportação deve seguir canal de distribuição"],
    crew: ["Editor", "Assistente de mídia", "Colorista quando necessário", "Designer de som/motion conforme escopo"],
    equipment: ["Estação de edição atualizada", "HDs redundantes", "Projeto com estrutura de pastas", "Preset de exportação validado", "Biblioteca de trilhas licenciadas"],
    checklist: ["Receber todos os arquivos", "Conferir specs e FPS", "Organizar proxies se necessário", "Montar corte bruto", "Aplicar cor, som e grafismos", "Exportar master e versões"],
  },
  drone: {
    principles: ["Segurança e autorização vêm antes da estética", "Plano de voo reduz risco e perda de tempo", "Takes aéreos devem servir à narrativa", "Clima e vento definem janela real de captação"],
    crew: ["Piloto de drone", "Observador/assistente", "Produtor de locação", "Editor para seleção e estabilização"],
    equipment: ["Drone revisado", "Baterias carregadas", "Cartões formatados", "Filtros ND", "Landing pad", "Checklist de segurança", "Seguro/autorização quando aplicável"],
    checklist: ["Checar clima e restrições", "Confirmar autorização do local", "Inspecionar hélices e sensores", "Definir rota e altitude", "Captar takes de segurança", "Backup imediato"],
  },
  doc: {
    principles: ["Pesquisa e recorte narrativo comandam a filmagem", "Entrevistas precisam de escuta e silêncio", "B-roll sustenta emoção e contexto", "Arquivo e direitos devem ser organizados desde o início"],
    crew: ["Diretor/documentarista", "Produtor de pesquisa", "Diretor de fotografia", "Operador de áudio", "Montador", "Color/som"],
    equipment: ["Câmera principal + backup", "Kit entrevista com luz suave", "Lapelas + boom", "Tripé", "Gravador externo", "SSD duplo", "Claquete ou sincronização"],
    checklist: ["Definir arco narrativo", "Preparar perguntas abertas", "Confirmar termos de imagem", "Captar ambientes e detalhes", "Organizar transcrições", "Criar plano de montagem"],
  },
  trafego: {
    principles: ["Promessa clara e mensurável", "Prova ou demonstração antes de estética pura", "Variações de gancho melhoram teste A/B", "CTA deve ser objetivo e visual"],
    crew: ["Estrategista/copy", "Diretor de captação", "Editor de performance", "Designer/motion"],
    equipment: ["Câmera/smartphone 4K", "Áudio claro", "Luz simples e consistente", "Tripé/gimbal", "Templates de legenda e CTA"],
    checklist: ["Definir oferta e público", "Criar 3 ganchos", "Gravar demonstração/prova", "Editar variações", "Conferir safe zones", "Exportar formatos para mídia"],
  },
  stories: {
    principles: ["Sequência curta com começo, meio e CTA", "Conteúdo precisa parecer vivo, não burocrático", "Texto na tela deve guiar a ação", "Volume de peças vale mais que excesso de polimento"],
    crew: ["Produtor de conteúdo", "Captador mobile", "Editor vertical", "Social media para publicação"],
    equipment: ["Smartphone/câmera vertical", "Microfone compacto", "Luz portátil", "Tripé pequeno", "Banco de templates"],
    checklist: ["Definir sequência de stories", "Captar bastidores e produto", "Inserir textos curtos", "Revisar ordem e CTA", "Exportar 9:16", "Organizar pasta de publicação"],
  },
};

// ── PRODUCTION PIPELINE ──
export const PRODUCTION_PIPELINE = [
  { key: "briefing", label: "Briefing", docType: "briefing", color: "#3b82f6" },
  { key: "roteiro", label: "Roteiro", docType: "roteiro", color: "#fb923c" },
  { key: "decupagem", label: "Decupagem", docType: "decupagem", color: "#8b5cf6" },
  { key: "callsheet", label: "Callsheet", docType: "callsheet", color: "#f97316" },
  { key: "checklist", label: "Checklist", docType: "checklist", color: "#06b6d4" },
  { key: "entrega", label: "Entrega", docType: "entrega", color: "#10b981" },
];

// ── PREMIUM CHECKLIST CATALOG ──
export const PREMIUM_CHECKLIST_CATALOG = {
  camera: ["Câmera principal testada", "Câmera backup ou plano de contingência", "Baterias carregadas e identificadas", "Cartões formatados e vazios", "Lentes limpas e separadas por cena", "Filtros ND disponíveis", "Tripé/gimbal calibrado", "Monitor externo e cabos testados", "Panos de microfibra e kit limpeza"],
  audio: ["Microfone shotgun testado", "Lapelas carregadas e pareadas", "Gravador externo configurado", "Fones de monitoramento", "Cabos XLR/P2 reserva", "Protetor de vento", "Teste de ruído da locação", "Claquete ou método de sincronização"],
  luz: ["Key light disponível", "Fill/rebatedor separado", "Backlight ou luz de recorte", "Softbox/difusor", "Extensões e filtros de linha", "Baterias ou fonte das luzes", "Gelatinas/CTO/CTB quando necessário", "Checagem de voltagem"],
  producao: ["Callsheet enviado para equipe", "Roteiro/decupagem acessível no set", "Contatos de emergência", "Autorizações de imagem", "Autorização de locação", "Água e alimentação previstos", "Transporte e estacionamento alinhados", "Plano de chuva/imprevisto"],
  dados: ["Estrutura de pastas criada", "SSD/HD principal formatado", "Backup redundante definido", "Leitor de cartões testado", "Nome padrão dos arquivos", "Conferência de mídia antes de apagar cartões", "Upload ou cópia pós-diária planejada"],
  pos: ["Briefing de edição confirmado", "Trilha/licenças organizadas", "Specs de exportação definidas", "Rodadas de revisão combinadas", "Canal de aprovação definido", "Thumbnail/capas previstas", "Arquivos finais e master planejados"],
};

// ── DOC FIELD CONFIG ──
export const DOC_FIELD_CONFIG = {
  briefing: {
    title: "Inteligência do briefing",
    tone: "Documento consultivo, com perguntas de direção e critérios de aprovação.",
    fields: [
      { key: "objective", label: "Objetivo estratégico", placeholder: "O que o filme precisa mudar no público ou no negócio?" },
      { key: "audience", label: "Público e contexto", placeholder: "Quem assiste, em que momento e com qual dor?" },
      { key: "brandMessage", label: "Mensagem central", placeholder: "Uma frase que não pode se perder" },
      { key: "toneOfVoice", label: "Tom de voz", placeholder: "Premium, documental, direto, emocional..." },
      { key: "reference", label: "Referência visual", placeholder: "Campanha, filme, link ou mood" },
      { key: "approvalCriteria", label: "Critério de aprovação", placeholder: "Como saberemos que ficou certo?" },
    ],
    areas: [
      { key: "mandatoryPoints", label: "Pontos obrigatórios", placeholder: "Promessas, provas, produtos, falas ou cenas indispensáveis" },
      { key: "risks", label: "Restrições e riscos", placeholder: "Compliance, linguagem, locação, autorização, prazo" },
    ],
  },
  roteiro: {
    title: "Estrutura narrativa",
    tone: "Formato de roteiro com beats, falas, cenas e direção de ritmo.",
    fields: [
      { key: "logline", label: "Logline", placeholder: "Resumo do vídeo em uma frase" },
      { key: "hook", label: "Gancho inicial", placeholder: "Primeiros 3 a 8 segundos" },
      { key: "format", label: "Formato", placeholder: "9:16, 16:9, manifesto, entrevista..." },
      { key: "duration", label: "Duração alvo", placeholder: "30s, 60s, 3min..." },
      { key: "cta", label: "CTA / fechamento", placeholder: "Ação ou sensação final" },
      { key: "toneOfVoice", label: "Direção de linguagem", placeholder: "Natural, institucional, poético, venda direta..." },
    ],
    areas: [
      { key: "scenes", label: "Cenas / beats", placeholder: "Um beat por linha: abertura, conflito, prova, virada, fechamento" },
      { key: "voiceover", label: "Texto / locução / falas", placeholder: "Falas, narração ou textos de tela" },
    ],
  },
  callsheet: {
    title: "Ordem do dia de set",
    tone: "Documento operacional para equipe, talento, horários, segurança e logística.",
    fields: [
      { key: "shootDate", label: "Data de captação", type: "date" },
      { key: "callTime", label: "Call time", placeholder: "07:30 equipe / 09:00 talento" },
      { key: "wrapTime", label: "Wrap previsto", placeholder: "18:00" },
      { key: "location", label: "Locação", placeholder: "Endereço e ponto de encontro" },
      { key: "producerContact", label: "Contato de produção", placeholder: "Nome + WhatsApp" },
      { key: "safety", label: "Segurança / plano B", placeholder: "Clima, energia, ruído, acesso" },
    ],
    areas: [
      { key: "scheduleRows", label: "Agenda do dia", placeholder: "07:30 montagem de luz\n08:30 teste de áudio\n09:00 cena 1" },
      { key: "talent", label: "Talentos / participantes", placeholder: "Nome, horário, figurino, observações" },
      { key: "crew", label: "Equipe e responsabilidades", placeholder: "Direção, câmera, áudio, produção, assistentes" },
    ],
  },
  decupagem: {
    title: "Plano técnico e cobertura",
    tone: "Decupagem com intenção de câmera, lentes, movimento, áudio e cobertura por cena.",
    fields: [
      { key: "sceneCount", label: "Quantidade de cenas", placeholder: "Ex: 6 cenas + B-roll" },
      { key: "format", label: "Aspect ratio / entrega", placeholder: "16:9 master + cortes 9:16" },
      { key: "lenses", label: "Lentes / captação", placeholder: "24mm, 35mm, 85mm, drone..." },
      { key: "cameraMovement", label: "Movimento de câmera", placeholder: "Tripé, handheld, slider, gimbal" },
      { key: "audioPlan", label: "Plano de áudio", placeholder: "Lapel + boom + ambiente" },
      { key: "reference", label: "Referência de linguagem", placeholder: "Contraste, ritmo, câmera, textura" },
    ],
    areas: [
      { key: "shotList", label: "Lista de planos", placeholder: "Cena 1 | Plano aberto | Contexto da loja | 24mm | Sem fala" },
      { key: "coverageNotes", label: "Cobertura e inserts", placeholder: "Detalhes, textura, mãos, produto, bastidor, reações" },
    ],
  },
  orcamento: {
    title: "Composição comercial",
    tone: "Documento financeiro com categorias, escopo, premissas e condições.",
    fields: [
      { key: "budget", label: "Total proposto (R$)", type: "number" },
      { key: "crewCost", label: "Equipe (R$)", type: "number" },
      { key: "equipmentCost", label: "Equipamento / locação (R$)", type: "number" },
      { key: "postCost", label: "Pós-produção (R$)", type: "number" },
      { key: "paymentTerms", label: "Condições", placeholder: "50% entrada, 50% na entrega" },
      { key: "deadline", label: "Validade / prazo", type: "date" },
    ],
    areas: [
      { key: "scope", label: "Escopo incluído", placeholder: "Entregáveis, diárias, versões, revisão" },
      { key: "assumptions", label: "Premissas e extras", placeholder: "Deslocamento, alteração de escopo, direitos, urgência" },
    ],
  },
  cronograma: {
    title: "Mapa de produção",
    tone: "Linha do tempo com fases, marcos, aprovações e margem de produção.",
    fields: [
      { key: "startDate", label: "Início", type: "date" },
      { key: "shootDate", label: "Captação", type: "date" },
      { key: "firstCutDate", label: "Primeiro corte", type: "date" },
      { key: "deadline", label: "Entrega final", type: "date" },
      { key: "approvalRounds", label: "Rodadas de aprovação", placeholder: "Ex: 2 rodadas" },
      { key: "buffer", label: "Buffer", placeholder: "Ex: 2 dias para ajustes/imprevistos" },
    ],
    areas: [
      { key: "milestones", label: "Marcos do projeto", placeholder: "Briefing aprovado\nRoteiro aprovado\nCaptação\nPrimeiro corte\nFinalização" },
      { key: "dependencies", label: "Dependências", placeholder: "Materiais do cliente, aprovações, agenda de entrevistados" },
    ],
  },
  checklist: {
    title: "Checklist premium de set",
    tone: "Checklist técnico por departamento para reduzir erro antes, durante e depois da diária.",
    fields: [
      { key: "productionType", label: "Tipo de produção", placeholder: "Evento, institucional, doc, campanha..." },
      { key: "cameraPackage", label: "Pacote de câmera", placeholder: "Câmera, lentes, mídia, suporte" },
      { key: "audioPackage", label: "Pacote de áudio", placeholder: "Lapelas, boom, gravador, fones" },
      { key: "lightPackage", label: "Pacote de luz", placeholder: "Key, fill, back, modifiers, energia" },
      { key: "dataWorkflow", label: "Workflow de dados", placeholder: "Cartões, SSD, backup 3-2-1" },
      { key: "producerContact", label: "Responsável", placeholder: "Quem fecha cada etapa" },
    ],
    areas: [
      { key: "preflight", label: "Pré-set", placeholder: "Autorizações, agenda, roteiro, baterias, cartões" },
      { key: "wrapChecklist", label: "Fechamento", placeholder: "Backup, conferência, pendências, devolução, resumo para cliente" },
    ],
  },
  entrega: {
    title: "Relatório de entrega e aceite",
    tone: "Documento final com links, versões, specs, pendências e critérios de aceite.",
    fields: [
      { key: "deliveryLinks", label: "Links de entrega", placeholder: "Drive, Frame.io, Vimeo, pasta final" },
      { key: "formats", label: "Formatos entregues", placeholder: "MP4 H.264, 4K, 1080p, 9:16, legendado" },
      { key: "versions", label: "Versões", placeholder: "Master, teaser, cortes sociais, thumbnails" },
      { key: "storagePolicy", label: "Arquivamento", placeholder: "Prazo e local de backup" },
      { key: "acceptanceCriteria", label: "Critério de aceite", placeholder: "Prazo de revisão final e condições" },
      { key: "deadline", label: "Data da entrega", type: "date" },
    ],
    areas: [
      { key: "deliveryNotes", label: "Observações de entrega", placeholder: "Pendências, orientações de publicação, próximos passos" },
      { key: "scope", label: "Itens entregues", placeholder: "Um item por linha" },
    ],
  },
};

// ── RELATIONSHIP TYPES ──
export const RELATIONSHIP_TYPES = [
  { id: "all", label: "Todos", color: C.orange, desc: "Carteira completa" },
  { id: "cliente", label: "Clientes", color: "#10b981", desc: "Venda pontual ou lead" },
  { id: "recorrente", label: "Recorrentes", color: "#3b82f6", desc: "Mensalidade e contrato" },
  { id: "parceria", label: "Parcerias / Permutas", color: "#8b5cf6", desc: "Troca, collab ou indicação" },
  { id: "freelancer", label: "Freelancers", color: "#eab308", desc: "Equipe externa" },
];

// ── NAVIGATION ──
export const TABS = [
  { id: "dashboard", label: "Hoje", icon: "⊞" },
  { id: "gsd", label: "GSD", icon: "G" },
  { id: "tasks", label: "Atividades", icon: "✓" },
  { id: "agenda", label: "Agenda", icon: "□" },
  { id: "clients", label: "Clientes", icon: "◈" },
  { id: "projects", label: "Projetos", icon: "▦" },
  { id: "videoReview", label: "Video Review", icon: "▶" },
  { id: "studio", label: "Documentos", icon: "▣" },
  { id: "brandbook", label: "Brand Book", icon: "◩" },
  { id: "finance", label: "Caixa", icon: "◆" },
  { id: "proposta", label: "Propostas", icon: "§" },
  { id: "business", label: "Negócio", icon: "◒" },
  { id: "export", label: "Relatórios", icon: "▤" },
];

export const NAV_GROUPS = [
  { label: "Produto principal", items: ["videoReview"] },
  { label: "Operação", items: ["dashboard", "gsd", "tasks", "agenda", "projects", "studio", "brandbook"] },
  { label: "Comercial", items: ["clients", "proposta", "finance"] },
  { label: "Sistema", items: ["business", "export"] },
];

export const BEGINNER_TABS = ["dashboard", "gsd", "videoReview", "clients", "proposta", "projects", "studio", "brandbook", "finance", "tasks", "business", "export"];
export const WORKSPACE_TAB_IDS = new Set(BEGINNER_TABS);

export const PROFILE_PRESETS = [
  { id: "filmmaker", label: "Filmmaker", type: "Filmmaker / produtor audiovisual", services: ["Vídeo Institucional", "Reels", "Eventos", "Drone"], ticket: 2500, first: "Cadastrar cliente e criar projeto de captação." },
  { id: "editor", label: "Editor", type: "Editor de vídeo", services: ["Edição de Reels", "Edição para YouTube", "Motion simples", "Pacote mensal"], ticket: 1200, first: "Cadastrar cliente recorrente e acompanhar revisões." },
  { id: "studio", label: "Produtora", type: "Produtora audiovisual", services: ["Institucional", "Campanha", "Evento", "Conteúdo mensal"], ticket: 5000, first: "Organizar pipeline, callsheet e financeiro por projeto." },
  { id: "agency", label: "Agência / Social", type: "Agência criativa / social media", services: ["Conteúdo mensal", "Tráfego criativo", "Stories", "Campanhas"], ticket: 3500, first: "Separar clientes mensais, demandas e entregas." },
];
