import type { StylesheetStyle } from 'cytoscape'

export const cytoscapeStyles: StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#ffffff',
      'border-color': '#2563EB',
      'border-width': 2,
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'color': '#1A3C6B',
      'font-size': 13,
      'font-weight': 600,
      'width': 40,
      'height': 40,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#F59E0B',
      'border-width': 3,
      'background-color': '#FFFBEB',
    },
  },
  {
    selector: 'node.source-selected',
    style: {
      'border-color': '#F59E0B',
      'border-width': 3,
      'background-color': '#FEF3C7',
    },
  },
  {
    selector: 'node.highlighted',
    style: {
      'background-color': '#DBEAFE',
      'border-color': '#2563EB',
      'border-width': 3,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#94A3B8',
      'target-arrow-color': '#94A3B8',
      'target-arrow-shape': 'none',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': 11,
      'color': '#64748B',
      'text-background-color': '#ffffff',
      'text-background-opacity': 1,
      'text-background-padding': '2px',
    },
  },
  {
    selector: 'edge.directed',
    style: {
      'target-arrow-shape': 'triangle',
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#2563EB',
      'target-arrow-color': '#2563EB',
      'width': 3,
    },
  },
  {
    selector: 'edge.mst',
    style: {
      'line-color': '#16A34A',
      'target-arrow-color': '#16A34A',
      'width': 3,
    },
  },
]