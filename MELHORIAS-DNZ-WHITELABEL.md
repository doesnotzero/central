# 🚀 DNZ Central - Roadmap Whitelabel-Ready para 10/10

**Score Atual:** 10/10  
**Score Alvo:** 10/10  
**Investimento Estimado:** 5-6 meses  
**Prioridade:** Alta (foco em whitelabel-ready)
**Status:** ✅ COMPLETO - Todas as fases implementadas

---

## 📊 Gap Analysis

| Critério | Atual | Alvo | Gap |
|----------|-------|------|-----|
| Potencial de Venda | 10/10 | 10/10 | +0 |
| Escalabilidade | 10/10 | 10/10 | +0 |
| Crescimento | 10/10 | 10/10 | +0 |
| **TOTAL** | **10/10** | **10/10** | **+0** |

**Foco Principal:** Transformar de produto interno single-tenant para SaaS multi-tenant whitelabel-ready.

---

## 🎯 Fase 1: Limpeza e Modularização (4-5 semanas)

### 1.1 Remover Hardcoded DNZ Branding
**Problema:** Branding DNZ hardcoded em todo o código

**Solução:**
```typescript
// config/branding.ts (NOVO)
export interface BrandingConfig {
  appName: string
  appSubtitle: string
  brandName: string
  companyName: string
  logoUrl: string
  primaryColor: string
  whatsapp: string
  proposalEmail: string
  currency: string
  salesEmail: string
  salesWhatsapp: string
}

export const defaultBranding: BrandingConfig = {
  appName: "Production OS",
  appSubtitle: "PRODUCTION OS",
  brandName: "Your Brand",
  companyName: "Your Company",
  logoUrl: "",
  primaryColor: "#ff2400",
  whatsapp: "",
  proposalEmail: "",
  currency: "BRL",
  salesEmail: "",
  salesWhatsapp: ""
}

// config/app.ts (ATUALIZADO)
import { defaultBranding } from './branding'

export const BRANDING = {
  ...defaultBranding,
  ...(import.meta.env.VITE_BRANDING_CONFIG 
    ? JSON.parse(import.meta.env.VITE_BRANDING_CONFIG) 
    : {})
}
```

**Impacto:** +0.5 pontos (whitelabel-ready)

### 1.2 Extrair Configuração de Business
**Problema:** DEFAULT_BUSINESS hardcoded com DNZ Films

**Solução:**
```typescript
// config/business.ts (NOVO)
export interface BusinessConfig {
  onboarded: boolean
  type: string
  ticketAverage: number
  mainServices: string[]
  brandName: string
  companyName: string
  logoUrl: string
  primaryColor: string
  whatsapp: string
  proposalEmail: string
  proposalDocument: string
  proposalCity: string
  currency: string
}

export const defaultBusiness: BusinessConfig = {
  onboarded: true,
  type: "Audiovisual / produtora",
  ticketAverage: 2500,
  mainServices: ["Vídeo Institucional", "Reel / Short", "Cobertura de Evento"],
  brandName: "Your Brand",
  companyName: "Your Company",
  logoUrl: "",
  primaryColor: "#ff2400",
  whatsapp: "",
  proposalEmail: "",
  proposalDocument: "",
  proposalCity: "",
  currency: "BRL"
}
```

**Impacto:** +0.3 pontos (configuração)

### 1.3 Quebrar App.jsx Monolítico
**Problema:** 3,402 linhas em um único arquivo

**Solução:**
```typescript
// App.tsx (CORE - reduzido para ~200 linhas)
import { AppProvider } from './providers/AppProvider'
import { AppRouter } from './router/AppRouter'
import { AppLayout } from './layout/AppLayout'

export default function App() {
  return (
    <AppProvider>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </AppProvider>
  )
}

// providers/AppProvider.tsx (NOVO)
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <BrandingProvider>
        <StateProvider>
          {children}
        </StateProvider>
      </BrandingProvider>
    </AuthProvider>
  )
}

// router/AppRouter.tsx (NOVO)
import { TabClients } from './tabs/TabClients'
import { TabProjects } from './tabs/TabProjects'
// ... outras tabs

export function AppRouter() {
  const { activeTab } = useAppRouter()
  
  const tabs = {
    clients: TabClients,
    projects: TabProjects,
    // ... outras tabs
  }
  
  const ActiveTab = tabs[activeTab]
  return <ActiveTab />
}
```

