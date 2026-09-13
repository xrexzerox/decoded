// ============================================
// DECODED: providers/cineby.js
// Provider: Cineby
// Original: Custom keystream cipher + domain rotation + HLS size estimation
// ============================================

const DOMAINS_URL = 'https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json';
const FALLBACK_API_HOST = 'https://api.speedracelight.xyz';
const TMDB_API_KEY = '1865f43a0549ca50d341dd9ab8b29f49';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Referer': 'https://www.cineby.at/',
  'Origin': 'https://www.cineby.at'
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
  return (domains.speedracelight || domains.cineby || FALLBACK_API_HOST).replace(/\/+$/, '');
}

// ============================================
// Custom Keystream Cipher (similar to videasy.js)
// ============================================

const SHA256_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174
];
const MAGIC_BYTES = [0x6d, 0x76, 0x6d, 0x31]; // "mvm1"

function isCustomBranch(n) { return (n * (n + 1) & 1) === 0; }

function fmix32(h) {
  h = h >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h = (h ^ h >>> 16) >>> 0;
  return h;
}

function rotl32(x, n) {
  x = x >>> 0;
  n &= 0x1f;
  if (n === 0) return x >>> 0;
  return (x << n | x >>> 32 - n) >>> 0;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function pureBase64Decode(input) {
  let cleaned = '';
  for (let i = 0; i < input.length; i++) {
    const c = input.charAt(i);
    if (c !== '=' && BASE64_CHARS.indexOf(c) !== -1) cleaned += c;
  }
  let output = '';
  for (let i = 0; i < cleaned.length; i += 4) {
    const a = BASE64_CHARS.indexOf(cleaned.charAt(i));
    const b = BASE64_CHARS.indexOf(cleaned.charAt(i + 1));
    const c = i + 2 < cleaned.length ? BASE64_CHARS.indexOf(cleaned.charAt(i + 2)) : -1;
    const d = i + 3 < cleaned.length ? BASE64_CHARS.indexOf(cleaned.charAt(i + 3)) : -1;
    output += String.fromCharCode(a << 2 | b >> 4);
    if (c !== -1) output += String.fromCharCode((b & 0xf) << 4 | c >> 2);
    if (d !== -1) output += String.fromCharCode((c & 3) << 6 | d);
  }
  return output;
}

function base64UrlToBytes(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(4 * Math.ceil(input.length / 4), '=');
  const decoded = typeof atob === 'function' ? atob(padded) : pureBase64Decode(padded);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return bytes;
}

function fnv1a32(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) hash = Math.imul(hash ^ str.charCodeAt(i), 0x1000193) >>> 0;
  return fmix32(hash);
}

function makeKeystreamState(key, seed) {
  const slots = new Array(61);
  let acc = fmix32(fnv1a32(key) ^ fmix32(seed >>> 0 ^ 0x9e3779b9)) >>> 0;

  for (let i = 0; i < 8; i++) {
    if (isCustomBranch(i)) {
      const idx = acc % 61;
      acc = rotl32(acc + 0x9e3779b9 >>> 0, 7 + (7 & i));
      slots[idx] = (acc ^ fmix32(acc)) >>> 0;
      acc = fmix32(acc + idx >>> 0);
    } else {
      slots[i] = SHA256_CONSTANTS[0xf & i];
    }
  }
  return { slots, acc: fmix32(0xa5a5a5a5 ^ acc) >>> 0 };
}

function nextKeystreamWord(state, counter) {
  const slots = state.slots;
  const acc = state.acc;
  const idx = acc % 61;
  const mask = idx in slots ? -1 : 0;
  const val = slots[idx] >>> 0;
  const mixed = (val ^ Math.imul(0x9e3779b9, counter + 1) >>> 0) >>> 0;
  const combined = ((acc ^ mixed) >>> 0 | (acc & mixed & mask) >>> 0) >>> 0;
  const rotated = (rotl32(comb + acc >>> 0, 0x1f & idx) ^ rotl32(acc, 0x1f & Math.imul(idx, 7))) >>> 0;
  const next = fmix32(rotated + 0x9e3779b9 >>> 0);
  slots[idx] = next >>> 0;
  state.acc = next;
  return next >>> 0;
}

function generateKeystream(key, seed, length) {
  const state = makeKeystreamState(key, seed);
  const output = new Uint8Array(length);
  let i = 0, counter = 0;
  while (i < length) {
    const word = nextKeystreamWord(state, counter++);
    output[i++] = 0xff & word;
    if (i < length) output[i++] = word >>> 8 & 0xff;
    if (i < length) output[i++] = word >>> 16 & 0xff;
    if (i < length) output[i++] = word >>> 24 & 0xff;
  }
  return output;
}

function utf8BytesToString(bytes) {
  let result = '', i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) result += String.fromCharCode(b);
    else if ((b & 0xe0) === 0xc0) {
      const b2 = bytes[i++];
      result += String.fromCharCode((b & 0x1f) << 6 | b2 & 0x3f);
    } else if ((b & 0xf0) === 0xe0) {
      const b2 = bytes[i++], b3 = bytes[i++];
      result += String.fromCharCode((b & 0xf) << 12 | (b2 & 0x3f) << 6 | b3 & 0x3f);
    } else if ((b & 0xf8) === 0xf0) {
      const b2 = bytes[i++], b3 = bytes[i++], b4 = bytes[i++];
      let cp = (b & 0x7) << 18 | (b2 & 0x3f) << 12 | (b3 & 0x3f) << 6 | b4 & 0x3f;
      cp -= 0x10000;
      result += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    } else result += String.fromCharCode(b);
  }
  return result;
}

