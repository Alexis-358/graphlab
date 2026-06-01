import type { Graph } from '@/types/graph'

// Génère un id unique
export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// Génère le prochain label (A, B, C… Z, AA, AB…)
export function nextLabel(usedLabels: string[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let i = 0
  while (true) {
    const label =
      i < 26
        ? letters[i]
        : letters[Math.floor(i / 26) - 1] + letters[i % 26]
    if (!usedLabels.includes(label)) return label
    i++
  }
}

// Calcule le degré de chaque sommet
export function computeDegrees(graph: Graph): Record<string, number> {
  const degrees: Record<string, number> = {}
  graph.nodes.forEach((n) => (degrees[n.id] = 0))
  graph.edges.forEach((e) => {
    degrees[e.source] = (degrees[e.source] ?? 0) + 1
    if (!graph.directed) {
      degrees[e.target] = (degrees[e.target] ?? 0) + 1
    }
  })
  return degrees
}

// Vérifie si le graphe est connexe (BFS)
export function isConnected(graph: Graph): boolean {
  if (graph.nodes.length === 0) return true
  const adj: Record<string, string[]> = {}
  graph.nodes.forEach((n) => (adj[n.id] = []))
  graph.edges.forEach((e) => {
    adj[e.source].push(e.target)
    if (!graph.directed) adj[e.target].push(e.source)
  })
  const visited = new Set<string>()
  const queue = [graph.nodes[0].id]
  while (queue.length) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)
    adj[current].forEach((nb) => { if (!visited.has(nb)) queue.push(nb) })
  }
  return visited.size === graph.nodes.length
}

// Export du graphe en JSON téléchargeable
export function exportGraphJSON(graph: Graph): void {
  const blob = new Blob([JSON.stringify(graph, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'graphlab-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

// Import d'un graphe depuis un fichier JSON
export function importGraphJSON(
  file: File,
  onLoad: (graph: Graph) => void
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const graph = JSON.parse(e.target?.result as string) as Graph
      onLoad(graph)
    } catch {
      alert('Fichier JSON invalide.')
    }
  }
  reader.readAsText(file)
}