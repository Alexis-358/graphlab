import { useEffect } from 'react'
import GraphCanvas from '@/components/editor/GraphCanvas'
import Toolbar from '@/components/editor/Toolbar'
import RightPanel from '@/components/panels/RightPanel'
import { useGraphStore } from '@/store/graphStore'

export default function App() {
  const { graph, setActiveTool, undo, redo } = useGraphStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 's') setActiveTool('select')
      if (e.key === 'n') setActiveTool('addNode')
      if (e.key === 'a') setActiveTool('addEdge')
      if (e.key === 'd') setActiveTool('delete')
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool, undo, redo])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header
        className="flex h-11 items-center justify-between border-b border-slate-200 px-4"
        style={{ background: '#1A3C6B' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-white">GraphLab</span>
          <span className="text-xs text-blue-300">Excellence Project</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-blue-200">
          <span>{graph.nodes.length} sommets</span>
          <span>{graph.edges.length} arêtes</span>
          <span>{graph.directed ? 'Orienté' : 'Non orienté'}</span>
          <span>{graph.weighted ? 'Pondéré' : 'Non pondéré'}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar />

        <main
          className="relative flex-1 bg-slate-50"
          style={{
            backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <GraphCanvas />
        </main>

        <RightPanel />
      </div>

      <footer className="flex h-6 items-center border-t border-slate-200 bg-slate-50 px-3 text-xs text-slate-400">
        <span className="mr-2 h-2 w-2 rounded-full bg-green-400" />
        Prêt · Clic sur le canvas pour ajouter un sommet
      </footer>
    </div>
  )
}