// ============================================
// DECODED: providers/goated.js
// Provider: Goated (goated.cx)
// Original: Proof-of-work challenge + domain rotation + SHA-256
// ============================================

const TMDB_API_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const DOMAINS_URL = 'https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json';
const FALLBACK_API_HOST = 'https://api.reallyfast.xyz';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Referer': 'https://goated.cx/',
  'Origin': 'https://goated.cx'
};

let cachedDomains = null;

async function getDomains() {
  if (cachedDomains) return cachedDomains;
  try {
    const res = await fetch(DOMAINS_URL, { skipSizeCheck: true });
    cachedDomains = await res.json();
  } catch {
    cachedDomains = {};
  }
  return cachedDomains;
}

async function getApiHost() {
  const domains = await getDomains();
  return (domains.reallyfast || domains.goated || FALLBACK_API_HOST).replace(/\/+$/, '');
}

// --- Sort tag using zero-width characters ---
function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  return inverted.toString(2).padStart(20, '0').split('').map(c => c === '1' ? '\ufeff' : '\u200b').join('');
}

function getQualityRank(quality) {
  const lower = String(quality || '').toLowerCase();
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd')) return 4;
  if (lower.includes('1080') || lower.includes('fhd') || lower.includes('fullhd')) return 3;
  if (lower.includes('720') || lower.includes('hd')) return 2;
  if (lower.includes('480') || lower.includes('sd') || lower.includes('360')) return 1;
  return 0;
}

function parseSizeToMB(size) {
  if (!size || size === 'N/A' || size === 'Unknown') return 0;
  const match = String(size).match(/([\d.]+)\s*(GB|MB)/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return Math.round(num * 1024);
  if (unit === 'MB') return Math.round(num);
  return 0;
}

function getResolutionEmoji(quality) {
  const lower = String(quality || '').toLowerCase();
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd')) return '🌟 4K';
  if (lower.includes('1080') || lower.includes('fhd')) return '🔥 1080p';
  if (lower.includes('720') || lower.includes('hd')) return '💎 720p';
  if (lower.includes('480') || lower.includes('sd')) return '📱 480p';
  return '📺 ' + (quality || '1080p');
}

// ============================================
// SHA-256 Implementation (Pure JavaScript)
// ============================================

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function utf8Bytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | code >> 6, 0x80 | code & 0x3f);
    else {
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const next = str.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          const combined = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
          bytes.push(0xf0 | combined >> 18, 0x80 | combined >> 12 & 0x3f, 0x80 | combined >> 6 & 0x3f, 0x80 | combined & 0x3f);
          i++;
        } else bytes.push(0xe0 | code >> 12, 0x80 | code >> 6 & 0x3f, 0x80 | code & 0x3f);
      } else bytes.push(0xe0 | code >> 12, 0x80 | code >> 6 & 0x3f, 0x80 | code & 0x3f);
    }
  }
  return bytes;
}

function sha256Hex(input) {
  const bytes = utf8Bytes(input);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0x00);
  const high = Math.floor(bitLength / 0x100000000);
  bytes.push(high >>> 24 & 0xff, high >>> 16 & 0xff, high >>>  immersive & 0xff, high & 0xff);
  bytes.push(bitLength >>> 24 & 0xff, bitLength >>> 16 & 0xff, bitLength >>> 8 & 0xff, bitLength & 0xff);

  let [a, b, c, d, e, f, g, h] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e5IGNAL
  0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  const W = new Array(64);
  for (let i = 0; i < bytes.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      const idx = i + j * 4;
      W[j] = (bytes[idx] << 24 | bytes[idx + 1] << 16 | bytes[idx + 2] << 8 | bytes[idx + 3]) >>> 0;
    }
    for (let j = 16; j < 64; j++) {
      const s0 = ((W[j - 15] >>> 7 | W[j - 15] << 25) ^ (W[j - 15] >>> 18 | W[j - 15] << 14) ^ W[j - 15] >>> 3) >>> 0;
      const s1 = ((W[j - 2] >>> 17 | W[j - 2] << 15) ^ (W[j - 2] >>> 19 | W[j - 2] << 13) ^ W[j - 2] >>> 10) >>> 0;
      W[j] = (W[j - 16] + s0 + W[j - 7] + s1) >>> 0;
    }

    let a1 = a, b1 = b, c1 = c, d1 = d, e1 = e, f1 = f, g1 = g, h1 = h;
    for (let j = 0; j < 64; j++) {
      const S1 = ((e1 >>> 6 | e1 << 26) ^ (e1 >>> 11 | e1 << 21) ^ (e1 >>> 25 | e1 << 7)) >>> 0;
      const ch = (e1 & f1 ^ ~e1 & g1) >>> 0;
      const temp1 = (h1 + S1 + ch + SHA256_K[j] + W[j]) >>> 0;
      const S0 = ((a1 >>> 2 | a1 << 30) ^ (a1 >>> 13 | a1 << 19) ^ (a1 >>> 22 | a1 << 10)) >>> 0;
      const maj = (a1 & b1 ^ a1 & c1 ^ b1 & c1) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h1 = g1; g1 = f1; f1 = e1;
      e1 = (d1 + temp1) >>> 0;
      d1 = c1; c1 = b1; b1 = a1;
      a1 = (temp1 + temp2) >>> 0;
    }
    a = (a + a1) >>> 0; b = (b + b1) >>> 0; c = (c + c1) >>> 0; d = (d + d1) >>> 0;
    e = (e + e1) >>> 0; f = (f + f1) >>> 0; g = (g + g1) >>> 0; h = (h + h1) >>> 0;
  }

  return [a, b, c, d, e, f, g, h].map(v => ('00000000' + v.toString(16)).slice(-8)).join('');
}

