// ============================================
// DECODED: providers/moonflix.js
// Provider: Moonflix
// Original: Railway-hosted APIs with stream probing
// Features: Multi-API fallback, stream health checks, dual audio
// ============================================

const M_PLAYER = 'https://player.moonflix.website';
const M_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
const M_PLAYER_HEADERS = {
  'User-Agent': M_UA,
  'Referer': M_PLAYER + '/',
  'Origin': M_PLAYER
};

// Railway-hosted API endpoints
const M_APIS = [
  ['CH', 'https://confident-harmony-production-0578.up.railway.app'],
  ['HV', 'https://hvhyu-production.up.railway.app']
];

const TMDB_KEY = '439c478a771f35c05022f9feabcca01c';

// --- Sort tag using zero-width characters ---
function getInvertedSortTag(num, max) {
  if (!max) max = 999999;
  var n = Math.max(0, parseInt(num, 10) || 0);
  var inverted = Math.max(0, max - n);
  var binary = inverted.toString(2);
  while (binary.length < 20) binary = '0' + binary;
  return binary.split('').map(function(c) { return c === '1' ? '\ufeff' : '\u200b'; }).join('');
}

function getResolutionEmoji(quality) {
  var lower = String(quality || '').toLowerCase();
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd')) return '🔥 4K';
  if (lower.includes('1080') || lower.includes('fhd')) return '🚀 1080p';
  if (lower.includes('720') || lower.includes('hd')) return '✨ 720p';
  if (lower.includes('480') || lower.includes('sd')) return '💎 480p';
  return '📺 ' + (quality || '1080p');
}

function qualityRank(quality) {
  if (/2160p|4k/i.test(quality)) return 4;
  if (/1080p/i.test(quality)) return 3;
  if (/720p/i.test(quality)) return 2;
  if (/480p/i.test(quality)) return 1;
  return 0;
}

// --- TMDB metadata ---
function fetchTmdbMeta(tmdbId, type, season, episode) {
  if (!tmdbId) return Promise.resolve({ title: 'Unknown', year: null, episodeTitle: '' });
  var isTV = type === 'tv';
  var url = isTV
    ? 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + TMDB_KEY
    : 'https://api.themoviedb.org/3/movie/' + tmdbId + '?api_key=' + TMDB_KEY;

  return fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var title = data.title || data.name || 'Unknown';
      var date = data.release_date || data.first_air_date || '';
      var year = date ? parseInt(date.split('-')[0]) : null;
      var result = { title: title, year: year, episodeTitle: '' };

      if (isTV && season && episode) {
        var epUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId + '/season/' + season + '?api_key=' + TMDB_KEY;
        return fetch(epUrl)
          .then(function(res) { return res.json(); })
          .then(function(seasonData) {
            if (seasonData && Array.isArray(seasonData.episodes)) {
              var epNum = parseInt(episode);
              for (var i = 0; i < seasonData.episodes.length; i++) {
                if (seasonData.episodes[i].episode_number === epNum) {
                  result.episodeTitle = seasonData.episodes[i].name || '';
                  break;
                }
              }
            }
            return result;
          })
          .catch(function() { return result; });
      }
      return result;
    })
    .catch(function() { return { title: 'Unknown', year: null, episodeTitle: '' }; });
}

// --- Format stream object ---
function formatMoonflixStream(stream, providerName, index, metadata) {
  var quality = stream.q || '1080p';
  var emoji = getResolutionEmoji(quality);
  var rank = qualityRank(quality);
  var sortTag = getInvertedSortTag(rank * 100000 + (100 - index), 999999);
  var name = sortTag + '🌔 Moonflix | ' + quality + ' • Dual-Audio';

  var titleLine = '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '');
  var epLine = null;
  if (metadata.isTv && metadata.season && metadata.episode) {
    epLine = '📋 S' + metadata.season + ' E' + metadata.episode + (metadata.episodeTitle ? ' - ' + metadata.episodeTitle : '');
  }
  var audioLine = emoji + ' | 🗣️ Dual-Audio';
  var formatLine = '🎞️ M3U8 | ⚡ H.264';
  var sourceLine = '🌔 Moonflix | 🌐 ' + providerName;
  var fullTitle = [titleLine, epLine, audioLine, formatLine, sourceLine].filter(Boolean).join('\n');

  var headers = { 'User-Agent': M_UA, 'Referer': M_PLAYER + '/', 'Origin': M_PLAYER };

  return {
    name: name, title: fullTitle, size: fullTitle, description: fullTitle,
    url: stream.url, headers: headers,
    behaviorHints: { notWebReady: true, proxyHeaders: { request: headers } }
  };
}

