import type { Graph } from '@/types/graph'

export interface GraphExample {
  id: string
  name: string
  description: string
  category: string
  graph: Graph
}

function node(id: string, label: string, x: number, y: number) {
  return { id, label, x, y }
}
function edge(id: string, source: string, target: string, weight?: number) {
  return { id, source, target, weight }
}

export const GRAPH_EXAMPLES: GraphExample[] = [
  {
    id: 'konigsberg',
    name: 'Ponts de Königsberg',
    description: 'Le graphe original d\'Euler (1736) — aucun circuit eulérien possible.',
    category: 'Historique',
    graph: {
      directed: false, weighted: false,
      nodes: [node('a','A',100,150), node('b','B',250,80), node('c','C',250,220), node('d','D',400,150)],
      edges: [
        edge('e1','a','b'), edge('e2','a','b'), edge('e3','a','c'),
        edge('e4','a','c'), edge('e5','b','d'), edge('e6','c','d'), edge('e7','b','c'),
      ],
    },
  },
  {
    id: 'k5',
    name: 'Graphe complet K₅',
    description: 'Graphe complet à 5 sommets — non planaire (Kuratowski).',
    category: 'Théorie',
    graph: {
      directed: false, weighted: false,
      nodes: [
        node('a','A',250,60), node('b','B',420,185), node('c','C',350,360),
        node('d','D',150,360), node('e','E',80,185),
      ],
      edges: [
        edge('e1','a','b'), edge('e2','a','c'), edge('e3','a','d'), edge('e4','a','e'),
        edge('e5','b','c'), edge('e6','b','d'), edge('e7','b','e'),
        edge('e8','c','d'), edge('e9','c','e'), edge('e10','d','e'),
      ],
    },
  },
  {
    id: 'petersen',
    name: 'Graphe de Petersen',
    description: 'Graphe célèbre — 3-régulier, non hamiltonien, non planaire.',
    category: 'Théorie',
    graph: {
      directed: false, weighted: false,
      nodes: [
        node('a','A',250,40),  node('b','B',430,170), node('c','C',360,370),
        node('d','D',140,370), node('e','E',70,170),
        node('f','F',250,140), node('g','G',340,200), node('h','H',300,310),
        node('i','I',200,310), node('j','J',160,200),
      ],
      edges: [
        edge('e1','a','b'), edge('e2','b','c'), edge('e3','c','d'), edge('e4','d','e'), edge('e5','e','a'),
        edge('e6','f','h'), edge('e7','h','j'), edge('e8','j','g'), edge('e9','g','i'), edge('e10','i','f'),
        edge('e11','a','f'), edge('e12','b','g'), edge('e13','c','h'), edge('e14','d','i'), edge('e15','e','j'),
      ],
    },
  },
  {
    id: 'dijkstra-example',
    name: 'Exemple Dijkstra',
    description: 'Graphe pondéré classique pour tester Dijkstra.',
    category: 'Algorithmes',
    graph: {
      directed: false, weighted: true,
      nodes: [
        node('a','A',80,150),  node('b','B',220,60),  node('c','C',380,60),
        node('d','D',220,240), node('e','E',380,240), node('f','F',500,150),
      ],
      edges: [
        edge('e1','a','b',4), edge('e2','a','d',2), edge('e3','b','c',5),
        edge('e4','b','d',1), edge('e5','c','f',3), edge('e6','d','e',8),
        edge('e7','e','f',2), edge('e8','b','e',6), edge('e9','c','e',7),
      ],
    },
  },
  {
    id: 'eulerian',
    name: 'Circuit Eulérien',
    description: 'Tous les sommets ont un degré pair — circuit eulérien possible.',
    category: 'Euler',
    graph: {
      directed: false, weighted: false,
      nodes: [
        node('a','A',150,100), node('b','B',350,100),
        node('c','C',400,250), node('d','D',250,350), node('e','E',100,250),
      ],
      edges: [
        edge('e1','a','b'), edge('e2','b','c'), edge('e3','c','d'),
        edge('e4','d','e'), edge('e5','e','a'), edge('e6','a','c'),
        edge('e7','b','d'), edge('e8','c','e'),
      ],
    },
  },
  {
    id: 'mst-example',
    name: 'Arbre couvrant minimal',
    description: 'Graphe pondéré pour tester Prim et Kruskal.',
    category: 'Algorithmes',
    graph: {
      directed: false, weighted: true,
      nodes: [
        node('a','A',100,100), node('b','B',300,60),  node('c','C',460,160),
        node('d','D',360,300), node('e','E',160,300), node('f','F',280,200),
      ],
      edges: [
        edge('e1','a','b',6), edge('e2','a','e',5), edge('e3','b','c',4),
        edge('e4','b','f',2), edge('e5','c','d',3), edge('e6','c','f',7),
        edge('e7','d','e',8), edge('e8','d','f',1), edge('e9','e','f',9),
      ],
    },
  },
  {
    id: 'directed-example',
    name: 'Graphe orienté pondéré',
    description: 'Graphe orienté avec poids — pour Bellman-Ford.',
    category: 'Algorithmes',
    graph: {
      directed: true, weighted: true,
      nodes: [
        node('a','S',100,180), node('b','A',260,80),  node('c','B',260,280),
        node('d','C',420,80),  node('e','D',420,280), node('f','T',560,180),
      ],
      edges: [
        edge('e1','a','b',6), edge('e2','a','c',7),  edge('e3','b','d',5),
        edge('e4','b','e',-4), edge('e5','c','b',8), edge('e6','c','e',9),
        edge('e7','d','f',3), edge('e8','e','d',7),  edge('e9','e','f',2),
      ],
    },
  },
  {
    id: 'coloring-example',
    name: 'Exemple coloration',
    description: 'Graphe nécessitant 3 couleurs — nombre chromatique χ(G) = 3.',
    category: 'Coloration',
    graph: {
      directed: false, weighted: false,
      nodes: [
        node('a','A',160,80),  node('b','B',340,80),
        node('c','C',420,240), node('d','D',250,340), node('e','E',80,240),
      ],
      edges: [
        edge('e1','a','b'), edge('e2','b','c'), edge('e3','c','d'),
        edge('e4','d','e'), edge('e5','e','a'), edge('e6','a','c'), edge('e7','b','d'),
      ],
    },
  },
]