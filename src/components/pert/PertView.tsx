import { useState, useMemo } from 'react'
import { usePertStore } from '@/store/pertStore'
import { useThemeStore } from '@/store/themeStore'
import { computePert } from '@/lib/algorithms/pert'
import type { PertTask } from '@/types/pert'

function uid() { return 't' + Math.random().toString(36).slice(2, 7) }

export default function PertView() {
  const { tasks, addTask, updateTask, removeTask, clearTasks, loadExample } = usePertStore()
  const { dark } = useThemeStore()

  const [newName, setNewName]     = useState('')
  const [newDur, setNewDur]       = useState('')
  const [newPreds, setNewPreds]   = useState('')
  const [error, setError]         = useState('')

  const result = useMemo(() => computePert(tasks), [tasks])

  // ── Ajouter une tâche ──────────────────────────────────────────
  function handleAdd() {
    const name = newName.trim()
    const duration = parseFloat(newDur)
    if (!name) { setError('Le nom est requis.'); return }
    if (isNaN(duration) || duration <= 0) { setError('Durée invalide.'); return }

    const preds = newPreds
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .map((label) => tasks.find((t) => t.name.toUpperCase() === label)?.id ?? '')
      .filter(Boolean)

    addTask({ id: uid(), name, duration, predecessors: preds })
    setNewName(''); setNewDur(''); setNewPreds(''); setError('')
  }

  // ── Styles ────────────────────────────────────────────────────
  const bg      = dark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'
  const cardBg  = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const inputCl = dark
    ? 'rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500'
    : 'rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-400'
  const thCl    = dark ? 'text-slate-400 border-slate-700' : 'text-slate-400 border-slate-200'
  const tdCl    = dark ? 'border-slate-700' : 'border-slate-100'

  return (
    <div className={`flex h-full flex-col overflow-hidden ${bg}`}>

      {/* ── En-tête ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: dark ? '#334155' : '#E2E8F0', background: '#1A3C6B' }}>
        <div>
          <span className="text-base font-semibold text-white">PERT / MPM</span>
          <span className="ml-3 text-xs text-blue-300">Ordonnancement de projet</span>
        </div>
        <div className="flex gap-2">
          <button onClick={loadExample}
            className="rounded border border-blue-400/30 px-3 py-1 text-xs text-blue-200 hover:bg-white/10 transition-colors">
            Charger exemple
          </button>
          <button onClick={clearTasks}
            className="rounded border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-white/10 transition-colors">
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Colonne gauche : saisie des tâches ──────────────── */}
        <div className={`flex w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto border-r p-4 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>

          {/* Formulaire ajout */}
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <p className={`mb-3 text-xs font-medium uppercase tracking-wide ${
              dark ? 'text-slate-400' : 'text-slate-400'
            }`}>Nouvelle tâche</p>

            <div className="space-y-2">
              <div>
                <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Nom de la tâche
                </label>
                <input
                  className={`w-full ${inputCl}`}
                  placeholder="ex: Développement"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>

              <div>
                <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Durée (jours)
                </label>
                <input
                  className={`w-full ${inputCl}`}
                  type="number"
                  min="1"
                  placeholder="ex: 5"
                  value={newDur}
                  onChange={(e) => setNewDur(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>

              <div>
                <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Prédécesseurs (noms séparés par virgule)
                </label>
                <input
                  className={`w-full ${inputCl}`}
                  placeholder="ex: Analyse, Conception"
                  value={newPreds}
                  onChange={(e) => setNewPreds(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <button
                onClick={handleAdd}
                className="w-full rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#2563EB' }}
              >
                + Ajouter la tâche
              </button>
            </div>
          </div>

          {/* Liste des tâches saisies */}
          {tasks.length > 0 && (
            <div className={`rounded-lg border ${cardBg}`}>
              <p className={`border-b px-3 py-2 text-xs font-medium uppercase tracking-wide ${
                dark ? 'text-slate-400 border-slate-700' : 'text-slate-400 border-slate-100'
              }`}>
                Tâches ({tasks.length})
              </p>
              <div className="divide-y" style={{ borderColor: dark ? '#334155' : '#F1F5F9' }}>
                {tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    allTasks={tasks}
                    dark={dark}
                    onUpdate={(updates) => updateTask(t.id, updates)}
                    onRemove={() => removeTask(t.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Résumé du projet */}
          {result.tasks.length > 0 && (
            <div className="rounded-lg border p-3 space-y-2"
              style={{
                background: dark ? '#172554' : '#EFF6FF',
                borderColor: dark ? '#1E3A8A' : '#BFDBFE',
              }}>
              <p className="text-xs font-semibold" style={{ color: dark ? '#93C5FD' : '#1D4ED8' }}>
                Résumé du projet
              </p>
              <div className="space-y-1 text-xs" style={{ color: dark ? '#BFDBFE' : '#1E40AF' }}>
                <div className="flex justify-between">
                  <span>Durée totale</span>
                  <strong>{result.projectDuration} jours</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tâches critiques</span>
                  <strong>{result.criticalPath.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tâches avec marge</span>
                  <strong>{result.tasks.filter((t) => t.totalFloat > 0).length}</strong>
                </div>
              </div>
              <div className="pt-1">
                <p className="text-xs font-medium mb-1" style={{ color: dark ? '#FCD34D' : '#B45309' }}>
                  Chemin critique
                </p>
                <p className="text-xs" style={{ color: dark ? '#FDE68A' : '#92400E' }}>
                  {result.criticalPath
                    .map((id) => result.tasks.find((t) => t.id === id)?.name)
                    .join(' → ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Zone principale : tableau + Gantt ───────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {result.tasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 opacity-50">
              <div className="text-4xl">📅</div>
              <p className="text-sm">Ajoutez des tâches ou chargez l'exemple</p>
            </div>
          ) : (
            <>
              {/* Tableau des dates */}
              <div className="overflow-auto border-b"
                style={{ borderColor: dark ? '#334155' : '#E2E8F0' }}>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-left ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}
                      style={{ borderColor: dark ? '#334155' : '#E2E8F0' }}>
                      {['Tâche','Dur.','Déb. tôt','Fin tôt','Déb. tard','Fin tard','Marge','Critique'].map((h) => (
                        <th key={h} className={`px-3 py-2 font-medium ${thCl}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.tasks.map((t, i) => (
                      <tr
                        key={t.id}
                        className={[
                          'border-b transition-colors',
                          t.isCritical
                            ? dark ? 'bg-amber-950/50' : 'bg-amber-50'
                            : i % 2 === 0
                            ? dark ? 'bg-slate-900' : 'bg-white'
                            : dark ? 'bg-slate-800/50' : 'bg-slate-50/50',
                        ].join(' ')}
                        style={{ borderColor: dark ? '#334155' : '#F1F5F9' }}
                      >
                        <td className={`px-3 py-2 font-medium ${tdCl} ${
                          t.isCritical
                            ? dark ? 'text-amber-400' : 'text-amber-700'
                            : dark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {t.name}
                        </td>
                        <td className={`px-3 py-2 ${tdCl} ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {t.duration}j
                        </td>
                        <td className={`px-3 py-2 ${tdCl} ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                          {t.earlyStart}
                        </td>
                        <td className={`px-3 py-2 ${tdCl} ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                          {t.earlyEnd}
                        </td>
                        <td className={`px-3 py-2 ${tdCl} ${dark ? 'text-purple-400' : 'text-purple-700'}`}>
                          {t.lateStart}
                        </td>
                        <td className={`px-3 py-2 ${tdCl} ${dark ? 'text-purple-400' : 'text-purple-700'}`}>
                          {t.lateEnd}
                        </td>
                        <td className={`px-3 py-2 font-semibold ${tdCl} ${
                          t.totalFloat === 0
                            ? dark ? 'text-amber-400' : 'text-amber-600'
                            : dark ? 'text-green-400' : 'text-green-600'
                        }`}>
                          {t.totalFloat}
                        </td>
                        <td className={`px-3 py-2 ${tdCl}`}>
                          {t.isCritical
                            ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-medium">
                                ⚡ Oui
                              </span>
                            : <span className={dark ? 'text-slate-500' : 'text-slate-400'}>Non</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Diagramme de Gantt */}
              <GanttChart result={result} dark={dark} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Ligne de tâche éditable ──────────────────────────────────────────
function TaskRow({
  task, allTasks, dark, onRemove,
}: {
  task: PertTask
  allTasks: PertTask[]
  dark: boolean
  onUpdate: (u: Partial<PertTask>) => void
  onRemove: () => void
}) {
  const predNames = task.predecessors
    .map((id) => allTasks.find((t) => t.id === id)?.name ?? id)
    .join(', ')

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className={`truncate text-xs font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
          {task.name}
        </p>
        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {task.duration}j
          {predNames && ` · après : ${predNames}`}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

// ── Diagramme de Gantt SVG ───────────────────────────────────────────
function GanttChart({ result, dark }: { result: ReturnType<typeof computePert>; dark: boolean }) {
  const { tasks, projectDuration } = result
  if (!tasks.length || projectDuration === 0) return null

  const ROW_H   = 36
  const LABEL_W = 120
  const PAD     = 16
  const BAR_H   = 18
  const BAR_Y   = (ROW_H - BAR_H) / 2

  const svgW    = 520
  const chartW  = svgW - LABEL_W - PAD
  const svgH    = tasks.length * ROW_H + 32

  const scale   = (v: number) => (v / projectDuration) * chartW

  const gridLines = Array.from({ length: projectDuration + 1 }, (_, i) => i)

  return (
    <div className="flex-1 overflow-auto p-4">
      <p className={`mb-2 text-xs font-medium uppercase tracking-wide ${
        dark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        Diagramme de Gantt
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="overflow-visible"
        style={{ minWidth: svgW }}
      >
        {/* Grille verticale */}
        {gridLines.map((d) => (
          <g key={d}>
            <line
              x1={LABEL_W + scale(d)}
              y1={0}
              x2={LABEL_W + scale(d)}
              y2={svgH - 20}
              stroke={dark ? '#1E293B' : '#E2E8F0'}
              strokeWidth={1}
            />
            <text
              x={LABEL_W + scale(d)}
              y={svgH - 6}
              textAnchor="middle"
              fontSize={9}
              fill={dark ? '#475569' : '#94A3B8'}
            >
              {d}j
            </text>
          </g>
        ))}

        {/* Tâches */}
        {tasks.map((t, i) => {
          const y       = i * ROW_H
          const barX    = LABEL_W + scale(t.earlyStart)
          const barW    = Math.max(scale(t.duration), 4)
          const isCrit  = t.isCritical
          const floatW  = scale(t.totalFloat)

          return (
            <g key={t.id}>
              {/* Label */}
              <text
                x={LABEL_W - 6}
                y={y + ROW_H / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fontWeight={isCrit ? '600' : '400'}
                fill={isCrit
                  ? dark ? '#FCD34D' : '#B45309'
                  : dark ? '#94A3B8' : '#64748B'}
              >
                {t.name}
              </text>

              {/* Marge flottante */}
              {t.totalFloat > 0 && (
                <rect
                  x={barX + barW}
                  y={y + BAR_Y}
                  width={floatW}
                  height={BAR_H}
                  rx={3}
                  fill={dark ? '#1E3A5F' : '#DBEAFE'}
                  opacity={0.6}
                />
              )}

              {/* Barre principale */}
              <rect
                x={barX}
                y={y + BAR_Y}
                width={barW}
                height={BAR_H}
                rx={4}
                fill={isCrit
                  ? dark ? '#D97706' : '#F59E0B'
                  : dark ? '#2563EB' : '#3B82F6'}
                opacity={0.9}
              />

              {/* Durée dans la barre */}
              {barW > 24 && (
                <text
                  x={barX + barW / 2}
                  y={y + BAR_Y + BAR_H / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="500"
                  fill="#ffffff"
                >
                  {t.duration}j
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Légende */}
      <div className="mt-3 flex gap-4 text-xs" style={{ color: dark ? '#64748B' : '#94A3B8' }}>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded"
            style={{ background: dark ? '#D97706' : '#F59E0B' }} />
          Chemin critique
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded"
            style={{ background: dark ? '#2563EB' : '#3B82F6' }} />
          Tâche normale
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded"
            style={{ background: dark ? '#1E3A5F' : '#DBEAFE', opacity: 0.8 }} />
          Marge disponible
        </div>
      </div>
    </div>
  )
}