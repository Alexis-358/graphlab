import { useEffect, useState } from 'react'
import { Moon, Sun, BookOpen } from 'lucide-react'
import GraphCanvas from '@/components/editor/GraphCanvas'
import Toolbar from '@/components/editor/Toolbar'
import RightPanel from '@/components/panels/RightPanel'
import PertView from '@/components/pert/PertView'
import ExamplesModal from '@/components/ui/ExamplesModal'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import LearnView from '@/components/learn/LearnView'

type AppView = 'editor' | 'pert' | 'learn'

export default function App() {
  const [view, setView]           = useState<AppView>('editor')
  const [showExamples, setShowExamples] = useState(false)
  const { graph, setActiveTool, undo, redo } = useGraphStore()
  const { dark, toggleDark } = useThemeStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (view !== 'editor') return
      if (e.key === 's') setActiveTool('select')
      if (e.key === 'n') setActiveTool('addNode')
      if (e.key === 'a') setActiveTool('addEdge')
      if (e.key === 'd') setActiveTool('delete')
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool, undo, redo, view])

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${dark ? 'bg-slate-900' : 'bg-white'}`}>

      {/* Header */}
      <header className="flex h-11 flex-shrink-0 items-center justify-between px-4"
        style={{ background: '#1A3C6B', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
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

          {/* Navigation */}
          <nav className="flex gap-1">
            {([['editor','Éditeur'], ['pert','PERT / MPM']] as [AppView,string][]).map(([v,label]) => (
              <button key={v} onClick={() => setView(v)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  view === v
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white',
                ].join(' ')}>
                {label}
              </button>
            ))}
            {([
              ['editor', 'Éditeur'],
              ['pert',   'PERT / MPM'],
              ['learn',  'Apprendre'],
            ] as [AppView, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  view === v ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white',
                ].join(' ')}>
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {view === 'editor' && (
            <div className="flex items-center gap-3 text-xs text-blue-200 mr-2">
              <span>{graph.nodes.length} sommets</span>
              <span>{graph.edges.length} arêtes</span>
              <span>{graph.directed ? 'Orienté' : 'Non orienté'}</span>
              <span>{graph.weighted ? 'Pondéré' : 'Non pondéré'}</span>
            </div>
          )}

          {/* Bouton Exemples */}
          <button
            onClick={() => setShowExamples(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <BookOpen size={13} />
            Exemples
          </button>

          {/* Dark mode */}
          <button onClick={toggleDark}
            className="flex h-7 w-7 items-center justify-center rounded-md text-blue-200 transition-colors hover:bg-white/10"
            title={dark ? 'Mode clair' : 'Mode sombre'}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
        </div>
      </header>

      {/* Corps */}
      {view === 'editor' ? (
        <div className="flex flex-1 overflow-hidden">
          <Toolbar />
          <main
            className="relative flex-1"
            style={{
              background: dark ? '#0F172A' : '#F8FAFC',
              backgroundImage: dark
                ? 'radial-gradient(circle, #1E293B 1px, transparent 1px)'
                : 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <GraphCanvas />
          </main>
          <RightPanel />
        </div>
      ) : view === 'pert' ? (
        <div className="flex-1 overflow-hidden">
          <PertView />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <LearnView />
        </div>
      )}

      {/* Footer */}
      {view === 'editor' && (
        <footer className={`flex h-6 flex-shrink-0 items-center border-t px-3 text-xs ${
          dark ? 'border-slate-700 bg-slate-900 text-slate-500'
               : 'border-slate-200 bg-slate-50 text-slate-400'
        }`}>
          <span className="mr-2 h-2 w-2 rounded-full bg-green-400"/>
          S=Sélection · N=Sommet · A=Arête · D=Supprimer · Ctrl+Z=Annuler
        </footer>
      )}

      {/* Modal Exemples */}
      {showExamples && <ExamplesModal onClose={() => setShowExamples(false)} />}
    </div>
  )
}