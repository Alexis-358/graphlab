import type { Graph, AlgoResult } from '@/types/graph'

export function prim(graph: Graph, sourceId: string): AlgoResult {
  if (!graph.nodes.length || !graph.edges.length) {
    return { name: 'Prim', success: false,
      summary: 'Le graphe doit avoir au moins une arête.', steps: [] }
  }

  const inMST = new Set<string>([sourceId])
  const mstEdges: string[] = []
  let totalCost = 0

  const steps = [{
  description: `Départ depuis le sommet ${label(graph, sourceId)}`,
  highlightedEdges: [] as string[],
  highlightedNodes: [sourceId] as string[],
}]

  while (inMST.size < graph.nodes.length) {
    // Arêtes candidates : une extrémité dans MST, l'autre hors MST
    const candidates = graph.edges.filter((e) =>
      (inMST.has(e.source) && !inMST.has(e.target)) ||
      (!graph.directed && inMST.has(e.target) && !inMST.has(e.source))
    )

    if (!candidates.length) break

    // Choisir l'arête de poids minimal
    const best = candidates.reduce((a, b) =>
      (a.weight ?? 1) <= (b.weight ?? 1) ? a : b
    )

    const newNode = inMST.has(best.source) ? best.target : best.source
    inMST.add(newNode)
    mstEdges.push(best.id)
    totalCost += best.weight ?? 1

    steps.push({
  description: `Arête sélectionnée vers ${label(graph, newNode)} (poids ${best.weight ?? 1}). Coût total : ${totalCost}`,
  highlightedEdges: [...mstEdges] as string[],
  highlightedNodes: [...inMST] as string[],
})
  }

  return {
    name: 'Prim — Arbre Couvrant Minimal',
    success: true,
    summary: `MST trouvé : ${mstEdges.length} arête(s), poids total = ${totalCost}`,
    steps,
    totalCost,
  }
}

function label(graph: Graph, id: string) {
  return graph.nodes.find((n) => n.id === id)?.label ?? id
}