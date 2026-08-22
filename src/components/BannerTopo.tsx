'use client';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function BannerTopo() {
  const { configuracoesMidia } = useCampeonatoStore();

  if (!configuracoesMidia.banner_topo) return null;

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900 flex justify-center items-center max-h-[150px] lg:max-h-[200px]">
      <img 
        src={configuracoesMidia.banner_topo} 
        alt="Publicidade" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
