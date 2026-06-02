import type { Graph, AlgoResult } from '@/types/graph'

export interface ColoringResult extends AlgoResult {
  nodeColors: Record<string, number>  // nodeId → numéro de couleur
  chromaticNumber: number
}

export function greedyColoring(graph: Graph): ColoringResult {
  if (!graph.nodes.length) {
    return { name: 'Coloration', success: false,
      summary: 'Le graphe est vide.', steps: [],
      nodeColors: {}, chromaticNumber: 0 }
  }

  // Construire la liste d'adjacence
  const adj: Record<string, Set<string>> = {}
  graph.nodes.forEach((n) => (adj[n.id] = new Set()))
  graph.edges.forEach((e) => {
    adj[e.source].add(e.target)
    adj[e.target].add(e.source)
  })

  // Trier par degré décroissant (DSATUR simplifié)
  const sorted = [...graph.nodes].sort(
    (a, b) => adj[b.id].size - adj[a.id].size
  )

  const nodeColors: Record<string, number> = {}
  let chromaticNumber = 0

  const steps = [{
    description: `Sommets triés par degré décroissant. Coloration en cours…`,
    highlightedEdges: [] as string[],
    highlightedNodes: [] as string[],
  }]

  sorted.forEach((node) => {
    // Couleurs utilisées par les voisins
    const usedColors = new Set(
      [...adj[node.id]]
        .filter((nb) => nodeColors[nb] !== undefined)
        .map((nb) => nodeColors[nb])
    )

    // Trouver la plus petite couleur disponible
    let color = 0
    while (usedColors.has(color)) color++

    nodeColors[node.id] = color
    chromaticNumber = Math.max(chromaticNumber, color + 1)

    steps.push({
      description: `Sommet ${node.label} → Couleur ${color + 1} (voisins utilisent : ${[...usedColors].map(c => c+1).join(', ') || 'aucune'})`,
      highlightedEdges: [] as string[],
      highlightedNodes: [node.id] as string[],
    })
  })

  steps.push({
    description: `✓ Coloration terminée avec ${chromaticNumber} couleur(s). χ(G) ≤ ${chromaticNumber}`,
    highlightedEdges: [] as string[],
    highlightedNodes: graph.nodes.map((n) => n.id) as string[],
  })

  return {
    name: 'Coloration gloutonne',
    success: true,
    summary: `${chromaticNumber} couleur(s) utilisée(s). Nombre chromatique χ(G) ≤ ${chromaticNumber}`,
    steps,
    nodeColors,
    chromaticNumber,
  }
}