import type { Graph, AlgoResult } from '@/types/graph'

export function findEulerianPath(graph: Graph): AlgoResult {
  const { nodes, edges } = graph

  if (!nodes.length) {
    return { name: 'Euler', success: false, summary: 'Graphe vide.', steps: [] }
  }

  // Calcul des degrés
  const degree: Record<string, number> = {}
  nodes.forEach((n) => (degree[n.id] = 0))
  edges.forEach((e) => {
    degree[e.source]++
    if (!graph.directed) degree[e.target]++
  })

  const oddNodes = nodes.filter((n) => degree[n.id] % 2 !== 0)

  if (oddNodes.length !== 0 && oddNodes.length !== 2) {
    return {
      name: 'Euler',
      success: false,
      summary: `Ni eulérien ni semi-eulérien : ${oddNodes.length} sommets de degré impair (besoin de 0 ou 2).`,
      steps: [{
        description: `Sommets de degré impair : ${oddNodes.map((n) => n.label).join(', ')}`,
        highlightedEdges: [] as string[],
        highlightedNodes: oddNodes.map((n) => n.id) as string[],
      }],
    }
  }

  const isCircuit = oddNodes.length === 0
  const startNode = isCircuit ? nodes[0].id : oddNodes[0].id

  // Algorithme de Hierholzer
  const usedEdges = new Set<string>()
  const adj: Record<string, { nodeId: string; edgeId: string }[]> = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    adj[e.source].push({ nodeId: e.target, edgeId: e.id })
    if (!graph.directed) {
      adj[e.target].push({ nodeId: e.source, edgeId: e.id })
    }
  })

  const path: string[] = []
  const edgePath: string[] = []
  const stack = [startNode]
  const steps = [{
    description: `Départ depuis ${lbl(nodes, startNode)}. Type : ${isCircuit ? 'Circuit eulérien' : 'Chemin eulérien'}`,
    highlightedEdges: [] as string[],
    highlightedNodes: [startNode] as string[],
  }]

  while (stack.length) {
    const v = stack[stack.length - 1]
    const unusedEdge = adj[v].find((e) => !usedEdges.has(e.edgeId))

    if (unusedEdge) {
      usedEdges.add(unusedEdge.edgeId)
      stack.push(unusedEdge.nodeId)
      steps.push({
        description: `Avancer : ${lbl(nodes, v)} → ${lbl(nodes, unusedEdge.nodeId)}`,
        highlightedEdges: [unusedEdge.edgeId] as string[],
        highlightedNodes: [v, unusedEdge.nodeId] as string[],
      })
    } else {
      path.unshift(stack.pop()!)
      if (path.length > 1) {
        steps.push({
          description: `Ajout au chemin : ${path.map((id) => lbl(nodes, id)).join(' → ')}`,
          highlightedEdges: [...edgePath] as string[],
          highlightedNodes: [...path] as string[],
        })
      }
    }
  }

  const pathStr = path.map((id) => lbl(nodes, id)).join(' → ')

  return {
    name: isCircuit ? 'Circuit Eulérien' : 'Chemin Eulérien',
    success: true,
    summary: `${isCircuit ? 'Circuit' : 'Chemin'} eulérien trouvé : ${pathStr}`,
    steps,
  }
}

function lbl(nodes: Graph['nodes'], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id
}