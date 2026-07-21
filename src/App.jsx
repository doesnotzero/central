import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ErrorBoundary } from './components/system/ErrorBoundary.jsx';
import { loadAppState, saveAppState } from './services/appStateService.js';
import { getSupabase } from './services/supabaseClient.js';
import { isAdminSession } from './services/permissions.js';
import { ChipSelector } from './components/form-fields/ChipSelector.jsx';
import { CurrencyInput } from './components/form-fields/CurrencyInput.jsx';
import { MaskedInput } from './components/form-fields/MaskedInput.jsx';
import { OptionCards } from './components/form-fields/OptionCards.jsx';
import { LandingPage, LoginPage } from './LandingPage.jsx';
import { BRANDING, DEFAULT_BUSINESS_CONFIG } from './config/branding';
import ModularTabAgenda from './tabs/TabAgenda.jsx';
import ModularTabBusinessSettings, { OnboardingGuide as ModularOnboardingGuide, SecurityPanel as ModularSecurityPanel } from './tabs/TabBusinessSettings.jsx';
import ModularTabClients from './tabs/TabClients.jsx';
import ModularTabDashboard from './tabs/TabDashboard.jsx';
import ModularTabExport from './tabs/TabExport.jsx';
import ModularTabProjects from './tabs/TabProjects.jsx';
import ModularTabProposta from './tabs/TabProposta.jsx';
import ModularTabTasks from './tabs/TabTasks.jsx';
import './workspace.css';

const TabVideoReview = React.lazy(() => import('./tabs/TabVideoReview.jsx'));
const TabStudioDocs = React.lazy(() => import('./tabs/TabStudioDocs.jsx'));
const TabFinance = React.lazy(() => import('./tabs/TabFinance.jsx'));
const TabBrandBook = React.lazy(() => import('./tabs/TabBrandBook.jsx'));
const CommandPalette = React.lazy(() => import('./components/CommandPalette.jsx'));

// ── STORAGE ────────────────────────────────────────────────────────────
const SK = "dnz_central_v1";
const IDLE_LOCK_MS = 5 * 60 * 1000;
const APP_NAME = BRANDING.appName;
const APP_SUBTITLE = BRANDING.appSubtitle;
const SALES_EMAIL = BRANDING.salesEmail;
const SALES_WHATSAPP = BRANDING.salesWhatsapp;
const DEFAULT_SUBSCRIPTION = {
  plan:"admin",
  status:"active",
  source:"admin",
  startedAt:new Date().toISOString(),
  expiresAt:null,
  updatedAt:new Date().toISOString()
};
const DEFAULT_BUSINESS = {
  ...DEFAULT_BUSINESS_CONFIG
};
const persist = (s) => { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} };
const hydrate = () => { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } };
const normalizeBusiness = b => {
  const next={...DEFAULT_BUSINESS,...(b||{})};
  const legacyBrands=["central"+"is","ne"+"xo","ne"+"xo studio"];
  if(legacyBrands.includes(String(next.brandName||"").toLowerCase()))next.brandName=BRANDING.brandName;
  return next;
};

// ── CONSTANTS ──────────────────────────────────────────────────────────
const QUOTES = [
  "O caos gera ideias. A disciplina constrói o legado.",
  "Consistência vence motivação.",
  "Visão clara + Execução consistente = Legado.",
  "Proteja sua energia criativa.",
  "Menos perfeição, mais progresso.",
  "Cada dia é uma chance de construir algo que dura.",
  "Foque no processo. O resultado vem.",
];
const XP_TABLE = { habit: 50, task: 30 };
const LEVELS = [
  { min: 0,    name: "Iniciante",    color: "#6b7280" },
  { min: 200,  name: "Consistente",  color: "#10b981" },
  { min: 500,  name: "Focado",       color: "#3b82f6" },
  { min: 1000, name: "Disciplinado", color: "#8b5cf6" },
  { min: 2000, name: "Imparável",    color: "#f97316" },
  { min: 4000, name: "Lendário",     color: "#eab308" },
];
const BADGES = [
  { id:"first_habit", icon:"🌱", label:"Primeiro Passo", req: s=>s.totalHabitsCompleted>=1 },
  { id:"streak7",     icon:"🔥", label:"Semana de Fogo", req: s=>s.habits.some(h=>h.streak>=7) },
  { id:"streak30",    icon:"💎", label:"Diamante",       req: s=>s.habits.some(h=>h.streak>=30) },
  { id:"tasks10",     icon:"⚡", label:"Executor",       req: s=>s.totalTasksCompleted>=10 },
  { id:"xp500",       icon:"🚀", label:"Decolando",      req: s=>s.xp>=500 },
  { id:"goals5",      icon:"🎯", label:"Estrategista",   req: s=>s.goals.length>=5 },
  { id:"client3",     icon:"🤝", label:"Networking",     req: s=>(s.clients||[]).length>=3 },
  { id:"note10",      icon:"📝", label:"Cronista",       req: s=>s.notes.length>=10 },
  { id:"focus10",     icon:"🧠", label:"Modo Foco",      req: s=>(s.focusSessions||0)>=10 },
];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const C = {
  bg:"#0d0d0d", surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.07)",
  orange:BRANDING.primaryColor, orangeD:BRANDING.primaryColorDark||BRANDING.primaryColor, red:BRANDING.primaryColor, text:"#e8e8e8", muted:"#666", faint:"#2a2a2a"
};
const CLIENT_PIPELINE = [
  {key:"lead",label:"Lead",color:"#3b82f6"},
  {key:"briefing",label:"Briefing",color:"#8b5cf6"},
  {key:"proposta_enviada",label:"Proposta enviada",color:"#eab308"},
  {key:"em_producao",label:"Em produção",color:"#ff2400"},
  {key:"entregue",label:"Entregue",color:"#10b981"},
  {key:"pago",label:"Pago",color:"#06b6d4"}
];
const normalizeClientStatus = c => {
  const s = (c?.status||"lead").toLowerCase();
  if(["prospecto","lead"].includes(s))return "lead";
  if(["ativo","contato","briefing"].includes(s))return "briefing";
  if(["proposta","proposal","proposta_enviada","enviada"].includes(s))return "proposta_enviada";
  if(["pausado","producao","produção","em_producao","em produção","recorrente"].includes(s))return "em_producao";
  if(["concluido","concluído","entregue"].includes(s))return "entregue";
  if(["pago","paid"].includes(s))return "pago";
  return "lead";
};
const clientStageLabel = c => CLIENT_PIPELINE.find(stage=>stage.key===normalizeClientStatus(c))?.label || "Lead";
const STATUS_COLORS = Object.fromEntries(CLIENT_PIPELINE.map(s=>[s.key,s.color]));
const PAG_COLORS    = { pago:"#10b981", pendente:"#eab308", atrasado:"#ef4444", parcial:"#f97316" };
const VIDEO_STATUS  = ["pendente","gravando","editando","revisão","entregue"];
const VIDEO_COLORS  = { pendente:C.muted, gravando:"#3b82f6", editando:"#8b5cf6", "revisão":"#eab308", entregue:"#10b981" };
const TEMP_COLORS   = { frio:"#3b82f6", morno:"#eab308", quente:"#ef4444" };

