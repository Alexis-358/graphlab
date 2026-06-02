import { useEffect, useRef, useCallback } from 'react'
import cytoscape, { type Core } from 'cytoscape'
import { useGraphStore } from '@/store/graphStore'
import { cytoscapeStyles } from './cytoscapeStyles'
import { uid, nextLabel } from '@/utils/graphHelpers'

export default function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  const {
    graph, activeTool, edgeSourceId,
    addNode, addEdge, removeNode, removeEdge,
    moveNode, setEdgeSourceId, setSelectedId,
    algoResult, currentStep,
  } = useGraphStore()

  // Initialise Cytoscape une seule fois
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: cytoscapeStyles,
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [])

  // Synchronise le graphe du store avec Cytoscape
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    // Nœuds à ajouter
    graph.nodes.forEach((node) => {
      if (!cy.getElementById(node.id).length) {
        cy.add({
          group: 'nodes',
          data: { id: node.id, label: node.label },
          position: { x: node.x, y: node.y },
        })
      } else {
        cy.getElementById(node.id).data('label', node.label)
      }
    })

    // Nœuds à supprimer
    cy.nodes().forEach((n) => {
      if (!graph.nodes.find((node) => node.id === n.id())) {
        cy.remove(n)
      }
    })

    // Arêtes à ajouter
    graph.edges.forEach((edge) => {
      if (!cy.getElementById(edge.id).length) {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: graph.weighted && edge.weight != null ? String(edge.weight) : '',
          },
        })
      }
      const el = cy.getElementById(edge.id)
      el.data('label', graph.weighted && edge.weight != null ? String(edge.weight) : '')
      if (graph.directed) el.addClass('directed')
      else el.removeClass('directed')
    })

    // Arêtes à supprimer
    cy.edges().forEach((e) => {
      if (!graph.edges.find((edge) => edge.id === e.id())) {
        cy.remove(e)
      }
    })
  }, [graph])

  // Surlignage des étapes d'algorithme
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().removeClass('highlighted mst')
    if (!algoResult) return
    const step = algoResult.steps[currentStep]
    if (!step) return
    step.highlightedEdges.forEach((id) => cy.getElementById(id).addClass('highlighted'))
    step.highlightedNodes.forEach((id) => cy.getElementById(id).addClass('highlighted'))
  }, [algoResult, currentStep])

  // Gestion des clics sur le canvas (outil actif)
  const handleToolRef = useRef(activeTool)
  const edgeSourceRef = useRef(edgeSourceId)
  handleToolRef.current = activeTool
  edgeSourceRef.current = edgeSourceId

  const setupEvents = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.removeAllListeners()

    // Clic sur fond du canvas → ajouter un sommet
    cy.on('tap', (e) => {
      if (e.target !== cy) return
      if (handleToolRef.current !== 'addNode') return
      const pos = e.position
      const labels = useGraphStore.getState().graph.nodes.map((n) => n.label)
      addNode({ id: uid('n'), label: nextLabel(labels), x: pos.x, y: pos.y })
    })

    // Clic sur un nœud
    cy.on('tap', 'node', (e) => {
      const nodeId = e.target.id() as string
      const tool = handleToolRef.current

      if (tool === 'delete') {
        removeNode(nodeId)
        setEdgeSourceId(null)
        return
      }

      if (tool === 'addEdge') {
        const srcId = edgeSourceRef.current
        if (!srcId) {
          // Premier clic → source
          setEdgeSourceId(nodeId)
          cy.getElementById(nodeId).addClass('source-selected')
        } else if (srcId !== nodeId) {
          // Deuxième clic → créer l'arête
          cy.getElementById(srcId).removeClass('source-selected')
          const { weighted } = useGraphStore.getState().graph
          addEdge({
            id: uid('e'),
            source: srcId,
            target: nodeId,
            weight: weighted ? 1 : undefined,
          })
          setEdgeSourceId(null)
        }
        return
      }

      if (tool === 'select') {
        setSelectedId(nodeId)
      }
    })

    // Clic sur une arête
    cy.on('tap', 'edge', (e) => {
      if (handleToolRef.current === 'delete') {
        removeEdge(e.target.id() as string)
      }
    })

    // Double-clic sur une arête → modifier le poids
  cy.on('dblclick', 'edge', (e) => {
    if (!useGraphStore.getState().graph.weighted) return
    const edgeId = e.target.id() as string
    const currentEdge = useGraphStore.getState().graph.edges.find(ed => ed.id === edgeId)
    const currentWeight = currentEdge?.weight ?? 1
    const input = prompt(`Nouveau poids pour cette arête :`, String(currentWeight))
    if (input === null) return
    const val = parseFloat(input)
    if (!isNaN(val)) {
      useGraphStore.getState().updateEdgeWeight(edgeId, val)
    }
  })

    // Drag d'un nœud → mise à jour de la position dans le store
    cy.on('dragfree', 'node', (e) => {
      const pos = e.target.position()
      moveNode(e.target.id() as string, pos.x, pos.y)
    })

    // Clic sur fond → désélectionner
    cy.on('tap', (e) => {
      if (e.target === cy) {
        setSelectedId(null)
        if (edgeSourceRef.current) {
          cy.getElementById(edgeSourceRef.current).removeClass('source-selected')
          setEdgeSourceId(null)
        }
      }
    })
  }, [addNode, addEdge, removeNode, removeEdge, moveNode, setEdgeSourceId, setSelectedId])

  useEffect(() => {
    setupEvents()
  }, [setupEvents])

  // Curseur selon l'outil actif
  const cursorMap: Record<string, string> = {
    select: 'default',
    addNode: 'crosshair',
    addEdge: 'cell',
    delete: 'not-allowed',
  }

  // Écoute l'événement de coloration depuis RightPanel
  useEffect(() => {
    const COLOR_PALETTE = [
      '#2563EB', '#16A34A', '#DC2626', '#D97706',
      '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
    ]

    const handler = (e: Event) => {
      const cy = cyRef.current
      if (!cy) return
      const { colorMap } = (e as CustomEvent).detail as { colorMap: Record<string, number> }
      Object.entries(colorMap).forEach(([nodeId, colorIdx]) => {
        cy.getElementById(nodeId).style({
          'background-color': COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
          'color': '#ffffff',
          'border-color': COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
        })
      })
    }

    window.addEventListener('graphlab:coloring', handler)
    return () => window.removeEventListener('graphlab:coloring', handler)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: cursorMap[activeTool] }}
    />
  )
}