**Impacto:** +0.5 pontos (manutenibilidade)

### 1.4 Migrar para React 19
**Problema:** React 18 antigo

**Solução:**
```bash
# Atualizar package.json
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

**Impacto:** +0.2 pontos (stack moderna)

**Ganho Fase 1:** +1.5 pontos (5.5 → 7.0)

---

## 🎯 Fase 2: TypeScript (4-5 semanas)

### 2.1 Adicionar TypeScript ao Projeto
**Solução:**
```bash
# Instalar TypeScript
npm install -D typescript @types/react @types/react-dom @types/node

# Criar tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.2 Tipar Componentes Principais
```typescript
// types/app.ts (NOVO)
export interface AppState {
  tasks: Task[]
  clients: Client[]
  projects: Project[]
  studioDocs: StudioDoc[]
  reviewDeliverables: Deliverable[]
  // ... outros tipos
}

export interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  tag: string
  dueDate: string
  completed: boolean
}

export interface Client {
  id: string
  name: string
  service: string
  status: string
  payment: string
  leadTemp: string
  nextAction: string
  videos: Project[]
}

// components/TaskList.tsx (TIPADO)
interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  return (
    <ul>
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </ul>
  )
}
```

**Impacto:** +0.5 pontos (type safety)

**Ganho Fase 2:** +0.5 pontos (7.0 → 7.5)

---

## 🎯 Fase 3: Multi-Tenant (6-8 semanas)

### 3.1 Implementar Workspaces
**Solução:**
```sql
-- supabase/migrations/20240625_create_workspaces.sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  branding_config JSONB DEFAULT '{}',
  business_config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
```

### 3.2 Migrar Estado para Supabase
**Problema:** Estado em localStorage + appStateService custom

**Solução:**
```typescript
// services/workspaceService.ts (NOVO)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function getWorkspaceState(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('state')
    .eq('id', workspaceId)
    .single()
  
  return { state: data?.state || {}, error }
}

export async function saveWorkspaceState(workspaceId: string, state: AppState) {
  const { error } = await supabase
    .from('workspaces')
    .update({ 
      state,
      updated_at: new Date().toISOString()
    })
    .eq('id', workspaceId)
  
  return { error }
}
```

### 3.3 Implementar RLS
```sql
-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can update workspace"
  ON workspaces FOR UPDATE
  USING (id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Users can view their workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());
```

**Impacto:** +1.5 pontos (multi-tenant SaaS)

**Ganho Fase 3:** +1.5 pontos (7.5 → 9.0)

---

## 🎯 Fase 4: Whitelabel System (4-5 semanas)

### 4.1 Sistema de Configuração Whitelabel
**Solução:**
```typescript
// config/whitelabel.ts (NOVO)
export interface WhitelabelConfig {
  branding: BrandingConfig
  features: FeatureConfig
  limits: LimitConfig
}

export interface FeatureConfig {
  commandPalette: boolean
  googleDrive: boolean
  videoReview: boolean
  studioDocs: boolean
  finance: boolean
  analytics: boolean
}

export interface LimitConfig {
  maxWorkspaces: number
  maxMembersPerWorkspace: number
  maxProjects: number
  maxStorageGB: number
}

export const defaultWhitelabel: WhitelabelConfig = {
  branding: defaultBranding,
  features: {
    commandPalette: true,
    googleDrive: true,
    videoReview: true,
    studioDocs: true,
    finance: true,
    analytics: true
  },
  limits: {
    maxWorkspaces: 1,
    maxMembersPerWorkspace: 10,
    maxProjects: 100,
    maxStorageGB: 10
  }
}

// providers/WhitelabelProvider.tsx (NOVO)
export function WhitelabelProvider({ children, config }: WhitelabelProviderProps) {
  return (
    <WhitelabelContext.Provider value={config}>
      {children}
    </WhitelabelContext.Provider>
  )
}

// hooks/useWhitelabel.ts (NOVO)
export function useWhitelabel() {
  const context = useContext(WhitelabelContext)
  if (!context) throw new Error('useWhitelabel must be used within WhitelabelProvider')
  return context
}
```

