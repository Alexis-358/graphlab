import { useState } from 'react'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import { analyzeGraph } from '@/lib/algorithms/analysis'
import { dijkstra } from '@/lib/algorithms/dijkstra'
import { bellmanFord } from '@/lib/algorithms/bellmanFord'
import { prim } from '@/lib/algorithms/prim'
import { kruskal } from '@/lib/algorithms/kruskal'
import { greedyColoring } from '@/lib/algorithms/coloring'
import { exportGraphJSON, importGraphJSON } from '@/utils/graphHelpers'
import { findHamiltonianCircuit, countSimplePaths } from '@/lib/algorithms/hamilton'
import { findEulerianPath } from '@/lib/algorithms/euler'

type Tab = 'props' | 'algo'

const COLOR_PALETTE = [
  '#2563EB', '#16A34A', '#DC2626', '#D97706',
  '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
]

const ALGO_DESCRIPTIONS: Record<string, string> = {
  dijkstra: 'Plus court chemin — poids positifs uniquement.',
  bellman:  'Plus court chemin — supporte les poids négatifs. Détecte les cycles négatifs.',
  prim:     'Arbre couvrant minimal — construit depuis un sommet source.',
  kruskal:  'Arbre couvrant minimal — tri des arêtes par poids croissant.',
  coloring: 'Colorie les sommets de façon optimale. Double-clic sur une arête pour modifier son poids.',
  hamilton: 'Recherche un circuit passant par chaque sommet une fois. Limité à 15 sommets (NP-complet).',
  paths:    'Compte tous les chemins simples entre deux sommets. Limité à 15 sommets.',
  euler:    'Construit le chemin/circuit eulérien via l\'algorithme de Hierholzer.',
}

