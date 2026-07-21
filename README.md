# DNZ Central — Does Not Zero

**Sistema interno de gestão da DNZ Films.** CRM, propostas, produção audiovisual, documentos, financeiro e review de vídeo — tudo no mesmo lugar.

🌐 [dnzcentral.com.br](https://dnzcentral.com.br) · contato@dnzcentral.com.br · WhatsApp 55 48 99805-0267 · [@doesnotzero](https://instagram.com/doesnotzero)

---

## O que é o DNZ Central

O DNZ Central tem duas partes:

1. **Site público** (`/`) — a landing page da Does Not Zero / DNZ Films: portfólio, cases, pacotes (LOOP, MOTION, ZERO) e briefing de contato via WhatsApp.
2. **Workspace interno** (`/app`, acesso restrito) — o cockpit operacional da produtora:

- **CRM e pipeline** — clientes, follow-ups e status de negociação
- **Projetos audiovisuais** — fluxo de Briefing → Roteiro → Produção → Entrega
- **Propostas** — geração, histórico e acompanhamento, com exportação em PDF
- **Studio de Documentos** — briefing, roteiro, callsheet e checklist em PDF
- **Financeiro** — lançamentos, previsões e recebíveis
- **Video Review** — link público (`/review/:token`) para clientes aprovarem vídeos com comentários por timestamp
- **Relatórios** — resumo executivo da operação audiovisual, produção, comercial e Video Review
- **Brand Book** — identidade visual da DNZ Films com exportação em PDF
- **Command Palette** — busca global e atalhos rápidos

O acesso ao workspace é feito via login GitHub (Supabase Auth) e liberado apenas para os emails definidos em `VITE_ADMIN_EMAILS`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 6 |
| Estilo | CSS customizado (design system próprio, sem framework) |
| Backend/DB | Supabase (Postgres + Auth + Realtime) |
| Deploy | Vercel |
| Vídeo | Vimeo (player embed) + hls.js |
| PDF | jsPDF + html2canvas |
| Fontes | Bebas Neue, Space Mono, DM Sans, Syne (Google Fonts) |

---

## Estrutura do projeto

```
dnz-central/
├── src/
│   ├── App.jsx                  # Núcleo do workspace — estado, rotas internas, dashboard, tabs legadas
│   ├── LandingPage.jsx          # Landing pública da Does Not Zero + tela de login
│   ├── main.jsx                 # Ponto de entrada React
│   ├── styles.css               # Design system visual do workspace
│   ├── workspace.css            # Estilos adicionais do workspace interno
│   ├── theme.config.js          # Cores e constantes derivadas do BRANDING
│   ├── config/
│   │   ├── app.ts               # Supabase URL/key, admin emails
│   │   ├── branding.ts          # Identidade DNZ Films (nome, whatsapp, cores) + config de negócio
│   │   ├── business.ts          # Config de negócio padrão (duplicado de branding.ts)
│   │   ├── assets.js            # Paths dos assets públicos (/dnz-assets)
│   │   ├── themes.ts            # Tema visual (ThemeProvider)
│   │   └── whitelabel.ts        # Config de features/limites (infraestrutura whitelabel)
│   ├── providers/                # WhitelabelProvider, ThemeProvider, AppProvider, GlobalStyles
│   ├── layout/                   # AppLayout
│   ├── services/
│   │   ├── supabaseClient.js    # Inicialização do cliente Supabase
│   │   ├── appStateService.js   # Persistência do estado no Supabase
│   │   ├── reviewService.js     # CRUD de deliverables e comentários do Video Review
│   │   ├── driveService.js      # Integração Google Drive
│   │   ├── workspaceService.ts  # Operações de workspace
│   │   └── permissions.js       # Controle de sessão e admin
│   ├── tabs/                    # TabDashboard, TabClients, TabProjects, TabProposta, TabFinance,
│   │                             # TabStudioDocs, TabVideoReview, TabBrandBook, TabAgenda, TabTasks,
│   │                             # TabBusinessSettings, TabExport
│   ├── components/
│   │   ├── CommandPalette.jsx   # Busca global e comandos rápidos
│   │   ├── form-fields/         # ChipSelector, CurrencyInput, DurationPicker, MaskedInput, OptionCards, TimeInput
│   │   ├── skeletons/           # Loading states por seção
│   │   ├── system/              # ErrorBoundary
│   │   └── ui/                  # ActionButton, BrandedButton, BrandedCard, BrandedHeader, EmptyState, ErrorState
│   ├── hooks/                   # useAsync, useAutoSave, useClipboard, useConfirm, useDebounce,
│   │                             # useInfiniteList, useKeyboard, useLocalStorage, useSupabaseQuery, useToast, useWhitelabel
│   ├── state/                    # reducer.js
│   ├── constants/                # Constantes de negócio (serviços, presets)
│   ├── utils/                     # helpers.js, crypto.js
│   ├── features/roadmap/         # Módulos de roadmap
│   └── __tests__/whitelabel/     # Testes do WhitelabelProvider
├── public/dnz-assets/            # Imagens e thumbnails usados na landing e no app
├── assets/brand/                 # Logos DNZ Films em alta resolução (Brand Book)
├── supabase/migrations/          # Migrations incrementais do banco
├── types/                         # database.types.ts, review.types.ts
├── scripts/setup-whitelabel.ts  # Script de configuração inicial de branding
├── docs/                          # Auditoria técnica e histórico operacional
├── index.html                    # Entry point HTML (SEO, meta tags, boot loader)
├── vite.config.js                # Configuração Vite
├── vercel.json                   # Rewrites e headers de deploy
└── package.json
```

> Nota: `src/config/branding.ts` e `src/config/business.ts` guardam os mesmos dados em formatos parecidos por conta do refactor whitelabel — mantidos por compatibilidade, mas `branding.ts` é a fonte usada pelo app (`BRANDING` / `DEFAULT_BUSINESS_CONFIG`).

---

## Rodando localmente

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

Rotas principais em desenvolvimento:

- `/` — landing pública da Does Not Zero
- `/login` — tela de login (GitHub via Supabase)
- `/app` — workspace interno (requer sessão com email autorizado)
- `/review/:token` — link público de aprovação de vídeo

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_ADMIN_EMAILS=email@dominio.com
VITE_BRANDING_CONFIG={"appName":"DNZ Central","appSubtitle":"DOES NOT ZERO","brandName":"DNZ Films","companyName":"DNZ Films","primaryColor":"#ff2400","primaryColorDark":"#cc1d00","whatsapp":"5548998050267","salesEmail":"contato@dnzcentral.com.br","salesWhatsapp":"5548998050267","currency":"BRL"}
VITE_INSTAGRAM_URL=https://instagram.com/doesnotzero
```

> Os valores de fallback em `src/config/branding.ts` já são os dados reais da DNZ Films e servem como rede de segurança caso `VITE_BRANDING_CONFIG` não seja configurada. Em produção, configure as variáveis diretamente no painel da Vercel — nunca comite o `.env.local`.

---

## Deploy (Vercel)

O projeto já está configurado via `vercel.json`:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework:** Vite
- **Rewrites:** todas as rotas caem em `/index.html` (SPA), exceto `assets/`, `dnz-assets/`, `brand-assets/` e arquivos estáticos de SEO

Domínio de produção: `dnzcentral.com.br` (+ `www.dnzcentral.com.br`).

Para aplicar as migrations do Supabase:

```bash
npx supabase db push
```

---

## Supabase

As migrations em `supabase/migrations/` criam a estrutura base de workspace e review. O RLS (Row Level Security) depende das migrations aplicadas via CLI ou pelo painel do Supabase.

Login é feito via GitHub OAuth. O acesso ao workspace (`/app`) só é liberado para sessões cujo email conste em `VITE_ADMIN_EMAILS`.

---

## Status do projeto

- ✅ Landing page fiel à identidade Does Not Zero / DNZ Films
- ✅ Login com acesso privado (GitHub via Supabase)
- ✅ CRM com pipeline e gestão de clientes
- ✅ Projetos audiovisuais com fluxo completo
- ✅ Propostas com histórico e exportação em PDF
- ✅ Studio de documentos com exportação PDF
- ✅ Financeiro operacional
- ✅ Video Review com link público e comentários por timestamp
- ✅ Relatórios operacionais da DNZ Films
- ✅ Brand Book com exportação em PDF
- ✅ Command Palette
- ✅ Lazy loading de abas pesadas

Em desenvolvimento:

- 🔄 Notification Center com Supabase Realtime
- 🔄 Timeline Gantt por projeto
- 🔄 Separação incremental do `App.jsx` (parte das tabs já foi modularizada em `src/tabs/`)
- 🔄 Migração incremental para TypeScript
- 🔄 Command Palette com navegação por teclado e busca de clientes/projetos

---

## Licença

Proprietário — todos os direitos reservados. DNZ Films · [dnzcentral.com.br](https://dnzcentral.com.br)
