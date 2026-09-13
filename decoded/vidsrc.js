// ============================================
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
  const key = 'pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u';
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
  const key = 'vmKrwfZEsb';
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
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const iframeMatch = html.match(/<iframe\s+[^>]*src="([^"]*)"/i);
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

    const scriptMatches = rcpHtml.match(/<script\s+src="\/([^"]*\.js)\?\_=([^"]*)"><\/script>/gm);
    if (!scriptMatches) return null;

    const scriptMatch = scriptMatches[scriptMatches.length - 1].includes('cpt.js')
      ? scriptMatches[scriptMatches.length - 2].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, '$1')
      : scriptMatches[scriptMatches.length - 1].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, '$1');

    const scriptResponse = await safeFetch(BASEDOM + '/' + scriptMatch, {}, 5000);
    const scriptContent = await scriptResponse.text();

    const pattern = /{}\}window\[([^"]+)\("([^"]+)"\)/;
    const methodMatch = scriptContent.match(pattern);
    if (!methodMatch || methodMatch.length < 3) return null;

    const methodName = methodMatch[1].split('').reverse().join('');
    const encryptedData = methodMatch[2].toString().split('').reverse().join('');
    const decryptedKey = decrypt(encryptedData, methodName);
    if (!decryptedKey) return null;

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
  const srcMatch = html.match(/src:\s*'([^']*)'/);
  if (!srcMatch) return null;
  return srcMatch[1];
}

// --- Title parser ---
function cleanTitleString(rawTitle) {
  if (!rawTitle) return { title: 'Unknown', year: '2026' };
  let title = rawTitle.replace(/\s*-\s*VidSrc\.me$/i, '').trim();
  const yearMatch = title.match(/\s*\((\d{4})\)$/);
  let year = '2026';
  if (yearMatch) {
    year = yearMatch[1];
    title = title.replace(/\s*\(\d{4}\)$/, '').trim();
  }
  return { title, year };
}

// --- TMDB duration fetcher ---
async function fetchTMDBDuration(tmdbId, type, season, episode) {
  let fallback = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const id = String(tmdbId).replace(/\D/g, '');
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

            const qualities = streamUrl.split('?');
            for (let q = 0; q < qualities.length; q++) {
              const url = qualities[q].trim();
              if (!url) continue;

              let quality = '1080p';
              if (url.includes('/720/') || url.includes('720p') || url.includes('/7a67b')) quality = '720p';
              else if (url.includes('/360/') || url.includes('360p') || url.includes('/7a67b')) quality = '360p';
              else if (url.includes('2160') || url.includes('1080p')) quality = '1080p';

              const serverNum = server.name.replace(/\D+/g, '');
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
              const fullTitle = displayTitle + '\n' + line2 + '\n' + line3 + '\n' + line4;

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

module.exports = { getStreams };
