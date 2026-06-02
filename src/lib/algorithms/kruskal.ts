import type { Graph, AlgoResult } from '@/types/graph'

export function kruskal(graph: Graph): AlgoResult {
  if (!graph.edges.length) {
    return { name: 'Kruskal', success: false,
      summary: 'Aucune arête dans le graphe.', steps: [] }
  }

  // Union-Find
  const parent: Record<string, string> = {}
  graph.nodes.forEach((n) => (parent[n.id] = n.id))

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  function union(a: string, b: string) { parent[find(a)] = find(b) }

  const sorted = [...graph.edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1))
  const mstEdges: string[] = []
  let totalCost = 0

  const steps = [{
  description: `Arêtes triées par poids croissant. ${sorted.length} arêtes à examiner.`,
  highlightedEdges: [] as string[],
  highlightedNodes: [] as string[],
}]

  for (const edge of sorted) {
    if (find(edge.source) !== find(edge.target)) {
      union(edge.source, edge.target)
      mstEdges.push(edge.id)
      totalCost += edge.weight ?? 1
      steps.push({
  description: `✓ Arête ajoutée (poids ${edge.weight ?? 1}). Coût total : ${totalCost}`,
  highlightedEdges: [...mstEdges] as string[],
  highlightedNodes: [] as string[],
})
    } else {
      steps.push({
  description: `✗ Arête ignorée (formerait un cycle, poids ${edge.weight ?? 1})`,
  highlightedEdges: [...mstEdges] as string[],
  highlightedNodes: [] as string[],
})
    }
  }

  return {
    name: 'Kruskal — Arbre Couvrant Minimal',
    success: true,
    summary: `MST : ${mstEdges.length} arête(s) sélectionnée(s), poids total = ${totalCost}`,
    steps,
    totalCost,
  }
}