# NEXO Studio OS

Projeto migrado de um `index.html` standalone para uma base Vite + React.

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Estrutura

- `src/App.jsx`: aplicação principal preservada a partir da versão em produção.
- `src/config/`: configuração de ambiente e constantes externas.
- `src/services/`: acesso ao Supabase e persistência do estado.
- `src/hooks/`: hooks reutilizáveis.
- `src/components/`: componentes compartilhados do sistema.
- `src/main.jsx`: ponto de entrada React.
- `src/styles.css`: estilos extraídos do HTML standalone.
- `legacy/index-standalone.html`: backup funcional do HTML anterior.
- `types/database.types.ts`: tipos iniciais da tabela `app_state` no Supabase.
- `supabase/migrations/`: migrations incrementais e seguras.

## Deploy

A Vercel deve usar:

- Build command: `npm run build`
- Output directory: `dist`

## Ambiente

Configure na Vercel quando for remover os fallbacks locais:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAILS=elytraprod@gmail.com
```

## Supabase

As migrations novas são opcionais até a camada multiusuário ser ativada no frontend:

```bash
npx supabase db push
```
