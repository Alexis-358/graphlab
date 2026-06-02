import type { Graph, AlgoResult } from '@/types/graph'

export function bellmanFord(graph: Graph, sourceId: string): AlgoResult {
  const { nodes, edges } = graph

  if (!nodes.length) {
    return { name: 'Bellman-Ford', success: false,
      summary: 'Le graphe est vide.', steps: [] }
  }

  const dist: Record<string, number> = {}
  const prev: Record<string, { nodeId: string; edgeId: string } | null> = {}

  nodes.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[sourceId] = 0

  const steps = [{
    description: `Initialisation depuis ${lbl(nodes, sourceId)} : dist = 0, tous les autres = ∞`,
    highlightedEdges: [] as string[],
    highlightedNodes: [sourceId] as string[],
  }]

  // N-1 itérations de relaxation
  for (let i = 0; i < nodes.length - 1; i++) {
    let updated = false
    edges.forEach((e) => {
      const w = graph.weighted ? (e.weight ?? 1) : 1

      // Sens normal
      if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target]) {
        dist[e.target] = dist[e.source] + w
        prev[e.target] = { nodeId: e.source, edgeId: e.id }
        updated = true
        steps.push({
          description: `Iter ${i + 1} — Relax : ${lbl(nodes, e.source)} → ${lbl(nodes, e.target)} = ${dist[e.target]}`,
          highlightedEdges: [e.id] as string[],
          highlightedNodes: [e.source, e.target] as string[],
        })
      }

      // Sens inverse si non orienté
      if (!graph.directed && dist[e.target] !== Infinity && dist[e.target] + w < dist[e.source]) {
        dist[e.source] = dist[e.target] + w
        prev[e.source] = { nodeId: e.target, edgeId: e.id }
        updated = true
        steps.push({
          description: `Iter ${i + 1} — Relax inverse : ${lbl(nodes, e.target)} → ${lbl(nodes, e.source)} = ${dist[e.source]}`,
          highlightedEdges: [e.id] as string[],
          highlightedNodes: [e.source, e.target] as string[],
        })
      }
    })
    if (!updated) break // Optimisation : arrêt anticipé
  }

  // Détection de cycle négatif (N-ième itération)
  let negativeCycle = false
  for (const e of edges) {
    const w = graph.weighted ? (e.weight ?? 1) : 1
    if (dist[e.source] !== Infinity && dist[e.source] + w < dist[e.target]) {
      negativeCycle = true
      break
    }
  }

  if (negativeCycle) {
    steps.push({
      description: '⚠️ Cycle négatif détecté ! Les distances ne sont pas définies.',
      highlightedEdges: [] as string[],
      highlightedNodes: [] as string[],
    })
    return {
      name: 'Bellman-Ford',
      success: false,
      summary: '⚠️ Cycle négatif détecté dans le graphe. Distances indéfinies.',
      steps,
    }
  }

  // Résumé des distances
  const distSummary = nodes
    .map((n) => `${lbl(nodes, n.id)}: ${dist[n.id] === Infinity ? '∞' : dist[n.id]}`)
    .join(' · ')

  steps.push({
    description: `Terminé. Distances depuis ${lbl(nodes, sourceId)} : ${distSummary}`,
    highlightedEdges: [] as string[],
    highlightedNodes: nodes.map((n) => n.id) as string[],
  })

  return {
    name: 'Bellman-Ford',
    success: true,
    summary: `Distances depuis ${lbl(nodes, sourceId)} calculées. ${distSummary}`,
    steps,
  }
}

function lbl(nodes: Graph['nodes'], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id
}