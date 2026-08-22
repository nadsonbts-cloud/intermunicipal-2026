import { useState, useEffect } from 'react';
import { useCampeonatoStore } from '@/store/campeonatoStore';
import { Image, Video, Save } from 'lucide-react';

export default function MidiaCRUD() {
  const { configuracoesMidia, atualizarConfiguracaoMidia } = useCampeonatoStore();
  
  const [bannerTopo, setBannerTopo] = useState(configuracoesMidia.banner_topo || '');
  const [bannerLateral, setBannerLateral] = useState(configuracoesMidia.banner_lateral || '');
  const [videoYoutube, setVideoYoutube] = useState(configuracoesMidia.video_youtube || '');
  const [salvando, setSalvando] = useState<string | null>(null);

  useEffect(() => {
    setBannerTopo(configuracoesMidia.banner_topo || '');
    setBannerLateral(configuracoesMidia.banner_lateral || '');
    setVideoYoutube(configuracoesMidia.video_youtube || '');
  }, [configuracoesMidia]);

  const handleSalvar = async (chave: 'banner_topo' | 'banner_lateral' | 'video_youtube', valor: string) => {
    setSalvando(chave);
    await atualizarConfiguracaoMidia(chave, valor);
    setTimeout(() => setSalvando(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4 text-emerald-400">
          <Image size={24} />
          <h2 className="text-lg font-bold text-white">Banner do Topo (Header)</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Insira o link (URL) da imagem ou GIF que ficará no topo do site.</p>
        
        <div className="flex flex-col gap-3">
          <input 
            type="url"
            value={bannerTopo}
            onChange={(e) => setBannerTopo(e.target.value)}
            placeholder="Ex: https://meusite.com/banner.gif"
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 w-full"
          />
          <button 
            onClick={() => handleSalvar('banner_topo', bannerTopo)}
            disabled={salvando === 'banner_topo'}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 self-start"
          >
            <Save size={18} /> {salvando === 'banner_topo' ? 'Salvo!' : 'Salvar Banner Topo'}
          </button>
        </div>
        
        {bannerTopo && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Pré-visualização</p>
            <img src={bannerTopo} alt="Banner Topo" className="max-w-full h-auto rounded border border-slate-700" style={{maxHeight: '120px'}}/>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4 text-emerald-400">
          <Image size={24} />
          <h2 className="text-lg font-bold text-white">Banner Lateral (Sidebar)</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Insira o link (URL) da imagem ou GIF que ficará na barra lateral direita.</p>
        
        <div className="flex flex-col gap-3">
          <input 
            type="url"
            value={bannerLateral}
            onChange={(e) => setBannerLateral(e.target.value)}
            placeholder="Ex: https://meusite.com/banner-lateral.jpg"
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 w-full"
          />
          <button 
            onClick={() => handleSalvar('banner_lateral', bannerLateral)}
            disabled={salvando === 'banner_lateral'}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 self-start"
          >
            <Save size={18} /> {salvando === 'banner_lateral' ? 'Salvo!' : 'Salvar Banner Lateral'}
          </button>
        </div>

        {bannerLateral && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Pré-visualização</p>
            <img src={bannerLateral} alt="Banner Lateral" className="max-w-full h-auto rounded border border-slate-700" style={{maxHeight: '180px'}}/>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <Video size={24} />
          <h2 className="text-lg font-bold text-white">Vídeo do Youtube (Em Destaque)</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Cole o link do vídeo do YouTube (Ex: Gols da Rodada).</p>
        
        <div className="flex flex-col gap-3">
          <input 
            type="url"
            value={videoYoutube}
            onChange={(e) => setVideoYoutube(e.target.value)}
            placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 w-full"
          />
          <button 
            onClick={() => handleSalvar('video_youtube', videoYoutube)}
            disabled={salvando === 'video_youtube'}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 self-start"
          >
            <Save size={18} /> {salvando === 'video_youtube' ? 'Salvo!' : 'Salvar Vídeo'}
          </button>
        </div>

        {videoYoutube && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Pré-visualização</p>
            <p className="text-emerald-400 text-sm">✓ Vídeo salvo. Será renderizado no site público.</p>
          </div>
        )}
      </div>
    </div>
  );
}
