import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react'

export default function AuthButton() {
  const { user, signInWithGoogle, signOut } = useAuthStore()
  const { dark } = useThemeStore()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogIn size={13} />
        Connexion
      </button>
    )
  }

  const avatar = user.user_metadata?.avatar_url
  const name   = user.user_metadata?.full_name ?? user.email

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <User size={11} className="text-white" />
          </div>
        )}
        <span className="max-w-[100px] truncate">{name}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-9 z-50 w-52 rounded-xl border shadow-xl ${
            dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {/* Infos utilisateur */}
            <div className={`px-4 py-3 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
              <p className={`text-xs font-medium truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                {name}
              </p>
              <p className={`text-xs truncate mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {user.email}
              </p>
            </div>
            {/* Déconnexion */}
            <div className="p-1">
              <button
                onClick={() => { signOut(); setOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                  dark ? 'text-red-400 hover:bg-slate-800' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut size={13} />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}