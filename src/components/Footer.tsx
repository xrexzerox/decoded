export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">About This Analysis</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              This is a reverse-engineering analysis of the All-in-One-Nuvio repository for educational purposes. 
              The analysis covers obfuscation techniques, code structure, API endpoints, and security observations.
            </p>
          </div>

          {/* Credits */}
          <div>
            <h3 className="text-white font-semibold mb-3">Original Credits</h3>
            <div className="text-gray-500 text-sm space-y-1">
              <p>Compiled by <span className="text-purple-400">=[D3adly]=</span></p>
              <p>Contributors: Yoruix, Paregi12, Phisher98, Wooodyhood, Piratezoro9, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-white font-semibold mb-3">Disclaimer</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              This analysis is for educational purposes only. Users are responsible for ensuring their use complies 
              with applicable laws and regulations in their jurisdiction. Licensed under GNU GPL v3.0.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 text-sm">
            Full Decode Analysis • Built with React + Tailwind CSS
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/NuvioPlugin/All-in-One-Nuvio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Source Repository
            </a>
            <span className="text-gray-700">•</span>
            <span className="text-gray-600 text-sm">2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
