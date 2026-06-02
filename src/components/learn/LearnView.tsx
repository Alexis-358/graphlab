import { useState } from 'react'
import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import { GRAPH_EXAMPLES } from '@/lib/examples'

interface Lesson {
  id: string
  icon: string
  title: string
  category: string
  duration: string
  theory: { title: string; content: string; formula?: string }[]
  quiz: { question: string; options: string[]; correct: number; explanation: string }
  exampleId?: string
}

const LESSONS: Lesson[] = [
  {
    id: 'intro',
    icon: '🔷',
    title: 'Introduction aux graphes',
    category: 'Fondamental',
    duration: '5 min',
    theory: [
      {
        title: 'Définition',
        content: 'Un graphe G = (V, E) est une structure composée d\'un ensemble de sommets V et d\'un ensemble d\'arêtes E reliant des paires de sommets. Les graphes modélisent des réseaux routiers, sociaux, circuits électriques, dépendances de tâches…',
      },
      {
        title: 'Types de graphes',
        content: 'Orienté : les arêtes ont une direction (source → cible). Non orienté : les arêtes sont bidirectionnelles. Pondéré : chaque arête a un poids (coût, distance). Simple : au plus une arête entre deux sommets.',
      },
      {
        title: 'Représentations',
        content: 'Liste d\'adjacence : pour chaque sommet, la liste de ses voisins. Efficace pour les graphes creux. Matrice d\'adjacence : tableau n×n où M[i][j]=1 si arête entre i et j. Efficace pour les graphes denses.',
      },
    ],
    quiz: {
      question: 'Un graphe avec 5 sommets et aucune arête est appelé :',
      options: ['Graphe complet', 'Graphe vide', 'Graphe connexe', 'Arbre'],
      correct: 1,
      explanation: 'Un graphe sans aucune arête est un graphe vide (ou nul). Il possède 5 composantes connexes isolées.',
    },
    exampleId: 'petersen',
  },
  {
    id: 'degrees',
    icon: '📐',
    title: 'Degrés & Lemme des poignées de main',
    category: 'Fondamental',
    duration: '4 min',
    theory: [
      {
        title: 'Degré d\'un sommet',
        content: 'Le degré deg(v) d\'un sommet v est le nombre d\'arêtes incidentes à v. Dans un graphe orienté, on distingue le degré entrant (in-degree) et le degré sortant (out-degree).',
      },
      {
        title: 'Lemme des poignées de main',
        content: 'Dans tout graphe non orienté, la somme de tous les degrés est égale au double du nombre d\'arêtes. Chaque arête contribue 1 au degré de chacune de ses deux extrémités.',
        formula: 'Σ deg(v) = 2 |E|',
      },
      {
        title: 'Corollaire important',
        content: 'Dans tout graphe, le nombre de sommets de degré impair est toujours pair. Ce résultat est fondamental pour la théorie des graphes eulériens.',
      },
    ],
    quiz: {
      question: 'Un graphe a 6 sommets. La somme de leurs degrés vaut 14. Combien d\'arêtes possède-t-il ?',
      options: ['6', '7', '14', '28'],
      correct: 1,
      explanation: 'Par le lemme : Σdeg = 2|E|, donc |E| = 14/2 = 7 arêtes.',
    },
    exampleId: 'eulerian',
  },
  {
    id: 'connectivity',
    icon: '🔗',
    title: 'Connexité',
    category: 'Fondamental',
    duration: '5 min',
    theory: [
      {
        title: 'Graphe connexe',
        content: 'Un graphe non orienté est connexe si pour toute paire de sommets (u,v), il existe un chemin de u à v. On appelle composante connexe un sous-graphe connexe maximal.',
      },
      {
        title: 'Algorithme de détection',
        content: 'Un parcours en largeur (BFS) ou profondeur (DFS) depuis n\'importe quel sommet suffit. Si tous les sommets sont visités → graphe connexe. Complexité : O(V+E).',
      },
      {
        title: 'Connexité forte',
        content: 'Pour les graphes orientés, on parle de connexité forte : pour toute paire (u,v), il existe un chemin de u vers v ET de v vers u. L\'algorithme de Kosaraju détecte les composantes fortement connexes.',
      },
    ],
    quiz: {
      question: 'Un graphe a 4 sommets et 2 arêtes formant 2 paires distinctes. Il est :',
      options: ['Connexe', 'Non connexe — 2 composantes', 'Non connexe — 4 composantes', 'Eulérien'],
      correct: 1,
      explanation: '2 arêtes reliant 2 paires distinctes forment 2 composantes connexes de 2 sommets chacune.',
    },
    exampleId: 'konigsberg',
  },
  {
    id: 'euler',
    icon: '🔄',
    title: 'Graphes Eulériens',
    category: 'Propriétés',
    duration: '6 min',
    theory: [
      {
        title: 'Définitions',
        content: 'Un chemin eulérien passe par chaque arête exactement une fois. Un circuit eulérien est un chemin eulérien qui revient à son point de départ. Le problème date de 1736 (Euler, ponts de Königsberg).',
      },
      {
        title: 'Conditions nécessaires et suffisantes',
        content: 'Circuit eulérien ↔ graphe connexe ET tous les degrés sont pairs. Chemin eulérien ↔ graphe connexe ET exactement 2 sommets ont un degré impair (ce sont le départ et l\'arrivée).',
        formula: 'Circuit : ∀v, deg(v) pair   |   Chemin : |{v : deg(v) impair}| = 2',
      },
      {
        title: 'Algorithme de Hierholzer',
        content: 'Pour construire le chemin/circuit : partir d\'un sommet, avancer en marquant les arêtes utilisées. Quand on est bloqué, insérer le circuit dans le chemin principal. Complexité O(E).',
      },
    ],
    quiz: {
      question: 'Un graphe a 5 sommets avec degrés 2, 3, 2, 3, 2. Quel type eulérien ?',
      options: ['Circuit eulérien', 'Chemin eulérien', 'Ni l\'un ni l\'autre', 'Hamiltonien'],
      correct: 1,
      explanation: 'Exactement 2 sommets de degré impair (3 et 3) → chemin eulérien possible, pas un circuit.',
    },
    exampleId: 'konigsberg',
  },
  {
    id: 'dijkstra',
    icon: '🗺️',
    title: 'Algorithme de Dijkstra',
    category: 'Algorithmes',
    duration: '7 min',
    theory: [
      {
        title: 'Problème résolu',
        content: 'Dijkstra calcule le plus court chemin depuis un sommet source vers tous les autres sommets dans un graphe à poids positifs ou nuls. C\'est un algorithme glouton.',
      },
      {
        title: 'Principe',
        content: 'À chaque étape, choisir le sommet non visité avec la plus petite distance provisoire. Puis "relaxer" ses voisins : si dist[u] + poids(u,v) < dist[v], mettre à jour dist[v].',
        formula: 'Si dist[u] + w(u,v) < dist[v]  →  dist[v] = dist[u] + w(u,v)',
      },
      {
        title: 'Complexité & Limitations',
        content: 'O(V²) avec tableau simple, O((V+E) log V) avec file de priorité. Interdit avec des poids négatifs — utiliser Bellman-Ford dans ce cas.',
      },
    ],
    quiz: {
      question: 'Dijkstra peut-il fonctionner avec des poids d\'arêtes négatifs ?',
      options: ['Oui toujours', 'Oui si connexe', 'Non jamais', 'Oui si pas de cycle'],
      correct: 2,
      explanation: 'Non. Dijkstra suppose qu\'une fois un sommet visité, sa distance est optimale. Un poids négatif peut invalider cette hypothèse.',
    },
    exampleId: 'dijkstra-example',
  },
  {
    id: 'mst',
    icon: '🌲',
    title: 'Arbres couvrants minimaux',
    category: 'Algorithmes',
    duration: '6 min',
    theory: [
      {
        title: 'Définition',
        content: 'Un arbre couvrant d\'un graphe connexe pondéré est un sous-graphe arbre qui inclut tous les sommets. Le MST (Minimum Spanning Tree) est celui de poids total minimal.',
      },
      {
        title: 'Algorithme de Prim',
        content: 'Part d\'un sommet source. À chaque étape, ajoute l\'arête de poids minimal reliant l\'arbre courant à un nouveau sommet. Continue jusqu\'à inclure tous les sommets. O(E log V).',
      },
      {
        title: 'Algorithme de Kruskal',
        content: 'Trie toutes les arêtes par poids croissant. Ajoute chaque arête si elle ne crée pas de cycle (vérifié avec Union-Find). S\'arrête quand n-1 arêtes sont sélectionnées. O(E log E).',
        formula: 'MST a exactement n−1 arêtes pour n sommets',
      },
    ],
    quiz: {
      question: 'Un graphe connexe à 8 sommets. Son MST a combien d\'arêtes ?',
      options: ['6', '7', '8', '9'],
      correct: 1,
      explanation: 'Un arbre à n sommets a toujours exactement n−1 arêtes. Ici n=8, donc 7 arêtes.',
    },
    exampleId: 'mst-example',
  },
  {
    id: 'coloring',
    icon: '🎨',
    title: 'Coloration de graphes',
    category: 'Propriétés',
    duration: '5 min',
    theory: [
      {
        title: 'Définition',
        content: 'Une coloration propre attribue une couleur à chaque sommet de sorte que deux sommets adjacents aient toujours des couleurs différentes. Le nombre chromatique χ(G) est le minimum de couleurs nécessaires.',
      },
      {
        title: 'Algorithme glouton',
        content: 'Trier les sommets par degré décroissant. Pour chaque sommet, attribuer la plus petite couleur non utilisée par ses voisins. Simple mais ne garantit pas le nombre chromatique optimal.',
      },
      {
        title: 'Théorème des 4 couleurs',
        content: 'Tout graphe planaire peut être colorié avec au plus 4 couleurs. Démontré par Appel & Haken en 1976 — première preuve majeure assistée par ordinateur.',
        formula: 'χ(G) ≤ Δ(G) + 1   (Δ = degré maximum)',
      },
    ],
    quiz: {
      question: 'Quel est le nombre chromatique χ d\'un graphe complet K₄ ?',
      options: ['2', '3', '4', '5'],
      correct: 2,
      explanation: 'Dans K₄, chaque sommet est adjacent à tous les autres. Chaque sommet doit avoir une couleur unique → χ(K₄) = 4.',
    },
    exampleId: 'coloring-example',
  },
  {
    id: 'pert',
    icon: '📅',
    title: 'PERT & MPM — Ordonnancement',
    category: 'Avancé',
    duration: '8 min',
    theory: [
      {
        title: 'Principe',
        content: 'PERT (Program Evaluation and Review Technique) modélise un projet comme un graphe de tâches avec dépendances. Permet de calculer la durée minimale du projet et d\'identifier les tâches critiques.',
      },
      {
        title: 'Calculs fondamentaux',
        content: 'Date au plus tôt (forward pass) : propagation depuis le début. Date au plus tard (backward pass) : propagation depuis la fin. Marge totale = date au plus tard − date au plus tôt.',
        formula: 'Marge = Ls − Es = 0 ⟹ Tâche critique',
      },
      {
        title: 'Chemin critique',
        content: 'Séquence de tâches dont la marge totale est nulle. Tout retard sur une tâche critique retarde le projet entier. Sa longueur détermine la durée minimale du projet.',
      },
    ],
    quiz: {
      question: 'Une tâche a date au plus tôt = 8 et date au plus tard = 8. Sa marge est :',
      options: ['16', '8', '0', 'Indéfinie'],
      correct: 2,
      explanation: 'Marge = date au plus tard − date au plus tôt = 8 − 8 = 0. Cette tâche est critique.',
    },
  },
]

