export default function Overview() {
  return (
    <div className="space-y-8">
      {/* Repository Summary */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-purple-400">📊</span> Repository Summary
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">All-in-One-Nuvio</strong> is a compiled collection of high-quality local scrapers 
            for the <strong className="text-purple-400">Nuvio</strong> streaming application. The repository contains 
            <strong className="text-yellow-400"> 60+ JavaScript provider files</strong> that are heavily obfuscated using 
            variable name mangling and string encoding techniques. Each provider implements a standardized interface 
            (<code className="text-green-400 bg-gray-800 px-1 rounded">getStreams()</code>) that fetches streaming URLs 
            from various sources using TMDB IDs for content lookup.
          </p>
        </div>
      </section>

      {/* Key Findings */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-yellow-400">⚡</span> Key Findings
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Heavy Obfuscation',
              desc: 'All provider files use advanced JavaScript obfuscation with hex-encoded variable names (_0x3cd342), base64 string arrays, and custom decoder functions.',
              icon: '🔒',
              color: 'border-red-600/30 bg-red-950/10',
            },
            {
              title: 'TMDB Integration',
              desc: 'Every provider uses the TMDB API (key: 439c478a...) for content metadata lookup, mapping TMDB IDs to provider-specific content IDs.',
              icon: '🎯',
              color: 'border-blue-600/30 bg-blue-950/10',
            },
            {
              title: 'Crypto Operations',
              desc: 'Multiple providers use CryptoJS for AES-256-CBC encryption/decryption. Castle provider uses a security key fetched from their API.',
              icon: '🔐',
              color: 'border-purple-600/30 bg-purple-950/10',
            },
            {
              title: 'Standardized Interface',
              desc: 'All providers export a getStreams(tmdbId, type, season?, episode?) function returning an array of stream objects with URL, quality, and metadata.',
              icon: '📐',
              color: 'border-green-600/30 bg-green-950/10',
            },
            {
              title: 'Multi-Source Scraping',
              desc: 'Providers scrape content from 60+ different streaming sources including anime sites, movie databases, and direct link providers.',
              icon: '🌐',
              color: 'border-yellow-600/30 bg-yellow-950/10',
            },
            {
              title: 'Settings System',
              desc: 'Many providers support user-configurable settings (cookies, API tokens, OSS groups) via an onSettings() export function.',
              icon: '⚙️',
              color: 'border-indigo-600/30 bg-indigo-950/10',
            },
          ].map((item) => (
            <div key={item.title} className={`border rounded-xl p-5 ${item.color}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-white font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* File Structure */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-400">📁</span> File Structure
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 font-mono text-sm">
          <div className="space-y-1">
            <div className="text-yellow-400">All-in-One-Nuvio/</div>
            <div className="pl-4 text-gray-400">├── <span className="text-blue-400">manifest.json</span> <span className="text-gray-600">// Plugin manifest with all scraper definitions</span></div>
            <div className="pl-4 text-gray-400">├── <span className="text-blue-400">README.md</span> <span className="text-gray-600">// Documentation & installation guide</span></div>
            <div className="pl-4 text-gray-400">├── <span className="text-blue-400">.gitignore</span></div>
            <div className="pl-4 text-gray-400">└── <span className="text-purple-400">providers/</span> <span className="text-gray-600">// 60+ obfuscated scraper files</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">showbox.js</span> <span className="text-gray-600">// ShowBox FebBox scraper</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">castle.js</span> <span className="text-gray-600">// Castle multi-lang provider</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">animekai.js</span> <span className="text-gray-600">// AnimeKai anime scraper</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">vidsrc.js</span> <span className="text-gray-600">// VidSrc streaming provider</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">torrentio.js</span> <span className="text-gray-600">// Torrentio torrent scraper</span></div>
            <div className="pl-8 text-gray-500">├── <span className="text-green-400">...</span> <span className="text-gray-600">// 55+ more provider files</span></div>
          </div>
        </div>
      </section>

      {/* Manifest Structure */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">📋</span> Manifest.json Structure
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 mb-4">The manifest.json defines all available scrapers with their metadata:</p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-gray-300">{`{
  "name": "All-in-One-Nuvio",
  "version": "1.0.0",
  "scrapers": [
    {
      "id": "showbox",
      "name": "ShowBox",
      "description": "ShowBox streaming with multiple quality options",
      "version": "1.0.0",
      "author": "Nuvio Team",
      "supportedTypes": ["movie", "tv"],
      "filename": "providers/showbox.js",
      "enabled": true,
      "hasSettings": true,
      "formats": ["mp4", "mkv", "m3u8"],
      "logo": "https://i.postimg.cc/...",
      "contentLanguage": ["en"]
    },
    // ... 60+ more scraper entries
  ]
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