// --- HTTP fetch helper ---
function mFetch(url, options) {
  options = options || {};
  return fetch(url, {
    method: options.method || 'GET',
    headers: Object.assign({ 'User-Agent': M_UA }, options.headers || {}),
    body: options.body
  })
  .then(function(res) {
    return res.text().then(function(text) {
      return { code: res.status, text: text };
    });
  })
  .catch(function() { return null; });
}

// --- Probe stream to check if alive ---
function mProbe(url, headers) {
  return mFetch(url, { headers: Object.assign({ 'Range': 'bytes=0-16384' }, headers || {}) })
  .then(function(res) {
    if (!res) return false;
    if (res.code !== 200 && res.code !== 206) return false;
    var text = res.text;
    return text.indexOf('#EXTM3U') === 0 || text.indexOf('{') !== 0;
  })
  .catch(function() { return false; });
}

// --- Parse streams from API response ---
function mParseStreams(data, providerName) {
  var streams = [];
  var sources = data && Array.isArray(data.streams) ? data.streams : [];

  for (var i = 0; i < sources.length; i++) {
    var source = sources[i] || {};
    var url = source.url ? String(source.url) : '';
    if (!url || url.indexOf('http') !== 0) continue;
    var quality = source.q || '1080p';
    streams.push({ url: url, q: quality, extra: source });
  }
  return streams;
}

// --- Main getStreams function ---
function mGetStreams(tmdbId, type, season, episode) {
  if (!tmdbId) return Promise.resolve([]);

  var isTV = type === 'tv';
  var s = season || 1;
  var ep = episode || 1;
  var path = isTV ? 'tv/' + tmdbId + '/' + s + '/' + ep : 'movie/' + tmdbId;

  return fetchTmdbMeta(tmdbId, type, s, ep).then(function(metadata) {
    metadata.isTv = isTV;
    metadata.season = s;
    metadata.episode = ep;

    var result = Promise.resolve([]);

    // Try each API in sequence
    M_APIS.forEach(function(api) {
      result = result.then(function(streams) {
        if (streams.length) return streams;
        return mFetch(api[1] + '/' + path, { headers: M_PLAYER_HEADERS })
        .then(function(res) {
          if (!res || res.code !== 200) return streams;
          var data;
          try { data = JSON.parse(res.text); } catch { return streams; }
          var parsed = mParseStreams(data, api[0]);
          var valid = [];
          var probeChain = Promise.resolve();

          parsed.forEach(function(stream, idx) {
            probeChain = probeChain.then(function() {
              return mProbe(stream.url, M_PLAYER_HEADERS).then(function(alive) {
                if (!alive) return;
                valid.push(formatMoonflixStream(stream, api[0], idx, metadata));
              });
            });
          });

          return probeChain.then(function() {
            return streams.concat(valid);
          });
        });
      });
    });

    // For TV, also try series-specific API
    if (isTV) {
      result = result.then(function(streams) {
        if (streams.length) return streams;
        return mFetch('https://series-production-5c1c.up.railway.app/tv/' + tmdbId + '/' + s + '/' + ep, { headers: M_PLAYER_HEADERS })
        .then(function(res) {
          if (!res || res.code !== 200) return streams;
          var data;
          try { data = JSON.parse(res.text); } catch { return streams; }
          var sources = data.sources || [];
          var valid = [];
          var probeChain = Promise.resolve();

          for (var i = 0; i < sources.length; i++) {
            (function(source, idx) {
              probeChain = probeChain.then(function() {
                var url = source.file || source.url || '';
                if (!url || url.indexOf('http') !== 0) return;
                return mProbe(url, M_PLAYER_HEADERS).then(function(alive) {
                  if (!alive) return;
                  var stream = { url: url, q: source.q || '1080p' };
                  valid.push(formatMoonflixStream(stream, 'SE', idx, metadata));
                });
              });
            })(sources[i], i);
          }

          return probeChain.then(function() {
            return streams.concat(valid);
          });
        });
      });
    }

    return result;
  });
}

function mOnSettings() { return []; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: mGetStreams, scrape: mGetStreams, onSettings: mOnSettings };
} else if (typeof global !== 'undefined') {
  global.getStreams = mGetStreams;
  global.onSettings = mOnSettings;
}
