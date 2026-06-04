import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase.ts'
import { useGraphStore } from './store/graphStore.ts'
import type { Graph } from './types/graph.ts'

// Thème
const saved = localStorage.getItem('graphlab-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (saved === 'dark' || (!saved && prefersDark)) {
  document.documentElement.classList.add('dark')
}

// Charger un graphe partagé si ?share=token dans l'URL
async function loadSharedGraph() {
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('share')
  if (!token) return

  const { data } = await supabase
    .from('graphs')
    .select('*')
    .eq('share_token', token)
    .eq('is_public', true)
    .single()

  if (data?.data) {
    useGraphStore.getState().loadGraph(data.data as Graph)
    // Nettoyer l'URL
    window.history.replaceState({}, '', window.location.pathname)
  }
}

loadSharedGraph()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)