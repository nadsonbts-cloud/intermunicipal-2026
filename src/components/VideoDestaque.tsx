'use client';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function VideoDestaque() {
  const { configuracoesMidia } = useCampeonatoStore();
  const temVideo = !!configuracoesMidia.video_youtube;

  if (!temVideo) return null;

  // Extrai o ID do vídeo do Youtube
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(configuracoesMidia.video_youtube);

  if (!videoId) return null;

  return (
    <div className="w-full mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900 flex flex-col">
      <div className="bg-red-600/10 px-4 py-2 border-b border-red-900/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Em Destaque</span>
      </div>
      <div className="relative w-full aspect-video md:aspect-[21/9]">
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
  );
}
