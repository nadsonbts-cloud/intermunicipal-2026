import Link from 'next/link';
import { Trophy, CalendarDays, BarChart3, Users, PlayCircle, Lock } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="bg-slate-900 border-slate-800 flex z-50
      fixed bottom-0 left-0 w-full h-16 border-t flex-row justify-around items-center px-2
      lg:w-64 lg:h-screen lg:border-r lg:border-t-0 lg:flex-col lg:justify-start lg:top-0 lg:px-0">
      
      <div className="hidden lg:block p-6">
        <h1 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
          <Trophy size={28} />
          Intermunicipal
        </h1>
        <p className="text-slate-400 text-sm mt-1">2026 - Edição Oficial</p>
      </div>

      <nav className="flex-1 flex flex-row lg:flex-col lg:px-4 lg:mt-6 gap-2 w-full justify-around lg:justify-start">
        <Link href="/" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-3 rounded-lg text-emerald-400 hover:bg-slate-800 transition-colors">
          <PlayCircle size={20} />
          <span className="text-[10px] lg:text-base font-medium">Jogos</span>
        </Link>
        <Link href="/classificacao" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <BarChart3 size={20} />
          <span className="text-[10px] lg:text-base font-medium">Tabela</span>
        </Link>
        <Link href="/simulador" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <CalendarDays size={20} />
          <span className="text-[10px] lg:text-base font-medium">Simular</span>
        </Link>
        <Link href="/artilharia" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Users size={20} />
          <span className="text-[10px] lg:text-base font-medium">Gols</span>
        </Link>
      </nav>

      <div className="hidden lg:block px-4 mb-4 w-full">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all">
          <Lock size={18} />
          <span className="text-sm font-bold">Painel Admin</span>
        </Link>
      </div>

      <div className="hidden lg:block p-6 border-t border-slate-800 w-full">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Desenvolvido por</p>
          <a href="https://www.instagram.com/loucos_dabolaofc/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
            <img src="/loucos_da_bola.jpg" alt="Loucos da Bola" className="w-full max-w-[120px] mx-auto rounded-lg shadow-sm" />
          </a>
        </div>
      </div>
    </aside>
  );
}
