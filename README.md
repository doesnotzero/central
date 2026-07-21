# DNZ Central — Does Not Zero

**Sistema operacional para a DNZ Films.** CRM, propostas, produção audiovisual, documentos, financeiro e review de vídeo — tudo no mesmo lugar.

🌐 [dnzcentral.com.br](https://dnzcentral.com.br) · contato@dnzcentral.com.br · WhatsApp 55 48 99805-0267

---

## O que é o DNZ Central

O DNZ Central é o cockpit interno da DNZ Films (Does Not Zero), voltado para organizar toda a operação da produtora com clareza. Em vez de juntar ferramentas soltas, o DNZ centraliza:

- **CRM e pipeline** — clientes, follow-ups e status de negociação
- **Projetos audiovisuais** — fluxo de Briefing → Roteiro → Produção → Entrega
- **Propostas** — geração, histórico e acompanhamento
- **Studio de Documentos** — briefing, roteiro, callsheet e checklist em PDF
- **Financeiro** — lançamentos, previsões e recebíveis
- **Video Review** — link público para clientes aprovarem com comentários por timestamp
- **Relatórios** — resumo executivo da operação audiovisual, produção, comercial e Video Review
- **Command Palette** — busca global e atalhos rápidos

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 6 |
| Estilo | CSS customizado (design system próprio, sem framework) |
| Backend/DB | Supabase (Postgres + Auth + Realtime) |
| Deploy | Vercel |
| Vídeo | hls.js |
| Fontes | Syne + DM Sans (Google Fonts) |

---

## Estrutura do projeto

```
central/
├── src/
│   ├── App.jsx                  # Núcleo do app — estado, rotas internas, dashboard
│   ├── main.jsx                 # Ponto de entrada React
│   ├── styles.css               # Design system visual global
│   ├── config/
│   │   └── app.js               # Variáveis de ambiente e constantes
│   ├── services/
│   │   ├── supabaseClient.js    # Inicialização do cliente Supabase
│   │   ├── appStateService.js   # Persistência do estado no Supabase
│   │   ├── reviewService.js     # CRUD de deliverables e comentários
│   │   ├── driveService.js      # Integração Google Drive
│   │   └── permissions.js       # Controle de sessão e admin
│   ├── tabs/
│   │   ├── TabVideoReview.jsx   # Review público/privado com timestamp
│   │   ├── TabStudioDocs.jsx    # Studio de documentos e exportação PDF
│   │   ├── TabFinance.jsx       # Lançamentos financeiros e previsões
│   │   └── TabBrandBook.jsx     # Brand Book DNZ Films com exportação PDF
│   ├── components/
│   │   ├── CommandPalette.jsx   # Busca global e comandos rápidos
│   │   ├── form-fields/         # ChipSelector, CurrencyInput, DurationPicker, MaskedInput, OptionCards, TimeInput
│   │   ├── skeletons/           # Loading states por seção
│   │   ├── system/              # ErrorBoundary
│   │   └── ui/                  # ActionButton, EmptyState, ErrorState
│   ├── hooks/                   # useAsync, useAutoSave, useClipboard, useConfirm, useDebounce,
│   │                            # useInfiniteList, useKeyboard, useLocalStorage, useSupabaseQuery, useToast
│   ├── features/
│   │   └── roadmap/             # Módulos de roadmap
│   └── types/                   # Tipos TypeScript parciais
├── supabase/
│   └── migrations/              # Migrations incrementais do banco
├── types/
│   ├── database.types.ts        # Tipos da tabela app_state
│   └── review.types.ts          # Tipos do módulo de review
├── docs/
│   └── quality-audit.md        # Auditoria técnica e roadmap interno
├── index.html                   # Entry point HTML
├── vite.config.js               # Configuração Vite
├── vercel.json                  # Configuração de deploy
└── package.json
```

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

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_ADMIN_EMAILS=email@dominio.com
```

> Os valores de fallback em `src/config/app.js` são usados apenas em desenvolvimento local. Em produção, configure as variáveis diretamente no painel da Vercel.

---

## Deploy (Vercel)

O projeto já está configurado via `vercel.json`:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework:** Vite

Para aplicar as migrations do Supabase:

```bash
npx supabase db push
```

---

## Supabase

As migrations em `supabase/migrations/` criam a estrutura base de workspace e review. O RLS (Row Level Security) depende das migrations aplicadas via CLI ou pelo painel do Supabase.

---

## Status do projeto

O DNZ Central está em produção com as seguintes funcionalidades entregues:

- ✅ Landing page com portfolio, cases e pacotes
- ✅ Login com acesso privado
- ✅ CRM com pipeline e gestão de clientes
- ✅ Projetos audiovisuais com fluxo completo
- ✅ Propostas com histórico
- ✅ Studio de documentos com exportação PDF
- ✅ Financeiro operacional
- ✅ Video Review com link público e comentários por timestamp
- ✅ Relatórios operacionais da DNZ Films
- ✅ Command Palette
- ✅ Lazy loading de abas pesadas
- ✅ Hooks e componentes reutilizáveis

Em desenvolvimento:

- 🔄 Notification Center com Supabase Realtime
- 🔄 Timeline Gantt por projeto
- 🔄 Separação incremental do `App.jsx`
- 🔄 Migração incremental para TypeScript
- 🔄 Command Palette com navegação por teclado e busca de clientes/projetos

---

## Licença

Proprietário — todos os direitos reservados. DNZ Films · [dnzcentral.com.br](https://dnzcentral.com.br)
