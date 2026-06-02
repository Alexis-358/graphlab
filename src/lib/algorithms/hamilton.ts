import type { Graph, AlgoResult } from '@/types/graph'

const MAX_NODES = 15  // Limite pour éviter l'explosion combinatoire

export function findHamiltonianCircuit(graph: Graph): AlgoResult {
  const { nodes, edges } = graph

  if (nodes.length === 0) {
    return { name: 'Hamilton', success: false,
      summary: 'Le graphe est vide.', steps: [] }
  }

  if (nodes.length > MAX_NODES) {
    return { name: 'Hamilton', success: false,
      summary: `⚠️ Trop de sommets (${nodes.length} > ${MAX_NODES}). Problème NP-complet — limite de sécurité atteinte.`,
      steps: [] }
  }

  // Construction de la liste d'adjacence
  const adj: Record<string, string[]> = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    adj[e.source].push(e.target)
    if (!graph.directed) adj[e.target].push(e.source)
  })

  const path: string[] = [nodes[0].id]
  const visited = new Set<string>([nodes[0].id])
  const steps = [{
    description: `Départ depuis ${lbl(nodes, nodes[0].id)}. Recherche d'un circuit hamiltonien…`,
    highlightedEdges: [] as string[],
    highlightedNodes: [nodes[0].id] as string[],
  }]

  function getEdgeId(a: string, b: string) {
    return edges.find(
      (e) => (e.source === a && e.target === b) ||
             (!graph.directed && e.source === b && e.target === a)
    )?.id ?? ''
  }

  function backtrack(): boolean {
    if (path.length === nodes.length) {
      // Vérifie si on peut revenir au départ
      const last = path[path.length - 1]
      const start = path[0]
      if (adj[last].includes(start)) {
        steps.push({
          description: `✓ Circuit trouvé ! ${path.map((id) => lbl(nodes, id)).join(' → ')} → ${lbl(nodes, start)}`,
          highlightedEdges: path.map((id, i) =>
            i < path.length - 1 ? getEdgeId(id, path[i + 1]) : getEdgeId(id, start)
          ).filter(Boolean) as string[],
          highlightedNodes: [...path] as string[],
        })
        return true
      }
      return false
    }

    const current = path[path.length - 1]
    for (const neighbor of adj[current]) {
      if (visited.has(neighbor)) continue
      path.push(neighbor)
      visited.add(neighbor)
      steps.push({
        description: `Essai : ${path.map((id) => lbl(nodes, id)).join(' → ')}`,
        highlightedEdges: path.slice(0, -1).map((id, i) =>
          getEdgeId(id, path[i + 1])
        ).filter(Boolean) as string[],
        highlightedNodes: [...path] as string[],
      })
      if (backtrack()) return true
      path.pop()
      visited.delete(neighbor)
      steps.push({
        description: `✗ Retour arrière depuis ${lbl(nodes, neighbor)}`,
        highlightedEdges: [] as string[],
        highlightedNodes: [...path] as string[],
      })
    }
    return false
  }

  const found = backtrack()

  if (!found) {
    steps.push({
      description: 'Aucun circuit hamiltonien trouvé dans ce graphe.',
      highlightedEdges: [] as string[],
      highlightedNodes: [] as string[],
    })
  }

  return {
    name: 'Circuit Hamiltonien',
    success: found,
    summary: found
      ? `Circuit hamiltonien trouvé : ${path.map((id) => lbl(nodes, id)).join(' → ')} → ${lbl(nodes, path[0])}`
      : 'Aucun circuit hamiltonien dans ce graphe.',
    steps,
  }
}

export function countSimplePaths(
  graph: Graph, sourceId: string, targetId: string
): AlgoResult {
  const { nodes, edges } = graph

  if (nodes.length > MAX_NODES) {
    return { name: 'Chemins simples', success: false,
      summary: `⚠️ Trop de sommets (${nodes.length} > ${MAX_NODES}). Explosion combinatoire.`,
      steps: [] }
  }

  const adj: Record<string, string[]> = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    adj[e.source].push(e.target)
    if (!graph.directed) adj[e.target].push(e.source)
  })

  const allPaths: string[][] = []
  const visited = new Set<string>([sourceId])

  function dfs(current: string, path: string[]) {
    if (current === targetId) {
      allPaths.push([...path])
      return
    }
    for (const nb of adj[current]) {
      if (!visited.has(nb)) {
        visited.add(nb)
        path.push(nb)
        dfs(nb, path)
        path.pop()
        visited.delete(nb)
      }
    }
  }

  dfs(sourceId, [sourceId])

  const src = lbl(nodes, sourceId)
  const tgt = lbl(nodes, targetId)

  const steps = allPaths.map((p, i) => ({
    description: `Chemin ${i + 1} : ${p.map((id) => lbl(nodes, id)).join(' → ')}`,
    highlightedEdges: p.slice(0, -1).map((id, i) => {
      const next = p[i + 1]
      return edges.find(
        (e) => (e.source === id && e.target === next) ||
               (!graph.directed && e.source === next && e.target === id)
      )?.id ?? ''
    }).filter(Boolean) as string[],
    highlightedNodes: p as string[],
  }))

  if (!steps.length) {
    steps.push({
      description: `Aucun chemin simple de ${src} vers ${tgt}.`,
      highlightedEdges: [] as string[],
      highlightedNodes: [] as string[],
    })
  }

  return {
    name: 'Chemins simples',
    success: allPaths.length > 0,
    summary: `${allPaths.length} chemin(s) simple(s) de ${src} vers ${tgt}.`,
    steps,
  }
}

function lbl(nodes: Graph['nodes'], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id
}