# DNZ Central — Inventário de Implementação e Limpeza

Data: 2026-06-18

## Objetivo

Registrar o que foi transformado no antigo fluxo do sistema anterior, o que já funciona como DNZ Central e o que ainda precisa ser limpo antes de considerar o GitHub como fonte confiável.

Este documento é a referência para não misturar novamente código antigo com a operação da Does Not Zero.

## Repositório correto

- Local: `/Users/danteelytra/CURSO - FRAME /repos/central`
- GitHub: `https://github.com/elytraprod-hue/central.git`
- Branch atual: `main`
- Produção: `dnzcentral.com.br` e `www.dnzcentral.com.br`

Observação: existem outros repositórios locais relacionados. Eles não devem receber mudanças do DNZ Central sem decisão explícita.

## O que foi modificado e deve permanecer

### Landing / entrada pública

- HTML base e metadados foram renomeados para DNZ Central / Does Not Zero.
- O app abre com DNZ Central e descrição voltada para produtora audiovisual.
- A frente pública deve continuar servindo como entrada para a marca e login privado.

### Autenticação

- Login GitHub via Supabase Auth.
- Admin allowlist via `VITE_ADMIN_EMAILS`.
- Permissões em `src/services/permissions.js`.
- Importante: manter redirect baseado no host atual (`window.location`) para evitar quebra entre domínio customizado e URL Vercel.

### CRM / Clientes

Funciona hoje:

- Cadastro e edição de cliente em modal.
- Campos de WhatsApp, email, serviço, valor, origem, próxima ação, follow-up, status, pagamento e temperatura.
- Relações comerciais: cliente, mensalista, permuta/parceria, freelancer.
- Histórico do cliente: interações, propostas, vídeos/projetos e lançamentos financeiros.
- Excluir cliente com confirmação.
- Visual de pipeline e lista.

Precisa limpar/evoluir:

- Pipeline ainda usa status antigo em partes do código: `prospecto`, `ativo`, `pausado`, `concluido`.
- Pipeline desejado: `Lead`, `Briefing`, `Proposta enviada`, `Em produção`, `Entregue`, `Pago`.
- Melhorar ícones funcionais de editar/excluir na lista e nos cards.

### Propostas Comerciais

Funciona hoje:

- Tela de proposta comercial.
- Dados do cliente, escopo, serviços, condições comerciais, total e PDF.
- Proposta salva no histórico do cliente.
- Visual do PDF segue linguagem escura/vermelha DNZ na tela.

Precisa limpar/evoluir:

- Confirmar que o PDF impresso preserva o fundo escuro com opção de gráficos de fundo.
- Pacotes LOOP/MOTION/ZERO precisam preencher texto, entregáveis, cronograma e valor de forma real.
- Ao aprovar proposta, criar projeto automaticamente no cliente.
- Futuro: IA para gerar proposta DNZ com base no briefing e valores.

### Projetos / Produção

Funciona hoje:

- Projetos vinculados ao cliente.
- Presets audiovisuais.
- Pipeline de produção com briefing, roteiro, decupagem, callsheet, checklist e entrega.
- Links de briefing, drive, referência, review e entrega.

Precisa limpar/evoluir:

- Melhorar hierarquia visual.
- Integrar projeto automaticamente com proposta aprovada.
- Destacar Video Review como etapa central da entrega.

### Documentos

Funciona hoje:

- Aba separada em `src/tabs/TabStudioDocs.jsx`.
- Formulários de briefing, roteiro, callsheet, orçamento, cronograma, checklist e relatório.
- Formulário principal já abre em modal sobreposto.
- Preview PDF visível na página.
- Histórico de documentos salvos.

Precisa limpar/evoluir:

- Reduzir blocos grandes e deixar seleção mais em lista/modal.
- Ajustar melhor uso de espaço em telas menores.
- Padronizar ícones e cor por tipo de documento.

### Financeiro

Funciona hoje:

- Aba separada em `src/tabs/TabFinance.jsx`.
- Linguagem atual: Caixa da produtora.
- Cards de ação: cobrar atrasados, receber pendentes, registrar movimento.
- Métricas: recebido, a receber, despesas, lucro.
- Lançamentos manuais e contratos vindos do CRM.

