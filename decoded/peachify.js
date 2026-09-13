// ============================================
// DECODED: providers/peachify.js
// Provider: Peachify (peachify.top)
// Original: AES-256-GCM decryption via Cloudflare Workers
// Servers: MovieBox, Holly, Air
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://peachify.top';
const WORKER_URL = 'https://peachify-worker.pages.dev';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const SERVERS = {
  'MovieBox': { path: '/api/moviebox' },
  'Holly': { path: '/api/holly' },
  'Air': { path: '/api/air' }
};

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[Peachify] Fetching: ' + tmdbId + ' type=' + type);
  const streams = [];

  for (const [serverName, config] of Object.entries(SERVERS)) {
    try {
      let url = WORKER_URL + config.path + '?tmdb=' + tmdbId + '&type=' + type;
      if (type === 'tv' && season && episode) {
        url += '&season=' + season + '&episode=' + episode;
      }

      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Origin': BASE_URL } });
      if (!res.ok) continue;

      const data = await res.json();
      if (data.encrypted && data.iv && data.key) {
        // AES-256-GCM decryption
        const keyBytes = Uint8Array.from(atob(data.key), c => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
        const ctBytes = Uint8Array.from(atob(data.encrypted), c => c.charCodeAt(0));

        const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
        const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, cryptoKey, ctBytes);
        const decoded = new TextDecoder().decode(plaintext);
        const parsed = JSON.parse(decoded);

        if (parsed.sources) {
          for (const source of parsed.sources) {
            if (!source.url) continue;
            let quality = source.quality || '1080p';
            streams.push({
              name: '🍑 Peachify | ' + serverName + ' | ' + quality.toUpperCase(),
              title: '🎬 Peachify - ' + serverName + ' | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
              url: source.url,
              quality: '',
              headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
            });
          }
        }
      }
    } catch (e) {
      console.log('[Peachify] ' + serverName + ' error: ' + e.message);
    }
  }
  return streams;
}

module.exports = { getStreams };