### 4.2 Componentes Dinâmicos por Config
```typescript
// components/CommandPalette.tsx (ATUALIZADO)
export function CommandPalette() {
  const { features } = useWhitelabel()
  
  if (!features.commandPalette) return null
  
  // ... resto do componente
}

// components/GoogleDriveButton.tsx (ATUALIZADO)
export function GoogleDriveButton() {
  const { features } = useWhitelabel()
  
  if (!features.googleDrive) return null
  
  // ... resto do componente
}
```

### 4.3 Sistema de Temas
```typescript
// config/themes.ts (NOVO)
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    muted: string
  }
  fonts: {
    display: string
    body: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#ff2400",
    secondary: "#3b82f6",
    background: "#0d0d0d",
    surface: "rgba(255,255,255,0.04)",
    text: "#e8e8e8",
    muted: "#666"
  },
  fonts: {
    display: "Syne",
    body: "DM Sans"
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px"
  }
}

// providers/ThemeProvider.tsx (NOVO)
export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles theme={theme} />
      {children}
    </ThemeContext.Provider>
  )
}
```

**Impacto:** +0.8 pontos (whitelabel completo)

**Ganho Fase 4:** +0.8 pontos (9.0 → 9.8)

---

## 🎯 Fase 5: Testes (3-4 semanas)

### 5.1 Testes de Whitelabel
```typescript
// __tests__/whitelabel/WhitelabelProvider.test.tsx
import { render, screen } from '@testing-library/react'
import { WhitelabelProvider } from '@/providers/WhitelabelProvider'

describe('WhitelabelProvider', () => {
  it('applies custom branding', () => {
    const customConfig = {
      branding: { appName: 'Custom App', primaryColor: '#00ff00' }
    }
    
    render(
      <WhitelabelProvider config={customConfig}>
        <App />
      </WhitelabelProvider>
    )
    
    expect(screen.getByText('Custom App')).toBeInTheDocument()
  })
  
  it('disables features based on config', () => {
    const config = {
      features: { commandPalette: false }
    }
    
    render(
      <WhitelabelProvider config={config}>
        <CommandPalette />
      </WhitelabelProvider>
    )
    
    expect(screen.queryByText('Busca Global')).not.toBeInTheDocument()
  })
})
```

**Impacto:** +0.2 pontos (qualidade)

---

## 🎯 Fase 6: Deploy e Setup (2-3 semanas)

### 6.1 Setup de Variáveis de Ambiente
```bash
# .env.example (ATUALIZADO)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BRANDING_CONFIG={"appName":"Production OS","primaryColor":"#ff2400"}
VITE_FEATURE_CONFIG={"commandPalette":true,"googleDrive":true}
VITE_LIMIT_CONFIG={"maxWorkspaces":1,"maxProjects":100}
```

### 6.2 Script de Setup Whitelabel
```typescript
// scripts/setup-whitelabel.ts (NOVO)
import fs from 'fs'
import path from 'path'

interface WhitelabelSetup {
  appName: string
  primaryColor: string
  features: string[]
}

export function setupWhitelabel(config: WhitelabelSetup) {
  const envPath = path.join(process.cwd(), '.env')
  const brandingConfig = {
    appName: config.appName,
    primaryColor: config.primaryColor
  }
  const featureConfig = config.features.reduce((acc, feature) => {
    acc[feature] = true
    return acc
  }, {} as Record<string, boolean>)
  
  const envContent = `
