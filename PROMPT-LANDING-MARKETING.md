# Prompt: Transformar Landing Page em Marketing do Sistema

## Contexto
O arquivo `src/LandingPage.jsx` atual é uma landing page da DNZ Films (produtora audiovisual). Precisa ser transformado em uma **landing page de marketing do sistema/software** (Production OS), mantendo a estrutura visual mas mudando completamente o conteúdo.

## Objetivo
Transformar a landing page de "venda de serviços da DNZ Films" para "venda do sistema de gestão audiovisual" (whitelabel-ready), usando o `BRANDING` configurável de `src/config/branding.js`.

## Requisitos

### 1. Manter Estrutura Visual
- Manter todas as seções (hero, ticker, problem, solutions, portfolio, cases, about, packages, briefing, final, footer)
- Manter classes CSS (`dnz-*`)
- Manter layout e animações
- Manter responsividade

### 2. Substituir Conteúdo DNZ por Conteúdo do Sistema

#### Hero Section
- **Antes:** "DOES NOT ZERO - DNZ FILMS - Surf. Atletas. Marcas."
- **Depois:** Usar `BRANDING.appSubtitle` e `BRANDING.brandName`
- **Texto:** "Sistema operacional para produtoras audiovisuais. Centralize clientes, projetos, documentos, financeiro e reviews em um só lugar."

#### Ticker
- **Antes:** ["SURF", "DOES NOT ZERO", "ATLETAS", "MOTION NEVER STOPS", "SHAPERS", "DNZ FILMS", "FLORIANOPOLIS"]
- **Depois:** ["CRM", "PROJETOS", "DOCUMENTOS", "FINANCEIRO", "VIDEO REVIEW", "ANALYTICS", "COMMAND PALETTE", "WHITELABEL"]

#### Problem Section
- **Antes:** "Seu projeto merece mais" (focado em qualidade de vídeo)
- **Depois:** "Sua operação merece mais" (focado em gestão desorganizada)
- **Texto:** "Você tem múltiplos clientes, projetos em andamento, propostas espalhadas, financeiro manual. A informação está fragmentada entre planilhas, WhatsApp e e-mail. O sistema existe para resolver isso: centralize tudo em um lugar, com automação e clareza."

#### Solutions Section
- **Antes:** 01 SURF, 02 ATLETAS, 03 MARCAS
- **Depois:** 01 CRM, 02 PROJETOS, 03 DOCUMENTOS
- **Conteúdo:**
  - CRM: Gestão de clientes, pipeline de vendas, histórico de interações
  - Projetos: Fluxo completo de briefing à entrega, prazos, equipe
  - Documentos: Briefing, roteiro, callsheet, checklist com exportação PDF

#### Portfolio Section
- **Antes:** Vídeos DNZ (Black Venom, But Definitely, etc.)
- **Depois:** Screenshots do sistema (Dashboard, CRM, Video Review, Financeiro)
- **Imagens:** Usar placeholders ou screenshots do sistema real

#### Cases Section
- **Antes:** Depoimentos de clientes DNZ
- **Depois:** Depoimentos de usuários do sistema (fictícios ou reais)
- **Exemplo:** "Antes usava 3 planilhas diferentes. Agora tudo está no sistema. Economizei 10h/semana."

#### About Section
- **Antes:** "Gabriel d. Pimentel - diretor DNZ Films"
- **Depois:** "Sistema desenvolvido para produtoras que precisam organizar operação"
- **Texto:** Foco na missão do sistema: simplificar gestão audiovisual

#### Packages Section
- **Antes:** LOOP, MOTION, ZERO (pacotes de produção)
- **Depois:** STARTER, PRO, ENTERPRISE (planos do sistema SaaS)
- **Conteúdo:**
  - STARTER: Para freelancers e pequenos estúdios
  - PRO: Para produtoras em crescimento
  - ENTERPRISE: Para grandes operações multi-tenant