function decryptSourcesPayload(encrypted, key, seed) {
  const data = base64UrlToBytes(encrypted);
  const keystream = generateKeystream(key, seed, data.length);
  const decrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) decrypted[i] = data[i] ^ keystream[i];

  // Verify magic bytes
  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (decrypted[i] !== MAGIC_BYTES[i]) throw new Error('decrypt failed: bad seed or tampered payload');
  }

  const payload = decrypted.subarray(MAGIC_BYTES.length);
  return utf8BytesToString(payload);
}

// --- TMDB metadata ---
async function getTmdbMeta(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';
  const res = await fetch(url, { skipSizeCheck: true });
  if (!res.ok) return null;
  const data = await res.json();
  const title = mediaType === 'tv' ? data.name : data.title;
  const date = mediaType === 'tv' ? data.first_air_date : data.release_date;
  const year = date ? date.substring(0, 4) : '';
  const imdbId = data.external_ids && data.external_ids.imdb_id || data.imdb_id || '';
  return { title, year, imdbId };
}

function qualityRank(quality) {
  if (!quality) return 0;
  if (/4k/i.test(quality)) return 2160;
  const num = parseInt(quality, 10);
  return Number.isNaN(num) ? 0 : num;
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --- Estimate HLS stream size ---
const SEGMENT_SAMPLE_SIZE = 5;

async function getRealSegmentSize(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: HEADERS, skipSizeCheck: true });
    const contentLength = res.headers.get('content-length');
    if (contentLength) return parseInt(contentLength, 10);
  } catch {}

  try {
    const res = await fetch(url, { headers: { ...HEADERS, 'Range': 'bytes=0-1' }, skipSizeCheck: true });
    const range = res.headers.get('content-range');
    const match = range && range.match(/\/(\d+)$/);
    if (match) return parseInt(match[1], 10);
  } catch {}

  return null;
}

async function estimateHlsSize(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, skipSizeCheck: true });
    if (!res.ok) return 'Unknown';
    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
    if (!lines.length) return 'Unknown';

    const sampled = lines.filter((_, i) => i % Math.floor(lines.length / SEGMENT_SAMPLE_SIZE) === 0).slice(0, SEGMENT_SAMPLE_SIZE);
    const sizes = await Promise.all(sampled.map(getRealSegmentSize));
    const valid = sizes.filter(s => s && s > 0);
    if (!valid.length) return 'Unknown';

    const avg = valid.reduce((sum, s) => sum + s, 0) / valid.length;
    const totalSize = avg * lines.length;
    return formatBytes(totalSize);
  } catch {
    return 'Unknown';
  }
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

    const metadata = await getTmdbMeta(id, type);
    if (!metadata || !metadata.title) return [];

    const apiHost = await getApiHost();
    const isTV = type === 'tv';

    // Get seed
    const seedRes = await fetch(apiHost + '/seed?mediaId=' + id, { headers: HEADERS, skipSizeCheck: true });
    if (!seedRes.ok) return [];
    const seedData = await seedRes.json().catch(() => null);
    if (!seedData || !seedData.seed) return [];

    // Build request params
    const params = new URLSearchParams({
      title: metadata.title,
      mediaType: isTV ? 'tv' : 'movie',
      year: metadata.year || '',
      episodeId: String(isTV ? episode || 1 : 1),
      seasonId: String(isTV ? season || 1 : 1),
      tmdbId: String(id),
      imdbId: metadata.imdbId || '',
      enc: '2',
      seed: seedData.seed
    });

    // Fetch encrypted sources
    const sourcesRes = await fetch(apiHost + '/api/sources?' + params.toString(), { headers: HEADERS, skipSizeCheck: true });
    if (!sourcesRes.ok) return [];

    const encryptedText = await sourcesRes.text();
    let decrypted;
    try {
      const decryptedStr = decryptSourcesPayload(encryptedText, seedData.seed, id);
      decrypted = JSON.parse(decryptedStr);
    } catch (e) {
      return console.error('[Cineby] Decryption error:', e.message), [];
    }

    const sources = decrypted && decrypted.sources || [];
    if (!sources.length) return [];

    const subtitles = (decrypted && decrypted.subtitles || [])
      .filter(s => s && s.url)
      .map(s => ({ url: s.url, lang: s.lang || s.language || 'Unknown' }));

    // Estimate sizes and build streams
    const streams = await Promise.all(
      sources.filter(s => s && s.url).map(async s => {
        const size = await estimateHlsSize(s.url);
        return {
          url: s.url,
          quality: s.quality || 'Unknown',
          title: '🎬 ' + (s.label || 'Unknown'),
          name: 'Cineby',
          size: size,
          headers: HEADERS,
          subtitles: subtitles
        };
      })
    );

    streams.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality));
    return streams;
  } catch (e) {
    return console.error('[Cineby]', e), [];
  }
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
