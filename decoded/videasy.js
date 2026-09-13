// ============================================
// DECODED: providers/videasy.js
// Provider: VidEasy
// Original: Custom encryption + string array obfuscation
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const WINGS_API_BASE = 'https://wings.xyz/api';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUEST_HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://www.vidking.net',
  'Referer': 'https://www.vidking.net/',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// --- Server definitions (10 named servers) ---
const SERVERS = {
  'Hydrogen':   { path: 'hydrogen/sources-with-title' },
  'Titanium':   { path: 'titanium/sources-with-title' },
  'Oxygen':     { path: 'oxygen/sources-with-title' },
  'Lithium':    { path: 'downloader2/sources-with-title' },
  'Krypton':    { path: 'krypton/sources-with-title' },
  'Carbon':     { path: 'carbon/sources-with-title' },
  'Aluminium':  { path: 'lamovie/sources-with-title' },
  'Nitrogen':   { path: 'nitrogen/sources-with-title' },
  'Neon':       { path: 'superflix/sources-with-title' },
  'Helium':     { path: 'helium/sources-with-title' }
};

// ============================================
// CUSTOM STREAM CIPHER (not AES!)
// This is a custom PRNG-based XOR cipher
// ============================================

const Js = 61;
const _f = 8;
const ms = 0x9e3779b9;
const Ys = [0x6d, 0x76, 0x6d, 0x31];

function ui(x) {
  x >>>= 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function ps(x, n) {
  x >>>= 0;
  n &= 0x1f;
  return n === 0 ? x >>> 0 : (x << n | x >>> (32 - n)) >>> 0;
}

function If(data) {
  let h = 0x67452301 >>> 0;
  for (let i = 0; i < data.length; i++) {
    h = ps((h ^ Math.imul(data.charCodeAt(i), [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174][i & 0xf])) >>> 0, 5);
  }
  return ui(h);
}

function Af(key) {
  const S = new Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    const temp = S[i]; S[i] = S[j]; S[j] = temp;
  }
  return S;
}

function wf(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 0x1000193) >>> 0;
  }
  return ui(hash);
}

function vf(a, b, c) {
  return ((a ^ b) >>> 0 | (a & b & c) >>> 0) >>> 0;
}

function Sf(n) { return (n * (n + 1) & 1) === 0; }
function bf(n) { return (n * (n + 1) & 1) === 1; }

function Nf(key, seed) {
  if (bf(key.length)) return { S: Af(key), acc: If(key) };

  const state = new Array(Js);
  let h = ui(wf(key) ^ ui(seed >>> 0 ^ ms)) >>> 0;

  for (let i = 0; i < _f; i++) {
    if (Sf(i)) {
      const idx = h % Js;
      h = ps(h + ms >>> 0, 7 + (i & 7));
      state[idx] = (h ^ ui(h)) >>> 0;
      h = ui(h + idx >>> 0);
    } else {
      state[i] = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5][i & 0xf];
    }
  }
  return { S: state, acc: ui(h ^ 0xa5a5a5a5) >>> 0 };
}

function Rf(state, counter) {
  const S = state.S;
  let acc = state.acc;
  const idx = acc % Js;
  const mask = 0 - +(idx in S);
  const val = S[idx] >>> 0;
  const mixed = Math.imul(ms, counter + 1) >>> 0;
  let out = vf(acc, (val ^ mixed) >>> 0, mask);
  out = (ps(out + acc >>> 0, idx & 0x1f) ^ ps(acc, Math.imul(idx, 7) & 0x1f)) >>> 0;
  acc = ui(out + ms >>> 0);
  S[idx] = acc >>> 0;
  state.acc = acc;
  return acc >>> 0;
}

function Cf(key, seed, length) {
  const state = Nf(key, seed);
  const output = new Uint8Array(length);
  let counter = 0;
  for (let i = 0; i < length;) {
    const rnd = Rf(state, counter++);
    output[i++] = rnd & 0xff;
    if (i < length) output[i++] = rnd >>> 8 & 0xff;
    if (i < length) output[i++] = rnd >>> 16 & 0xff;
    if (i < length) output[i++] = rnd >>> 24 & 0xff;
  }
  return output;
}