Precisa limpar/evoluir:

- Menu renomeado de `Dinheiro` para `Caixa`.
- Melhorar hierarquia e direção do usuário.
- Separar cobrança, recebidos e despesas com cores consistentes.

### Video Review

Funciona hoje:

- Aba separada em `src/tabs/TabVideoReview.jsx`.
- Produto principal no menu.
- Criação de review com link direto/HLS ou Google Drive.
- Link público via token.
- Player, comentários por timecode e status: aguardando, ajustes, aprovado.
- Integração com Supabase quando migration existe.

Precisa limpar/evoluir:

- Resolver comentários individualmente.
- Versionamento mais claro de V1/V2/V3.
- Melhorar página pública para parecer mais Frame.io.
- Ligar automaticamente com cliente/proposta/projeto.

### Relatórios / Backup

Funciona hoje:

- Geração de relatório/backup.
- Exportação de dados.

Precisa limpar/evoluir:

- Relatório deve ser voltado para empresa, não rotina pessoal.
- Remover métricas antigas de produtividade pessoal que não servem à DNZ.
- Manter backup JSON como ferramenta administrativa, com aviso claro.

## Limpeza aplicada em 2026-06-18

Itens removidos ou neutralizados sem trocar a interface visual atual:

- Subtitulo principal do app agora é `DOES NOT ZERO`.
- Navegação não mostra mais aba comercial de planos.
- Busca global não oferece mais comando de planos.
- Aviso flutuante de teste/compra foi removido.
- Templates/playbooks ficaram liberados para operação interna.
- Sidebar e dock gravam somente chaves `dnz_*`.
- Backup novo sai como `dnz-backup-criptografado`.
- `package-lock.json` usa `dnz-central`.
- Tipos de workspace usam acesso admin em vez de camadas comerciais.
- Migration inicial cria `access default 'admin'`.

Observação: termos como "plano de voo", "lista de planos" e "plano técnico" continuam corretos, porque pertencem à linguagem de produção audiovisual.

## Divergência de deploy/domínio

Verificação em 2026-06-18:

- `https://dnzcentral.com.br` respondeu com DNZ Central.
- `https://www.dnzcentral.com.br` ainda mostrou a versão visual antiga.

Isso precisa ser corrigido no próximo deploy/domínio, porque o usuário pode cair em versões diferentes dependendo do host.

## Plano de limpeza seguro

### Fase 1 — Congelar a verdade

- Manter este inventário.
- README atualizado para DNZ Central.
- Confirmar repo correto antes de qualquer commit.
- Conferir `git status` antes de editar.

### Fase 2 — Base limpa sem quebrar app

- Manter a interface visual atual.
- Não restaurar tela comercial de planos.
- Não restaurar aviso de teste ou bloqueio por pacote.
- Evitar upload manual de arquivos antigos.
- Validar build antes de qualquer deploy.

### Fase 3 — Operação DNZ

- Pipeline CRM de 6 etapas.
- Proposta aprovada cria projeto.
- Financeiro vira `Caixa` ou `Financeiro`.
- Relatórios focados em empresa.
- Dashboard sem score sem função clara.

### Fase 4 — Video Review como produto principal

- Link público premium.
- Comentários resolvidos.
- Versionamento.
- Relação com cliente/projeto/proposta.

### Fase 5 — Deploy e GitHub

- `npm run build`.
- Deploy Vercel em produção.
- Validar `dnzcentral.com.br` e `www.dnzcentral.com.br`.
- Commit com mensagem clara.
- Renomear repositório apenas no GitHub se for decisão final. Nome sugerido: `dnz-central`.

## Decisão recomendada sobre o repositório

Repositório atual: `central`.

Opções:

1. Manter `central` e limpar tudo por dentro.
2. Renomear GitHub para `dnz-central`, mantendo histórico.
3. Criar novo repo limpo `dnz-central` e migrar apenas arquivos funcionais.

Recomendação: renomear `central` para `dnz-central` depois da limpeza e do build passar. Criar repo novo só se a mistura com arquivos antigos continuar voltando por upload manual.