const CATEGORIES = ['Tous', 'Fondamental', 'Propriétés', 'Algorithmes', 'Avancé']

export default function LearnView() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [theoryStep, setTheoryStep]         = useState(0)
  const [quizAnswer, setQuizAnswer]         = useState<number | null>(null)
  const [completed, setCompleted]           = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState('Tous')
  const { loadGraph, setActiveTool }        = useGraphStore()
  const { dark } = useThemeStore()

  const filtered = LESSONS.filter(
    (l) => activeCategory === 'Tous' || l.category === activeCategory
  )

  function openLesson(lesson: Lesson) {
    setSelectedLesson(lesson)
    setTheoryStep(0)
    setQuizAnswer(null)
  }

  function closeLesson() {
    setSelectedLesson(null)
    setTheoryStep(0)
    setQuizAnswer(null)
  }

  function finishLesson() {
    if (!selectedLesson) return
    setCompleted((prev) => new Set([...prev, selectedLesson.id]))
    closeLesson()
  }

  function loadExample(lesson: Lesson) {
    const ex = GRAPH_EXAMPLES.find((e) => e.id === lesson.exampleId)
    if (ex) {
      loadGraph(ex.graph)
      setActiveTool('select')
    }
  }

  const bg       = dark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'
  const cardBg   = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const catBtnBase = 'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all'

  return (
    <div className={`flex h-full flex-col overflow-hidden ${bg}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3 flex-shrink-0"
        style={{ borderColor: dark ? '#334155' : '#E2E8F0', background: '#1A3C6B' }}>
        <div>
          <span className="text-base font-semibold text-white">Module Apprendre</span>
          <span className="ml-3 text-xs text-blue-300">
            {completed.size} / {LESSONS.length} cours terminés
          </span>
        </div>
        {/* Barre de progression */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${(completed.size / LESSONS.length) * 100}%` }}/>
          </div>
          <span className="text-xs text-blue-200">
            {Math.round((completed.size / LESSONS.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      {selectedLesson ? (
        /* ── Vue leçon ── */
        <LessonView
          lesson={selectedLesson}
          step={theoryStep}
          quizAnswer={quizAnswer}
          dark={dark}
          onStep={(s) => setTheoryStep(s)}
          onAnswer={(a) => setQuizAnswer(a)}
          onFinish={finishLesson}
          onClose={closeLesson}
          onLoadExample={() => loadExample(selectedLesson)}
        />
      ) : (
        /* ── Grille des cours ── */
        <div className="flex-1 overflow-y-auto p-5">
          {/* Filtres */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={[
                  catBtnBase,
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : dark
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50',
                ].join(' ')}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((lesson) => {
              const isDone = completed.has(lesson.id)
              return (
                <button key={lesson.id} onClick={() => openLesson(lesson)}
                  className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${cardBg} ${
                    isDone
                      ? dark ? 'border-green-800' : 'border-green-200'
                      : ''
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{lesson.icon}</span>
                    {isDone && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        ✓ Terminé
                      </span>
                    )}
                  </div>
                  <h3 className={`text-sm font-medium mb-1 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lesson.category === 'Fondamental'
                        ? 'bg-green-100 text-green-700'
                        : lesson.category === 'Algorithmes'
                        ? 'bg-blue-100 text-blue-700'
                        : lesson.category === 'Avancé'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {lesson.category}
                    </span>
                    <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {lesson.duration}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Composant de la vue leçon ── */
function LessonView({
  lesson, step, quizAnswer, dark,
  onStep, onAnswer, onFinish, onClose, onLoadExample,
}: {
  lesson: Lesson
  step: number
  quizAnswer: number | null
  dark: boolean
  onStep: (s: number) => void
  onAnswer: (a: number) => void
  onFinish: () => void
  onClose: () => void
  onLoadExample: () => void
}) {
  const totalSteps = lesson.theory.length + 1  // théorie + quiz
  const isQuiz     = step >= lesson.theory.length
  const theory     = lesson.theory[step]
  const quiz       = lesson.quiz
  const answered   = quizAnswer !== null

  const bgCard = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

  return (
    <div className="flex-1 overflow-y-auto p-5 max-w-2xl mx-auto w-full">

      {/* Navigation retour */}
      <button onClick={onClose}
        className={`mb-4 text-xs flex items-center gap-1 transition-colors ${
          dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
        }`}>
        ← Retour aux cours
      </button>

      {/* En-tête de la leçon */}
      <div className={`rounded-xl border p-5 mb-4 ${bgCard}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{lesson.icon}</span>
          <div>
            <h2 className={`text-base font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
              {lesson.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                lesson.category === 'Fondamental' ? 'bg-green-100 text-green-700' :
                lesson.category === 'Algorithmes' ? 'bg-blue-100 text-blue-700' :
                lesson.category === 'Avancé' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>{lesson.category}</span>
              <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {lesson.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Dots de progression */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
              i < step ? 'bg-green-500' :
              i === step ? 'bg-blue-500' :
              dark ? 'bg-slate-700' : 'bg-slate-200'
            }`}/>
          ))}
        </div>
        <p className={`text-xs mt-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {isQuiz ? 'Quiz final' : `Partie ${step + 1} / ${lesson.theory.length}`}
        </p>
      </div>

      {/* Contenu : théorie ou quiz */}
      {!isQuiz ? (
        <div className={`rounded-xl border p-5 mb-4 ${bgCard}`}>
          <h3 className={`text-sm font-semibold mb-3 ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
            {theory.title}
          </h3>
          <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            {theory.content}
          </p>
          {theory.formula && (
            <div className={`mt-3 rounded-lg p-3 font-mono text-sm ${
              dark ? 'bg-slate-900 text-blue-300' : 'bg-slate-50 text-blue-800'
            }`}>
              {theory.formula}
            </div>
          )}
          {lesson.exampleId && (
            <button onClick={onLoadExample}
              className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors">
              ↗ Charger l'exemple dans l'éditeur
            </button>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border p-5 mb-4 ${bgCard}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${
            dark ? 'text-slate-500' : 'text-slate-400'
          }`}>Quiz</p>
          <p className={`text-sm font-medium mb-4 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
            {quiz.question}
          </p>
          <div className="space-y-2">
            {quiz.options.map((opt, i) => {
              const isCorrect = i === quiz.correct
              const isChosen  = i === quizAnswer
              let cls = dark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              if (answered) {
                if (isCorrect) cls = 'border-green-500 bg-green-50 text-green-800'
                else if (isChosen) cls = 'border-red-400 bg-red-50 text-red-700'
                else cls = dark ? 'border-slate-700 text-slate-500 opacity-50' : 'border-slate-200 text-slate-400 opacity-50'
              }
              return (
                <button key={i} disabled={answered}
                  onClick={() => onAnswer(i)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${cls}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className={`mt-3 rounded-lg p-3 text-xs leading-relaxed ${
              quizAnswer === quiz.correct
                ? dark ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-green-50 text-green-800'
                : dark ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-red-50 text-red-700'
            }`}>
              {quizAnswer === quiz.correct ? '✓ Correct ! ' : '✗ Incorrect. '}
              {quiz.explanation}
            </div>
          )}
        </div>
      )}

      {/* Boutons navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => onStep(step - 1)}
            className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
              dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            ← Précédent
          </button>
        )}
        {isQuiz ? (
          <button
            onClick={onFinish}
            disabled={!answered}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: '#16A34A' }}>
            ✓ Terminer le cours
          </button>
        ) : (
          <button onClick={() => onStep(step + 1)}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: '#2563EB' }}>
            {step < lesson.theory.length - 1 ? 'Suivant →' : 'Passer au quiz →'}
          </button>
        )}
      </div>
    </div>
  )
}