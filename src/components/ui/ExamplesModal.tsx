import { useState } from 'react'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import { GRAPH_EXAMPLES } from '@/lib/examples'

const CATEGORIES = ['Tous', 'Historique', 'Théorie', 'Algorithmes', 'Euler', 'Coloration']

interface Props {
  onClose: () => void
}

export default function ExamplesModal({ onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const { loadGraph } = useGraphStore()
  const { dark } = useThemeStore()

  const filtered = GRAPH_EXAMPLES.filter(
    (e) => activeCategory === 'Tous' || e.category === activeCategory
  )

  function handleLoad(example: typeof GRAPH_EXAMPLES[0]) {
    loadGraph(example.graph)
    onClose()
  }

  const bg      = dark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'
  const overlay = 'fixed inset-0 z-50 flex items-center justify-center p-4'
  const cardBg  = dark ? 'bg-slate-800 border-slate-700 hover:border-slate-500'
                       : 'bg-slate-50 border-slate-200 hover:border-blue-300'

  return (
    <div className={overlay} style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${bg} ${dark ? 'border-slate-700' : 'border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: dark ? '#334155' : '#E2E8F0' }}>
          <div>
            <h2 className="text-base font-semibold">Bibliothèque d'exemples</h2>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {GRAPH_EXAMPLES.length} graphes prêts à utiliser
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            ✕ Fermer
          </button>
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b"
          style={{ borderColor: dark ? '#334155' : '#F1F5F9' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : dark
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grille d'exemples */}
        <div className="grid grid-cols-2 gap-3 p-5 max-h-96 overflow-y-auto">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleLoad(ex)}
              className={`rounded-xl border p-4 text-left transition-all ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-sm font-medium ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {ex.name}
                </span>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                }`}>
                  {ex.category}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {ex.description}
              </p>
              <div className={`mt-2 flex gap-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>{ex.graph.nodes.length} sommets</span>
                <span>·</span>
                <span>{ex.graph.edges.length} arêtes</span>
                {ex.graph.weighted && <><span>·</span><span>Pondéré</span></>}
                {ex.graph.directed && <><span>·</span><span>Orienté</span></>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}