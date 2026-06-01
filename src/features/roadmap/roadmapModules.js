export const ROADMAP_MODULES = [
  {
    id: 'command-palette',
    label: 'Command Palette',
    status: 'active',
    impact: 'Busca universal e comandos rápidos com carregamento sob demanda.',
    entry: 'src/components/CommandPalette.jsx'
  },
  {
    id: 'notifications',
    label: 'Notificações',
    status: 'next',
    impact: 'Central persistente com alertas de aprovação, pagamento e prazo.',
    entry: 'src/features/notifications'
  },
  {
    id: 'project-timeline',
    label: 'Timeline audiovisual',
    status: 'next',
    impact: 'Linha de produção por fase: pré, produção, pós e entrega.',
    entry: 'src/features/timeline'
  },
  {
    id: 'studio-kpis',
    label: 'KPIs da produtora',
    status: 'next',
    impact: 'Receita, conversão, atraso, ticket médio e fases de projeto.',
    entry: 'src/features/kpis'
  }
];

export const activeRoadmapModules = ROADMAP_MODULES.filter(module => module.status === 'active');
export const nextRoadmapModules = ROADMAP_MODULES.filter(module => module.status === 'next');
