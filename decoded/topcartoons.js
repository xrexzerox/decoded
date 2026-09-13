// ============================================
// DECODED: providers/topcartoons.js
// Provider: TopCartoons
// Original: Popular cartoons streaming
// ============================================

const cheerio = require('cheerio-without-node-native');
const BASE_URL = 'https://topcartoons.tv';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  console.log('[TopCartoons] Fetching: ' + tmdbId + ' type=' + type);
  try {
    const searchRes = await fetch(BASE_URL + '/?s=' + encodeURIComponent('cartoon'), {
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
    const videoRegex = /(https?:\/\/[^\s"'\\]+\.(?:mp4|m3u8)[^\s"'\\]*)/g;
    let match;
    while ((match = videoRegex.exec(pageHtml)) !== null) {
      streams.push({
        name: 'TopCartoons | 720p',
        title: '🎬 TopCartoons | 720p\n🎞️ MP4 | ⚡ H.264',
        url: match[1],
        quality: '720p',
        headers: { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT }
      });
    }
    return streams;
  } catch (e) {
    console.error('[TopCartoons] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