function decodeBase64(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const cleaned = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const len = cleaned.length;
  const output = new Uint8Array(Math.floor(len * 0.75));
  let pos = 0;

  for (let i = 0; i < len; i += 4) {
    const a = chars.indexOf(cleaned[i]);
    const b = chars.indexOf(cleaned[i + 1] || 'A');
    const c = chars.indexOf(cleaned[i + 2] || 'A');
    const d = chars.indexOf(cleaned[i + 3] || 'A');

    output[pos++] = (a << 2) | (b >> 4);
    if (i + 2 < len) output[pos++] = ((b & 0xf) << 4) | (c >> 2);
    if (i + 3 < len) output[pos++] = ((c & 3) << 6) | d;
  }
  return output;
}

function decryptWingsDatabase(encrypted, key, seed) {
  const data = decodeBase64(encrypted);
  const keystream = Cf(key, seed, data.length);

  for (let i = 0; i < data.length; i++) {
    data[i] ^= keystream[i];
  }

  for (let i = 0; i < Ys.length; i++) {
    if (data[i] !== Ys[i]) throw new Error('decrypt failed: bad seed or tampered payload');
  }

  let result = '';
  const payload = data.subarray(Ys.length);
  for (let i = 0; i < payload.length;) {
    const byte = payload[i++];
    if (byte < 0x80) result += String.fromCharCode(byte);
    else if (byte > 0xbf && byte < 0xe0)
      result += String.fromCharCode((byte & 0x1f) << 6 | payload[i++] & 0x3f);
    else if (byte > 0xdf && byte < 0xf0)
      result += String.fromCharCode((byte & 0xf) << 12 | (payload[i++] & 0x3f) << 6 | payload[i++] & 0x3f);
    else
      result += String.fromCharCode((byte & 0x7) << 18 | (payload[i++] & 0x3f) << 12 | (payload[i++] & 0x3f) << 6 | payload[i++] & 0x3f);
  }
  return result;
}

