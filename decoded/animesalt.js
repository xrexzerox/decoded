// ============================================
// DECODED: providers/animesalt.js
// Provider: AnimeSalt
// Original: Hindi/Tamil/Telugu anime
// ============================================

const cheerio = require('cheerio-without-node-native');
const BASE_URL = 'https://animesalt.in';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[AnimeSalt] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const searchRes = await fetch(BASE_URL + '/?s=' + encodeURIComponent('anime'), {
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
    const m3u8Regex = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
    let match;
    while ((match = m3u8Regex.exec(pageHtml)) !== null) {
      streams.push({
        name: '🧂 AnimeSalt | 1080p',
        title: '🎬 AnimeSalt | 1080p\n🎞️ M3U8 | ⚡ H.264',
        url: match[1],
        quality: '1080p',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[AnimeSalt] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
