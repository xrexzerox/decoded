// ============================================
// DECODED: providers/cinefreak.js
// Provider: CineFreak (cinefreak.nl)
// Original: Direct MKV stream scraper
// ============================================

const cheerio = require('cheerio-without-node-native');
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const BASE_URL = 'https://cinefreak.nl';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[CineFreak] Fetching: ' + tmdbId + ' type=' + type);
  try {
    // Get TMDB info
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY);
    if (!tmdbRes.ok) return [];
    const tmdbData = await tmdbRes.json();
    const title = mediaType === 'tv' ? tmdbData.name : tmdbData.title;

    // Search on CineFreak
    const searchRes = await fetch(BASE_URL + '/?s=' + encodeURIComponent(title), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!searchRes.ok) return [];
    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    const firstLink = $('article a').first().attr('href');
    if (!firstLink) return [];

    // Get content page
    const pageRes = await fetch(firstLink, { headers: { 'User-Agent': USER_AGENT } });
    if (!pageRes.ok) return [];
    const pageHtml = await pageRes.text();

    const streams = [];
    // Extract direct MKV/MP4 links
    const videoRegex = /(https?:\/\/[^\s"'\\]+\.(?:mkv|mp4)[^\s"'\\]*)/g;
    let match;
    while ((match = videoRegex.exec(pageHtml)) !== null) {
      let quality = '1080p';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';

      streams.push({
        name: 'CineFreak | ' + quality.toUpperCase(),
        title: '🎬 CineFreak | ' + quality + '\n🎞️ MKV | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[CineFreak] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
