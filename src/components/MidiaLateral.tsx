'use client';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function MidiaLateral() {
  const { configuracoesMidia } = useCampeonatoStore();
  const temBanner = !!configuracoesMidia.banner_lateral;
  const temVideo = !!configuracoesMidia.video_youtube;

  if (!temBanner && !temVideo) return null;

  // Extrai o ID do vídeo do Youtube
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = temVideo ? getYoutubeId(configuracoesMidia.video_youtube) : null;

  return (
    <div className="flex flex-col gap-6 mt-8">
      {temBanner && (
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900">
          <img 
            src={configuracoesMidia.banner_lateral} 
            alt="Publicidade Lateral" 
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {videoId && (
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900 flex flex-col">
          <div className="bg-red-600/10 px-4 py-2 border-b border-red-900/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Em Destaque</span>
          </div>
          <div className="relative w-full aspect-video">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
