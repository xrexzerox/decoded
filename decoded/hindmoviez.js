// ============================================
// DECODED: providers/hindmoviez.js
// Provider: HindMoviez
// Original: Hindi/English movies and series
// ============================================

const cheerio = require('cheerio-without-node-native');
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://hindmoviez.app';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[HindMoviez] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY);
    if (!tmdbRes.ok) return [];
    const tmdbData = await tmdbRes.json();
    const title = mediaType === 'tv' ? tmdbData.name : tmdbData.title;

    const searchRes = await fetch(BASE_URL + '/?s=' + encodeURIComponent(title), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!searchRes.ok) return [];
    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    const firstLink = $('article a').first().attr('href');
    if (!firstLink) return [];

    const pageRes = await fetch(firstLink, { headers: { 'User-Agent': USER_AGENT } });
    if (!pageRes.ok) return [];
    const pageHtml = await pageRes.text();

    const streams = [];
    const videoRegex = /(https?:\/\/[^\s"'\\]+\.(?:mkv|mp4|m3u8)[^\s"'\\]*)/g;
    let match;
    while ((match = videoRegex.exec(pageHtml)) !== null) {
      let quality = '1080p';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';

      streams.push({
        name: 'HindMoviez | ' + quality.toUpperCase(),
        title: '🎬 HindMoviez | ' + quality + '\n🎞️ MKV | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[HindMoviez] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
