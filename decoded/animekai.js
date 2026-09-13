// ============================================
// DECODED: providers/animekai.js (simplified)
// Provider: AnimeKai
// Original: Anime streaming with web scraping
// ============================================

const TMDB_API_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const BASE_URL = 'https://www3.anikai.cc';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[AnimeKai] Fetching: ' + tmdbId + ' type=' + type);
  try {
    // Get TMDB info
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY);
    if (!tmdbRes.ok) return [];
    const tmdbData = await tmdbRes.json();
    const title = mediaType === 'tv' ? tmdbData.name : tmdbData.title;

    // Search AnimeKai
    const searchRes = await fetch(BASE_URL + '/browser?keyword=' + encodeURIComponent(title), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!searchRes.ok) return [];
    const searchHtml = await searchRes.text();

    // Extract first watch link
    const watchMatch = searchHtml.match(/href="([^"]*\/watch\/[^"]*)"/);
    if (!watchMatch) return [];

    let watchUrl = watchMatch[1];
    if (!watchUrl.startsWith('http')) watchUrl = BASE_URL + watchUrl;

    // Get episode page
    const epNum = episode || 1;
    const epRes = await fetch(watchUrl + '/ep-' + epNum, { headers: { 'User-Agent': USER_AGENT } });
    if (!epRes.ok) return [];
    const epHtml = await epRes.text();

    const streams = [];
    const m3u8Regex = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
    let match;
    while ((match = m3u8Regex.exec(epHtml)) !== null) {
      let quality = '1080p';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';

      streams.push({
        name: 'AnimeKai | ' + quality.toUpperCase(),
        title: '🎬 AnimeKai | ' + quality + '\n🎞️ M3U8 | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[AnimeKai] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
