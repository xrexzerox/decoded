export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 border-b border-gray-800">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-600/20">
              <span className="text-4xl">🎬</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                All-in-One Nuvio
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-green-600/20 text-green-400 border border-green-600/30 rounded-full">
                DECODED
              </span>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl">
              Complete reverse-engineering analysis of the Nuvio streaming scraper collection. 
              60+ obfuscated JavaScript providers decoded and analyzed.
            </p>
            <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
              <a href="https://github.com/NuvioPlugin/All-in-One-Nuvio" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <span className="text-yellow-500">⭐</span> 150 stars
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <span className="text-blue-500">🔱</span> 72 forks
              </span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
          {[
            { label: 'Providers', value: '60+', color: 'text-purple-400' },
            { label: 'Languages', value: '15+', color: 'text-blue-400' },
            { label: 'Max Quality', value: '4K', color: 'text-green-400' },
            { label: 'Commits', value: '269', color: 'text-yellow-400' },
            { label: 'Contributors', value: '10+', color: 'text-pink-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