const SERVICES_CATALOG = [
  { id:"reel",          name:"Reel / Short",            desc:"Vídeo vertical para redes sociais",  price:800  },
  { id:"institucional", name:"Vídeo Institucional",     desc:"Apresentação da empresa/marca",      price:3500 },
  { id:"edicao",        name:"Edição de Vídeo",         desc:"Edição de material fornecido",       price:600  },
  { id:"motion",        name:"Motion Graphics",         desc:"Animações e gráficos em movimento",  price:1200 },
  { id:"drone",         name:"Filmagem com Drone",      desc:"Captação aérea profissional",        price:1500 },
  { id:"doc",           name:"Mini Documentário",       desc:"Documentário de 5–15 minutos",       price:5000 },
  { id:"foto",          name:"Ensaio Fotográfico",      desc:"Sessão de fotos profissional",       price:1200 },
  { id:"stories",       name:"Pack de Stories",         desc:"10 stories editados e entregues",    price:500  },
  { id:"trafego",       name:"Criativo para Tráfego",  desc:"Vídeo otimizado para anúncios",      price:900  },
  { id:"evento",        name:"Cobertura de Evento",     desc:"Filmagem + edição do evento",        price:2500 },
  { id:"identidade",    name:"Identidade Visual",       desc:"Logo, paleta, tipografia",           price:2800 },
  { id:"roteiro",       name:"Roteiro / Copywriting",   desc:"Criação de roteiro e copy",          price:700  },
];
const AUDIOVISUAL_PRESETS = [
  { id:"reel", label:"Reel premium", title:"Reel premium", type:"vertical", service:"Reel / Short", value:800, checklist:["Gancho","Roteiro curto","Captação vertical","Edição dinâmica","Legenda","Aprovação","Publicação"] },
  { id:"institucional", label:"Institucional", title:"Vídeo institucional", type:"gravação", service:"Vídeo Institucional", value:3500, checklist:["Briefing","Roteiro","Decupagem","Captação","Edição","Motion","Revisão","Entrega"] },
  { id:"evento", label:"Evento", title:"Cobertura de evento", type:"evento", service:"Cobertura de Evento", value:2500, checklist:["Briefing","Cronograma","Lista de takes","Captação","Seleção","Edição","Entrega"] },
  { id:"edicao", label:"Edição", title:"Edição de vídeo", type:"edição", service:"Edição de Vídeo", value:600, checklist:["Receber arquivos","Organizar mídia","Corte bruto","Trilha e efeitos","Color","Revisão","Exportação"] },
  { id:"drone", label:"Drone", title:"Filmagem com drone", type:"drone", service:"Filmagem com Drone", value:1500, checklist:["Autorização do local","Plano de voo","Captação aérea","Backup","Seleção","Entrega"] },
  { id:"doc", label:"Mini doc", title:"Mini documentário", type:"documentário", service:"Mini Documentário", value:5000, checklist:["Pesquisa","Entrevistas","Roteiro documental","Captação","Montagem","Color e som","Revisão","Entrega"] },
  { id:"trafego", label:"Criativo ads", title:"Criativo para tráfego", type:"ads", service:"Criativo para Tráfego", value:900, checklist:["Objetivo da campanha","Gancho","Roteiro direto","Captação ou assets","Edição com CTA","Variações","Entrega"] },
  { id:"stories", label:"Stories", title:"Pack de stories", type:"vertical", service:"Pack de Stories", value:500, checklist:["Pauta","Roteiro curto","Assets","Edição vertical","Legendas","Aprovação","Entrega"] },
];
const NICHE_PLAYBOOKS = [
  {
    id:"clinica",
    niche:"Clínicas e estética",
    promise:"Gerar confiança, autoridade e agenda cheia com prova visual.",
    color:"#10b981",
    presetId:"reel",
    service:"Reel / Short",
    value:2400,
    leadSource:"Indicação / Instagram",
    nextAction:"Enviar roteiro de autoridade e exemplos de antes/depois",
    tasks:["Mapear procedimentos com maior margem","Criar roteiro de autoridade do especialista","Separar provas sociais e depoimentos","Definir CTA para agendamento","Montar pacote mensal de reels"],
    offer:["4 reels de autoridade","2 vídeos de prova social","1 vídeo institucional curto","Roteiros com CTA para WhatsApp"],
    notes:"Nicho sensível: evitar promessas médicas, usar prova social real e aprovação do cliente."
  },
  {
    id:"imobiliario",
    niche:"Imobiliárias e corretores",
    promise:"Transformar imóveis em percepção de valor e captação de leads.",
    color:"#3b82f6",
    presetId:"drone",
    service:"Filmagem com Drone",
    value:3500,
    leadSource:"Parceria local",
    nextAction:"Solicitar endereço, diferenciais do imóvel e janela de captação",
    tasks:["Listar imóveis prioritários","Definir narrativa do imóvel","Separar pontos de bairro e lifestyle","Planejar drone e takes internos","Criar versão vertical para anúncios"],
    offer:["Vídeo principal do imóvel","Drone e lifestyle","3 cortes verticais","Fotos/capas para anúncio"],
    notes:"Nicho forte para recorrência por carteira de imóveis e parceria mensal."
  },
  {
    id:"restaurante",
    niche:"Restaurantes e gastronomia",
    promise:"Aumentar desejo, frequência e ticket com conteúdo sensorial.",
    color:"#f97316",
    presetId:"stories",
    service:"Pack de Stories",
    value:1800,
    leadSource:"Prospecção local",
    nextAction:"Marcar visita para captar pratos campeões e bastidores",
    tasks:["Escolher pratos com maior margem","Criar lista de takes sensoriais","Definir promoções da semana","Captar bastidores e equipe","Programar sequência de stories"],
    offer:["Pack semanal de stories","Reels de pratos campeões","Captação de bastidores","Criativos para campanha local"],
    notes:"Nicho visual e recorrente; vender pacote mensal simplifica produção."
  },
  {
    id:"evento",
    niche:"Eventos e experiências",
    promise:"Registrar energia do evento e vender a próxima edição.",
    color:"#8b5cf6",
    presetId:"evento",
    service:"Cobertura de Evento",
    value:4500,
    leadSource:"Networking / produtoras",
    nextAction:"Pedir cronograma, atrações e momentos obrigatórios",
    tasks:["Mapear momentos imperdíveis","Confirmar credenciais e acesso","Criar lista de takes por horário","Planejar entrega rápida pós-evento","Separar cortes para patrocinadores"],
    offer:["Aftermovie principal","Entrega expressa de melhores momentos","Cortes verticais","Pacote para patrocinadores"],
    notes:"Nicho exige prazo curto; diferencial é velocidade de entrega e organização."
  }
];
const audiovisualChecklistText = p => (p?.checklist||["Briefing","Roteiro","Captação","Edição","Revisão","Entrega"]).join("\n");
const addDaysInput = days => {const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);};
const presetById = id => AUDIOVISUAL_PRESETS.find(p=>p.id===id)||AUDIOVISUAL_PRESETS.find(p=>p.type===id)||AUDIOVISUAL_PRESETS[1];
const presetDeliverables = p => {
  const map={
    reel:["1 vídeo vertical 9:16","Capa/thumbnail","Legenda revisada","Arquivo final em MP4"],
    institucional:["Vídeo principal 16:9","Versão curta para redes","Thumbnail","Arquivo final em alta"],
    evento:["Aftermovie","Cortes curtos para redes","Seleção de melhores takes","Arquivo final em alta"],
    edicao:["Corte final","Versão com legenda","Arquivo editável quando combinado","Exportação em MP4"],
    drone:["Takes aéreos tratados","Vídeo final com drone","Banco de imagens aéreas","Arquivo final em alta"],
    doc:["Mini documentário","Teaser curto","Cortes de entrevista","Arquivo master"],
    trafego:["Criativo principal","2 variações de gancho","Versão com legenda","Arquivo pronto para anúncios"],
    stories:["10 stories editados","Capa visual","Textos/legendas","Arquivos verticais"]
  };
  return (map[p?.id]||["Vídeo final","Versão para redes","Thumbnail","Arquivo final"]).map(text=>({text,done:false}));
};
const presetBriefing = p => ({
  objective:p?.id==="trafego"?"Gerar conversão com mensagem direta":p?.id==="doc"?"Contar uma história com narrativa forte":"Apresentar a marca com clareza e impacto",
  audience:"",
  reference:"",
  duration:p?.id==="reel"||p?.id==="stories"?"15-45s":p?.id==="doc"?"5-15 min":"60-120s",
  format:p?.type||"gravação",
  location:"",
  shootDate:"",
  notes:""
});
const presetSchedule = (p,deadline="") => [
  {key:"briefing",label:"Briefing aprovado",date:addDaysInput(1),done:false},
  {key:"script",label:"Roteiro / plano",date:addDaysInput(3),done:false},
  {key:"capture",label:p?.type==="edição"?"Arquivos recebidos":"Captação",date:addDaysInput(6),done:false},
  {key:"firstCut",label:"Primeira versão",date:addDaysInput(10),done:false},
  {key:"review",label:"Revisão do cliente",date:addDaysInput(12),done:false},
  {key:"delivery",label:"Entrega final",date:deadline||addDaysInput(14),done:false},
];
const buildVideoProject = form => {
  const p=presetById(form.presetId)||AUDIOVISUAL_PRESETS.find(x=>x.title===form.title)||AUDIOVISUAL_PRESETS[1];
  return {
    title:form.title||p.title,
    type:form.type||p.type,
    status:"pendente",
    deadline:form.deadline||"",
    link:form.link||"",
    presetId:p.id,
    checklist:(form.checklist||p.checklist||[]).map(text=>typeof text==="string"?{text,done:false}:text),
    deliverables:presetDeliverables(p),
    productionSchedule:presetSchedule(p,form.deadline),
    briefing:presetBriefing(p),
    productionPipeline:{briefing:false,roteiro:false,decupagem:false,callsheet:false,checklist:false,entrega:false},
    premiumChecklist:buildPremiumChecklist(p.id),
    links:{briefing:"",drive:form.link||"",reference:"",review:"",delivery:""}
  };
};
const STUDIO_DOCUMENTS = [
  {id:"briefing",label:"Briefing",color:"#3b82f6",desc:"Objetivo, público, narrativa, formato, referências e critérios de aprovação."},
  {id:"roteiro",label:"Roteiro",color:"#fb923c",desc:"Estrutura narrativa, cenas, mensagem-chave, falas, CTA e direção de ritmo."},
  {id:"callsheet",label:"Callsheet",color:"#f97316",desc:"Ordem do dia, equipe, locação, horários, contatos, segurança e necessidades técnicas."},
  {id:"decupagem",label:"Decupagem",color:"#8b5cf6",desc:"Sequência de planos, intenção de câmera, lentes, áudio, movimento e cobertura."},
  {id:"orcamento",label:"Orçamento",color:"#10b981",desc:"Categorias de produção, equipe, equipamento, pós, taxas, reservas e condições."},
  {id:"cronograma",label:"Cronograma",color:"#eab308",desc:"Pré-produção, captação, pós-produção, revisão, aprovações e entrega final."},
  {id:"checklist",label:"Checklist de Set",color:"#06b6d4",desc:"Câmera, luz, áudio, produção, dados, autorizações e fechamento de set."},
  {id:"entrega",label:"Relatório de Entrega",color:"#ef4444",desc:"Arquivos finais, formatos, versões, pendências, armazenamento e aceite."},
];
const PRODUCTION_KNOWLEDGE = {
  reel:{
    principles:["Gancho forte nos 3 primeiros segundos","Mensagem única por peça","Ritmo visual pensado para retenção mobile","Legenda e CTA visíveis sem depender de áudio"],
    crew:["Direção/produção enxuta","Operador de câmera vertical","Editor com domínio de cortes rápidos","Assistente para making of e organização"],
    equipment:["Câmera ou smartphone com captação 4K","Microfone de lapela quando houver fala","Luz LED portátil ou luz natural controlada","Gimbal/tripé compacto","Backup imediato dos arquivos"],
    checklist:["Confirmar roteiro curto e CTA","Testar áudio antes da gravação","Captar takes de segurança","Gravar variações de gancho","Exportar em 9:16 H.264 MP4","Validar capa e legenda"]
  },
  institucional:{
    principles:["Narrativa de confiança antes de lista de serviços","Depoimentos e provas visuais aumentam autoridade","Cobertura ampla para versões longas e curtas","Identidade visual consistente em cor, trilha e grafismo"],
    crew:["Diretor/roteirista","Diretor de fotografia","Produtor de set","Operador de áudio","Editor e motion designer"],
    equipment:["Câmera principal + backup","Kit de lentes wide/normal/tele","Iluminação key/fill/back","Microfone boom + lapelas","Monitor externo","Tripé/gimbal","HD/SSD de backup"],
    checklist:["Aprovar roteiro e perguntas","Revisar autorizações de imagem","Separar ambientes limpos","Confirmar agenda de entrevistados","Checar ruídos da locação","Duplicar mídia ao final da diária"]
  },
  evento:{
    principles:["Priorizar momentos irrepetíveis","Captar energia, bastidores, público e patrocinadores","Planejar entregas rápidas para pós-evento","Ter redundância de bateria, cartões e áudio"],
    crew:["Produtor de campo","Cinegrafista principal","Segundo câmera ou drone quando aplicável","Editor para highlights","Assistente de mídia"],
    equipment:["Duas câmeras quando possível","Lentes claras","Microfone direcional","Estabilizador","Luz on-camera","Cartões extras","Power banks","Notebook/SSD para backup"],
    checklist:["Receber cronograma oficial","Mapear momentos obrigatórios","Confirmar credenciais","Definir ponto de backup","Captar aberturas, público e encerramento","Entregar teaser rápido"]
  },
  edicao:{
    principles:["Organização de mídia antes de corte","Primeiro corte resolve narrativa, não acabamento","Revisão precisa ter rodada e prazo definidos","Exportação deve seguir canal de distribuição"],
    crew:["Editor","Assistente de mídia","Colorista quando necessário","Designer de som/motion conforme escopo"],
    equipment:["Estação de edição atualizada","HDs redundantes","Projeto com estrutura de pastas","Preset de exportação validado","Biblioteca de trilhas licenciadas"],
    checklist:["Receber todos os arquivos","Conferir specs e FPS","Organizar proxies se necessário","Montar corte bruto","Aplicar cor, som e grafismos","Exportar master e versões"]
  },
  drone:{
    principles:["Segurança e autorização vêm antes da estética","Plano de voo reduz risco e perda de tempo","Takes aéreos devem servir à narrativa","Clima e vento definem janela real de captação"],
    crew:["Piloto de drone","Observador/assistente","Produtor de locação","Editor para seleção e estabilização"],
    equipment:["Drone revisado","Baterias carregadas","Cartões formatados","Filtros ND","Landing pad","Checklist de segurança","Seguro/autorização quando aplicável"],
    checklist:["Checar clima e restrições","Confirmar autorização do local","Inspecionar hélices e sensores","Definir rota e altitude","Captar takes de segurança","Backup imediato"]
  },
  doc:{
    principles:["Pesquisa e recorte narrativo comandam a filmagem","Entrevistas precisam de escuta e silêncio","B-roll sustenta emoção e contexto","Arquivo e direitos devem ser organizados desde o início"],
    crew:["Diretor/documentarista","Produtor de pesquisa","Diretor de fotografia","Operador de áudio","Montador","Color/som"],
    equipment:["Câmera principal + backup","Kit entrevista com luz suave","Lapelas + boom","Tripé","Gravador externo","SSD duplo","Claquete ou sincronização"],
    checklist:["Definir arco narrativo","Preparar perguntas abertas","Confirmar termos de imagem","Captar ambientes e detalhes","Organizar transcrições","Criar plano de montagem"]
  },
  trafego:{
    principles:["Promessa clara e mensurável","Prova ou demonstração antes de estética pura","Variações de gancho melhoram teste A/B","CTA deve ser objetivo e visual"],
    crew:["Estrategista/copy","Diretor de captação","Editor de performance","Designer/motion"],
    equipment:["Câmera/smartphone 4K","Áudio claro","Luz simples e consistente","Tripé/gimbal","Templates de legenda e CTA"],
    checklist:["Definir oferta e público","Criar 3 ganchos","Gravar demonstração/prova","Editar variações","Conferir safe zones","Exportar formatos para mídia"]
  },
  stories:{
    principles:["Sequência curta com começo, meio e CTA","Conteúdo precisa parecer vivo, não burocrático","Texto na tela deve guiar a ação","Volume de peças vale mais que excesso de polimento"],
    crew:["Produtor de conteúdo","Captador mobile","Editor vertical","Social media para publicação"],
    equipment:["Smartphone/câmera vertical","Microfone compacto","Luz portátil","Tripé pequeno","Banco de templates"],
    checklist:["Definir sequência de stories","Captar bastidores e produto","Inserir textos curtos","Revisar ordem e CTA","Exportar 9:16","Organizar pasta de publicação"]
  }
};
const PRODUCTION_PIPELINE = [
  {key:"briefing",label:"Briefing",docType:"briefing",color:"#3b82f6"},
  {key:"roteiro",label:"Roteiro",docType:"roteiro",color:"#fb923c"},
  {key:"decupagem",label:"Decupagem",docType:"decupagem",color:"#8b5cf6"},
  {key:"callsheet",label:"Callsheet",docType:"callsheet",color:"#f97316"},
  {key:"checklist",label:"Checklist",docType:"checklist",color:"#06b6d4"},
  {key:"entrega",label:"Entrega",docType:"entrega",color:"#10b981"},
];
const PREMIUM_CHECKLIST_CATALOG = {
  camera:["Câmera principal testada","Câmera backup ou plano de contingência","Baterias carregadas e identificadas","Cartões formatados e vazios","Lentes limpas e separadas por cena","Filtros ND disponíveis","Tripé/gimbal calibrado","Monitor externo e cabos testados","Panos de microfibra e kit limpeza"],
  audio:["Microfone shotgun testado","Lapelas carregadas e pareadas","Gravador externo configurado","Fones de monitoramento","Cabos XLR/P2 reserva","Protetor de vento","Teste de ruído da locação","Claquete ou método de sincronização"],
  luz:["Key light disponível","Fill/rebatedor separado","Backlight ou luz de recorte","Softbox/difusor","Extensões e filtros de linha","Baterias ou fonte das luzes","Gelatinas/CTO/CTB quando necessário","Checagem de voltagem"],
  producao:["Callsheet enviado para equipe","Roteiro/decupagem acessível no set","Contatos de emergência","Autorizações de imagem","Autorização de locação","Água e alimentação previstos","Transporte e estacionamento alinhados","Plano de chuva/imprevisto"],
  dados:["Estrutura de pastas criada","SSD/HD principal formatado","Backup redundante definido","Leitor de cartões testado","Nome padrão dos arquivos","Conferência de mídia antes de apagar cartões","Upload ou cópia pós-diária planejada"],
  pos:["Briefing de edição confirmado","Trilha/licenças organizadas","Specs de exportação definidas","Rodadas de revisão combinadas","Canal de aprovação definido","Thumbnail/capas previstas","Arquivos finais e master planejados"]
};
const buildPremiumChecklist = presetId => {
  const profile=productionProfile(presetId);
  return Object.fromEntries(Object.entries(PREMIUM_CHECKLIST_CATALOG).map(([key,items])=>[
    key,
    [...items,...(key==="producao"?(profile?.checklist||[]):[])].filter((v,i,a)=>a.indexOf(v)===i).map(text=>({text,done:false}))
  ]));
};
const studioEsc = v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const studioDate = v=>v?new Date(v+"T00:00").toLocaleDateString("pt-BR"):"A definir";
const studioLines = v=>String(v||"").split(/\n|,/).map(x=>x.trim()).filter(Boolean);
const studioDocById = id=>STUDIO_DOCUMENTS.find(d=>d.id===id)||STUDIO_DOCUMENTS[0];
const DOC_FIELD_CONFIG = {
  briefing:{
    title:"Inteligência do briefing",
    tone:"Documento consultivo, com perguntas de direção e critérios de aprovação.",
    fields:[
      {key:"objective",label:"Objetivo estratégico",placeholder:"O que o filme precisa mudar no público ou no negócio?"},
      {key:"audience",label:"Público e contexto",placeholder:"Quem assiste, em que momento e com qual dor?"},
      {key:"brandMessage",label:"Mensagem central",placeholder:"Uma frase que não pode se perder"},
      {key:"toneOfVoice",label:"Tom de voz",placeholder:"Premium, documental, direto, emocional..."},
      {key:"reference",label:"Referência visual",placeholder:"Campanha, filme, link ou mood"},
      {key:"approvalCriteria",label:"Critério de aprovação",placeholder:"Como saberemos que ficou certo?"}
    ],
    areas:[
      {key:"mandatoryPoints",label:"Pontos obrigatórios",placeholder:"Promessas, provas, produtos, falas ou cenas indispensáveis"},
      {key:"risks",label:"Restrições e riscos",placeholder:"Compliance, linguagem, locação, autorização, prazo"}
    ]
  },
  roteiro:{
    title:"Estrutura narrativa",
    tone:"Formato de roteiro com beats, falas, cenas e direção de ritmo.",
    fields:[
      {key:"logline",label:"Logline",placeholder:"Resumo do vídeo em uma frase"},
      {key:"hook",label:"Gancho inicial",placeholder:"Primeiros 3 a 8 segundos"},
      {key:"format",label:"Formato",placeholder:"9:16, 16:9, manifesto, entrevista..."},
      {key:"duration",label:"Duração alvo",placeholder:"30s, 60s, 3min..."},
      {key:"cta",label:"CTA / fechamento",placeholder:"Ação ou sensação final"},
      {key:"toneOfVoice",label:"Direção de linguagem",placeholder:"Natural, institucional, poético, venda direta..."}
    ],
    areas:[
      {key:"scenes",label:"Cenas / beats",placeholder:"Um beat por linha: abertura, conflito, prova, virada, fechamento"},
      {key:"voiceover",label:"Texto / locução / falas",placeholder:"Falas, narração ou textos de tela"}
    ]
  },
  callsheet:{
    title:"Ordem do dia de set",
    tone:"Documento operacional para equipe, talento, horários, segurança e logística.",
    fields:[
      {key:"shootDate",label:"Data de captação",type:"date"},
      {key:"callTime",label:"Call time",placeholder:"07:30 equipe / 09:00 talento"},
      {key:"wrapTime",label:"Wrap previsto",placeholder:"18:00"},
      {key:"location",label:"Locação",placeholder:"Endereço e ponto de encontro"},
      {key:"producerContact",label:"Contato de produção",placeholder:"Nome + WhatsApp"},
      {key:"safety",label:"Segurança / plano B",placeholder:"Clima, energia, ruído, acesso"}
    ],
    areas:[
      {key:"scheduleRows",label:"Agenda do dia",placeholder:"07:30 montagem de luz\n08:30 teste de áudio\n09:00 cena 1"},
      {key:"talent",label:"Talentos / participantes",placeholder:"Nome, horário, figurino, observações"},
      {key:"crew",label:"Equipe e responsabilidades",placeholder:"Direção, câmera, áudio, produção, assistentes"}
    ]
  },
  decupagem:{
    title:"Plano técnico e cobertura",
    tone:"Decupagem com intenção de câmera, lentes, movimento, áudio e cobertura por cena.",
    fields:[
      {key:"sceneCount",label:"Quantidade de cenas",placeholder:"Ex: 6 cenas + B-roll"},
      {key:"format",label:"Aspect ratio / entrega",placeholder:"16:9 master + cortes 9:16"},
      {key:"lenses",label:"Lentes / captação",placeholder:"24mm, 35mm, 85mm, drone..."},
      {key:"cameraMovement",label:"Movimento de câmera",placeholder:"Tripé, handheld, slider, gimbal"},
      {key:"audioPlan",label:"Plano de áudio",placeholder:"Lapel + boom + ambiente"},
      {key:"reference",label:"Referência de linguagem",placeholder:"Contraste, ritmo, câmera, textura"}
    ],
    areas:[
      {key:"shotList",label:"Lista de planos",placeholder:"Cena 1 | Plano aberto | Contexto da loja | 24mm | Sem fala"},
      {key:"coverageNotes",label:"Cobertura e inserts",placeholder:"Detalhes, textura, mãos, produto, bastidor, reações"}
    ]
  },
  orcamento:{
    title:"Composição comercial",
    tone:"Documento financeiro com categorias, escopo, premissas e condições.",
    fields:[
      {key:"budget",label:"Total proposto (R$)",type:"number"},
      {key:"crewCost",label:"Equipe (R$)",type:"number"},
      {key:"equipmentCost",label:"Equipamento / locação (R$)",type:"number"},
      {key:"postCost",label:"Pós-produção (R$)",type:"number"},
      {key:"paymentTerms",label:"Condições",placeholder:"50% entrada, 50% na entrega"},
      {key:"deadline",label:"Validade / prazo",type:"date"}
    ],
    areas:[
      {key:"scope",label:"Escopo incluído",placeholder:"Entregáveis, diárias, versões, revisão"},
      {key:"assumptions",label:"Premissas e extras",placeholder:"Deslocamento, alteração de escopo, direitos, urgência"}
    ]
  },
  cronograma:{
    title:"Mapa de produção",
    tone:"Linha do tempo com fases, marcos, aprovações e margem de produção.",
    fields:[
      {key:"startDate",label:"Início",type:"date"},
      {key:"shootDate",label:"Captação",type:"date"},
      {key:"firstCutDate",label:"Primeiro corte",type:"date"},
      {key:"deadline",label:"Entrega final",type:"date"},
      {key:"approvalRounds",label:"Rodadas de aprovação",placeholder:"Ex: 2 rodadas"},
      {key:"buffer",label:"Buffer",placeholder:"Ex: 2 dias para ajustes/imprevistos"}
    ],
    areas:[
      {key:"milestones",label:"Marcos do projeto",placeholder:"Briefing aprovado\nRoteiro aprovado\nCaptação\nPrimeiro corte\nFinalização"},
      {key:"dependencies",label:"Dependências",placeholder:"Materiais do cliente, aprovações, agenda de entrevistados"}
    ]
  },
  checklist:{
    title:"Checklist premium de set",
    tone:"Checklist técnico por departamento para reduzir erro antes, durante e depois da diária.",
    fields:[
      {key:"productionType",label:"Tipo de produção",placeholder:"Evento, institucional, doc, campanha..."},
      {key:"cameraPackage",label:"Pacote de câmera",placeholder:"Câmera, lentes, mídia, suporte"},
      {key:"audioPackage",label:"Pacote de áudio",placeholder:"Lapelas, boom, gravador, fones"},
      {key:"lightPackage",label:"Pacote de luz",placeholder:"Key, fill, back, modifiers, energia"},
      {key:"dataWorkflow",label:"Workflow de dados",placeholder:"Cartões, SSD, backup 3-2-1"},
      {key:"producerContact",label:"Responsável",placeholder:"Quem fecha cada etapa"}
    ],
    areas:[
      {key:"preflight",label:"Pré-set",placeholder:"Autorizações, agenda, roteiro, baterias, cartões"},
      {key:"wrapChecklist",label:"Fechamento",placeholder:"Backup, conferência, pendências, devolução, resumo para cliente"}
    ]
  },
  entrega:{
    title:"Relatório de entrega e aceite",
    tone:"Documento final com links, versões, specs, pendências e critérios de aceite.",
    fields:[
      {key:"deliveryLinks",label:"Links de entrega",placeholder:"Drive, Frame.io, Vimeo, pasta final"},
      {key:"formats",label:"Formatos entregues",placeholder:"MP4 H.264, 4K, 1080p, 9:16, legendado"},
      {key:"versions",label:"Versões",placeholder:"Master, teaser, cortes sociais, thumbnails"},
      {key:"storagePolicy",label:"Arquivamento",placeholder:"Prazo e local de backup"},
      {key:"acceptanceCriteria",label:"Critério de aceite",placeholder:"Prazo de revisão final e condições"},
      {key:"deadline",label:"Data da entrega",type:"date"}
    ],
    areas:[
      {key:"deliveryNotes",label:"Observações de entrega",placeholder:"Pendências, orientações de publicação, próximos passos"},
      {key:"scope",label:"Itens entregues",placeholder:"Um item por linha"}
    ]
  }
};
const docConfig = id=>DOC_FIELD_CONFIG[id]||DOC_FIELD_CONFIG.callsheet;
const RELATIONSHIP_TYPES = [
  {id:"all",label:"Todos",color:C.orange,desc:"Carteira completa"},
  {id:"cliente",label:"Clientes",color:"#10b981",desc:"Venda pontual ou lead"},
  {id:"recorrente",label:"Recorrentes",color:"#3b82f6",desc:"Mensalidade e contrato"},
  {id:"parceria",label:"Parcerias / Permutas",color:"#8b5cf6",desc:"Troca, collab ou indicação"},
  {id:"freelancer",label:"Freelancers",color:"#eab308",desc:"Equipe externa"}
];
const relationType = c=>c?.relationshipType||"cliente";
const relationMeta = c=>{
  const type=relationType(c);
  if(type==="recorrente")return c.monthlyValue?`Mensal: ${fmtCurrency(c.monthlyValue)}`:"Contrato mensal";
  if(type==="parceria")return c.barterDetails||c.partnerTerms||"Parceria / permuta";
  if(type==="freelancer"){
    const rate=Number(c.freelancerRate);
    const formattedRate=c.freelancerRate?(Number.isFinite(rate)?fmtCurrency(rate):c.freelancerRate):"";
    return [c.freelancerRole,formattedRate].filter(Boolean).join(" · ")||"Freelancer";
  }
  return c.service||"Cliente comercial";
};
const productionProfile = presetId=>PRODUCTION_KNOWLEDGE[presetId]||PRODUCTION_KNOWLEDGE.institucional;
const studioDocTemplates = ({form,business,client,project})=>{
  const doc=studioDocById(form.docType);
  const config=docConfig(form.docType);
  const preset=presetById(form.presetId);
  const profile=productionProfile(preset.id);
  const customCrew=studioLines(form.crew);
  const customEquipment=studioLines(form.equipment);
  const scope=studioLines(form.scope);
  const risks=studioLines(form.risks);
  const fieldValue=key=>form[key]||"";
  const moneyField=v=>v?fmtCurrency(v):"A definir";
  const fields=[
    ["Cliente",client?.name||form.clientName||"Cliente a definir"],
    ["Projeto",project?.video?.title||form.title||preset.title],
    ["Tipo",doc.label],
    ["Formato",form.format||preset.type],
    ["Prazo final",studioDate(form.deadline)],
    ["Orçamento base",form.budget?fmtCurrency(form.budget):fmtCurrency(project?.client?.value||preset.value||0)]
  ];
  const docFields=(config.fields||[]).filter(f=>fieldValue(f.key)).map(f=>[f.label, f.type==="date"?studioDate(fieldValue(f.key)):f.type==="number"?moneyField(fieldValue(f.key)):fieldValue(f.key)]);
  const section=(title,items,klass="")=>items?.length?`<div class="doc-section ${klass}"><h2>${studioEsc(title)}</h2><div class="doc-list">${items.map(i=>`<div class="doc-item">${studioEsc(i)}</div>`).join("")}</div></div>`:"";
  const prose=(title,text)=>String(text||"").trim()?section(title,studioLines(text)):"";
  const table=(title,rows,heads)=>rows?.length?`<div class="doc-section"><h2>${studioEsc(title)}</h2><table class="doc-table"><thead><tr>${heads.map(h=>`<th>${studioEsc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${studioEsc(c||"A definir")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`:"";
  const fieldGrid=`<div class="doc-grid">${[...fields,...docFields].map(([k,v])=>`<div class="doc-field"><div class="doc-field-label">${studioEsc(k)}</div><div class="doc-field-value">${studioEsc(v)}</div></div>`).join("")}</div>`;
  const baseSections=[
    section("Padrões Profissionais Aplicados",profile.principles),
    section("Escopo e Entregáveis",scope.length?scope:presetDeliverables(preset).map(x=>x.text)),
    section("Equipe Recomendada",customCrew.length?customCrew:profile.crew),
    section("Equipamentos e Técnica",customEquipment.length?customEquipment:profile.equipment),
    section("Riscos e Cuidados",risks.length?risks:["Confirmar autorizações de imagem e locação","Manter backup duplicado dos arquivos","Definir responsáveis por aprovação e revisões","Prever margem para clima, deslocamento e imprevistos"])
  ];
  const sceneRows=studioLines(form.scenes||form.shotList).map((line,i)=>[String(i+1),...line.split("|").map(x=>x.trim()).slice(0,4)]);
  const variants={
    briefing:[
      section("Objetivo e Público",[form.objective||presetBriefing(preset).objective,form.audience?`Público prioritário: ${form.audience}`:"Público prioritário: a definir",form.brandMessage?`Mensagem central: ${form.brandMessage}`:"Mensagem central a definir",form.approvalCriteria?`Critério de aprovação: ${form.approvalCriteria}`:"Critério de aprovação: alinhamento criativo + escopo"]),
      prose("Pontos Obrigatórios",form.mandatoryPoints),
      section("Perguntas de Direção",["Qual transformação o público precisa perceber?","Que prova visual sustenta a promessa?","Que emoção deve guiar montagem e trilha?","Quais restrições legais, de marca ou linguagem existem?"]),
      baseSections[0],baseSections[4]
    ],
    roteiro:[
      section("Beat Sheet",studioLines(form.scenes).length?studioLines(form.scenes):[form.hook||"Gancho inicial",form.logline||"Apresentação da promessa",form.cta||"Fechamento / CTA"]),
      prose("Texto, Locução e Falas",form.voiceover),
      section("Direção de Cena",["Priorizar ações filmáveis e falas objetivas","Prever respiros para B-roll e cortes de apoio","Manter ritmo compatível com canal e duração","Validar linguagem com público e posicionamento do cliente"]),
      baseSections[1]
    ],
    callsheet:[
      table("Agenda do Dia",studioLines(form.scheduleRows).map(x=>{const p=x.split("|").map(y=>y.trim());return [p[0]||"Horário",p[1]||p[0]||"Atividade",p[2]||"Responsável",p[3]||""]}),["Horário","Atividade","Responsável","Obs."]),
      prose("Talentos / Participantes",form.talent),
      baseSections[2],baseSections[3],baseSections[4]
    ],
    decupagem:[
      table("Lista de Planos",sceneRows.map(r=>[r[0],r[1]||"Cena",r[2]||"Plano",r[3]||form.lenses||"Lente",r[4]||form.cameraMovement||"Movimento"]),["#","Cena","Plano","Lente","Movimento"]),
      section("Direção Técnica",[form.lenses&&`Lentes: ${form.lenses}`,form.cameraMovement&&`Movimento: ${form.cameraMovement}`,form.audioPlan&&`Áudio: ${form.audioPlan}`,form.coverageNotes&&`Cobertura: ${form.coverageNotes}`].filter(Boolean)),
      baseSections[0],baseSections[3]
    ],
    orcamento:[
      table("Composição do Investimento",[["Equipe",moneyField(form.crewCost)],["Equipamentos / locação",moneyField(form.equipmentCost)],["Pós-produção",moneyField(form.postCost)],["Total proposto",moneyField(form.budget)]],["Categoria","Valor"]),
      prose("Escopo Incluído",form.scope),
      section("Condições Comerciais",[form.paymentTerms||"Condições a definir",form.assumptions||"Alterações fora do escopo exigem nova aprovação","Direitos, deslocamento e uso comercial devem estar descritos em contrato"])
    ],
    cronograma:[
      table("Linha do Tempo",[["Início",studioDate(form.startDate)],["Captação",studioDate(form.shootDate)],["Primeiro corte",studioDate(form.firstCutDate)],["Entrega final",studioDate(form.deadline)]],["Marco","Data"]),
      prose("Marcos do Projeto",form.milestones),
      section("Aprovação e Dependências",[form.approvalRounds&&`Rodadas: ${form.approvalRounds}`,form.buffer&&`Buffer: ${form.buffer}`,form.dependencies&&`Dependências: ${form.dependencies}`].filter(Boolean)),
      baseSections[4]
    ],
    checklist:[
      section("Pacotes Técnicos",[form.cameraPackage&&`Câmera: ${form.cameraPackage}`,form.audioPackage&&`Áudio: ${form.audioPackage}`,form.lightPackage&&`Luz: ${form.lightPackage}`,form.dataWorkflow&&`Dados: ${form.dataWorkflow}`].filter(Boolean)),
      prose("Pré-set",form.preflight),
      section("Checklist Operacional",profile.checklist),
      prose("Fechamento de Set",form.wrapChecklist),
      baseSections[4]
    ],
    entrega:[
      section("Pacote de Entrega",[form.deliveryLinks&&`Links: ${form.deliveryLinks}`,form.formats&&`Formatos: ${form.formats}`,form.versions&&`Versões: ${form.versions}`,form.storagePolicy&&`Arquivamento: ${form.storagePolicy}`,form.acceptanceCriteria&&`Aceite: ${form.acceptanceCriteria}`].filter(Boolean)),
      prose("Itens Entregues",form.scope),
      prose("Observações Finais",form.deliveryNotes),
      section("Aceite",["Cliente recebe links e especificações","Prazo de revisão final deve ser confirmado","Materiais ficam arquivados conforme política combinada","Novas alterações após aceite entram como novo escopo"])
    ]
  };
  const content=(variants[doc.id]||baseSections).filter(Boolean).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${studioEsc(doc.label)} - ${studioEsc(form.title||preset.title)}</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f4ee;color:#141414;font-family:Arial,sans-serif}.doc-page{max-width:860px;margin:0 auto;background:#f7f4ee;min-height:100vh;padding:48px}.doc-kicker{font-size:10px;color:${doc.color};font-weight:900;letter-spacing:.18em;text-transform:uppercase}.doc-title{font-size:42px;line-height:.95;font-weight:900;margin:10px 0 12px;color:#111}.doc-muted{color:#666;line-height:1.45}.doc-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:22px;border-bottom:3px solid ${doc.color}}.doc-brand{text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.12em;font-weight:900}.doc-section{margin-top:26px;padding-top:15px;border-top:1px solid #d9d3ca}.doc-section h2{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:${doc.color};margin:0 0 10px}.doc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:22px}.doc-field{border:1px solid #ded7cc;background:#fffdf8;padding:11px}.doc-field-label{font-size:9px;color:#888;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.doc-field-value{font-size:12px;color:#1a1a1a;font-weight:700;line-height:1.45}.doc-list{display:grid;gap:7px}.doc-item{font-size:12px;line-height:1.48;padding:9px 11px;border-left:3px solid ${doc.color};background:#fffdf8}.doc-table{width:100%;border-collapse:collapse;background:#fffdf8;font-size:12px}.doc-table th{text-align:left;color:${doc.color};font-size:9px;text-transform:uppercase;letter-spacing:.1em;border:1px solid #ded7cc;padding:8px}.doc-table td{border:1px solid #ded7cc;padding:9px;vertical-align:top;line-height:1.4}.doc-footer{margin-top:42px;padding-top:18px;border-top:1px solid #d9d3ca;display:flex;justify-content:space-between;gap:24px;color:#777;font-size:11px}@media print{body{background:#fff}.doc-page{padding:32px;max-width:none}.doc-section{break-inside:avoid}.doc-grid{grid-template-columns:1fr 1fr}}</style></head><body><main class="doc-page"><header class="doc-header"><div><div class="doc-kicker">${studioEsc(APP_NAME)} Studio · ${studioEsc(doc.label)}</div><h1 class="doc-title">${studioEsc(form.title||project?.video?.title||preset.title)}</h1><div class="doc-muted">${studioEsc(config.tone||doc.desc)}</div></div><div class="doc-brand">${studioEsc(business.brandName||APP_NAME)}<br>${studioEsc(business.proposalEmail||SALES_EMAIL)}<br>${new Date().toLocaleDateString("pt-BR")}</div></header>${fieldGrid}${content}${form.notes?section("Notas Adicionais",studioLines(form.notes)): ""}<footer class="doc-footer"><div>${studioEsc(business.brandName||APP_NAME)} · Documento operacional</div><div>Gerado em ${new Date().toLocaleString("pt-BR")}</div></footer></main></body></html>`;
};

const DEFAULT_GSD_AGENT = {
  enabled:true,
  name:"GSD",
  label:"Get Shit Done",
  mode:"execution",
  mission:"Guardar contexto operacional e transformar decisão solta em próxima ação clara.",
  currentFocus:"",
  operatingRules:[
    "Capturar contexto antes que ele se perca",
    "Separar fato, decisão e próxima ação",
    "Puxar o usuário de volta para execução quando houver dispersão"
  ],
  memory:[],
  lastActivatedAt:new Date().toISOString(),
  updatedAt:new Date().toISOString()
};
const normalizeGsdAgent = agent => ({
  ...DEFAULT_GSD_AGENT,
  ...(agent||{}),
  memory:Array.isArray(agent?.memory)?agent.memory:[]
});

const INIT = {
  habits:[
    {id:1,title:"Treinar",        icon:"💪",color:"#f97316",streak:0,best:0,completedDates:[]},
    {id:2,title:"Ler",            icon:"📚",color:"#3b82f6",streak:0,best:0,completedDates:[]},
    {id:3,title:"Meditar",        icon:"🧘",color:"#8b5cf6",streak:0,best:0,completedDates:[]},
    {id:4,title:"Criar conteúdo", icon:"🎬",color:"#10b981",streak:0,best:0,completedDates:[]},
  ],
  goals:[
    {id:1,level:"annual",   title:"Consolidar marca e linguagem visual",progress:35,status:"active",logs:[]},
    {id:2,level:"quarterly",title:"Lançar novo projeto audiovisual",     progress:60,status:"active",logs:[]},
    {id:3,level:"monthly",  title:"Criar 12 conteúdos premium",          progress:75,status:"active",logs:[]},
  ],
  tasks:[], notes:[], clients:[], financeEntries:[], studioDocs:[], reviews:{}, reviewDeliverables:[],
  business:DEFAULT_BUSINESS,
  subscription:DEFAULT_SUBSCRIPTION,
  scheduleBlocks:{}, focusDayPriorities:[], focusSessions:0,
  gsdAgent:DEFAULT_GSD_AGENT,
  xp:0, totalHabitsCompleted:0, totalTasksCompleted:0, unlockedBadges:[],
  pomodoroSettings:{ work:25, shortBreak:5, longBreak:15 },
  mission:{
    mission:"Construir linguagem, narrativa e direção criativa que inspire pessoas e deixe um legado cultural real.",
    vision:"Ser referência mundial em direção criativa e narrativa visual.",
    purpose:"Dar forma ao invisível. Transformar ideias e histórias em algo que permanece.",
  },
};

// ── REDUCER ────────────────────────────────────────────────────────────
function reducer(s, a) {
  switch(a.type) {
    case "HYDRATE": return {...INIT,...a.p,business:normalizeBusiness(a.p?.business),subscription:{...DEFAULT_SUBSCRIPTION,...(a.p?.subscription||{})},gsdAgent:normalizeGsdAgent(a.p?.gsdAgent)};
    case "UPDATE_BUSINESS": return {...s,business:normalizeBusiness({...s.business,...a.data})};
    case "SET_SUBSCRIPTION": return {...s,subscription:{...DEFAULT_SUBSCRIPTION,...(s.subscription||{}),...a.data,updatedAt:new Date().toISOString()}};
    case "UPDATE_GSD_AGENT": return {...s,gsdAgent:normalizeGsdAgent({...s.gsdAgent,...a.data,updatedAt:new Date().toISOString()})};
    case "ADD_GSD_CONTEXT": {
      const entry={id:Date.now(),type:"context",text:"",tags:[],createdAt:new Date().toISOString(),...a.entry};
      return {...s,gsdAgent:normalizeGsdAgent({...s.gsdAgent,memory:[entry,...(s.gsdAgent?.memory||[])],updatedAt:new Date().toISOString()})};
    }
    case "REMOVE_GSD_CONTEXT":
      return {...s,gsdAgent:normalizeGsdAgent({...s.gsdAgent,memory:(s.gsdAgent?.memory||[]).filter(m=>m.id!==a.id),updatedAt:new Date().toISOString()})};
    case "CLEAR_GSD_CONTEXT":
      return {...s,gsdAgent:normalizeGsdAgent({...s.gsdAgent,memory:[],updatedAt:new Date().toISOString()})};
    case "ADD_HABIT": return {...s,habits:[...s.habits,a.habit]};
    case "REMOVE_HABIT": return {...s,habits:s.habits.filter(h=>h.id!==a.id)};
    case "TOGGLE_HABIT": {
      let xpGain=0;
      const habits=s.habits.map(h=>{
        if(h.id!==a.id) return h;
        const done=h.completedDates.includes(a.date);
        const dates=done?h.completedDates.filter(d=>d!==a.date):[...h.completedDates,a.date];
        const streak=done?Math.max(0,h.streak-1):h.streak+1;
        if(!done) xpGain=XP_TABLE.habit;
        return {...h,completedDates:dates,streak,best:Math.max(h.best,streak)};
      });
      return {...s,habits,xp:s.xp+xpGain,totalHabitsCompleted:s.totalHabitsCompleted+(xpGain>0?1:0)};
    }
    case "ADD_TASK": return {...s,tasks:[...s.tasks,{id:Date.now(),completed:false,priority:"medium",createdAt:new Date().toLocaleDateString("pt-BR"),...a.task}]};
    case "TOGGLE_TASK": {
      const gain=s.tasks.find(t=>t.id===a.id&&!t.completed)?XP_TABLE.task:0;
      return {...s,tasks:s.tasks.map(t=>t.id===a.id?{...t,completed:!t.completed,completedAt:!t.completed?new Date().toLocaleDateString("pt-BR"):null}:t),xp:s.xp+gain,totalTasksCompleted:s.totalTasksCompleted+(gain>0?1:0)};
    }
    case "REMOVE_TASK": return {...s,tasks:s.tasks.filter(t=>t.id!==a.id)};
    case "ADD_GOAL": return {...s,goals:[...s.goals,{id:Date.now(),status:"active",logs:[],...a.goal}]};
    case "UPDATE_GOAL": return {...s,goals:s.goals.map(g=>g.id===a.id?{...g,...a.data}:g)};
    case "REMOVE_GOAL": return {...s,goals:s.goals.filter(g=>g.id!==a.id)};
    case "ADD_GOAL_LOG": return {...s,goals:s.goals.map(g=>g.id===a.id?{...g,logs:[...(g.logs||[]),{id:Date.now(),date:new Date().toLocaleDateString("pt-BR"),dateRaw:new Date().toISOString(),...a.log}]}:g)};
    case "REMOVE_GOAL_LOG": return {...s,goals:s.goals.map(g=>g.id===a.goalId?{...g,logs:g.logs.filter(l=>l.id!==a.logId)}:g)};
    case "ADD_NOTE": return {...s,notes:[{id:Date.now(),createdAt:new Date().toLocaleDateString("pt-BR"),...a.note},...s.notes]};
    case "REMOVE_NOTE": return {...s,notes:s.notes.filter(n=>n.id!==a.id)};
    case "EDIT_NOTE": return {...s,notes:s.notes.map(n=>n.id===a.id?{...n,...a.data}:n)};
    case "ADD_STUDIO_DOC": return {...s,studioDocs:[{id:Date.now(),createdAt:new Date().toISOString(),...a.doc},...(s.studioDocs||[])]};
    case "REMOVE_STUDIO_DOC": return {...s,studioDocs:(s.studioDocs||[]).filter(d=>d.id!==a.id)};
    case "UPDATE_REVIEW": return {...s,reviews:{...s.reviews,[a.weekKey]:{...(s.reviews[a.weekKey]||{}),[a.field]:a.value}}};
    case "ADD_REVIEW_DELIVERABLE": return {...s,reviewDeliverables:[{id:Date.now(),version:1,status:"waiting_review",revision_round:1,createdAt:new Date().toISOString(),comments:[],...a.deliverable},...(s.reviewDeliverables||[])]};
    case "UPDATE_REVIEW_DELIVERABLE": return {...s,reviewDeliverables:(s.reviewDeliverables||[]).map(d=>d.id===a.id?{...d,...a.data,updatedAt:new Date().toISOString()}:d)};
    case "REMOVE_REVIEW_DELIVERABLE": return {...s,reviewDeliverables:(s.reviewDeliverables||[]).filter(d=>d.id!==a.id)};
    case "ADD_REVIEW_COMMENT": return {...s,reviewDeliverables:(s.reviewDeliverables||[]).map(d=>d.id===a.deliverableId?{...d,comments:[...(d.comments||[]),{id:Date.now(),createdAt:new Date().toISOString(),resolved:false,...a.comment}]}:d)};
    case "UPDATE_MISSION": return {...s,mission:{...s.mission,[a.field]:a.value}};
    case "UNLOCK_BADGE": return (s.unlockedBadges||[]).includes(a.id)?s:{...s,unlockedBadges:[...(s.unlockedBadges||[]),a.id]};
    case "ADD_CLIENT": return {...s,clients:[...(s.clients||[]),{id:Date.now(),interactions:[],videos:[],createdAt:new Date().toLocaleDateString("pt-BR"),...a.client}]};
    case "UPDATE_CLIENT": return {...s,clients:s.clients.map(c=>c.id===a.id?{...c,...a.data}:c)};
    case "REMOVE_CLIENT": return {...s,clients:s.clients.filter(c=>c.id!==a.id)};
    case "ADD_CLIENT_PROPOSAL": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,proposals:[...(c.proposals||[]),{id:Date.now(),createdAt:new Date().toLocaleDateString("pt-BR"),status:"rascunho",...a.proposal}]}:c)};
    case "UPDATE_CLIENT_PROPOSAL": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,proposals:(c.proposals||[]).map(p=>p.id===a.proposalId?{...p,...a.data}:p)}:c)};
    case "REMOVE_CLIENT_PROPOSAL": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,proposals:(c.proposals||[]).filter(p=>p.id!==a.proposalId)}:c)};
    case "ADD_CLIENT_INTERACTION": return {...s,clients:s.clients.map(c=>c.id===a.id?{...c,interactions:[...(c.interactions||[]),{id:Date.now(),date:new Date().toLocaleDateString("pt-BR"),...a.interaction}]}:c)};
    case "REMOVE_CLIENT_INTERACTION": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,interactions:c.interactions.filter(i=>i.id!==a.intId)}:c)};
    case "ADD_CLIENT_VIDEO": return {...s,clients:s.clients.map(c=>c.id===a.id?{...c,videos:[...(c.videos||[]),{id:Date.now(),status:"pendente",...a.video}]}:c)};
    case "UPDATE_CLIENT_VIDEO": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,videos:c.videos.map(v=>v.id===a.videoId?{...v,...a.data}:v)}:c)};
    case "REMOVE_CLIENT_VIDEO": return {...s,clients:s.clients.map(c=>c.id===a.clientId?{...c,videos:c.videos.filter(v=>v.id!==a.videoId)}:c)};
    case "ADD_FINANCE_ENTRY": return {...s,financeEntries:[{id:Date.now(),createdAt:new Date().toISOString(),...a.entry},...(s.financeEntries||[])]};
    case "UPDATE_FINANCE_ENTRY": return {...s,financeEntries:(s.financeEntries||[]).map(e=>e.id===a.id?{...e,...a.data}:e)};
    case "REMOVE_FINANCE_ENTRY": return {...s,financeEntries:(s.financeEntries||[]).filter(e=>e.id!==a.id)};
    case "ADD_SCHEDULE_BLOCK": {
      const prev=s.scheduleBlocks[a.day]||[];
      return {...s,scheduleBlocks:{...s.scheduleBlocks,[a.day]:[...prev,{id:Date.now(),...a.block}]}};
    }
    case "REMOVE_SCHEDULE_BLOCK": {
      const prev=s.scheduleBlocks[a.day]||[];
      return {...s,scheduleBlocks:{...s.scheduleBlocks,[a.day]:prev.filter(b=>b.id!==a.id)}};
    }
    case "SET_FOCUS_PRIORITIES": return {...s,focusDayPriorities:a.priorities};
    case "COMPLETE_FOCUS_PRIORITY": return {...s,focusDayPriorities:s.focusDayPriorities.map((p,i)=>i===a.idx?{...p,done:!p.done}:p)};
    case "INC_FOCUS_SESSIONS": return {...s,focusSessions:(s.focusSessions||0)+1};
    case "RESTORE": return {...INIT,...a.p,business:normalizeBusiness(a.p?.business),subscription:{...DEFAULT_SUBSCRIPTION,...(a.p?.subscription||{})},gsdAgent:normalizeGsdAgent(a.p?.gsdAgent)};
    case "CLEAR_DATA": return INIT;
    default: return s;
  }
}

