import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import GraphCanvas from '@/components/editor/GraphCanvas'
import Toolbar from '@/components/editor/Toolbar'
import RightPanel from '@/components/panels/RightPanel'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'

export default function App() {
  const { graph, setActiveTool, undo, redo } = useGraphStore()
  const { dark, toggleDark } = useThemeStore()

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
    <div className={`flex h-screen flex-col overflow-hidden ${dark ? 'bg-slate-900' : 'bg-white'}`}>

      {/* Header */}
      <header className="flex h-11 items-center justify-between px-4"
        style={{ background: '#1A3C6B', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: '#F59E0B' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="2" cy="7" r="2" fill="#1a1a1a"/>
              <circle cx="12" cy="3" r="2" fill="#1a1a1a"/>
              <circle cx="12" cy="11" r="2" fill="#1a1a1a"/>
              <line x1="4" y1="7" x2="10" y2="3" stroke="#1a1a1a" strokeWidth="1.5"/>
              <line x1="4" y1="7" x2="10" y2="11" stroke="#1a1a1a" strokeWidth="1.5"/>
              <line x1="10" y1="3" x2="10" y2="11" stroke="#1a1a1a" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-white">GraphLab</span>
          <span className="text-xs text-blue-300">Excellence Project</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-blue-200">
            <span>{graph.nodes.length} sommets</span>
            <span>{graph.edges.length} arêtes</span>
            <span>{graph.directed ? 'Orienté' : 'Non orienté'}</span>
            <span>{graph.weighted ? 'Pondéré' : 'Non pondéré'}</span>
          </div>
          {/* Toggle dark mode */}
          <button onClick={toggleDark}
            className="flex h-7 w-7 items-center justify-center rounded-md text-blue-200 transition-colors hover:bg-white/10"
            title={dark ? 'Mode clair' : 'Mode sombre'}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="relative flex-1"
          style={{
            background: dark ? '#0F172A' : '#F8FAFC',
            backgroundImage: dark
              ? 'radial-gradient(circle, #1E293B 1px, transparent 1px)'
              : 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}>
          <GraphCanvas />
        </main>
        <RightPanel />
      </div>

      {/* Footer */}
      <footer className={`flex h-6 items-center border-t px-3 text-xs ${
        dark ? 'border-slate-700 bg-slate-900 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
      }`}>
        <span className="mr-2 h-2 w-2 rounded-full bg-green-400" />
        S=Sélection · N=Sommet · A=Arête · D=Supprimer · Ctrl+Z=Annuler
      </footer>
    </div>
  )
}