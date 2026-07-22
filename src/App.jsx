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
import { BRANDING } from './config/branding';
import { INIT, reducer, DEFAULT_SUBSCRIPTION, DEFAULT_BUSINESS, normalizeBusiness } from './state/appReducer.js';
import { softNotifySound } from './utils/crypto.js';
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
const persist = (s) => { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} };
const hydrate = () => { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } };

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
const STATUS_COLORS = Object.fromEntries(CLIENT_PIPELINE.map(s=>[s.key,s.color]));
const PAG_COLORS    = { pago:"#10b981", pendente:"#eab308", atrasado:"#ef4444", parcial:"#ff2400" };
const VIDEO_COLORS  = { pendente:C.muted, gravando:"#3b82f6", editando:"#8b5cf6", "revisão":"#eab308", entregue:"#10b981" };

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
const STUDIO_DOCUMENTS = [
  {id:"briefing",label:"Briefing",color:"#3b82f6",desc:"Objetivo, público, narrativa, formato, referências e critérios de aprovação."},
  {id:"roteiro",label:"Roteiro",color:"#fb923c",desc:"Estrutura narrativa, cenas, mensagem-chave, falas, CTA e direção de ritmo."},
  {id:"callsheet",label:"Callsheet",color:"#ff2400",desc:"Ordem do dia, equipe, locação, horários, contatos, segurança e necessidades técnicas."},
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
  {key:"callsheet",label:"Callsheet",docType:"callsheet",color:"#ff2400"},
  {key:"checklist",label:"Checklist",docType:"checklist",color:"#06b6d4"},
  {key:"entrega",label:"Entrega",docType:"entrega",color:"#10b981"},
];
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

