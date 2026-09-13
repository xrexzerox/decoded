// ============================================
// DECODED: providers/anime-sama.js
// Provider: Anime-Sama (France)
// Original: French anime streaming
// ============================================

const cheerio = require('cheerio-without-node-native');
const BASE_URL = 'https://anime-sama.fr';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[Anime-Sama] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const searchRes = await fetch(BASE_URL + '/catalogue/listing_all.php', {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!searchRes.ok) return [];
    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    const firstLink = $('a').first().attr('href');
    if (!firstLink) return [];

    const pageRes = await fetch(firstLink, { headers: { 'User-Agent': USER_AGENT } });
    if (!pageRes.ok) return [];
    const pageHtml = await pageRes.text();

    const streams = [];
    const videoRegex = /(https?:\/\/[^\s"'\\]+\.(?:mp4|m3u8)[^\s"'\\]*)/g;
    let match;
    while ((match = videoRegex.exec(pageHtml)) !== null) {
      streams.push({
        name: '🐍 Anime-Sama | 1080p',
        title: '🎬 Anime-Sama | 1080p\n🎞️ MP4 | ⚡ H.264',
        url: match[1],
        quality: '1080p',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[Anime-Sama] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
