// ============================================
// DECODED: providers/dooflix.js
// Provider: DooFlix
// Original: Simple API-based provider
// ============================================

const BASE_API = 'https://dooflixapi.xyz';
const API_KEY = 'dflx_2024_key_a1b2c3d4e5f6';
const HEADERS = {
  'X-Package-Name': 'com.king.moja',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'X-App-Version': '2.1.0'
};
const STREAM_REFERER = 'https://dooflix.stream';

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[DooFlix] Fetching: ' + tmdbId + ' type=' + type);
  try {
    let url;
    if (type === 'movie') {
      url = BASE_API + '/api/3/movie/' + tmdbId + '?apikey=' + API_KEY;
    } else {
      if (!season || !episode) return console.log('[DooFlix] Missing season/episode'), [];
      url = BASE_API + '/api/3/tv/' + tmdbId + '/' + season + '/' + episode + '?apikey=' + API_KEY;
    }

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return console.log('[DooFlix] API error: ' + res.status), [];

    const data = await res.json();
    const servers = data.servers || [];
    const streams = [];

    for (const server of servers) {
      try {
        const streamRes = await fetch(server.url, {
          method: 'GET',
          headers: { 'Referer': STREAM_REFERER, 'User-Agent': HEADERS['User-Agent'] },
          redirect: 'follow'
        });

        let finalUrl = streamRes.headers.get('location') || streamRes.url;
        if (finalUrl && finalUrl !== server.url) {
          streams.push({
            name: 'DooFlix',
            title: '🎬 DooFlix | ' + (server.name || 'Server'),
            url: finalUrl,
            quality: '1080p',
            headers: { 'Referer': STREAM_REFERER, 'User-Agent': HEADERS['User-Agent'] },
            provider: 'com.king.moja'
          });
        }
      } catch (e) {
        console.log('[DooFlix] Server error for ' + server.url + ': ' + e.message);
      }
    }
    return streams;
  } catch (e) {
    return console.log('[DooFlix] Error: ' + e.message), [];
  }
}

module.exports = { getStreams };
