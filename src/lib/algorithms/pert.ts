import type { PertTask, PertTaskComputed, PertResult } from '@/types/pert'

export function computePert(tasks: PertTask[]): PertResult {
  if (!tasks.length) {
    return { tasks: [], projectDuration: 0, criticalPath: [] }
  }

  // ── Tri topologique (Kahn) ──────────────────────────────────────
  const inDegree: Record<string, number> = {}
  const successors: Record<string, string[]> = {}
  tasks.forEach((t) => {
    inDegree[t.id] = t.predecessors.length
    successors[t.id] = []
  })
  tasks.forEach((t) => {
    t.predecessors.forEach((predId) => {
      successors[predId]?.push(t.id)
    })
  })

  const queue = tasks.filter((t) => t.predecessors.length === 0).map((t) => t.id)
  const order: string[] = []
  while (queue.length) {
    const cur = queue.shift()!
    order.push(cur)
    successors[cur].forEach((sId) => {
      inDegree[sId]--
      if (inDegree[sId] === 0) queue.push(sId)
    })
  }

  // ── Dates au plus tôt (forward pass) ───────────────────────────
  const earlyEnd: Record<string, number> = {}
  tasks.forEach((t) => (earlyEnd[t.id] = 0))

  order.forEach((id) => {
    const task = tasks.find((t) => t.id === id)!
    const maxPredEnd = task.predecessors.length
      ? Math.max(...task.predecessors.map((p) => earlyEnd[p] ?? 0))
      : 0
    earlyEnd[id] = maxPredEnd + task.duration
  })

  const projectDuration = Math.max(...Object.values(earlyEnd))

  // ── Dates au plus tard (backward pass) ─────────────────────────
  const lateStart: Record<string, number> = {}
  tasks.forEach((t) => (lateStart[t.id] = projectDuration))

  ;[...order].reverse().forEach((id) => {
    const task = tasks.find((t) => t.id === id)!
    const succs = successors[id]
    if (!succs.length) {
      lateStart[id] = projectDuration - task.duration
    } else {
      lateStart[id] = Math.min(...succs.map((sId) => lateStart[sId])) - task.duration
    }
  })

  // ── Résultats complets ──────────────────────────────────────────
  const computed: PertTaskComputed[] = tasks.map((t) => {
    const es = (t.predecessors.length
      ? Math.max(...t.predecessors.map((p) => earlyEnd[p] ?? 0))
      : 0)
    const ee = es + t.duration
    const ls = lateStart[t.id]
    const le = ls + t.duration
    const tf = ls - es
    return {
      ...t,
      earlyStart:  es,
      earlyEnd:    ee,
      lateStart:   ls,
      lateEnd:     le,
      totalFloat:  tf,
      isCritical:  tf === 0,
    }
  })

  // ── Chemin critique dans l'ordre ───────────────────────────────
  const criticalPath = order.filter((id) =>
    computed.find((t) => t.id === id)?.isCritical
  )

  return { tasks: computed, projectDuration, criticalPath }
}