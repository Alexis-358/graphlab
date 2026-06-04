import { useEffect, useRef, useCallback, useState } from 'react'
import cytoscape, { type Core } from 'cytoscape'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import { cytoscapeStyles } from './cytoscapeStyles'
import { uid, nextLabel } from '@/utils/graphHelpers'
import WeightPopover from './WeightPopover'

const COLOR_PALETTE = [
  '#2563EB', '#16A34A', '#DC2626', '#D97706',
  '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
]

export default function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef        = useRef<Core | null>(null)
  const { dark }     = useThemeStore()

  const {
    graph, activeTool, edgeSourceId,
    addNode, addEdge, removeNode, removeEdge,
    moveNode, setEdgeSourceId, setSelectedId,
    algoResult, currentStep,
  } = useGraphStore()

  // État du popover de modification de poids
  const [weightPopover, setWeightPopover] = useState<{
    x: number
    y: number
    edgeId: string
    initialValue: number
    edgeLabel: string
  } | null>(null)

  // ── 1. Initialisation Cytoscape (une seule fois) ─────────────────────
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

    // Expose cy pour l'export PNG
    ;(window as Window & { __cy?: cytoscape.Core }).__cy = cyRef.current

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [])

  // ── 2. Synchronisation store → Cytoscape ────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    // Ajouter / mettre à jour les nœuds
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

    // Supprimer les nœuds retirés du store
    cy.nodes().forEach((n) => {
      if (!graph.nodes.find((node) => node.id === n.id())) {
        cy.remove(n)
      }
    })

    // Ajouter / mettre à jour les arêtes
    graph.edges.forEach((edge) => {
      const edgeLabel = graph.weighted && edge.weight != null
        ? String(edge.weight)
        : ''

      if (!cy.getElementById(edge.id).length) {
        cy.add({
          group: 'edges',
          data: {
            id:     edge.id,
            source: edge.source,
            target: edge.target,
            label:  edgeLabel,
          },
        })
      }

      const el = cy.getElementById(edge.id)
      el.data('label', edgeLabel)
      if (graph.directed) el.addClass('directed')
      else                el.removeClass('directed')
    })

    // Supprimer les arêtes retirées du store
    cy.edges().forEach((e) => {
      if (!graph.edges.find((edge) => edge.id === e.id())) {
        cy.remove(e)
      }
    })
  }, [graph])

  // ── 3. Surlignage des étapes d'algorithme ───────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().removeClass('highlighted mst')
    if (!algoResult) return

    const step = algoResult.steps[currentStep]
    if (!step) return

    step.highlightedEdges.forEach((id) =>
      cy.getElementById(id).addClass('highlighted')
    )
    step.highlightedNodes.forEach((id) =>
      cy.getElementById(id).addClass('highlighted')
    )
  }, [algoResult, currentStep])

  // ── 4. Thème clair / sombre ─────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.style([
      ...cytoscapeStyles,
      {
        selector: 'node',
        style: {
          'background-color': dark ? '#1E293B' : '#ffffff',
          'border-color':     dark ? '#3B82F6' : '#2563EB',
          'color':            dark ? '#93C5FD' : '#1A3C6B',
        } as cytoscape.Css.Node,
      },
      {
        selector: 'edge',
        style: {
          'line-color':           dark ? '#334155' : '#94A3B8',
          'target-arrow-color':   dark ? '#334155' : '#94A3B8',
          'color':                dark ? '#64748B' : '#64748B',
          'text-background-color':dark ? '#0F172A' : '#ffffff',
        } as cytoscape.Css.Edge,
      },
    ])
  }, [dark])

  // ── 5. Coloration des nœuds (event custom depuis RightPanel) ────────
  useEffect(() => {
    const handler = (e: Event) => {
      const cy = cyRef.current
      if (!cy) return

      const { colorMap } = (e as CustomEvent).detail as {
        colorMap: Record<string, number>
      }

      // Réinitialise si colorMap vide (effacement résultat)
      if (!Object.keys(colorMap).length) {
        cy.nodes().forEach((n) => {
          n.style({
            'background-color': dark ? '#1E293B' : '#ffffff',
            'color':            dark ? '#93C5FD' : '#1A3C6B',
            'border-color':     dark ? '#3B82F6' : '#2563EB',
          })
        })
        return
      }

      Object.entries(colorMap).forEach(([nodeId, colorIdx]) => {
        cy.getElementById(nodeId).style({
          'background-color': COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
          'color':            '#ffffff',
          'border-color':     COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
        })
      })
    }

    window.addEventListener('graphlab:coloring', handler)
    return () => window.removeEventListener('graphlab:coloring', handler)
  }, [dark])

  // ── 6. Gestion des événements Cytoscape ─────────────────────────────
  const handleToolRef   = useRef(activeTool)
  const edgeSourceRef   = useRef(edgeSourceId)
  handleToolRef.current = activeTool
  edgeSourceRef.current = edgeSourceId

  const setupEvents = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.removeAllListeners()

    // Clic sur le fond → ajouter un sommet
    cy.on('tap', (e) => {
      if (e.target !== cy) return
      if (handleToolRef.current !== 'addNode') return

      const pos    = e.position
      const labels = useGraphStore.getState().graph.nodes.map((n) => n.label)
      addNode({
        id:    uid('n'),
        label: nextLabel(labels),
        x:     pos.x,
        y:     pos.y,
      })
    })

    // Clic sur un nœud
    cy.on('tap', 'node', (e) => {
      const nodeId = e.target.id() as string
      const tool   = handleToolRef.current

      if (tool === 'delete') {
        removeNode(nodeId)
        setEdgeSourceId(null)
        return
      }

      if (tool === 'addEdge') {
        const srcId = edgeSourceRef.current
        if (!srcId) {
          setEdgeSourceId(nodeId)
          cy.getElementById(nodeId).addClass('source-selected')
        } else if (srcId !== nodeId) {
          cy.getElementById(srcId).removeClass('source-selected')
          const { weighted } = useGraphStore.getState().graph
          addEdge({
            id:     uid('e'),
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

    // Clic sur une arête → supprimer si outil delete
    cy.on('tap', 'edge', (e) => {
      if (handleToolRef.current === 'delete') {
        removeEdge(e.target.id() as string)
      }
    })

    // Double-clic sur une arête → popover de modification du poids
    cy.on('dblclick', 'edge', (e) => {
      const { weighted, nodes, edges } = useGraphStore.getState().graph
      if (!weighted) return

      const edgeId   = e.target.id() as string
      const edge     = edges.find((ed) => ed.id === edgeId)

      // Position rendue (pixels écran) du clic
      const rendPos  = e.renderedPosition as { x: number; y: number }

      // Label "A → B" pour l'en-tête du popover
      const src      = nodes.find((n) => n.id === edge?.source)?.label ?? ''
      const tgt      = nodes.find((n) => n.id === edge?.target)?.label ?? ''

      setWeightPopover({
        x:            rendPos.x,
        y:            rendPos.y,
        edgeId,
        initialValue: edge?.weight ?? 1,
        edgeLabel:    src && tgt ? `${src} → ${tgt}` : '',
      })
    })

    // Drag d'un nœud → mise à jour de la position dans le store
    cy.on('dragfree', 'node', (e) => {
      const pos = e.target.position()
      moveNode(e.target.id() as string, pos.x, pos.y)
    })

    // Clic sur le fond → désélectionner
    cy.on('tap', (e) => {
      if (e.target !== cy) return
      setSelectedId(null)
      if (edgeSourceRef.current) {
        cy.getElementById(edgeSourceRef.current).removeClass('source-selected')
        setEdgeSourceId(null)
      }
    })
  }, [
    addNode, addEdge, removeNode, removeEdge,
    moveNode, setEdgeSourceId, setSelectedId,
  ])

  useEffect(() => {
    setupEvents()
  }, [setupEvents])

  // ── Curseur selon l'outil actif ──────────────────────────────────────
  const cursorMap: Record<string, string> = {
    select:  'default',
    addNode: 'crosshair',
    addEdge: 'cell',
    delete:  'not-allowed',
  }

  // ── Rendu ────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas Cytoscape */}
      <div
        ref={containerRef}
        style={{
          width:  '100%',
          height: '100%',
          cursor: cursorMap[activeTool] ?? 'default',
        }}
      />

      {/* Popover de modification du poids */}
      {weightPopover && (
        <WeightPopover
          x={weightPopover.x}
          y={weightPopover.y}
          initialValue={weightPopover.initialValue}
          edgeLabel={weightPopover.edgeLabel}
          onConfirm={(val) => {
            useGraphStore.getState().updateEdgeWeight(weightPopover.edgeId, val)
          }}
          onClose={() => setWeightPopover(null)}
        />
      )}
    </div>
  )
}