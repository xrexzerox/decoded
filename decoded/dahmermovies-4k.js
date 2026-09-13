// ============================================
// DECODED: providers/dahmermovies-4k.js
// Provider: Dahmermovies-TV (Android TV only)
// Original: 4K content for TV devices
// ============================================

const cheerio = require('cheerio-without-node-native');
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://dahmermovies.com';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; TV) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[Dahmermovies-4K] Fetching: ' + tmdbId + ' type=' + type);
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
      let quality = '2160p';
      if (match[1].includes('1080')) quality = '1080p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';

      streams.push({
        name: 'Dahmermovies-4K | ' + quality.toUpperCase(),
        title: '🎬 Dahmermovies-4K | ' + quality + '\n🎞️ MKV | ⚡ H.265',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[Dahmermovies-4K] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
