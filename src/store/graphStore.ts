import { create } from 'zustand'
import type { Graph, GraphNode, GraphEdge, Tool, AlgoResult } from '@/types/graph'

interface GraphStore {
  // --- État du graphe ---
  graph: Graph
  history: Graph[]      // pour undo
  future: Graph[]       // pour redo

  // --- État de l'UI ---
  activeTool: Tool
  selectedId: string | null
  edgeSourceId: string | null   // premier sommet cliqué lors d'ajout d'arête

  // --- État algorithme ---
  algoResult: AlgoResult | null
  currentStep: number

  // --- Actions : graphe ---
  addNode: (node: GraphNode) => void
  removeNode: (id: string) => void
  addEdge: (edge: GraphEdge) => void
  removeEdge: (id: string) => void
  moveNode: (id: string, x: number, y: number) => void
  setDirected: (directed: boolean) => void
  setWeighted: (weighted: boolean) => void
  clearGraph: () => void
  loadGraph: (graph: Graph) => void
  updateEdgeWeight: (id: string, weight: number) => void

  // --- Actions : UI ---
  setActiveTool: (tool: Tool) => void
  setSelectedId: (id: string | null) => void
  setEdgeSourceId: (id: string | null) => void

  // --- Actions : algorithme ---
  setAlgoResult: (result: AlgoResult | null) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // --- Undo / Redo ---
  undo: () => void
  redo: () => void
}

const EMPTY_GRAPH: Graph = {
  nodes: [],
  edges: [],
  directed: false,
  weighted: false,
}

export const useGraphStore = create<GraphStore>((set) => ({
  graph: EMPTY_GRAPH,
  history: [],
  future: [],
  activeTool: 'addNode',
  selectedId: null,
  edgeSourceId: null,
  algoResult: null,
  currentStep: 0,

  // Sauvegarde l'état courant dans l'historique avant chaque modification
  addNode: (node) => set((s) => {
    const history = [...s.history, s.graph].slice(-30)
    return {
      graph: { ...s.graph, nodes: [...s.graph.nodes, node] },
      history,
      future: [],
    }
  }),

  removeNode: (id) => set((s) => {
    const history = [...s.history, s.graph].slice(-30)
    return {
      graph: {
        ...s.graph,
        nodes: s.graph.nodes.filter((n) => n.id !== id),
        // Supprime aussi toutes les arêtes connectées à ce sommet
        edges: s.graph.edges.filter((e) => e.source !== id && e.target !== id),
      },
      history,
      future: [],
    }
  }),

  addEdge: (edge) => set((s) => {
    const history = [...s.history, s.graph].slice(-30)
    return {
      graph: { ...s.graph, edges: [...s.graph.edges, edge] },
      history,
      future: [],
    }
  }),

  removeEdge: (id) => set((s) => {
    const history = [...s.history, s.graph].slice(-30)
    return {
      graph: { ...s.graph, edges: s.graph.edges.filter((e) => e.id !== id) },
      history,
      future: [],
    }
  }),

  updateEdgeWeight: (id: string, weight: number) => set((s) => ({
  graph: {
    ...s.graph,
    edges: s.graph.edges.map((e) =>
      e.id === id ? { ...e, weight } : e
    ),
  },
})),

  moveNode: (id, x, y) => set((s) => ({
    graph: {
      ...s.graph,
      nodes: s.graph.nodes.map((n) => n.id === id ? { ...n, x, y } : n),
    },
  })),

  setDirected: (directed) => set((s) => ({
    graph: { ...s.graph, directed },
  })),

  setWeighted: (weighted) => set((s) => ({
    graph: { ...s.graph, weighted },
  })),

  clearGraph: () => set((s) => ({
    graph: EMPTY_GRAPH,
    history: [...s.history, s.graph].slice(-30),
    future: [],
    algoResult: null,
  })),

  loadGraph: (graph) => set({ graph, history: [], future: [] }),

  setActiveTool: (tool) => set({ activeTool: tool, edgeSourceId: null }),
  setSelectedId: (id) => set({ selectedId: id }),
  setEdgeSourceId: (id) => set({ edgeSourceId: id }),

  setAlgoResult: (result) => set({ algoResult: result, currentStep: 0 }),

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => set((s) => {
    const max = (s.algoResult?.steps.length ?? 1) - 1
    return { currentStep: Math.min(s.currentStep + 1, max) }
  }),

  prevStep: () => set((s) => ({
    currentStep: Math.max(s.currentStep - 1, 0),
  })),

  undo: () => set((s) => {
    if (!s.history.length) return s
    const previous = s.history[s.history.length - 1]
    return {
      graph: previous,
      history: s.history.slice(0, -1),
      future: [s.graph, ...s.future].slice(0, 30),
    }
  }),

  redo: () => set((s) => {
    if (!s.future.length) return s
    const next = s.future[0]
    return {
      graph: next,
      history: [...s.history, s.graph].slice(-30),
      future: s.future.slice(1),
    }
  }),
}))