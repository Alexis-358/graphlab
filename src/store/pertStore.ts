import { create } from 'zustand'
import type { PertTask } from '@/types/pert'

interface PertStore {
  tasks: PertTask[]
  addTask: (task: PertTask) => void
  updateTask: (id: string, updates: Partial<PertTask>) => void
  removeTask: (id: string) => void
  clearTasks: () => void
  loadExample: () => void
}

export const usePertStore = create<PertStore>((set) => ({
  tasks: [],

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),

  updateTask: (id, updates) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),

  removeTask: (id) => set((s) => ({
    tasks: s.tasks
      .filter((t) => t.id !== id)
      .map((t) => ({
        ...t,
        predecessors: t.predecessors.filter((p) => p !== id),
      })),
  })),

  clearTasks: () => set({ tasks: [] }),

  loadExample: () => set({
    tasks: [
      { id: 't1', name: 'Analyse',       duration: 3, predecessors: []           },
      { id: 't2', name: 'Conception',    duration: 5, predecessors: ['t1']       },
      { id: 't3', name: 'Maquettes',     duration: 2, predecessors: ['t1']       },
      { id: 't4', name: 'Développement', duration: 8, predecessors: ['t2']       },
      { id: 't5', name: 'Tests',         duration: 3, predecessors: ['t4']       },
      { id: 't6', name: 'Intégration',   duration: 4, predecessors: ['t3', 't4'] },
      { id: 't7', name: 'Livraison',     duration: 1, predecessors: ['t5', 't6'] },
    ],
  }),
}))