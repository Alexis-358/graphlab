// Un sommet du graphe
export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

// Une arête du graphe
export interface GraphEdge {
  id: string
  source: string   // id du sommet source
  target: string   // id du sommet cible
  weight?: number  // optionnel — seulement si graphe pondéré
}

// Le graphe complet
export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  directed: boolean
  weighted: boolean
}

// L'outil actif dans l'éditeur
export type Tool = 'select' | 'addNode' | 'addEdge' | 'delete'

// Une étape d'algorithme pour la visualisation
export interface AlgoStep {
  description: string          // texte expliquant l'étape
  highlightedEdges: string[]   // ids des arêtes à colorier
  highlightedNodes: string[]   // ids des sommets à colorier
  data?: Record<string, unknown>
}

// Résultat d'un algorithme
export interface AlgoResult {
  name: string
  success: boolean
  summary: string        // explication courte
  steps: AlgoStep[]
  totalCost?: number     // pour MST, PERT…
}