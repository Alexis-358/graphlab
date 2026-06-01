import type { Graph } from '@/types/graph'
import { computeDegrees, isConnected } from '@/utils/graphHelpers'

export interface GraphAnalysis {
  nodeCount: number
  edgeCount: number
  degrees: Record<string, number>
  degreeSum: number
  minDegree: number
  maxDegree: number
  connected: boolean
  eulerType: 'circuit' | 'path' | 'none'
  probablyPlanar: boolean
}

export function analyzeGraph(graph: Graph): GraphAnalysis {
  const nodeCount = graph.nodes.length
  const edgeCount = graph.edges.length
  const degrees = computeDegrees(graph)
  const degreeValues = Object.values(degrees)
  const degreeSum = degreeValues.reduce((a, b) => a + b, 0)
  const minDegree = nodeCount ? Math.min(...degreeValues) : 0
  const maxDegree = nodeCount ? Math.max(...degreeValues) : 0
  const connected = isConnected(graph)

  // Euler : compte les sommets de degré impair
  const oddCount = degreeValues.filter((d) => d % 2 !== 0).length
  const eulerType = oddCount === 0 ? 'circuit' : oddCount === 2 ? 'path' : 'none'

  // Planarité : condition nécessaire m ≤ 3n - 6
  const probablyPlanar = nodeCount <= 4 || edgeCount <= 3 * nodeCount - 6

  return { nodeCount, edgeCount, degrees, degreeSum,
    minDegree, maxDegree, connected, eulerType, probablyPlanar }
}