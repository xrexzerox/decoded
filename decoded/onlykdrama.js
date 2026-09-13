// ============================================
// DECODED: providers/onlykdrama.js
// Provider: OnlyKDrama
// Original: Korean drama streaming
// ============================================

const BASE_URL = 'https://onlykdramaapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[OnlyKDrama] Fetching: ' + tmdbId + ' type=' + type);
  try {
    let url = BASE_URL + '/api/drama/' + tmdbId;
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
          name: '🫰 OnlyKDrama | ' + quality.toUpperCase(),
          title: '🎬 OnlyKDrama | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://onlykdrama.top/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[OnlyKDrama] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
