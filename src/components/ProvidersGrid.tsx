import { useState } from 'react';

interface Provider {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  supportedTypes: string[];
  formats: string[];
  contentLanguage: string[];
  hasSettings: boolean;
  category: string;
}

const providers: Provider[] = [
  { id: 'showbox', name: 'ShowBox', description: 'ShowBox streaming with multiple quality options and versions', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'castle', name: '🏰 Castle', description: 'Multi Lang provider with AES decryption', version: '2.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: '4khdhub', name: '4KHDHub', description: '4KHDHub direct links', version: '1.0.1', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: '1shows', name: '1Shows', description: 'Movies | Series in 4k, 1080p, 720p & 480p', version: '1.0.0', author: 'A2R14N', supportedTypes: ['movie', 'tv'], formats: ['mkv', 'mp4', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: false, category: 'Movies & TV' },
  { id: 'allmovieland', name: 'AllMovieLand', description: 'Multi-language streaming provider', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['m3u8'], contentLanguage: ['en', 'hi', 'ta', 'te'], hasSettings: true, category: 'Movies & TV' },
  { id: 'cineby', name: 'Cineby', description: 'Multi-server streaming — 4K/1080p/720p', version: '1.9.2', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['m3u8'], contentLanguage: ['ar', 'en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'cinefreak', name: 'CineFreak', description: 'Direct MKV streams from cinefreak.nl', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv'], formats: ['mkv', 'mp4'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'dahmermovies', name: 'Dahmermovies', description: '1080p Movies from Dahmermovies', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'desiflix', name: 'DesiFlix', description: 'Bollywood, Hollywood, South Indian movies', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: false, category: 'Movies & TV' },
  { id: 'dooflix', name: 'DooFlix', description: 'Fast streaming with direct TMDB integration', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'es'], hasSettings: true, category: 'Movies & TV' },
  { id: 'goated', name: '🐐 Goated', description: '4K • 1080p Movies & Series in Multi Language', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mkv', 'mp4', 'm3u8'], contentLanguage: ['en', 'hi', 'ru', 'es'], hasSettings: true, category: 'Movies & TV' },
  { id: 'hdhub4u', name: 'HDHub4u', description: 'Direct links with high-speed download support', version: '1.0.1', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'hindmoviez', name: 'HindMoviez', description: 'Hindi & English Movies and Series (480p-4K)', version: '1.0.1', author: 'Sanchit', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'moonflix', name: 'MoonFlix', description: 'Bollywood, Hollywood, South Indian Movies & Series', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'movieblast', name: 'MovieBlast', description: 'Hindi, Tamil, Telugu & English Movies/Series', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi', 'ta', 'te'], hasSettings: true, category: 'Movies & TV' },
  { id: 'moviebox', name: 'MovieBox', description: 'Hindi, Tamil, Telugu & English with multi-quality', version: '1.0.1', author: 'Xyr0nX', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'hi', 'ta', 'te'], hasSettings: true, category: 'Movies & TV' },
  { id: 'moviesdrive', name: 'MoviesDrive', description: 'Movies and TV shows with multiple streaming servers', version: '3.0.0', author: 'PirateZoro9', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'movieshunt', name: '🎬 MoviesHunt', description: 'Hollywood & Bollywood Movies in Multi Language', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie'], formats: ['m3u8'], contentLanguage: ['hi', 'en'], hasSettings: false, category: 'Movies & TV' },
  { id: 'movix', name: 'Movix VF', description: 'Movies and TV series in English & French', version: '1.0.0', author: 'wooodyhood', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'fr'], hasSettings: true, category: 'Movies & TV' },
  { id: 'netmirror', name: 'NetMirror', description: 'Netflix | Prime | Disney content', version: '1.0.0', author: 'Dustincos', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8', 'mkv'], contentLanguage: ['en', 'hi', 'ta', 'te'], hasSettings: true, category: 'Movies & TV' },
  { id: 'peachify', name: '🍑 Peachify', description: '3 server sources via Cloudflare Workers with AES-256-GCM', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv'], formats: ['m3u8', 'mp4'], contentLanguage: ['en', 'hi', 'te', 'ta', 'pt'], hasSettings: true, category: 'Movies & TV' },
  { id: 'showbox', name: 'ShowBox', description: 'ShowBox streaming with multiple quality options', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'uhdmovies', name: 'UHDMovies', description: 'UHD Movies streaming with multiple resolution', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vegamovies', name: 'VegaMovies', description: 'High-quality direct links streaming', version: '2.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vidlink', name: 'VidLink', description: 'Encrypted TMDB ID support for movies and TV', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'videasy', name: 'VidEasy', description: 'Encrypted TMDB ID support streaming', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vidsrc', name: 'VidSrc', description: 'Watch movies and TV shows online in 1080p HD', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vixsrc', name: 'VixSrc', description: 'Movies and TV shows in 1080p HD', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'Ita'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vidfast', name: 'VidFast', description: 'Stream movies and TV shows from vidfast.pro', version: '1.0.0', author: 'Dustincos', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Movies & TV' },
  { id: 'vidlove', name: '❤️ VidLove', description: 'Streams from MovieBox, LookMovie, VidNest etc', version: '1.0.0', author: 'Jeff', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8', 'mkv'], contentLanguage: ['en'], hasSettings: false, category: 'Movies & TV' },
  { id: 'xpass', name: 'XPass', description: 'Play Movie/TV by TMDB ID or IMDb ID', version: '1.0.0', author: 'Dustincos', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Movies & TV' },
  { id: 'zinkmovies', name: 'ZinkMovies', description: 'Bollywood, Hollywood, South Indian, Web Series', version: '1.0.0', author: 'Kabir', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'hi', 'ta', 'te'], hasSettings: true, category: 'Movies & TV' },
  // Anime
  { id: 'allanime', name: 'AllAnime', description: 'Anime and Manga content streaming', version: '1.0.0', author: '', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'allwish', name: '🌟 All-Wish', description: 'TV episodes via All-Wish servers', version: '1.0.1', author: 'Kabir', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'animekai', name: 'AnimeKai', description: 'TV episodes via AnimeKai servers', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Anime' },
  { id: 'anikototv', name: 'AnikotoTV', description: 'Anime via Mapper API + Native Extractor', version: '1.0.5', author: 'piratezoro9', supportedTypes: ['movie', 'tv', 'anime'], formats: ['mp4'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'anidb', name: 'AniDB', description: 'Subbed and dubbed anime from AniDB', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'ja', 'ko'], hasSettings: true, category: 'Anime' },
  { id: 'animepahe', name: 'AnimePahe', description: 'Watch anime online free in HD', version: '1.0.1', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['m3u8', 'mp4'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'animesalt', name: '🧂 AnimeSalt', description: 'Watch Anime in Hindi, Tamil & Telugu', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv'], formats: ['m3u8', 'mp4'], contentLanguage: ['hi', 'en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'animetsu', name: 'Animetsu', description: 'Lightning fast sub & dub anime streams', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv', 'anime'], formats: ['m3u8'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'animeworld', name: '🗡️ AnimeWorld', description: 'Watch AnimeWorld India', version: '1.0.0', author: 'piratezoro9', supportedTypes: ['movie', 'tv'], formats: ['m3u8'], contentLanguage: ['hi', 'en', 'ja'], hasSettings: true, category: 'Anime' },
  { id: 'anime-sama', name: '🐍 Anime-Sama', description: 'Watch AnimeSama France', version: '1.1.27', author: 'Gowaru', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv'], contentLanguage: ['fr'], hasSettings: true, category: 'Anime' },
  { id: 'hianime', name: 'HiAnime', description: 'Multi-server anime streaming with subtitles', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['m3u8'], contentLanguage: ['ja', 'en'], hasSettings: true, category: 'Anime' },
  { id: 'kurage', name: 'Kurage', description: 'Anime streaming with tRPC API and multi-server proxy', version: '1.0.0', author: 'Paregi12', supportedTypes: ['movie', 'tv'], formats: ['mkv', 'm3u8'], contentLanguage: ['en', 'ja'], hasSettings: true, category: 'Anime' },
  // Asian Drama
  { id: 'onlykdrama', name: '🫰 OnlyKDrama', description: 'Asian Drama streaming', version: '1.0.0', author: 'Moiz Ahmed', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'mkv', 'm3u8'], contentLanguage: ['ko'], hasSettings: true, category: 'Asian Drama' },
  { id: 'kisskh', name: '💋 Kisskh', description: 'Korean dramas and movies', version: '1.0.0', author: 'Michat88', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['ko', 'ch', 'ja', 'th'], hasSettings: true, category: 'Asian Drama' },
  // Special
  { id: 'torrentio', name: '🧲 Torrentio', description: 'Torrent streaming with optional debrid services', version: '1.0.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'hi'], hasSettings: true, category: 'Special' },
  { id: 'topcartoons', name: 'TopCartoons', description: 'Popular cartoons streaming', version: '1.0.0', author: 'Phisher', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en'], hasSettings: true, category: 'Special' },
  { id: 'persianstremio', name: '🌸 PersianStremio', description: 'Persian media content in Iranian & English', version: '1.4.0', author: 'Nuvio Team', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'pe'], hasSettings: false, category: 'Special' },
  { id: 'nakios', name: 'Nakios', description: 'Mainly French, Some English & 4K Quality', version: '3.8.2', author: 'Wooodyhood', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['fr', 'en'], hasSettings: true, category: 'Special' },
  { id: 'purstream', name: 'Purstream', description: 'Films and series in French (VF/VOSTFR/MULTI)', version: '3.0.0', author: 'wooodyhood', supportedTypes: ['movie', 'tv'], formats: ['mp4', 'm3u8'], contentLanguage: ['en', 'fr'], hasSettings: true, category: 'Special' },
];

const categories = ['All', 'Movies & TV', 'Anime', 'Asian Drama', 'Special'];

const langFlags: Record<string, string> = {
  en: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  hi: '🇮🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  fr: '🇫🇷',
  ta: '🇮🇳',
  te: '🇮🇳',
  es: '🇪🇸',
  ru: '🇷🇺',
  pt: '🇧🇷',
  ar: '🇸🇦',
  pe: '🇮🇷',
  ch: '🇨🇳',
  th: '🇹🇭',
  Ita: '🇮🇹',
};

export default function ProvidersGrid() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = providers.filter((p) => {
    const matchCategory = filter === 'All' || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryColors: Record<string, string> = {
    'Movies & TV': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    'Anime': 'bg-pink-600/20 text-pink-400 border-pink-600/30',
    'Asian Drama': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    'Special': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">🎬</span> All Providers ({providers.length})
        </h2>
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full md:w-64"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {cat}
            <span className="ml-1.5 text-gray-500">
              ({cat === 'All' ? providers.length : providers.filter(p => p.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((provider) => (
          <div
            key={provider.id + provider.name}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-purple-600/5"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">{provider.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[provider.category]}`}>
                {provider.category}
              </span>
            </div>
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{provider.description}</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {provider.contentLanguage.map((lang) => (
                <span key={lang} className="text-xs" title={lang}>
                  {langFlags[lang] || '🌍'}
                </span>
              ))}
              <span className="text-gray-600 text-xs ml-1">v{provider.version}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {provider.formats.map((fmt) => (
                <span key={fmt} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                  {fmt}
                </span>
              ))}
              {provider.hasSettings && (
                <span className="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">
                  ⚙️ Settings
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
              by {provider.author || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
