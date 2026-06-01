import { useState } from 'react'
import { useGraphStore } from '@/store/graphStore'
import { analyzeGraph } from '@/lib/algorithms/analysis'
import { dijkstra } from '@/lib/algorithms/dijkstra'
import { prim } from '@/lib/algorithms/prim'
import { kruskal } from '@/lib/algorithms/kruskal'
import { exportGraphJSON, importGraphJSON } from '@/utils/graphHelpers'

type Tab = 'props' | 'algo'

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('props')
  const [algo, setAlgo] = useState('dijkstra')
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')

  const { graph, algoResult, currentStep,
    setAlgoResult, nextStep, prevStep, loadGraph } = useGraphStore()

  const analysis = analyzeGraph(graph)
  const nodes = graph.nodes

  const eulerLabel = {
    circuit: { text: 'Circuit ✓', cls: 'bg-green-100 text-green-700' },
    path:    { text: 'Chemin ✓',  cls: 'bg-blue-100 text-blue-700' },
    none:    { text: 'Non',       cls: 'bg-red-100 text-red-600' },
  }[analysis.eulerType]

  function runAlgo() {
    if (!nodes.length) return
    const src = sourceId || nodes[0].id
    const tgt = targetId || (nodes[1]?.id ?? nodes[0].id)

    let result
    if (algo === 'dijkstra') result = dijkstra(graph, src, tgt)
    else if (algo === 'prim') result = prim(graph, src)
    else result = kruskal(graph)

    setAlgoResult(result)
  }

  const step = algoResult?.steps[currentStep]
  const totalSteps = algoResult?.steps.length ?? 0

  return (
    <aside className="flex w-64 flex-col border-l border-slate-200 bg-white text-sm">

      {/* Onglets */}
      <div className="flex border-b border-slate-200">
        {(['props', 'algo'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-xs font-medium transition-colors',
              tab === t
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}>
            {t === 'props' ? 'Propriétés' : 'Algorithmes'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ── ONGLET PROPRIÉTÉS ── */}
        {tab === 'props' && (
          <>
            <Section title="Graphe">
              <Row label="Sommets" value={analysis.nodeCount} />
              <Row label="Arêtes"  value={analysis.edgeCount} />
              <Row label="Type"    value={graph.directed ? 'Orienté' : 'Non orienté'} />
              <Row label="Pondéré" value={graph.weighted ? 'Oui' : 'Non'} />
            </Section>

            <Section title="Analyse">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Connexe</span>
                <Badge text={analysis.connected ? 'Oui' : 'Non'}
                  cls={analysis.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} />
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Eulérien</span>
                <Badge text={eulerLabel.text} cls={eulerLabel.cls} />
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Planaire</span>
                <Badge
                  text={analysis.probablyPlanar ? 'Prob. oui' : 'Non'}
                  cls={analysis.probablyPlanar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} />
              </div>
              <Row label="Σ degrés" value={`${analysis.degreeSum} = 2×${analysis.edgeCount}`} />
              <Row label="deg min"  value={analysis.minDegree} />
              <Row label="deg max"  value={analysis.maxDegree} />
            </Section>

            {nodes.length > 0 && (
              <Section title="Degrés">
                {nodes.map((n) => (
                  <Row key={n.id} label={`deg(${n.label})`}
                    value={analysis.degrees[n.id] ?? 0} />
                ))}
              </Section>
            )}

            <Section title="Fichier">
              <button onClick={() => exportGraphJSON(graph)}
                className="w-full rounded border border-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                Exporter JSON
              </button>
              <label className="mt-1 block w-full cursor-pointer rounded border border-slate-200 py-1.5 text-center text-xs text-slate-600 hover:bg-slate-50">
                Importer JSON
                <input type="file" accept=".json" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) importGraphJSON(file, loadGraph)
                  }} />
              </label>
            </Section>
          </>
        )}

        {/* ── ONGLET ALGORITHMES ── */}
        {tab === 'algo' && (
          <>
            <Section title="Choisir">
              <select value={algo} onChange={(e) => { setAlgo(e.target.value); setAlgoResult(null) }}
                className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-700">
                <optgroup label="Plus courts chemins">
                  <option value="dijkstra">Dijkstra</option>
                </optgroup>
                <optgroup label="Arbre couvrant minimal">
                  <option value="prim">Prim</option>
                  <option value="kruskal">Kruskal</option>
                </optgroup>
              </select>
            </Section>

            {(algo === 'dijkstra' || algo === 'prim') && nodes.length > 0 && (
              <Section title="Paramètres">
                <label className="text-xs text-slate-500">Source</label>
                <select value={sourceId || nodes[0].id}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-700">
                  {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                {algo === 'dijkstra' && (
                  <>
                    <label className="mt-2 block text-xs text-slate-500">Destination</label>
                    <select value={targetId || nodes[1]?.id || nodes[0].id}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </>
                )}
              </Section>
            )}

            <button onClick={runAlgo} disabled={!nodes.length}
              className="w-full rounded-lg py-2 text-xs font-medium text-white disabled:opacity-40"
              style={{ background: '#2563EB' }}>
              ▶ Exécuter
            </button>

            {algoResult && (
              <>
                <div className={[
                  'rounded-lg p-3 text-xs leading-relaxed',
                  algoResult.success
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-red-50 text-red-700',
                ].join(' ')}>
                  <p className="font-medium mb-1">{algoResult.name}</p>
                  <p>{algoResult.summary}</p>
                  {algoResult.totalCost !== undefined && (
                    <p className="mt-1 font-semibold">Coût total : {algoResult.totalCost}</p>
                  )}
                </div>

                {totalSteps > 0 && (
                  <Section title={`Étapes (${currentStep + 1} / ${totalSteps})`}>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                      {step?.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={prevStep} disabled={currentStep === 0}
                        className="flex-1 rounded border border-slate-200 py-1 text-xs disabled:opacity-30 hover:bg-slate-50">
                        ← Préc.
                      </button>
                      <button onClick={nextStep} disabled={currentStep >= totalSteps - 1}
                        className="flex-1 rounded border border-slate-200 py-1 text-xs disabled:opacity-30 hover:bg-slate-50">
                        Suiv. →
                      </button>
                    </div>
                    {/* Barre de progression */}
                    <div className="mt-2 h-1 w-full rounded-full bg-slate-200">
                      <div className="h-1 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
                    </div>
                  </Section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

// ── Composants helpers ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
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