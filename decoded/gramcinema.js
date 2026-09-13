// ============================================
// DECODED: providers/gramcinema.js
// Provider: GramCinema
// Original: Multi-language with cookie token
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://gramcinemaapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function getCookieToken() {
  try {
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.cookieToken)
      return String(global.SCRAPER_SETTINGS.cookieToken).trim();
    if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.cookieToken)
      return String(window.SCRAPER_SETTINGS.cookieToken).trim();
  } catch {}
  return '';
}

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[GramCinema] Fetching: ' + tmdbId + ' type=' + type);
  const token = getCookieToken();
  if (!token) return console.log('[GramCinema] No cookie token configured'), [];

  try {
    let url;
    if (type === 'tv' && season && episode) {
      url = BASE_URL + '/api/tv/' + tmdbId + '/' + season + '/' + episode;
    } else {
      url = BASE_URL + '/api/movie/' + tmdbId;
    }

    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Cookie': token } });
    if (!res.ok) return [];

    const data = await res.json();
    const streams = [];

    if (data.sources && Array.isArray(data.sources)) {
      for (const source of data.sources) {
        if (!source.url) continue;
        let quality = source.quality || '1080p';
        streams.push({
          name: 'GramCinema | ' + quality.toUpperCase(),
          title: '🎬 GramCinema | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://gramcinema.com/', 'User-Agent': USER_AGENT, 'Cookie': token }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[GramCinema] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
