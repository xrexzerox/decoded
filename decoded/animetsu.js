// ============================================
// DECODED: providers/animetsu.js
// Provider: Animetsu
// Original: Fast anime streaming
// ============================================

const BASE_URL = 'https://animetsuapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[Animetsu] Fetching: ' + tmdbId + ' type=' + type);
  try {
    let url = BASE_URL + '/api/anime/' + tmdbId;
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
          name: 'Animetsu | ' + quality.toUpperCase(),
          title: '🎬 Animetsu | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://animetsu.app/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[Animetsu] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
