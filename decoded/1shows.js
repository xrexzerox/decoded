// ============================================
// DECODED: providers/1shows.js
// Provider: 1Shows (www.1shows.org)
// Original: AES-256-GCM encryption + string array obfuscation
// Features: Pure JS AES-GCM, WebCrypto fallback, WASM fallback
// ============================================

const SITE_URL = 'https://www.1shows.org';
const API_URL = 'https://api.1shows.org';
const TMDB_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const API_HEADERS = {
  'Accept': 'application/json',
  'Origin': SITE_URL,
  'Referer': SITE_URL + '/',
  'User-Agent': USER_AGENT
};

const PAGE_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': SITE_URL + '/',
  'User-Agent': USER_AGENT
};

// AES-256-GCM download key
const DOWNLOAD_KEY_HEX = '7a03086357a2147dab4d757e8ed2ff8b5dc8707ee3d473afcb80d97727afa191';

// --- UTF-8 decode helper ---
function safeUtf8Decode(bytes) {
  if (typeof TextDecoder !== 'undefined') try { return new TextDecoder().decode(bytes); } catch {}
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  try { return decodeURIComponent(escape(str)); } catch { return str; }
}

// --- Sort tag ---
function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  return inverted.toString(2).padStart(20, '0').split('').map(c => c === '1' ? '\ufeff' : '\u200b').join('');
}

// --- Parse size to MB ---
function parseSizeToMB(size) {
  if (!size || size === 'N/A' || size === 'Unknown') return 0;
  const match = String(size).match(/([\d.]+)\s*(GB|MB)/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return Math.round(unit === 'GB' ? num * 1024 : num);
}

// --- Resolution emoji ---
function getResolutionEmoji(quality) {
  const q = String(quality || '').toLowerCase();
  if (q.includes('2160') || q.includes('4k') || q.includes('uhd')) return '🌟 2160p';
  if (q.includes('1080') || q.includes('fhd')) return '🔥 1080p';
  if (q.includes('720') || q.includes('hd')) return '💎 720p';
  if (q.includes('480') || q.includes('sd')) return '📱 480p';
  return '📺 ' + (quality || 'Auto');
}

// --- Fetch JSON ---
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
  return res.json();
}

// --- Fetch text with Cloudflare bypass ---
async function fetchText(url, options = {}) {
  const opts = Object.assign({}, options, { skipSizeCheck: true, cfKiller: true });
  let res = await fetch(url, opts);

  if ((res.status === 403 || res.status === 503) && typeof globalThis.Cloudflare !== 'undefined' && globalThis.Cloudflare.solve) {
    const cfHeaders = await globalThis.Cloudflare.solve(url);
    res = await fetch(url, Object.assign({}, opts, { headers: Object.assign({}, opts.headers || {}, cfHeaders || {}) }));
  }
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
  return { html: await res.text(), url: res.url || url };
}

// --- URL helpers ---
function absoluteUrl(path, base) {
  if (!path) return '';
  try { return new URL(path, base).toString(); } catch { return ''; }
}

// --- HTML helpers ---
function decodeHtml(input) {
  return String(input || '').replace(/&amp;/gi, '&').replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}