// ── UTILS ──────────────────────────────────────────────────────────────
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
  <button type="button" onClick={onClick} title={hidden?"Mostrar valores":"Ocultar valores"} aria-label={hidden?"Mostrar valores":"Ocultar valores"} style={{height:34,borderRadius:12,border:`1px solid ${hidden?C.border:C.orange}`,background:hidden?"rgba(255,255,255,.045)":"rgba(255,36,0,.14)",color:hidden?C.muted:C.orange,fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,padding:"0 11px",whiteSpace:"nowrap"}}>
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
    primary:{background:`linear-gradient(135deg,${C.orange},${C.orangeD})`,color:"#fff",boxShadow:"0 4px 16px rgba(255,36,0,.3)",border:"none"},
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
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#fff",fontFamily:"var(--font-display)"}}>{title}</h3>
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
    <div style={{width:42,height:42,borderRadius:14,margin:"0 auto 12px",display:"grid",placeItems:"center",background:"rgba(255,36,0,.12)",border:"1px solid rgba(255,36,0,.28)",color:C.orange,fontSize:18,fontWeight:900}}>{icon}</div>
    <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"var(--font-display)",marginBottom:6}}>{title}</div>
    <p style={{fontSize:13,color:C.muted,lineHeight:1.5,margin:"0 auto 14px",maxWidth:420}}>{text}</p>
    {action}
  </Card>
);
const AccessWall = ({onLogin})=>(
  <div className="access-wall">
    <div className="access-wall-card scale-in">
      <div className="elite-kicker">ACESSO PRIVADO</div>
      <h1 style={{fontSize:"clamp(30px,5vw,52px)",lineHeight:1,color:"#fff",fontFamily:"var(--font-display)",margin:"10px 0 12px"}}>Workspace interno do {APP_NAME}.</h1>
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
        <div style={{fontSize:34,fontWeight:900,color:score>=75?"#10b981":score>=50?"#eab308":"#ef4444",fontFamily:"var(--font-display)"}}>{score}%</div>
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

// ── BUSINESS ONBOARDING (modal de primeiro acesso) ─────────────────────
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

// ── MAIN APP ───────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard", label:"Hoje", icon:"⊞"},
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
  {label:"Operação",items:["dashboard","tasks","agenda","projects","studio","brandbook"]},
  {label:"Comercial",items:["clients","proposta","finance"]},
  {label:"Sistema",items:["business","export"]},
];
const BEGINNER_TABS = ["dashboard","videoReview","clients","proposta","projects","studio","brandbook","finance","tasks","business","export"];
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
    // Não redireciona para /app se for um link público de review, senão o admin
    // logado é chutado de volta pro sistema ao abrir /review/<token>.
    if(route!=="/app"&&canUseWorkspace&&!publicReviewToken)navigateTo("/app");
  },[route,canUseWorkspace,navigateTo,publicReviewToken]);
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
    const destructive=["REMOVE_TASK","REMOVE_NOTE","REMOVE_STUDIO_DOC","REMOVE_CLIENT","REMOVE_CLIENT_VIDEO","REMOVE_CLIENT_INTERACTION","REMOVE_CLIENT_PROPOSAL","REMOVE_SCHEDULE_BLOCK","REMOVE_FINANCE_ENTRY","REMOVE_REVIEW_DELIVERABLE"];
    if(destructive.includes(action.type)&&!action.skipConfirm&&!window.confirm("Tem certeza que quer excluir este item?")) return;
    setRaw(prev=>{
      const next=reducer(prev,action);
      if(action.type!=="HYDRATE"){persist(next);saveCloud(next);}
      return next;
    });
    if(action.type!=="HYDRATE"&&!action.silent){
      const msg={
        ADD_TASK:"Tarefa criada",TOGGLE_TASK:"Tarefa atualizada",ADD_CLIENT:"Cliente salvo",UPDATE_CLIENT:"Cliente atualizado",
        ADD_NOTE:"Nota salva",
        RESTORE:"Backup importado",CLEAR_DATA:"Dados apagados",ADD_CLIENT_VIDEO:"Vídeo adicionado",ADD_CLIENT_INTERACTION:"Interação registrada",
        UPDATE_BUSINESS:"Negócio atualizado",ADD_CLIENT_PROPOSAL:"Proposta salva no CRM",UPDATE_CLIENT_PROPOSAL:"Proposta atualizada",
        ADD_FINANCE_ENTRY:"Lançamento salvo",REMOVE_FINANCE_ENTRY:"Lançamento removido",ADD_STUDIO_DOC:"Documento salvo",REMOVE_STUDIO_DOC:"Documento removido",SET_SUBSCRIPTION:"Acesso atualizado",
        ADD_REVIEW_DELIVERABLE:"Review criado",UPDATE_REVIEW_DELIVERABLE:"Review atualizado",ADD_REVIEW_COMMENT:"Comentário salvo",REMOVE_REVIEW_DELIVERABLE:"Review removido"
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
    todayStr,inputDate,parseDateOnly,fmtMoney,fmtCurrency,
    STATUS_COLORS,VIDEO_COLORS,MONTHS,PAG_COLORS
  }),[]);
  const Brand=()=>(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:34,height:34,borderRadius:11,background:business.logoUrl?"rgba(255,255,255,.06)":`linear-gradient(135deg,${business.primaryColor||C.orange},${C.orangeD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#111",boxShadow:`0 8px 24px ${(business.primaryColor||C.orange)}45`,overflow:"hidden"}}><LogoMark business={business} size={34} textColor={business.logoUrl?undefined:"#111"}/></div>
      <div className="brand-copy"><div style={{fontSize:14,fontWeight:900,color:"#fff",fontFamily:"var(--font-display)",lineHeight:1}}>{(business.brandName||APP_NAME).toUpperCase()}</div><div style={{fontSize:8,color:business.primaryColor||C.orange,fontWeight:800,letterSpacing:".18em"}}>{APP_SUBTITLE}</div></div>
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
      <div className="app-shell review-public-shell">
        <div className="review-public-glow"/>
        <header className="review-public-topbar">
          <Brand/>
          <div className="review-public-badge"><span className="review-public-dot"/>Revisão de vídeo</div>
        </header>
        <main id="main-content" className="review-public-main" tabIndex="-1">
          <div className="review-public-inner">
            <React.Suspense fallback={<LazyTabFallback label="Carregando Video Review..." />}>
              <TabVideoReview state={state} dispatch={dispatch} publicToken={publicReviewToken} isPublic/>
            </React.Suspense>
          </div>
        </main>
        <footer className="review-public-foot">
          <span>{(business.brandName||APP_NAME).toUpperCase()} · aprovação de vídeo</span>
          <a href="https://dnzcentral.com.br" target="_blank" rel="noopener noreferrer">Feito pela DNZ Films</a>
        </footer>
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
      <div style={{position:"fixed",top:-160,right:-80,width:600,height:600,background:"radial-gradient(circle,rgba(255,36,0,.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <aside className="desktop-sidebar">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:14}}>
          <Brand/>
          <button onClick={()=>setSidebarCollapsed(v=>!v)} title={sidebarCollapsed?"Expandir menu":"Recolher menu"} className="utility-btn" style={{width:34,height:34,flexShrink:0,padding:0}}>{sidebarCollapsed?"›":"‹"}</button>
        </div>
        <div className="sidebar-current">
          <div style={{fontSize:10,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>Visão atual</div>
          <div style={{display:"flex",alignItems:"center",gap:8,color:"#fff",fontSize:14,fontWeight:900,fontFamily:"var(--font-display)"}}><span style={{color:C.orange}}>{activeTab.icon}</span>{activeTab.label}</div>
        </div>
        <div className="sidebar-card" style={{marginBottom:8,padding:"8px 10px",borderRadius:13,background:isAdmin?"rgba(255,36,0,.08)":session?"rgba(16,185,129,.07)":"rgba(255,255,255,.03)",border:`1px solid ${isAdmin?"rgba(255,36,0,.28)":session?"rgba(16,185,129,.2)":C.border}`}}>
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
            {[["beginner","Simples"],["advanced","Completo"]].map(([id,label])=><button key={id} onClick={()=>setNavMode(id)} style={{height:30,borderRadius:10,border:`1px solid ${navMode===id?C.orange:C.border}`,background:navMode===id?"rgba(255,36,0,.14)":"rgba(255,255,255,.035)",color:navMode===id?C.orange:C.muted,fontFamily:"inherit",fontSize:10,fontWeight:900,cursor:"pointer"}}>{label}</button>)}
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
            <div style={{fontSize:15,color:"#fff",fontWeight:900,fontFamily:"var(--font-display)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{activeTab.label}</div>
          </div>
          {canUseWorkspace&&<button onClick={()=>setSearchOpen(true)} title="Busca global" style={{width:38,height:38,borderRadius:11,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.055)",color:C.muted,cursor:"pointer",fontSize:16}}>⌕</button>}
          {canUseWorkspace&&<button onClick={()=>setCompactMode(m=>!m)} title="Modo compacto" style={{width:38,height:38,borderRadius:11,border:`1px solid ${compactMode?C.orange:C.border}`,background:compactMode?"rgba(255,36,0,.13)":"rgba(255,255,255,.055)",color:compactMode?C.orange:C.muted,cursor:"pointer",fontSize:12,fontWeight:900}}>Cx</button>}
          {canUseWorkspace&&<button onClick={()=>setPrivacyMode(m=>!m)} title={privacyMode?"Mostrar valores":"Ocultar valores"} style={{width:38,height:38,borderRadius:11,border:`1px solid ${privacyMode?C.orange:C.border}`,background:privacyMode?"rgba(255,36,0,.13)":"rgba(255,255,255,.055)",color:privacyMode?C.orange:C.muted,cursor:"pointer",fontSize:12,fontWeight:900}}>{privacyMode?"••":"R$"}</button>}
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
          {[["beginner","Simples"],["advanced","Completo"]].map(([id,label])=><button key={id} onClick={()=>setNavMode(id)} style={{height:34,borderRadius:10,border:`1px solid ${navMode===id?C.orange:C.border}`,background:navMode===id?"rgba(255,36,0,.14)":"rgba(255,255,255,.035)",color:navMode===id?C.orange:C.muted,fontFamily:"inherit",fontSize:11,fontWeight:900,cursor:"pointer"}}>{label}</button>)}
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
            <h2 style={{fontSize:24,lineHeight:1.15,color:"#fff",fontFamily:"var(--font-display)",margin:"8px 0 8px"}}>Tela bloqueada</h2>
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
          {tab==="tasks"     &&<ModularTabTasks      state={state} dispatch={dispatch}/>}
          {tab==="agenda"    &&<ModularTabAgenda     state={state} dispatch={dispatch} setTab={goTab}/>}
          {tab==="clients"   &&<ModularTabClients    state={state} dispatch={dispatch} privacyMode={privacyMode}/>}
          {tab==="projects"  &&<ModularTabProjects   state={state} dispatch={dispatch}/>}
          {tab==="videoReview"&&(
            <ErrorBoundary compact>
              <React.Suspense fallback={<LazyTabFallback label="Carregando Video Review..." />}>
                <TabVideoReview state={state} dispatch={dispatch}/>
              </React.Suspense>
            </ErrorBoundary>
          )}
          {tab==="studio"    &&(
            <ErrorBoundary compact>
              <React.Suspense fallback={<LazyTabFallback label="Carregando Studio Docs..." />}>
                <TabStudioDocs state={state} dispatch={dispatch} shared={lazyTabShared}/>
              </React.Suspense>
            </ErrorBoundary>
          )}
          {tab==="brandbook" &&(
            <ErrorBoundary compact>
              <React.Suspense fallback={<LazyTabFallback label="Carregando Brand Book..." />}>
                <TabBrandBook state={state} dispatch={dispatch} shared={lazyTabShared}/>
              </React.Suspense>
            </ErrorBoundary>
          )}
          {tab==="finance"   &&(
            <ErrorBoundary compact>
              <React.Suspense fallback={<LazyTabFallback label="Carregando Financeiro..." />}>
                <TabFinance state={state} dispatch={dispatch} privacyMode={privacyMode} shared={lazyTabShared}/>
              </React.Suspense>
            </ErrorBoundary>
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
