// Fully decoded provider source files from All-in-One-Nuvio
// These have been reverse-engineered from the obfuscated originals

export interface DecodedFile {
  filename: string;
  provider: string;
  description: string;
  decoded: string;
}

export const decodedFiles: DecodedFile[] = [
  {
    filename: 'vidsrc.js',
    provider: 'VidSrc',
    description: 'VidSrc.me streaming provider with multi-server support and custom decryption',
    decoded: `// ============================================
// DECODED: providers/vidsrc.js
// Provider: VidSrc
// Original: Heavily obfuscated with string array rotation
// ============================================

const BASEDOM = 'https://whisperingauroras.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

// --- Safe Fetch with timeout ---
function safeFetch(url, options = {}, timeout = 8000) {
  let controller, timer;
  try {
    controller = new AbortController();
    timer = setTimeout(() => controller.abort(), timeout);
  } catch { controller = null; }

  const fetchOptions = Object.assign({ method: 'GET' }, options);
  if (controller) fetchOptions.signal = controller.signal;

  return fetch(url, fetchOptions)
    .then(res => { if (timer) clearTimeout(timer); return res; })
    .catch(err => { if (timer) clearTimeout(timer); throw err; });
}

// --- Decryption Functions (11 different methods) ---

// Method 1: Chunk reverse join
function bMGyx71TzQLfdonN(input) {
  if (typeof input !== 'string') return '';
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(input.slice(i, i + chunkSize));
  }
  return chunks.reverse().join('');
}

// Method 2: XOR with key + char shift -3 + base64 decode
function Iry9MQXnLs(input) {
  const key = 'pWB9V)[*4I\`nJpp?ozyB~dbr9yt!_n4u';
  const bytes = input.match(/.{1,2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join('');
  let xored = '';
  for (let i = 0; i < bytes.length; i++) {
    xored += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  let shifted = '';
  for (let i = 0; i < xored.length; i++) {
    shifted += String.fromCharCode(xored.charCodeAt(i) - 3);
  }
  try { return atob(shifted); } catch { return ''; }
}

// Method 3: ROT13 + reverse + base64 decode
function IGLImMhWrI(input) {
  const reversed = input.split('').reverse().join('');
  const rot13 = reversed.replace(/[a-zA-Z]/g, c =>
    String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))
  );
  try { return atob(rot13); } catch { return ''; }
}

// Method 4: Take every other char + base64 decode
function GTAxQyTyBx(input) {
  const reversed = input.split('').reverse().join('');
  let result = '';
  for (let i = 0; i < reversed.length; i += 2) {
    result += reversed[i];
  }
  try { return atob(result); } catch { return ''; }
}

// Method 5: Reverse + XOR with key
function C66jPHx8qu(input) {
  const reversed = input.split('').reverse().join('');
  const key = 'X9a(O;FMV2-7VO5x;Ao :dN1NoFs?j,';
  const bytes = reversed.match(/.{1,2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join('');
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Method 6: Reverse + char shift -1 + hex decode
function MyL1IRSfHe(input) {
  const reversed = input.split('').reverse().join('');
  let shifted = '';
  for (let i = 0; i < reversed.length; i++) {
    shifted += String.fromCharCode(reversed.charCodeAt(i) - 1);
  }
  let result = '';
  for (let i = 0; i < shifted.length; i += 2) {
    result += String.fromCharCode(parseInt(shifted.substr(i, 2), 16));
  }
  return result;
}

// Method 7: Strip prefix/suffix + base64 + XOR with repeating key
function detdj7JHiK(input) {
  const stripped = input.slice(10, -16);
  const key = 'vmKrwfZEsb'; // decoded key
  let decoded;
  try { decoded = atob(stripped); } catch { return ''; }
  const keyStream = key.repeat(Math.ceil(decoded.length / key.length)).substring(0, decoded.length);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ keyStream.charCodeAt(i));
  }
  return result;
}

// Method 8: ROT3 cipher (shift by 3 positions in alphabet)
function nZlUnj2VSo(input) {
  const map = {
    'x':'a','y':'b','z':'c','a':'d','b':'e','c':'f','d':'g','e':'h',
    'f':'i','g':'j','h':'k','i':'l','j':'m','k':'n','l':'o','m':'p',
    'n':'q','o':'r','p':'s','q':'t','r':'u','s':'v','t':'w','u':'x',
    'v':'y','w':'z',
    'X':'A','Y':'B','Z':'C','A':'D','B':'E','C':'F','D':'G','E':'H',
    'F':'I','G':'J','H':'K','I':'L','J':'M','K':'N','L':'O','M':'P',
    'N':'Q','O':'R','P':'S','Q':'T','R':'U','S':'V','T':'W','U':'X',
    'V':'Y','W':'Z'
  };
  return input.replace(/[xyzabcdefghijklmnopqrstuvwXYZABCDEFGHIJKLMNOPQRSTUVW]/g, c => map[c] || c);
}

// Method 9: Reverse + URL-safe base64 + char shift -5
function laM1dAi3vO(input) {
  const reversed = input.split('').reverse().join('');
  const base64 = reversed.replace(/-/g, '+').replace(/_/g, '/');
  let decoded;
  try { decoded = atob(base64); } catch { return ''; }
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) - 5);
  }
  return result;
}

// Method 10: URL-safe base64 + char shift -7
function GuxKGDsA2T(input) {
  const reversed = input.split('').reverse().join('');
  const base64 = reversed.replace(/-/g, '+').replace(/_/g, '/');
  let decoded;
  try { decoded = atob(base64); } catch { return ''; }
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) - 7);
  }
  return result;
}

// Method 11: Reverse + URL-safe base64 + char shift -3
function LXVUMCoAHJ(input) {
  const reversed = input.split('').reverse().join('');
  const base64 = reversed.replace(/-/g, '+').replace(/_/g, '/');
  let decoded;
  try { decoded = atob(base64); } catch { return ''; }
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) - 3);
  }
  return result;
}

// --- Decryption dispatcher ---
function decrypt(data, method) {
  switch (method) {
    case 'LXVUMCoAHJ': return LXVUMCoAHJ(data);
    case 'GuxKGDsA2T': return GuxKGDsA2T(data);
    case 'laM1dAi3vO': return laM1dAi3vO(data);
    case 'nZlUnj2VSo': return nZlUnj2VSo(data);
    case 'Iry9MQXnLs': return Iry9MQXnLs(data);
    case 'IGLImMhWrI': return IGLImMhWrI(data);
    case 'GTAxQyTyBx': return GTAxQyTyBx(data);
    case 'C66jPHx8qu': return C66jPHx8qu(data);
    case 'MyL1IRSfHe': return MyL1IRSfHe(data);
    case 'detdj7JHiK': return detdj7JHiK(data);
    case 'bMGyx71TzQLfdonN': return bMGyx71TzQLfdonN(data);
    default: return null;
  }
}

// --- Server extraction from embed page ---
function serversLoad(html) {
  const servers = [];
  const titleMatch = html.match(/<title>([^<]*)<\\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const iframeMatch = html.match(/<iframe\\s+[^>]*src="([^"]*)"/i);
  const iframeSrc = iframeMatch ? iframeMatch[1] : '';

  if (iframeSrc) {
    BASEDOM = new URL(iframeSrc.includes('//') ? 'https://' + iframeSrc : iframeSrc).origin;
  }

  const serverRegex = /class="[^"]*server[^"]*"[^>]*data-hash="([^"]*)"[^>]*>([^<]*)/g;
  let match;
  while ((match = serverRegex.exec(html)) !== null) {
    servers.push({ name: match[2].trim(), dataHash: match[1] });
  }
  return { servers, title };
}

// --- ProRCP handler (complex multi-step decryption) ---
async function PRORCPhandler(hash) {
  try {
    const rcpResponse = await safeFetch(BASEDOM + '/prorcp/' + hash, {
      headers: { Referer: 'https://vidsrc.me/', 'User-Agent': UA }
    }, 5000);
    const rcpHtml = await rcpResponse.text();

    // Find script tags
    const scriptMatches = rcpHtml.match(/<script\\s+src="\\/([^"]*\\.js)\\?\\_=([^"]*)"><\\/script>/gm);
    if (!scriptMatches) return null;

    // Get the main script (not cpt.js)
    const scriptMatch = scriptMatches[scriptMatches.length - 1].includes('cpt.js')
      ? scriptMatches[scriptMatches.length - 2].replace(/.*src="\\/([^"]*\\.js)\\?\\_=([^"]*)".*/, '$1')
      : scriptMatches[scriptMatches.length - 1].replace(/.*src="\\/([^"]*\\.js)\\?\\_=([^"]*)".*/, '$1');

    const scriptResponse = await safeFetch(BASEDOM + '/' + scriptMatch, {}, 5000);
    const scriptContent = await scriptResponse.text();

    // Extract decryption method and data
    const pattern = /{}\\}window\\[([^"]+)\\("([^"]+)"\\)/;
    const methodMatch = scriptContent.match(pattern);
    if (!methodMatch || methodMatch.length < 3) return null;

    const methodName = methodMatch[1].split('').reverse().join('');
    const encryptedData = methodMatch[2].toString().split('').reverse().join('');
    const decryptedKey = decrypt(encryptedData, methodName);
    if (!decryptedKey) return null;

    // Find the final encrypted URL
    const urlRegex = new RegExp(decryptedKey + '"[^>]*>([^<]*)', 'i');
    const urlMatch = rcpHtml.match(urlRegex);
    if (!urlMatch) return null;

    const encryptedUrl = urlMatch[1].split('').reverse().join('');
    return decrypt(encryptedUrl, decryptedKey);
  } catch (e) {
    console.error('[VidSrc] ProRCP error: ' + e.message);
    return null;
  }
}

// --- RCP source grabber ---
function rcpGrabber(html) {
  const srcMatch = html.match(/src:\\s*'([^']*)'/);
  if (!srcMatch) return null;
  return srcMatch[1];
}

// --- Title parser ---
function cleanTitleString(rawTitle) {
  if (!rawTitle) return { title: 'Unknown', year: '2026' };
  let title = rawTitle.replace(/\\s*-\\s*VidSrc\\.me$/i, '').trim();
  const yearMatch = title.match(/\\s*\\((\\d{4})\\)$/);
  let year = '2026';
  if (yearMatch) {
    year = yearMatch[1];
    title = title.replace(/\\s*\\(\\d{4}\\)$/, '').trim();
  }
  return { title, year };
}

// --- TMDB duration fetcher ---
async function fetchTMDBDuration(tmdbId, type, season, episode) {
  let fallback = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const id = String(tmdbId).replace(/\\D/g, '');
    const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + id + '?api_key=' + TMDB_API_KEY + '&language=en-US';
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    let duration = fallback;

    if (type === 'movie' && data.runtime) {
      duration = data.runtime + ' min';
    } else if (type === 'tv' && season != null && episode != null) {
      const epUrl = 'https://api.themoviedb.org/3/tv/' + id + '/season/' + season + '/episode/' + episode + '?api_key=' + TMDB_API_KEY;
      const epRes = await fetch(epUrl);
      if (epRes.ok) {
        const epData = await epRes.json();
        if (epData.runtime) duration = epData.runtime + ' min';
        else if (data.episode_run_time && data.episode_run_time.length > 0)
          duration = data.episode_run_time[0] + ' min';
      }
    }
    return duration;
  } catch { return fallback; }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  try {
    const isMovie = type === 'movie';
    const embedUrl = isMovie
      ? 'https://vidsrc.me/embed/' + tmdbId
      : 'https://vidsrc.me/embed/' + tmdbId + '/' + (season || 1) + '-' + (episode || 1);

    console.log('[VidSrc.me] Fetching embed page: ' + embedUrl);

    const pageFetch = safeFetch(embedUrl, {}, 8000);
    const durationFetch = fetchTMDBDuration(tmdbId, type, season, episode);

    const pageRes = await pageFetch;
    const pageHtml = await pageRes.text();
    const duration = await durationFetch;

    const { servers, title } = serversLoad(pageHtml);
    const { title: cleanTitle, year } = cleanTitleString(title);

    console.log('[VidSrc.me] Parsed servers: ' + servers.length);

    const streams = [];

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];
      try {
        console.log('[VidSrc.me] Fetching RCP for server: ' + server.name);
        const rcpRes = await safeFetch(BASEDOM + '/prorcp/' + server.dataHash, {}, 5000);
        const rcpHtml = await rcpRes.text();
        const rcpSrc = rcpGrabber(rcpHtml);

        if (rcpSrc && rcpSrc.startsWith(0, 8) === '/prorcp/') {
          console.log('[VidSrc.me] Processing ProRCP for: ' + server.name);
          const finalUrl = await PRORCPhandler(rcpSrc.replace('/prorcp/', ''));

          if (finalUrl) {
            let streamUrl = finalUrl;

            // Handle token generation for protected hosts
            if (streamUrl.includes('__TOKEN__') || streamUrl.includes('__TOKENPG__')) {
              try {
                const host = new URL(streamUrl.split('?')[0]).hostname;
                const tokenRes = await safeFetch('https://' + host + '/generate.php', {
                  headers: { Referer: 'https://vidsrc.me/', 'User-Agent': UA }
                }, 4000);
                const token = (await tokenRes.text()).trim();
                if (token && token.length > 10) {
                  streamUrl = streamUrl.replace(/__TOKEN__/g, token).replace(/__TOKENPG__/g, token);
                }
              } catch {}
            }

            // Parse multi-quality URLs
            const qualities = streamUrl.split('?');
            for (let q = 0; q < qualities.length; q++) {
              const url = qualities[q].trim();
              if (!url) continue;

              let quality = '1080p';
              if (url.includes('/720/') || url.includes('720p') || url.includes('/7a67b')) quality = '720p';
              else if (url.includes('/360/') || url.includes('360p') || url.includes('/7a67b')) quality = '360p';
              else if (url.includes('2160') || url.includes('1080p')) quality = '1080p';

              const serverNum = server.name.replace(/\\D+/g, '');
              let serverLabel = serverNum ? 'Server ' + serverNum : 'Server ' + (i + 1);
              if (qualities.length > 1) serverLabel += ' (Part ' + (q + 1) + ')';

              let format = 'MKV';
              if (url.includes('.m3u8')) format = 'M3U8';
              else if (url.includes('.mp4')) format = 'MP4';

              const seLabel = !isMovie && season && episode
                ? ' S' + String(season).padStart(2, '0') + 'E' + String(episode).padStart(2, '0') : '';
              const displayTitle = '🎬 ' + cleanTitle + seLabel + ' - (' + year + ')';
              const line2 = '⭐ ' + quality.toUpperCase() + ' | 🌍 Original-Audio | 🎧 AAC';
              const line3 = '🎞️ ' + format + ' | 🎥 x264 | ⏳ ' + duration;
              const line4 = '📎 ' + serverLabel;
              const fullTitle = displayTitle + '\\n' + line2 + '\\n' + line3 + '\\n' + line4;

              streams.push({
                name: 'VidSrc | ' + quality.toUpperCase(),
                title: fullTitle,
                size: fullTitle,
                description: fullTitle,
                url: url,
                quality: '',
                language: '',
                headers: {},
                subtitles: [],
                provider: 'VidSrc'
              });
            }
          }
        }
      } catch (e) {
        console.error('[VidSrc] Server ' + server.name + ' error: ' + e.message);
      }
    }

    console.log('[VidSrc] Total streams found: ' + streams.length);
    return streams;
  } catch (e) {
    console.error('[VidSrc.me] Scraper error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };`
  },
  {
    filename: 'vidlink.js',
    provider: 'VidLink',
    description: 'VidLink.pro streaming with encrypted TMDB ID lookup and M3U8 parsing',
    decoded: `// ============================================
// DECODED: providers/vidlink.js
// Provider: VidLink
// Original: String array + base64 obfuscation
// ============================================

const VIDLINK_API = 'https://vidlink.pro';
const DECRYPT_API = 'https://api.vidlink.pro';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Connection': 'keep-alive',
  'Referer': 'https://vidlink.pro/',
  'Origin': 'https://vidlink.pro'
};

// --- Format bytes to human-readable ---
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
  return bytes.toFixed(2) + ' ' + units[i];
}

// --- Calculate estimated file size ---
function calculateCalculatedFallbackSize(quality, duration) {
  const dur = parseInt(duration) || 90;
  const q = String(quality || '').toLowerCase();
  let bitrate = 5200; // kbps default

  if (q.includes('4k') || q.includes('2160')) bitrate = 16000;
  else if (q.includes('1080') || q.includes('fhd')) bitrate = 5200;
  else if (q.includes('720') || q.includes('hd')) bitrate = 2500;
  else if (q.includes('480') || q.includes('sd')) bitrate = 1200;

  const factor = 0.94 + (dur % 9) / 100;
  const sizeBytes = bitrate * factor * 1000 / 8 * (dur * 60);
  return formatBytes(sizeBytes);
}

// --- TMDB metadata fetcher ---
async function getTmdbMetadata(tmdbId, type, season, episode) {
  let fallbackDuration = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url);
    if (!res.ok) return { name: 'Unknown Title', year: 'N/A', duration: fallbackDuration };

    const data = await res.json();
    let duration = fallbackDuration;

    if (type === 'movie' && data.runtime) {
      duration = data.runtime + ' min';
    } else if (type === 'tv') {
      const epUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId + '/season/' + season + '/episode/' + episode + '?api_key=' + TMDB_API_KEY;
      const epRes = await fetch(epUrl);
      if (epRes.ok) {
        const epData = await epRes.json();
        if (epData.runtime) duration = epData.runtime + ' min';
        else if (data.episode_run_time && data.episode_run_time.length > 0)
          duration = data.episode_run_time[0] + ' min';
      }
    }

    return {
      name: data.title || data.name || 'Unknown Title',
      year: (data.release_date || data.first_air_date || '').split('-')[0] || 'N/A',
      duration: duration
    };
  } catch {
    return { name: 'Unknown Title', year: 'N/A', duration: fallbackDuration };
  }
}

// --- M3U8 playlist parser ---
async function generateM3u8(playlistUrl, headers = {}) {
  try {
    console.log('[VidLink] Parsing M3U8: ' + playlistUrl);
    const res = await fetch(playlistUrl, { headers });
    const content = await res.text();
    const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/')) + '/';
    const streams = [];
    const regex = /#EXT-X-STREAM-INF:.*?RESOLUTION=(\\d+x\\d+).*?\\n([^\\n]+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const height = parseInt(match[1].split('x')[1]);
      if (height < 720) continue;
      const quality = height + 'p';
      let streamUrl = match[2].trim();

      if (!streamUrl.startsWith('http')) {
        if (streamUrl.startsWith('/')) {
          const origin = new URL(playlistUrl).origin;
          streamUrl = origin + streamUrl;
        } else {
          streamUrl = baseUrl + streamUrl;
        }
      }
      streams.push({ quality, url: streamUrl });
    }
    return streams;
  } catch (e) {
    console.warn('[VidLink] M3U8 parse error:', e);
    return [];
  }
}

// --- Quality sorting with zero-width chars ---
function getSortedQuality(quality) {
  if (!quality) return 'Auto';
  const lower = quality.toLowerCase();
  if (lower.includes('auto')) return '1080p';
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd'))
    return '\\u200b' + quality;  // zero-width space prefix for sorting
  if (lower.includes('1080') || lower.includes('fhd'))
    return '\\u200b\\u200b' + quality;
  if (lower.includes('720') || lower.includes('hd'))
    return '\\u200b\\u200b\\u200b' + quality;
  if (lower.includes('480') || lower.includes('sd'))
    return '\\u200b\\u200b\\u200b\\u200b' + quality;
  return '\\u200b\\u200b' + quality;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  console.log('[Vidlink] Fetching streams for ' + type + ' ' + tmdbId);
  try {
    // Step 1: Get encrypted TMDB ID from decrypt API
    const decryptUrl = DECRYPT_API + '/api/m/' + tmdbId;
    const decryptRes = await fetch(decryptUrl);
    const decryptData = await decryptRes.json();
    const encryptedId = decryptData.result;
    if (!encryptedId) {
      console.log('[Vidlink] No encrypted ID returned');
      return [];
    }

    // Step 2: Get TMDB metadata
    const isMovie = type !== 'tv' && season == null;
    const mediaType = isMovie ? 'movie' : 'tv';
    const metadata = await getTmdbMetadata(tmdbId, mediaType, season, episode);

    // Step 3: Fetch stream playlist
    const streamUrl = isMovie
      ? VIDLINK_API + '/api/b/movie/' + encryptedId
      : VIDLINK_API + '/api/b/tv/' + encryptedId + '/' + season + '/' + episode;

    console.log('[Vidlink] Fetching: ' + streamUrl);
    const streamRes = await fetch(streamUrl, { headers: HEADERS });
    const streamData = await streamRes.json();
    const playlistUrl = streamData && streamData.stream && streamData.stream.url;
    if (!playlistUrl) {
      console.log('[Vidlink] No playlist in response');
      return [];
    }

    // Step 4: Build stream entries
    const streams = [];

    const addStream = (quality, url) => {
      let qualityLabel = '1080P';
      let displayQuality = '1080p FHD';
      const q = String(quality).toLowerCase();

      if (q.includes('2160') || q.includes('4k')) {
        displayQuality = '2160p 4K'; qualityLabel = '2160P';
      } else if (q.includes('1080')) {
        displayQuality = '1080p FHD'; qualityLabel = '1080P';
      } else if (q.includes('720')) {
        displayQuality = '720p HD'; qualityLabel = '720P';
      } else if (q.includes('480')) {
        displayQuality = '480p SD'; qualityLabel = '480P';
      }

      const size = calculateCalculatedFallbackSize(qualityLabel, metadata.duration);
      const titleText = metadata.name + (!isMovie ? ' S' + season + 'E' + episode : '');

      const name = 'VidLink | ' + displayQuality;
      const fullTitle = '🎬 ' + titleText + ' (' + metadata.year + ') | ' + qualityLabel + ' | ' + size +
        '\\n🎞️ M3U8 | ⏱️ ' + metadata.duration + ' | 📌 Main Mirror';

      streams.push({
        name: name,
        title: fullTitle,
        url: url,
        quality: quality,
        type: 'm3u8',
        headers: {
          'User-Agent': HEADERS['User-Agent'],
          'Referer': VIDLINK_API + '/',
          'Origin': VIDLINK_API
        },
        provider: 'vidlink'
      });
    };

    // Add main playlist
    addStream('1080p', playlistUrl);

    // Parse M3U8 for quality variants
    try {
      const variants = await generateM3u8(playlistUrl, {
        'Referer': VIDLINK_API + '/',
        'User-Agent': HEADERS['User-Agent']
      });
      variants.forEach(v => addStream(v.quality, v.url));
    } catch {}

    console.log('[Vidlink] Found playlist stream');
    return streams.map(s => ({ ...s, quality: getSortedQuality(s.quality) }));
  } catch (e) {
    console.error('[Vidlink] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };`
  },
  {
    filename: 'videasy.js',
    provider: 'VidEasy',
    description: 'VidEasy streaming with custom Wings database decryption (XOR stream cipher)',
    decoded: `// ============================================
// DECODED: providers/videasy.js
// Provider: VidEasy
// Original: Custom encryption + string array obfuscation
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const WINGS_API_BASE = 'https://wings.xyz/api'; // decoded API base
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

// Constants
const Js = 61;   // State size
const _f = 8;    // Init rounds
const ms = 0x9e3779b9; // Golden ratio constant
const Ys = [0x6d, 0x76, 0x6d, 0x31]; // Magic seed bytes "mvm1"

// MurmurHash3 finalizer
function ui(x) {
  x >>>= 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

// Bit rotation
function ps(x, n) {
  x >>>= 0;
  n &= 0x1f;
  return n === 0 ? x >>> 0 : (x << n | x >>> (32 - n)) >>> 0;
}

// Simple hash (used for accumulator)
function If(data) {
  let h = 0x67452301 >>> 0;
  for (let i = 0; i < data.length; i++) {
    h = ps((h ^ Math.imul(data.charCodeAt(i), [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174][i & 0xf])) >>> 0, 5);
  }
  return ui(h);
}

// RC4-like S-box initialization
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

// FNV-1a hash
function wf(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 0x1000193) >>> 0;
  }
  return ui(hash);
}

// Combined hash function
function vf(a, b, c) {
  return ((a ^ b) >>> 0 | (a & b & c) >>> 0) >>> 0;
}

// Check if number is even/odd
function Sf(n) { return (n * (n + 1) & 1) === 0; }
function bf(n) { return (n * (n + 1) & 1) === 1; }

// Initialize cipher state from key + seed
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

// Generate next pseudo-random number from state
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

// Generate keystream bytes
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

// URL-safe base64 decoder
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

// Main decryption function for Wings database
function decryptWingsDatabase(encrypted, key, seed) {
  const data = decodeBase64(encrypted);
  const keystream = Cf(key, seed, data.length);

  // XOR decrypt
  for (let i = 0; i < data.length; i++) {
    data[i] ^= keystream[i];
  }

  // Verify magic bytes
  for (let i = 0; i < Ys.length; i++) {
    if (data[i] !== Ys[i]) throw new Error('decrypt failed: bad seed or tampered payload');
  }

  // Decode UTF-8
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

// --- TMDB metadata fetcher ---
async function fetchMediaDetails(tmdbId, type, season, episode) {
  let fallbackDuration = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const id = String(tmdbId).replace(/\\D/g, '');
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

// --- Language code mapper ---
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

// --- Format streams for Nuvio display ---
function formatStreamsForNuvio(jsonStr, serverName, metadata, season, episode) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return [];

    const headers = {
      'Referer': 'https://www.vidking.net/',
      'Origin': 'https://www.vidking.net',
      'User-Agent': USER_AGENT
    };

    // Parse subtitles
    const subtitles = (data.subtitles || []).map(sub => ({
      url: sub.url,
      language: getLangCode(sub.language || sub.lang),
      name: sub.label || sub.lang || 'English',
      headers: headers
    }));

    // Server emoji mapping
    const emoji = {
      'Carbon': '💎', 'Helium': '🎈', 'Lithium': '🔋', 'Oxygen': '💨',
      'Krypton': '🦸', 'Titanium': '🛡️', 'Hydrogen': '💧',
      'Nitrogen': '🌿', 'Neon': '💡', 'Aluminium': '💿'
    };
    const serverEmoji = emoji[serverName] || '🎬';

    // Server source mapping
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
      let cleanQuality = quality.replace(/\\s*server\\s*2\\s*$/gi, '').trim();
      if (serverName === 'Oxygen') cleanQuality = '1080p';

      const lower = cleanQuality.toLowerCase();
      let qualityLabel = '⚡ ' + cleanQuality;
      if (lower.includes('2160') || lower.includes('4k')) qualityLabel = '🌟 2160p 4K';
      else if (lower.includes('1080')) qualityLabel = '🔥 1080p';
      else if (lower.includes('720')) qualityLabel = '⚡ 720p';
      else if (lower === 'auto') qualityLabel = '🔄 Auto';

      // Audio language detection
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
      if (displayName === 'Krypton') displayName = displayName.replace(/\\s*(1080p\\s+)?server\\s*2\\s*$/gi, '').trim();

      const fullTitle = '🎬 ' + titleText + ' (' + metadata.year + ')\\n' +
        qualityLabel + ' | ' + audioFlag + ' | 🎧 AAC\\n' +
        '🎞️ ' + format + ' | ⏱️ ' + metadata.duration + '\\n' +
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

// --- Fetch from individual Wings server ---
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

    // Decrypt using custom stream cipher
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

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season = null, episode = null) {
  console.log('[VidEasy] Fetching: ' + tmdbId + ', Type: ' + type +
    (type === 'tv' ? ', S:' + season + 'E:' + episode : ''));

  try {
    // Step 1: Get TMDB metadata
    const metadata = await fetchMediaDetails(tmdbId, type, season, episode);
    if (!metadata) {
      console.error('[VidEasy] No metadata');
      return [];
    }
    console.log('[VidEasy] Found: "' + metadata.title + '" (' + metadata.year + ') | Duration: ' + metadata.duration);

    // Step 2: Get encryption seed
    const seedUrl = WINGS_API_BASE + '/seed?mediaId=' + tmdbId;
    const seedRes = await fetch(seedUrl, { headers: REQUEST_HEADERS });
    if (!seedRes.ok) throw new Error('Seed HTTP ' + seedRes.status);
    const seedData = await seedRes.json();
    const seed = seedData.seed;
    if (!seed) throw new Error('No seed returned from API');
    console.log('[VidEasy] Got seed: ' + seed);

    // Step 3: Query all servers in parallel
    const serverNames = Object.keys(SERVERS);
    const promises = serverNames.map(name =>
      fetchFromWingsServer(name, SERVERS[name], type, tmdbId, metadata, seed, season, episode)
    );
    const results = await Promise.all(promises);

    // Flatten results
    const allStreams = [];
    results.forEach(streams => allStreams.push(...streams));

    // Deduplicate by URL
    const unique = [];
    const seen = new Set();
    allStreams.forEach(s => {
      if (!seen.has(s.url)) {
        seen.add(s.url);
        unique.push(s);
      }
    });

    // Sort: 4K first, then by server order
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

module.exports = { getStreams };`
  },
  {
    filename: 'castle.js',
    provider: 'Castle',
    description: 'Castle multi-language provider with AES-CBC decryption and dynamic security key',
    decoded: `// ============================================
// DECODED: providers/castle.js
// Provider: Castle (api.hlowb.com)
// Original: AES encryption + string array obfuscation
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const CASTLE_BASE = 'https://api.hlowb.com';
const PKG = 'com.castle.app';
const CHANNEL = 'castle';
const CLIENT = '1';
const LANG = 'en-US';

const API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Referer': CASTLE_BASE
};

const PLAYBACK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'video',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'DNT': '1'
};

// --- HTTP request helper ---
async function makeRequest(url, options = {}) {
  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: { ...API_HEADERS, ...options.headers },
      body: options.body
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
    return res;
  } catch (e) {
    console.error('[Castle] Request failed for ' + url + ': ' + e.message);
    throw e;
  }
}

// --- Extract cipher text from response ---
async function extractCipherFromResponse(response) {
  const text = await response.text();
  const jsonStr = text.trim();
  if (!jsonStr) throw new Error('Empty response');
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.success && typeof parsed.data === 'string')
      return parsed.data.trim();
  } catch {}
  return jsonStr;
}

// --- Extract data block from response ---
function extractDataBlock(response) {
  if (response && response.data && typeof response.data === 'object')
    return response.data;
  return response || {};
}

// --- TMDB metadata ---
async function getTMDBDetails(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const url = TMDB_BASE_URL + '/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&language=en-US';
  const res = await makeRequest(url);
  const data = await res.json();
  const title = type === 'tv' ? data.name : data.title;
  const dateStr = type === 'tv' ? data.first_air_date : data.release_date;
  const year = dateStr ? parseInt(dateStr.split('-')[0]) : null;
  return { title, year, tmdbId };
}

// --- AES-CBC Decryption ---
async function decryptCastle(cipherText, securityKey) {
  console.log('[Castle] Decrypting response...');
  try {
    const CryptoJS = require('crypto-js');

    const IV_SALT = 'T!BgJB';
    const keyBytes = CryptoJS.enc.Utf8.parse(securityKey);
    const saltBytes = CryptoJS.enc.Utf8.parse(IV_SALT);
    let combined = keyBytes.concat(saltBytes);

    // Pad/truncate to 16 bytes
    if (combined.sigBytes < 16) {
      const padding = CryptoJS.lib.WordArray.create(new Array(16 - combined.sigBytes).fill(0));
      combined = combined.concat(padding);
    } else if (combined.sigBytes > 16) {
      combined = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    }

    const aesKey = combined;
    const iv = combined; // Same as key

    const decrypted = CryptoJS.AES.decrypt(cipherText, aesKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Decryption returned empty');
    console.log('[Castle] Local decryption successful');
    return result;
  } catch (e) {
    console.error('[Castle] Local decryption failed: ' + e.message);
    throw e;
  }
}

// --- Fetch security key from Castle API ---
async function getSecurityKey() {
  console.log('[Castle] Fetching security key...');
  const url = CASTLE_BASE + '/api/v1/security?key=' + CHANNEL + '&clientType=' + CLIENT + '&packageName=' + PKG + '&lang=' + LANG;
  const res = await makeRequest(url);
  const data = await res.json();
  if (data.code !== 200 || !data.data) throw new Error('Security key error: ' + JSON.stringify(data));
  console.log('[Castle] Got security key');
  return data.data;
}

// --- Search Castle for content ---
async function searchCastle(securityKey, query, page = 1, size = 30) {
  console.log('[Castle] Searching for: ' + query);
  const params = new URLSearchParams({
    channel: CHANNEL, clientType: CLIENT, keyword: query,
    lang: LANG, mode: '1', packageName: PKG,
    page: page.toString(), size: size.toString()
  });
  const url = CASTLE_BASE + '/api/v1/search?' + params.toString();
  const res = await makeRequest(url);
  const cipher = await extractCipherFromResponse(res);
  const decrypted = await decryptCastle(cipher, securityKey);
  return JSON.parse(decrypted);
}

// --- Get movie/series details ---
async function getDetails(securityKey, movieId) {
  console.log('[Castle] Getting details for ID: ' + movieId);
  const url = CASTLE_BASE + '/api/v1/detail?channel=' + CHANNEL + '&clientType=' + CLIENT +
    '&lang=' + LANG + '&movieId=' + movieId + '&packageName=' + PKG;
  const res = await makeRequest(url);
  const cipher = await extractCipherFromResponse(res);
  const decrypted = await decryptCastle(cipher, securityKey);
  return JSON.parse(decrypted);
}

// --- Get video URL (V1 - per language) ---
async function getVideoV1(securityKey, movieId, episodeId, languageId, resolution = 2) {
  console.log('[Castle] Getting video V1: movie=' + movieId + ' ep=' + episodeId + ' lang=' + languageId);
  const url = CASTLE_BASE + '/api/v1/video?clientType=' + CLIENT + '&packageName=' + PKG +
    '&channel=' + CHANNEL + '&lang=' + LANG;
  const body = {
    mode: '1', appMarket: 'google', clientType: CLIENT,
    woolUser: '0', apkSignKey: 'castle_sign_key',
    androidVersion: '13', movieId: movieId.toString(),
    episodeId: episodeId.toString(), languageId: languageId.toString(),
    isNewUser: '0', resolution: resolution.toString(), packageName: PKG
  };
  const res = await makeRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const cipher = await extractCipherFromResponse(res);
  const decrypted = await decryptCastle(cipher, securityKey);
  return JSON.parse(decrypted);
}

// --- Get video URL (V2 - shared) ---
async function getVideo2(securityKey, movieId, episodeId, resolution = 2) {
  console.log('[Castle] Getting video V2: movie=' + movieId + ' ep=' + episodeId);
  const url = CASTLE_BASE + '/api/v1/video?clientType=' + CLIENT + '&packageName=' + PKG +
    '&channel=' + CHANNEL + '&lang=' + LANG;
  const body = {
    mode: '1', appMarket: 'google', clientType: CLIENT,
    woolUser: '0', apkSignKey: 'castle_sign_key',
    androidVersion: '13', movieId: movieId.toString(),
    episodeId: episodeId.toString(), isNewUser: '0',
    resolution: resolution.toString(), packageName: PKG
  };
  const res = await makeRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const cipher = await extractCipherFromResponse(res);
  const decrypted = await decryptCastle(cipher, securityKey);
  return JSON.parse(decrypted);
}

// --- Find Castle movie ID by searching ---
async function findCastleMovieId(securityKey, metadata) {
  const query = metadata.year ? metadata.year + ' ' + metadata.title : metadata.title;
  const searchResult = await searchCastle(securityKey, query);
  const data = extractDataBlock(searchResult);
  const results = data.list || [];
  if (results.length === 0) throw new Error('No search results found');

  // Try exact match first
  for (const item of results) {
    const itemTitle = (item.title || item.name || '').toLowerCase();
    const targetTitle = metadata.title.toLowerCase();
    if (itemTitle.includes(targetTitle) || targetTitle.includes(itemTitle)) {
      const id = item.id || item.redirectId || item.redirectIdStr;
      if (id) {
        console.log('[Castle] Found match: ' + (item.title || item.name) + ' (ID: ' + id + ')');
        return id.toString();
      }
    }
  }

  // Fallback to first result
  const first = results[0];
  const id = first.id || first.redirectId || first.redirectIdStr;
  if (id) {
    console.log('[Castle] Using first result: ' + (first.title || first.name) + ' (ID: ' + id + ')');
    return id.toString();
  }
  throw new Error('No matching content found');
}

// --- Quality helpers ---
function getQualityValue(resolution) {
  if (!resolution) return 0;
  const cleaned = resolution.toString().toLowerCase()
    .replace(/^(sd|hd|fhd|uhd|4k)\\s*/i, '').replace(/p$/, '').trim();
  const map = { '4k': 2160, '2160': 2160, '1440': 1440, '1080': 1080, '720': 720, '480': 480, '360': 360, '240': 240 };
  if (map[cleaned]) return map[cleaned];
  const num = parseInt(cleaned);
  if (!isNaN(num) && num > 0) return num;
  return 0;
}

function formatSize(bytes) {
  if (typeof bytes !== 'number' || bytes <= 0) return 'Unknown';
  if (bytes > 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
  return (bytes / 1000000).toFixed(0) + ' MB';
}

function resolutionToQuality(res) {
  const map = { 1: '480p', 2: '720p', 3: '1080p' };
  return map[res] || res + 'p';
}

// --- Process video response into streams ---
function processVideoResponse(videoData, metadata, season, episode, resolution, langLabel) {
  const streams = [];
  const data = extractDataBlock(videoData);
  const videoUrl = data.videoUrl;
  if (!videoUrl) { console.log('[Castle] No video URL'); return streams; }

  // Parse subtitles
  const subtitles = [];
  if (data.subtitles && Array.isArray(data.subtitles)) {
    data.subtitles.forEach(sub => {
      if (sub.url) subtitles.push({
        url: sub.url, language: sub.abbreviate || 'Unknown',
        name: sub.title || sub.language || 'Unknown', headers: PLAYBACK_HEADERS
      });
    });
  }

  let titleText = metadata.title || 'Unknown';
  if (metadata.year) titleText += ' (' + metadata.year + ')';
  if (season && episode) {
    titleText = metadata.title + ' S' + String(season).padStart(2, '0') + 'E' + String(episode).padStart(2, '0');
  }

  const quality = resolutionToQuality(resolution);

  if (data.videos && Array.isArray(data.videos)) {
    for (const video of data.videos) {
      let q = video.resolutionDescription || video.resolution || quality;
      q = q.replace(/^(SD|HD|FHD)\\s+/i, '');
      const name = langLabel ? 'Castle [' + langLabel + '] - ' + q : 'Castle - ' + q;
      streams.push({
        name, title: titleText,
        url: video.url || videoUrl, quality: q,
        size: formatSize(video.size),
        headers: PLAYBACK_HEADERS, provider: 'Castle', subtitles
      });
    }
  } else {
    const name = langLabel ? 'Castle [' + langLabel + '] - ' + quality : 'Castle - ' + quality;
    streams.push({
      name, title: titleText, url: videoUrl, quality,
      size: formatSize(data.fileSize),
      headers: PLAYBACK_HEADERS, provider: 'Castle', subtitles
    });
  }
  return streams;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  console.log('[Castle] Starting extraction for TMDB ID: ' + tmdbId + ', Type: ' + type +
    (type === 'tv' ? ', S:' + season + 'E:' + episode : ''));

  try {
    // Step 1: TMDB metadata
    const metadata = await getTMDBDetails(tmdbId, type);
    console.log('[Castle] Found: "' + metadata.title + '" (' + (metadata.year || 'N/A') + ')');

    // Step 2: Get security key
    const securityKey = await getSecurityKey();

    // Step 3: Find Castle content ID
    const castleId = await findCastleMovieId(securityKey, metadata);

    // Step 4: Get details
    let details = await getDetails(securityKey, castleId);
    let activeMovieId = castleId;

    // For TV: find correct season ID
    if (type === 'tv' && season && episode) {
      const data = extractDataBlock(details);
      const seasons = data.seasons || [];
      const seasonData = seasons.find(s => s.number === season);
      if (seasonData && seasonData.id && seasonData.id !== castleId) {
        console.log('[Castle] Fetching season ' + season + ' details...');
        details = await getDetails(securityKey, seasonData.id.toString());
        activeMovieId = seasonData.id.toString();
      }
    }

    // Step 5: Find episode
    const data = extractDataBlock(details);
    const episodes = data.episodes || [];
    let episodeId = null;

    if (type === 'tv' && season && episode) {
      const ep = episodes.find(e => e.number === episode);
      if (ep && ep.id) episodeId = ep.id.toString();
    } else if (episodes.length > 0) {
      episodeId = episodes[0].id.toString();
    }

    if (!episodeId) throw new Error('No episode found');

    // Step 6: Get video for each language
    const episodeData = episodes.find(e => e.id.toString() === episodeId);
    const languages = episodeData?.languages || [];
    const resolution = 2; // 720p
    const allStreams = [];

    for (const lang of languages) {
      const langName = lang.name || lang.language || 'Unknown';
      if (lang.movieId && lang.languageId) {
        try {
          console.log('[Castle] Fetching video for ' + langName + ' (languageId: ' + lang.languageId + ')');
          const videoData = await getVideoV1(securityKey, activeMovieId, episodeId, lang.languageId, resolution);
          const streams = processVideoResponse(videoData, metadata, season, episode, resolution, '[' + langName + ']');
          if (streams.length > 0) {
            console.log('[Castle] Got ' + streams.length + ' streams for ' + langName);
            allStreams.push(...streams);
          }
        } catch (e) {
          console.log('[Castle] Failed for ' + langName + ': ' + e.message);
        }
      }
    }

    // Fallback: shared video endpoint
    if (allStreams.length === 0) {
      console.log('[Castle] Trying shared video endpoint...');
      const videoData = await getVideo2(securityKey, activeMovieId, episodeId, resolution);
      const streams = processVideoResponse(videoData, metadata, season, episode, resolution, '[Shared]');
      allStreams.push(...streams);
    }

    // Sort by quality (highest first)
    allStreams.sort((a, b) => getQualityValue(b.quality) - getQualityValue(a.quality));
    console.log('[Castle] Total streams: ' + allStreams.length);
    return allStreams;
  } catch (e) {
    console.error('[Castle] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };`
  },
  {
    filename: 'showbox.js',
    provider: 'ShowBox',
    description: 'ShowBox FebBox scraper with JWT token decryption and multi-cookie support',
    decoded: `// ============================================
// DECODED: providers/showbox.js
// Provider: ShowBox (via FebBox file sharing)
// Original: AES-CBC JWT decryption + string array obfuscation
// ============================================

const cheerio = require('cheerio-without-node-native');
const CryptoJS = require('crypto-js');

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_API_BASE = 'https://api.showboxapi.com'; // decoded default

const WORKING_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/json'
};

// --- Quality emoji labels ---
function getQualityEmoji(quality) {
  switch (quality) {
    case 'ORIGINAL': return '✨';
    case '4K': return '🌟';
    case '1440p': return '⚡';
    case '1080p': return '🔥';
    case '720p': return '💎';
    case '480p': return '📼';
    default: return '📼';
  }
}

function getSubheadingQualityLabel(quality, filename) {
  if (quality === 'ORIGINAL' && filename) {
    const match = filename.match(/(\\d{3,4})[pP]/);
    if (match) return '✨ ' + match[0] + 'p';
    return '✨ Original';
  }
  return getQualityEmoji(quality) + ' ' + quality;
}

// --- File format detection ---
function getFileContainerFormat(url) {
  if (!url) return '📦 Unknown';
  const upper = url.toUpperCase();
  if (upper.includes('.MKV') || upper.includes('MATROSKA')) return '📦 MKV';
  if (upper.includes('.AVI') || upper.includes('XVID')) return '📦 AVI';
  if (upper.includes('.MP4') || upper.includes('MPEG4')) return '📦 MP4';
  return '📦 Unknown';
}

// --- Parse codec/HDR/audio from filename ---
function parseFilenameMetadata(filename) {
  if (!filename) return { line3: '🎞️ H.264 | 📺 SDR | 🎧 Stereo', source: '📥 WEB-DL' };
  const upper = filename.toUpperCase();

  // Video codec
  let codec = '';
  if (upper.includes('HEVC') || upper.includes('X265') || upper.includes('H265') || upper.includes('H.265'))
    codec = '🎞️ H.265';
  else if (upper.includes('AVC') || upper.includes('H264') || upper.includes('H.264') || upper.includes('X264'))
    codec = '🎞️ H.264';
  else if (upper.includes('AV1'))
    codec = '🎞️ AV1';

  // HDR format
  let hdr = '';
  if (upper.includes('DV') || upper.includes('DOLBYVISION') || upper.includes('DOLBY VISION'))
    hdr = '🌈 Dolby Vision';
  else if (upper.includes('HDR10+'))
    hdr = '✨ HDR10+';
  else if (upper.includes('HDR10') || upper.includes('HDR'))
    hdr = '✨ HDR10';
  else if (upper.includes('SDR'))
    hdr = '📺 SDR';
  else
    hdr = '📺 SDR';

  // Audio format
  let audio = '';
  if (upper.includes('ATMOS'))
    audio = '🎧 Atmos';
  else if (upper.includes('DD+') || upper.includes('DD+5.1') || upper.includes('EAC3 5.1'))
    audio = '🎧 DDP 5.1';
  else if (upper.includes('DDP7.1') || upper.includes('EAC3 7.1') || upper.includes('DDP'))
    audio = '🎧 DDP 7.1';
  else if (upper.includes('DD5.1') || upper.includes('AC3') || upper.includes('5.1'))
    audio = '🎧 DD 5.1';
  else if (upper.includes('AAC'))
    audio = '🎧 AAC';
  else if (upper.includes('FLAC'))
    audio = '🎧 FLAC';

  const line3 = [codec, hdr, audio].filter(Boolean).join(' | ') || '🎞️ H.264 | 📺 SDR | 🎧 Stereo';

  // Source type
  let source = '📥 WEB-DL';
  if (upper.includes('BLURAY') || upper.includes('BLU-RAY') || upper.includes('BDREMUX'))
    source = '💿 BluRay';
  else if (upper.includes('WEBRIP') || upper.includes('WEB-RIP'))
    source = '🌐 WEB-Rip';
  else if (upper.includes('TELESYNC') || upper.includes('TS') || upper.includes('TC'))
    source = '📺 TELESYNC';
  else if (upper.includes('CAM'))
    source = '📹 CAM';

  return { line3, source };
}

// --- JWT Token decryption ---
function parseSingleToken(token) {
  if (!token) return '';

  if (token.startsWith('eyJ')) {
    console.log('[ShowBox] Parsing JWT token...');
    try {
      // Decode base64 payload
      const payload = CryptoJS.enc.Base64.parse(token);
      const jsonStr = payload.toString(CryptoJS.enc.Utf8);
      const parsed = JSON.parse(jsonStr);

      if (parsed && parsed.data) {
        // Decrypt nested data with AES
        const AES_KEY = 'wEiphTn!';
        const encryptedData = parsed.data;
        const key = CryptoJS.enc.Utf8.parse(encryptedData);
        const iv = CryptoJS.enc.Utf8.parse(AES_KEY);

        const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });

        const userData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        if (userData && userData.uid) return String(userData.uid);
      }
    } catch (e) {
      console.log('[ShowBox] Token parse error: ' + e.message);
    }
  }
  return token;
}

// --- Get all user-configured tokens ---
function getAllUiTokens() {
  try {
    let tokens = '';
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.uiToken)
      tokens = String(global.SCRAPER_SETTINGS.uiToken).trim();
    else if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.uiToken)
      tokens = String(window.SCRAPER_SETTINGS.uiToken).trim();

    if (!tokens) return [];
    return tokens.split(',').map(t => t.trim()).filter(Boolean);
  } catch { return []; }
}

// --- Get OSS group setting ---
function getOssGroup() {
  try {
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.ossGroup)
      return String(global.SCRAPER_SETTINGS.ossGroup);
    if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.ossGroup)
      return String(window.SCRAPER_SETTINGS.ossGroup);
  } catch {}
  return null;
}

// --- Get API base URL ---
function getApiBase() {
  try {
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.apiBase)
      return String(global.SCRAPER_SETTINGS.apiBase);
    if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.apiBase)
      return String(window.SCRAPER_SETTINGS.apiBase);
  } catch {}
  return DEFAULT_API_BASE;
}

// --- Quality detection from name ---
function getQualityFromName(name) {
  if (!name) return 'Unknown';
  const upper = name.toUpperCase();
  if (upper === 'ORIGINAL' || upper === 'ORIGINAL') return 'ORIGINAL';
  if (upper === '4K' || upper === '2160P') return '4K';
  if (upper === '1440P' || upper === '2K') return '1440p';
  if (upper === '1080P' || upper === 'FHD') return '1080p';
  if (upper === '720P' || upper === 'HD') return '720p';
  if (upper === '480P' || upper === 'SD') return '480p';
  if (upper === '360P') return '360p';
  if (upper === '240P') return '240p';

  const match = name.match(/(\\d{3,4})[pP]?/);
  if (match) {
    const res = parseInt(match[1]);
    if (res >= 2160) return '4K';
    if (res >= 1440) return '1440p';
    if (res >= 1080) return '1080p';
    if (res >= 720) return '720p';
    if (res >= 480) return '480p';
    if (res >= 360) return '360p';
    return '240p';
  }
  return 'Unknown';
}

// --- Format file size ---
function formatFileSize(size) {
  if (!size) return 'Unknown Size';
  if (typeof size === 'string' && (size.includes('GB') || size.includes('MB') || size.includes('KB')))
    return size;
  if (typeof size === 'number') {
    const gb = size / (1024 * 1024 * 1024);
    if (gb >= 1) return gb.toFixed(2) + ' GB';
    const mb = size / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  }
  return size;
}

// --- TMDB details ---
async function getTMDBDetails(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const url = TMDB_BASE_URL + '/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const title = type === 'tv' ? data.name : data.title;
    const dateStr = type === 'tv' ? data.first_air_date : data.release_date;
    const year = dateStr ? parseInt(dateStr.split('-')[0]) : null;
    return { title, year };
  } catch (e) {
    console.log('[ShowBox] TMDB details query failed: ' + e.message);
    return { title: 'TMDB ID ' + tmdbId, year: null };
  }
}

// --- FebBox share extraction ---
async function extractFebBoxShare(contentId, type, season, episode, cookie, cookieNum, metadata) {
  const streams = [];
  try {
    const typeFlag = type === 'tv' ? 2 : 1;
    const apiUrl = DEFAULT_API_BASE + '/' + typeFlag + '/' + contentId + '?json=1';
    const apiData = await fetch(apiUrl).then(r => r.json());
    if (!apiData || apiData.code !== 1 || !apiData.data) return [];

    const sharePath = apiData.data.share || apiData.data.link;
    if (!sharePath) return [];

    const shareKey = sharePath.split('/').pop();
    const fileListUrl = 'https://www.febbox.com/file/file_share_list?share_key=' + shareKey;
    const fileData = await fetch(fileListUrl, { headers: { 'Accept-Language': 'en' } }).then(r => r.json());
    if (!fileData || fileData.code !== 1 || !fileData.data || !fileData.data.file_list) return [];

    let files = [];
    if (type === 'tv') {
      const seasonFolder = fileData.data.file_list.find(f =>
        f.file_name && f.file_name.toLowerCase() === 'season ' + season
      );
      if (!seasonFolder) return [];

      const epListUrl = 'https://www.febbox.com/file/file_share_list?share_key=' + shareKey +
        '&parent_id=' + seasonFolder.id + '&page=1';
      const epData = await fetch(epListUrl, { headers: { 'Accept-Language': 'en' } }).then(r => r.json());
      if (!epData || epData.code !== 1 || !epData.data || !epData.data.file_list) return [];

      const paddedS = String(season).padStart(2, '0');
      const paddedE = String(episode).padStart(2, '0');
      files = epData.data.file_list.filter(f =>
        f.file_name && (f.file_name.toLowerCase().includes('s' + paddedS + 'e' + paddedE) ||
          f.file_name.toLowerCase().includes('s' + season + 'e' + episode))
      );
    } else {
      files = fileData.data.file_list;
    }

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Connection': 'keep-alive',
      'Range': 'bytes=0-',
      'Referer': 'https://www.febbox.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const cookieHeader = cookie.startsWith('cookie=') ? cookie : 'cookie=' + cookie;

    for (const file of files) {
      const qualityUrl = 'https://www.febbox.com/console/video_quality_list?fid=' + file.id + '&share_key=' + shareKey;
      const qualityHtml = await fetch(qualityUrl, { headers: { Cookie: cookieHeader } })
        .then(r => r.text()).catch(() => null);
      if (!qualityHtml || !qualityHtml.includes('data-url')) continue;

      const $ = cheerio.load(qualityHtml);
      $('option').each((_, el) => {
        const $el = $(el);
        const url = $el.attr('data-url');
        const quality = $el.attr('data-quality');
        const size = $el.text().trim();

        if (url) {
          const q = getQualityFromName(quality);
          const label = getSubheadingQualityLabel(q, file.file_name || url);
          const fileSize = formatFileSize(size || file.file_size);
          const container = getFileContainerFormat(file.file_name || url);
          const meta = parseFilenameMetadata(file.file_name || url);

          const name = 'ShowBox | ' + q + ' | Cookie ' + cookieNum;
          const seLabel = type === 'tv'
            ? '🍿 ' + (metadata.title || 'Unknown') + ' - (' + (metadata.year || '') + ') | S' +
              String(season).padStart(2, '0') + ' E' + String(episode).padStart(2, '0')
            : '🍿 ' + (metadata.title || 'Unknown') + ' - (' + (metadata.year || '') + ')';
          const line2 = label + ' | 💾 ' + fileSize + ' | ' + container;
          const line3 = meta.line3;
          const line4 = meta.source + ' | 🍪 Cookie #' + cookieNum;
          const fullTitle = seLabel + '\\n' + line2 + '\\n' + line3 + '\\n' + line4;

          streams.push({
            name, title: fullTitle, size: fullTitle, description: fullTitle,
            url, quality: '', language: '', headers
          });
        }
      });
    }
  } catch (e) {
    console.error('[ShowBox] FebBox share extraction error: ' + e.message);
  }
  return streams;
}

// --- Process ShowBox API response ---
function processShowBoxResponse(response, metadata, type, season, episode, cookieNum) {
  const streams = [];
  try {
    if (!response || !response.success || !response.versions || !Array.isArray(response.versions))
      return streams;

    response.versions.forEach(function (version, vIdx) {
      const versionSize = version.size || 'Unknown';
      if (version.links && Array.isArray(version.links)) {
        version.links.forEach(function (link) {
          if (!link.url) return;
          const quality = getQualityFromName(link.quality || 'Unknown');
          const label = getSubheadingQualityLabel(quality, link.filename);
          const size = formatFileSize(link.size || versionSize);
          const container = getFileContainerFormat(link.url);
          const meta = parseFilenameMetadata(link.filename);

          let provider = 'ShowBox';
          if (response.versions.length > 1) provider += ' V' + (vIdx + 1);

          const name = provider + ' | ' + quality + ' | Cookie #' + cookieNum;
          const titleText = type === 'tv'
            ? '🍿 ' + (metadata.title || 'Unknown') + ' - (' + (metadata.year || '') + ') | S' +
              String(season).padStart(2, '0') + ' E' + String(episode).padStart(2, '0')
            : '🍿 ' + (metadata.title || 'Unknown') + ' - (' + (metadata.year || '') + ')';
          const line2 = label + ' | 💾 ' + size + ' | ' + container;
          const line3 = meta.line3;
          const line4 = meta.source + ' | 🍪 Cookie #' + cookieNum;
          const fullTitle = titleText + '\\n' + line2 + '\\n' + line3 + '\\n' + line4;

          streams.push({
            name, title: fullTitle, size: fullTitle, description: fullTitle,
            url: link.url, quality: '', language: ''
          });
        });
      }
    });
  } catch (e) {
    console.error('[ShowBox] Error processing response: ' + e.message);
  }
  return streams;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[ShowBox] Fetching streams for TMDB ID: ' + tmdbId + ', Type: ' + type);

  const tokens = getAllUiTokens();
  const ossGroup = getOssGroup();
  const apiBase = getApiBase();

  if (tokens.length === 0) {
    console.error('[ShowBox] No UI tokens configured');
    return [];
  }

  let allStreams = [];

  try {
    const metadata = await getTMDBDetails(tmdbId, type);

    for (let i = 0; i < tokens.length; i++) {
      const cookieNum = i + 1;
      const rawToken = tokens[i];
      const cookie = parseSingleToken(rawToken);
      if (!cookie) continue;

      console.log('[ShowBox] Processing Cookie #' + cookieNum);
      let streams = [];
      let contentId;

      // Build API URL
      if (type === 'tv' && season && episode) {
        if (ossGroup) {
          contentId = apiBase + '/tv/' + tmdbId + '/group/' + ossGroup + '/' + season + '/' + episode + '?cookie=' + encodeURIComponent(cookie);
        } else {
          contentId = apiBase + '/tv/' + tmdbId + '/' + season + '/' + episode + '?cookie=' + encodeURIComponent(cookie);
        }
      } else {
        contentId = apiBase + '/movie/' + tmdbId + '?cookie=' + encodeURIComponent(cookie);
      }

      // Fetch from proxy API
      let responseId = null;
      try {
        const res = await fetch(contentId, { headers: WORKING_HEADERS });
        if (res.ok) {
          const data = await res.json();
          streams = processShowBoxResponse(data, metadata, type, season, episode, cookieNum);
          if (data.id || data.mid) responseId = data.id || data.mid;
          else if (data.data && (data.data.id || data.data.mid))
            responseId = data.data.id || data.data.mid;
        }
      } catch (e) {
        console.log('[ShowBox] Proxy server lookup failed for Cookie ' + cookieNum + ': ' + e.message);
      }

      // Try FebBox extraction if we have an ID
      if (responseId) {
        const febStreams = await extractFebBoxShare(responseId, type, season, episode, cookie, cookieNum, metadata);
        if (febStreams.length > 0) streams = streams.concat(febStreams);
      }

      console.log('[ShowBox] Found ' + streams.length + ' links for Cookie ' + cookieNum);
      allStreams = allStreams.concat(streams);
    }

    return allStreams;
  } catch (e) {
    console.error('[ShowBox] Error: ' + e.message);
    return [];
  }
}

// --- Settings UI ---
async function onSettings() {
  return [
    { type: 'input', label: 'ShowBox Cookie Token' },
    { type: 'input', isPassword: true, key: 'uiToken', label: 'Cookie Token',
      placeholder: 'Enter your token...',
      description: 'Add multiple tokens separated by commas. Links will display grouped by cookie indicator.' },
    { type: 'input', key: 'ossGroup', label: 'OSS Group', placeholder: '',
      description: 'Optional OSS group identifier for alternate routing.' }
  ];
}

module.exports = { getStreams, onSettings };`
  },
  {
    filename: 'torrentio.js',
    provider: 'Torrentio',
    description: 'Torrentio torrent streaming with optional debrid service integration',
    decoded: `// ============================================
// DECODED: providers/torrentio.js
// Provider: Torrentio
// Original: String array + base64 obfuscation
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TORRENTIO_API = 'https://torrentio.strem.fun';
const PROVIDER_NAME = 'Torrentio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json'
};

const TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.birkenwald.de:6969/announce'
];

// --- Read debrid settings ---
function getDebridSettings() {
  let provider = 'none';
  let key = '';
  try {
    let settings = null;
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS)
      settings = global.SCRAPER_SETTINGS;
    else if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS)
      settings = window.SCRAPER_SETTINGS;

    if (settings) {
      if (settings.debridProvider)
        provider = String(settings.debridProvider).toLowerCase().trim();
      if (settings.debridKey)
        key = String(settings.debridKey).trim();
    }
  } catch (e) {
    console.error('[Torrentio] Error reading settings context:', e);
  }
  return { provider, key };
}

// --- Build magnet link from info hash ---
function buildMagnet(infoHash) {
  if (!infoHash) return '';
  const trackers = TRACKERS.map(t => '&tr=' + encodeURIComponent(t)).join('');
  return 'magnet:?xt=urn:btih:' + infoHash + trackers;
}

// --- Get debrid URL path segment ---
function getDebridPathSegment() {
  const { provider, key } = getDebridSettings();
  if (!provider || provider === 'none' || !key) return '';
  return provider + '=' + key;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  const isTV = type === 'tv' || type === 'series';

  // Step 1: Get IMDB ID from TMDB
  const tmdbUrl = 'https://api.themoviedb.org/3/' + (isTV ? 'tv' : 'movie') + '/' + tmdbId +
    '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';

  try {
    const tmdbData = await fetch(tmdbUrl).then(r => r.ok ? r.json() : null).catch(() => null);
    const imdbId = tmdbData?.external_ids?.imdb_id || tmdbData?.imdb_id || tmdbId;
    const title = tmdbData?.title || tmdbData?.name || 'Unknown Title';
    const year = tmdbData?.release_date
      ? tmdbData.release_date.split('-')[0]
      : tmdbData?.first_air_date
        ? tmdbData.first_air_date.split('-')[0]
        : 'N/A';

    // Step 2: Build Torrentio URL
    const debridSegment = getDebridPathSegment();
    const prefix = debridSegment ? debridSegment + '/' : '';
    const streamId = isTV
      ? 'series:' + imdbId + ':' + (season || 1) + ':' + (episode || 1)
      : 'movie:' + imdbId;
    const torrentioUrl = TORRENTIO_API + '/' + prefix + 'stream/' + streamId + '.json';

    // Step 3: Fetch streams
    const data = await fetch(torrentioUrl, { headers: HEADERS })
      .then(r => r.ok ? r.json() : null).catch(() => null);

    if (!data?.streams || data.streams.length === 0) return [];

    const streams = [];

    // Process top 15 results
    data.streams.slice(0, 15).forEach(torrent => {
      if (!torrent) return;

      const description = (torrent.description || '').replace(/\\n/g, ' ');
      const upper = description.toUpperCase();
      const seeders = (description.match(/👤\\s*(\\d+)/)?.[1]) || '0';

      // Parse file size
      let size = 'Unknown';
      const sizeMatch = description.match(/([0-9.]+ ?[GM]B)/i);
      if (sizeMatch) size = sizeMatch[1].trim();

      // Detect quality
      let quality = 'Unknown';
      let emoji = '💎';
      if (upper.includes('2160P') || upper.includes('4K')) {
        quality = '2160p'; emoji = '🔥';
      } else if (upper.includes('1080P')) {
        quality = '1080p'; emoji = '💎';
      } else if (upper.includes('720P')) {
        quality = '720p'; emoji = '⚡';
      } else if (upper.includes('480P')) {
        quality = '480p'; emoji = '📱';
      }

      // Detect audio
      let audio = 'Unknown';
      if (upper.includes('DUAL') || upper.includes('DUAL-AUDIO'))
        audio = 'Dual-Audio';
      else if (upper.includes('HINDI') || upper.includes('TELUGU') || upper.includes('TAMIL'))
        audio = 'Dual-Audio';
      else if (upper.includes('ENGLISH'))
        audio = 'English';

      // Detect HDR/codec tags
      const tags = [];
      if (upper.includes('DV') || upper.includes('DOLBY VISION')) tags.push('DV');
      if (upper.includes('HDR10+')) tags.push('HDR10+');
      else if (upper.includes('HDR10')) tags.push('HDR10');
      else if (upper.includes('HDR')) tags.push('HDR');
      if (upper.includes('HEVC') || upper.includes('X265') || upper.includes('H265'))
        tags.push('HEVC');
      tags.push(audio);
      const tagLine = tags.join(' • ');

      // Detect source
      let source = PROVIDER_NAME;
      const bracketMatch = description.match(/\\[(.*?)\\]/);
      if (bracketMatch && bracketMatch[1]) {
        const src = bracketMatch[1].trim();
        if (!/\\d+P|HEVC|H264|WEB|BLURAY/i.test(src)) source = src;
      }
      if (source === PROVIDER_NAME) {
        if (upper.includes('RARBG')) source = 'RARBG';
        else if (upper.includes('YTS')) source = 'YTS';
        else if (upper.includes('PIRATEBAY') || upper.includes('TPB')) source = 'ThePirateBay';
        else if (upper.includes('1337X')) source = '1337x';
        else if (upper.includes('EZTV')) source = 'EZTV';
        else if (upper.includes('TGX')) source = 'TGX';
      }

      // Build stream URL
      const url = torrent.url || (torrent.infoHash ? buildMagnet(torrent.infoHash) : '');

      // Build display strings
      const titleLine = isTV
        ? '🎬 ' + title + ' | S' + (season || 1) + ' E' + (episode || 1)
        : '🎬 ' + title + ' - ' + year;
      const qualityLine = emoji + ' ' + quality + ' | ' + tagLine;
      const infoLine = '👤 ' + seeders + ' | 💾 ' + size + ' | 📡 ' + source;
      const fullTitle = titleLine + '\\n' + qualityLine + '\\n' + infoLine;

      streams.push({
        name: PROVIDER_NAME + ' | 👤 ' + seeders + ' | ' + quality.toUpperCase(),
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: url
      });
    });

    return streams;
  } catch (e) {
    console.error('[Torrentio] Error:', e);
    return [];
  }
}

// --- Settings UI ---
async function onSettings() {
  return [
    { type: 'header', label: 'Debrid Provider Configuration' },
    {
      type: 'select', key: 'debridProvider', label: 'Debrid Provider',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Real-Debrid', value: 'realdebrid' },
        { label: 'Premiumize', value: 'premiumize' },
        { label: 'AllDebrid', value: 'alldebrid' },
        { label: 'DebridLink', value: 'debridlink' },
        { label: 'EasyDebrid', value: 'easydebrid' },
        { label: 'Offcloud', value: 'offcloud' },
        { label: 'TorBox', value: 'torbox' },
        { label: 'Put.io', value: 'putio' }
      ],
      default: 'none'
    },
    {
      type: 'input', isPassword: true, key: 'debridKey',
      label: 'API Key / Token',
      placeholder: 'Enter your Debrid API key',
      description: 'API Key or Access Token for your selected Debrid service.'
    }
  ];
}

module.exports = { getStreams, onSettings };`
  },
  {
    filename: 'animekai.js',
    provider: 'AnimeKai',
    description: 'AnimeKai anime scraper with web scraping, packed JS unpacking, and multi-server support',
    decoded: `// ============================================
// DECODED: providers/animekai.js
// Provider: AnimeKai (www3.anikai.cc)
// Original: String array + base64 obfuscation
// ============================================

const TMDB_API_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const ANIKAI_BASE = 'https://www3.anikai.cc';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// --- Quality emoji label ---
function getResolutionEmoji(resolution) {
  const res = String(resolution || '').toLowerCase();
  if (res.includes('2160') || res.includes('4k') || res.includes('uhd')) return '🌟 2160p';
  if (res.includes('1080') || res.includes('fhd')) return '🔥 1080p';
  if (res.includes('720') || res.includes('hd')) return '💎 720p';
  if (res.includes('480') || res.includes('sd')) return '📱 480p';
  return '📺 ' + (resolution || 'Auto');
}

function qualityRank(quality) {
  if (/2160p|4k/i.test(quality)) return 4;
  if (/1080p/i.test(quality)) return 3;
  if (/720p/i.test(quality)) return 2;
  if (/480p/i.test(quality)) return 1;
  return 0;
}

// --- Inverted sort tag using zero-width characters ---
function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  const binary = inverted.toString(2).padStart(20, '0');
  return binary.split('').map(c => c === '1' ? '\\ufeff' : '\\u200b').join('');
}

// --- String similarity (Dice coefficient) ---
function getSimilarity(a, b) {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams = str => {
    const set = new Set();
    for (let i = 0; i < str.length - 1; i++) set.add(str.substring(i, i + 2));
    return set;
  };

  const b1 = bigrams(s1), b2 = bigrams(s2);
  let intersection = 0;
  for (const bg of b1) if (b2.has(bg)) intersection++;
  return 2 * intersection / (b1.size + b2.size);
}

// --- Number to Roman numeral ---
function toRoman(num) {
  const map = [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let result = '';
  for (const [val, sym] of map) {
    while (num >= val) { result += sym; num -= val; }
  }
  return result;
}

// --- Check if entry is a movie/special/OVA ---
function isMovieOrSpecial(title, type) {
  const lower = title.toLowerCase();
  if (lower.includes('movie') || lower.includes('film') || lower.includes('compilation') ||
      lower.includes('gekijouban') || lower.includes('ova') || lower.includes('ona') ||
      lower.includes('special') || lower.includes('oav') || lower.includes('pic') ||
      lower.includes('mini') || lower.includes('reigen') || lower.includes('recap') ||
      lower.includes('hen') || lower.includes('episode 0') ||
      lower.endsWith('-sp') || lower.endsWith('-ona') || lower.endsWith('-special') ||
      lower.endsWith('-movie') || lower.endsWith('-film')) return true;
  if (type && (type === 'movie' || type === 'ova' || type === 'music' || type === 'tvshort')) return true;
  return false;
}

// --- IMDB to TMDB lookup ---
async function imdbToTmdb(imdbId) {
  try {
    const url = TMDB_BASE + '/find/' + imdbId + '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id';
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.tv_results && data.tv_results.length > 0) return data.tv_results[0];
    if (data.movie_results && data.movie_results.length > 0) return data.movie_results[0];
    return null;
  } catch { return null; }
}

// --- TMDB metadata ---
async function getTmdbMeta(tmdbId, type) {
  try {
    const url = type === 'movie'
      ? TMDB_BASE + '/movie/' + tmdbId + '?api_key=' + TMDB_API_KEY
      : TMDB_BASE + '/tv/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// --- Season details ---
async function getSeasonDetails(tmdbId, season) {
  try {
    const url = TMDB_BASE + '/tv/' + tmdbId + '/season/' + season + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// --- Search AnimeKai website ---
async function searchAnikai(query) {
  try {
    const url = ANIKAI_BASE + '/browser?keyword=' + encodeURIComponent(query);
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const results = [];
    const items = html.split('class="item');

    for (let i = 1; i < items.length; i++) {
      const chunk = items[i].substring(0, 2500);
      const linkMatch = chunk.match(/href="([^"]*\\/watch\\/[^"]*)"/);
      if (!linkMatch) continue;

      let watchUrl = linkMatch[1];
      if (!watchUrl.startsWith('http')) watchUrl = ANIKAI_BASE + watchUrl;

      const titleMatch = chunk.match(/class="title[^"]*"[^>]*>([^<]*)/);
      const title = titleMatch ? titleMatch[1].trim() : '';

      const typeMatches = [...chunk.matchAll(/<span>\\s*<b>\\s*([^<]+?)\\s*<\\/b>\\s*<\\/span>/g)];
      const type = typeMatches.length > 0
        ? typeMatches[typeMatches.length - 1][1].trim().toLowerCase()
        : '';

      results.push({ url: watchUrl, title, type });
    }
    return results;
  } catch { return []; }
}

// --- Get episode count from watch page ---
async function getEpisodeCount(watchUrl) {
  try {
    const res = await fetch(watchUrl + '/ep-1', { headers: { 'User-Agent': UA } });
    if (!res.ok) return 0;
    const html = await res.text();
    const slug = watchUrl.split('/watch/')[1];
    const regex = new RegExp('href="[^"]*/watch/' + slug + '/ep-(\\\\d+)', 'g');
    let match, maxEp = 0;
    while ((match = regex.exec(html)) !== null) {
      const ep = parseInt(match[1]);
      if (ep > maxEp) maxEp = ep;
    }
    return maxEp;
  } catch { return 0; }
}

// --- Unpack eval-packed JavaScript ---
function unpackPacked(code) {
  try {
    const evalIdx = code.indexOf('eval(function(p,a,c,k,e,d)');
    if (evalIdx === -1) return null;

    // Extract the function body
    const braceStart = code.indexOf('{', evalIdx);
    let depth = 1, pos = braceStart + 1;
    while (pos < code.length && depth > 0) {
      if (code[pos] === '{') depth++;
      else if (code[pos] === '}') depth--;
      pos++;
    }

    // Extract the arguments
    const parenStart = code.indexOf('(', pos - 1);
    if (parenStart === -1) return null;
    depth = 1; pos = parenStart + 1;
    while (pos < code.length && depth > 0) {
      if (code[pos] === '(') depth++;
      else if (code[pos] === ')') depth--;
      pos++;
    }

    const args = code.substring(parenStart + 1, pos - 1).trim();
    const quote = args[0];
    let packed = '', i = 1;
    while (i < args.length) {
      if (args[i] === quote) {
        let backslashes = 0, j = i - 1;
        while (j >= 0 && args[j] === '\\\\') { backslashes++; j--; }
        if (backslashes % 2 === 0) break;
      }
      packed += args[i]; i++;
    }
    packed = packed.replace(new RegExp('\\\\\\\\' + quote, 'g'), quote).replace(/\\\\\\\\/g, '\\\\');

    const rest = args.substring(i + 1).trim();
    const nums = rest.match(/^,?\\s*(\\d+)\\s*,\\s*(\\d+)/);
    if (!nums) return null;

    const radix = parseInt(nums[1]);
    const count = parseInt(nums[2]);
    const keywords = rest.match(/['"]([^'"]*\\|[^'"]*)['"]/);
    if (!keywords) return null;

    const words = keywords[1].split('|');
    const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
    let unpacked = packed;

    for (let idx = count - 1; idx >= 0; idx--) {
      if (idx < words.length && words[idx]) {
        let encoded = '';
        if (idx === 0) encoded = '0';
        else {
          let n = idx;
          while (n > 0) {
            encoded = charset[n % radix] + encoded;
            n = Math.floor(n / radix);
          }
        }
        unpacked = unpacked.replace(new RegExp('\\\\b' + encoded + '\\\\b', 'g'), words[idx]);
      }
    }
    return unpacked;
  } catch { return null; }
}

// --- Extract streams from embed page ---
async function extractFromEmbed(embedUrl) {
  try {
    const res = await fetch(embedUrl, {
      headers: { 'User-Agent': UA, 'Referer': ANIKAI_BASE + '/' }
    });
    if (!res.ok) return [];

    const html = await res.text();
    const streams = [];
    const m3u8Regex = /(https?:\\/\\/[^\\s"'\\\\]+\\.m3u8[^\\s"'\\\\]*)/g;
    let match;

    while ((match = m3u8Regex.exec(html)) !== null) {
      let quality = 'Auto';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('1080')) quality = '1080p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';
      else if (match[1].includes('auto')) quality = 'Auto';

      streams.push({
        url: match[1], quality,
        headers: { 'Referer': embedUrl, 'User-Agent': UA }
      });
    }

    // Try unpacking eval-packed JS if no streams found
    if (streams.length === 0 && html.includes('eval(function(p,a,c,k,e,d)')) {
      const unpacked = unpackPacked(html);
      if (unpacked) {
        while ((match = m3u8Regex.exec(unpacked)) !== null) {
          streams.push({
            url: match[1], quality: 'Auto',
            headers: { 'Referer': embedUrl, 'User-Agent': UA }
          });
        }
      }
    }
    return streams;
  } catch { return []; }
}

// --- Get streams from watch page ---
async function getStreamsFromWatchPage(watchUrl, metadata = {}) {
  try {
    const res = await fetch(watchUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];

    const html = await res.text();
    const streams = [];
    const seenUrls = new Set();

    // Find server items
    const serverRegex = /class="server-items[^"]*"[^>]*data-id="([^"]*)"[\\s\\S]*?<\\/div>/g;
    let serverMatch;

    while ((serverMatch = serverRegex.exec(html)) !== null) {
      const serverId = serverMatch[1];
      if (!['sub', 'softsub', 'dub'].includes(serverId)) continue;

      const isDub = serverId === 'dub';
      const audioHeaderTag = isDub ? 'English [DUB]' : 'Japanese [SUB]';
      const audioSubLine = isDub ? 'English 🇺🇸 - [DUB]' : 'Japanese 🇯🇵 - [SUB]';

      // Find video iframes
      const iframeRegex = /data-video="([^"]*)"/g;
      let iframeMatch, serverNum = 0;

      while ((iframeMatch = iframeRegex.exec(serverMatch[0])) !== null) {
        const videoUrl = iframeMatch[1];
        serverNum++;
        const serverSubLine = isDub
          ? '🗂️ Server ' + serverNum + ' • 🔉 English Dubbed'
          : '🗂️ Server ' + serverNum + ' • 📑 English Subtitles';

        const embedStreams = await extractFromEmbed(videoUrl);
        for (const stream of embedStreams) {
          if (seenUrls.has(stream.url)) continue;
          seenUrls.add(stream.url);

          streams.push({
            url: stream.url,
            quality: stream.quality,
            audioHeaderTag,
            audioSubLine,
            serverSubLine,
            headers: stream.headers
          });
        }
      }
    }

    // Sort by quality and format for Nuvio
    return streams.sort((a, b) => {
      const qA = a.quality || '1080p';
      const qB = b.quality || '1080p';
      const rankA = qualityRank(qA);
      const rankB = qualityRank(qB);
      const sortTagA = getInvertedSortTag(rankA * 100000 + (100 - streams.indexOf(a)), 999999);
      const sortTagB = getInvertedSortTag(rankB * 100000 + (100 - streams.indexOf(b)), 999999);
      const nameA = sortTagA + 'AnimeKai | ' + qA + ' • ' + a.audioHeaderTag;
      const nameB = sortTagB + 'AnimeKai | ' + qB + ' • ' + b.audioHeaderTag;
      return nameA.localeCompare(nameB);
    }).map(stream => {
      const quality = stream.quality || '1080p';
      const emoji = getResolutionEmoji(quality);
      const titleLine = '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '');
      const epLine = metadata.type === 'tv'
        ? '📋 S' + metadata.season + ' E' + metadata.episode +
          (metadata.episodeTitle ? ' - ' + metadata.episodeTitle : '')
        : null;
      const audioLine = emoji + ' | 🗣️ ' + stream.audioSubLine;
      const techLine = '🎞️ ' + (metadata.duration || '24m') + ' | ⚡ H.264';
      const serverLine = stream.serverSubLine;
      const fullTitle = [titleLine, epLine, audioLine, techLine, serverLine]
        .filter(Boolean).join('\\n');

      return {
        name: getInvertedSortTag(qualityRank(quality) * 100000, 999999) + 'AnimeKai | ' + quality + ' • ' + stream.audioHeaderTag,
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: stream.url,
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: { request: stream.headers }
        }
      };
    });
  } catch { return []; }
}

// --- Find best matching AnimeKai entry ---
async function findBestAnikaiEntry(results, title, season) {
  if (!results || results.length === 0) return null;

  // For movies: filter to movie/special entries
  if (season === 0) {
    const movies = results.filter(r => isMovieOrSpecial(r.title, r.type));
    if (movies.length > 0) {
      let best = null, bestScore = -1;
      for (const entry of movies) {
        const score = getSimilarity(entry.title, title);
        if (score > bestScore) { bestScore = score; best = entry; }
      }
      return best || movies[0];
    }
    return results[0];
  }

  // For TV: filter out movies
  const series = results.filter(r => !isMovieOrSpecial(r.title, r.type));
  if (series.length === 0) return results[0];

  const targetTitle = (title || '').toLowerCase().trim();

  // Try exact title match
  if (!season || season === 1) {
    const exact = series.find(r => (r.title || '').toLowerCase().trim() === targetTitle);
    if (exact) return exact;

    // Filter out sequels
    const first = series.find(r => {
      const slug = r.url.split('/watch/')[1] || '';
      return !slug.match(/-(ii|iii|iv|v|vi|vii|viii|ix|x)$/i);
    });
    if (first) return first;
  }

  // Try Roman numeral match for sequels
  if (season && season > 1) {
    const roman = toRoman(season).toLowerCase();
    const match = series.find(r => {
      const slug = r.url.split('/watch/')[1] || '';
      return slug.toLowerCase().endsWith('-' + roman) ||
        slug.toLowerCase().includes('-' + roman + '-') ||
        slug.toLowerCase().includes('season ' + season) ||
        slug.toLowerCase().includes('s' + season);
    });
    if (match) return match;
  }

  // Fallback: best similarity
  let best = null, bestScore = 0;
  for (const entry of series) {
    const score = getSimilarity(entry.title, title);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best || series[0];
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  try {
    // Convert IMDB ID if needed
    let id = tmdbId;
    if (typeof tmdbId === 'string' && tmdbId.startsWith('tt')) {
      const tmdbResult = await imdbToTmdb(tmdbId);
      if (tmdbResult) id = tmdbResult.id;
      else return [];
    }

    // Get TMDB metadata
    const meta = await getTmdbMeta(id, type);
    if (!meta) return [];

    const title = meta.name || meta.title || 'Unknown';
    const year = (meta.first_air_date || meta.release_date || '').slice(0, 4);
    let episodeTitle = '';
    let duration = '24m';

    if (type === 'movie') {
      duration = meta.runtime ? meta.runtime + 'm' : '120m';
      const metadata = { title, year, type, duration };
      const results = await searchAnikai(title);
      if (results.length === 0) return [];
      const movieEntry = results.find(r => isMovieOrSpecial(r.title, r.type));
      const entry = movieEntry || results[0];
      return await getStreamsFromWatchPage(entry.url + '/ep-1', metadata);
    }

    // TV series handling
    const s = season ?? 1;
    const e = episode || 1;

    // Get episode info from TMDB
    const seasonData = await getSeasonDetails(id, s);
    if (seasonData && seasonData.episodes) {
      const ep = seasonData.episodes.find(ep => ep.episode_number === e);
      if (ep) {
        episodeTitle = ep.name || '';
        if (ep.runtime) duration = ep.runtime + 'm';
      }
    }
    if (duration === '24m' && meta.episode_run_time && meta.episode_run_time.length > 0)
      duration = meta.episode_run_time[0] + 'm';

    const metadata = { title, year, type, season: s, episode: e, episodeTitle, duration };

    // Search AnimeKai
    const seasons = meta.seasons || [];
    const seasonInfo = seasons.find(s => s.season_number === s);
    const totalEps = seasonInfo ? seasonInfo.episode_count : 0;

    let results = await searchAnikai(title);
    if (results.length === 0) {
      results = await searchAnikai(meta.original_name || title);
      if (results.length === 0) return [];
    }

    const bestEntry = await findBestAnikaiEntry(results, title, s);
    if (!bestEntry) return [];

    // Calculate actual episode number (accounting for season merging)
    const epCount = await getEpisodeCount(bestEntry.url);
    let actualEp;
    if (epCount > totalEps && s > 1) {
      let adjustedEp = e;
      for (const prevSeason of seasons) {
        if (prevSeason.season_number < s && prevSeason.season_number > 0)
          adjustedEp += prevSeason.episode_count;
      }
      actualEp = adjustedEp;
    } else {
      actualEp = e;
    }

    return await getStreamsFromWatchPage(bestEntry.url + '/ep-' + actualEp, metadata);
  } catch (e) {
    console.error('[AnimeKai] Error:', e.message);
    return [];
  }
}

module.exports = { getStreams };`
  }
];