async function fetchMediaDetails(tmdbId, type, season, episode) {
  let fallbackDuration = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const id = String(tmdbId).replace(/\D/g, '');
    const url = TMDB_BASE_URL + '/' + mediaType + '/' + id + '?api_key=' + TMDB_API_KEY + '&language=en-US';
    const res = await fetch(url, {
      headers: { 'User-Agent': REQUEST_HEADERS['User-Agent'], 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    let duration = fallbackDuration;
    if (type === 'movie' && data.runtime) duration = data.runtime + ' min';
    else if (type === 'tv' && season != null && episode != null) {
      const epUrl = TMDB_BASE_URL + '/tv/' + id + '/season/' + season + '/episode/' + episode + '?api_key=' + TMDB_API_KEY;
      const epRes = await fetch(epUrl);
      if (epRes.ok) {
        const epData = await epRes.json();
        if (epData && epData.runtime) duration = epData.runtime + ' min';
        else if (data.episode_run_time && data.episode_run_time.length > 0)
          duration = data.episode_run_time[0] + ' min';
      }
    }

    return {
      title: type === 'tv' ? data.name : data.title,
      year: (type === 'tv' ? data.first_air_date : data.release_date || '').substring(0, 4),
      imdbId: data.external_ids?.imdb_id || null,
      mediaType: type,
      duration: duration
    };
  } catch (e) {
    console.error('[VidEasy] TMDB error: ' + e.message);
    return {
      title: type === 'tv' ? 'Unknown Series' : 'Unknown Movie',
      year: 'N/A', imdbId: null, mediaType: type, duration: fallbackDuration
    };
  }
}

function getLangCode(lang) {
  if (!lang) return 'en';
  const map = {
    'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
    'italian': 'it', 'portuguese': 'pt', 'arabic': 'ar', 'japanese': 'ja',
    'korean': 'ko', 'tamil': 'ta', 'telugu': 'te', 'hindi': 'hi',
    'polish': 'pl', 'thai': 'th', 'dutch': 'nl', 'russian': 'ru',
    'turkish': 'tr', 'hebrew': 'he', 'vietnamese': 'vi', 'hungarian': 'hu'
  };
  return map[lang.toLowerCase().trim()] || 'en';
}

function formatStreamsForNuvio(jsonStr, serverName, metadata, season, episode) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return [];

    const headers = {
      'Referer': 'https://www.vidking.net/',
      'Origin': 'https://www.vidking.net',
      'User-Agent': USER_AGENT
    };

    const subtitles = (data.subtitles || []).map(sub => ({
      url: sub.url,
      language: getLangCode(sub.language || sub.lang),
      name: sub.label || sub.lang || 'English',
      headers: headers
    }));

    const emoji = {
      'Carbon': '💎', 'Helium': '🎈', 'Lithium': '🔋', 'Oxygen': '💨',
      'Krypton': '🦸', 'Titanium': '🛡️', 'Hydrogen': '💧',
      'Nitrogen': '🌿', 'Neon': '💡', 'Aluminium': '💿'
    };
    const serverEmoji = emoji[serverName] || '🎬';

    const sourceNames = {
      'Hydrogen': 'CDN', 'Titanium': 'Multi', 'Oxygen': 'Neon2',
      'Lithium': 'Direct', 'Krypton': 'YM', 'Carbon': 'MB-Flix',
      'Aluminium': 'LaMovie', 'Nitrogen': 'Fast', 'Neon': 'SuperFlix', 'Helium': '1Movies'
    };
    const sourceName = sourceNames[serverName] || serverName;

    const streams = [];

    (data.sources || []).forEach(source => {
      if (!source.url) return;

      let quality = source.quality || '1080p';
      let cleanQuality = quality.replace(/\s*server\s*2\s*$/gi, '').trim();
      if (serverName === 'Oxygen') cleanQuality = '1080p';

      const lower = cleanQuality.toLowerCase();
      let qualityLabel = '⚡ ' + cleanQuality;
      if (lower.includes('2160') || lower.includes('4k')) qualityLabel = '🌟 2160p 4K';
      else if (lower.includes('1080')) qualityLabel = '🔥 1080p';
      else if (lower.includes('720')) qualityLabel = '⚡ 720p';
      else if (lower === 'auto') qualityLabel = '🔄 Auto';

      let audioLabel = 'Original Audio';
      let audioFlag = '🌍 Original Audio';
      if (serverName === 'Nitrogen' || serverName === 'Krypton') {
        audioLabel = 'Original Audio'; audioFlag = '🌍 Original Audio';
      } else if (serverName === 'Oxygen') {
        audioLabel = 'Dual Audio'; audioFlag = '🎭 Dual Audio';
      } else if (serverName === 'Aluminium') {
        audioLabel = 'Dual-Audio'; audioFlag = '🔊 Dual-Audio';
      } else if (serverName === 'Helium') {
        const lang = (source.audio || '').toLowerCase();
        if (lang.includes('bengali') || lang.includes('bangla')) {
          audioLabel = 'Bengali'; audioFlag = '🇧🇩 Bengali';
        } else {
          audioLabel = 'Normal Hindi'; audioFlag = '🇮🇳 Hindi';
        }
      }

      const format = source.url.includes('.m3u8') ? 'M3U8' :
                     source.url.includes('.mp4') ? 'MP4' : 'MKV';

      const titleText = metadata.title + (metadata.mediaType === 'tv' ? ' S' + season + 'E' + episode : '');
      let displayName = serverName;
      if (displayName === 'Krypton') displayName = displayName.replace(/\s*(1080p\s+)?server\s*2\s*$/gi, '').trim();

      const fullTitle = '🎬 ' + titleText + ' (' + metadata.year + ')\n' +
        qualityLabel + ' | ' + audioFlag + ' | 🎧 AAC\n' +
        '🎞️ ' + format + ' | ⏱️ ' + metadata.duration + '\n' +
        serverEmoji + ' ' + displayName + ' → ' + sourceName;

      streams.push({
        name: 'VidEasy | ' + cleanQuality + ' | ' + audioLabel,
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: source.url,
        quality: '',
        language: '',
        headers: headers,
        subtitles: subtitles,
        provider: 'videasy',
        _is4k: lower.includes('2160') || lower.includes('4k'),
        _serverName: serverName
      });
    });

    return streams;
  } catch (e) {
    console.error('[VidEasy] Formatting error: ' + e.message);
    return [];
  }
}