// --- Proof of Work solver ---
async function solveProofOfWork(apiHost) {
  const res = await fetch(apiHost + '/api/challenge', { skipSizeCheck: true });
  if (!res.ok) throw new Error('Challenge fetch failed');
  const { challenge, difficulty } = await res.json();
  const target = '0'.repeat(difficulty);

  for (let nonce = 0; nonce < 5000000; nonce++) {
    const hash = sha256Hex(challenge + nonce);
    if (hash.startsWith(target)) return { challenge, nonce: String(nonce) };
  }
  throw new Error('PoW solve timed out');
}

// --- TMDB helpers ---
async function getTmdbRuntimeSeconds(tmdbId, type, season, episode) {
  try {
    const url = type === 'tv'
      ? 'https://api.themoviedb.org/3/tv/' + tmdbId + '/season/' + (season || 1) + '/episode/' + (episode || 1) + '?api_key=' + TMDB_API_KEY
      : 'https://api.themoviedb.org/3/movie/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url, { skipSizeCheck: true });
    if (!res.ok) return null;
    const data = await res.json();
    const runtime = data.runtime || data.episode_run_time?.[0];
    return runtime ? runtime * 60 : null;
  } catch { return null; }
}

async function getTmdbMetadata(tmdbId, type) {
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const res = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY, { skipSizeCheck: true });
    const data = await res.json();
    const title = mediaType === 'tv' ? data.name : data.title;
    const date = mediaType === 'tv' ? data.first_air_date : data.release_date;
    const year = date ? date.split('-')[0] : '';
    return { title, year };
  } catch { return { title: '', year: '' }; }
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function resolveUrl(path, base) {
  try { return new URL(path, base).toString(); } catch { return path; }
}

// --- Master M3U8 playlist parser ---
function parseMasterPlaylist(content, baseUrl) {
  const lines = content.split('\n').map(l => l.trim());
  const variants = [];
  let defaultAudioUrl = null;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXT-X-MEDIA') && lines[i].includes('TYPE=AUDIO') && !defaultAudioUrl) {
      const uriMatch = lines[i].match(/URI="([^"]+)"/);
      const isDefault = /DEFAULT=YES/.test(lines[i]);
      if (uriMatch && (isDefault || !defaultAudioUrl)) defaultAudioUrl = resolveUrl(uriMatch[1], baseUrl);
      continue;
    }
    if (!lines[i].startsWith('#EXT-X-STREAM-INF')) continue;
    const info = lines[i], url = lines[i + 1];
    if (!url || url.startsWith('#')) continue;

    const bwMatch = info.match(/BANDWIDTH=(\d+)/);
    const resMatch = info.match(/RESOLUTION=(\d+)x(\d+)/);
    const bandwidth = bwMatch ? parseInt(bwMatch[1], 10) : 0;
    const height = resMatch ? parseInt(resMatch[2], 10) : 0;

    variants.push({ url: resolveUrl(url, baseUrl), bandwidth, height });
  }
  return { variants, defaultAudioUrl };
}

