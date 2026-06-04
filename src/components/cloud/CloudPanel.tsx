import { useEffect, useState } from 'react'
import { useCloudStore } from '@/store/cloudStore'
import { useGraphStore } from '@/store/graphStore'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Save, Cloud, Trash2, Share2, Check } from 'lucide-react'
import type { Graph } from '@/types/graph'

export default function CloudPanel() {
  const { graphs, saving, loading, fetchGraphs,
          saveGraph, deleteGraph, togglePublic } = useCloudStore()
  const { graph, loadGraph } = useGraphStore()
  const { user } = useAuthStore()
  const { dark } = useThemeStore()

  const [name, setName]         = useState('Mon graphe')
  const [desc, setDesc]         = useState('')
  const [saved, setSaved]       = useState(false)
  const [copied, setCopied]     = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchGraphs()
  }, [user, fetchGraphs])

  async function handleSave() {
    const result = await saveGraph(name, desc, graph)
    if (result) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  function handleLoad(data: object) {
    loadGraph(data as Graph)
  }

  function handleCopyLink(token: string) {
    const url = `${window.location.origin}?share=${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const bg      = dark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'
  const inputCl = dark
    ? 'w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500'
    : 'w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-400'
  const cardCl  = dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'

  if (!user) {
    return (
      <div className={`flex h-full flex-col items-center justify-center gap-4 p-6 ${bg}`}>
        <div className="text-4xl">☁️</div>
        <p className={`text-center text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Connecte-toi pour sauvegarder tes graphes dans le cloud et les partager.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col overflow-hidden ${bg}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3 flex-shrink-0"
        style={{ borderColor: dark ? '#334155' : '#E2E8F0', background: '#1A3C6B' }}>
        <div>
          <span className="text-base font-semibold text-white">Mes graphes</span>
          <span className="ml-2 text-xs text-blue-300">{graphs.length} sauvegardé(s)</span>
        </div>
        <Cloud size={18} className="text-blue-300" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Sauvegarder le graphe actuel */}
        <div className={`rounded-xl border p-4 ${cardCl}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${
            dark ? 'text-slate-400' : 'text-slate-400'
          }`}>
            Sauvegarder le graphe actuel
          </p>
          <div className="space-y-2">
            <input
              className={inputCl}
              placeholder="Nom du graphe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={inputCl}
              placeholder="Description (optionnel)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={saving || !graph.nodes.length}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: saved ? '#16A34A' : '#2563EB' }}
            >
              {saved ? <><Check size={13}/> Sauvegardé !</> : saving ? 'Sauvegarde…' : <><Save size={13}/> Sauvegarder dans le cloud</>}
            </button>
          </div>
        </div>

        {/* Liste des graphes sauvegardés */}
        {loading ? (
          <p className={`text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Chargement…
          </p>
        ) : graphs.length === 0 ? (
          <p className={`text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Aucun graphe sauvegardé.
          </p>
        ) : (
          <div className="space-y-2">
            <p className={`text-xs font-medium uppercase tracking-wide ${
              dark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Graphes sauvegardés
            </p>
            {graphs.map((g) => (
              <div key={g.id} className={`rounded-xl border p-3 ${cardCl}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {g.name}
                    </p>
                    {g.description && (
                      <p className={`text-xs truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {g.description}
                      </p>
                    )}
                    <p className={`text-xs mt-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>
                      {new Date(g.updated_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {/* Charger */}
                  <button
                    onClick={() => handleLoad(g.data)}
                    className="flex-1 rounded-lg border py-1 text-xs font-medium transition-colors"
                    style={{ background: '#2563EB', color: 'white', border: 'none' }}
                  >
                    Charger
                  </button>

                  {/* Partager */}
                  <button
                    onClick={async () => {
                      await togglePublic(g.id, !g.is_public)
                      if (!g.is_public) handleCopyLink(g.share_token)
                    }}
                    className={`rounded-lg border px-2 py-1 text-xs transition-colors ${
                      g.is_public
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : dark ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title={g.is_public ? 'Copier le lien' : 'Rendre public'}
                  >
                    {copied === g.share_token ? <Check size={12}/> : <Share2 size={12}/>}
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => deleteGraph(g.id)}
                    className={`rounded-lg border px-2 py-1 text-xs transition-colors ${
                      dark ? 'border-slate-700 text-red-400 hover:bg-slate-700' : 'border-slate-200 text-red-400 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>

                {/* Lien de partage */}
                {g.is_public && (
                  <div className={`mt-2 rounded-lg p-2 text-xs break-all cursor-pointer ${
                    dark ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-700'
                  }`}
                    onClick={() => handleCopyLink(g.share_token)}>
                    {copied === g.share_token ? '✓ Lien copié !' : `${window.location.origin}?share=${g.share_token}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}