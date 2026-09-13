// ============================================
// DECODED: providers/playimdb.js
// Provider: PlayIMDb
// Original: IMDb ID-based direct streaming
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://playimdb.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[PlayIMDb] Fetching: ' + tmdbId + ' type=' + type);
  try {
    // Get IMDb ID from TMDB
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids');
    if (!tmdbRes.ok) return [];
    const tmdbData = await tmdbRes.json();
    const imdbId = tmdbData.external_ids?.imdb_id || tmdbData.imdb_id;
    if (!imdbId) return [];

    let url = BASE_URL + '/api/stream/' + imdbId;
    if (type === 'tv' && season && episode) {
      url += '/' + season + '/' + episode;
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
          name: 'PlayIMDb | ' + quality.toUpperCase(),
          title: '🎬 PlayIMDb | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[PlayIMDb] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
