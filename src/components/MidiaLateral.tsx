'use client';
import { useCampeonatoStore } from '@/store/campeonatoStore';
import VideoDestaque from './VideoDestaque';

export default function MidiaLateral() {
  const { configuracoesMidia } = useCampeonatoStore();
  const temBanner = !!configuracoesMidia.banner_lateral;
  const temVideo = !!configuracoesMidia.video_youtube;

  if (!temBanner && !temVideo) return null;

  return (
    <div className="flex flex-col gap-6">
      {temBanner && (
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900">
          <img 
            src={configuracoesMidia.banner_lateral} 
            alt="Publicidade Lateral" 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      {temVideo && <VideoDestaque />}
    </div>
  );
}
