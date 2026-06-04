import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

interface Props {
  x: number
  y: number
  initialValue: number
  edgeLabel?: string
  onConfirm: (value: number) => void
  onClose: () => void
}

export default function WeightPopover({
  x, y, initialValue, edgeLabel, onConfirm, onClose,
}: Props) {
  const [value, setValue] = useState(String(initialValue))
  const inputRef = useRef<HTMLInputElement>(null)
  const { dark } = useThemeStore()

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function confirm() {
    const num = parseFloat(value)
    if (!isNaN(num)) { onConfirm(num); onClose() }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirm()
    if (e.key === 'Escape') onClose()
  }

  const POPOVER_W = 180
  const POPOVER_H = 110
  const px = Math.min(Math.max(x - POPOVER_W / 2, 8), window.innerWidth - POPOVER_W - 8)
  const py = y - POPOVER_H - 12 < 8 ? y + 20 : y - POPOVER_H - 12

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`fixed z-50 rounded-xl shadow-2xl border overflow-hidden ${
          dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}
        style={{ left: px, top: py, width: POPOVER_W, animation: 'popIn 0.15s ease-out' }}
      >
        {/* Header */}
        <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#1A3C6B' }}>
          <span className="text-xs font-medium text-white">
            Poids {edgeLabel ? `— ${edgeLabel}` : ''}
          </span>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Input + boutons */}
        <div className="p-3 flex flex-col gap-2">
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            className={`w-full rounded-lg border px-3 py-1.5 text-sm font-medium text-center
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              dark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
            placeholder="ex : 4.5"
            step="any"
          />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium border transition-colors ${
                dark
                  ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={isNaN(parseFloat(value))}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:opacity-90"
              style={{ background: '#2563EB' }}
            >
              <Check size={12} /> OK
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  )
}