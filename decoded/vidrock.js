// ============================================
// DECODED: providers/vidrock.js
// Provider: VidRock
// Original: Multi-quality streaming provider
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://vidrock.xyz';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[VidRock] Fetching: ' + tmdbId + ' type=' + type);
  try {
    let embedUrl;
    if (type === 'tv' && season && episode) {
      embedUrl = BASE_URL + '/embed/tv/' + tmdbId + '/' + season + '/' + episode;
    } else {
      embedUrl = BASE_URL + '/embed/movie/' + tmdbId;
    }

    const res = await fetch(embedUrl, { headers: { 'User-Agent': USER_AGENT, 'Referer': BASE_URL + '/' } });
    if (!res.ok) return [];

    const html = await res.text();
    const streams = [];
    const m3u8Regex = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
    let match;

    while ((match = m3u8Regex.exec(html)) !== null) {
      let quality = '1080p';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';
      else if (match[1].includes('360')) quality = '360p';

      streams.push({
        name: 'VidRock | ' + quality.toUpperCase(),
        title: '🎬 VidRock | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[VidRock] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