async function fetchFromWingsServer(serverName, serverConfig, type, tmdbId, metadata, seed, season, episode) {
  const params = {
    title: metadata.title,
    mediaType: type,
    year: String(metadata.year),
    episodeId: String(episode || 1),
    seasonId: String(season || 1),
    tmdbId: String(tmdbId),
    imdbId: metadata.imdbId || '',
    enc: '2',
    seed: seed
  };

  const queryString = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');

  const url = WINGS_API_BASE + '/' + serverConfig.path + '?' + queryString;
  console.log('[VidEasy] Fetching ' + serverName + ': ' + url);

  try {
    const res = await fetch(url, { headers: REQUEST_HEADERS });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const encrypted = await res.text();
    if (!encrypted || encrypted.trim() === '') throw new Error('Empty response');

    const decrypted = decryptWingsDatabase(encrypted, seed, Number(tmdbId));
    if (!decrypted) return [];

    const streams = formatStreamsForNuvio(decrypted, serverName, metadata, season, episode);
    console.log('[VidEasy] ✅ Found ' + streams.length + ' stream(s) from ' + serverName);
    return streams;
  } catch (e) {
    console.warn('[VidEasy] ❌ Error from ' + serverName + ': ' + e.message);
    return [];
  }
}

async function getStreams(tmdbId, type, season = null, episode = null) {
  console.log('[VidEasy] Fetching: ' + tmdbId + ', Type: ' + type +
    (type === 'tv' ? ', S:' + season + 'E:' + episode : ''));

  try {
    const metadata = await fetchMediaDetails(tmdbId, type, season, episode);
    if (!metadata) {
      console.error('[VidEasy] No metadata');
      return [];
    }
    console.log('[VidEasy] Found: "' + metadata.title + '" (' + metadata.year + ') | Duration: ' + metadata.duration);

    const seedUrl = WINGS_API_BASE + '/seed?mediaId=' + tmdbId;
    const seedRes = await fetch(seedUrl, { headers: REQUEST_HEADERS });
    if (!seedRes.ok) throw new Error('Seed HTTP ' + seedRes.status);
    const seedData = await seedRes.json();
    const seed = seedData.seed;
    if (!seed) throw new Error('No seed returned from API');
    console.log('[VidEasy] Got seed: ' + seed);

    const serverNames = Object.keys(SERVERS);
    const promises = serverNames.map(name =>
      fetchFromWingsServer(name, SERVERS[name], type, tmdbId, metadata, seed, season, episode)
    );
    const results = await Promise.all(promises);

    const allStreams = [];
    results.forEach(streams => allStreams.push(...streams));

    const unique = [];
    const seen = new Set();
    allStreams.forEach(s => {
      if (!seen.has(s.url)) {
        seen.add(s.url);
        unique.push(s);
      }
    });

    const serverOrder = Object.keys(SERVERS);
    unique.sort((a, b) => {
      if (a._is4k && !b._is4k) return -1;
      if (!a._is4k && b._is4k) return 1;
      return serverOrder.indexOf(a._serverName) - serverOrder.indexOf(b._serverName);
    });

    console.log('[VidEasy] Total unique streams: ' + unique.length);
    return unique;
  } catch (e) {
    console.error('[VidEasy] Error in getStreams: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
