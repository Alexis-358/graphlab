import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { CloudGraph } from '@/lib/supabase'
import type { Graph } from '@/types/graph'

interface CloudStore {
  graphs: CloudGraph[]
  saving: boolean
  loading: boolean
  fetchGraphs: () => Promise<void>
  saveGraph: (name: string, description: string, graph: Graph) => Promise<CloudGraph | null>
  updateGraph: (id: string, graph: Graph) => Promise<void>
  deleteGraph: (id: string) => Promise<void>
  togglePublic: (id: string, isPublic: boolean) => Promise<void>
  loadShared: (token: string) => Promise<CloudGraph | null>
}

export const useCloudStore = create<CloudStore>((set, get) => ({
  graphs: [],
  saving: false,
  loading: false,

  fetchGraphs: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('graphs')
      .select('*')
      .order('updated_at', { ascending: false })
    if (!error && data) set({ graphs: data as CloudGraph[] })
    set({ loading: false })
  },

  saveGraph: async (name, description, graph) => {
    set({ saving: true })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ saving: false }); return null }

    const { data, error } = await supabase
      .from('graphs')
      .insert({ name, description, data: graph, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      set((s) => ({ graphs: [data as CloudGraph, ...s.graphs] }))
      set({ saving: false })
      return data as CloudGraph
    }
    set({ saving: false })
    return null
  },

  updateGraph: async (id, graph) => {
    set({ saving: true })
    await supabase
      .from('graphs')
      .update({ data: graph, updated_at: new Date().toISOString() })
      .eq('id', id)
    set((s) => ({
      graphs: s.graphs.map((g) =>
        g.id === id ? { ...g, data: graph } : g
      ),
      saving: false,
    }))
  },

  deleteGraph: async (id) => {
    await supabase.from('graphs').delete().eq('id', id)
    set((s) => ({ graphs: s.graphs.filter((g) => g.id !== id) }))
  },

  togglePublic: async (id, isPublic) => {
    await supabase.from('graphs').update({ is_public: isPublic }).eq('id', id)
    set((s) => ({
      graphs: s.graphs.map((g) => g.id === id ? { ...g, is_public: isPublic } : g),
    }))
  },

  loadShared: async (token) => {
    const { data } = await supabase
      .from('graphs')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()
    return data as CloudGraph | null
  },
}))