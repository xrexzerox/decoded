// ============================================
// DECODED: providers/animepahe.js
// Provider: AnimePahe
// Original: Anime streaming
// ============================================

const cheerio = require('cheerio-without-node-native');
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://animepahe.ru';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[AnimePahe] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY);
    if (!tmdbRes.ok) return [];
    const tmdbData = await tmdbRes.json();
    const title = mediaType === 'tv' ? tmdbData.name : tmdbData.title;

    const searchRes = await fetch(BASE_URL + '/api?m=search&q=' + encodeURIComponent(title), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    if (!searchData.data || searchData.data.length === 0) return [];

    const animeId = searchData.data[0].id;
    const epNum = episode || 1;

    const epRes = await fetch(BASE_URL + '/api?m=release&id=' + animeId + '&sort=episode_asc&page=1', {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!epRes.ok) return [];
    const epData = await epRes.json();

    const streams = [];
    if (epData.data) {
      for (const ep of epData.data) {
        if (ep.session) {
          streams.push({
            name: 'AnimePahe | 1080p',
            title: '🎬 AnimePahe | 1080p\n🎞️ M3U8 | ⚡ H.264',
            url: BASE_URL + '/play/' + animeId + '/' + ep.session,
            quality: '1080p',
            headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
          });
          break;
        }
      }
    }
    return streams;
  } catch (e) {
    console.error('[AnimePahe] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
