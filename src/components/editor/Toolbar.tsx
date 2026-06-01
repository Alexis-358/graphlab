import { useGraphStore } from '@/store/graphStore'
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
  return (
    <button
      onClick={onClick}
      title={label}
      className={[
        'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
        active
          ? 'bg-blue-100 text-blue-700'
          : danger
          ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
      ].join(' ')}
    >
      {icon}
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

export default function Toolbar() {
  const {
    activeTool, setActiveTool,
    graph, setDirected, setWeighted,
    undo, redo, clearGraph,
    history, future,
  } = useGraphStore()

  const setTool = (tool: Tool) => setActiveTool(tool)

  return (
    <div className="flex w-14 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-3">
      <ToolBtn icon={<MousePointer2 size={18} />} label="Sélection (S)" active={activeTool === 'select'} onClick={() => setTool('select')} />
      <ToolBtn icon={<PlusCircle size={18} />} label="Ajouter sommet (N)" active={activeTool === 'addNode'} onClick={() => setTool('addNode')} />
      <ToolBtn icon={<Spline size={18} />} label="Ajouter arête (A)" active={activeTool === 'addEdge'} onClick={() => setTool('addEdge')} />
      <ToolBtn icon={<Trash2 size={18} />} label="Supprimer (D)" active={activeTool === 'delete'} onClick={() => setTool('delete')} danger />

      <div className="my-1 w-8 border-t border-slate-200" />

      <ToolBtn icon={<Undo2 size={18} />} label="Annuler (Ctrl+Z)" onClick={undo} active={false} danger={!history.length} />
      <ToolBtn icon={<Redo2 size={18} />} label="Refaire (Ctrl+Y)" onClick={redo} active={false} danger={!future.length} />

      <div className="my-1 w-8 border-t border-slate-200" />

      <ToolBtn
        icon={graph.directed ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        label={`Orienté : ${graph.directed ? 'Oui' : 'Non'}`}
        active={graph.directed}
        onClick={() => setDirected(!graph.directed)}
      />
      <ToolBtn
        icon={graph.weighted ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        label={`Pondéré : ${graph.weighted ? 'Oui' : 'Non'}`}
        active={graph.weighted}
        onClick={() => setWeighted(!graph.weighted)}
      />

      <div className="my-1 w-8 border-t border-slate-200" />

      <ToolBtn icon={<RefreshCw size={18} />} label="Réinitialiser" onClick={clearGraph} danger />
    </div>
  )
}