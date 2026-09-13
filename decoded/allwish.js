// ============================================
// DECODED: providers/allwish.js
// Provider: AllWish (All-Wish)
// Original: RC4-based VRF generation + AES-CBC decryption
// ============================================

const cheerio = require('cheerio-without-node-native');
const CryptoJS = require('crypto-js');

const PROVIDER_NAME = 'AllWish';
const MAIN_URL = 'https://allwish.anime';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const REQUEST_TIMEOUT = 12000;
const EPISODE_LIST_TIMEOUT = 30000;
const VRF_SECRET = 'ysJhV6U27FVIjjuk';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive'
};

const AJAX_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': HEADERS['User-Agent'],
  'Referer': MAIN_URL + '/'
};

// --- Safe fetch with timeout ---
async function fetchSafe(url, options = {}, timeout = REQUEST_TIMEOUT) {
  try {
    const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout
      ? AbortSignal.timeout(timeout) : null;
    const opts = { ...options, headers: { ...HEADERS, ...options.headers || {} } };
    if (signal) opts.signal = signal;
    return await fetch(url, opts);
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Fetch error: ' + (url || '').substring(0, 100) + ' -> ' + e.message);
    return null;
  }
}

// --- Fetch JSON ---
async function fetchJson(url, options = {}, timeout) {
  try {
    const res = await fetchSafe(url, options, timeout);
    if (!res || !res.ok) return null;
    return JSON.parse(await res.text());
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] JSON error: ' + (url || '').substring(0, 100) + ' -> ' + e.message);
    return null;
  }
}

// --- Fetch HTML as cheerio ---
async function fetchHtml(url, options = {}) {
  try {
    const res = await fetchSafe(url, options);
    if (!res || !res.ok) return null;
    return cheerio.load(await res.text());
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] HTML error: ' + (url || '').substring(0, 100) + ' -> ' + e.message);
    return null;
  }
}

// --- Create stream object ---
function makeStream(quality, title, url, qualityLabel, headers = {}, subtitles) {
  const stream = {
    name: PROVIDER_NAME + ' | ' + quality,
    title: title || '',
    url: url || '',
    quality: qualityLabel || 'HD',
    headers: { 'User-Agent': HEADERS['User-Agent'], ...headers }
  };
  if (subtitles && Array.isArray(subtitles) && subtitles.length > 0)
    stream.subtitles = subtitles;
  return stream;
}

// --- Build display labels ---
function buildStreamLabels(provider, quality, subtitle, metadata) {
  const q = quality || 'HD';
  const fullName = q + (subtitle ? ' ' + subtitle : '');
  let titleText = '';

  if (metadata && metadata.title) {
    if (metadata.mediaType === 'tv' && metadata.season != null && metadata.episode != null)
      titleText = metadata.title + '\nS' + metadata.season + ' E' + metadata.episode + ' | ' + q + ' · HLS';
    else
      titleText = metadata.title + '\n' + q + ' · HLS';
  } else {
    titleText = provider + (subtitle ? ' ' + subtitle : '') + '\n' + q + ' · HLS';
  }
  titleText += '\n🎞️ M3U8 | ⏱️ 24m | ⚡ H.264';
  return { name: fullName, title: titleText };
}

