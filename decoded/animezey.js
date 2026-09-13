// ============================================
// DECODED: providers/animezey.js
// Provider: AnimeZeY
// Original: Movies indexed by TMDB
// ============================================

const BASE_URL = 'https://animezeyapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[AnimeZeY] Fetching: ' + tmdbId + ' type=' + type);
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
          name: 'AnimeZeY | ' + quality.toUpperCase(),
          title: '🎬 AnimeZeY | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://animezey.com/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[AnimeZeY] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