async function getAudioBitrateBps(audioUrl) {
  if (!audioUrl) return 0;
  try {
    const content = await (await fetch(audioUrl, { skipSizeCheck: true })).text();
    const match = content.match(/#EXT-X-BITRATE:(\d+)/);
    return match ? parseInt(match[1], 10) * 1000 : 0;
  } catch { return 0; }
}

function qualityLabelFromHeight(height) {
  if (height >= 2000) return '4K';
  if (height <= 0) return 'Auto';
  return height + 'p';
}

// --- Build stream object ---
function makeStream(url, quality, size, title, year, type, season, episode, subtitles) {
  const qualityRank = getQualityRank(quality);
  const sizeInMB = parseSizeToMB(size);
  const sortTag = getInvertedSortTag(qualityRank * 100000 + sizeInMB, 999999);
  const emoji = getResolutionEmoji(quality);
  const safeTitle = (title || '').replace(/[^a-zA-Z0-9]/g, '.');
  const isTV = type === 'tv';
  const s = season || 1, e = episode || 1;
  const filename = isTV
    ? safeTitle + '.S' + String(s).padStart(2, '0') + 'E' + String(e).padStart(2, '0') + '.' + quality + '.WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs'
    : safeTitle + '.' + (year || '2026') + '.' + quality + '.WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs';

  const titleLine = isTV
    ? '🎬 ' + title + (year ? ' (' + year + ')' : '') + ' | S' + s + 'E' + e
    : '🎬 ' + title + (year ? ' (' + year + ')' : '');
  const line2 = emoji + ' | 🗣️ Multi-Audio | 💾 ' + size;
  const line3 = '🎞️ MKV | ⚡ HEVC';
  const line4 = '🎧 AAC | 🌍 MSubs';
  const line5 = filename;
  const fullTitle = [titleLine, line2, line3, line4, line5].join('\n');

  return {
    qualityRank, sizeInMB,
    data: {
      name: sortTag + 'Goated • ' + quality + ' | ' + title,
      title: fullTitle, size: fullTitle, description: fullTitle,
      url, headers: HEADERS, subtitles,
      behaviorHints: { notWebReady: true, proxyHeaders: { request: HEADERS } }
    }
  };
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  try {
    let id = tmdbId;
    if (typeof tmdbId === 'string' && tmdbId.trim().toLowerCase().startsWith('tt')) {
      const url = 'https://api.themoviedb.org/3/find/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id';
      const data = await (await fetch(url, { skipSizeCheck: true })).json();
      const results = type === 'tv' ? data.tv_results : data.movie_results;
      id = results && results.length ? results[0].id : null;
      if (!id) return [];
    }
    id = parseInt(id, 10);
    if (!id) return [];

    const { title, year } = await getTmdbMetadata(id, type);
    const apiHost = await getApiHost();
    const isTV = type === 'tv';

    // Step 1: Solve proof-of-work challenge
    const pow = await solveProofOfWork(apiHost);

    // Step 2: Resolve stream URL
    const resolveBody = {
      mediaType: isTV ? 'tv' : 'movie',
      id: String(id),
      challenge: pow.challenge,
      nonce: pow.nonce
    };
    if (isTV) { resolveBody.season = season || 1; resolveBody.episode = episode || 1; }

    const resolveRes = await fetch(apiHost + '/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolveBody),
      skipSizeCheck: true
    });
    if (!resolveRes.ok) return [];
    const resolveData = await resolveRes.json().catch(() => null);
    if (!resolveData || !resolveData.url) return [];

    // Step 3: Fetch and parse master playlist
    const playlistRes = await fetch(resolveData.url, { skipSizeCheck: true });
    if (!playlistRes.ok) return [];
    const playlistText = await playlistRes.text();
    const { variants, defaultAudioUrl } = parseMasterPlaylist(playlistText, resolveData.url);
    if (!variants.length) return [];

    // Get highest quality variant
    const best = variants.slice().sort((a, b) => b.height - a.height)[0];

    // Step 4: Get runtime and audio bitrate for size estimation
    const [runtimeSeconds, audioBitrate] = await Promise.all([
      getTmdbRuntimeSeconds(id, type, season, episode),
      getAudioBitrateBps(defaultAudioUrl)
    ]);

    // Step 5: Fetch subtitles (with separate PoW)
    let subtitles = [];
    try {
      const pow2 = await solveProofOfWork(apiHost);
      const subBody = {
        mediaType: isTV ? 'tv' : 'movie',
        id: String(id),
        challenge: pow2.challenge,
        nonce: pow2.nonce
      };
      if (isTV) { subBody.season = season || 1; subBody.episode = episode || 1; }

      const subRes = await fetch(apiHost + '/api/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subBody),
        skipSizeCheck: true
      });
      if (subRes.ok) {
        const subData = await subRes.json().catch(() => null);
        subtitles = (subData && subData.subtitles || [])
          .filter(s => s && s.url)
          .map(s => ({ url: s.url, lang: s.lang || s.language || 'English' }));
      }
    } catch {}

    // Step 6: Build stream
    const totalBitrate = best.bandwidth + audioBitrate;
    const quality = qualityLabelFromHeight(best.height);
    const size = runtimeSeconds ? formatBytes(totalBitrate * runtimeSeconds / 8) : 'Unknown';
    const stream = makeStream(resolveData.url, quality, size, title || 'Unknown Title', year || '2026', type, season, episode, subtitles);

    return [stream.data];
  } catch (e) {
    console.error('[Goated]', e);
    return [];
  }
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