// --- Deduplicate by URL ---
function dedupe(streams) {
  const seen = new Set();
  return (streams || []).filter(s => {
    if (!s || !s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

// --- TMDB lookup ---
async function getTMDBInfo(tmdbId, type) {
  const id = String(tmdbId || '').trim();
  const isImdb = id.startsWith('tt');
  const mediaType = (type === 'tv' || type === 'show') ? 'tv' : 'movie';

  try {
    if (isImdb) {
      const data = await fetchJson('https://api.themoviedb.org/3/find/' + id + '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id');
      const results = data ? (mediaType === 'tv' ? data.tv_results : data.movie_results) : null;
      if (results && results.length > 0) {
        const item = results[0];
        return {
          id: item.id,
          title: mediaType === 'tv' ? item.name : item.title,
          originalTitle: mediaType === 'tv' ? item.original_name : item.original_title,
          year: (item.first_air_date || item.release_date || '').split('-')[0],
          genres: item.genre_ids || [],
          imdbId: id
        };
      }
      return { id, title: id, originalTitle: id, year: null, genres: [], imdbId: id };
    } else {
      const data = await fetchJson('https://api.themoviedb.org/3/' + mediaType + '/' + id + '?api_key=' + TMDB_API_KEY + '&language=en-US');
      if (data) return {
        id: data.id,
        title: mediaType === 'tv' ? data.name : data.title,
        originalTitle: mediaType === 'tv' ? data.original_name : data.original_title,
        year: (data.first_air_date || data.release_date || '').split('-')[0],
        genres: (data.genres || []).map(g => g.id),
        imdbId: data.imdb_id || data.external_ids?.imdb_id || null
      };
    }
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] TMDB error: ' + e.message);
  }
  return { id, title: id, originalTitle: id, year: null, genres: [], imdbId: null };
}

// --- Title matching helpers ---
function cleanTitle(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(title) {
  return cleanTitle(title).split(' ').filter(Boolean);
}

function scoreTitle(pageTitle, targetTitle, year, season) {
  const tokens = tokenize(targetTitle);
  if (!tokens.length) return 0;

  const pageSet = new Set(tokenize(pageTitle));
  const pageClean = cleanTitle(pageTitle);
  const targetClean = cleanTitle(targetTitle);
  const pageTokens = tokenize(pageTitle);

  if (pageClean === targetClean) return 1.5;

  // Try removing common suffixes
  const stripped = pageClean.replace(/\s+tv$/, '').replace(/\s+movie$/, '')
    .replace(/\s+anime$/, '').replace(/\s+specials?$/, '').trim();
  if (stripped === targetClean) return 1.4;

  let matches = 0;
  for (const token of tokens) if (pageSet.has(token)) matches++;
  let score = matches / Math.max(tokens.length, 1);

  if (pageClean.startsWith(targetClean)) {
    score += 0.3;
    const extraTokens = pageTokens.length - tokens.length;
    if (extraTokens > 2) score -= Math.min(extraTokens * 0.1, 0.4);

    // Penalize extra parts/seasons
    const extraParts = pageTokens.slice(tokens.length).filter(t =>
      ['part', 'season', '2', '3', '4', '5', 'special', 'ova', 'movie', 'film', 'films'].includes(t)
    ).length;
    if (extraParts > 0) score -= 0.2;
  } else if (tokens.length <= 4 && matches === tokens.length) {
    score -= 0.4;
  }

  // Year bonus
  if (year) {
    const yearRegex = /\b(19|20)\d{2}\b/;
    const pageYear = pageClean.match(yearRegex);
    if (pageYear && Math.abs(parseInt(pageYear[0]) - parseInt(year)) <= 1) score += 0.5;
    else if (pageYear) score -= Math.min(Math.abs(parseInt(pageYear[0]) - parseInt(year)) * 0.1, 0.8);
  }

  // Season bonus
  if (season && Number(season) > 1) {
    const sNum = Number(season);
    const seasonMatch = pageClean.match(new RegExp('\\b' + sNum + '|' + sNum + '|\\bpart\\s*' + sNum, 'i'));
    if (seasonMatch) score += 0.4;
    else {
      const anySeason = pageClean.match(/\b(?:season|part)\s*\d+/i);
      if (!anySeason) score -= 0.3;
    }
  }

  return Math.min(score, 2);
}

// --- Search AllWish ---
async function searchAllWish(title, originalTitle, year, season) {
  try {
    const queries = [];
    if (title) queries.push(title);
    if (originalTitle && originalTitle !== title) queries.push(originalTitle);
    if (season && Number(season) > 1) {
      const sNum = Number(season);
      if (title) {
        queries.push(title + ' ' + sNum);
        queries.push(title + ' Season ' + sNum);
      }
    }

    const results = [];
    for (const query of queries) {
      const $ = await fetchHtml(MAIN_URL + '/filter?keyword=' + encodeURIComponent(query) + '&sort=updated');
      if (!$) continue;

      $('.film_list-wrap .flw-item').each((_, el) => {
        const $el = $(el);
        const itemTitle = $el.find('.film-name a').text().trim();
        const itemUrl = $el.find('.film-name a').attr('href');
        if (itemTitle && itemUrl) {
          const watchUrl = itemUrl.replace(/\/ep-\d+\/?$/i, '');
          results.push({ title: itemTitle, watchUrl, query });
        }
      });
      if (results.length > 0) break;
    }

    if (results.length === 0) return null;

    // Find best match
    let bestMatch = null, bestScore = -1;
    for (const item of results) {
      const score1 = scoreTitle(item.title, title || '', year || null, season);
      const score2 = originalTitle ? scoreTitle(item.title, originalTitle, year || null, season) : 0;
      const score = Math.max(score1, score2);
      if (score > bestScore) { bestScore = score; bestMatch = item; }
    }

    if (bestScore < 0.3) return console.log('[' + PROVIDER_NAME + '] Title match score too low: ' + bestScore), null;
    console.log('[' + PROVIDER_NAME + '] Best match: "' + bestMatch.title + '" score=' + bestScore.toFixed(2));
    return bestMatch;
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Search error: ' + e.message);
    return null;
  }
}

// --- Generate episode VRF (RC4-based) ---
function generateEpisodeVrf(episodeData) {
  const encoded = encodeURIComponent(episodeData)
    .replace(/%21/g, '!').replace(/%27/g, "'")
    .replace(/%28/g, '(').replace(/%29/g, ')')
    .replace(/%7E/g, '~').replace(/%2A/g, '*')
    .replace(/%20/g, '+');

  const keyBytes = Array.from(VRF_SECRET).map(c => c.charCodeAt(0));
  const dataBytes = Array.from(encoded).map(c => c.charCodeAt(0));

  // RC4 KSA
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i <= 255; i++) {
    j = (j + S[i] + keyBytes[i % keyBytes.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }

  // RC4 PRGA
  const output = [];
  let a = 0, b = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    a = (a + 1) % 256;
    b = (b + S[a]) % 256;
    [S[a], S[b]] = [S[b], S[a]];
    const k = S[(S[a] + S[b]) % 256];
    output.push((dataBytes[i] ^ k) & 0xff);
  }

  // Base64url encode
  function toBase64Url(bytes) {
    let str = '';
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const b64 = toBase64Url(output);

  // Apply position-based shifts
  const shifts = { 0: -3, 1: 3, 2: -4, 3: 2, 4: -2, 5: 5, 6: 4, 7: 5 };
  const shifted = Array.from(b64).map((c, i) => {
    let code = c.charCodeAt(0);
    code += shifts[i % 8] || 0;
    return code & 0xff;
  });

  const b64_2 = toBase64Url(shifted);

  // ROT13
  const rot13 = c => {
    if (c >= 'A' && c <= 'Z') return String.fromCharCode((c.charCodeAt(0) - 65 + 13) % 26 + 65);
    if (c >= 'a' && c <= 'z') return String.fromCharCode((c.charCodeAt(0) - 97 + 13) % 26 + 97);
    return c;
  };

  return Array.from(b64_2).map(rot13).join('');
}

// --- Choose episode from list ---
function chooseEpisode($, type, episode, mediaType) {
  const episodes = $('li.episode-item').map((_, el) => ({
    slug: parseInt($(el).attr('data-slug') || '0', 10),
    ids: $(el).attr('data-ids') || '',
    hasSub: $(el).attr('data-sub') === '1',
    hasDub: $(el).attr('data-dub') === '1',
    malId: $(el).attr('data-mal') ? parseInt($(el).attr('data-mal'), 10) : null
  })).get().filter(ep => ep.ids);

  if (!episodes.length) return null;
  if (mediaType === 'movie' || episode == null) return episodes[0];

  const epNum = Number(episode);
  return episodes.find(ep => ep.slug === epNum) || null;
}

// --- Extract from MegaPlay server ---
async function extractMegaPlay(url, qualityLabel, metadata) {
  try {
    const res = await fetchSafe(url, {
      headers: { ...HEADERS, 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://megaplay.buzz/' }
    });
    if (!res) return [];

    const $ = cheerio.load(await res.text());
    const configId = $('script[data-name="crypto"]').attr('data-value');
    if (!configId) return [];

    const config = await fetchJson('https://megaplay.buzz/api/config/' + configId + '/?id=' + configId, {
      headers: { ...HEADERS, 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://megaplay.buzz/' }
    });
    if (!config || !config.source || !config.source.url) return [];

    const subtitles = (config.tracks || []).filter(t => t.kind === 'captions' || t.kind === 'subtitles')
      .map(t => ({ label: t.label || 'English', url: t.file })).filter(s => s.url);

    const labels = buildStreamLabels('MegaPlay', '1080p', qualityLabel, metadata);
    return [makeStream(labels.name, labels.title, config.source.url, '1080p', {
      'Referer': 'https://megaplay.buzz/', 'Origin': 'https://megaplay.buzz', 'User-Agent': HEADERS['User-Agent']
    }, subtitles.length > 0 ? subtitles : undefined)];
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] MegaPlay error: ' + e.message);
    return [];
  }
}

// --- Extract from Zen server (AES-CBC decryption) ---
async function extractZen(url, qualityLabel, metadata) {
  try {
    const res = await fetchSafe(url, { headers: HEADERS });
    if (!res) return [];

    const html = await res.text();
    const videoMatch = html.match(/video_b64:\s*"([^"]+)"/);
    const keyMatch = html.match(/enc_key_b64:\s*"([^"]+)"/);
    const ivMatch = html.match(/iv_b64:\s*"([^"]+)"/);
    const subMatch = html.match(/subtitles:\s*"([^"]*)"/);

    if (!videoMatch || !keyMatch || !ivMatch) return [];

    const videoB64 = videoMatch[1];
    const encKeyB64 = keyMatch[1];
    const ivB64 = ivMatch[1];

    const key = CryptoJS.enc.Base64.parse(encKeyB64);
    const iv = CryptoJS.enc.Utf8.parse(ivB64);
    const ciphertext = CryptoJS.enc.Utf8.parse(videoB64);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    });
    const streamUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!streamUrl) return [];

    // Parse subtitles
    let subtitles = [];
    if (subMatch && subMatch[1]) {
      try {
        const cleaned = subMatch[1].replace(/\\"/g, '"').replace(/\\\\\//g, '/')
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          subtitles = parsed.filter(s => s.file).map(s => ({ label: s.label || 'English', url: s.file }));
        }
      } catch {}
    }

    const labels = buildStreamLabels('Zen', '1080p', qualityLabel, metadata);
    return [makeStream(labels.name, labels.title, streamUrl.trim(), '1080p', {
      'Referer': 'https://zencloudz.cc/', 'Origin': 'https://zencloudz.cc'
    }, subtitles.length > 0 ? subtitles : undefined)];
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Zen error: ' + e.message);
    return [];
  }
}

