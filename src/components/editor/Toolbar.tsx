import { useGraphStore } from '@/store/graphStore'
import { useThemeStore } from '@/store/themeStore'
import type { Tool } from '@/types/graph'
import {
  MousePointer2, PlusCircle, Spline, Trash2,
  Undo2, Redo2, ToggleLeft, ToggleRight, RefreshCw,
} from 'lucide-react'

interface ToolBtnProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  danger?: boolean
}

function ToolBtn({ icon, label, active, onClick, danger }: ToolBtnProps) {
  const { dark } = useThemeStore()
  return (
    <button onClick={onClick} title={label}
      className={[
        'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
        active
          ? 'bg-blue-100 text-blue-700'
          : danger
          ? dark
            ? 'text-slate-500 hover:bg-red-900/30 hover:text-red-400'
            : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
          : dark
          ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
      ].join(' ')}>
      {icon}
      <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

export default function Toolbar() {
  const { activeTool, setActiveTool, graph,
    setDirected, setWeighted, undo, redo, clearGraph,
    history, future } = useGraphStore()
  const { dark } = useThemeStore()

  return (
    <div className={`flex w-14 flex-col items-center gap-1 py-3 border-r ${
      dark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
    }`}>
      {([ ['select','Sélection (S)', MousePointer2],
          ['addNode','Ajouter sommet (N)', PlusCircle],
          ['addEdge','Ajouter arête (A)', Spline],
          ['delete','Supprimer (D)', Trash2],
      ] as [Tool, string, React.ElementType][]).map(([tool, lbl, Icon]) => (
        <ToolBtn key={tool}
          icon={<Icon size={18} />} label={lbl}
          active={activeTool === tool}
          onClick={() => setActiveTool(tool)}
          danger={tool === 'delete'} />
      ))}

      <div className={`my-1 w-8 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`} />

      <ToolBtn icon={<Undo2 size={18}/>} label="Annuler (Ctrl+Z)"
        onClick={undo} danger={!history.length} />
      <ToolBtn icon={<Redo2 size={18}/>} label="Refaire (Ctrl+Y)"
        onClick={redo} danger={!future.length} />

      <div className={`my-1 w-8 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`} />

      <ToolBtn
        icon={graph.directed ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
        label={`Orienté : ${graph.directed ? 'Oui' : 'Non'}`}
        active={graph.directed} onClick={() => setDirected(!graph.directed)} />
      <ToolBtn
        icon={graph.weighted ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
        label={`Pondéré : ${graph.weighted ? 'Oui' : 'Non'}`}
        active={graph.weighted} onClick={() => setWeighted(!graph.weighted)} />

      <div className={`my-1 w-8 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`} />

      <ToolBtn icon={<RefreshCw size={18}/>} label="Réinitialiser"
        onClick={clearGraph} danger />
    </div>
  )
}