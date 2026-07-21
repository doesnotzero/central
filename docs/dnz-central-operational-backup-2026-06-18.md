# Backup operacional — DNZ Central / Does Not Zero

Data: 2026-06-18

Este documento registra o estado seguro do sistema DNZ Central para evitar perda das mudanças feitas na identidade Does Not Zero e impedir que telas antigas do NEXO/Studio OS voltem por engano.

## Produção segura na Vercel

Deploy confirmado como último deploy correto informado pelo Gabriel:

- URL do deploy: https://central-1nrhusuyz-elytraprod-hues-projects.vercel.app
- Vercel deployment id: dpl_4VxX4tQHkbqEXSDHzM9ydxUjmpBM
- Commit de origem: 4cdbeb4 — Add smart onboarding forms
- Criado em: 13/06/2026 15:16 BRT
- Status: Ready
- Aliases confirmados pela Vercel em 18/06/2026:
  - https://dnzcentral.com.br
  - https://www.dnzcentral.com.br
  - https://central-elytraprod-hues-projects.vercel.app
  - https://central-elytraprod-hue-elytraprod-hues-projects.vercel.app

A produção foi promovida novamente para esse deploy em 18/06/2026, usando `npx vercel promote central-1nrhusuyz-elytraprod-hues-projects.vercel.app --yes`.

## Estado atual do código local

Repositório local correto:

- `/Users/danteelytra/CURSO - FRAME /repos/central`

O código local está mais avançado que o deploy de 13/06. Ele contém mudanças novas que devem ser preservadas, incluindo:

- Landing pública DNZ/Does Not Zero separada em `src/LandingPage.jsx`.
- Login privado com tela DNZ e rota `/login`.
- Rewrites no `vercel.json` para `/login`, `/app` e `/review/:path*`, evitando 404 em rotas diretas.
- Brand Book interno em `src/tabs/TabBrandBook.jsx`.
- Assets DNZ em `public/dnz-assets/`.
- App interno focado em DNZ Films / Does Not Zero.
- Remoção parcial de planos comerciais, trial e linguagem antiga de SaaS.

Correção aplicada em 18/06/2026:

- O crash de `/app` vinha de `dnzLandingLogo is not defined` em `src/App.jsx`.
- A referência foi trocada para `/dnz-assets/dnz-logo-nav.webp`.
- `npm run build` passou após a correção.

## O que precisa permanecer obrigatoriamente

### Marca e landing

- Identidade Does Not Zero / DNZ Films.
- Paleta preta, branca e vermelho/laranja DNZ.
- Landing baseada no HTML original do site DNZ, não na tela antiga do sistema.
- SEO como produtora audiovisual, não como “control center” genérico.
- Botões e seções com linguagem de produtora audiovisual.

### Login e acesso

- Login privado via Supabase/GitHub.
- Acesso permitido somente por email admin em `VITE_ADMIN_EMAILS`.
- Rotas internas protegidas.
- `/login` não pode voltar a dar 404 em callback OAuth.

### Sistema interno

- CRM de clientes.
- Propostas comerciais DNZ com PDF.
- Produção/projetos audiovisuais.
- Financeiro/Caixa operacional.
- Documentos de produção.
- Video Review como produto principal.
- Relatórios e backup administrativo.
- Brand Book interno com exportação/edição.

### Video Review

- Deve continuar destacado no menu.
- Link público `/review/:token` deve abrir a tela de revisão, não a landing.
- Status: aguardando, ajustes, aprovado.
- Comentários por timecode.
- Integração futura com cliente/proposta/projeto.

## O que não pode voltar

- Nome NEXO como marca principal.
- Studio OS como subtítulo principal.
- Planos comerciais/trial/billing dentro do app.
- Chaves antigas `centralis_*` para novos dados.
- Tela de venda de assinatura.
- Score sem função clara na visão principal.
- Dashboard pessoal de rotina que não serve à produtora.
- Landing antiga “DNZ Central Operação Criativa” como página principal pública.

Observação: algumas palavras como “plano de filmagem” ou “plano de voo” podem continuar porque fazem parte da produção audiovisual.

## GitHub e documentação

Documentos que devem ser mantidos no GitHub:

- `README.md` — visão curta do projeto, stack, rotas e regras de manutenção.
- `docs/dnz-central-inventory.md` — inventário técnico e plano de limpeza.
- `docs/dnz-central-operational-backup-2026-06-18.md` — este backup operacional.
- `docs/quality-audit.md` — auditoria técnica e pendências.

Importante: este documento só estará no GitHub depois de commit e push. Até lá, ele existe localmente no repo e na pasta Documentos.

## Backup fora do repo

Cópia local recomendada:

- `/Users/danteelytra/Documents/DNZ Central Backups/dnz-central-operational-backup-2026-06-18.md`

## Próximas melhorias sem quebrar o que funciona

1. Validar visualmente o código atual com Brand Book antes de novo deploy.
2. Fazer commit de segurança com README, inventário e backup.
3. Publicar novo deploy somente depois de testar `/`, `/login`, `/app` e `/review/:token`.
4. Renomear repo para `dnz-central` apenas depois de confirmar build e produção estável.
5. Limpar telas antigas por partes, nunca com upload manual de arquivos antigos.
6. Reorganizar CRM para pipeline real: Lead → Briefing → Proposta enviada → Em produção → Entregue → Pago.
7. Transformar Video Review no fluxo principal estilo Frame.io.
8. Melhorar Brand Book com edição, exportação e área única de logos.

## Comandos de verificação recomendados

```bash
npm run build
npx vercel inspect dnzcentral.com.br
curl -I -L https://dnzcentral.com.br
curl -I -L https://dnzcentral.com.br/login
```

## Regra de ouro

Se uma mudança fizer a identidade Does Not Zero sumir, trouxer NEXO/Studio OS de volta, quebrar login, ou fizer `/review/:token` cair na landing, ela deve ser revertida ou corrigida antes de qualquer deploy de produção.