#### Briefing Section
- **Antes:** Formulário de briefing de projeto de vídeo
- **Depois:** Formulário de demo/contato comercial
- **Campos:** Nome, empresa, WhatsApp, tamanho da equipe, principais desafios

#### Final Section
- **Antes:** "MOTION NEVER STOPS"
- **Depois:** "ORGANIZE SUA OPERAÇÃO" ou similar
- **CTA:** "Agendar demo" ou "Começar teste grátis"

#### Footer
- **Antes:** "DNZ Films / Does Not Zero"
- **Depois:** Usar `BRANDING.brandName` e `BRANDING.appSubtitle`

### 3. Usar BRANDING Configurável
- Importar `BRANDING` de `./config/branding.js`
- Substituir todos os hardcodes de DNZ por `BRANDING.*`
- Exemplos:
  - `BRANDING.brandName` em vez de "DNZ Films"
  - `BRANDING.appSubtitle` em vez de "DOES NOT ZERO"
  - `BRANDING.whatsapp` em vez de número hardcoded
  - `BRANDING.salesEmail` em vez de email hardcoded

### 4. Manter Funcionalidades
- Login/Logout (acesso ao sistema)
- Lightbox de vídeo (pode ser mantido para demo do sistema)
- Formulário de contato (agora para demo/comercial)
- Links sociais (Instagram, WhatsApp)

### 5. Ajustar Dados
- `portfolioItems`: Mudar de vídeos para screenshots/features
- `packages`: Mudar de pacotes de produção para planos SaaS
- `leadDefaults`: Ajustar campos para formulário comercial
- `whatsappUrl`: Usar `BRANDING.whatsapp`

## Exemplo de Transformação

### Hero (Antes)
```jsx
<div className="dnz-hero-copy">
  <div className="dnz-tag">Florianopolis, BR - Does Not Zero</div>
  <h1>DOES<br />NOT<br /><em>ZERO</em></h1>
  <div className="dnz-sub">DNZ FILMS</div>
  <p><strong>Surf. Atletas. Marcas.</strong><br />Producao audiovisual...</p>
</div>
```

### Hero (Depois)
```jsx
<div className="dnz-hero-copy">
  <div className="dnz-tag">Sistema Operacional Audiovisual</div>
  <h1>{BRANDING.appSubtitle.split(' ').join('<br />')}</h1>
  <div className="dnz-sub">{BRANDING.brandName}</div>
  <p><strong>CRM. Projetos. Financeiro.</strong><br />Centralize toda sua operação em um só lugar.</p>
</div>
```

## Instruções para Execução

1. Ler o arquivo `src/LandingPage.jsx` completo
2. Identificar todas as referências hardcoded a DNZ
3. Substituir por `BRANDING.*` onde aplicável
4. Reescrever conteúdo de cada seção para focar no sistema
5. Manter estrutura visual e classes CSS
6. Testar build: `npm run build`
7. Validar visualmente no navegador

## Notas Importantes

- **Não** remover seções, apenas reescrever conteúdo
- **Não** mudar estrutura HTML/CSS
- **Manter** animações e transições
- **Usar** `BRANDING` para tudo que for configurável
- **Foco** em marketing B2B (produtoras comprando sistema)
- **Tom** profissional, focado em benefícios (economia de tempo, organização, clareza)

## Checklist de Validação

- [ ] Import de BRANDING adicionado
- [ ] Todos os hardcodes DNZ removidos
- [ ] Hero fala sobre sistema, não produtora
- [ ] Problem section foca em gestão, não qualidade de vídeo
- [ ] Solutions falam em CRM/Projetos/Documentos
- [ ] Portfolio mostra screenshots/features
- [ ] Cases mostram benefícios do sistema
- [ ] About fala em missão do sistema
- [ ] Packages são planos SaaS (STARTER/PRO/ENTERPRISE)
- [ ] Briefing é formulário comercial/demo
- [ ] Footer usa BRANDING
- [ ] Build passa sem erros
- [ ] Visual mantido consistente