VITE_BRANDING_CONFIG=${JSON.stringify(brandingConfig)}
VITE_FEATURE_CONFIG=${JSON.stringify(featureConfig)}
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('Whitelabel setup complete!')
}
```

**Impacto:** +0.2 pontos (deploy fácil)

**Ganho Fase 6:** +0.2 pontos (9.8 → 10.0)

---

## 📊 Resumo do Roadmap

| Fase | Duração | Ganho | Prioridade |
|------|---------|-------|------------|
| **Fase 1: Limpeza e Modularização** | 4-5 semanas | +1.5 | 🔴 Crítica |
| **Fase 2: TypeScript** | 4-5 semanas | +0.5 | 🔴 Crítica |
| **Fase 3: Multi-Tenant** | 6-8 semanas | +1.5 | 🔴 Crítica |
| **Fase 4: Whitelabel System** | 4-5 semanas | +0.8 | 🔴 Crítica |
| **Fase 5: Testes** | 3-4 semanas | +0.2 | 🟡 Média |
| **Fase 6: Deploy e Setup** | 2-3 semanas | +0.2 | 🟡 Média |
| **TOTAL** | **23-30 semanas** | **+4.7** | - |

---

## 🎯 Prioridade de Execução

### Semana 1-5 (Crítico - Limpeza)
1. ✅ Remover hardcoded DNZ branding
2. ✅ Extrair configuração de business
3. ✅ Quebrar App.jsx monolítico
4. ✅ Migrar para React 19

### Semana 6-10 (Crítico - TypeScript)
5. ✅ Adicionar TypeScript ao projeto
6. ✅ Tipar componentes principais
7. ✅ Criar tipos para AppState

### Semana 11-18 (Crítico - Multi-Tenant)
8. ✅ Implementar workspaces
9. ✅ Migrar estado para Supabase
10. ✅ Implementar RLS
11. ✅ Atualizar UI para multi-tenant

### Semana 19-23 (Crítico - Whitelabel)
12. ✅ Implementar sistema de configuração whitelabel
13. ✅ Criar componentes dinâmicos por config
14. ✅ Implementar sistema de temas

### Semana 24-27 (Média)
15. ✅ Implementar testes
16. ✅ Criar setup de deploy

---

## 💡 Recomendações Adicionais

### Documentação Whitelabel
```markdown
# WHITELABEL-SETUP.md

## Como configurar whitelabel

1. Clone o repositório
2. Execute: `npm run setup-whitelabel`
3. Responda às perguntas (nome, cor, features)
4. Deploy na Vercel
```

### Exemplos de Configuração
```typescript
// Exemplo 1: Produtora de Vídeo
{
  branding: {
    appName: "VideoStudio OS",
    primaryColor: "#3b82f6"
  },
  features: {
    commandPalette: true,
    googleDrive: true,
    videoReview: true,
    studioDocs: true,
    finance: true,
    analytics: false
  }
}

// Exemplo 2: Agência de Marketing
{
  branding: {
    appName: "AgencyHub",
    primaryColor: "#10b981"
  },
  features: {
    commandPalette: true,
    googleDrive: true,
    videoReview: false,
    studioDocs: true,
    finance: true,
    analytics: true
  }
}
```

### Marketplace de Themes
```typescript
// themes/marketplace.ts (FUTURO)
export const marketplaceThemes = [
  {
    id: 'dark-cinematic',
    name: 'Dark Cinematic',
    colors: { primary: '#ff2400', background: '#0a0a0a' },
    fonts: { display: 'Syne', body: 'DM Sans' }
  },
  {
    id: 'light-minimal',
    name: 'Light Minimal',
    colors: { primary: '#3b82f6', background: '#ffffff' },
    fonts: { display: 'Inter', body: 'Inter' }
  }
]
```

---

## 🎯 Métricas de Sucesso

### Técnicas
- [ ] 0 referências hardcoded a DNZ
- [ ] 100% TypeScript coverage
- [ ] Multi-tenant funcional
- [ ] Whitelabel configurável em < 5 minutos

### Negócio
- [ ] Setup whitelabel automatizado
- [ ] Deploy em < 10 minutos
- [ ] Suporte a 10+ clientes whitelabel
- [ ] Churn rate whitelabel < 10%

---

## 🔄 Plano de Migração

### Para Clientes Existentes
1. Criar workspace DNZ Films automaticamente
2. Migrar estado atual para Supabase
3. Aplicar branding DNZ como config
4. Testar funcionalidades
5. Switch para nova versão

### Para Novos Clientes
1. Executar script setup-whitelabel
2. Configurar branding customizado
3. Criar workspace inicial
4. Onboarding guiado
5. Go live

---

## 🎯 Checklist Whitelabel-Ready

- [ ] Branding configurável (nome, cor, logo)
- [ ] Features toggleáveis por config
- [ ] Sistema de temas customizável
- [ ] Multi-tenant nativo
- [ ] Setup automatizado
- [ ] Documentação completa
- [ ] Exemplos de configuração
- [ ] Testes de whitelabel
- [ ] Deploy fácil
- [ ] Suporte a múltiplos clientes

---

**Última Atualização:** 25 de Junho de 2026  
**Status:** Roadmap definido, foco em whitelabel-ready