export default function RightPanel() {
  const [tab, setTab]               = useState<Tab>('props')
  const [algo, setAlgo]             = useState('dijkstra')
  const [sourceId, setSourceId]     = useState('')
  const [targetId, setTargetId]     = useState('')
  const [nodeColorMap, setNodeColorMap] = useState<Record<string, number>>({})

  const {
    graph, algoResult, currentStep,
    setAlgoResult, nextStep, prevStep, loadGraph,
  } = useGraphStore()

  const { dark } = useThemeStore()

  const analysis = analyzeGraph(graph)
  const nodes    = graph.nodes

  // Labels Euler
  const eulerInfo = {
    circuit: { text: 'Circuit ✓', cls: 'bg-green-100 text-green-700' },
    path:    { text: 'Chemin ✓',  cls: 'bg-blue-100  text-blue-700'  },
    none:    { text: 'Non',       cls: 'bg-red-100   text-red-600'   },
  }[analysis.eulerType]

  // ── Exécution d'un algorithme ──────────────────────────────────────
  function runAlgo() {
    if (!nodes.length) return
    const src = sourceId || nodes[0].id
    const tgt = targetId || nodes[1]?.id || nodes[0].id
    setNodeColorMap({})

    switch (algo) {
      case 'dijkstra': {
        setAlgoResult(dijkstra(graph, src, tgt))
        break
      }
      case 'bellman': {
        setAlgoResult(bellmanFord(graph, src))
        break
      }
      case 'prim': {
        setAlgoResult(prim(graph, src))
        break
      }
      case 'kruskal': {
        setAlgoResult(kruskal(graph))
        break
      }
      case 'coloring': {
        const result = greedyColoring(graph)
        setAlgoResult(result)
        setNodeColorMap(result.nodeColors)
        window.dispatchEvent(
          new CustomEvent('graphlab:coloring', { detail: { colorMap: result.nodeColors } })
        )
        break
      }
      case 'hamilton': {
        setAlgoResult(findHamiltonianCircuit(graph))
        break
      }
      case 'paths': {
        setAlgoResult(countSimplePaths(graph, src, tgt))
        break
      }
      case 'euler': {
        setAlgoResult(findEulerianPath(graph))
        break
      }
    }
  }

  function resetAlgo() {
    setAlgoResult(null)
    setNodeColorMap({})
    window.dispatchEvent(new CustomEvent('graphlab:coloring', { detail: { colorMap: {} } }))
  }

  const step       = algoResult?.steps[currentStep]
  const totalSteps = algoResult?.steps.length ?? 0
  const showSource = ['dijkstra', 'bellman', 'prim'].includes(algo)
  const showTarget = algo === 'dijkstra'

  // ── Classes utilitaires ───────────────────────────────────────────
  const panelBg   = dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
  const tabBorder = dark ? 'border-slate-700' : 'border-slate-200'
  const inputCls  = dark
    ? 'w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500'
    : 'w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-400'
  const btnFileCls = dark
    ? 'w-full rounded border border-slate-700 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors'
    : 'w-full rounded border border-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors'

  return (
    <aside className={`flex w-64 flex-col border-l text-sm ${panelBg}`}>

      {/* ── Onglets ─────────────────────────────────────────────── */}
      <div className={`flex border-b ${tabBorder}`}>
        {(['props', 'algo'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-xs font-medium transition-colors',
              tab === t
                ? 'border-b-2 border-blue-500 text-blue-500'
                : dark
                  ? 'text-slate-500 hover:text-slate-300'
                  : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {t === 'props' ? 'Propriétés' : 'Algorithmes'}
          </button>
        ))}
      </div>

      {/* ── Corps scrollable ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* ════════════════════════════════════════
            ONGLET PROPRIÉTÉS
        ════════════════════════════════════════ */}
        {tab === 'props' && (
          <>
            {/* Graphe */}
            <Section title="Graphe" dark={dark}>
              <Row label="Sommets" value={analysis.nodeCount} dark={dark} />
              <Row label="Arêtes"  value={analysis.edgeCount} dark={dark} />
              <Row label="Type"    value={graph.directed ? 'Orienté' : 'Non orienté'} dark={dark} />
              <Row label="Pondéré" value={graph.weighted ? 'Oui' : 'Non'} dark={dark} />
            </Section>

            {/* Analyse */}
            <Section title="Analyse" dark={dark}>
              <PropRow label="Connexe" dark={dark}>
                <Badge
                  text={analysis.connected ? 'Oui' : 'Non'}
                  cls={analysis.connected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'}
                />
              </PropRow>
              <PropRow label="Eulérien" dark={dark}>
                <Badge text={eulerInfo.text} cls={eulerInfo.cls} />
              </PropRow>
              <PropRow label="Planaire" dark={dark}>
                <Badge
                  text={analysis.probablyPlanar ? 'Prob. oui' : 'Non'}
                  cls={analysis.probablyPlanar
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'}
                />
              </PropRow>
              <Row label="Σ degrés" value={`${analysis.degreeSum} = 2×${analysis.edgeCount}`} dark={dark} />
              <Row label="deg min"  value={analysis.minDegree} dark={dark} />
              <Row label="deg max"  value={analysis.maxDegree} dark={dark} />
            </Section>

            {/* Degrés par sommet */}
            {nodes.length > 0 && (
              <Section title="Degrés" dark={dark}>
                {nodes.map((n) => (
                  <div key={n.id} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1.5">
                      {nodeColorMap[n.id] !== undefined && (
                        <span
                          className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ background: COLOR_PALETTE[nodeColorMap[n.id] % COLOR_PALETTE.length] }}
                        />
                      )}
                      <span className={dark ? 'text-slate-400' : 'text-slate-500'}>
                        deg({n.label})
                      </span>
                    </div>
                    <span className={`font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {analysis.degrees[n.id] ?? 0}
                    </span>
                  </div>
                ))}
              </Section>
            )}

            {/* Fichier */}
            <Section title="Fichier" dark={dark}>
              <button onClick={() => exportGraphJSON(graph)} className={btnFileCls}>
                ↓ Exporter JSON
              </button>
              <label className={`mt-1 block cursor-pointer text-center ${btnFileCls}`}>
                ↑ Importer JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) importGraphJSON(file, loadGraph)
                    e.target.value = ''
                  }}
                />
              </label>
            </Section>
          </>
        )}

        {/* ════════════════════════════════════════
            ONGLET ALGORITHMES
        ════════════════════════════════════════ */}
        {tab === 'algo' && (
          <>
            {/* Sélecteur d'algorithme */}
            <Section title="Algorithme" dark={dark}>
              <select
                value={algo}
                onChange={(e) => { setAlgo(e.target.value); resetAlgo() }}
                className={inputCls}
              >
                <optgroup label="Plus courts chemins">
                  <option value="dijkstra">Dijkstra</option>
                  <option value="bellman">Bellman-Ford</option>
                </optgroup>
                <optgroup label="Arbre couvrant minimal">
                  <option value="prim">Prim</option>
                  <option value="kruskal">Kruskal</option>
                </optgroup>
                <optgroup label="Propriétés">
                  <option value="coloring">Coloration gloutonne</option>
                </optgroup>
                <optgroup label="Chemins">
                <option value="hamilton">Circuit Hamiltonien</option>
                <option value="paths">Chemins simples</option>
                <option value="euler">Chemin / Circuit Eulérien</option>
                </optgroup>
              </select>

              {/* Description */}
              <p className={`mt-2 text-xs leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {ALGO_DESCRIPTIONS[algo]}
              </p>
            </Section>

            {/* Paramètres source / destination */}
            {showSource && nodes.length > 0 && (
              <Section title="Paramètres" dark={dark}>
                <label className={`block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sommet source
                </label>
                <select
                  value={sourceId || nodes[0].id}
                  onChange={(e) => setSourceId(e.target.value)}
                  className={inputCls}
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>

                {showTarget && (
                  <>
                    <label className={`mt-2 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Sommet destination
                    </label>
                    <select
                      value={targetId || nodes[1]?.id || nodes[0].id}
                      onChange={(e) => setTargetId(e.target.value)}
                      className={inputCls}
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </Section>
            )}

            {/* Bouton Exécuter */}
            <button
              onClick={runAlgo}
              disabled={!nodes.length}
              className="w-full rounded-lg py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90 active:opacity-75"
              style={{ background: '#2563EB' }}
            >
              ▶ Exécuter
            </button>

            {/* ── Résultat ── */}
            {algoResult && (
              <>
                {/* Boîte résumé */}
                <div className={[
                  'rounded-lg p-3 text-xs leading-relaxed',
                  algoResult.success
                    ? dark ? 'bg-blue-950 text-blue-300 border border-blue-800'
                           : 'bg-blue-50  text-blue-800'
                    : dark ? 'bg-red-950  text-red-300  border border-red-800'
                           : 'bg-red-50   text-red-700',
                ].join(' ')}>
                  <p className="font-semibold mb-1">{algoResult.name}</p>
                  <p>{algoResult.summary}</p>
                  {algoResult.totalCost !== undefined && (
                    <p className="mt-1 font-bold">Coût total : {algoResult.totalCost}</p>
                  )}
                </div>

                {/* Palette coloration */}
                {algo === 'coloring' && Object.keys(nodeColorMap).length > 0 && (
                  <Section title="Couleurs" dark={dark}>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(Object.values(nodeColorMap))].sort().map((c) => (
                        <div key={c} className="flex items-center gap-1 text-xs"
                          style={{ color: dark ? '#94A3B8' : '#64748B' }}>
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ background: COLOR_PALETTE[c % COLOR_PALETTE.length] }}
                          />
                          Couleur {c + 1}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Navigation étapes */}
                {totalSteps > 0 && (
                  <Section title={`Étapes — ${currentStep + 1} / ${totalSteps}`} dark={dark}>
                    {/* Description de l'étape */}
                    <p className={`min-h-[48px] text-xs leading-relaxed ${
                      dark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {step?.description ?? '—'}
                    </p>

                    {/* Boutons Préc / Suiv */}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex-1 rounded border py-1 text-xs transition-colors disabled:opacity-30 ${
                          dark
                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ← Préc.
                      </button>
                      <button
                        onClick={nextStep}
                        disabled={currentStep >= totalSteps - 1}
                        className={`flex-1 rounded border py-1 text-xs transition-colors disabled:opacity-30 ${
                          dark
                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Suiv. →
                      </button>
                    </div>

                    {/* Barre de progression */}
                    <div className={`mt-2 h-1 w-full rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div
                        className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                      />
                    </div>
                  </Section>
                )}

                {/* Bouton Réinitialiser résultat */}
                <button
                  onClick={resetAlgo}
                  className={`w-full rounded border py-1.5 text-xs transition-colors ${
                    dark
                      ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  ✕ Effacer le résultat
                </button>
              </>
            )}

            {/* Message si graphe vide */}
            {!nodes.length && (
              <p className={`text-center text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                Ajoutez des sommets sur le canvas pour utiliser les algorithmes.
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

// ── Composants internes ───────────────────────────────────────────────

function Section({
  title, children, dark,
}: {
  title: string; children: React.ReactNode; dark: boolean
}) {
  return (
    <div>
      <p className={`mb-1.5 text-xs font-medium uppercase tracking-wide ${
        dark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({
  label, value, dark,
}: {
  label: string; value: string | number; dark: boolean
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className={dark ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
      <span className={`font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

function PropRow({
  label, children, dark,
}: {
  label: string; children: React.ReactNode; dark: boolean
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={dark ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
      {children}
    </div>
  )
}

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {text}
    </span>
  )
}