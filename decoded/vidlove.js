// ============================================
// DECODED: providers/vidlove.js
// Provider: VidLove
// Original: Multi-server aggregator (MovieBox, LookMovie, VidNest)
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const SERVERS = {
  'MovieBox': { url: 'https://movieboxapi.com/api', key: 'mbx_key_2024' },
  'LookMovie': { url: 'https://lookmovie2.to/api', key: 'lm_key_2024' },
  'VidNest': { url: 'https://vidnest.ws/api', key: 'vn_key_2024' }
};

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[VidLove] Fetching: ' + tmdbId + ' type=' + type);
  const streams = [];

  for (const [serverName, config] of Object.entries(SERVERS)) {
    try {
      let url;
      if (type === 'tv' && season && episode) {
        url = config.url + '/tv/' + tmdbId + '/' + season + '/' + episode + '?key=' + config.key;
      } else {
        url = config.url + '/movie/' + tmdbId + '?key=' + config.key;
      }

      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;

      const data = await res.json();
      if (data.sources && Array.isArray(data.sources)) {
        for (const source of data.sources) {
          if (!source.url) continue;
          let quality = source.quality || '1080p';
          streams.push({
            name: '❤️ VidLove | ' + serverName + ' | ' + quality.toUpperCase(),
            title: '🎬 VidLove - ' + serverName + ' | ' + quality + '\n🎞️ ' + (source.url.includes('.m3u8') ? 'M3U8' : 'MP4') + ' | ⚡ H.264',
            url: source.url,
            quality: '',
            headers: { 'Referer': 'https://vidlove.app/', 'User-Agent': USER_AGENT }
          });
        }
      }
    } catch (e) {
      console.log('[VidLove] ' + serverName + ' error: ' + e.message);
    }
  }
  return streams;
}

module.exports = { getStreams };
