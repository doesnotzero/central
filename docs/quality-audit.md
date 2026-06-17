# DNZ Central - Auditoria de Qualidade

Data: 2026-06-02

## Mapeamento

| Arquivo | Função atual | Problemas encontrados | Prioridade |
|---|---|---|---|
| `src/App.jsx` | Núcleo do app, estado local, rotas internas, dashboards e várias abas | Arquivo muito grande, lógica de negócio e UI ainda misturadas, vários componentes candidatos a split | Alta |
| `src/styles.css` | Design system visual global, responsividade, glass UI | Alguns tokens/classes ainda genéricos, risco de regressão visual por CSS global | Média |
| `src/tabs/TabVideoReview.jsx` | Review público/privado com comentários por timestamp | Módulo já separado; pode evoluir para hook próprio e realtime | Alta |
| `src/tabs/TabStudioDocs.jsx` | Studio de documentos e exportação PDF via print | Formulário ainda longo; precisa usar campos inteligentes por documento | Alta |
| `src/tabs/TabFinance.jsx` | Lançamentos financeiros e previsões | Cálculos dentro do componente; pode migrar para service/hook | Média |
| `src/tabs/TabAnalytics.jsx` | Métricas operacionais | Métricas calculadas em memória; futuro pede views Supabase | Média |
| `src/components/CommandPalette.jsx` | Busca global e comandos rápidos | Já está lazy; falta navegação por teclado com setas/Enter | Média |
| `src/services/reviewService.js` | CRUD de deliverables e comentários | `select("*")` removido nesta rodada; falta padronizar retorno de erro humano | Alta |
| `src/services/appStateService.js` | Persistência do estado no Supabase | Query já usa select explícito; serviço ainda guarda estado grande em JSON | Média |
| `src/services/supabaseClient.js` | Criação do client Supabase via CDN global | Dependência de `window.supabase`; ok para app atual, mas menos robusto que SDK empacotado | Média |
| `supabase/migrations/*.sql` | Estrutura inicial de workspace e review | Migrações existem, mas ainda não foram aplicadas automaticamente por falta de autenticação Supabase CLI | Alta |

## Checklist

### TypeScript

- Parcial. Existem `types/*.ts`, mas a aplicação principal ainda é JavaScript/JSX.
- Não executei conversão global para TypeScript porque seria alto risco sem migração incremental.
- Próximo passo seguro: tipar serviços e novos componentes, depois migrar abas uma por vez.

### React

- Event listeners principais têm cleanup.
- Componentes pesados começaram a ser separados e carregados sob demanda.
- `App.jsx` ainda tem mais de 300 linhas e segue como maior risco estrutural.
- Lógica de negócio ainda existe dentro de componentes antigos.

### Supabase

- `reviewService` não usa mais `select("*")`.
- `appStateService` já seleciona campos explicitamente.
- Ainda faltam limites/paginação em futuras tabelas reais.
- RLS depende das migrations aplicadas no painel/Supabase CLI.

### Performance

- Abas pesadas já usam `React.lazy`: Video Review, Studio Docs, Financeiro, Analytics e Command Palette.
- HLS segue em chunk separado.
- Próximos candidatos: proposta/exportação PDF e gráficos futuros.

### UX e Acessibilidade

- `focus-visible` global existe.
- Ações destrutivas passam por confirmação no reducer central.
- Empty/error states base foram criados nesta rodada.
- Próximo passo: substituir botões críticos por `ActionButton` com loading/success/error real.

## Alterações Aplicadas Nesta Rodada

- Criada base de hooks reutilizáveis:
  - `useAsync`
  - `useAutoSave`
  - `useClipboard`
  - `useConfirm`
  - `useDebounce`
  - `useInfiniteList`
  - `useKeyboard`
  - `useLocalStorage`
  - `useSupabaseQuery`
  - `useToast`
- Criada base de UI:
  - `ActionButton`
  - `EmptyState`
  - `ErrorState`
  - `ChipSelector`
  - `OptionCards`
  - `TimeInput`
  - `CurrencyInput`
  - `MaskedInput`
  - `DurationPicker`
  - skeletons de dashboard, lista, projeto e documentos
- Corrigido `reviewService` para usar colunas explícitas.
- Mantidas as correções visuais do dashboard para valores que vazavam dos cards.
- Studio Docs recebeu campos mais inteligentes por tipo de documento.
- Cadastro/edição de cliente recebeu fluxo guiado com presets, tipo comercial, moedas, WhatsApp mascarado, chips de origem/ação e atalhos de data.
- Cadastro de projeto recebeu presets audiovisuais em cards, clientes recentes por chip, atalhos de prazo e seleção rápida de tipo.

## Status Do Prompt Master

### Entregue ou parcialmente entregue

- Auditoria inicial do código e registro dos principais riscos.
- Lazy loading de abas pesadas: Video Review, Studio Docs, Financeiro, Analytics e Command Palette.
- Base de hooks e componentes reutilizáveis para reduzir fricção de formulários.
- Campos inteligentes aplicados em Studio Docs, cliente e projeto.
- Review de vídeo com link público, comentários com timestamp, marcadores e status de aprovação.
- Dashboard visual mais limpo, com correções de overflow em valores.
- Exclusão de clientes e confirmações destrutivas nos fluxos principais.

### Ainda falta para cumprir a visão completa

- Aplicar migrations no Supabase e validar RLS em produção.
- Criar Notification Center persistente com Supabase Realtime.
- Evoluir Command Palette para busca real com teclado, setas, Enter e índice de clientes/projetos/documentos.
- Separar `App.jsx` em módulos menores: dashboard, clientes, projetos, propostas, rotina e configurações.
- Extrair cálculos do dashboard para `src/features/dashboard/dashboardMetrics.js`.
- Criar timeline audiovisual/Gantt por projeto com fases, dependências e atraso automático.
- Completar Video Review com hook próprio, realtime, Google Drive/OAuth e notificação ao produtor.
- Criar permissões reais por plano/role, billing e bloqueios server-side.
- Migrar incrementalmente serviços críticos para TypeScript.
- Criar exportação universal CSV/PDF além dos PDFs atuais.
- Medir Lighthouse e corrigir acessibilidade fina antes de escala comercial.

## Próxima Rodada Recomendada

1. Separar cálculos do dashboard em `src/features/dashboard/dashboardMetrics.js`.
2. Criar `src/features/notifications` com Notification Center local antes de realtime.
3. Criar `useVideoReview` para tirar lógica do player do componente.
4. Evoluir Command Palette com navegação por teclado e busca de clientes/projetos/documentos.
5. Começar split do `App.jsx` por abas ainda embutidas: Clientes, Projetos, Propostas e Dashboard.
