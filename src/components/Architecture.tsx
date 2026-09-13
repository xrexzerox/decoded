export default function Architecture() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-indigo-400">🏗️</span> System Architecture
        </h2>
        <p className="text-gray-400 mb-6">
          The All-in-One-Nuvio plugin system follows a modular architecture where each provider is a self-contained 
          JavaScript module that implements a standardized interface for the Nuvio app runtime.
        </p>

        {/* Architecture Diagram */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="font-mono text-sm space-y-4">
            {/* Layer 1: Nuvio App */}
            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
              <div className="text-purple-400 font-bold mb-2">📱 Nuvio Application Layer</div>
              <div className="text-gray-400 text-xs">
                Loads manifest.json → Initializes scrapers → Calls getStreams() → Renders results
              </div>
            </div>
            
            {/* Arrow */}
            <div className="text-center text-gray-600">↕ SCRAPER_SETTINGS / getStreams(tmdbId, type, season, episode)</div>
            
            {/* Layer 2: Provider Interface */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="text-blue-400 font-bold mb-2">🔌 Provider Interface Layer</div>
              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <div className="bg-gray-950 rounded p-2 text-xs">
                  <div className="text-green-400">module.exports.getStreams</div>
                  <div className="text-gray-500 mt-1">(tmdbId, type, season?, episode?)</div>
                </div>
                <div className="bg-gray-950 rounded p-2 text-xs">
                  <div className="text-green-400">module.exports.onSettings</div>
                  <div className="text-gray-500 mt-1">() → Setting[]</div>
                </div>
                <div className="bg-gray-950 rounded p-2 text-xs">
                  <div className="text-green-400">Return: Stream[]</div>
                  <div className="text-gray-500 mt-1">{'{'} url, name, title, quality, headers {'}'}</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-center text-gray-600">↕ fetch() / HTTP requests</div>

            {/* Layer 3: External APIs */}
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="text-green-400 font-bold mb-2">🌐 External Services Layer</div>
              <div className="grid md:grid-cols-4 gap-3 mt-3">
                <div className="bg-gray-950 rounded p-2 text-xs text-center">
                  <div className="text-yellow-400">TMDB API</div>
                  <div className="text-gray-500">Metadata lookup</div>
                </div>
                <div className="bg-gray-950 rounded p-2 text-xs text-center">
                  <div className="text-yellow-400">Provider APIs</div>
                  <div className="text-gray-500">Content search</div>
                </div>
                <div className="bg-gray-950 rounded p-2 text-xs text-center">
                  <div className="text-yellow-400">Streaming Servers</div>
                  <div className="text-gray-500">Video URLs</div>
                </div>
                <div className="bg-gray-950 rounded p-2 text-xs text-center">
                  <div className="text-yellow-400">File Hosts</div>
                  <div className="text-gray-500">FebBox, etc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">🔄</span> Data Flow (Typical Provider)
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="space-y-3">
            {[
              { step: 1, title: 'TMDB Lookup', desc: 'Fetch movie/TV metadata using TMDB API key', color: 'bg-blue-600' },
              { step: 2, title: 'Content Search', desc: 'Search provider API/database for matching content', color: 'bg-purple-600' },
              { step: 3, title: 'Decrypt Response', desc: 'AES decrypt API response using dynamic/hardcoded keys', color: 'bg-red-600' },
              { step: 4, title: 'Parse Streams', desc: 'Extract video URLs, quality info, subtitles from response', color: 'bg-yellow-600' },
              { step: 5, title: 'Format Output', desc: 'Build stream objects with metadata, headers, quality labels', color: 'bg-green-600' },
              { step: 6, title: 'Return Results', desc: 'Return array of Stream objects to Nuvio app', color: 'bg-indigo-600' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  <div className="text-gray-500 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Types */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-yellow-400">📦</span> Provider Implementation Patterns
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-blue-400">🔗</span> Direct API Providers
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Fetch content directly from provider APIs. Usually require authentication tokens or cookies.
            </p>
            <div className="flex flex-wrap gap-1">
              {['ShowBox', 'Castle', 'VidSrc', 'VidLink', 'VidEasy'].map((p) => (
                <span key={p} className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-pink-400">🕷️</span> Web Scrapers
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Parse HTML pages using cheerio to extract streaming links from websites.
            </p>
            <div className="flex flex-wrap gap-1">
              {['HDHub4u', 'VegaMovies', 'MoviesDrive', 'UHDMovies', 'CineFreak'].map((p) => (
                <span key={p} className="text-xs bg-pink-900/30 text-pink-400 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-green-400">🧲</span> Torrent Providers
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Interface with torrent indexing services, optionally supporting debrid for direct downloads.
            </p>
            <div className="flex flex-wrap gap-1">
              {['Torrentio', 'PersianStremio'].map((p) => (
                <span key={p} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-purple-400">🎌</span> Anime Specialists
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Dedicated anime scrapers with sub/dub support, episode mapping, and multi-server fallback.
            </p>
            <div className="flex flex-wrap gap-1">
              {['AnimeKai', 'AnimePahe', 'HiAnime', 'Kurage', 'AnikotoTV', 'Animetsu'].map((p) => (
                <span key={p} className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stream Object */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-cyan-400">📐</span> Stream Object Interface
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-gray-300">{`interface Stream {
  name: string;          // Provider + quality label (e.g., "ShowBox | 1080p | Cookie #1")
  title: string;         // Content title with metadata (multi-line display)
  url: string;           // Direct streaming URL (mp4/m3u8/mkv)
  quality: string;       // Resolution quality (4K, 1080p, 720p, etc.)
  size: string;          // File size description
  description: string;   // Full metadata string
  language: string;      // Audio/subtitle language
  headers: {             // HTTP headers for playback
    'User-Agent': string;
    'Accept': string;
    'Referer'?: string;
    'Cookie'?: string;
  };
  provider: string;      // Provider name tag
  subtitles?: Array<{    // Optional subtitle tracks
    url: string;
    language: string;
    name: string;
    headers: object;
  }>;
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