function stripTags(input) {
  return decodeHtml(String(input || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function attribute(html, name) {
  const match = String(html || '').match(new RegExp('\\b' + name + '=["\']([^"\']*)', 'i'));
  return match ? decodeHtml(match[2]) : '';
}

function anchors(html, base) {
  const results = [];
  const regex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  let match;
  while (match = regex.exec(String(html || ''))) {
    const href = absoluteUrl(attribute(match[0], 'href'), base);
    if (href) results.push({ href, text: stripTags(match[0]) });
  }
  return results;
}

// ============================================
// AES-256-GCM Pure JavaScript Implementation
// ============================================

function hexToBytes(hex) {
  const clean = String(hex || '').toLowerCase();
  if (!clean || clean.length % 2) throw new Error('Invalid hex');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const b = parseInt(clean.substr(i * 2, 2), 16);
    if (Number.isNaN(b)) throw new Error('Invalid encrypted payload');
    bytes[i] = b;
  }
  return bytes;
}

// AES S-Box and RCON
const AES_SBOX = new Uint8Array([0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16]);
const AES_RCON = new Uint8Array([0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]);

function expandAes256Key(key) {
  if (key.length !== 32) throw new Error('Invalid AES-256 key');
  const expanded = new Uint8Array(240);
  expanded.set(key);
  let offset = 32, round = 1;
  const temp = new Uint8Array(4);
  while (offset < expanded.length) {
    for (let i = 0; i < 4; i++) temp[i] = expanded[offset - 4 + i];
    if (offset % 32 === 0) {
      const t = temp[0];
      temp[0] = AES_SBOX[temp[1]] ^ AES_RCON[round++];
      temp[1] = AES_SBOX[temp[2]];
      temp[2] = AES_SBOX[temp[3]];
      temp[3] = AES_SBOX[t];
    } else if (offset % 32 === 16) {
      for (let i = 0; i < 4; i++) temp[i] = AES_SBOX[temp[i]];
    }
    for (let i = 0; i < 4 && offset < expanded.length; i++) {
      expanded[offset] = expanded[offset - 32] ^ temp[i];
      offset++;
    }
  }
  return expanded;
}

function aesXtime(x) { return (x << 1 ^ (x & 0x80 ? 0x1b : 0x00)) & 0xff; }

function aesEncryptBlock(block, key) {
  const state = new Uint8Array(block);
  for (let i = 0; i < 16; i++) state[i] ^= key[i];
  for (let round = 1; round <= 14; round++) {
    for (let i = 0; i < 16; i++) state[i] = AES_SBOX[state[i]];
    // ShiftRows
    const shifted = new Uint8Array(16);
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++)
        shifted[col + 4 * row] = state[col + 4 * ((row + col) & 3)];
    state.set(shifted);
    // MixColumns (skip last round)
    if (round < 14) {
      for (let col = 0; col < 4; col++) {
        const idx = col * 4;
        const s0 = state[idx], s1 = state[idx+1], s2 = state[idx+2], s3 = state[idx+3];
        const mix = s0 ^ s1 ^ s2 ^ s3;
        state[idx] ^= mix ^ aesXtime(s0 ^ s1);
        state[idx+1] ^= mix ^ aesXtime(s1 ^ s2);
        state[idx+2] ^= mix ^ aesXtime(s2 ^ s3);
        state[idx+3] ^= mix ^ aesXtime(s3 ^ s0);
      }
    }
    // AddRoundKey
    const keyOffset = round * 16;
    for (let i = 0; i < 16; i++) state[i] ^= key[keyOffset + i];
  }
  return state;
}

function xorBlock(a, b) { for (let i = 0; i < 16; i++) a[i] ^= b[i]; }

function ghashMultiply(block, hashKey) {
  const result = new Uint8Array(16);
  const temp = new Uint8Array(hashKey);
  for (let i = 0; i < 128; i++) {
    if (block[i >> 3] >> (7 - (i & 7)) & 1) xorBlock(result, temp);
    const carry = temp[15] & 1;
    for (let j = 15; j > 0; j--) temp[j] = temp[j] >>> 1 | (temp[j-1] & 1) << 7;
    temp[0] >>>= 1;
    if (carry) temp[0] ^= 0xe1;
  }
  return result;
}

function ghashUpdate(hash, hashKey, data) {
  for (let i = 0; i < data.length; i += 16) {
    const block = new Uint8Array(16);
    block.set(data.subarray(i, Math.min(i + 16, data.length)));
    xorBlock(hash, block);
    hash.set(ghashMultiply(hash, hashKey));
  }
}

function writeBitLength(buf, offset, byteLength) {
  let bits = byteLength * 8;
  for (let i = 7; i >= 0; i--) { buf[offset + i] = bits & 0xff; bits = Math.floor(bits / 256); }
}

function incrementCounter(counter) {
  for (let i = 15; i >= 12; i--) { counter[i] = counter[i] + 1 & 0xff; if (counter[i]) break; }
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// --- Pure JS AES-GCM decryption ---
function decryptDownloadPureJs(payload, aad) {
  const key = hexToBytes(DOWNLOAD_KEY_HEX);
  const iv = hexToBytes(payload.iv);
  const ct = hexToBytes(payload.ct);
  const tag = hexToBytes(payload.tag);
  const additionalData = hexToBytes(aad);

  if (iv.length !== 12 || tag.length !== 16) throw new Error('Unsupported 1Shows AES-GCM payload');

  const expandedKey = expandAes256Key(key);
  const hashKey = aesEncryptBlock(new Uint8Array(16), expandedKey);

  // GHASH
  const hash = new Uint8Array(16);
  ghashUpdate(hash, hashKey, additionalData);
  ghashUpdate(hash, hashKey, ct);
  const lenBlock = new Uint8Array(16);
  writeBitLength(lenBlock, 0, additionalData.length);
  writeBitLength(lenBlock, 8, ct.length);
  xorBlock(hash, lenBlock);
  hash.set(ghashMultiply(hash, hashKey));

  // Verify tag
  const counter = new Uint8Array(16);
  counter.set(iv);
  counter[15] = 1;
  const tagBlock = aesEncryptBlock(counter, expandedKey);
  xorBlock(tagBlock, hash);
  if (!constantTimeEqual(tagBlock, tag)) throw new Error('1Shows authentication failed');

  // Decrypt CTR
  const ctr = new Uint8Array(counter);
  const plaintext = new Uint8Array(ct.length);
  for (let i = 0; i < ct.length; i += 16) {
    incrementCounter(ctr);
    const keystream = aesEncryptBlock(ctr, expandedKey);
    const chunk = Math.min(16, ct.length - i);
    for (let j = 0; j < chunk; j++) plaintext[i + j] = ct[i + j] ^ keystream[j];
  }
  return JSON.parse(safeUtf8Decode(plaintext));
}

// --- WebCrypto AES-GCM decryption ---
async function decryptDownloadWithWebCrypto(payload, aad) {
  const crypto = globalThis.crypto;
  if (!crypto || !crypto.subtle) throw new Error('Web Crypto is unavailable');

  const key = hexToBytes(DOWNLOAD_KEY_HEX);
  const additionalData = hexToBytes(aad);
  const iv = hexToBytes(payload.iv);
  const ctAndTag = joinBytes(hexToBytes(payload.ct), hexToBytes(payload.tag));

  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData, tagLength: 128 }, cryptoKey, ctAndTag);
  return JSON.parse(safeUtf8Decode(new Uint8Array(plaintext)));
}