// ── UTILS ──────────────────────────────────────────────────────────────
const getLevel = xp=>[...LEVELS].reverse().find(l=>xp>=l.min)||LEVELS[0];
const xpToNext = xp=>{const idx=LEVELS.findIndex(l=>l.min>xp);return idx===-1?null:{next:LEVELS[idx].min,pct:Math.round((xp-(LEVELS[idx-1]?.min||0))/(LEVELS[idx].min-(LEVELS[idx-1]?.min||0))*100)};};
const getSubscription = state => ({...DEFAULT_SUBSCRIPTION,...(state.subscription||{})});
const hasAdminAccess = (_state,_required="admin",isAdmin=false) => !!isAdmin;
const operationReadiness = state => {
  const clients=state.clients||[],projects=clients.flatMap(c=>c.videos||[]),entries=state.financeEntries||[],proposals=clients.flatMap(c=>c.proposals||[]);
  const configured=!!state.business?.onboarded;
  const revenue=clients.reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada").reduce((a,e)=>a+Number(e.value||0),0);
  const done=[
    {label:"Negócio configurado",ok:configured,tab:"business"},
    {label:"CRM com pelo menos 3 clientes/leads",ok:clients.length>=3,tab:"clients"},
    {label:"Projeto audiovisual criado",ok:projects.length>0,tab:"projects"},
    {label:"Proposta salva no histórico",ok:proposals.length>0,tab:"proposta"},
    {label:"Financeiro com valor mapeado",ok:revenue>0,tab:"finance"},
    {label:"Backup/relatório preparado",ok:!!localStorage.getItem("dcc_last_backup")||Object.keys(state.reviews||{}).length>0,tab:"export"},
  ];
  return {items:done,score:Math.round(done.filter(i=>i.ok).length/done.length*100),revenue,clients:clients.length,projects:projects.length,proposals:proposals.length};
};
const todayStr = ()=>new Date().toDateString();
const inputDate = ()=>new Date().toISOString().slice(0,10);
const weekKey  = ()=>{const d=new Date(),day=d.getDay(),diff=d.getDate()-day+(day===0?-6:1);return new Date(new Date(d).setDate(diff)).toDateString();};
const fmtCurrency = v=>`R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmtMoney = (v,priv)=>priv?"R$ ••••••":fmtCurrency(v);
const fmtDashboardMoney = (v,priv)=>priv?"Oculto":fmtCurrency(v);
const timeToMins = t=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
const parseDateOnly = d=>d?new Date(d+"T00:00"):null;
const dayDiff = d=>{if(!d)return null;const a=parseDateOnly(d),b=new Date();b.setHours(0,0,0,0);return Math.round((a-b)/(1000*60*60*24));};
const taskBucket = t=>{const diff=dayDiff(t.dueDate);if(diff===null)return"noDate";if(diff<0)return"overdue";if(diff===0)return"today";if(diff<=7)return"week";return"later";};
const firstName = v=>String(v||"").trim().split(/\s+/)[0]||"";
const getUserName = session=>{
  const meta=session?.user?.user_metadata||{};
  const raw=meta.full_name||meta.name||meta.user_name||session?.user?.email?.split("@")[0]||"";
  const clean=firstName(raw.replace(/[._-]+/g," "));
  return clean?clean.charAt(0).toUpperCase()+clean.slice(1):"";
};
const onboardingKey = session=>`dnz_onboarding_${session?.user?.id||"guest"}`;
const formatTimer = ms=>{
  const total=Math.max(0,Math.ceil(ms/1000)),m=String(Math.floor(total/60)).padStart(2,"0"),s=String(total%60).padStart(2,"0");
  return `${m}:${s}`;
};
const bytesToBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes = b64 => Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const getWebCrypto = ()=>{
  const wc=window.crypto||window.msCrypto;
  if(!wc?.subtle)throw new Error("Criptografia indisponível. Abra o app em HTTPS, localhost ou 127.0.0.1 em um navegador moderno.");
  return wc;
};
const deriveBackupKey = async (password,salt)=>{
  const wc=getWebCrypto();
  const material=await wc.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);
  return wc.subtle.deriveKey({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
};
const encryptBackupPayload = async (payload,password)=>{
  const wc=getWebCrypto();
  const salt=wc.getRandomValues(new Uint8Array(16));
  const iv=wc.getRandomValues(new Uint8Array(12));
  const key=await deriveBackupKey(password,salt);
  const data=await wc.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify(payload)));
  return {
    _dnzEncryptedBackup:true,
    version:1,
    app:APP_NAME,
    alg:"AES-GCM-256",
    kdf:"PBKDF2-SHA256",
    iterations:210000,
    exportedAt:new Date().toISOString(),
    salt:bytesToBase64(salt),
    iv:bytesToBase64(iv),
    data:bytesToBase64(data)
  };
};
const decryptBackupPayload = async (backup,password)=>{
  if(!backup?._dnzEncryptedBackup)throw new Error("not-encrypted");
  const salt=base64ToBytes(backup.salt),iv=base64ToBytes(backup.iv),data=base64ToBytes(backup.data);
  const key=await deriveBackupKey(password,salt);
  const plain=await getWebCrypto().subtle.decrypt({name:"AES-GCM",iv},key,data);
  return JSON.parse(new TextDecoder().decode(plain));
};
const softNotifySound = ()=>{
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const ctx=new AC(),osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";osc.frequency.setValueAtTime(660,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(880,ctx.currentTime+.12);
    gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.045,ctx.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.22);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.24);
  }catch{}
};

// ── MICRO COMPONENTS ───────────────────────────────────────────────────
const Bar = ({v,color=C.orange,h=6})=>(
  <div style={{background:"rgba(255,255,255,0.06)",borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(100,Math.max(0,v))}%`,background:color,borderRadius:99,transition:"width .7s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 10px ${color}50`}}/>
  </div>
);
const Tag = ({children,color=C.orange})=>(
  <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:99,border:`1px solid ${color}40`,background:`${color}15`,color,whiteSpace:"nowrap"}}>{children}</span>
);
const EyeToggle = ({hidden,onClick,label})=>(
  <button type="button" onClick={onClick} title={hidden?"Mostrar valores":"Ocultar valores"} aria-label={hidden?"Mostrar valores":"Ocultar valores"} style={{height:34,borderRadius:12,border:`1px solid ${hidden?C.border:C.orange}`,background:hidden?"rgba(255,255,255,.045)":"rgba(249,115,22,.14)",color:hidden?C.muted:C.orange,fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,padding:"0 11px",whiteSpace:"nowrap"}}>
    <span style={{width:16,height:10,border:"1.8px solid currentColor",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <span style={{width:4,height:4,borderRadius:"50%",background:"currentColor",display:"block"}}/>
      {hidden&&<span style={{position:"absolute",width:20,height:2,background:"currentColor",transform:"rotate(-35deg)",borderRadius:99}}/>}
    </span>
    {label || (hidden ? "Ver valores" : "Ocultar")}
  </button>
);
const Card = ({children,style={},onClick,className=""})=>(
  <div onClick={onClick} className={`card-hover ${className}`} style={{background:style.background||"var(--glass-bg)",border:style.border||`1px solid var(--glass-border)`,borderRadius:style.borderRadius||26,padding:style.padding||"26px 28px",cursor:onClick?"pointer":"default",boxShadow:style.boxShadow||"var(--glass-shadow)",backdropFilter:style.backdropFilter||"var(--glass-blur)",WebkitBackdropFilter:style.WebkitBackdropFilter||"var(--glass-blur)",...style}}>{children}</div>
);
const LazyTabFallback = ({label="Carregando..."})=>(
  <div className="page-stack">
    <Card className="page-hero">
      <div className="page-eyebrow" style={{color:C.orange}}>CARREGANDO</div>
      <div className="page-title">{label}</div>
      <p className="page-subtitle">Preparando esta área sob demanda.</p>
    </Card>
  </div>
);
const Inp = ({label,value,onChange,placeholder,type="text"})=>{
  const id=useRef(`inp-${Math.random().toString(36).slice(2)}`);
  return (
    <div style={{marginBottom:18}}>
      {label&&<label htmlFor={id.current} style={{display:"block",fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>{label}</label>}
      <input id={id.current} aria-label={label||placeholder||"Campo"} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:"rgba(255,255,255,0.065)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color .2s,background .2s",backdropFilter:"blur(12px)"}}
        onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
};
const resizeLogoFile = (file,max=640,quality=.88)=>new Promise((resolve,reject)=>{
  if(!file?.type?.startsWith("image/")){reject(new Error("Arquivo inválido"));return;}
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Não foi possível ler a imagem."));
  reader.onload=()=>{
    if(file.type==="image/svg+xml"){resolve(reader.result);return;}
    const img=new Image();
    img.onerror=()=>reject(new Error("Não foi possível abrir essa imagem."));
    img.onload=()=>{
      const ratio=Math.min(1,max/Math.max(img.width,img.height));
      const w=Math.max(1,Math.round(img.width*ratio));
      const h=Math.max(1,Math.round(img.height*ratio));
      const canvas=document.createElement("canvas");
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext("2d");
      ctx.clearRect(0,0,w,h);
      ctx.drawImage(img,0,0,w,h);
      const type=file.type==="image/png"?"image/png":"image/webp";
      resolve(canvas.toDataURL(type,quality));
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
});
const LogoMark = ({business,size=58,textColor})=>{
  const [failed,setFailed]=useState(false);
  const src=business?.logoUrl;
  useEffect(()=>setFailed(false),[src]);
  if(src&&!failed)return <img src={src} alt={`Logo ${business?.brandName||APP_NAME}`} onError={()=>setFailed(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>;
  const color=business?.primaryColor||C.orange;
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{display:"block"}}>
      <rect x="7" y="7" width="50" height="50" rx="16" fill={textColor?"rgba(0,0,0,.1)":"#121212"} stroke={color} strokeWidth="3"/>
      <path d="M19 43V21h6l14 17V21h6v22h-6L25 26v17h-6z" fill={textColor||color}/>
      <path d="M16 16h13M35 48h13" stroke={textColor||"#fff"} strokeWidth="3" strokeLinecap="round" opacity=".9"/>
    </svg>
  );
};
const LogoUploader = ({value,onChange,color=C.orange,label="Logo da marca"})=>{
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const inputId=useRef(`logo-upload-${Math.random().toString(36).slice(2)}`);
  const preview={brandName:"Logo",primaryColor:color,logoUrl:value};
  const pick=async e=>{
    const file=e.target.files?.[0];
    e.target.value="";
    if(!file)return;
    setBusy(true);setError("");
    try{
      const data=await resizeLogoFile(file);
      onChange(data);
    }catch(err){
      setError(err?.message||"Não foi possível usar essa imagem.");
    }finally{
      setBusy(false);
    }
  };
  return (
    <div style={{marginBottom:13}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>{label}</div>
      <div style={{display:"grid",gridTemplateColumns:"72px 1fr",gap:12,alignItems:"center",padding:12,borderRadius:14,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)"}}>
        <div style={{width:64,height:64,borderRadius:18,border:`1px solid ${color}55`,background:`${color}18`,display:"grid",placeItems:"center",overflow:"hidden"}}>
          <LogoMark business={preview} size={64}/>
        </div>
        <div>
          <input id={inputId.current} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={pick} style={{display:"none"}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <label htmlFor={inputId.current} className="btn-hover" style={{borderRadius:10,cursor:"pointer",fontWeight:800,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:7,padding:"9px 13px",fontSize:12,background:"rgba(255,255,255,.06)",color:"#ddd",border:`1px solid ${C.border}`}}>{busy?"Processando...":"Enviar imagem"}</label>
            {value&&<button type="button" onClick={()=>onChange("")} style={{borderRadius:10,cursor:"pointer",fontWeight:800,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:7,padding:"9px 13px",fontSize:12,background:"rgba(239,68,68,.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,.24)"}}>Remover</button>}
          </div>
          <div style={{fontSize:11,color:error?"#ef4444":C.muted,lineHeight:1.4,marginTop:7}}>{error||"PNG, JPG, WebP ou SVG. A imagem é otimizada e salva neste navegador."}</div>
        </div>
      </div>
    </div>
  );
};
const Txt = ({label,value,onChange,placeholder,rows=3})=>{
  const id=useRef(`txt-${Math.random().toString(36).slice(2)}`);
  return (
    <div style={{marginBottom:18}}>
      {label&&<label htmlFor={id.current} style={{display:"block",fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>{label}</label>}
      <textarea id={id.current} aria-label={label||placeholder||"Texto"} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{width:"100%",background:"rgba(255,255,255,0.065)",border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color .2s,background .2s",backdropFilter:"blur(12px)",lineHeight:1.5}}
        onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
};
const Btn = ({children,onClick,variant="primary",size="md",style={},disabled=false,className=""})=>{
  const vs={
    primary:{background:`linear-gradient(135deg,${C.orange},${C.orangeD})`,color:"#fff",boxShadow:"0 4px 16px rgba(249,115,22,.3)",border:"none"},
    ghost:{background:"rgba(255,255,255,.06)",color:"#ccc",border:`1px solid ${C.border}`},
    danger:{background:"rgba(239,68,68,.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,.25)"},
    success:{background:"rgba(16,185,129,.15)",color:"#10b981",border:"1px solid rgba(16,185,129,.3)"},
    focus:{background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",color:"#fff",boxShadow:"0 4px 16px rgba(139,92,246,.4)",border:"none"},
    proposal:{background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",boxShadow:"0 4px 16px rgba(59,130,246,.35)",border:"none"},
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`btn-hover ${className}`} style={{borderRadius:10,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:7,padding:size==="sm"?"6px 12px":"10px 20px",fontSize:size==="sm"?11:14,opacity:disabled?.5:1,...vs[variant],...style}}>{children}</button>;
};
const Modal = ({open,onClose,title,children,wide})=>{
  useEffect(()=>{if(!open)return;const h=e=>{if(e.key==="Escape")onClose?.();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[open,onClose]);
  if(!open) return null;
  return (
    <div className="modal-shell" role="presentation">
      <div className="modal-backdrop" onClick={onClose}/>
      <div className={`scale-in modal-panel ${wide?"wide":""}`} role="dialog" aria-modal="true" aria-label={title||"Janela"}>
        <div className="modal-head">
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar janela" style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1,transition:"color .15s"}} onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color=C.muted}>✕</button>
        </div>
        <div className="modal-scroll modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
const Divider = ()=><div style={{height:1,background:C.border,margin:"14px 0"}}/>;
const SectionTitle = ({children,action})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
    <span style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".1em",textTransform:"uppercase"}}>{children}</span>
    {action}
  </div>
);
const PremiumEmpty = ({title,text,action,icon="+"})=>(
  <Card style={{textAlign:"center",padding:"30px 22px",background:"linear-gradient(135deg,rgba(255,255,255,.045),rgba(0,0,0,0))"}}>
    <div style={{width:42,height:42,borderRadius:14,margin:"0 auto 12px",display:"grid",placeItems:"center",background:"rgba(249,115,22,.12)",border:"1px solid rgba(249,115,22,.28)",color:C.orange,fontSize:18,fontWeight:900}}>{icon}</div>
    <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",marginBottom:6}}>{title}</div>
    <p style={{fontSize:13,color:C.muted,lineHeight:1.5,margin:"0 auto 14px",maxWidth:420}}>{text}</p>
    {action}
  </Card>
);
const AccessWall = ({onLogin})=>(
  <div className="access-wall">
    <div className="access-wall-card scale-in">
      <div className="elite-kicker">ACESSO PRIVADO</div>
      <h1 style={{fontSize:"clamp(30px,5vw,52px)",lineHeight:1,color:"#fff",fontFamily:"'Syne',sans-serif",margin:"10px 0 12px"}}>Workspace interno do {APP_NAME}.</h1>
      <p style={{fontSize:15,color:"#cfcfcf",lineHeight:1.65,maxWidth:640,margin:"0 0 20px"}}>O {APP_NAME} guarda clientes, propostas, produção, documentos, financeiro e Video Review. A entrada é restrita ao admin autorizado.</p>
      <div className="access-steps">
        {[
          ["1","Login","Entre com GitHub."],
          ["2","Admin","O email precisa estar autorizado."],
          ["3","Operação",`Abra o workspace ${APP_NAME}.`],
        ].map(([n,t,d])=><div key={n} style={{padding:"13px",borderRadius:16,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.04)"}}><div style={{fontSize:10,color:C.orange,fontWeight:900}}>0{n}</div><div style={{fontSize:13,color:"#fff",fontWeight:900,marginTop:4}}>{t}</div><div style={{fontSize:11,color:C.muted,lineHeight:1.4,marginTop:3}}>{d}</div></div>)}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={onLogin} className="elite-primary">Entrar com GitHub</button>
      </div>
    </div>
  </div>
);



// ── NOTIFICATIONS BANNER ───────────────────────────────────────────────
const NotificationsBanner = ({state,setTab})=>{
  const today=todayStr(), now=new Date();
  const storageKey=`dnz_notifications_${today}`;
  const [dismissed,setDismissed]=useState(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||"[]");}catch{return[];}});
  const msgs=[];
  const meetings=(state.clients||[]).filter(c=>{if(!c.nextMeeting)return false;const diff=Math.ceil((new Date(c.nextMeeting)-now)/(1000*60*60*24));return diff>=0&&diff<=1;});
  meetings.forEach(c=>{const diff=Math.ceil((new Date(c.nextMeeting)-now)/(1000*60*60*24));msgs.push({id:`meet_${c.id}`,icon:"📅",color:"#3b82f6",text:`Reunião com ${c.name} ${diff===0?"hoje":"amanhã"}`,action:()=>setTab("clients")});});
  const overdue=(state.clients||[]).filter(c=>c.payment==="atrasado");
  if(overdue.length>0) msgs.push({id:"overdue",icon:"💰",color:"#ef4444",text:`${overdue.length} pagamento${overdue.length>1?"s":""} em atraso`,action:()=>setTab("clients")});
  const pendVids=(state.clients||[]).reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0);
  if(pendVids>3) msgs.push({id:"vids",icon:"🎬",color:"#8b5cf6",text:`${pendVids} vídeos pendentes de entrega`,action:()=>setTab("clients")});
  const visible=msgs.filter(m=>!dismissed.includes(m.id));
  const dismiss=id=>setDismissed(prev=>{
    const next=[...new Set([...prev,id])];
    try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}
    return next;
  });
  useEffect(()=>{
    if(visible.length===0)return;
    const t=setTimeout(()=>setDismissed(prev=>{
      const next=[...new Set([...prev,...visible.map(m=>m.id)])];
      try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}
      return next;
    }),8500);
    return()=>clearTimeout(t);
  },[visible.map(m=>m.id).join("|"),storageKey]);
  if(visible.length===0) return null;
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"8px 14px 0"}}>
      {visible.map(m=>(
        <div key={m.id} className="notification-slide" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:`${m.color}10`,border:`1px solid ${m.color}30`,borderRadius:12,marginBottom:6,cursor:"pointer"}} onClick={()=>{m.action();dismiss(m.id);}}>
          <span style={{fontSize:16}}>{m.icon}</span>
          <span className={m.id?.startsWith("meet_")?"private-data":""} style={{flex:1,fontSize:13,color:"#e2e2e2"}}>{m.text}</span>
          <span style={{fontSize:11,color:m.color,fontWeight:700}}>Ver →</span>
          <button onClick={e=>{e.stopPropagation();dismiss(m.id);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,lineHeight:1}}>✕</button>
        </div>
      ))}
    </div>
  );
};

const ContextAlert = ({tab,state,setTab,notify})=>{
  const clients=state.clients||[],entries=state.financeEntries||[],projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const overdueTasks=(state.tasks||[]).filter(t=>!t.completed&&taskBucket(t)==="overdue").length;
  const todayTasks=(state.tasks||[]).filter(t=>!t.completed&&taskBucket(t)==="today").length;
  const followUps=clients.filter(c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&! ["entregue","pago"].includes(normalizeClientStatus(c))).length;
  const overduePayments=clients.filter(c=>c.payment==="atrasado").length+entries.filter(e=>e.status==="atrasado").length;
  const projectDue=projects.filter(p=>p.video.status!=="entregue"&&dayDiff(p.video.deadline)!==null&&dayDiff(p.video.deadline)<=3).length;
  const map={
    dashboard: overdueTasks?{txt:`${overdueTasks} tarefa${overdueTasks>1?"s":""} atrasada${overdueTasks>1?"s":""} precisa de atenção.`,go:"tasks",cta:"Ver tarefas"}:null,
    tasks: todayTasks?{txt:`${todayTasks} tarefa${todayTasks>1?"s":""} vence${todayTasks>1?"m":""} hoje.`,go:null,cta:"Ok"}:null,
    clients: followUps?{txt:`${followUps} follow-up${followUps>1?"s":""} pendente${followUps>1?"s":""} no CRM.`,go:null,cta:"Revisar"}:null,
    projects: projectDue?{txt:`${projectDue} projeto${projectDue>1?"s":""} com prazo próximo.`,go:null,cta:"Revisar"}:null,
    finance: overduePayments?{txt:`${overduePayments} item${overduePayments>1?"s":""} financeiro${overduePayments>1?"s":""} em atraso.`,go:null,cta:"Ver agora"}:null,
    export: {txt:"Antes do deploy ou de mudanças grandes, gere um backup JSON atualizado.",go:null,cta:"Entendi"},
  };
  const item=map[tab];
  const alertKey=`dnz_context_alert_${todayStr()}_${tab}_${item?String(item.txt).slice(0,28):"none"}`;
  const [dismissed,setDismissed]=useState(()=>localStorage.getItem(alertKey)==="1");
  useEffect(()=>setDismissed(localStorage.getItem(alertKey)==="1"),[alertKey]);
  useEffect(()=>{
    if(!item||dismissed)return;
    const t=setTimeout(()=>{localStorage.setItem(alertKey,"1");setDismissed(true);},9500);
    return()=>clearTimeout(t);
  },[alertKey,dismissed,!!item]);
  const close=()=>{localStorage.setItem(alertKey,"1");setDismissed(true);};
  if(!item)return null;
  if(dismissed)return null;
  return <div className="context-alert"><div><div style={{fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>Notificação</div><div style={{fontSize:13,color:"#ddd",lineHeight:1.45}}>{item.txt}</div></div><div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}><button onClick={()=>{if(item.go)setTab(item.go);else notify?.("Tudo certo por aqui","info");close();}}>{item.cta}</button><button onClick={close} aria-label="Fechar notificação" style={{width:28,height:28,padding:0,display:"grid",placeItems:"center"}}>×</button></div></div>;
};

const SystemHealth = ({state,setTab})=>{
  const clients=state.clients||[],entries=state.financeEntries||[];
  const lastBackup=localStorage.getItem("dcc_last_backup");
  const overdueTasks=(state.tasks||[]).filter(t=>!t.completed&&taskBucket(t)==="overdue").length;
  const followUps=clients.filter(c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&! ["entregue","pago"].includes(normalizeClientStatus(c))).length;
  const lateMoney=clients.filter(c=>c.payment==="atrasado").length+entries.filter(e=>e.status==="atrasado").length;
  const backupDays=lastBackup?Math.floor((Date.now()-new Date(lastBackup).getTime())/(1000*60*60*24)):999;
  const checks=[
    {ok:overdueTasks===0,label:overdueTasks?`${overdueTasks} tarefa(s) atrasada(s)`:"Atividades em dia",tab:"tasks"},
    {ok:followUps===0,label:followUps?`${followUps} follow-up(s) pendente(s)`:"CRM em dia",tab:"clients"},
    {ok:lateMoney===0,label:lateMoney?`${lateMoney} financeiro(s) atrasado(s)`:"Financeiro sob controle",tab:"finance"},
    {ok:backupDays<=7,label:backupDays<=7?"Backup recente":"Backup recomendado",tab:"export"},
  ];
  const score=Math.round(checks.filter(c=>c.ok).length/checks.length*100);
  return (
    <div className="health-grid">
      <Card style={{padding:"16px",background:"rgba(59,130,246,.06)",borderColor:"rgba(59,130,246,.2)"}}>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>SAÚDE DO SISTEMA</div>
        <div style={{fontSize:34,fontWeight:900,color:score>=75?"#10b981":score>=50?"#eab308":"#ef4444",fontFamily:"'Syne',sans-serif"}}>{score}%</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4}}>Pronto para operar e preparar deploy.</div>
        <Bar v={score} color={score>=75?"#10b981":score>=50?"#eab308":"#ef4444"} h={6}/>
      </Card>
      <Card style={{padding:"14px 16px"}}>
        <SectionTitle>CHECKLIST INTELIGENTE</SectionTitle>
        {checks.map(c=>(
          <button key={c.label} onClick={()=>setTab(c.tab)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            <span style={{fontSize:13}}>{c.label}</span>
            <Tag color={c.ok?"#10b981":"#eab308"}>{c.ok?"ok":"ação"}</Tag>
          </button>
        ))}
      </Card>
    </div>
  );
};

// ── WEEK CHART ─────────────────────────────────────────────────────────
const WeekChart = ({habits})=>{
  const today=new Date(),dow=today.getDay()===0?6:today.getDay()-1;
  const days=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((label,i)=>{
    const d=new Date(today);d.setDate(today.getDate()-(dow-i));
    const count=habits.filter(h=>h.completedDates?.includes(d.toDateString())).length;
    return {label,pct:habits.length?Math.round(count/habits.length*100):0,isToday:i===dow};
  });
  const max=Math.max(...days.map(d=>d.pct),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,padding:"0 2px"}}>
      {days.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{fontSize:9,color:d.pct>0?C.orange:C.muted,fontWeight:700}}>{d.pct>0?`${d.pct}%`:""}</div>
          <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:d.isToday?C.orange:d.pct>0?`${C.orange}50`:"rgba(255,255,255,0.04)",height:`${Math.max(4,d.pct/max*56)}px`,transition:"height .6s cubic-bezier(.4,0,.2,1)",boxShadow:d.isToday?`0 0 12px ${C.orange}70`:"none"}}/>
          <div style={{fontSize:9,color:d.isToday?C.orange:C.muted,fontWeight:d.isToday?800:400}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── REVENUE CHART ──────────────────────────────────────────────────────
const RevenueChart = ({clients,privacyMode})=>{
  const now=new Date();
  const months=Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
    return {month:d.getMonth(),year:d.getFullYear(),label:MONTHS[d.getMonth()].substring(0,3)};
  });
  const data=months.map(m=>{
    const paid=(clients||[]).filter(c=>{
      if(c.payment!=="pago")return false;
      if(!c.createdAt)return false;
      const parts=c.createdAt.split("/");
      if(parts.length!==3)return false;
      return parseInt(parts[1])-1===m.month&&parseInt(parts[2])===m.year;
    }).reduce((a,c)=>a+Number(c.value||0),0);
    const total=(clients||[]).filter(c=>{
      if(!c.createdAt)return false;
      const parts=c.createdAt.split("/");
      if(parts.length!==3)return false;
      return parseInt(parts[1])-1===m.month&&parseInt(parts[2])===m.year;
    }).reduce((a,c)=>a+Number(c.value||0),0);
    return {...m,paid,total};
  });
  const maxV=Math.max(...data.map(d=>d.total),1);
  const isCurrent=(d)=>d.month===now.getMonth()&&d.year===now.getFullYear();
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100,padding:"0 2px",marginBottom:8}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            {d.total>0&&!privacyMode&&<div style={{fontSize:9,color:isCurrent(d)?C.orange:C.muted,fontWeight:700,whiteSpace:"nowrap"}}>{fmtCurrency(d.total).replace("R$ ","")}</div>}
            {d.total>0&&privacyMode&&<div style={{fontSize:9,color:C.muted,fontWeight:700}}>••••</div>}
            <div style={{width:"100%",position:"relative",height:`${Math.max(6,d.total/maxV*76)}px`,borderRadius:"4px 4px 0 0",background:isCurrent(d)?C.orange:"rgba(255,255,255,0.08)",transition:"height .7s ease",boxShadow:isCurrent(d)?`0 0 12px ${C.orange}60`:"none"}}>
              {d.paid>0&&<div style={{position:"absolute",bottom:0,width:"100%",height:`${Math.round(d.paid/d.total*100)}%`,background:isCurrent(d)?`${C.orange}cc`:"rgba(16,185,129,.6)",borderRadius:"4px 4px 0 0"}}/>}
            </div>
            <div style={{fontSize:9,color:isCurrent(d)?C.orange:C.muted,fontWeight:isCurrent(d)?800:400}}>{d.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:16,justifyContent:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:"rgba(255,255,255,.15)"}}/><span style={{fontSize:10,color:C.muted}}>Total contratado</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:"#10b981"}}/><span style={{fontSize:10,color:C.muted}}>Recebido</span></div>
      </div>
    </div>
  );
};

