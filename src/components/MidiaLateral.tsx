'use client';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function MidiaLateral() {
  const { configuracoesMidia } = useCampeonatoStore();
  const temBanner = !!configuracoesMidia.banner_lateral;

  if (!temBanner) return null;

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900">
        <img 
          src={configuracoesMidia.banner_lateral} 
          alt="Publicidade Lateral" 
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