// --- Resolve servers for an episode ---
async function resolveServers(episodeIds, allowedTypes, metadata) {
  try {
    const data = await fetchJson(MAIN_URL + '/ajax/server/list/' + encodeURIComponent(episodeIds), { headers: AJAX_HEADERS });
    if (!data || data.status !== 200) return [];

    const $ = cheerio.load(data.html || '');
    const servers = [];

    $('div.server-item').each((_, el) => {
      const $el = $(el);
      const type = $el.attr('data-type');
      const hasHardSub = ($el.closest('.server-list').text().toLowerCase() || '').includes('hardsub');

      if (!allowedTypes.includes(type)) return;

      $el.find('a').each((_, link) => {
        const dataId = $(link).attr('data-id');
        if (!dataId) return;
        servers.push({ dataId, sectionType: type, isHardSub: hasHardSub });
      });
    });

    if (servers.length === 0) return [];

    const results = await Promise.all(servers.map(async server => {
      try {
        const serverData = await fetchJson(MAIN_URL + '/ajax/server/' + encodeURIComponent(server.dataId), { headers: AJAX_HEADERS });
        if (!serverData || !serverData.result || !serverData.result.url) return [];

        const playerUrl = serverData.result.url;
        const qualityLabel = server.sectionType === 'sub' ? 'English Sub' : server.isHardSub ? 'Hard Sub' : 'Soft Sub';

        if (/megaplay\.buzz/i.test(playerUrl)) return extractMegaPlay(playerUrl, qualityLabel, metadata);
        else if (/player\.sgsgsgsr\.site|zencloudz\.cc/i.test(playerUrl)) return extractZen(playerUrl, qualityLabel, metadata);
        else if (/vidwish\.live/i.test(playerUrl)) return extractMegaPlay(playerUrl, qualityLabel, metadata);
        return [];
      } catch { return []; }
    }));

    return dedupe(results.flat());
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Server error: ' + e.message);
    return [];
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  try {
    console.log('[AllWish] Request: ID=' + tmdbId + ' Type=' + type + ' S=' + season + ' E=' + episode);
    if (type !== 'tv' && type !== 'show') return [];

    const tmdb = await getTMDBInfo(tmdbId, type);
    if (!tmdb || !tmdb.title) return console.log('[AllWish] No TMDB data'), [];

    console.log('[AllWish] Found: "' + tmdb.title + '" (' + (tmdb.year || 'N/A') + ')');

    // Genre filter: skip if no anime genre (ID 16)
    if (tmdb.genres && tmdb.genres.length > 0 && !tmdb.genres.includes(16))
      return console.log('[AllWish] Not anime, genres: ' + tmdb.genres.join(',')), [];

    const match = await searchAllWish(tmdb.title, tmdb.originalTitle, tmdb.year, season);
    if (!match || !match.watchUrl) return console.log('[AllWish] No match found'), [];

    const $page = await fetchHtml(match.watchUrl);
    if (!$page) return [];

    const episodeData = $('main > div.container').attr('data-id');
    if (!episodeData) return console.log('[AllWish] No episode data'), [];

    const vrf = generateEpisodeVrf(episodeData);
    const epList = await fetchJson(MAIN_URL + '/ajax/server/episodes/' + episodeData + '&vrf=' + encodeURIComponent(vrf), { headers: AJAX_HEADERS }, EPISODE_LIST_TIMEOUT);
    if (!epList || epList.status !== 200) return console.log('[AllWish] Episode list failed'), [];

    const $eps = cheerio.load(epList.html || '');
    const epNum = episode != null ? Number(episode) : null;
    const chosen = chooseEpisode($eps, season, epNum, type);
    if (!chosen) return console.log('[AllWish] Episode not found (looking for ep ' + epNum + ')'), [];

    console.log('[AllWish] Found episode ' + chosen.slug + ' (ids: ' + chosen.ids.substring(0, 30) + '...)');

    const allowedTypes = [];
    if (chosen.hasSub) allowedTypes.push('sub');
    if (chosen.hasDub) allowedTypes.push('dub');
    if (allowedTypes.length === 0) return [];

    const meta = { title: tmdb.title, season, episode, mediaType: type };
    const streams = await resolveServers(chosen.ids, allowedTypes, meta);
    console.log('[AllWish] Found ' + streams.length + ' streams');

    // Sort by quality
    const qualityOrder = { '2160p': 5, '4k': 5, '1080p': 3, '720p': 2, 'HD': 1, '480p': 1, '360p': 0 };
    return streams.sort((a, b) => (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0));
  } catch (e) {
    console.error('[AllWish] Error: ' + e.message);
    return [];
  }
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