// --- WASM AES-GCM decryption (via remote module) ---
async function decryptDownloadWithWasm(payload, aad) {
  if (typeof WebAssembly === 'undefined' || !WebAssembly.instantiate) throw new Error('WebAssembly is unavailable');

  const manifest = await fetchJson(SITE_URL + '/makimaDL-manifest.json', { headers: API_HEADERS });
  const wasmUrl = absoluteUrl(manifest.main, SITE_URL);
  if (!wasmUrl || !manifest.exports) throw new Error('Invalid WASM manifest');

  const wasmRes = await fetch(wasmUrl, { headers: PAGE_HEADERS });
  if (!wasmRes.ok) throw new Error('WASM fetch failed: ' + wasmRes.status);

  const wasm = await WebAssembly.instantiate(await wasmRes.arrayBuffer(), {
    env: { abort() { throw new Error('1Shows decryptor aborted'); } }
  });
  const exports = (wasm.instance || wasm).exports;
  const meta = manifest.exports;

  const aadBytes = hexToBytes(aad);
  const ivBytes = hexToBytes(payload.iv);
  const ctBytes = hexToBytes(payload.ct);
  const tagBytes = hexToBytes(payload.tag);

  try {
    const keyPtr = writeBytes(exports, meta.alloc, meta.writeByte, aadBytes);
    const ivPtr = writeBytes(exports, meta.alloc, meta.writeByte, ivBytes);
    const ctPtr = writeBytes(exports, meta.alloc, meta.writeByte, ctBytes);
    const tagPtr = writeBytes(exports, meta.alloc, meta.writeByte, tagBytes);
    const outPtr = exports[meta.alloc](ctBytes.length);
    const result = exports[meta.decryptDownload](keyPtr, aadBytes.length, ivPtr, ivBytes.length, ctPtr, ctBytes.length, tagPtr, tagBytes.length, outPtr);

    if (result <= 0 || result > ctBytes.length) throw new Error('1Shows download decryption failed');
    const output = readBytes(exports, meta.readByte, outPtr, result);
    return JSON.parse(safeUtf8Decode(output));
  } finally {
    if (exports[meta.reset]) exports.reset();
  }
}

