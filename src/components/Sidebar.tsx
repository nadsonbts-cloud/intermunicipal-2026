import Link from 'next/link';
import { Trophy, CalendarDays, BarChart3, Users, PlayCircle, Lock } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
          <Trophy size={28} />
          Intermunicipal
        </h1>
        <p className="text-slate-400 text-sm mt-1">2026 - Edição Oficial</p>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
          <PlayCircle size={20} />
          Jogos ao Vivo
        </Link>
        <Link href="/classificacao" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <BarChart3 size={20} />
          Classificação
        </Link>
        <Link href="/simulador" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <CalendarDays size={20} />
          Simulador (Mata-Mata)
        </Link>
        <Link href="/artilharia" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Users size={20} />
          Artilharia
        </Link>
      </nav>

      <div className="px-4 mb-4">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all">
          <Lock size={18} />
          <span className="text-sm font-bold">Painel Admin</span>
        </Link>
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 uppercase font-semibold">Realização</p>
          <p className="text-sm font-bold text-white mt-1">FBF</p>
        </div>
      </div>
    </aside>
  );
}
