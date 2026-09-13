// ============================================
// DECODED: providers/anidb.js
// Provider: AniDB
// Original: Subbed/dubbed anime database
// ============================================

const BASE_URL = 'https://anidbapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[AniDB] Fetching: ' + tmdbId + ' type=' + type);
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
          name: 'AniDB | ' + quality.toUpperCase(),
          title: '🎬 AniDB | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://anidb.net/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[AniDB] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
