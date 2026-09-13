// ============================================
// DECODED: providers/vidfast.js
// Provider: VidFast (vidfast.pro)
// Original: Simple embed-based provider
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const BASE_URL = 'https://vidfast.pro';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Referer': BASE_URL + '/'
};

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[VidFast] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    let embedUrl;
    if (type === 'tv' && season && episode) {
      embedUrl = BASE_URL + '/embed/tv/' + tmdbId + '/' + season + '/' + episode;
    } else {
      embedUrl = BASE_URL + '/embed/movie/' + tmdbId;
    }

    const res = await fetch(embedUrl, { headers: HEADERS });
    if (!res.ok) return console.log('[VidFast] Embed error: ' + res.status), [];

    const html = await res.text();
    const streams = [];

    // Extract m3u8 URLs
    const m3u8Regex = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
    let match;
    while ((match = m3u8Regex.exec(html)) !== null) {
      let quality = '1080p';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';

      streams.push({
        name: 'VidFast | ' + quality.toUpperCase(),
        title: '🎬 VidFast | ' + quality + '\n🎞️ M3U8 | ⏱️ 24m | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }

    return streams;
  } catch (e) {
    console.error('[VidFast] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
