// ============================================
// DECODED: providers/nakios.js
// Provider: Nakios (French, 4K)
// ============================================

const cheerio = require('cheerio-without-node-native');
const BASE_URL = 'https://nakios.fr';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[Nakios] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const searchRes = await fetch(BASE_URL + '/?s=' + encodeURIComponent(tmdbId), {
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
        name: 'Nakios | ' + quality.toUpperCase(),
        title: '🎬 Nakios | ' + quality + '\n🎞️ MKV | ⚡ H.264',
        url: match[1],
        quality: '',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[Nakios] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
