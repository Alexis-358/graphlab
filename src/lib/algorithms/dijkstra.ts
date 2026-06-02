import type { Graph, AlgoResult } from '@/types/graph'

export function dijkstra(graph: Graph, sourceId: string, targetId?: string): AlgoResult {
  const nodes = graph.nodes
  const edges = graph.edges

  // Vérifie les poids négatifs
  if (graph.weighted && edges.some((e) => (e.weight ?? 0) < 0)) {
    return {
      name: 'Dijkstra',
      success: false,
      summary: '⚠️ Poids négatif détecté. Utilisez Bellman-Ford à la place.',
      steps: [],
    }
  }

  const dist: Record<string, number> = {}
  const prev: Record<string, { nodeId: string; edgeId: string } | null> = {}
  const visited = new Set<string>()

  nodes.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[sourceId] = 0

  
const steps = [{
  description: `Initialisation : distance de ${label(nodes, sourceId)} = 0, tous les autres = ∞`,
  highlightedEdges: [] as string[],
  highlightedNodes: [sourceId] as string[],
}]

  while (visited.size < nodes.length) {
    // Choisir le sommet non visité avec la plus petite distance
    const u = nodes
      .filter((n) => !visited.has(n.id))
      .reduce<typeof nodes[0] | null>((best, n) =>
        best === null || dist[n.id] < dist[best.id] ? n : best, null)

    if (!u || dist[u.id] === Infinity) break
    visited.add(u.id)

    // Relaxer les voisins
    const neighbors = edges.filter((e) =>
      e.source === u.id || (!graph.directed && e.target === u.id)
    )

    neighbors.forEach((e) => {
      const vId = e.source === u.id ? e.target : e.source
      if (visited.has(vId)) return
      const w = graph.weighted ? (e.weight ?? 1) : 1
      const newDist = dist[u.id] + w

      if (newDist < dist[vId]) {
        dist[vId] = newDist
        prev[vId] = { nodeId: u.id, edgeId: e.id }
        steps.push({
          description: `Relaxation : ${label(nodes, u.id)} → ${label(nodes, vId)}, nouvelle distance = ${newDist}`,
          highlightedEdges: [e.id],
          highlightedNodes: [u.id, vId],
        })
      }
    })
  }

  // Reconstituer le chemin vers la cible
  const pathEdges: string[] = []
  const pathNodes: string[] = []
  if (targetId && dist[targetId] !== Infinity) {
    let cur = targetId
    while (prev[cur]) {
      pathNodes.unshift(cur)
      pathEdges.unshift(prev[cur]!.edgeId)
      cur = prev[cur]!.nodeId
    }
    pathNodes.unshift(cur)
  }

  const srcLabel = label(nodes, sourceId)
  const tgtLabel = targetId ? label(nodes, targetId) : null
  const distVal = targetId ? dist[targetId] : null

  steps.push({
  description: tgtLabel && distVal !== Infinity
    ? `Chemin optimal ${srcLabel} → ${tgtLabel} = ${distVal}`
    : `Algorithme terminé. Distances calculées depuis ${srcLabel}.`,
  highlightedEdges: pathEdges as string[],
  highlightedNodes: pathNodes as string[],
})

  return {
    name: 'Dijkstra',
    success: true,
    summary: tgtLabel
      ? distVal === Infinity
        ? `Aucun chemin de ${srcLabel} vers ${tgtLabel}.`
        : `Plus court chemin ${srcLabel} → ${tgtLabel} : ${distVal}`
      : `Distances calculées depuis ${srcLabel}.`,
    steps,
    totalCost: distVal ?? undefined,
  }
}

function label(nodes: Graph['nodes'], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id
}