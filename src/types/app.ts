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

export interface Project {
  id: string
  name: string
  client: string
  status: string
  deliveryDate: string
  budget: number
}

export interface StudioDoc {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Deliverable {
  id: string
  projectId: string
  name: string
  status: string
  reviewLink: string
  feedback: string
}

export interface AppState {
  tasks: Task[]
  clients: Client[]
  projects: Project[]
  studioDocs: StudioDoc[]
  reviewDeliverables: Deliverable[]
  // ... outros tipos
}