// --- Decryption dispatcher (tries Pure JS → WebCrypto → WASM) ---
async function decryptDownload(payload, aad) {
  try { return decryptDownloadPureJs(payload, aad); }
  catch {
    try { return await decryptDownloadWithWebCrypto(payload, aad); }
    catch { return decryptDownloadWithWasm(payload, aad); }
  }
}

// --- Helper functions for WASM ---
function writeBytes(exports, allocFn, writeFn, data) {
  const ptr = exports[allocFn](data.length);
  if (!ptr) throw new Error('Alloc failed');
  if (exports.memory) new Uint8Array(exports.memory.buffer, ptr, data.length).set(data);
  else for (let i = 0; i < data.length; i++) exports[writeFn](ptr + i, data[i]);
  return ptr;
}

function readBytes(exports, readFn, ptr, length) {
  if (exports.memory) return new Uint8Array(exports.memory.buffer).slice(ptr, ptr + length);
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) result[i] = exports[readFn](ptr + i);
  return result;
}

function joinBytes(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

// --- Fetch download sources from API ---
async function fetchDownloadSources(tmdbId, type, season, episode) {
  const tokenRes = await fetchJson(API_URL + '/download-token', { headers: API_HEADERS });
  if (!tokenRes.token) throw new Error('No download token');

  const path = type === 'tv'
    ? '/download/tv/' + encodeURIComponent(tmdbId) + '/' + encodeURIComponent(season) + '/' + encodeURIComponent(episode)
    : '/download/movie/' + encodeURIComponent(tmdbId);

  const data = await fetchJson(API_URL + path, {
    headers: Object.assign({}, API_HEADERS, { 'x-download-token': tokenRes.token })
  });

  const decrypted = await decryptDownload(data, tokenRes.token);
  return Array.isArray(decrypted.sources) ? decrypted.sources : [];
}

// --- Fetch TMDB metadata ---
async function fetchMediaDetails(tmdbId, type) {
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const data = await fetchJson(TMDB_URL + '/' + mediaType + '/' + encodeURIComponent(tmdbId) + '?api_key=' + TMDB_API_KEY, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT }
    });
    const title = data.title || data.name || data.original_title || data.original_name || 'Unknown';
    const date = data.release_date || data.first_air_date || '';
    const year = Number(date.slice(0, 4)) || null;
    return { title, year };
  } catch { return { title: 'Unknown', year: null }; }
}

