// ============================================
// DECODED: providers/zinkmovies.js
// Provider: ZinkMovies
// Original: Bollywood/Hollywood/South Indian
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://zinkmoviesapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[ZinkMovies] Fetching: ' + tmdbId + ' type=' + type);
  try {
    let url;
    if (type === 'tv' && season && episode) {
      url = BASE_URL + '/api/tv/' + tmdbId + '/' + season + '/' + episode;
    } else {
      url = BASE_URL + '/api/movie/' + tmdbId;
    }

    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];

    const data = await res.json();
    const streams = [];

    if (data.sources && Array.isArray(data.sources)) {
      for (const source of data.sources) {
        if (!source.url) continue;
        let quality = source.quality || '1080p';
        streams.push({
          name: 'ZinkMovies | ' + quality.toUpperCase(),
          title: '🎬 ZinkMovies | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://zinkmovies.com/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[ZinkMovies] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
