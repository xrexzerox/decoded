// ============================================
// DECODED: providers/persianstremio.js
// Provider: PersianStremio
// Original: Persian/Iranian media
// ============================================

const BASE_URL = 'https://persianstremioapi.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[PersianStremio] Fetching: ' + tmdbId + ' type=' + type);
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
          name: '🌸 PersianStremio | ' + quality.toUpperCase(),
          title: '🎬 PersianStremio | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
          url: source.url,
          quality: '',
          headers: { 'Referer': 'https://persianstremio.com/', 'User-Agent': USER_AGENT }
        });
      }
    }
    return streams;
  } catch (e) {
    console.error('[PersianStremio] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