// ── TAB: PROPOSTA COMERCIAL ────────────────────────────────────────────
const TabProposta = ({state,dispatch})=>{
  const emptyClient={name:"",company:"",email:"",phone:"",city:"",cnpj:""};
  const [client,setClient]=useState(emptyClient);
  const [loadedClientId,setLoadedClientId]=useState("");
  const [loadedProjectId,setLoadedProjectId]=useState("");
  const [selected,setSelected]=useState([]);
  const [customService,setCustomService]=useState({name:"",price:""});
  const [showCustom,setShowCustom]=useState(false);
  const [discount,setDiscount]=useState(0);
  const [payTerms,setPayTerms]=useState("50% na assinatura + 50% na entrega");
  const [deadline,setDeadline]=useState("");
  const [notes,setNotes]=useState("");
  const [validity,setValidity]=useState("15");
  const [proposalStatus,setProposalStatus]=useState("rascunho");
  const [generating,setGenerating]=useState(false);
  const business=normalizeBusiness(state?.business);
  const savedClients=state?.clients||[];
  const savedProjects=savedClients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));

  const total=selected.reduce((a,s)=>a+s.price*s.qty,0);
  const discountVal=Math.round(total*discount/100);
  const finalTotal=total-discountVal;

  const toggleService=(svc)=>{
    const y=window.scrollY||document.documentElement.scrollTop||0;
    setSelected(prev=>{
      const ex=prev.find(s=>s.id===svc.id);
      if(ex) return prev.filter(s=>s.id!==svc.id);
      return [...prev,{...svc,qty:1,customPrice:svc.price}];
    });
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"auto"}));
  };
  const updateQty=(id,qty)=>setSelected(prev=>prev.map(s=>s.id===id?{...s,qty:Math.max(1,qty)}:s));
  const updatePrice=(id,price)=>setSelected(prev=>prev.map(s=>s.id===id?{...s,customPrice:Number(price)||0,price:Number(price)||0}:s));
  const addCustom=()=>{
    if(!customService.name||!customService.price)return;
    setSelected(prev=>[...prev,{id:`custom_${Date.now()}`,name:customService.name,desc:"Serviço personalizado",price:Number(customService.price),qty:1,customPrice:Number(customService.price)}]);
    setCustomService({name:"",price:""});setShowCustom(false);
  };
  const loadClient=c=>{setLoadedClientId(c.id);setLoadedProjectId("");setClient({name:c.name||"",company:c.name||"",email:c.email||"",phone:c.phone||"",city:business.proposalCity||"",cnpj:""});};
  const loadProject=p=>{
    loadClient(p.client);
    setLoadedProjectId(p.video.id);
    const preset=presetById(p.video.presetId||p.video.type);
    const base=SERVICES_CATALOG.find(s=>s.name===(p.client.service||preset.service))||{id:`project_${p.video.id}`,name:p.client.service||preset.service,desc:p.video.title,price:Number(p.client.value||preset.value||0)};
    setSelected([{...base,id:`project_${p.video.id}`,name:p.video.title||base.name,desc:`${p.client.name} · ${p.video.type}`,price:Number(p.client.value||base.price||0),qty:1,customPrice:Number(p.client.value||base.price||0)}]);
    setDeadline(p.video.deadline||"");
    setNotes(`Escopo: ${(p.video.deliverables||presetDeliverables(preset)).map(d=>d.text||d).join(", ")}.`);
  };
  const saveProposalToCRM=()=>{
    if(!loadedClientId){alert("Selecione um cliente em 'Criar a partir do sistema' antes de salvar no CRM.");return;}
    const proposal={
      status:proposalStatus,
      clientName:client.name,
      projectId:loadedProjectId||null,
      projectTitle:selected[0]?.name||"",
      services:selected.map(s=>({id:s.id,name:s.name,desc:s.desc,qty:s.qty,price:s.price})),
      total:finalTotal,
      subtotal:total,
      discount,
      payTerms,
      deadline,
      validity,
      notes
    };
    dispatch({type:"ADD_CLIENT_PROPOSAL",clientId:loadedClientId,proposal});
    dispatch({type:"ADD_CLIENT_INTERACTION",id:loadedClientId,interaction:{type:"proposta",note:`Proposta ${proposalStatus} salva: ${fmtCurrency(finalTotal)}`}});
  };

  const generatePDF=()=>{
    setGenerating(true);
    const now=new Date();
    const docNum=String(Date.now()).slice(-5);
    const servicesHTML=selected.map(s=>`
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e">
          <div style="font-size:14px;font-weight:700;color:#fff">${s.name}</div>
          <div style="font-size:12px;color:#555;margin-top:2px">${s.desc||""}</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:center;color:#aaa;font-size:13px">${s.qty}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:right;color:#e2e2e2;font-size:13px;font-weight:600">${fmtCurrency(s.price)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;text-align:right;color:#f97316;font-size:14px;font-weight:800">${fmtCurrency(s.price*s.qty)}</td>
      </tr>
    `).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Proposta — ${client.name||"Cliente"}</title>
    <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0d0d0d;color:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;padding:50px;max-width:880px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:50px;padding-bottom:30px;border-bottom:2px solid #f97316}
    .brand-name{font-size:30px;font-weight:900;color:#fff;letter-spacing:.05em}
    .brand-sub{font-size:11px;color:#f97316;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin-top:4px}
    .doc-label{font-size:10px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-align:right}
    .doc-num{font-size:22px;font-weight:900;color:#f97316;text-align:right;margin-top:4px}
    .doc-date{font-size:11px;color:#333;text-align:right;margin-top:4px}
    .section{margin-bottom:40px}
    .section-title{font-size:11px;font-weight:800;color:#f97316;text-transform:uppercase;letter-spacing:.15em;margin-bottom:18px;padding-bottom:8px;border-bottom:1px solid #1a1a1a}
    .client-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .field{background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:12px 16px}
    .field-label{font-size:10px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
    .field-value{font-size:14px;color:#e2e2e2;font-weight:500}
    table{width:100%;border-collapse:collapse;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e}
    thead{background:#1a1a1a}
    th{padding:12px 16px;font-size:11px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-align:left}
    th:nth-child(2){text-align:center}th:nth-child(3){text-align:right}th:nth-child(4){text-align:right}
    .totals{background:#141414;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;margin-top:12px}
    .total-row{display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #1e1e1e}
    .total-final{background:linear-gradient(135deg,rgba(249,115,22,.15),rgba(0,0,0,0));border:1px solid rgba(249,115,22,.3);border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}
    .terms-box{background:#111;border-radius:12px;padding:22px 24px}
    .terms-title{font-size:11px;color:#333;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
    .terms-text{font-size:12px;color:#3a3a3a;line-height:1.8}
    .footer{margin-top:50px;padding-top:20px;border-top:1px solid #1a1a1a;display:flex;justify-content:space-between;align-items:center}
    .sign-area{border-top:1px solid #2a2a2a;padding-top:8px;font-size:10px;color:#333;width:220px;text-align:center}
    @media print{body{padding:30px}}
    </style></head><body>
    <div class="header">
      <div><div class="brand-name">${(business.brandName||APP_NAME).toUpperCase()}</div><div class="brand-sub">${business.type||APP_SUBTITLE} · Propostas e operação comercial</div></div>
      <div><div class="doc-label">Proposta Comercial</div><div class="doc-num">#${docNum}</div><div class="doc-date">${now.toLocaleDateString("pt-BR")}</div></div>
    </div>
    <div class="section">
      <div class="section-title">📋 Dados do Cliente</div>
      <div class="client-grid">
        ${client.name?`<div class="field"><div class="field-label">Nome / Responsável</div><div class="field-value">${client.name}</div></div>`:""}
        ${client.company?`<div class="field"><div class="field-label">Empresa</div><div class="field-value">${client.company}</div></div>`:""}
        ${client.email?`<div class="field"><div class="field-label">Email</div><div class="field-value">${client.email}</div></div>`:""}
        ${client.phone?`<div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${client.phone}</div></div>`:""}
        ${client.city?`<div class="field"><div class="field-label">Cidade</div><div class="field-value">${client.city}</div></div>`:""}
        ${client.cnpj?`<div class="field"><div class="field-label">CNPJ</div><div class="field-value">${client.cnpj}</div></div>`:""}
        ${deadline?`<div class="field"><div class="field-label">Prazo de Entrega</div><div class="field-value">${new Date(deadline+"T00:00").toLocaleDateString("pt-BR")}</div></div>`:""}
        <div class="field"><div class="field-label">Validade da Proposta</div><div class="field-value">${validity} dias</div></div>
      </div>
    </div>
    ${selected.length>0?`
    <div class="section">
      <div class="section-title">🎬 Escopo de Serviços</div>
      <table>
        <thead><tr><th>Serviço</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead>
        <tbody>${servicesHTML}</tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span style="font-size:13px;color:#666">Subtotal</span><span style="font-size:13px;color:#aaa;font-weight:600">${fmtCurrency(total)}</span></div>
        ${discount>0?`<div class="total-row"><span style="font-size:13px;color:#666">Desconto (${discount}%)</span><span style="font-size:13px;color:#10b981;font-weight:600">-${fmtCurrency(discountVal)}</span></div>`:""}
      </div>
      <div class="total-final">
        <div><div style="font-size:12px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Valor Total do Projeto</div>${notes?`<div style="font-size:12px;color:#555;margin-top:6px;max-width:380px">${notes}</div>`:""}</div>
        <div style="font-size:38px;font-weight:900;color:#fff">${fmtCurrency(finalTotal)}</div>
      </div>
    </div>`:""} 
    <div class="section">
      <div class="section-title">💳 Condições Comerciais</div>
      <div class="field" style="margin-bottom:0"><div class="field-label">Forma de Pagamento</div><div class="field-value" style="margin-top:6px">${payTerms}</div></div>
    </div>
    <div class="terms-box">
      <div class="terms-title">Termos & Condições</div>
      <div class="terms-text">Esta proposta tem validade de ${validity} dias a partir da data de emissão. Os prazos de entrega serão definidos após confirmação e aprovação do projeto. Qualquer alteração de escopo após o início da produção estará sujeita a revisão de valores. O pagamento deverá ser realizado conforme acordado. Todos os direitos de imagem e produção audiovisual serão transferidos ao cliente após quitação total do contrato.</div>
    </div>
    <div class="footer">
      <div><div class="sign-area">Equipe ${business.brandName||APP_NAME}<br>${business.proposalEmail||"Responsável comercial"}</div></div>
      <div><div class="sign-area">${client.name||"Cliente"}<br>Responsável pela contratação</div></div>
    </div>
    </body></html>`;
    const w=window.open("","_blank");
    w.document.write(html);w.document.close();
    setTimeout(()=>{w.print();setGenerating(false);},800);
  };

  const isSelected=(id)=>selected.some(s=>s.id===id);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(0,0,0,0))",borderColor:"rgba(59,130,246,.25)",padding:"20px 22px"}}>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>PROPOSTA COMERCIAL</div>
        <p style={{margin:0,fontSize:13,color:"#aaa",lineHeight:1.5}}>Crie uma proposta profissional com identidade de {business.brandName||APP_NAME}, exporte em PDF e salve no histórico do cliente.</p>
      </Card>

      {(savedClients.length>0||savedProjects.length>0)&&<Card>
        <SectionTitle>CRIAR A PARTIR DO SISTEMA</SectionTitle>
        {savedClients.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Clientes</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{savedClients.slice(0,8).map(c=><button key={c.id} onClick={()=>loadClient(c)} className="private-data" style={{padding:"7px 10px",borderRadius:10,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)",color:"#ddd",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"inherit"}}>{c.name}</button>)}</div>
        </div>}
        {savedProjects.length>0&&<div>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Projetos</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}} className="modal-grid">{savedProjects.slice(0,6).map(p=><button key={`${p.client.id}-${p.video.id}`} onClick={()=>loadProject(p)} style={{textAlign:"left",padding:"10px 12px",borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(59,130,246,.055)",color:"#ddd",cursor:"pointer",fontFamily:"inherit"}}>
            <div className="private-data" style={{fontSize:12,fontWeight:900,color:"#fff"}}>{p.video.title}</div>
            <div className="private-data" style={{fontSize:10,color:C.muted,marginTop:3}}>{p.client.name} · {p.video.status}</div>
          </button>)}</div>
        </div>}
      </Card>}

      {/* Client Info */}
      <Card>
        <SectionTitle>DADOS DO CLIENTE</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Inp label="Nome / Responsável" value={client.name} onChange={v=>setClient(c=>({...c,name:v}))} placeholder="Nome do cliente"/>
          <Inp label="Empresa" value={client.company} onChange={v=>setClient(c=>({...c,company:v}))} placeholder="Nome da empresa"/>
          <Inp label="Email" value={client.email} onChange={v=>setClient(c=>({...c,email:v}))} placeholder="email@empresa.com"/>
          <Inp label="WhatsApp" value={client.phone} onChange={v=>setClient(c=>({...c,phone:v}))} placeholder="(48) 99999-9999"/>
          <Inp label="Cidade" value={client.city} onChange={v=>setClient(c=>({...c,city:v}))} placeholder="Florianópolis, SC"/>
          <Inp label="CNPJ / CPF" value={client.cnpj} onChange={v=>setClient(c=>({...c,cnpj:v}))} placeholder="Opcional"/>
        </div>
      </Card>

      {/* Services */}
      <Card>
        <SectionTitle action={<Btn onClick={()=>setShowCustom(true)} size="sm" variant="ghost">+ Personalizado</Btn>}>SERVIÇOS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {SERVICES_CATALOG.map(svc=>{
            const sel=isSelected(svc.id);
            return (
              <div key={svc.id} onClick={()=>toggleService(svc)} style={{padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?"#3b82f6":C.border}`,background:sel?"rgba(59,130,246,.1)":C.surface,cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                  <div style={{fontSize:13,fontWeight:700,color:sel?"#fff":"#ccc"}}>{svc.name}</div>
                  <div style={{fontSize:10,color:sel?"#3b82f6":C.muted,fontWeight:700,flexShrink:0,marginLeft:6}}>{sel?"✓":""}</div>
                </div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{svc.desc}</div>
                <div style={{fontSize:13,fontWeight:800,color:sel?"#3b82f6":C.orange}}>{fmtCurrency(svc.price)}</div>
              </div>
            );
          })}
        </div>

        {/* Selected services editor */}
        {selected.length>0&&(
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:4}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>SERVIÇOS SELECIONADOS</div>
            {selected.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"10px 14px",background:"rgba(59,130,246,.07)",borderRadius:10,border:"1px solid rgba(59,130,246,.2)"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#e2e2e2"}}>{s.name}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:700}}>QTD</div>
                    <input type="number" min="1" value={s.qty} onChange={e=>updateQty(s.id,+e.target.value)} style={{width:48,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:"#fff",fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:700}}>VALOR (R$)</div>
                    <input type="number" min="0" value={s.price} onChange={e=>updatePrice(s.id,e.target.value)} style={{width:90,background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:"#fff",fontSize:13,fontWeight:700,outline:"none",textAlign:"right"}}/>
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:"#3b82f6",minWidth:90,textAlign:"right"}}>{fmtCurrency(s.price*s.qty)}</div>
                  <button onClick={()=>setSelected(prev=>prev.filter(x=>x.id!==s.id))} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conditions */}
      <Card>
        <SectionTitle>CONDIÇÕES COMERCIAIS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Desconto (%)</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input type="range" min={0} max={50} value={discount} onChange={e=>setDiscount(+e.target.value)} style={{flex:1,accentColor:C.orange}}/>
              <span style={{fontSize:15,fontWeight:800,color:C.orange,minWidth:36}}>{discount}%</span>
            </div>
          </div>
          <Inp label="Validade da proposta (dias)" value={validity} onChange={setValidity} placeholder="15" type="number"/>
        </div>
        <Inp label="Prazo de entrega" value={deadline} onChange={setDeadline} type="date"/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Forma de pagamento</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {["50% na assinatura + 50% na entrega","100% na assinatura","30% na assinatura + 70% na entrega","Parcelado em 3x","A combinar"].map(opt=>(
              <button key={opt} onClick={()=>setPayTerms(opt)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${payTerms===opt?C.orange:C.border}`,background:payTerms===opt?`${C.orange}12`:"transparent",color:payTerms===opt?C.orange:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                {payTerms===opt?"● ":"○ "}{opt}
              </button>
            ))}
          </div>
        </div>
        <Txt label="Observações / Escopo adicional" value={notes} onChange={setNotes} placeholder="Inclui revisões ilimitadas, direitos de imagem..." rows={3}/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Status da proposta</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {["rascunho","enviada","aceita","recusada"].map(s=><button key={s} onClick={()=>setProposalStatus(s)} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:proposalStatus===s?C.orange:C.border,background:proposalStatus===s?`${C.orange}15`:"transparent",color:proposalStatus===s?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>)}
          </div>
        </div>
      </Card>

      {/* Summary */}
      {selected.length>0&&(
        <Card style={{background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(0,0,0,0))",borderColor:"rgba(59,130,246,.25)"}}>
          <SectionTitle>RESUMO FINANCEIRO</SectionTitle>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:C.muted}}>Subtotal</span>
            <span style={{fontSize:13,color:"#e2e2e2",fontWeight:600}}>{fmtCurrency(total)}</span>
          </div>
          {discount>0&&(
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,color:C.muted}}>Desconto ({discount}%)</span>
              <span style={{fontSize:13,color:"#10b981",fontWeight:700}}>-{fmtCurrency(discountVal)}</span>
            </div>
          )}
          <Divider/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>Total Final</span>
            <span style={{fontSize:28,fontWeight:900,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{fmtCurrency(finalTotal)}</span>
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="mobile-actions">
        <Btn onClick={saveProposalToCRM} disabled={selected.length===0} variant="ghost" style={{justifyContent:"center",fontSize:14,padding:"14px 20px"}}>Salvar no CRM</Btn>
        <Btn onClick={generatePDF} disabled={generating||selected.length===0} variant="proposal" style={{justifyContent:"center",fontSize:15,padding:"14px 20px"}}>
          {generating?"Gerando PDF...":"Gerar PDF"}
        </Btn>
      </div>
      {selected.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:-8}}>Selecione pelo menos um serviço para gerar a proposta</div>}

      <Modal open={showCustom} onClose={()=>setShowCustom(false)} title="Serviço Personalizado">
        <Inp label="Nome do serviço" value={customService.name} onChange={v=>setCustomService(c=>({...c,name:v}))} placeholder="Ex: Consultoria de marca"/>
        <Inp label="Valor (R$)" value={customService.price} onChange={v=>setCustomService(c=>({...c,price:v}))} placeholder="0" type="number"/>
        <Btn onClick={addCustom}>+ Adicionar serviço</Btn>
      </Modal>
    </div>
  );
};

// ── TAB: TAREFAS ───────────────────────────────────────────────────────
const TabTasks = ({state,dispatch})=>{
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",priority:"medium",tag:"",dueDate:""});
  const [filter,setFilter]=useState("all");
  const [prioFilter,setPrioFilter]=useState("all");
  const prios=[["high","#ef4444","Alta"],["medium",C.orange,"Média"],["low","#6b7280","Baixa"]];
  const taskTemplates=[
    {label:"Responder cliente",title:"Responder cliente no WhatsApp",tag:"cliente",priority:"high",dueDate:todayStr()},
    {label:"Enviar proposta",title:"Enviar proposta comercial",tag:"comercial",priority:"high",dueDate:todayStr()},
    {label:"Revisar edição",title:"Revisar edição e anotar ajustes",tag:"produção",priority:"medium",dueDate:addDaysInput(1)},
    {label:"Cobrar pagamento",title:"Cobrar pagamento pendente",tag:"dinheiro",priority:"high",dueDate:todayStr()},
  ];
  const priorityWeight={high:0,medium:1,low:2};
  const inc=state.tasks.filter(t=>!t.completed).sort((a,b)=>(dayDiff(a.dueDate)??9999)-(dayDiff(b.dueDate)??9999)||(priorityWeight[a.priority]??1)-(priorityWeight[b.priority]??1));
  const done=state.tasks.filter(t=>t.completed);
  const buckets=[
    {id:"all",label:"Todas",items:inc,color:C.orange},
    {id:"overdue",label:"Atrasadas",items:inc.filter(t=>taskBucket(t)==="overdue"),color:"#ef4444"},
    {id:"today",label:"Hoje",items:inc.filter(t=>taskBucket(t)==="today"),color:"#10b981"},
    {id:"week",label:"Semana",items:inc.filter(t=>taskBucket(t)==="week"),color:"#3b82f6"},
    {id:"noDate",label:"Sem prazo",items:inc.filter(t=>taskBucket(t)==="noDate"),color:"#6b7280"},
  ];
  const active=buckets.find(b=>b.id===filter)||buckets[0];
  const activeItems=prioFilter==="all"?active.items:active.items.filter(t=>t.priority===prioFilter);
  const dueTag=t=>{const b=taskBucket(t),diff=dayDiff(t.dueDate);if(b==="overdue")return {txt:`${Math.abs(diff)}d atraso`,c:"#ef4444"};if(b==="today")return {txt:"hoje",c:"#10b981"};if(b==="week")return {txt:`${diff}d`,c:"#3b82f6"};if(b==="later")return {txt:new Date(t.dueDate+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"}),c:"#8b5cf6"};return null;};
  return (
    <div>
      <SectionTitle action={<Btn onClick={()=>setShowAdd(true)} size="sm">+ Nova</Btn>}>TAREFAS INTELIGENTES ({inc.length})</SectionTitle>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
        {buckets.map(b=><button key={b.id} onClick={()=>setFilter(b.id)} style={{padding:"10px 8px",borderRadius:12,border:"1px solid",borderColor:filter===b.id?b.color:C.border,background:filter===b.id?`${b.color}14`:"rgba(255,255,255,.025)",color:filter===b.id?b.color:C.muted,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,fontFamily:"'Syne',sans-serif"}}>{b.items.length}</div><div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",marginTop:2}}>{b.label}</div></button>)}
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
        {[["all",C.orange,"Todas"],...prios].map(([k,c,l])=><button key={k} onClick={()=>setPrioFilter(k)} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:prioFilter===k?c:C.border,background:prioFilter===k?`${c}14`:"transparent",color:prioFilter===k?c:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
      </div>
      {activeItems.length===0&&<Card style={{textAlign:"center",padding:"24px 20px"}}><div style={{fontSize:26,marginBottom:8}}>✓</div><div style={{fontSize:13,color:C.muted}}>Nada nesse filtro.</div></Card>}
      {activeItems.map(t=>{const p=prios.find(p=>p[0]===t.priority),d=dueTag(t);return(
        <Card key={t.id} style={{marginBottom:8,padding:"12px 16px"}}>
          <div className="client-list-row" style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:22,height:22,borderRadius:7,border:`2px solid ${C.border}`,background:"transparent",cursor:"pointer",flexShrink:0,transition:"all .2s"}} onMouseEnter={e=>e.target.style.borderColor=C.orange} onMouseLeave={e=>e.target.style.borderColor=C.border}/>
            <div style={{flex:1}}><div style={{fontSize:13,color:"#e2e2e2"}}>{t.title}</div>{t.dueDate&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📅 {t.dueDate}</div>}</div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>{d&&<Tag color={d.c}>{d.txt}</Tag>}{t.tag&&<Tag color="#6b7280">{t.tag}</Tag>}<Tag color={p?.[1]||C.orange}>{p?.[2]}</Tag><button onClick={()=>dispatch({type:"REMOVE_TASK",id:t.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button></div>
          </div>
        </Card>
      );})}
      {done.length>0&&<>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",margin:"16px 0 10px"}}>CONCLUÍDAS ({done.length})</div>
        {done.slice(0,5).map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7,opacity:.4}}>
            <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:22,height:22,borderRadius:7,background:`${C.orange}30`,border:`2px solid ${C.orange}`,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✓</button>
            <span style={{flex:1,fontSize:13,color:C.muted,textDecoration:"line-through"}}>{t.title}</span>
            {t.completedAt&&<span style={{fontSize:10,color:C.muted}}>{t.completedAt}</span>}
            <button onClick={()=>dispatch({type:"REMOVE_TASK",id:t.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button>
          </div>
        ))}
      </>}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Nova Tarefa">
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:800,textTransform:"uppercase"}}>Começar sem digitar</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {taskTemplates.map(t=><button key={t.label} onClick={()=>setForm(f=>({...f,title:t.title,tag:t.tag,priority:t.priority,dueDate:t.dueDate}))} style={{padding:"7px 11px",borderRadius:9,border:`1px solid ${form.title===t.title?C.orange:C.border}`,background:form.title===t.title?`${C.orange}15`:"rgba(255,255,255,.035)",color:form.title===t.title?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{t.label}</button>)}
          </div>
        </div>
        <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Descreva a tarefa..."/>
        <Inp label="Tag" value={form.tag} onChange={v=>setForm(f=>({...f,tag:v}))} placeholder="Ex: marca, projeto..."/>
        <Inp label="Prazo" value={form.dueDate} onChange={v=>setForm(f=>({...f,dueDate:v}))} type="date"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Prioridade</div>
          <div style={{display:"flex",gap:7}}>{prios.map(([k,c,l])=><button key={k} onClick={()=>setForm(f=>({...f,priority:k}))} style={{padding:"6px 13px",borderRadius:9,border:"1px solid",borderColor:form.priority===k?c:C.border,background:form.priority===k?`${c}15`:"transparent",color:form.priority===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>)}</div>
        </div>
        <Btn onClick={()=>{if(!form.title)return;dispatch({type:"ADD_TASK",task:form});setForm({title:"",priority:"medium",tag:"",dueDate:""});setShowAdd(false);}}>💾 Criar</Btn>
      </Modal>
    </div>
  );
};

// ── TAB: CLIENTES ──────────────────────────────────────────────────────
const TabClients = ({state,dispatch,privacyMode})=>{
  const [showAdd,setShowAdd]=useState(false),[selected,setSelected]=useState(null);
  const [showInteraction,setShowInteraction]=useState(false),[showVideo,setShowVideo]=useState(false);
  const [intForm,setIntForm]=useState({type:"reunião",note:""});
  const [videoForm,setVideoForm]=useState({title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:"Briefing\nRoteiro\nCaptação\nEdição\nRevisão\nEntrega"});
  const [editClient,setEditClient]=useState(null);
  const [view,setView]=useState("pipeline");
  const [draggingClient,setDraggingClient]=useState(null);
  const [filters,setFilters]=useState({temp:"all",payment:"all",origin:"all",follow:"all"});
  const [segment,setSegment]=useState("all");
  const E={name:"",service:"",value:"",status:"lead",payment:"pendente",contract:"",nextMeeting:"",email:"",phone:"",notes:"",nextAction:"",followUpDate:"",leadTemp:"morno",leadSource:"",probability:50,relationshipType:"cliente",monthlyValue:"",barterDetails:"",partnerTerms:"",freelancerRole:"",freelancerRate:"",availability:"",pix:"",portfolio:""};
  const [cf,setCf]=useState(E);
  const clients=state.clients||[],client=clients.find(c=>c.id===selected);
  const totalReceivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0);
  const isFollowPending=c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&! ["entregue","pago"].includes(normalizeClientStatus(c));
  const forecast=c=>Math.round(Number(c.value||0)*Number(c.probability??50)/100);
  const saveClient=()=>{if(!cf.name)return;if(editClient){dispatch({type:"UPDATE_CLIENT",id:editClient,data:cf});setEditClient(null);}else dispatch({type:"ADD_CLIENT",client:cf});setCf(E);setShowAdd(false);};
  const applyClientPreset=p=>setCf(f=>({...f,service:p.service,value:p.value,nextAction:f.nextAction||"Enviar briefing e alinhar prazo",followUpDate:f.followUpDate||addDaysInput(2),leadTemp:f.leadTemp||"morno",probability:f.probability||50,notes:f.notes||`Pacote sugerido: ${p.title}.`}));
  const applyVideoPreset=p=>setVideoForm(f=>({...f,presetId:p.id,title:p.title,type:p.type,deadline:f.deadline||addDaysInput(14),checklist:audiovisualChecklistText(p)}));
  const pipeline=CLIENT_PIPELINE;
  const pipelineKeys=pipeline.map(p=>p.key);
  const origins=[...new Set(clients.map(c=>c.leadSource).filter(Boolean))];
  const leadSourceChips=["Indicação","Instagram","WhatsApp","Site","Evento","Prospecção","Networking","Parceria local"];
  const nextActionChips=["Enviar proposta","Pedir briefing","Marcar reunião","Cobrar retorno","Enviar contrato","Criar projeto"];
  const clientPresetOptions=AUDIOVISUAL_PRESETS.map(p=>({value:p.id,label:p.label,description:`${p.service} · ${fmtCurrency(p.value)}`,icon:"▦"}));
  const selectedPresetId=AUDIOVISUAL_PRESETS.find(p=>p.service===cf.service)?.id||"";
  const clientFlowOptions=[
    {value:"cliente",label:"Cliente novo",icon:"+"},
    {value:"recorrente",label:"Mensalista",icon:"↻"},
    {value:"parceria",label:"Permuta",icon:"◇"},
    {value:"freelancer",label:"Freelancer",icon:"✦"},
  ];
  const relationshipOptions=RELATIONSHIP_TYPES.filter(r=>r.id!=="all").map(r=>({value:r.id,label:r.label,description:r.desc,icon:r.id==="recorrente"?"↻":r.id==="parceria"?"◇":r.id==="freelancer"?"✦":"+"}));
  const leadSourceOptions=leadSourceChips.map(item=>({value:item,label:item}));
  const nextActionOptions=nextActionChips.map(item=>({value:item,label:item}));
  const followUpOptions=[
    {value:addDaysInput(0),label:"Hoje"},
    {value:addDaysInput(1),label:"Amanhã"},
    {value:addDaysInput(2),label:"+2 dias"},
    {value:addDaysInput(7),label:"+7 dias"},
  ];
  const meetingShortcutOptions=[
    {value:addDaysInput(0),label:"Hoje"},
    {value:addDaysInput(1),label:"Amanhã"},
    {value:addDaysInput(7),label:"+7 dias"},
    {value:addDaysInput(14),label:"+14 dias"},
  ];
  const filteredClients=clients.filter(c=>
    (segment==="all"||relationType(c)===segment)&&
    (filters.temp==="all"||(c.leadTemp||"morno")===filters.temp)&&
    (filters.payment==="all"||c.payment===filters.payment)&&
    (filters.origin==="all"||c.leadSource===filters.origin)&&
    (filters.follow==="all"||(filters.follow==="pending"?isFollowPending(c):!isFollowPending(c)))
  );
  const selectedRelation=RELATIONSHIP_TYPES.find(r=>r.id===segment)||RELATIONSHIP_TYPES[0];
  const selectRelationshipType=type=>setCf(f=>({...f,relationshipType:type,status:type==="freelancer"?"briefing":f.status,payment:type==="parceria"?"pendente":f.payment}));
  const applyClientQuickStart=type=>{
    const presets={
      cliente:{relationshipType:"cliente",status:"lead",leadTemp:"morno",probability:50,leadSource:"Instagram",nextAction:"Pedir briefing",followUpDate:addDaysInput(1)},
      recorrente:{relationshipType:"recorrente",status:"em_producao",payment:"pendente",leadTemp:"quente",probability:70,leadSource:"Indicação",service:"Pacote mensal de conteúdo",nextAction:"Enviar contrato mensal",followUpDate:addDaysInput(2)},
      parceria:{relationshipType:"parceria",status:"briefing",payment:"pendente",leadTemp:"morno",probability:60,leadSource:"Networking",service:"Permuta audiovisual",nextAction:"Alinhar contrapartidas",followUpDate:addDaysInput(2),barterDetails:"Conteúdo audiovisual em troca de divulgação, produto ou serviço."},
      freelancer:{relationshipType:"freelancer",status:"briefing",payment:"pendente",leadTemp:"quente",probability:80,leadSource:"Networking",service:"Freelancer audiovisual",freelancerRole:"Editor / filmmaker",nextAction:"Confirmar disponibilidade",followUpDate:addDaysInput(1)}
    };
    setCf(f=>({...f,...(presets[type]||presets.cliente)}));
  };
  const removeClient=c=>{
    if(!c)return;
    const linked=(c.videos||[]).length+(c.proposals||[]).length+(c.interactions||[]).length;
    const detail=linked?` Isso também remove ${linked} registro${linked!==1?"s":""} vinculados.`:"";
    if(!window.confirm(`Excluir ${c.name}?${detail}`))return;
    dispatch({type:"REMOVE_CLIENT",id:c.id,skipConfirm:true});
    if(String(selected)===String(c.id))setSelected(null);
  };
  const moveClientToStage=(clientId,status)=>{
    const id=Number(clientId);
    if(!id||!status)return;
    dispatch({type:"UPDATE_CLIENT",id,data:{status},silent:true});
    setDraggingClient(null);
  };
  const editClientFromList=c=>{
    setCf({...E,name:c.name,service:c.service||"",value:c.value||"",status:normalizeClientStatus(c),payment:c.payment||"pendente",contract:c.contract||"",nextMeeting:c.nextMeeting||"",email:c.email||"",phone:c.phone||"",notes:c.notes||"",nextAction:c.nextAction||"",followUpDate:c.followUpDate||"",leadTemp:c.leadTemp||"morno",leadSource:c.leadSource||"",probability:c.probability??50,relationshipType:relationType(c),monthlyValue:c.monthlyValue||"",barterDetails:c.barterDetails||"",partnerTerms:c.partnerTerms||"",freelancerRole:c.freelancerRole||"",freelancerRate:c.freelancerRate||"",availability:c.availability||"",pix:c.pix||"",portfolio:c.portfolio||""});
    setEditClient(c.id);
    setShowAdd(true);
  };
  const renderClientSmartForm=()=>(
    <>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Pacote sugerido</div>
        <OptionCards options={clientPresetOptions} value={selectedPresetId} onChange={id=>applyClientPreset(presetById(id))}/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Começar como</div>
        <ChipSelector options={clientFlowOptions} value={cf.relationshipType} onChange={applyClientQuickStart} columns={4}/>
      </div>
      <div style={{marginBottom:16,padding:"14px",borderRadius:16,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Tipo de relação comercial</div>
        <OptionCards options={relationshipOptions} value={cf.relationshipType} onChange={selectRelationshipType}/>
        {cf.relationshipType==="recorrente"&&(
          <div className="client-modal-grid" style={{marginTop:14}}>
            <div style={{marginBottom:18}}><CurrencyInput label="Mensalidade" value={cf.monthlyValue} onChange={v=>setCf(f=>({...f,monthlyValue:v,value:v||f.value}))}/></div>
            <Inp label="Escopo mensal" value={cf.service} onChange={v=>setCf(f=>({...f,service:v}))} placeholder="Ex: 8 reels + gestão de edição"/>
            <Inp label="Contrato até" value={cf.contract} onChange={v=>setCf(f=>({...f,contract:v}))} type="date"/>
          </div>
        )}
        {cf.relationshipType==="parceria"&&(
          <div style={{marginTop:14}}>
            <Txt label="Troca / permuta" value={cf.barterDetails} onChange={v=>setCf(f=>({...f,barterDetails:v}))} placeholder="O que cada lado entrega, limites e valor percebido" rows={2}/>
            <Txt label="Termos da parceria" value={cf.partnerTerms} onChange={v=>setCf(f=>({...f,partnerTerms:v}))} placeholder="Uso de imagem, publicação, créditos, prazos, contrapartidas" rows={2}/>
          </div>
        )}
        {cf.relationshipType==="freelancer"&&(
          <div className="client-modal-grid" style={{marginTop:14}}>
            <Inp label="Função" value={cf.freelancerRole} onChange={v=>setCf(f=>({...f,freelancerRole:v,service:v||f.service}))} placeholder="Editor, filmmaker, áudio..."/>
            <div style={{marginBottom:18}}><CurrencyInput label="Cachê / diária" value={cf.freelancerRate} onChange={v=>setCf(f=>({...f,freelancerRate:v,value:v||f.value}))}/></div>
            <Inp label="Disponibilidade" value={cf.availability} onChange={v=>setCf(f=>({...f,availability:v}))} placeholder="Dias, horários, cidade"/>
            <Inp label="PIX / dados" value={cf.pix} onChange={v=>setCf(f=>({...f,pix:v}))} placeholder="Chave PIX ou dados de pagamento"/>
            <Inp label="Portfólio" value={cf.portfolio} onChange={v=>setCf(f=>({...f,portfolio:v}))} placeholder="Link"/>
          </div>
        )}
      </div>
      <div className="client-modal-grid">
        <Inp label="Nome" value={cf.name} onChange={v=>setCf(f=>({...f,name:v}))} placeholder="Nome do cliente"/>
        <Inp label="Serviço" value={cf.service} onChange={v=>setCf(f=>({...f,service:v}))} placeholder="Ex: Vídeo institucional"/>
        <div style={{marginBottom:18}}><CurrencyInput label="Valor" value={cf.value} onChange={v=>setCf(f=>({...f,value:v}))}/></div>
        <Inp label="Email" value={cf.email} onChange={v=>setCf(f=>({...f,email:v}))} placeholder="email@exemplo.com"/>
        <div style={{marginBottom:18}}><MaskedInput label="WhatsApp" value={cf.phone} onChange={v=>setCf(f=>({...f,phone:v}))} placeholder="(48) 99999-9999"/></div>
        <Inp label="Próxima reunião" value={cf.nextMeeting} onChange={v=>setCf(f=>({...f,nextMeeting:v}))} type="date"/>
        <Inp label="Contrato até" value={cf.contract} onChange={v=>setCf(f=>({...f,contract:v}))} type="date"/>
        <Inp label="Origem personalizada" value={cf.leadSource} onChange={v=>setCf(f=>({...f,leadSource:v}))} placeholder="Instagram, indicação, site..."/>
        <Inp label="Próxima ação livre" value={cf.nextAction} onChange={v=>setCf(f=>({...f,nextAction:v}))} placeholder="Enviar orçamento, cobrar briefing..."/>
        <Inp label="Follow-up" value={cf.followUpDate} onChange={v=>setCf(f=>({...f,followUpDate:v}))} type="date"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"2px 0 16px"}} className="modal-grid">
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Origem rápida</div>
          <ChipSelector options={leadSourceOptions} value={cf.leadSource} onChange={v=>setCf(f=>({...f,leadSource:v}))} size="sm"/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Próxima ação rápida</div>
          <ChipSelector options={nextActionOptions} value={cf.nextAction} onChange={v=>setCf(f=>({...f,nextAction:v,followUpDate:f.followUpDate||addDaysInput(1)}))} size="sm"/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"2px 0 16px"}} className="modal-grid">
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de reunião</div>
          <ChipSelector options={meetingShortcutOptions} value={cf.nextMeeting} onChange={v=>setCf(f=>({...f,nextMeeting:v}))} size="sm"/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de follow-up</div>
          <ChipSelector options={followUpOptions} value={cf.followUpDate} onChange={v=>setCf(f=>({...f,followUpDate:v}))} size="sm"/>
        </div>
      </div>
      <div className="client-modal-controls">
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Etapa do pipeline</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CLIENT_PIPELINE.map(stage=><button key={stage.key} onClick={()=>setCf(f=>({...f,status:stage.key}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:normalizeClientStatus(cf)===stage.key?stage.color:C.border,background:normalizeClientStatus(cf)===stage.key?`${stage.color}15`:"transparent",color:normalizeClientStatus(cf)===stage.key?stage.color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{stage.label}</button>)}</div></div>
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Pagamento</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(PAG_COLORS).map(([k,c])=><button key={k} onClick={()=>setCf(f=>({...f,payment:k}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:cf.payment===k?c:C.border,background:cf.payment===k?`${c}15`:"transparent",color:cf.payment===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{k}</button>)}</div></div>
        <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Temperatura</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(TEMP_COLORS).map(([k,c])=><button key={k} onClick={()=>setCf(f=>({...f,leadTemp:k}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:cf.leadTemp===k?c:C.border,background:cf.leadTemp===k?`${c}15`:"transparent",color:cf.leadTemp===k?c:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{k}</button>)}</div></div>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Probabilidade: {cf.probability}%</div>
          <input type="range" min={0} max={100} step={5} value={cf.probability} onChange={e=>setCf(f=>({...f,probability:+e.target.value}))} style={{width:"100%",accentColor:C.orange}}/>
          <div style={{fontSize:11,color:"#10b981",fontWeight:800,marginTop:4}}>Previsão: {fmtCurrency(Number(cf.value||0)*Number(cf.probability||0)/100)}</div>
        </div>
      </div>
      <Txt label="Observações" value={cf.notes} onChange={v=>setCf(f=>({...f,notes:v}))} placeholder="Briefing, preferências..." rows={3}/>
      <Btn onClick={saveClient} style={{position:"sticky",bottom:-2,width:"100%",justifyContent:"center",marginTop:6,boxShadow:"0 -14px 26px rgba(24,24,24,.95)"}}>Salvar cliente</Btn>
    </>
  );

  if(selected&&client){
    const pv=(client.videos||[]).filter(v=>v.status!=="entregue").length;
    const timeline=[
      client.createdAt&&{date:client.createdAt,type:"Cliente",color:C.orange,title:"Cliente cadastrado",meta:client.service||""},
      client.nextMeeting&&{date:client.nextMeeting,type:"Reunião",color:"#3b82f6",title:"Próxima reunião",meta:client.nextAction||""},
      client.followUpDate&&{date:client.followUpDate,type:"Follow-up",color:isFollowPending(client)?"#ef4444":"#eab308",title:"Follow-up programado",meta:client.nextAction||""},
      ...(client.interactions||[]).map(i=>({date:i.date,type:i.type,color:C.orange,title:i.note,meta:"Interação"})),
      ...(client.videos||[]).map(v=>({date:v.deadline||client.createdAt,type:"Projeto",color:VIDEO_COLORS[v.status]||"#8b5cf6",title:v.title,meta:v.status})),
      ...(client.proposals||[]).map(p=>({date:p.createdAt,type:"Proposta",color:p.status==="aceita"?"#10b981":p.status==="recusada"?"#ef4444":p.status==="enviada"?"#3b82f6":C.orange,title:p.projectTitle||`Proposta ${p.status}`,meta:`${p.status} · ${fmtMoney(p.total,privacyMode)}`})),
      ...(state.financeEntries||[]).filter(e=>String(e.clientId)===String(client.id)).map(e=>({date:e.date,type:e.type==="despesa"?"Despesa":"Receita",color:e.type==="despesa"?"#ef4444":"#10b981",title:e.title,meta:`${e.status} · ${fmtMoney(e.value,privacyMode)}`}))
    ].filter(Boolean).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:C.orange,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:16,transition:"opacity .15s"}} onMouseEnter={e=>e.target.style.opacity=".7"} onMouseLeave={e=>e.target.style.opacity="1"}>← Voltar</button>
        <Card style={{background:`${STATUS_COLORS[normalizeClientStatus(client)]||C.orange}08`,borderColor:`${STATUS_COLORS[normalizeClientStatus(client)]||C.orange}25`,marginBottom:14}}>
          <div className="client-detail-head">
            <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}><Tag color={STATUS_COLORS[normalizeClientStatus(client)]||C.orange}>{clientStageLabel(client)}</Tag><Tag color={PAG_COLORS[client.payment]||C.orange}>{client.payment}</Tag><Tag color={TEMP_COLORS[client.leadTemp]||"#eab308"}>{client.leadTemp||"morno"}</Tag><Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(client))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(client))||RELATIONSHIP_TYPES[1]).label}</Tag>{isFollowPending(client)&&<Tag color="#ef4444">follow-up</Tag>}</div><div className="private-data" style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{client.name}</div>{client.service&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{client.service}</div>}</div>
            <div className="client-detail-value" style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(client.value,privacyMode)}</div><div style={{fontSize:11,color:C.muted}}>contrato</div></div>
          </div>
          <Divider/>
          <div className="mobile-two-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {client.email&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>EMAIL</div><div className="private-data" style={{fontSize:13,color:"#ccc"}}>{client.email}</div></div>}
            {client.phone&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>TELEFONE</div><div className="private-data" style={{fontSize:13,color:"#ccc"}}>{client.phone}</div></div>}
            {client.nextMeeting&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PRÓXIMA REUNIÃO</div><div style={{fontSize:13,color:C.orange,fontWeight:700}}>📅 {new Date(client.nextMeeting+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            {client.contract&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>CONTRATO ATÉ</div><div style={{fontSize:13,color:"#ccc"}}>📋 {new Date(client.contract+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            {client.nextAction&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PRÓXIMA AÇÃO</div><div style={{fontSize:13,color:"#ccc"}}>{client.nextAction}</div></div>}
            {client.followUpDate&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>FOLLOW-UP</div><div style={{fontSize:13,color:isFollowPending(client)?"#ef4444":"#ccc",fontWeight:700}}>{new Date(client.followUpDate+"T00:00").toLocaleDateString("pt-BR")}</div></div>}
            <div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>PREVISÃO</div><div style={{fontSize:13,color:"#10b981",fontWeight:800}}>{fmtMoney(forecast(client),privacyMode)} · {client.probability??50}%</div></div>
            {client.leadSource&&<div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>ORIGEM</div><div style={{fontSize:13,color:"#ccc"}}>{client.leadSource}</div></div>}
            <div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>TIPO DE RELAÇÃO</div><div style={{fontSize:13,color:"#ccc"}}>{relationMeta(client)}</div></div>
          </div>
          {client.notes&&<><Divider/><div style={{fontSize:13,color:"#bbb",lineHeight:1.5}}>{client.notes}</div></>}
          <Divider/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn onClick={()=>editClientFromList(client)} size="sm" variant="ghost">Editar</Btn>
            <Btn onClick={()=>dispatch({type:"UPDATE_CLIENT",id:client.id,data:{payment:client.payment==="pago"?"pendente":"pago"}})} size="sm" variant={client.payment==="pago"?"ghost":"success"}>💰 {client.payment==="pago"?"Marcar pendente":"Marcar pago"}</Btn>
            <Btn onClick={()=>removeClient(client)} size="sm" variant="danger">Excluir cliente</Btn>
          </div>
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle>TIMELINE DO CLIENTE</SectionTitle>
          {timeline.length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Sem eventos registrados.</div>}
          {timeline.slice(0,10).map((e,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"18px 1fr",gap:10,marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:10,height:10,borderRadius:99,background:e.color,boxShadow:`0 0 12px ${e.color}55`,marginTop:4}}/>{i<timeline.length-1&&<span style={{width:1,flex:1,minHeight:24,background:C.border,marginTop:4}}/>}</div>
              <div style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:4}}><Tag color={e.color}>{e.type}</Tag><span style={{fontSize:10,color:C.muted}}>{e.date}</span></div>
                <div className="private-data" style={{fontSize:13,color:"#eee",fontWeight:800,lineHeight:1.35}}>{e.title}</div>
                {e.meta&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{e.meta}</div>}
              </div>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle action={<Btn onClick={()=>setShowVideo(true)} size="sm">+ Vídeo</Btn>}>VÍDEOS ({(client.videos||[]).length}) {pv>0&&<Tag color="#eab308">{pv} pendentes</Tag>}</SectionTitle>
          {(client.videos||[]).length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhum vídeo cadastrado</div>}
          {(client.videos||[]).map(v=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
              <div style={{flex:1}}><div style={{fontSize:13,color:"#e2e2e2",fontWeight:600}}>{v.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{v.type}</div></div>
              <select value={v.status} onChange={e=>dispatch({type:"UPDATE_CLIENT_VIDEO",clientId:client.id,videoId:v.id,data:{status:e.target.value}})} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:VIDEO_COLORS[v.status]||"#fff",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none"}}>
                {VIDEO_STATUS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>dispatch({type:"REMOVE_CLIENT_VIDEO",clientId:client.id,videoId:v.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:14}}>
          <SectionTitle>PROPOSTAS ({(client.proposals||[]).length})</SectionTitle>
          {(client.proposals||[]).length===0&&<PremiumEmpty icon="§" title="Nenhuma proposta salva" text="Crie uma proposta a partir deste cliente para registrar rascunhos, envios e aprovações no CRM." action={null}/>}
          {(client.proposals||[]).map(p=>(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 32px",gap:8,alignItems:"center",marginBottom:8,padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}>
              <div><div style={{fontSize:13,color:"#e2e2e2",fontWeight:800}}>{p.projectTitle||"Proposta comercial"}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{p.createdAt} · {fmtMoney(p.total,privacyMode)}</div></div>
              <select value={p.status} onChange={e=>dispatch({type:"UPDATE_CLIENT_PROPOSAL",clientId:client.id,proposalId:p.id,data:{status:e.target.value}})} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 8px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none"}}>
                {["rascunho","enviada","aceita","recusada"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>dispatch({type:"REMOVE_CLIENT_PROPOSAL",clientId:client.id,proposalId:p.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle action={<Btn onClick={()=>setShowInteraction(true)} size="sm">+ Registrar</Btn>}>HISTÓRICO ({(client.interactions||[]).length})</SectionTitle>
          {(client.interactions||[]).length===0&&<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhuma interação registrada</div>}
          {[...(client.interactions||[])].reverse().map(int=>(
            <div key={int.id} style={{marginBottom:10,padding:"12px 14px",background:"rgba(255,255,255,.03)",borderRadius:12,borderLeft:`3px solid ${C.orange}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",gap:7,alignItems:"center"}}><Tag color={C.orange}>{int.type}</Tag><span style={{fontSize:11,color:C.muted}}>{int.date}</span></div><button onClick={()=>dispatch({type:"REMOVE_CLIENT_INTERACTION",clientId:client.id,intId:int.id})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button></div>
              <p style={{margin:0,fontSize:13,color:"#ccc",lineHeight:1.5}}>{int.note}</p>
            </div>
          ))}
        </Card>
        <Modal open={showInteraction} onClose={()=>setShowInteraction(false)} title="Registrar Interação">
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Tipo</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["reunião","ligação","email","whatsapp","briefing","entrega","feedback","outro"].map(t=><button key={t} onClick={()=>setIntForm(f=>({...f,type:t}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:intForm.type===t?C.orange:C.border,background:intForm.type===t?`${C.orange}15`:"transparent",color:intForm.type===t?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div></div>
          <Txt label="Anotação" value={intForm.note} onChange={v=>setIntForm(f=>({...f,note:v}))} placeholder="Descreva o que foi discutido..." rows={4}/>
          <Btn onClick={()=>{if(!intForm.note)return;dispatch({type:"ADD_CLIENT_INTERACTION",id:client.id,interaction:{type:intForm.type,note:intForm.note}});setIntForm({type:"reunião",note:""});setShowInteraction(false);}}>💾 Salvar</Btn>
        </Modal>
        <Modal open={showVideo} onClose={()=>setShowVideo(false)} title="Novo Vídeo">
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Preset audiovisual</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {AUDIOVISUAL_PRESETS.map(p=><button key={p.id} onClick={()=>applyVideoPreset(p)} style={{padding:"6px 11px",borderRadius:9,border:"1px solid",borderColor:videoForm.title===p.title?C.orange:C.border,background:videoForm.title===p.title?`${C.orange}15`:"rgba(255,255,255,.025)",color:videoForm.title===p.title?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{p.label}</button>)}
            </div>
          </div>
          <Inp label="Título" value={videoForm.title} onChange={v=>setVideoForm(f=>({...f,title:v}))} placeholder="Ex: Reel institucional"/>
          <Inp label="Prazo" value={videoForm.deadline} onChange={v=>setVideoForm(f=>({...f,deadline:v}))} type="date"/>
          <Inp label="Link / pasta" value={videoForm.link} onChange={v=>setVideoForm(f=>({...f,link:v}))} placeholder="Drive, Frame.io, pasta do projeto..."/>
          <div style={{marginBottom:13}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Tipo</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["gravação","edição","motion","drone","entrevista","vertical","evento","documentário","ads"].map(t=><button key={t} onClick={()=>setVideoForm(f=>({...f,type:t}))} style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:videoForm.type===t?C.orange:C.border,background:videoForm.type===t?`${C.orange}15`:"transparent",color:videoForm.type===t?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div></div>
          <Txt label="Checklist de produção" value={videoForm.checklist} onChange={v=>setVideoForm(f=>({...f,checklist:v}))} rows={5}/>
          <Btn onClick={()=>{if(!videoForm.title)return;dispatch({type:"ADD_CLIENT_VIDEO",id:client.id,video:buildVideoProject({...videoForm,checklist:videoForm.checklist.split("\n").filter(Boolean)})});setVideoForm({title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:"Briefing\nRoteiro\nCaptação\nEdição\nRevisão\nEntrega"});setShowVideo(false);}}>Salvar vídeo</Btn>
        </Modal>
        <Modal open={showAdd} onClose={()=>{setShowAdd(false);setEditClient(null);}} title="Editar Cliente" wide>
          {renderClientSmartForm()}
        </Modal>
      </div>
    );
  }
  return (
    <div>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{clients.filter(c=>["briefing","proposta_enviada","em_producao"].includes(normalizeClientStatus(c))).length}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Em operação</div></Card>
        <Card style={{padding:"14px 16px",textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:privacyMode?18:13,fontWeight:800,color:"#eab308",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(totalReceivable,privacyMode)}</div>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>A receber</div>
        </Card>
        <Card style={{padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#8b5cf6",fontFamily:"'Syne',sans-serif"}}>{clients.reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0)}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Vídeos pendentes</div></Card>
      </div>
      <Card style={{padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8}} className="modal-grid">
          {RELATIONSHIP_TYPES.map(r=>{
            const count=r.id==="all"?clients.length:clients.filter(c=>relationType(c)===r.id).length;
            return <button key={r.id} onClick={()=>setSegment(r.id)} style={{textAlign:"left",padding:"10px 11px",borderRadius:12,border:"1px solid",borderColor:segment===r.id?r.color:C.border,background:segment===r.id?`${r.color}15`:"rgba(255,255,255,.03)",color:segment===r.id?r.color:"#ddd",cursor:"pointer",fontFamily:"inherit"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:".06em"}}>{r.label}</span><span style={{fontSize:14,fontWeight:900}}>{count}</span></div>
              <div style={{fontSize:10,color:C.muted,marginTop:4,lineHeight:1.3}}>{r.desc}</div>
            </button>;
          })}
        </div>
      </Card>
      <div className="client-toolbar" style={{alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:6,padding:4,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:12}}>
          {[["pipeline","Pipeline"],["list","Lista"]].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:"7px 12px",borderRadius:9,border:"none",background:view===k?`${C.orange}18`:"transparent",color:view===k?C.orange:C.muted,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <Btn onClick={()=>{setCf(E);setEditClient(null);setShowAdd(true);}} size="sm">+ Cliente</Btn>
      </div>
      {clients.length>0&&<Card style={{padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}} className="modal-grid">
          <select value={filters.temp} onChange={e=>setFilters(f=>({...f,temp:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Temperatura</option>{Object.keys(TEMP_COLORS).map(k=><option key={k} value={k}>{k}</option>)}</select>
          <select value={filters.payment} onChange={e=>setFilters(f=>({...f,payment:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Pagamento</option>{Object.keys(PAG_COLORS).map(k=><option key={k} value={k}>{k}</option>)}</select>
          <select value={filters.origin} onChange={e=>setFilters(f=>({...f,origin:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Origem</option>{origins.map(o=><option key={o} value={o}>{o}</option>)}</select>
          <select value={filters.follow} onChange={e=>setFilters(f=>({...f,follow:e.target.value}))} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none"}}><option value="all">Follow-up</option><option value="pending">Pendente</option><option value="clear">Em dia</option></select>
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:8}}>{filteredClients.length} em {selectedRelation.label.toLowerCase()} · {clients.length} relações cadastradas</div>
      </Card>}
      {clients.length===0&&<PremiumEmpty icon="◈" title="Comece pelo primeiro cliente" text="Cadastre um lead ou cliente ativo. A partir dele você cria projetos, propostas, follow-ups e previsão de receita." action={<Btn onClick={()=>{setCf(E);setEditClient(null);setShowAdd(true);}} size="sm">Criar cliente</Btn>}/>}
      {clients.length>0&&filteredClients.length===0&&<Card style={{textAlign:"center",padding:"24px 20px",marginBottom:14}}><div style={{fontSize:13,color:C.muted}}>Nenhum cliente combina com esses filtros.</div></Card>}
      {view==="pipeline"&&filteredClients.length>0&&(
        <div className="pipeline-board" style={{marginBottom:16}}>
          {pipeline.map(col=>{
            const items=filteredClients.filter(c=>normalizeClientStatus(c)===col.key);
            const sum=items.reduce((a,c)=>a+Number(c.value||0),0);
            const weighted=items.reduce((a,c)=>a+forecast(c),0);
            return (
              <div key={col.key} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}} onDrop={e=>{e.preventDefault();moveClientToStage(e.dataTransfer.getData("text/plain")||draggingClient,col.key);}} style={{background:"rgba(255,255,255,.025)",border:`1px solid ${draggingClient?`${col.color}55`:C.border}`,borderRadius:14,padding:10,minHeight:160,transition:"border-color .16s ease, background .16s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div><div style={{fontSize:11,color:col.color,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>{col.label}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{items.length} cliente{items.length!==1?"s":""}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:800,color:col.color}}>{fmtMoney(sum,privacyMode)}</div><div style={{fontSize:9,color:C.muted}}>prev. {fmtMoney(weighted,privacyMode)}</div></div>
                </div>
                {items.length===0&&<div style={{border:`1px dashed ${C.border}`,borderRadius:12,padding:"16px 10px",fontSize:12,color:C.muted,textAlign:"center"}}>Vazio</div>}
                {items.map(c=>{
                  const pv=(c.videos||[]).filter(v=>v.status!=="entregue").length;
                  const dtm=c.nextMeeting?Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24)):null;
                  const next=pipeline[pipeline.findIndex(p=>p.key===col.key)+1];
                  return (
                    <div key={c.id} className="card-hover client-drag-card" draggable onDragStart={e=>{e.dataTransfer.setData("text/plain",String(c.id));e.dataTransfer.effectAllowed="move";setDraggingClient(c.id);}} onDragEnd={()=>setDraggingClient(null)} onClick={()=>setSelected(c.id)} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${col.color}22`,borderRadius:12,padding:"12px 12px",marginBottom:8,cursor:"grab",opacity:String(draggingClient)===String(c.id)?.55:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"flex-start",marginBottom:6}}>
                        <div className="private-data" style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1.25}}>{c.name}</div>
                        <div style={{fontSize:11,fontWeight:800,color:"#10b981",whiteSpace:"nowrap"}}>{fmtMoney(forecast(c),privacyMode)}</div>
                      </div>
                      {c.service&&<div style={{fontSize:11,color:C.muted,lineHeight:1.35,marginBottom:5}}>{c.service}</div>}
                      <div style={{fontSize:10,color:"#aaa",lineHeight:1.35,marginBottom:8}}>{relationMeta(c)}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
                        <Tag color={PAG_COLORS[c.payment]||C.orange}>{c.payment}</Tag>
                        <Tag color={TEMP_COLORS[c.leadTemp]||"#eab308"}>{c.leadTemp||"morno"}</Tag>
                        <Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).label}</Tag>
                        <Tag color="#10b981">{c.probability??50}%</Tag>
                        {pv>0&&<Tag color="#8b5cf6">{pv} vídeo{pv>1?"s":""}</Tag>}
                        {dtm!==null&&dtm<=7&&dtm>=0&&<Tag color="#3b82f6">{dtm===0?"hoje":`${dtm}d`}</Tag>}
                        {isFollowPending(c)&&<Tag color="#ef4444">follow-up</Tag>}
                      </div>
                      {c.nextAction&&<div style={{fontSize:11,color:"#bbb",lineHeight:1.35,marginBottom:8}}>Próxima ação: {c.nextAction}</div>}
                      <div style={{fontSize:9,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",margin:"6px 0 8px"}}>Arraste para mudar etapa · clique para abrir</div>
                      <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>{const idx=pipeline.findIndex(p=>p.key===col.key);if(idx>0)dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:pipeline[idx-1].key}});}} title="Recuar" style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,fontWeight:800,cursor:"pointer"}}> Recuar</button>
                        {col.key!==pipeline[pipeline.length-1].key&&<button onClick={()=>{const idx=pipeline.findIndex(p=>p.key===col.key);if(idx<pipeline.length-1)dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:pipeline[idx+1].key}});}} title="Avançar" style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,fontWeight:800,cursor:"pointer"}}>Avançar</button>}
                        {next&&<button onClick={()=>dispatch({type:"UPDATE_CLIENT",id:c.id,data:{status:next.key}})} title={`Mover para ${next.label}`} style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${next.color}55`,background:`${next.color}12`,color:next.color,fontSize:10,fontWeight:800,cursor:"pointer"}}>{next.label}</button>}
                        <button onClick={()=>removeClient(c)} title="Excluir cliente" style={{width:30,padding:"5px 6px",borderRadius:7,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:10,fontWeight:900,cursor:"pointer"}}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {view==="list"&&filteredClients.map(c=>{
        const pv=(c.videos||[]).filter(v=>v.status!=="entregue").length;
        const dtm=c.nextMeeting?Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24)):null;
        return (
          <Card key={c.id} onClick={()=>setSelected(c.id)} style={{marginBottom:10,cursor:"pointer"}}>
            <div className="client-list-row" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:7,flexWrap:"wrap"}}>
                  <Tag color={STATUS_COLORS[normalizeClientStatus(c)]||C.orange}>{clientStageLabel(c)}</Tag>
                  <Tag color={PAG_COLORS[c.payment]||C.orange}>{c.payment}</Tag>
                  <Tag color={TEMP_COLORS[c.leadTemp]||"#eab308"}>{c.leadTemp||"morno"}</Tag>
                  <Tag color={(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).color}>{(RELATIONSHIP_TYPES.find(r=>r.id===relationType(c))||RELATIONSHIP_TYPES[1]).label}</Tag>
                  <Tag color="#10b981">{c.probability??50}%</Tag>
                  {pv>0&&<Tag color="#8b5cf6">{pv} vídeo{pv>1?"s":""}</Tag>}
                  {dtm!==null&&dtm<=7&&dtm>=0&&<Tag color="#3b82f6">reunião em {dtm}d</Tag>}
                  {isFollowPending(c)&&<Tag color="#ef4444">follow-up</Tag>}
                </div>
                <div className="private-data" style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{c.name}</div>
                {c.service&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.service}</div>}
                <div style={{fontSize:11,color:"#aaa",marginTop:5}}>{relationMeta(c)}</div>
                {c.nextAction&&<div style={{fontSize:11,color:"#aaa",marginTop:5}}>Próxima ação: {c.nextAction}</div>}
              </div>
              <div className="client-list-value" style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{fmtMoney(c.value,privacyMode)}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>prev. {fmtMoney(forecast(c),privacyMode)}</div>
                {c.nextMeeting&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📅 {new Date(c.nextMeeting+"T00:00").toLocaleDateString("pt-BR")}</div>}
                <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:8}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>editClientFromList(c)} title="Editar cliente" style={{height:28,borderRadius:8,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.045)",color:"#ddd",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",padding:"0 9px"}}>Editar</button>
                  <button onClick={()=>removeClient(c)} title="Excluir cliente" style={{height:28,borderRadius:8,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",padding:"0 9px"}}>Excluir</button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      <Modal open={showAdd} onClose={()=>{setShowAdd(false);setEditClient(null);setCf(E);}} title="Novo Cliente" wide>
        {renderClientSmartForm()}
      </Modal>
    </div>
  );
};

// ── TAB: PROJETOS ──────────────────────────────────────────────────────
const TabProjects = ({state,dispatch})=>{
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [checkTab,setCheckTab]=useState("camera");
  const [form,setForm]=useState({clientId:"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});
  const projects=(state.clients||[]).flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const stages=["all",...VIDEO_STATUS];
  const filtered=filter==="all"?projects:projects.filter(p=>p.video.status===filter);
  const current=selected&&projects.find(p=>p.client.id===selected.clientId&&p.video.id===selected.videoId);
  const checklist=v=>(v.checklist||["Briefing","Roteiro","Captação","Edição","Revisão","Entrega"]).map(i=>typeof i==="string"?{text:i,done:false}:i);
  const deliverables=v=>(v.deliverables||presetDeliverables(presetById(v.presetId||v.type))).map(i=>typeof i==="string"?{text:i,done:false}:i);
  const schedule=v=>(v.productionSchedule||presetSchedule(presetById(v.presetId||v.type),v.deadline)).map(i=>typeof i==="string"?{label:i,date:"",done:false}:i);
  const briefing=v=>({...presetBriefing(presetById(v.presetId||v.type)),...(v.briefing||{})});
  const projectLinks=v=>({briefing:"",drive:v.link||"",reference:"",review:"",delivery:"",...(v.links||{})});
  const premiumChecklist=v=>{
    const base=buildPremiumChecklist(v.presetId||v.type);
    const saved=v.premiumChecklist||{};
    return Object.fromEntries(Object.keys(base).map(k=>[k,(saved[k]||base[k]).map(i=>typeof i==="string"?{text:i,done:false}:i)]));
  };
  const premiumProgress=v=>{
    const groups=Object.values(premiumChecklist(v)).flat();
    const done=groups.filter(i=>i.done).length;
    return {done,total:groups.length,pct:groups.length?Math.round(done/groups.length*100):0};
  };
  const pipelineState=v=>{
    const saved=v.productionPipeline||{};
    const checks=checklist(v);
    const sched=schedule(v);
    const brief=briefing(v);
    const prem=premiumProgress(v);
    const hasBrief=!!(brief.objective||brief.audience||brief.reference||brief.notes||brief.location||brief.shootDate);
    const byText=t=>checks.some(c=>c.done&&String(c.text).toLowerCase().includes(t));
    const schedDone=k=>sched.some(s=>s.done&&(s.key===k||String(s.label||"").toLowerCase().includes(k)));
    const inferred={
      briefing:hasBrief||byText("briefing"),
      roteiro:byText("roteiro")||byText("gancho")||schedDone("script"),
      decupagem:byText("decupagem")||byText("plano"),
      callsheet:byText("callsheet")||byText("cronograma"),
      checklist:prem.pct>=70||checks.length>0&&checks.every(c=>c.done),
      entrega:v.status==="entregue"||schedDone("delivery")||schedDone("entrega")
    };
    return Object.fromEntries(PRODUCTION_PIPELINE.map(step=>[step.key, saved[step.key]??inferred[step.key]??false]));
  };
  const pipelineProgress=v=>{
    const p=pipelineState(v);
    const done=PRODUCTION_PIPELINE.filter(s=>p[s.key]).length;
    return {done,total:PRODUCTION_PIPELINE.length,pct:Math.round(done/PRODUCTION_PIPELINE.length*100),state:p};
  };
  const update=(p,data,silent=false)=>dispatch({type:"UPDATE_CLIENT_VIDEO",clientId:p.client.id,videoId:p.video.id,data,silent});
  const applyProjectPreset=p=>setForm(f=>({...f,presetId:p.id,title:p.title,type:p.type,deadline:f.deadline||addDaysInput(14),checklist:p.checklist}));
  const projectPresetOptions=AUDIOVISUAL_PRESETS.map(p=>({value:p.id,label:p.label,description:`${p.title} · ${p.type}`,icon:"▦"}));
  const projectTypeOptions=["gravação","edição","motion","drone","entrevista","vertical","evento","documentário","ads"].map(type=>({value:type,label:type}));
  const projectDeadlineOptions=[
    {value:addDaysInput(7),label:"+7 dias"},
    {value:addDaysInput(14),label:"+14 dias"},
    {value:addDaysInput(30),label:"+30 dias"},
    {value:addDaysInput(45),label:"+45 dias"},
  ];
  const recentClientOptions=(state.clients||[]).slice(0,8).map(c=>({value:String(c.id),label:c.name}));
  const smartStatus=(v,checks)=>{
    const done=checks.filter(c=>c.done).map(c=>String(c.text).toLowerCase()).join(" ");
    if(checks.length&&checks.every(c=>c.done))return"entregue";
    if(done.includes("revis"))return"revisão";
    if(done.includes("captação")||done.includes("arquivos recebidos")||done.includes("corte bruto"))return"editando";
    if(done.includes("roteiro")||done.includes("plano"))return"gravando";
    return v.status;
  };
  const dueInfo=v=>{const diff=dayDiff(v.deadline);if(diff===null)return null;if(diff<0)return{txt:`${Math.abs(diff)}d atraso`,c:"#ef4444"};if(diff===0)return{txt:"hoje",c:"#10b981"};if(diff<=7)return{txt:`${diff}d`,c:"#3b82f6"};return{txt:new Date(v.deadline+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"}),c:"#8b5cf6"};};
  const projectMilestones=projects.flatMap(p=>schedule(p.video).filter(s=>s.date&&!s.done&&p.video.status!=="entregue").map(s=>({...s,project:p,diff:dayDiff(s.date)}))).sort((a,b)=>(a.diff??99)-(b.diff??99));
  const lateProjects=projects.filter(p=>p.video.status!=="entregue"&&dayDiff(p.video.deadline)<0).length;
  const activeProjects=projects.filter(p=>p.video.status!=="entregue").length;
  const reviewProjects=projects.filter(p=>p.video.status==="revisão").length;
  return (
    <div className="page-stack">
      <Card className="page-hero" style={{background:"rgba(139,92,246,.06)",borderColor:"rgba(139,92,246,.22)"}}>
        <div className="page-hero-row">
          <div><div className="page-eyebrow" style={{color:"#8b5cf6"}}>PRODUÇÃO AUDIOVISUAL</div>
          <div className="page-title">Projetos em operação</div>
          <p className="page-subtitle">Controle briefing, entregáveis, agenda de produção, arquivos e revisão em uma visão mais limpa.</p></div>
          <Btn onClick={()=>{setForm({clientId:(state.clients||[])[0]?.id||"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});setShowAdd(true);}} size="sm" variant="ghost">Novo</Btn>
        </div>
      </Card>
      <div className="summary-strip">
        <div className="metric-tile"><div className="metric-value" style={{color:"#8b5cf6"}}>{activeProjects}</div><div className="metric-label">Ativos</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:"#eab308"}}>{reviewProjects}</div><div className="metric-label">Em revisão</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:lateProjects?"#ef4444":"#10b981"}}>{lateProjects}</div><div className="metric-label">Atrasados</div></div>
        <div className="metric-tile"><div className="metric-value" style={{color:C.orange}}>{projectMilestones.filter(m=>m.diff===0).length}</div><div className="metric-label">Marcos hoje</div></div>
      </div>
      <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
        {stages.map(s=>{
          const count=s==="all"?projects.length:projects.filter(p=>p.video.status===s).length;
          const color=s==="all"?C.orange:VIDEO_COLORS[s]||C.orange;
          return <button key={s} onClick={()=>setFilter(s)} style={{padding:"10px 8px",borderRadius:12,border:"1px solid",borderColor:filter===s?color:C.border,background:filter===s?`${color}14`:"rgba(255,255,255,.025)",color:filter===s?color:C.muted,cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:18,fontWeight:900,fontFamily:"'Syne',sans-serif"}}>{count}</div><div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",marginTop:2}}>{s==="all"?"Todos":s}</div></button>;
        })}
      </div>
      <div className="split-layout">
        <div className="dense-list">
          {filtered.length===0&&<PremiumEmpty icon="▦" title="Nenhum projeto nesta etapa" text="Use um preset audiovisual para criar briefing, entregáveis, agenda e checklist automaticamente." action={<Btn onClick={()=>{setForm({clientId:(state.clients||[])[0]?.id||"",title:"",type:"gravação",deadline:"",link:"",presetId:"",checklist:AUDIOVISUAL_PRESETS[1].checklist});setShowAdd(true);}} size="sm">Novo projeto</Btn>}/>}
          {filtered.map(p=>{
          const d=dueInfo(p.video),checks=checklist(p.video),done=checks.filter(c=>c.done).length,pct=checks.length?Math.round(done/checks.length*100):0;
          const flow=pipelineProgress(p.video);
          const premium=premiumProgress(p.video);
          const lateSteps=schedule(p.video).filter(x=>x.date&&!x.done&&dayDiff(x.date)<0).length;
          const nextStatus=VIDEO_STATUS[Math.min(VIDEO_STATUS.length-1,VIDEO_STATUS.indexOf(p.video.status)+1)]||"pendente";
          return (
            <Card key={`${p.client.id}-${p.video.id}`} onClick={()=>setSelected({clientId:p.client.id,videoId:p.video.id})} style={{cursor:"pointer",padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:8}}>
                <div style={{minWidth:0}}><div className="private-data" style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{p.video.title}</div><div className="private-data" style={{fontSize:12,color:C.muted,marginTop:2}}>{p.client.name} · {p.video.type}</div></div>
                <Tag color={VIDEO_COLORS[p.video.status]||C.orange}>{p.video.status}</Tag>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>{d&&<Tag color={d.c}>{d.txt}</Tag>}{p.video.link&&<Tag color="#3b82f6">link</Tag>}{lateSteps>0&&<Tag color="#ef4444">{lateSteps} marco atraso</Tag>}<Tag color="#8b5cf6">{done}/{checks.length}</Tag><Tag color="#06b6d4">set {premium.done}/{premium.total}</Tag>{p.video.status!=="entregue"&&<button onClick={e=>{e.stopPropagation();update(p,{status:nextStatus});}} style={{marginLeft:"auto",border:`1px solid ${(VIDEO_COLORS[nextStatus]||C.orange)}45`,background:`${VIDEO_COLORS[nextStatus]||C.orange}12`,color:VIDEO_COLORS[nextStatus]||C.orange,borderRadius:9,padding:"5px 9px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Avançar → {nextStatus}</button>}</div>
              <div className="project-flow" aria-label="Pipeline do projeto">
                {PRODUCTION_PIPELINE.map(step=>(
                  <div key={step.key} className={`project-flow-step ${flow.state[step.key]?"done":step.key===current?.video?.status?"active":""}`}>
                    <div className="project-flow-dot" style={{borderColor:flow.state[step.key]?`${step.color}88`:undefined,color:flow.state[step.key]?step.color:undefined}}>{flow.state[step.key]?"✓":step.label.slice(0,1)}</div>
                    <div className="project-flow-label">{step.label}</div>
                  </div>
                ))}
              </div>
              <Bar v={pct} color={VIDEO_COLORS[p.video.status]||"#8b5cf6"} h={5}/>
            </Card>
          );
          })}
        </div>
        <aside className="side-panel">
          <Card style={{padding:"16px"}}>
            <SectionTitle>PRÓXIMOS MARCOS</SectionTitle>
            {projectMilestones.length===0&&<div style={{fontSize:13,color:C.muted}}>Nenhum marco pendente.</div>}
            {projectMilestones.slice(0,6).map((m,i)=>{
              const color=m.diff<0?"#ef4444":m.diff===0?C.orange:"#3b82f6";
              return <button key={i} onClick={()=>setSelected({clientId:m.project.client.id,videoId:m.project.video.id})} style={{width:"100%",textAlign:"left",padding:"10px 0",border:"none",borderBottom:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#eee",fontWeight:900}}>{m.label}</span><Tag color={color}>{m.diff<0?`${Math.abs(m.diff)}d atraso`:m.diff===0?"hoje":`${m.diff}d`}</Tag></div>
                <div className="private-data" style={{fontSize:11,color:C.muted,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.project.video.title} · {m.project.client.name}</div>
              </button>;
            })}
          </Card>
          <Card style={{padding:"16px"}}>
            <SectionTitle>ATALHOS</SectionTitle>
            <div style={{display:"grid",gap:8}}>
              <Btn onClick={()=>setFilter("pendente")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Pendentes</Btn>
              <Btn onClick={()=>setFilter("editando")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Em edição</Btn>
              <Btn onClick={()=>setFilter("revisão")} variant="ghost" size="sm" style={{justifyContent:"center"}}>Revisão</Btn>
            </div>
          </Card>
        </aside>
      </div>
      <Modal open={!!current} onClose={()=>setSelected(null)} title={current?.video?.title||"Projeto"} wide>
        {current&&(()=>{
          const checks=checklist(current.video);
          const dels=deliverables(current.video);
          const sched=schedule(current.video);
          const brief=briefing(current.video);
          const links=projectLinks(current.video);
          const suggested=smartStatus(current.video,checks);
          const flow=pipelineProgress(current.video);
          const premium=premiumChecklist(current.video);
          const currentPremium=premium[checkTab]||[];
          const premiumStats=premiumProgress(current.video);
          return <div>
            <div className="modal-section primary">
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Prazo" type="date" value={current.video.deadline||""} onChange={v=>update(current,{deadline:v},true)}/>
              <Inp label="Link / pasta" value={current.video.link||""} onChange={v=>update(current,{link:v},true)} placeholder="URL ou caminho"/>
            </div>
            <div style={{marginBottom:14}}><div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase"}}>Etapa</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{VIDEO_STATUS.map(s=><button key={s} onClick={()=>update(current,{status:s})} style={{padding:"6px 12px",borderRadius:9,border:"1px solid",borderColor:current.video.status===s?(VIDEO_COLORS[s]||C.orange):C.border,background:current.video.status===s?`${VIDEO_COLORS[s]||C.orange}15`:"transparent",color:current.video.status===s?(VIDEO_COLORS[s]||C.orange):C.muted,fontSize:11,fontWeight:800,cursor:"pointer"}}>{s}</button>)}</div></div>
            {suggested!==current.video.status&&<button onClick={()=>update(current,{status:suggested})} style={{width:"100%",marginBottom:14,padding:"10px 12px",borderRadius:12,border:`1px solid ${(VIDEO_COLORS[suggested]||C.orange)}35`,background:`${VIDEO_COLORS[suggested]||C.orange}10`,color:VIDEO_COLORS[suggested]||C.orange,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Sugestão inteligente: mover para {suggested}</button>}
            </div>

            <div className="modal-section" style={{background:"rgba(249,115,22,.04)",borderColor:"rgba(249,115,22,.18)"}}>
              <SectionTitle>PIPELINE VISUAL</SectionTitle>
              <div className="project-flow">
                {PRODUCTION_PIPELINE.map(step=>{
                  const done=flow.state[step.key];
                  return <button key={step.key} onClick={()=>update(current,{productionPipeline:{...(current.video.productionPipeline||{}),[step.key]:!done}},true)} className={`project-flow-step ${done?"done":""}`} style={{background:"transparent",border:"none",fontFamily:"inherit",cursor:"pointer"}}>
                    <div className="project-flow-dot" style={{borderColor:done?`${step.color}88`:undefined,color:done?step.color:undefined}}>{done?"✓":step.label.slice(0,1)}</div>
                    <div className="project-flow-label">{step.label}</div>
                  </button>;
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginTop:8}}>
                <div style={{fontSize:11,color:C.muted}}>Documentos/etapas concluídos: {flow.done}/{flow.total}</div>
                <Tag color={flow.pct>=70?"#10b981":C.orange}>{flow.pct}% fluxo</Tag>
              </div>
            </div>

            <div className="modal-section">
            <SectionTitle>BRIEFING GUIADO</SectionTitle>
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Objetivo" value={brief.objective} onChange={v=>update(current,{briefing:{...brief,objective:v}},true)} placeholder="O que esse vídeo precisa gerar?"/>
              <Inp label="Público" value={brief.audience} onChange={v=>update(current,{briefing:{...brief,audience:v}},true)} placeholder="Para quem é?"/>
              <Inp label="Referência" value={brief.reference} onChange={v=>update(current,{briefing:{...brief,reference:v}},true)} placeholder="Link ou direção visual"/>
              <Inp label="Duração" value={brief.duration} onChange={v=>update(current,{briefing:{...brief,duration:v}},true)} placeholder="15s, 60s, 5min..."/>
              <Inp label="Formato" value={brief.format} onChange={v=>update(current,{briefing:{...brief,format:v}},true)} placeholder="9:16, 16:9, stories..."/>
              <Inp label="Local" value={brief.location} onChange={v=>update(current,{briefing:{...brief,location:v}},true)} placeholder="Estúdio, cliente, evento..."/>
              <Inp label="Data de captação" type="date" value={brief.shootDate} onChange={v=>update(current,{briefing:{...brief,shootDate:v}},true)}/>
            </div>
            <Txt label="Notas de briefing" value={brief.notes} onChange={v=>update(current,{briefing:{...brief,notes:v}},true)} placeholder="Tom, narrativa, restrições, roteiro, falas..." rows={3}/>
            </div>

            <div className="modal-section">
            <SectionTitle>ENTREGÁVEIS</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}} className="modal-grid">
              {dels.map((d,i)=><div key={i} onClick={()=>update(current,{deliverables:dels.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 10px",borderRadius:10,background:d.done?"rgba(16,185,129,.1)":"rgba(255,255,255,.035)",border:`1px solid ${d.done?"rgba(16,185,129,.25)":C.border}`}}>
                <span style={{width:18,height:18,borderRadius:6,border:`2px solid ${d.done?"#10b981":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#10b981"}}>{d.done?"✓":""}</span>
                <span style={{fontSize:12,color:d.done?C.muted:"#ddd",fontWeight:700,textDecoration:d.done?"line-through":"none"}}>{d.text}</span>
              </div>)}
            </div>

            <SectionTitle>AGENDA DE PRODUÇÃO</SectionTitle>
            {sched.map((s,i)=>{
              const diff=dayDiff(s.date),color=s.done?"#10b981":diff<0?"#ef4444":diff===0?C.orange:"#3b82f6";
              return <div key={s.key||i} style={{display:"grid",gridTemplateColumns:"1fr 150px 32px",gap:8,alignItems:"center",marginBottom:8}}>
                <div style={{padding:"9px 10px",borderRadius:10,background:`${color}0f`,border:`1px solid ${color}28`}}><div style={{fontSize:12,color:"#eee",fontWeight:800}}>{s.label}</div>{diff!==null&&<div style={{fontSize:10,color,marginTop:2,fontWeight:800}}>{diff<0?`${Math.abs(diff)}d atraso`:diff===0?"hoje":`${diff}d`}</div>}</div>
                <input type="date" value={s.date||""} onChange={e=>update(current,{productionSchedule:sched.map((x,j)=>j===i?{...x,date:e.target.value}:x)},true)} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>update(current,{productionSchedule:sched.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{height:32,borderRadius:9,border:`1px solid ${s.done?"#10b981":C.border}`,background:s.done?"rgba(16,185,129,.14)":"transparent",color:s.done?"#10b981":C.muted,cursor:"pointer"}}>{s.done?"✓":"○"}</button>
              </div>;
            })}
            </div>

            <div className="modal-section">
            <SectionTitle>CENTRAL DE ARQUIVOS</SectionTitle>
            <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              <Inp label="Briefing" value={links.briefing} onChange={v=>update(current,{links:{...links,briefing:v}},true)} placeholder="Documento de briefing"/>
              <Inp label="Pasta Drive" value={links.drive} onChange={v=>update(current,{links:{...links,drive:v},link:v},true)} placeholder="Pasta do projeto"/>
              <Inp label="Referências" value={links.reference} onChange={v=>update(current,{links:{...links,reference:v}},true)} placeholder="Moodboard, referências"/>
              <Inp label="Versão para revisão" value={links.review} onChange={v=>update(current,{links:{...links,review:v}},true)} placeholder="Frame.io, Drive..."/>
              <Inp label="Entrega final" value={links.delivery} onChange={v=>update(current,{links:{...links,delivery:v}},true)} placeholder="Link final"/>
            </div>
            <SectionTitle>CHECKLIST AUDIOVISUAL PREMIUM</SectionTitle>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:C.muted}}>Câmera, áudio, luz, produção, dados e pós-produção em padrão de set.</div>
              <Tag color="#06b6d4">{premiumStats.done}/{premiumStats.total}</Tag>
            </div>
            <div className="premium-check-tabs">
              {Object.keys(premium).map(k=>(
                <button key={k} onClick={()=>setCheckTab(k)} className={`premium-check-tab ${checkTab===k?"active":""}`}>{k}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}} className="modal-grid">
              {currentPremium.map((item,i)=>(
                <div key={`${checkTab}-${i}`} onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map((x,j)=>j===i?{...x,done:!x.done}:x)}},true)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 10px",borderRadius:2,background:item.done?"rgba(16,185,129,.1)":"rgba(255,255,255,.035)",border:`1px solid ${item.done?"rgba(16,185,129,.28)":C.border}`}}>
                  <span style={{width:18,height:18,borderRadius:2,border:`2px solid ${item.done?"#10b981":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#10b981",flexShrink:0}}>{item.done?"✓":""}</span>
                  <span style={{fontSize:12,color:item.done?C.muted:"#ddd",fontWeight:700,textDecoration:item.done?"line-through":"none",lineHeight:1.35}}>{item.text}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
              <Btn onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map(x=>({...x,done:true}))}},true)} variant="ghost" size="sm">Marcar categoria</Btn>
              <Btn onClick={()=>update(current,{premiumChecklist:{...premium,[checkTab]:currentPremium.map(x=>({...x,done:false}))}},true)} variant="ghost" size="sm">Limpar categoria</Btn>
            </div>
            <SectionTitle>CHECKLIST DE PRODUÇÃO</SectionTitle>
            {checks.map((c,i)=>(
              <div key={i} onClick={()=>update(current,{checklist:checks.map((x,j)=>j===i?{...x,done:!x.done}:x)},true)} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer",padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,.035)"}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${c.done?"#10b981":C.border}`,background:c.done?"rgba(16,185,129,.18)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#10b981"}}>{c.done?"✓":""}</div>
                <span style={{fontSize:13,color:c.done?C.muted:"#ddd",textDecoration:c.done?"line-through":"none"}}>{c.text}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
              {Object.entries(links).filter(([,v])=>v).map(([k,v])=><Btn key={k} onClick={()=>window.open(v,"_blank")} variant="ghost" size="sm">Abrir {k}</Btn>)}
            </div>
            </div>
          </div>;
        })()}
      </Modal>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Novo Projeto" wide>
        {(state.clients||[]).length===0&&<div style={{fontSize:13,color:C.muted,marginBottom:14}}>Cadastre um cliente antes de criar um projeto.</div>}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em"}}>Preset audiovisual</div>
          <OptionCards options={projectPresetOptions} value={form.presetId} onChange={id=>applyProjectPreset(presetById(id))}/>
        </div>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>Cliente</div>
          {recentClientOptions.length>0&&<div style={{marginBottom:10}}><ChipSelector options={recentClientOptions} value={String(form.clientId||"")} onChange={v=>setForm(f=>({...f,clientId:v}))} size="sm"/></div>}
          <select value={String(form.clientId||"")} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none"}}>
            {(state.clients||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Inp label="Título" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Vídeo institucional"/>
          <Inp label="Prazo" type="date" value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))}/>
          <Inp label="Link / pasta" value={form.link} onChange={v=>setForm(f=>({...f,link:v}))} placeholder="Drive, Frame.io..."/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"0 0 14px"}} className="modal-grid">
          <div>
            <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Atalho de prazo</div>
            <ChipSelector options={projectDeadlineOptions} value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))} size="sm"/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:8,letterSpacing:".08em"}}>Tipo de projeto</div>
            <ChipSelector options={projectTypeOptions} value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} size="sm"/>
          </div>
        </div>
        {form.checklist?.length>0&&<div style={{marginBottom:14,padding:"11px 12px",borderRadius:12,background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:800,textTransform:"uppercase",marginBottom:7}}>Checklist aplicado</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{form.checklist.map(i=><Tag key={i} color="#8b5cf6">{i}</Tag>)}</div>
        </div>}
        <Btn disabled={!form.clientId||!form.title} onClick={()=>{dispatch({type:"ADD_CLIENT_VIDEO",id:Number(form.clientId),video:buildVideoProject(form)});setShowAdd(false);}}>Criar projeto</Btn>
      </Modal>
    </div>
  );
};



// ── TAB: EXPORTAR PDF ──────────────────────────────────────────────────
const TabExport = ({state,dispatch})=>{
  const [month,setMonth]=useState(new Date().getMonth()),[year,setYear]=useState(new Date().getFullYear());
  const [generating,setGenerating]=useState(false);
  const [lastBackup,setLastBackup]=useState(()=>localStorage.getItem("dcc_last_backup"));
  const fileRef=useRef(null);
  const REPORTS=[
    {id:"executive",icon:"▦",title:"Resumo executivo",desc:`Indicadores da operação ${business.brandName||APP_NAME}`,color:C.orange},
    {id:"production",icon:"▶",title:"Produção",desc:"Projetos, entregas, prazos e documentos gerados",color:"#8b5cf6"},
    {id:"commercial",icon:"◆",title:"Comercial",desc:"Clientes, propostas, receita prevista e recebimentos",color:"#10b981"},
    {id:"videoReview",icon:"◉",title:"Video Review",desc:"Links enviados, aprovações e ajustes solicitados",color:"#06b6d4"},
  ];
  const [selectedReports,setSelectedReports]=useState(REPORTS.map(r=>r.id));
  const toggleReport=id=>setSelectedReports(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const hasReport=id=>selectedReports.includes(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const exportBackup=()=>{
    if(!window.confirm("O backup JSON contém dados sensíveis como clientes, valores e notas. Gere apenas se for guardar em um local seguro."))return;
    const blob=new Blob([JSON.stringify({...state,_meta:{app:APP_NAME,exportedAt:new Date().toISOString(),containsSensitiveData:true}},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${(business.brandName||APP_NAME).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-backup-${year}-${String(month+1).padStart(2,"0")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now=new Date().toISOString();
    localStorage.setItem("dcc_last_backup",now);
    setLastBackup(now);
  };
  const exportEncryptedBackup=async()=>{
    try{
      if(!window.confirm("Este backup será criptografado com senha. Sem essa senha, não será possível restaurar os dados. Continuar?"))return;
      const p1=window.prompt("Crie uma senha forte para criptografar o backup:");
      if(!p1||p1.length<8){alert("Use uma senha com pelo menos 8 caracteres.");return;}
      const p2=window.prompt("Repita a senha para confirmar:");
      if(p1!==p2){alert("As senhas não conferem.");return;}
      const payload={...state,_meta:{app:APP_NAME,exportedAt:new Date().toISOString(),containsSensitiveData:true,encrypted:true}};
      const encrypted=await encryptBackupPayload(payload,p1);
      const blob=new Blob([JSON.stringify(encrypted,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`${(business.brandName||APP_NAME).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-backup-criptografado-${year}-${String(month+1).padStart(2,"0")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const now=new Date().toISOString();
      localStorage.setItem("dcc_last_backup",now);
      setLastBackup(now);
    }catch(err){
      alert(`Não consegui criptografar o backup: ${err.message||"erro desconhecido"}`);
    }
  };
  const clearData=()=>{
    if(!window.confirm("Isso vai apagar todos os dados salvos neste navegador. Você já exportou um backup?"))return;
    if(window.prompt("Digite APAGAR para confirmar a limpeza total")!=="APAGAR")return;
    localStorage.removeItem(SK);
    dispatch({type:"CLEAR_DATA"});
  };
  const importBackup=e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(!window.confirm("Importar este backup vai substituir os dados atuais deste navegador. Continuar?")){e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=async()=>{
      try{
        const data=JSON.parse(reader.result);
        if(!data||typeof data!=="object")throw new Error("invalid");
        if(data._dnzEncryptedBackup){
          const password=window.prompt("Digite a senha deste backup criptografado:");
          if(!password)throw new Error("Senha obrigatória para backup criptografado.");
          const decrypted=await decryptBackupPayload(data,password);
          dispatch({type:"RESTORE",p:decrypted});
        }else{
          dispatch({type:"RESTORE",p:data});
        }
      }catch{
        alert(`Não consegui importar esse backup. Verifique se o arquivo é válido e, se estiver criptografado, se a senha está correta.`);
      }
      e.target.value="";
    };
    reader.readAsText(file);
  };
  const generatePDF=()=>{
    setGenerating(true);
    const today=new Date();
    const clients=state.clients||[];
    const projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
    const entries=state.financeEntries||[];
    const reviews=state.reviewDeliverables||[];
    const activeClients=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length;
    const openProjects=projects.filter(p=>p.video.status!=="entregue").length;
    const pendingReviews=reviews.filter(r=>!["aprovado","approved"].includes(String(r.status||"").toLowerCase())).length;
    const paidTotal=clients.filter(c=>c.payment==="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
    const receivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
    const reportName=selectedReports.length===REPORTS.length?`Relatório Executivo ${business.brandName||APP_NAME}`:`Relatório ${REPORTS.filter(r=>hasReport(r.id)).map(r=>r.title).join(" + ")}`;
    const kpi=(label,value,color=C.orange)=>`<div class="kpi"><div class="kpi-val" style="color:${color}">${esc(value)}</div><div class="kpi-label">${esc(label)}</div></div>`;
    const row=(title,meta,value,color=C.orange)=>`<div class="row"><div><strong>${esc(title)}</strong><span>${esc(meta||"")}</span></div><b style="color:${color}">${esc(value||"")}</b></div>`;
    const executiveHTML=hasReport("executive")?`<h2>Resumo executivo</h2><div class="kpi-grid">${kpi("Clientes ativos",activeClients,"#10b981")}${kpi("Projetos abertos",openProjects,"#8b5cf6")}${kpi("Reviews pendentes",pendingReviews,"#06b6d4")}${kpi("A receber",fmtCurrency(receivable),"#eab308")}</div>`:"";
    const productionHTML=hasReport("production")?`<h2>Produção audiovisual</h2>${projects.length?projects.map(p=>row(p.video.title||"Projeto sem título",[p.client.name,p.video.type,p.video.deadline&&`prazo ${p.video.deadline}`].filter(Boolean).join(" · "),p.video.status||"em produção","#8b5cf6")).join(""):`<div class="empty">Nenhum projeto cadastrado neste período.</div>`}`:"";
    const commercialHTML=hasReport("commercial")?`<h2>Comercial e caixa</h2>${clients.length?clients.map(c=>row(c.name,[c.service,clientStageLabel(c),c.payment].filter(Boolean).join(" · "),fmtCurrency(c.value||0),c.payment==="pago"?"#10b981":"#eab308")).join(""):`<div class="empty">Nenhum cliente cadastrado.</div>`}<div class="kpi-grid compact">${kpi("Recebido",fmtCurrency(paidTotal),"#10b981")}${kpi("A receber",fmtCurrency(receivable),"#eab308")}${kpi("Propostas",clients.reduce((a,c)=>a+(c.proposals||[]).length,0),C.orange)}${kpi("Clientes",clients.length,"#06b6d4")}</div>`:"";
    const videoReviewHTML=hasReport("videoReview")?`<h2>Video Review</h2>${reviews.length?reviews.map(r=>row(r.title||"Review sem título",[r.clientName,r.status,r.comments?.length?`${r.comments.length} comentários`:null].filter(Boolean).join(" · "),r.status||"aguardando","#06b6d4")).join(""):`<div class="empty">Nenhum link de review cadastrado ainda.</div>`}`:"";
    const emptyHTML=!executiveHTML&&!productionHTML&&!commercialHTML&&!videoReviewHTML?`<div class="empty">Nenhum relatório selecionado.</div>`:"";
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(reportName)} — ${MONTHS[month]} ${year}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0d0d;color:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;padding:40px;max-width:920px;margin:0 auto}h1{font-size:34px;font-weight:900;color:#fff;margin-bottom:4px}h2{font-size:14px;font-weight:900;color:${C.orange};text-transform:uppercase;letter-spacing:.14em;margin:30px 0 14px;padding-bottom:8px;border-bottom:1px solid #333}.hero{background:linear-gradient(135deg,${C.orange}24,rgba(0,0,0,0));border:1px solid ${C.orange}45;border-radius:16px;padding:24px 28px;margin-bottom:28px}.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.kpi-grid.compact{margin-top:18px}.kpi{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px;text-align:center}.kpi-val{font-size:22px;font-weight:900}.kpi-label{font-size:10px;color:#777;margin-top:4px;text-transform:uppercase;letter-spacing:.08em}.row{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:13px 15px;margin-bottom:9px}.row strong{display:block;color:#fff;font-size:14px}.row span{display:block;color:#888;font-size:11px;margin-top:4px;line-height:1.4}.row b{font-size:13px;white-space:nowrap}.empty{padding:18px;background:#171717;border:1px solid #2a2a2a;border-radius:12px;color:#888;text-align:center}@media print{body{padding:20px}.kpi-grid{grid-template-columns:repeat(2,1fr)}}}</style></head><body>
    <div class="hero"><div style="font-size:12px;color:${C.orange};font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:7px">${esc((business.brandName||APP_NAME).toUpperCase())} — ${esc(APP_NAME.toUpperCase())}</div><h1>${esc(reportName)}</h1><div style="color:#777;font-size:13px">${MONTHS[month]} de ${year} · ${today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
    ${executiveHTML}${productionHTML}${commercialHTML}${videoReviewHTML}${emptyHTML}
    <div style="margin-top:40px;padding:16px;background:#151515;border-radius:10px;text-align:center;color:#555;font-size:12px">${esc(business.brandName||APP_NAME)} · ${today.toLocaleDateString("pt-BR")}</div></body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>{w.print();setGenerating(false);},800);
  };
  const clients=state.clients||[];
  const projects=clients.flatMap(c=>c.videos||[]);
  const reviews=state.reviewDeliverables||[];
  const activeProjects=projects.filter(v=>v.status!=="entregue").length;
  const activeClients=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length;
  const paidTotal=clients.filter(c=>c.payment==="pago").reduce((a,c)=>a+Number(c.value||0),0)+(state.financeEntries||[]).filter(e=>e.type==="entrada"&&e.status==="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const backupDays=lastBackup?Math.floor((new Date()-new Date(lastBackup))/(1000*60*60*24)):null;
  const backupWarn=backupDays===null||backupDays>=7;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{background:`${C.orange}08`,borderColor:`${C.orange}20`,padding:"20px 22px"}}>
        <div style={{fontSize:11,color:C.orange,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>CENTRAL DE RELATÓRIOS</div>
        <p style={{margin:0,fontSize:14,color:"#aaa",lineHeight:1.6}}>Escolha relatórios separados por área ou gere um documento completo para imprimir e salvar em PDF.</p>
      </Card>
      <Card style={{padding:"20px 22px"}}>
        {backupWarn&&<div style={{padding:"10px 12px",borderRadius:12,background:"rgba(234,179,8,.1)",border:"1px solid rgba(234,179,8,.28)",color:"#eab308",fontSize:12,fontWeight:700,marginBottom:14}}>Backup recomendado: {backupDays===null?"nenhum backup registrado":`último backup há ${backupDays} dias`}.</div>}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>Mês</div><select value={month} onChange={e=>setMonth(+e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>{MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}</select></div>
          <div style={{flex:1,minWidth:100}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>Ano</div><select value={year} onChange={e=>setYear(+e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>{[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
        </div>
        <div className="mobile-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[
            {v:activeProjects,l:"Projetos ativos",c:C.orange},
            {v:reviews.length,l:"Video Reviews",c:"#06b6d4"},
            {v:activeClients,l:"Clientes ativos",c:"#3b82f6"},
            {v:fmtCurrency(paidTotal),l:"Recebido",c:"#eab308"},
          ].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.035)",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:i===3?12:22,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{s.l}</div></div>)}
        </div>
        <SectionTitle>RELATÓRIOS INCLUÍDOS</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9,marginBottom:16}}>
          {REPORTS.map(r=>{
            const on=hasReport(r.id);
            return <button key={r.id} onClick={()=>toggleReport(r.id)} style={{display:"flex",alignItems:"center",gap:12,textAlign:"left",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${on?r.color:C.border}`,background:on?`${r.color}10`:"rgba(255,255,255,.025)",color:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .18s"}}>
              <span style={{fontSize:20,width:28,textAlign:"center"}}>{r.icon}</span>
              <span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:800,color:on?r.color:"#ddd"}}>{r.title}</span><span style={{display:"block",fontSize:11,color:C.muted,marginTop:2}}>{r.desc}</span></span>
              <span style={{fontSize:18,color:on?r.color:C.muted}}>{on?"✓":"○"}</span>
            </button>;
          })}
        </div>
        <div className="mobile-actions" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Btn onClick={generatePDF} disabled={generating||selectedReports.length===0} style={{justifyContent:"center",fontSize:14,padding:"13px 16px"}}>{generating?"⏳ Gerando...":"📄 Gerar PDF"}</Btn>
          <Btn onClick={exportEncryptedBackup} variant="success" style={{justifyContent:"center",fontSize:14,padding:"13px 16px"}}>Backup criptografado</Btn>
        </div>
        <Btn onClick={exportBackup} variant="ghost" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>Backup JSON sem criptografia</Btn>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={importBackup} style={{display:"none"}}/>
        <Btn onClick={()=>fileRef.current?.click()} variant="ghost" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>↥ Importar backup JSON / criptografado</Btn>
        <Btn onClick={clearData} variant="danger" style={{width:"100%",justifyContent:"center",fontSize:13,marginTop:10}}>Limpar todos os dados</Btn>
        <div style={{fontSize:11,color:C.muted,marginTop:10,textAlign:"center"}}>Ctrl+P / Cmd+P na nova aba para salvar como PDF</div>
      </Card>
    </div>
  );
};

const SecurityPanel = ({session,cloudStatus,privacyMode,lockEnabled,setLockEnabled,onLockNow,open,onToggle,isAdmin})=>{
  const cloudLabel=cloudStatus==="synced"?"Nuvem ativa":cloudStatus==="syncing"?"Salvando":"Local";
  const cloudColor=cloudStatus==="synced"?"#10b981":cloudStatus==="syncing"?"#eab308":C.muted;
  return (
    <div style={{display:"grid",gap:7,marginBottom:10}}>
      <button onClick={onToggle} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit",minHeight:38}}>
        <span>Segurança</span>
        <span style={{display:"flex",alignItems:"center",gap:8,color:session?"#10b981":C.muted}}>
          {isAdmin?"Admin":session?"GitHub":"Local"} <span style={{color:C.muted}}>{open?"▴":"▾"}</span>
        </span>
      </button>
      {open&&<>
        <div className="security-chip"><span>Acesso</span><span style={{color:isAdmin?"#10b981":"#eab308"}}>{isAdmin?"Admin":"Restrito"}</span></div>
        <div className="security-chip"><span>Dados</span><span style={{color:cloudColor}}>{cloudLabel}</span></div>
        <div className="security-chip"><span>Privacidade</span><span style={{color:privacyMode?C.orange:C.muted}}>{privacyMode?"Oculta":"Normal"}</span></div>
        <button onClick={()=>setLockEnabled(v=>!v)} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit"}}>
          <span>Bloqueio</span><span style={{color:lockEnabled?"#10b981":C.muted}}>{lockEnabled?"5 min":"off"}</span>
        </button>
        <button onClick={onLockNow} className="security-chip" style={{width:"100%",cursor:"pointer",fontFamily:"inherit",color:C.orange}}>
          <span>Bloquear agora</span><span>⌁</span>
        </button>
      </>}
    </div>
  );
};

const OnboardingGuide = ({session,state,setTab,onDone})=>{
  if(!session?.user)return null;
  const steps=[
    {id:"client",label:"Cadastre seu primeiro cliente",desc:"É a base para proposta, projeto e cobrança.",done:(state.clients||[]).length>0,tab:"clients"},
    {id:"project",label:"Crie um projeto",desc:"Transforme o cliente em produção real.",done:(state.clients||[]).some(c=>(c.videos||[]).length>0),tab:"projects"},
    {id:"doc",label:"Gere um documento",desc:"Use briefing, roteiro, callsheet ou checklist.",done:(state.studioDocs||[]).length>0,tab:"studio"},
    {id:"finance",label:"Marque uma cobrança",desc:"Registre valor a receber ou contrato.",done:(state.financeEntries||[]).length>0||(state.clients||[]).some(c=>Number(c.value||0)>0),tab:"finance"},
  ];
  const doneCount=steps.filter(s=>s.done).length;
  if(doneCount===steps.length)return null;
  return (
    <div className="onboarding-panel" role="region" aria-label="Primeiros passos">
      <div className="onboarding-head">
        <div>
          <div style={{fontSize:10,color:"#3b82f6",fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:5}}>Primeiros passos</div>
          <div style={{fontSize:15,color:"#fff",fontWeight:900,fontFamily:"'Syne',sans-serif"}}>{doneCount}/{steps.length} configurado</div>
        </div>
        <button onClick={onDone} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
      </div>
      <div className="onboarding-body">
        <Bar v={doneCount/steps.length*100} color="#3b82f6" h={5}/>
        <div style={{marginTop:8}}>
          {steps.map(s=>(
            <button key={s.id} className={`onboarding-step ${s.done?"done":""}`} onClick={()=>setTab(s.tab)}>
              <span className="onboarding-check">{s.done?"✓":"○"}</span>
              <span style={{minWidth:0}}>
                <span style={{display:"block",fontSize:12,fontWeight:900,color:s.done?"#10b981":"#eee"}}>{s.label}</span>
                <span style={{display:"block",fontSize:11,color:C.muted,marginTop:2,lineHeight:1.35}}>{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BusinessOnboarding = ({open,business,dispatch,onClose})=>{
  const [form,setForm]=useState({...DEFAULT_BUSINESS,...business,mainServices:((business?.mainServices||DEFAULT_BUSINESS.mainServices).join(", "))});
  useEffect(()=>{if(open)setForm({...DEFAULT_BUSINESS,...business,mainServices:((business?.mainServices||DEFAULT_BUSINESS.mainServices).join(", "))});},[open,business]);
  const save=()=>{
    const services=String(form.mainServices||"").split(",").map(s=>s.trim()).filter(Boolean);
    dispatch({type:"UPDATE_BUSINESS",data:{...form,mainServices:services,onboarded:true,ticketAverage:Number(form.ticketAverage||0)}});
    onClose?.();
  };
  return (
    <Modal open={open} onClose={onClose} title="Configurar seu negócio" wide>
      <div className="modal-section primary">
        <div style={{fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:6}}>Onboarding comercial</div>
        <p style={{margin:0,fontSize:13,color:"#bbb",lineHeight:1.55}}>Esses dados personalizam propostas, WhatsApp comercial, textos e a identidade do sistema.</p>
      </div>
      <div className="form-grid-2">
        <Inp label="Nome da marca" value={form.brandName} onChange={v=>setForm(f=>({...f,brandName:v}))} placeholder={`Ex: ${BRANDING.brandName}`}/>
        <Inp label="Tipo de negócio" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} placeholder="Produtora, social media, agência..."/>
        <Inp label="Ticket médio (R$)" value={form.ticketAverage} onChange={v=>setForm(f=>({...f,ticketAverage:v}))} type="number" placeholder="2500"/>
        <Inp label="WhatsApp comercial" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))} placeholder={BRANDING.whatsapp||"5500000000000"}/>
        <Inp label="Nome da empresa" value={form.companyName} onChange={v=>setForm(f=>({...f,companyName:v}))} placeholder="Razão social ou nome fantasia"/>
        <Inp label="Email comercial" value={form.proposalEmail} onChange={v=>setForm(f=>({...f,proposalEmail:v}))} placeholder="contato@empresa.com"/>
        <Inp label="Documento" value={form.proposalDocument} onChange={v=>setForm(f=>({...f,proposalDocument:v}))} placeholder="CNPJ / CPF"/>
        <Inp label="Cidade" value={form.proposalCity} onChange={v=>setForm(f=>({...f,proposalCity:v}))} placeholder="Florianópolis, SC"/>
        <LogoUploader value={form.logoUrl} onChange={v=>setForm(f=>({...f,logoUrl:v}))} color={form.primaryColor||C.orange}/>
        <div style={{marginBottom:13}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Cor principal</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input type="color" value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{width:46,height:38,borderRadius:10,border:`1px solid ${C.border}`,background:"transparent"}}/>
            <input value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>
        </div>
      </div>
      <Txt label="Serviços principais" value={form.mainServices} onChange={v=>setForm(f=>({...f,mainServices:v}))} placeholder="Vídeo institucional, reels, eventos..." rows={3}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <Btn onClick={onClose} variant="ghost">Depois</Btn>
        <Btn onClick={save}>Salvar configuração</Btn>
      </div>
    </Modal>
  );
};

const TabBusinessSettings = ({state,dispatch})=>{
  const business=normalizeBusiness(state.business);
  const [form,setForm]=useState({...business,mainServices:(business.mainServices||[]).join(", ")});
  useEffect(()=>setForm({...business,mainServices:(business.mainServices||[]).join(", ")}),[state.business]);
  const save=()=>dispatch({type:"UPDATE_BUSINESS",data:{...form,mainServices:String(form.mainServices||"").split(",").map(s=>s.trim()).filter(Boolean),ticketAverage:Number(form.ticketAverage||0),onboarded:true}});
  return (
    <div className="page-stack">
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:business.primaryColor||C.orange}}>CONFIGURAÇÕES DO NEGÓCIO</div>
            <div className="page-title">{business.brandName||APP_NAME}</div>
            <p className="page-subtitle">Ajuste identidade, dados comerciais e padrões usados em propostas e contato de venda.</p>
          </div>
          <div style={{width:58,height:58,borderRadius:18,border:`1px solid ${(business.primaryColor||C.orange)}55`,background:`${business.primaryColor||C.orange}18`,display:"grid",placeItems:"center",overflow:"hidden"}}>
            <LogoMark business={business} size={58}/>
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>PERFIL COMERCIAL</SectionTitle>
        <div className="form-grid-2">
          <Inp label="Nome da marca" value={form.brandName} onChange={v=>setForm(f=>({...f,brandName:v}))}/>
          <Inp label="Tipo de negócio" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}/>
          <Inp label="Ticket médio (R$)" value={form.ticketAverage} onChange={v=>setForm(f=>({...f,ticketAverage:v}))} type="number"/>
          <Inp label="WhatsApp comercial" value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))}/>
          <Inp label="Nome da empresa" value={form.companyName} onChange={v=>setForm(f=>({...f,companyName:v}))}/>
          <Inp label="Email comercial" value={form.proposalEmail} onChange={v=>setForm(f=>({...f,proposalEmail:v}))}/>
          <Inp label="Documento" value={form.proposalDocument} onChange={v=>setForm(f=>({...f,proposalDocument:v}))}/>
          <Inp label="Cidade" value={form.proposalCity} onChange={v=>setForm(f=>({...f,proposalCity:v}))}/>
          <LogoUploader value={form.logoUrl} onChange={v=>setForm(f=>({...f,logoUrl:v}))} color={form.primaryColor||C.orange}/>
          <div style={{marginBottom:13}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Cor principal</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <input type="color" value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{width:46,height:38,borderRadius:10,border:`1px solid ${C.border}`,background:"transparent"}}/>
              <input value={form.primaryColor||C.orange} onChange={e=>setForm(f=>({...f,primaryColor:e.target.value}))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
            </div>
          </div>
        </div>
        <Txt label="Serviços principais" value={form.mainServices} onChange={v=>setForm(f=>({...f,mainServices:v}))} rows={3}/>
        <Btn onClick={save}>Salvar negócio</Btn>
      </Card>
    </div>
  );
};
// ── DASHBOARD ──────────────────────────────────────────────────────────
const RevenueOSScore = ({state,setTab,privacyMode,isAdmin,onToggleMoney})=>{
  const clients=state.clients||[],projects=clients.flatMap(c=>(c.videos||[])),entries=state.financeEntries||[];
  const proposals=clients.flatMap(c=>(c.proposals||[]));
  const checks=[
    {label:"CRM com clientes",done:clients.length>0,tab:"clients",hint:"Cadastre seu primeiro lead ou cliente."},
    {label:"Propostas no histórico",done:proposals.length>0,tab:"proposta",hint:"Crie proposta vinculada ao cliente."},
    {label:"Produção mapeada",done:projects.length>0,tab:"projects",hint:"Use presets audiovisuais para abrir projetos."},
    {label:"Financeiro previsível",done:entries.length>0||clients.some(c=>Number(c.value||0)>0),tab:"finance",hint:"Registre contratos, entradas ou despesas."},
    {label:"Negócio configurado",done:!!state.business?.onboarded,tab:"business",hint:"Configure marca, WhatsApp e ticket médio."},
    {label:"Brand Book disponível",done:true,tab:"brandbook",hint:"Revise logo, cores, voz e exportação."},
  ];
  const score=Math.round(checks.filter(c=>c.done).length/checks.length*100);
  const pipeline=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).reduce((a,c)=>a+Number(c.value||0)*(Number(c.closeProbability||c.probability||50)/100),0);
  return (
    <Card style={{padding:"18px",background:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(255,255,255,.025))",borderColor:"rgba(249,115,22,.2)",overflow:"hidden"}}>
      <div className="revenue-score-grid">
        <div style={{textAlign:"center"}}>
          <div style={{width:128,height:128,borderRadius:"50%",margin:"0 auto",display:"grid",placeItems:"center",background:`conic-gradient(${score>=70?"#10b981":score>=40?C.orange:"#eab308"} ${score*3.6}deg, rgba(255,255,255,.07) 0deg)`,boxShadow:"0 24px 70px rgba(0,0,0,.35)"}}>
            <div style={{width:104,height:104,borderRadius:"50%",background:"#151515",display:"grid",placeItems:"center"}}>
              <div><div style={{fontSize:30,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1}}>{score}%</div><div style={{fontSize:9,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",marginTop:4}}>{APP_NAME}</div></div>
            </div>
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{minWidth:0,flex:"1 1 220px"}}>
              <div style={{fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase"}}>Radar operacional</div>
              <div style={{fontSize:17,color:"#fff",fontWeight:900,fontFamily:"'Syne',sans-serif",marginTop:4}}>Próximas decisões da {state.business?.brandName||APP_NAME}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"flex-end",flexWrap:"wrap",maxWidth:"100%"}}>
              <EyeToggle hidden={privacyMode} onClick={onToggleMoney}/>
              <Tag color="#10b981">{privacyMode?"Pipeline oculto":`${fmtCurrency(pipeline)} pipeline`}</Tag>
            </div>
          </div>
          <div style={{display:"grid",gap:7}}>
            {checks.map(c=><button key={c.label} onClick={()=>setTab(c.tab)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"8px 0",border:"none",borderBottom:`1px solid ${C.border}`,background:"transparent",color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <span><span style={{fontSize:12,fontWeight:900,color:c.done?"#10b981":"#eee"}}>{c.done?"✓":"○"} {c.label}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{c.done?"Pronto":c.hint}</span></span>
              <span style={{fontSize:10,color:c.done?"#10b981":C.orange,fontWeight:900}}>{c.done?"OK":"abrir"}</span>
            </button>)}
          </div>
        </div>
      </div>
    </Card>
  );
};

const ExecutiveBriefing = ({state,setTab,privacyMode})=>{
  const clients=state.clients||[];
  const projects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v})));
  const entries=state.financeEntries||[];
  const activeClients=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length;
  const pipelineValue=clients.filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).reduce((a,c)=>a+Number(c.value||0)*(Number(c.closeProbability||50)/100),0);
  const productionOpen=projects.filter(p=>p.video.status!=="entregue").length;
  const receivable=clients.filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0)+entries.filter(e=>e.type==="entrada"&&e.status!=="pago").reduce((a,e)=>a+Number(e.value||0),0);
  const tasksDue=(state.tasks||[]).filter(t=>!t.completed&&["overdue","today"].includes(taskBucket(t))).length;
  const cards=[
    {label:"Receita prevista",value:fmtDashboardMoney(pipelineValue,privacyMode),note:`${activeClients} cliente${activeClients===1?" em negociação":"s em negociação"}`,tab:"clients",color:"#10b981",money:true},
    {label:"Produção aberta",value:productionOpen,note:"projetos ainda não entregues",tab:"projects",color:"#8b5cf6"},
    {label:"A receber",value:fmtDashboardMoney(receivable,privacyMode),note:"contratos e lançamentos pendentes",tab:"finance",color:"#3b82f6",money:true},
    {label:"Agenda crítica",value:tasksDue,note:"tarefas para hoje ou atrasadas",tab:"tasks",color:C.orange},
  ];
  return (
    <div className="elite-briefing">
      {cards.map(card=>(
        <button key={card.label} className="elite-brief-card" style={{"--accent":card.color,textAlign:"left",fontFamily:"inherit"}} onClick={()=>setTab(card.tab)}>
          <div className="elite-brief-label">{card.label}</div>
          <div className={`elite-brief-value ${card.money?"money":""}`}>{card.value}</div>
          <div className="elite-brief-note">{card.note}</div>
          <div className="elite-brief-action">Abrir área</div>
        </button>
      ))}
    </div>
  );
};

const TabDashboard = ({state,dispatch,quoteIdx,setTab,privacyMode,setPrivacyMode,userName,isAdmin})=>{
  const [revealDashboardMoney,setRevealDashboardMoney]=useState(false);
  const [showDashboardDetails,setShowDashboardDetails]=useState(false);
  const today=todayStr(),lv=getLevel(state.xp);
  const pendingTasks=state.tasks.filter(t=>!t.completed);
  const overdueTasks=pendingTasks.filter(t=>taskBucket(t)==="overdue");
  const todayTasks=pendingTasks.filter(t=>taskBucket(t)==="today");
  const totalReceivable=(state.clients||[]).filter(c=>c.payment!=="pago").reduce((a,c)=>a+Number(c.value||0),0);
  const overduePayments=(state.clients||[]).filter(c=>c.payment==="atrasado");
  const pendingFollowUps=(state.clients||[]).filter(c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&! ["entregue","pago"].includes(normalizeClientStatus(c)));
  const pendingVideos=(state.clients||[]).reduce((a,c)=>(c.videos||[]).filter(v=>v.status!=="entregue").length+a,0);
  const projectSteps=(state.clients||[]).flatMap(c=>(c.videos||[]).flatMap(v=>(v.productionSchedule||[]).filter(s=>!s.done&&s.date&&v.status!=="entregue").map(s=>({client:c,video:v,step:s,diff:dayDiff(s.date)}))));
  const lateProjectSteps=projectSteps.filter(x=>x.diff<0);
  const todayProjectSteps=projectSteps.filter(x=>x.diff===0);
  const upcomingMeetings=(state.clients||[]).filter(c=>{if(!c.nextMeeting)return false;const diff=Math.ceil((new Date(c.nextMeeting)-new Date())/(1000*60*60*24));return diff>=0&&diff<=7;}).sort((a,b)=>new Date(a.nextMeeting)-new Date(b.nextMeeting));
  const lastBackup=localStorage.getItem("dcc_last_backup");
  const backupDays=lastBackup?Math.floor((new Date()-new Date(lastBackup))/(1000*60*60*24)):null;
  const attention=[
    overdueTasks.length&&{label:`${overdueTasks.length} tarefa${overdueTasks.length>1?"s":""} atrasada${overdueTasks.length>1?"s":""}`,tab:"tasks",color:"#ef4444"},
    todayTasks.length&&{label:`${todayTasks.length} tarefa${todayTasks.length>1?"s":""} para hoje`,tab:"tasks",color:"#10b981"},
    overduePayments.length&&{label:`${overduePayments.length} pagamento${overduePayments.length>1?"s":""} atrasado${overduePayments.length>1?"s":""}`,tab:"clients",color:"#ef4444"},
    pendingFollowUps.length&&{label:`${pendingFollowUps.length} follow-up${pendingFollowUps.length>1?"s":""} pendente${pendingFollowUps.length>1?"s":""}`,tab:"clients",color:"#f97316"},
    lateProjectSteps.length&&{label:`${lateProjectSteps.length} marco${lateProjectSteps.length>1?"s":""} de produção atrasado${lateProjectSteps.length>1?"s":""}`,tab:"projects",color:"#ef4444"},
    todayProjectSteps.length&&{label:`${todayProjectSteps.length} entrega${todayProjectSteps.length>1?"s":""} de produção hoje`,tab:"projects",color:"#8b5cf6"},
    upcomingMeetings.length&&{label:`${upcomingMeetings.length} ${upcomingMeetings.length>1?"reuniões":"reunião"} na semana`,tab:"clients",color:"#3b82f6"},
    pendingVideos>0&&{label:`${pendingVideos} vídeo${pendingVideos>1?"s":""} em produção`,tab:"clients",color:"#8b5cf6"},
    (backupDays===null||backupDays>=7)&&{label:backupDays===null?"Backup ainda não registrado":`Backup há ${backupDays} dias`,tab:"export",color:"#eab308"},
  ].filter(Boolean);
  const dailyActions=[
    overdueTasks.length&&{title:"Resolver atividades atrasadas",text:`${overdueTasks.length} atividade${overdueTasks.length>1?"s":""} ficou para trás.`,tab:"tasks",color:"#ef4444"},
    pendingFollowUps.length&&{title:"Responder clientes",text:`${pendingFollowUps.length} follow-up${pendingFollowUps.length>1?"s":""} pede retorno hoje.`,tab:"clients",color:"#f97316"},
    lateProjectSteps.length&&{title:"Destravar produção",text:`${lateProjectSteps.length} marco${lateProjectSteps.length>1?"s":""} de projeto em atraso.`,tab:"projects",color:"#8b5cf6"},
    overduePayments.length&&{title:"Cobrar pendências",text:`${overduePayments.length} pagamento${overduePayments.length>1?"s":""} em atraso.`,tab:"finance",color:"#eab308"},
    todayTasks.length&&{title:"Executar as atividades de hoje",text:`${todayTasks.length} atividade${todayTasks.length>1?"s":""} para finalizar hoje.`,tab:"tasks",color:"#10b981"},
    upcomingMeetings.length&&{title:"Preparar reunião",text:`${upcomingMeetings.length} ${upcomingMeetings.length>1?"reuniões":"reunião"} nos próximos dias.`,tab:"clients",color:"#3b82f6"},
  ].filter(Boolean);
  const primaryAction=dailyActions[0]||{title:"Comece por um cliente",text:`Cadastre ou atualize um cliente para ${state.business?.brandName||APP_NAME} organizar proposta, produção e revisão.`,tab:"clients",color:C.orange};
  const dashboardPrivacy=privacyMode||!revealDashboardMoney;
  const toggleDashboardMoney=()=>{
    if(dashboardPrivacy){
      setPrivacyMode?.(false);
      setRevealDashboardMoney(true);
    }else{
      setRevealDashboardMoney(false);
    }
  };
  const selectProfile=p=>{
    dispatch({type:"UPDATE_BUSINESS",data:{profile:p.id,type:p.type,ticketAverage:p.ticket,mainServices:p.services,onboarded:true}});
  };
  const quickActions=[
    {title:"Novo cliente",text:"Pacotes, origem e próxima ação por botões.",tab:"clients",color:"#10b981"},
    {title:"Nova atividade",text:"Modelos prontos para comercial e produção.",tab:"tasks",color:C.orange},
    {title:"Novo projeto",text:"Briefing, cronograma e checklist saem de presets.",tab:"projects",color:"#8b5cf6"},
    {title:"Documento PDF",text:"Escolha o tipo e gere com a estrutura correta.",tab:"studio",color:"#06b6d4"},
  ];
  return (
    <div className="page-stack">
      <Card className="elite-dashboard-hero">
        <div className="elite-dashboard-grid">
          <div>
            <div className="elite-kicker">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div>
            <div style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1,marginTop:8}}>Bom trabalho, {userName||"criador"}.</div>
            <p style={{fontSize:14,color:"#aaa",lineHeight:1.6,maxWidth:620,margin:"12px 0 0"}}>Seu cockpit mostra o que merece decisão agora: receita prevista, produção aberta, próximos compromissos e execução do dia.</p>
            <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <Tag color={lv.color}>{lv.name}</Tag>
              <span style={{fontSize:11,color:C.muted,fontWeight:900}}>{state.xp} XP</span>
              <span style={{fontSize:11,color:C.muted}}>Atualizado {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
              <EyeToggle hidden={dashboardPrivacy} onClick={toggleDashboardMoney}/>
            </div>
          </div>
          <div className="elite-command-panel">
            <div style={{fontSize:10,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:8}}>Direção do dia</div>
            <p style={{margin:"0 0 12px",fontSize:13,color:"#d6d6d6",lineHeight:1.55}}>"{QUOTES[quoteIdx%QUOTES.length]}"</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="elite-secondary" onClick={()=>setTab("videoReview")} style={{minHeight:38,padding:"0 10px"}}>Video Review</button>
              <button className="elite-secondary" onClick={()=>setTab("clients")} style={{minHeight:38,padding:"0 10px"}}>CRM</button>
            </div>
          </div>
        </div>
      </Card>
      <div className="dashboard-shell">
        <div className="dashboard-main">
          <Card className="dashboard-action-card">
            <div className="page-hero-row">
              <div>
                <div style={{fontSize:11,color:primaryAction.color,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",marginBottom:7}}>O QUE FAZER AGORA</div>
                <div style={{fontSize:28,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:900,lineHeight:1.05}}>{primaryAction.title}</div>
                <p style={{fontSize:13,color:"#aaa",lineHeight:1.55,margin:"8px 0 0",maxWidth:680}}>{primaryAction.text} Esta tela prioriza decisão e ação, sem despejar tudo de uma vez.</p>
              </div>
              <Btn onClick={()=>setTab(primaryAction.tab)} style={{background:`linear-gradient(135deg,${primaryAction.color},${C.orangeD})`,justifyContent:"center"}}>Abrir agora</Btn>
            </div>
            <div className="summary-strip" style={{marginTop:18}}>
              {[
                {label:"Clientes para responder",value:pendingFollowUps.length,color:"#f97316",tab:"clients"},
                {label:"Projetos ativos",value:pendingVideos,color:"#8b5cf6",tab:"projects"},
                {label:"Documentos salvos",value:(state.studioDocs||[]).length,color:"#06b6d4",tab:"studio"},
                {label:"A receber",value:fmtDashboardMoney(totalReceivable,dashboardPrivacy),color:"#eab308",tab:"finance",money:true},
              ].map(item=><button key={item.label} onClick={()=>setTab(item.tab)} className="metric-tile" style={{textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
                <div className={`metric-value ${item.money?"money":""}`} style={{color:item.color}}>{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </button>)}
            </div>
          </Card>
          <ExecutiveBriefing state={state} setTab={setTab} privacyMode={dashboardPrivacy}/>
          <Card style={{padding:"16px 18px",background:"rgba(255,255,255,.035)",borderColor:"rgba(255,255,255,.09)"}}>
            <SectionTitle>ALERTAS E DECISÕES</SectionTitle>
            {attention.length===0&&<div style={{fontSize:13,color:C.muted}}>Sem alertas críticos agora. O sistema está limpo para execução.</div>}
            {attention.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {attention.slice(0,6).map((a,i)=><button key={i} onClick={()=>setTab(a.tab)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 12px",borderRadius:12,border:`1px solid ${a.color}30`,background:`${a.color}10`,color:"#eee",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><span style={{fontSize:13,fontWeight:800}}>{a.label}</span><span style={{fontSize:11,color:a.color,fontWeight:900}}>Abrir</span></button>)}
            </div>}
          </Card>
        </div>
        <aside className="dashboard-rail">
          <RevenueOSScore state={state} setTab={setTab} privacyMode={dashboardPrivacy} isAdmin={isAdmin} onToggleMoney={toggleDashboardMoney}/>
          <Card>
            <SectionTitle>COMEÇAR RÁPIDO</SectionTitle>
            <div className="dashboard-quick-grid">
              {quickActions.map(item=><button key={item.title} onClick={()=>setTab(item.tab)} className="dashboard-quick-card" style={{"--quick-color":`${item.color}33`,"--quick-strong":item.color,"--quick-bg":`${item.color}12`}}>
                <div style={{fontSize:13,color:item.color,fontWeight:900,marginBottom:5}}>{item.title}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.45}}>{item.text}</div>
              </button>)}
            </div>
          </Card>
          {!state.business?.profile&&<Card>
            <SectionTitle>PERFIL</SectionTitle>
            <p style={{fontSize:12,color:C.muted,lineHeight:1.5,margin:"-4px 0 12px"}}>Escolha uma base e o sistema adapta serviços e ticket.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {PROFILE_PRESETS.map(p=><button key={p.id} onClick={()=>selectProfile(p)} style={{textAlign:"left",padding:"11px",borderRadius:13,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)",color:"#eee",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{fontSize:12,color:"#fff",fontWeight:900,marginBottom:5}}>{p.label}</div>
                <Tag color={C.orange}>{fmtDashboardMoney(p.ticket,dashboardPrivacy)}</Tag>
              </button>)}
            </div>
          </Card>}
        </aside>
	      </div>

	      <div style={{display:"flex",justifyContent:"center"}}>
	        <button onClick={()=>setShowDashboardDetails(v=>!v)} className="elite-secondary" style={{minHeight:38,padding:"0 14px"}}>
	          {showDashboardDetails?"Ocultar detalhes":"Ver detalhes do dia"}
	        </button>
	      </div>

	      {showDashboardDetails&&<div className="summary-strip">
	        {[
          {v:(state.reviewDeliverables||[]).filter(r=>!["aprovado","approved"].includes(String(r.status||"").toLowerCase())).length,l:"Reviews pendentes",c:"#06b6d4",icon:"◉"},
          {v:pendingTasks.length,l:"Atividades abertas",c:"#fb923c",icon:"✓"},
          {v:pendingVideos,l:"Projetos abertos",c:"#8b5cf6",icon:"▶"},
          {v:(state.clients||[]).filter(c=>!["entregue","pago"].includes(normalizeClientStatus(c))).length,l:"Clientes ativos",c:"#10b981",icon:"◆"},
        ].map((s,i)=>(
          <Card key={i} style={{padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{s.l}</div>
          </Card>
        ))}
	      </div>}

	      {showDashboardDetails&&<div className="split-layout">
        <div className="dense-list">
          {pendingTasks.length>0&&(
            <Card style={{padding:"16px 18px"}}>
              <SectionTitle>PRÓXIMAS ATIVIDADES</SectionTitle>
              {pendingTasks.slice(0,5).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <button onClick={()=>dispatch({type:"TOGGLE_TASK",id:t.id})} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.border}`,background:"transparent",cursor:"pointer",flexShrink:0,transition:"border-color .2s"}} onMouseEnter={e=>e.target.style.borderColor=C.orange} onMouseLeave={e=>e.target.style.borderColor=C.border}/>
                  <span style={{flex:1,fontSize:13,color:"#ccc"}}>{t.title}</span>
                  {t.dueDate&&<Tag color={taskBucket(t)==="overdue"?"#ef4444":taskBucket(t)==="today"?"#10b981":C.orange}>{new Date(t.dueDate+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</Tag>}
                </div>
              ))}
            </Card>
          )}
          {upcomingMeetings.length>0&&(
            <Card style={{padding:"16px 18px",background:"rgba(59,130,246,.05)",borderColor:"rgba(59,130,246,.2)"}}>
              <SectionTitle>REUNIÕES ESTA SEMANA</SectionTitle>
              {upcomingMeetings.map(c=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div className="private-data" style={{fontSize:13,fontWeight:700,color:"#e2e2e2"}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.service||""}</div></div>
                  <Tag color="#3b82f6">{new Date(c.nextMeeting+"T00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</Tag>
                </div>
              ))}
            </Card>
          )}
          {totalReceivable>0&&(
            <Card style={{padding:"16px 18px",background:"rgba(234,179,8,.05)",borderColor:"rgba(234,179,8,.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,color:"#eab308",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>VALORES A RECEBER</div><div style={{fontSize:22,fontWeight:800,color:"#eab308",fontFamily:"'Syne',sans-serif",marginTop:4}}>{fmtDashboardMoney(totalReceivable,dashboardPrivacy)}</div></div>
                <span style={{fontSize:28}}>R$</span>
              </div>
            </Card>
          )}
        </div>
        <aside className="side-panel">
          <Card style={{padding:"16px 18px"}}>
            <SectionTitle>VIDEO REVIEW</SectionTitle>
            {(state.reviewDeliverables||[]).slice(0,4).map(r=>(
              <button key={r.id||r.token||r.title} onClick={()=>setTab("videoReview")} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{minWidth:0}}><span className="private-data" style={{display:"block",fontSize:12,fontWeight:900,color:"#eee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.title||"Review sem título"}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{r.status||"aguardando"}</span></span>
                <span style={{fontSize:10,color:"#06b6d4",fontWeight:900}}>abrir</span>
              </button>
            ))}
            {!(state.reviewDeliverables||[]).length&&<div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Nenhum review aberto. Use esta área para enviar links de aprovação para clientes.</div>}
          </Card>
          <Card style={{padding:"16px 18px"}}>
            <SectionTitle>DOCUMENTOS</SectionTitle>
            {(state.studioDocs||[]).slice(0,4).map(d=>(
              <button key={d.id||d.title} onClick={()=>setTab("studio")} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 0",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{minWidth:0}}><span style={{display:"block",fontSize:12,fontWeight:900,color:"#eee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.title||d.type||"Documento"}</span><span style={{display:"block",fontSize:10,color:C.muted,marginTop:2}}>{d.type||"PDF operacional"}</span></span>
                <span style={{fontSize:10,color:"#3b82f6",fontWeight:900}}>abrir</span>
              </button>
            ))}
            {!(state.studioDocs||[]).length&&<div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Briefing, roteiro, callsheet e checklist aparecem aqui quando forem salvos.</div>}
          </Card>
        </aside>
	      </div>}
	    </div>
  );
};

const TabGSD = ({state,dispatch,setTab})=>{
  const agent=normalizeGsdAgent(state.gsdAgent);
  const [entry,setEntry]=useState("");
  const [entryType,setEntryType]=useState("context");
  const [focus,setFocus]=useState(agent.currentFocus||"");
  const clients=state.clients||[];
  const openTasks=(state.tasks||[]).filter(t=>!t.completed);
  const activeProjects=clients.flatMap(c=>(c.videos||[]).map(v=>({client:c,video:v}))).filter(p=>p.video.status!=="entregue");
  const overdueTasks=openTasks.filter(t=>taskBucket(t)==="overdue");
  const dueToday=openTasks.filter(t=>taskBucket(t)==="today");
  const followUps=clients.filter(c=>c.followUpDate&&dayDiff(c.followUpDate)<=0&&!["entregue","pago"].includes(normalizeClientStatus(c)));
  const saveEntry=()=>{
    const text=entry.trim();
    if(!text)return;
    dispatch({type:"ADD_GSD_CONTEXT",entry:{type:entryType,text,tags:["gsd",entryType]}});
    setEntry("");
  };
  const saveFocus=()=>{
    dispatch({type:"UPDATE_GSD_AGENT",data:{enabled:true,currentFocus:focus,lastActivatedAt:new Date().toISOString()}});
  };
  const createTaskFromMemory=m=>{
    dispatch({type:"ADD_TASK",task:{title:m.text.slice(0,96),priority:m.type==="decision"?"high":"medium",tag:"GSD",dueDate:inputDate()}});
    setTab("tasks");
  };
  const captureSnapshot=()=>{
    const lines=[
      focus&&`Foco atual: ${focus}`,
      overdueTasks.length&&`${overdueTasks.length} tarefa(s) atrasada(s)`,
      dueToday.length&&`${dueToday.length} tarefa(s) para hoje`,
      followUps.length&&`${followUps.length} follow-up(s) pendente(s)`,
      activeProjects.length&&`${activeProjects.length} projeto(s) em produção`
    ].filter(Boolean);
    dispatch({type:"ADD_GSD_CONTEXT",entry:{type:"snapshot",text:lines.length?lines.join(" | "):"Operação sem pendências críticas no momento.",tags:["gsd","snapshot"]}});
  };
  const memory=agent.memory||[];
  const typeMeta={
    context:{label:"Contexto",color:"#3b82f6"},
    decision:{label:"Decisão",color:"#10b981"},
    blocker:{label:"Bloqueio",color:"#ef4444"},
    next:{label:"Próxima ação",color:C.orange},
    snapshot:{label:"Snapshot",color:"#8b5cf6"}
  };
  return (
    <div className="page-stack">
      <Card className="page-hero" style={{background:"linear-gradient(135deg,rgba(255,36,0,.12),rgba(255,255,255,.035))",borderColor:"rgba(255,36,0,.24)"}}>
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{color:C.orange}}>GSD AGENT ATIVO</div>
            <div className="page-title">Get Shit Done</div>
            <p className="page-subtitle">Agente de contexto da operação: captura memória, decisões e próximas ações para nada importante sumir no meio do dia.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
              <Tag color={agent.enabled?"#10b981":"#eab308"}>{agent.enabled?"ativo":"pausado"}</Tag>
              <Tag color="#8b5cf6">{memory.length} memórias</Tag>
              <Tag color={C.orange}>{agent.mode}</Tag>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <Btn onClick={()=>dispatch({type:"UPDATE_GSD_AGENT",data:{enabled:!agent.enabled,lastActivatedAt:new Date().toISOString()}})} variant={agent.enabled?"ghost":"success"}>{agent.enabled?"Pausar":"Ativar"}</Btn>
            <Btn onClick={captureSnapshot} variant="ghost">Capturar agora</Btn>
          </div>
        </div>
      </Card>

      <div className="split-layout">
        <div className="dense-list">
          <Card>
            <SectionTitle>FOCO DO AGENTE</SectionTitle>
            <Txt label="Foco atual" value={focus} onChange={setFocus} rows={3} placeholder="Ex: fechar proposta X, destravar edição Y, preparar reunião com cliente Z"/>
            <Btn onClick={saveFocus}>Salvar foco GSD</Btn>
          </Card>

          <Card>
            <SectionTitle action={<Tag color={typeMeta[entryType]?.color}>{typeMeta[entryType]?.label}</Tag>}>NOVA MEMÓRIA</SectionTitle>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
              {Object.entries(typeMeta).filter(([id])=>id!=="snapshot").map(([id,meta])=>(
                <button key={id} onClick={()=>setEntryType(id)} style={{height:32,borderRadius:10,border:`1px solid ${entryType===id?meta.color:C.border}`,background:entryType===id?`${meta.color}18`:"rgba(255,255,255,.04)",color:entryType===id?meta.color:C.muted,fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer",padding:"0 10px"}}>{meta.label}</button>
              ))}
            </div>
            <Txt label="Contexto" value={entry} onChange={setEntry} rows={5} placeholder="Cole aqui o que precisa ser lembrado pelo GSD."/>
            <Btn onClick={saveEntry}>Guardar contexto</Btn>
          </Card>

          <Card>
            <SectionTitle>MEMÓRIA GSD</SectionTitle>
            {memory.length===0&&<div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>Sem contexto salvo ainda. Guarde decisões, bloqueios e próximos passos para o agente carregar a operação com você.</div>}
            <div style={{display:"grid",gap:10}}>
              {memory.map(m=>{
                const meta=typeMeta[m.type]||typeMeta.context;
                return (
                  <div key={m.id} style={{padding:"13px 14px",borderRadius:14,border:`1px solid ${meta.color}30`,background:`${meta.color}10`}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:7}}>
                      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                        <Tag color={meta.color}>{meta.label}</Tag>
                        <span style={{fontSize:10,color:C.muted,fontWeight:800}}>{new Date(m.createdAt).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                      <button onClick={()=>dispatch({type:"REMOVE_GSD_CONTEXT",id:m.id})} aria-label="Remover memória GSD" style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
                    </div>
                    <div style={{fontSize:13,color:"#ddd",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{m.text}</div>
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      <Btn onClick={()=>createTaskFromMemory(m)} variant="ghost" size="sm">Virar tarefa hoje</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <aside className="dashboard-rail">
          <Card style={{padding:"18px",background:"rgba(16,185,129,.06)",borderColor:"rgba(16,185,129,.2)"}}>
            <SectionTitle>LEITURA OPERACIONAL</SectionTitle>
            {[
              {label:"Atrasadas",value:overdueTasks.length,color:"#ef4444",tab:"tasks"},
              {label:"Hoje",value:dueToday.length,color:"#10b981",tab:"tasks"},
              {label:"Follow-ups",value:followUps.length,color:"#3b82f6",tab:"clients"},
              {label:"Projetos ativos",value:activeProjects.length,color:"#8b5cf6",tab:"projects"}
            ].map(item=>(
              <button key={item.label} onClick={()=>setTab(item.tab)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"10px 0",border:"none",borderBottom:`1px solid ${C.border}`,background:"transparent",color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{fontSize:13,fontWeight:900}}>{item.label}</span>
                <Tag color={item.color}>{item.value}</Tag>
              </button>
            ))}
          </Card>

          <Card>
            <SectionTitle>REGRAS GSD</SectionTitle>
            <div style={{display:"grid",gap:8}}>
              {(agent.operatingRules||[]).map(rule=>(
                <div key={rule} style={{fontSize:12,color:"#ccc",lineHeight:1.45,padding:"9px 10px",borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.035)"}}>{rule}</div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>ATALHOS</SectionTitle>
            <div style={{display:"grid",gap:8}}>
              <Btn onClick={()=>setTab("tasks")} variant="ghost" style={{justifyContent:"center"}}>Abrir atividades</Btn>
              <Btn onClick={()=>setTab("clients")} variant="ghost" style={{justifyContent:"center"}}>Abrir CRM</Btn>
              <Btn onClick={()=>setTab("projects")} variant="ghost" style={{justifyContent:"center"}}>Abrir projetos</Btn>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard", label:"Hoje", icon:"⊞"},
  {id:"gsd",       label:"GSD", icon:"G"},
  {id:"tasks",     label:"Atividades",   icon:"✓"},
  {id:"agenda",    label:"Agenda",    icon:"□"},
  {id:"clients",   label:"Clientes",  icon:"◈"},
  {id:"projects",  label:"Projetos",  icon:"▦"},
  {id:"videoReview",label:"Video Review",icon:"▶"},
  {id:"studio",    label:"Documentos",    icon:"▣"},
  {id:"brandbook", label:"Brand Book", icon:"◩"},
  {id:"finance",   label:"Caixa",icon:"◆"},
  {id:"proposta",  label:"Propostas",  icon:"§"},
  {id:"business",  label:"Negócio",   icon:"◒"},
  {id:"export",    label:"Relatórios",icon:"▤"},
];
const NAV_GROUPS=[
  {label:"Produto principal",items:["videoReview"]},
  {label:"Operação",items:["dashboard","gsd","tasks","agenda","projects","studio","brandbook"]},
  {label:"Comercial",items:["clients","proposta","finance"]},
  {label:"Sistema",items:["business","export"]},
];
const BEGINNER_TABS = ["dashboard","gsd","videoReview","clients","proposta","projects","studio","brandbook","finance","tasks","business","export"];
const WORKSPACE_TAB_IDS = new Set(BEGINNER_TABS);
const PROFILE_PRESETS = [
  {id:"filmmaker",label:"Filmmaker",type:"Filmmaker / produtor audiovisual",services:["Vídeo Institucional","Reels","Eventos","Drone"],ticket:2500,first:"Cadastrar cliente e criar projeto de captação."},
  {id:"editor",label:"Editor",type:"Editor de vídeo",services:["Edição de Reels","Edição para YouTube","Motion simples","Pacote mensal"],ticket:1200,first:"Cadastrar cliente recorrente e acompanhar revisões."},
  {id:"studio",label:"Produtora",type:"Produtora audiovisual",services:["Institucional","Campanha","Evento","Conteúdo mensal"],ticket:5000,first:"Organizar pipeline, callsheet e financeiro por projeto."},
  {id:"agency",label:"Agência / Social",type:"Agência criativa / social media",services:["Conteúdo mensal","Tráfego criativo","Stories","Campanhas"],ticket:3500,first:"Separar clientes mensais, demandas e entregas."},
];
function App(){
  const [state,setRaw]=useState(INIT),[tab,setTab]=useState("dashboard"),[quoteIdx,setQuoteIdx]=useState(0);
  const [privacyMode,setPrivacyMode]=useState(()=>localStorage.getItem("dcc_privacy")==="1");
  const [compactMode,setCompactMode]=useState(()=>localStorage.getItem("dcc_compact")==="1");
  const [navMode,setNavMode]=useState(()=>localStorage.getItem("dnz_nav_mode")||"beginner");
  const [soundEnabled,setSoundEnabled]=useState(()=>localStorage.getItem("dcc_sound")!=="0");
  const [lockEnabled,setLockEnabled]=useState(()=>localStorage.getItem("dcc_lock")!=="0");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>localStorage.getItem("dnz_sidebar_collapsed")==="1");
  const [dockOpen,setDockOpen]=useState(()=>localStorage.getItem("dnz_dock_open")==="1");
  const [locked,setLocked]=useState(false);
  const [accountOpen,setAccountOpen]=useState(false);
  const [securityOpen,setSecurityOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [navOpen,setNavOpen]=useState(false);
  const [toast,setToast]=useState(null);
  const [onboardingDismissed,setOnboardingDismissed]=useState(false);
  const [businessOnboardingOpen,setBusinessOnboardingOpen]=useState(false);
  const soundReady=useRef(false);
  const supabaseRef=useRef(null);
  const scrollMemory=useRef({});
  const syncTimer=useRef(null);
  const lockTimer=useRef(null);
  const welcomeShown=useRef(false);
  const workspaceOpened=useRef(false);
  const [session,setSession]=useState(null);
  const [cloudStatus,setCloudStatus]=useState("local");
  const [route,setRoute]=useState(()=>window.location.pathname || "/");
  const business=normalizeBusiness(state.business);
  const userName=getUserName(session);
  const isAdmin=isAdminSession(session);
  const reviewPathToken=route.startsWith("/review/")?decodeURIComponent(route.replace(/^\/review\//,"").split(/[?#]/)[0]||""):"";
  const publicReviewToken=reviewPathToken||new URLSearchParams(window.location.search).get("review")||"";
  const hasFullAccess=isAdmin;
  const publicTabs=[];
  const canUseWorkspace=!!session?.user&&hasFullAccess;
  const navigateTo=useCallback((path)=>{
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  },[]);
  useEffect(()=>{
    if(route!=="/app"&&canUseWorkspace)navigateTo("/app");
  },[route,canUseWorkspace,navigateTo]);
  useEffect(()=>{
    const onRoute=()=>setRoute(window.location.pathname || "/");
    window.addEventListener("popstate",onRoute);
    return()=>window.removeEventListener("popstate",onRoute);
  },[]);
  useEffect(()=>{
    if(!canUseWorkspace||workspaceOpened.current)return;
    workspaceOpened.current=true;
    const last=localStorage.getItem("dcc_last_tab");
    setTab(WORKSPACE_TAB_IDS.has(last)?last:"dashboard");
  },[canUseWorkspace]);
  const notify=useCallback((msg,kind="success",sound=true)=>{
    setToast({msg,kind});
    if(sound&&soundReady.current&&soundEnabled)softNotifySound();
    setTimeout(()=>setToast(null),2400);
  },[soundEnabled]);
  const saveCloud=useCallback((nextState)=>{
    if(!session?.user||!supabaseRef.current)return;
    clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(async()=>{
      try{
        setCloudStatus("syncing");
        const {error}=await saveAppState(supabaseRef.current,session.user.id,nextState);
        setCloudStatus(error?"local":"synced");
      }catch{setCloudStatus("local");}
    },700);
  },[session]);

  const dispatch=useCallback(action=>{
    const destructive=["REMOVE_HABIT","REMOVE_TASK","REMOVE_GOAL","REMOVE_NOTE","REMOVE_STUDIO_DOC","REMOVE_CLIENT","REMOVE_CLIENT_VIDEO","REMOVE_CLIENT_INTERACTION","REMOVE_CLIENT_PROPOSAL","REMOVE_GOAL_LOG","REMOVE_SCHEDULE_BLOCK","REMOVE_FINANCE_ENTRY","REMOVE_REVIEW_DELIVERABLE"];
    if(destructive.includes(action.type)&&!action.skipConfirm&&!window.confirm("Tem certeza que quer excluir este item?")) return;
    setRaw(prev=>{
      const next=reducer(prev,action);
      const newBadges=BADGES.filter(b=>!(next.unlockedBadges||[]).includes(b.id)&&b.req(next)).map(b=>b.id);
      const final=newBadges.length?{...next,unlockedBadges:[...(next.unlockedBadges||[]),...newBadges]}:next;
      if(action.type!=="HYDRATE"){persist(final);saveCloud(final);}
      return final;
    });
    if(action.type!=="HYDRATE"&&!action.silent){
      const msg={
        ADD_TASK:"Tarefa criada",TOGGLE_TASK:"Tarefa atualizada",ADD_CLIENT:"Cliente salvo",UPDATE_CLIENT:"Cliente atualizado",
        ADD_GOAL:"Meta salva",UPDATE_GOAL:"Meta atualizada",ADD_NOTE:"Nota salva",ADD_HABIT:"Hábito salvo",
        RESTORE:"Backup importado",CLEAR_DATA:"Dados apagados",ADD_CLIENT_VIDEO:"Vídeo adicionado",ADD_CLIENT_INTERACTION:"Interação registrada",
        UPDATE_BUSINESS:"Negócio atualizado",ADD_CLIENT_PROPOSAL:"Proposta salva no CRM",UPDATE_CLIENT_PROPOSAL:"Proposta atualizada",
        ADD_FINANCE_ENTRY:"Lançamento salvo",REMOVE_FINANCE_ENTRY:"Lançamento removido",ADD_STUDIO_DOC:"Documento salvo",REMOVE_STUDIO_DOC:"Documento removido",SET_SUBSCRIPTION:"Acesso atualizado",
        ADD_REVIEW_DELIVERABLE:"Review criado",UPDATE_REVIEW_DELIVERABLE:"Review atualizado",ADD_REVIEW_COMMENT:"Comentário salvo",REMOVE_REVIEW_DELIVERABLE:"Review removido",
        UPDATE_GSD_AGENT:"GSD atualizado",ADD_GSD_CONTEXT:"Contexto guardado",REMOVE_GSD_CONTEXT:"Memória removida",CLEAR_GSD_CONTEXT:"Memória limpa"
      }[action.type]||"Atualizado";
      notify(msg,"success");
    }
  },[notify,saveCloud]);

  useEffect(()=>{const s=hydrate();if(s)dispatch({type:"HYDRATE",p:s});},[]);
  useEffect(()=>{
    const client=getSupabase();
    if(!client){setCloudStatus("local");return;}
    supabaseRef.current=client;
    client.auth.getSession().then(({data})=>setSession(data.session||null)).catch(()=>setCloudStatus("local"));
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,next)=>setSession(next));
    return()=>subscription?.unsubscribe?.();
  },[]);
  useEffect(()=>{
    if(!session?.user||!supabaseRef.current)return;
    let active=true;
    (async()=>{
      try{
        setCloudStatus("loading");
        const {state:cloudState,error}=await loadAppState(supabaseRef.current,session.user.id);
        if(!active)return;
        if(error){setCloudStatus("local");return;}
        if(cloudState){const merged={...INIT,...cloudState,business:normalizeBusiness(cloudState.business)};setRaw(merged);persist(merged);setCloudStatus("synced");}
        else {saveCloud(hydrate()||state);setCloudStatus("synced");}
      }catch{if(active)setCloudStatus("local");}
    })();
    return()=>{active=false;};
  },[session]);
  useEffect(()=>{
    if(!session?.user){setOnboardingDismissed(false);return;}
    setOnboardingDismissed(localStorage.getItem(onboardingKey(session))==="done");
  },[session]);
  useEffect(()=>{
    if(session?.user&&!business.onboarded)setBusinessOnboardingOpen(true);
  },[session?.user?.id,business.onboarded]);
  useEffect(()=>{const t=setInterval(()=>setQuoteIdx(i=>(i+1)%QUOTES.length),9000);return()=>clearInterval(t);},[]);
  useEffect(()=>{if("scrollRestoration" in history)history.scrollRestoration="manual";},[]);
  useEffect(()=>localStorage.setItem("dcc_last_tab",tab),[tab]);
  useEffect(()=>localStorage.setItem("dcc_privacy",privacyMode?"1":"0"),[privacyMode]);
  useEffect(()=>localStorage.setItem("dcc_compact",compactMode?"1":"0"),[compactMode]);
  useEffect(()=>localStorage.setItem("dnz_nav_mode",navMode),[navMode]);
  useEffect(()=>localStorage.setItem("dcc_sound",soundEnabled?"1":"0"),[soundEnabled]);
  useEffect(()=>localStorage.setItem("dcc_lock",lockEnabled?"1":"0"),[lockEnabled]);
  useEffect(()=>localStorage.setItem("dnz_sidebar_collapsed",sidebarCollapsed?"1":"0"),[sidebarCollapsed]);
  useEffect(()=>localStorage.setItem("dnz_dock_open",dockOpen?"1":"0"),[dockOpen]);
  useEffect(()=>{
    const reset=()=>{
      clearTimeout(lockTimer.current);
      if(lockEnabled&&!locked)lockTimer.current=setTimeout(()=>setLocked(true),IDLE_LOCK_MS);
    };
    const events=["pointerdown","keydown","scroll","focus"];
    events.forEach(ev=>window.addEventListener(ev,reset,{passive:true}));
    reset();
    return()=>{clearTimeout(lockTimer.current);events.forEach(ev=>window.removeEventListener(ev,reset));};
  },[lockEnabled,locked]);
  useEffect(()=>{
    const arm=()=>{soundReady.current=true;window.removeEventListener("pointerdown",arm);window.removeEventListener("keydown",arm);};
    window.addEventListener("pointerdown",arm,{once:true});window.addEventListener("keydown",arm,{once:true});
    const last=localStorage.getItem("dcc_last_exit");
    const hour=new Date().getHours();
    const greet=hour<12?"Bom dia":hour<18?"Boa tarde":"Boa noite";
    if(canUseWorkspace&&!welcomeShown.current){
      welcomeShown.current=true;
      const who=userName?`, ${userName}`:"";
      setTimeout(()=>notify(last?`${greet}${who}. Sessão restaurada com sucesso.`:`${greet}${who}. ${APP_NAME} pronto para operar.`,"info",false),650);
    }
    const onHide=()=>{
      localStorage.setItem("dcc_last_exit",new Date().toISOString());
      try{if("Notification" in window&&Notification.permission==="granted")new Notification(APP_NAME,{body:"Sessão salva. Até a próxima."});}catch{}
    };
    window.addEventListener("pagehide",onHide);
    const onVis=()=>{if(document.visibilityState==="hidden")onHide();};
    document.addEventListener("visibilitychange",onVis);
    return()=>{window.removeEventListener("pointerdown",arm);window.removeEventListener("keydown",arm);window.removeEventListener("pagehide",onHide);document.removeEventListener("visibilitychange",onVis);};
  },[notify,userName,canUseWorkspace]);

  const lv=getLevel(state.xp);
  const activeTab=TABS.find(t=>t.id===tab)||TABS[0];
  useEffect(()=>{
    const y=scrollMemory.current[tab]||0;
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"auto"}));
  },[tab]);
  const rememberScroll=()=>{scrollMemory.current[tab]=window.scrollY||document.documentElement.scrollTop||0;};
  const goTab=id=>{
    rememberScroll();
    if(!WORKSPACE_TAB_IDS.has(id)){
      setTab("dashboard");
      setNavOpen(false);
      return;
    }
    if(!canUseWorkspace&&!publicTabs.includes(id)){
      setTab("dashboard");
      setNavOpen(false);
      notify("Acesso privado. Entre com o GitHub autorizado.","info",false);
      return;
    }
    if(canUseWorkspace&&navMode==="beginner"&&!BEGINNER_TABS.includes(id)){
      setNavMode("advanced");
    }
    setTab(id);setNavOpen(false);
  };
  const signInGitHub=async()=>{
    if(!supabaseRef.current){notify("Supabase ainda não carregou. Tente de novo em alguns segundos.","warn",false);return;}
    try{
      setCloudStatus("loading");
      const {error}=await supabaseRef.current.auth.signInWithOAuth({provider:"github",options:{redirectTo:window.location.origin==="null"?window.location.href:window.location.href.split("#")[0]}});
      if(error){setCloudStatus("local");notify("Não foi possível iniciar login GitHub.","warn");}
    }catch(err){
      setCloudStatus("local");
      notify("Login GitHub indisponível agora. Tente novamente em instantes.","warn");
    }
  };
  const signOut=async()=>{
    if(!window.confirm("Sair do GitHub neste navegador? Seus dados locais podem continuar neste aparelho."))return;
    const clearLocal=window.confirm("Também ocultar e limpar os dados locais deste navegador? Use isso em computador compartilhado.");
    try{
      await supabaseRef.current?.auth.signOut();
      setSession(null);setCloudStatus("local");setLocked(false);
      if(clearLocal){localStorage.removeItem(SK);setRaw(INIT);}
      notify(clearLocal?"Sessão encerrada e dados locais limpos.":"Sessão GitHub encerrada.","info");
    }catch(err){
      notify("Não foi possível encerrar a sessão agora.","warn");
    }
  };
  const unlockApp=()=>{setLocked(false);notify("Tela desbloqueada.","info",false);};
  const lazyTabShared=useMemo(()=>({
    C,Card,Tag,Btn,SectionTitle,Inp,Txt,Modal,Bar,WeekChart,RevenueChart,
    normalizeBusiness,addDaysInput,studioDocById,docConfig,presetById,studioDocTemplates,
    presetBriefing,presetDeliverables,PRODUCTION_PIPELINE,AUDIOVISUAL_PRESETS,STUDIO_DOCUMENTS,
    getLevel,xpToNext,todayStr,inputDate,parseDateOnly,fmtMoney,fmtCurrency,
    STATUS_COLORS,VIDEO_COLORS,BADGES,MONTHS,PAG_COLORS
  }),[]);
  const Brand=()=>(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:34,height:34,borderRadius:11,background:business.logoUrl?"rgba(255,255,255,.06)":`linear-gradient(135deg,${business.primaryColor||C.orange},${C.orangeD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#111",boxShadow:`0 8px 24px ${(business.primaryColor||C.orange)}45`,overflow:"hidden"}}><LogoMark business={business} size={34} textColor={business.logoUrl?undefined:"#111"}/></div>
      <div className="brand-copy"><div style={{fontSize:14,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",lineHeight:1}}>{(business.brandName||APP_NAME).toUpperCase()}</div><div style={{fontSize:8,color:business.primaryColor||C.orange,fontWeight:800,letterSpacing:".18em"}}>{APP_SUBTITLE}</div></div>
    </div>
  );
  const NavList=()=>(
    <div className="side-nav-scroll" style={{display:"grid",gap:5,paddingRight:2,flex:1,minHeight:0,alignContent:"start"}}>
      {NAV_GROUPS.map(g=>{
        const visibleItems=g.items.filter(id=>(canUseWorkspace||publicTabs.includes(id))&&(navMode==="advanced"||BEGINNER_TABS.includes(id)));
        if(!visibleItems.length)return null;
        return (
        <div key={g.label}>
          <div className="nav-group-label">{g.label}</div>
          {visibleItems.map(id=>TABS.find(t=>t.id===id)).filter(Boolean).map(t=>(
            <button key={t.id} onMouseDown={e=>e.preventDefault()} onClick={()=>goTab(t.id)} className={`side-nav-button ${tab===t.id?"active":""}`}>
              <span className="nav-icon" style={{color:tab===t.id?C.orange:C.muted}}>{t.icon}</span>
              <span className="nav-copy">{t.label}</span>
            </button>
          ))}
        </div>
        );
      })}
    </div>
  );
  if(publicReviewToken){
    return (
      <div className="app-shell public-review-shell">
        <div style={{position:"fixed",top:-160,right:-80,width:600,height:600,background:"radial-gradient(circle,rgba(6,182,212,.05) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        <main id="main-content" className="app-content" tabIndex="-1" style={{marginLeft:0}}>
          <div className="content-inner" style={{maxWidth:1180}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:18}}>
              <Brand/>
              <Tag color="#06b6d4">Link público</Tag>
            </div>
            <React.Suspense fallback={<LazyTabFallback label="Carregando Video Review..." />}>
              <TabVideoReview state={state} dispatch={dispatch} publicToken={publicReviewToken} isPublic/>
            </React.Suspense>
          </div>
        </main>
      </div>
    );
  }
  if(route==="/"||route==="/home"){
    return <LandingPage onLogin={()=>navigateTo("/login")}/>;
  }
  if(route==="/login"){
    return <LoginPage session={session} isAdmin={isAdmin} adminEmails={[]} cloudStatus={cloudStatus} onLogin={signInGitHub} onLogout={signOut} onHome={()=>navigateTo("/")}/>;
  }
  if(route==="/app"&&!canUseWorkspace){
    return <LoginPage session={session} isAdmin={isAdmin} adminEmails={[]} cloudStatus={cloudStatus} onLogin={signInGitHub} onLogout={signOut} onHome={()=>navigateTo("/")}/>;
  }
  return (
    <div className={`app-shell ${!canUseWorkspace?"public-shell":""} ${compactMode?"compact":""} ${privacyMode?"privacy":""} ${sidebarCollapsed?"sidebar-collapsed":""}`}>
      <div style={{position:"fixed",top:-160,right:-80,width:600,height:600,background:"radial-gradient(circle,rgba(249,115,22,.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <aside className="desktop-sidebar">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:14}}>
          <Brand/>
          <button onClick={()=>setSidebarCollapsed(v=>!v)} title={sidebarCollapsed?"Expandir menu":"Recolher menu"} className="utility-btn" style={{width:34,height:34,flexShrink:0,padding:0}}>{sidebarCollapsed?"›":"‹"}</button>
        </div>
        <div className="sidebar-current">
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>Visão atual</div>
          <div style={{display:"flex",alignItems:"center",gap:8,color:"#fff",fontSize:14,fontWeight:900,fontFamily:"'Syne',sans-serif"}}><span style={{color:C.orange}}>{activeTab.icon}</span>{activeTab.label}</div>
        </div>
        <div className="sidebar-card" style={{marginBottom:8,padding:"8px 10px",borderRadius:13,background:isAdmin?"rgba(249,115,22,.08)":session?"rgba(16,185,129,.07)":"rgba(255,255,255,.03)",border:`1px solid ${isAdmin?"rgba(249,115,22,.28)":session?"rgba(16,185,129,.2)":C.border}`}}>
          <button onClick={()=>setAccountOpen(v=>!v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:"transparent",border:"none",padding:0,color:"#ddd",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            <span>
              <span style={{display:"block",fontSize:10,color:isAdmin?C.orange:session?"#10b981":C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase"}}>{isAdmin?`Admin ${APP_NAME}`:session?"GitHub conectado":"Conta"}</span>
              <span className="private-data" style={{display:"block",fontSize:11,color:"#ccc",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:165,marginTop:3}}>{session?.user?.email||"Sincronização opcional"}</span>
            </span>
            <span style={{color:C.muted,fontSize:12}}>{accountOpen?"▴":"▾"}</span>
          </button>
          {accountOpen&&<>
            <button onClick={session?signOut:signInGitHub} style={{width:"100%",height:32,borderRadius:10,border:`1px solid ${session?"rgba(16,185,129,.35)":C.border}`,background:session?"rgba(16,185,129,.12)":"rgba(255,255,255,.045)",color:session?"#10b981":"#ddd",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:900,marginTop:9}}>{session?"Sair":"Entrar com GitHub"}</button>
            <div style={{fontSize:10,color:C.muted,marginTop:7}}>Cloud: {cloudStatus==="synced"?"sincronizado":cloudStatus==="syncing"?"salvando":cloudStatus==="loading"?"carregando":"local"}</div>
          </>}
        </div>
        {canUseWorkspace&&<ModularSecurityPanel session={session} cloudStatus={cloudStatus} privacyMode={privacyMode} lockEnabled={lockEnabled} setLockEnabled={setLockEnabled} onLockNow={()=>setLocked(true)} open={securityOpen} onToggle={()=>setSecurityOpen(v=>!v)} isAdmin={isAdmin}/>}
        {canUseWorkspace&&<div className="sidebar-card" style={{marginBottom:10,padding:"8px",borderRadius:13,background:"rgba(255,255,255,.025)",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase",margin:"0 2px 7px"}}>Modo</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[["beginner","Simples"],["advanced","Completo"]].map(([id,label])=><button key={id} onClick={()=>setNavMode(id)} style={{height:30,borderRadius:10,border:`1px solid ${navMode===id?C.orange:C.border}`,background:navMode===id?"rgba(249,115,22,.14)":"rgba(255,255,255,.035)",color:navMode===id?C.orange:C.muted,fontFamily:"inherit",fontSize:10,fontWeight:900,cursor:"pointer"}}>{label}</button>)}
          </div>
        </div>}
        <NavList/>
        {canUseWorkspace&&<div style={{marginTop:"auto",paddingTop:12,display:"flex",gap:6,alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>goTab("proposta")} title="Proposta" className="utility-btn" style={{flex:1,height:34,fontSize:10,color:C.orange}}>Proposta</button>
          <button onClick={()=>setSearchOpen(true)} title="Busca" className="utility-btn" style={{width:36,height:34,padding:0}}>⌕</button>
        </div>}
      </aside>
      <div className="mobile-topbar">
        <div style={{height:56,padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <button onClick={()=>setNavOpen(true)} style={{width:38,height:38,borderRadius:11,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.055)",color:"#fff",cursor:"pointer",fontSize:18,lineHeight:1}}>☰</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:".12em"}}>{APP_NAME.toUpperCase()}</div>
            <div style={{fontSize:15,color:"#fff",fontWeight:900,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{activeTab.label}</div>
          </div>
          {canUseWorkspace&&<button onClick={()=>setSearchOpen(true)} title="Busca global" style={{width:38,height:38,borderRadius:11,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.055)",color:C.muted,cursor:"pointer",fontSize:16}}>⌕</button>}
          {canUseWorkspace&&<button onClick={()=>setCompactMode(m=>!m)} title="Modo compacto" style={{width:38,height:38,borderRadius:11,border:`1px solid ${compactMode?C.orange:C.border}`,background:compactMode?"rgba(249,115,22,.13)":"rgba(255,255,255,.055)",color:compactMode?C.orange:C.muted,cursor:"pointer",fontSize:12,fontWeight:900}}>Cx</button>}
          {canUseWorkspace&&<button onClick={()=>setPrivacyMode(m=>!m)} title={privacyMode?"Mostrar valores":"Ocultar valores"} style={{width:38,height:38,borderRadius:11,border:`1px solid ${privacyMode?C.orange:C.border}`,background:privacyMode?"rgba(249,115,22,.13)":"rgba(255,255,255,.055)",color:privacyMode?C.orange:C.muted,cursor:"pointer",fontSize:12,fontWeight:900}}>{privacyMode?"••":"R$"}</button>}
        </div>
      </div>
      {navOpen&&<div className="nav-overlay" onClick={()=>setNavOpen(false)}/>}
      <aside className={`mobile-drawer ${navOpen?"open":""}`}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:16}}>
          <Brand/>
          <button onClick={()=>setNavOpen(false)} style={{width:34,height:34,borderRadius:10,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.055)",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
        </div>
        <button onClick={session?signOut:signInGitHub} style={{width:"100%",marginBottom:12,padding:"10px 12px",borderRadius:12,border:`1px solid ${session?"rgba(16,185,129,.3)":C.border}`,background:session?"rgba(16,185,129,.1)":"rgba(255,255,255,.04)",color:session?"#10b981":"#ddd",fontFamily:"inherit",fontSize:12,fontWeight:900,cursor:"pointer",textAlign:"left"}}>
          {session?<span className="private-data">{`${isAdmin?"Admin":"GitHub"}: ${session.user.email||session.user.user_metadata?.user_name||"conectado"}`}</span>:"Entrar com GitHub"}
        </button>
        {canUseWorkspace&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {[["beginner","Simples"],["advanced","Completo"]].map(([id,label])=><button key={id} onClick={()=>setNavMode(id)} style={{height:34,borderRadius:10,border:`1px solid ${navMode===id?C.orange:C.border}`,background:navMode===id?"rgba(249,115,22,.14)":"rgba(255,255,255,.035)",color:navMode===id?C.orange:C.muted,fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer"}}>{label}</button>)}
        </div>}
        <NavList/>
      </aside>
      {canUseWorkspace&&dockOpen?(
        <div className="quick-dock" aria-label="Controles rápidos">
          <button className="dock-btn active" aria-label="Esconder controles rápidos" onClick={()=>setDockOpen(false)} title="Esconder controles">×</button>
          <button className="dock-btn" aria-label="Abrir busca global" onClick={()=>setSearchOpen(true)} title="Busca global">⌕</button>
          <button className={`dock-btn ${privacyMode?"active":""}`} aria-label={privacyMode?"Mostrar dados sensíveis":"Ocultar dados sensíveis"} onClick={()=>setPrivacyMode(m=>!m)} title={privacyMode?"Mostrar dados sensíveis":"Ocultar dados sensíveis"}>{privacyMode?"••":"R$"}</button>
          <button className="dock-btn" aria-label="Bloquear tela" onClick={()=>setLocked(true)} title="Bloquear tela">⌁</button>
        </div>
      ):canUseWorkspace?(
        <button className="dock-toggle" aria-label="Mostrar controles rápidos" onClick={()=>setDockOpen(true)} title="Mostrar controles rápidos">⌘</button>
      ):null}
      {canUseWorkspace&&(
        <div className="floating-actions" aria-label="Ações principais">
          <button className="float-action" onClick={()=>goTab("clients")}>+ Cliente</button>
          <button className="float-action secondary" onClick={()=>goTab("tasks")}>Atividade</button>
          <button className="float-action secondary" onClick={()=>goTab("studio")}>PDF</button>
        </div>
      )}
      {searchOpen&&(
        <React.Suspense fallback={null}>
          <CommandPalette open={searchOpen} onClose={()=>setSearchOpen(false)} state={state} setTab={goTab} dispatch={dispatch} shared={lazyTabShared}/>
        </React.Suspense>
      )}
      <BusinessOnboarding open={businessOnboardingOpen} business={business} dispatch={dispatch} onClose={()=>setBusinessOnboardingOpen(false)}/>
      {!onboardingDismissed&&session?.user&&<ModularOnboardingGuide session={session} state={state} setTab={goTab} onDone={()=>{localStorage.setItem(onboardingKey(session),"done");setOnboardingDismissed(true);}}/>}
      {locked&&(
        <div className="lock-screen" role="dialog" aria-modal="true" aria-label="Tela bloqueada">
          <div className="lock-card scale-in">
            <Brand/>
            <div style={{marginTop:20,fontSize:11,color:C.orange,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase"}}>Proteção ativa</div>
            <h2 style={{fontSize:24,lineHeight:1.15,color:"#fff",fontFamily:"'Syne',sans-serif",margin:"8px 0 8px"}}>Tela bloqueada</h2>
            <p style={{fontSize:13,color:"#aaa",lineHeight:1.55,marginBottom:18}}>Os dados ficam escondidos depois de alguns minutos sem uso. O login GitHub continua cuidando da identidade, e o Supabase fica responsável pela sincronização.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              <div className="security-chip"><span>Privacidade</span><span style={{color:privacyMode?C.orange:"#10b981"}}>{privacyMode?"Oculta":"Ativa"}</span></div>
              <div className="security-chip"><span>Cloud</span><span style={{color:cloudStatus==="synced"?"#10b981":C.muted}}>{cloudStatus==="synced"?"OK":"Local"}</span></div>
            </div>
            <Btn onClick={unlockApp} style={{width:"100%",justifyContent:"center",padding:"13px 16px"}}>Desbloquear sessão</Btn>
          </div>
        </div>
      )}
      {toast&&(()=>{
        const tc=toast.kind==="info"?"#3b82f6":toast.kind==="warn"?"#eab308":"#10b981";
        return <div className="toast-premium" role="status" aria-live="polite">
          <div className="toast-accent" style={{background:tc}}/>
          <div className="toast-body">
            <div className="toast-title" style={{color:tc}}>{toast.kind==="info"?"Sistema":toast.kind==="warn"?"Atenção":"Atualizado"}</div>
            <div className="toast-msg">{toast.msg}</div>
          </div>
        </div>;
      })()}
      <main id="main-content" className="app-content" tabIndex="-1">
        <div className="content-inner">
          {canUseWorkspace&&<NotificationsBanner state={state} setTab={goTab}/>}
          {canUseWorkspace&&<ContextAlert tab={tab} state={state} setTab={goTab} notify={notify}/>}
          <div className="fade" key={tab}>
          {!canUseWorkspace&&!publicTabs.includes(tab)&&<AccessWall onLogin={signInGitHub}/>}
          {(canUseWorkspace||publicTabs.includes(tab))&&<>
          {tab==="dashboard" &&<ModularTabDashboard  state={state} dispatch={dispatch} quoteIdx={quoteIdx} setTab={goTab} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} userName={userName} isAdmin={isAdmin}/>}
          {tab==="gsd"       &&<TabGSD        state={state} dispatch={dispatch} setTab={goTab}/>}
          {tab==="tasks"     &&<ModularTabTasks      state={state} dispatch={dispatch}/>}
          {tab==="agenda"    &&<ModularTabAgenda     state={state} dispatch={dispatch} setTab={goTab}/>}
          {tab==="clients"   &&<ModularTabClients    state={state} dispatch={dispatch} privacyMode={privacyMode}/>}
          {tab==="projects"  &&<ModularTabProjects   state={state} dispatch={dispatch}/>}
          {tab==="videoReview"&&(
            <React.Suspense fallback={<LazyTabFallback label="Carregando Video Review..." />}>
              <TabVideoReview state={state} dispatch={dispatch}/>
            </React.Suspense>
          )}
          {tab==="studio"    &&(
            <React.Suspense fallback={<LazyTabFallback label="Carregando Studio Docs..." />}>
              <TabStudioDocs state={state} dispatch={dispatch} shared={lazyTabShared}/>
            </React.Suspense>
          )}
          {tab==="brandbook" &&(
            <React.Suspense fallback={<LazyTabFallback label="Carregando Brand Book..." />}>
              <TabBrandBook state={state} dispatch={dispatch} shared={lazyTabShared}/>
            </React.Suspense>
          )}
          {tab==="finance"   &&(
            <React.Suspense fallback={<LazyTabFallback label="Carregando Financeiro..." />}>
              <TabFinance state={state} dispatch={dispatch} privacyMode={privacyMode} shared={lazyTabShared}/>
            </React.Suspense>
          )}
          {tab==="proposta"  &&<ModularTabProposta state={state} dispatch={dispatch}/>}
          {tab==="business"  &&<ModularTabBusinessSettings state={state} dispatch={dispatch}/>}
          {tab==="export"    &&<ModularTabExport     state={state} dispatch={dispatch}/>}
          </>}
          </div>
        </div>
      </main>
    </div>
  );
}

export { App, ErrorBoundary };
export default App;