// --- Check if URL is direct media ---
function isDirectMedia(url) {
  if (/\.(?:m3u8|mpd|mp4|mkv|webm)(?:$|[?#])/i.test(url)) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'pixeldrain.com' || host === 'buzzheavier.com' ||
      host.endsWith('.workers.dev') || host.endsWith('.r2.cloudflarestorage.com') ||
      host.includes('pixeldrain') || host.includes('iwebp.store') || host === 'fastdl.app';
  } catch { return false; }
}

// --- Normalize direct URL ---
function normalizeDirectUrl(url) {
  const cleaned = String(url || '').replace(/ /g, '%20');
  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();
    if (host === 'pixeldrain.com' || host === 'www.pixeldrain.com' || host.endsWith('.iwebp.store')) {
      const match = parsed.pathname.match(/^\/(?:u|l)\/([^/?#]+)/i);
      if (match) return 'https://pixeldrain.com/u/' + match[1];
    }
  } catch {}
  return cleaned;
}

// --- Build stream entry ---
function makeStream(source, resolved, index, total, metadata) {
  const url = normalizeDirectUrl(resolved.url);
  const routeName = resolved.route || 'Direct';
  const emoji = getResolutionEmoji(source.quality);

  const sortTag = getInvertedSortTag(parseSizeToMB(source.size), 999999);
  const name = sortTag + '1Shows • ' + source.quality + ' • ' + routeName + (total > 1 ? ' ' + (index + 1) : '');

  const titleLine = metadata.mediaType === 'tv'
    ? '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '') + ' | S' + metadata.season + 'E' + metadata.episode
    : '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '');

  const fullTitle = [titleLine, emoji + ' | 🗣️ ' + (source.audio || 'Original'), '🎞️ ' + (source.format || 'MKV') + ' | 💾 ' + (source.size || 'N/A'), '🔗 ' + routeName].filter(Boolean).join('\n');

  return {
    name, title: fullTitle, size: fullTitle, description: fullTitle,
    url, type: /\.m3u8/i.test(url) ? 'application/x-mpegURL' : 'video/mp4',
    behaviorHints: { notWebReady: true, proxyHeaders: { request: { 'User-Agent': USER_AGENT, 'Referer': SITE_URL + '/' } } }
  };
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  const mediaType = String(type || '').toLowerCase().trim();
  const isTV = mediaType === 'tv' || mediaType === 'show' || mediaType === 'tvshow' || mediaType === 'tv_show' || mediaType === 'tv';

  if (!tmdbId) return [];
  const s = Number(season), ep = Number(episode);
  if (isTV && (!Number.isInteger(s) || s < 1 || !Number.isInteger(ep) || ep < 1)) return [];

  try {
    const [sources, metadata] = await Promise.all([
      fetchDownloadSources(String(tmdbId), isTV ? 'tv' : 'movie', s, ep),
      fetchMediaDetails(String(tmdbId), isTV ? 'tv' : 'movie')
    ]);

    const media = { title: metadata.title, year: metadata.year, mediaType: isTV ? 'tv' : 'movie', season: s, episode: ep };
    const filtered = sources.filter(src => src && src.url);

    const resolved = await Promise.all(filtered.map(src => resolveSource(src, media)));
    const allStreams = [].concat(...resolved);
    const unique = allStreams.filter((s, i) => s && s.url && allStreams.findIndex(x => x && x.url === s.url) === i);

    // Health check
    const checked = await Promise.all(unique.map(async s => s && (await isStreamAlive(s)) ? s : null));
    const alive = checked.filter(Boolean);

    // Sort by quality then size
    alive.sort((a, b) => {
      if (b.qualityRank !== a.qualityRank) return b.qualityRank - a.qualityRank;
      return b.sizeInMB - a.qualityRank;
    });

    // Clean up internal fields
    alive.forEach(s => { delete s.qualityRank; delete s.sizeInMB; });
    return alive;
  } catch { return []; }
}

// --- Resolve source URL through redirect chains ---
async function resolveSource(source, depth = 0) {
  if (depth > 5) return null;
  const url = absoluteUrl(source.url, SITE_URL);
  if (!url) return null;
  if (isDirectMedia(url)) return { url: normalizeDirectUrl(url), route: source.label || 'Direct' };

  try {
    const page = await fetchText(url, { headers: Object.assign({}, PAGE_HEADERS, { Referer: SITE_URL + '/' }) });
    const redirect = page.html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i);
    const links = anchors(page.html, page.url);
    const preferred = links.find(l => /(?:direct download|instant dl|pixeldrain|buzzheavier)/i.test(l.text))
      || links.find(l => isDirectMedia(l.href));
    const nextUrl = preferred?.href || (redirect ? absoluteUrl(redirect[1], page.url) : null);

    if (!nextUrl || nextUrl === url) return null;
    return resolveSource({ url: nextUrl, label: source.label }, depth + 1);
  } catch { return null; }
}

// --- Check if stream is alive ---
async function isStreamAlive(stream) {
  const start = Date.now();
  try {
    const res = await fetch(stream.url, {
      method: 'HEAD',
      headers: Object.assign({}, stream.headers || {}, { Range: 'bytes=0-1' }),
      redirect: 'follow', skipSizeCheck: true
    });
    stream._probeMs = Date.now() - start;
    return res.ok || res.status === 206;
  } catch { return true; } // Assume alive on network error
}

// Export
typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
