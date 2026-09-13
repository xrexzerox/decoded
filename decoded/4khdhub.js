// ============================================
// DECODED: providers/4khdhub.js
// Provider: 4KHDHub (4khdhub.one)
// Original: String array + base64 obfuscation
// ============================================

const cheerio = require('cheerio-without-node-native');

const PROVIDER_NAME = '4KHDHub';
const BASE_URL = 'https://4khdhub.one';
const TMDB_URL = 'https://api.themoviedb.org/3';
const TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Referer': BASE_URL + '/'
};

// --- Sort tag using zero-width characters ---
function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  const binary = inverted.toString(2).padStart(20, '0');
  return binary.split('').map(c => c === '1' ? '\ufeff' : '\u200b').join('');
}

// --- Resolve settings ---
function resolveSettings(context) {
  let result = { sortBy: 'quality' };
  try {
    let settings = context;
    if (!settings && typeof globalThis !== 'undefined')
      settings = globalThis.SCRAPER_SETTINGS || globalThis.SETTINGS || globalThis.settings;
    if (!settings && typeof global !== 'undefined')
      settings = global.SCRAPER_SETTINGS || global.SETTINGS || global.settings;
    if (!settings && typeof window !== 'undefined')
      settings = window.SCRAPER_SETTINGS || window.SETTINGS || window.settings;

    if (settings) {
      let sortBy = settings.sortBy || settings.sort_by || settings.sort || '';
      if (typeof sortBy === 'object' && sortBy !== null)
        sortBy = sortBy.value || sortBy.toString || '';
      const normalized = String(sortBy).toLowerCase();
      if (normalized.includes('size') || normalized.includes('largest'))
        result.sortBy = 'size';
      else
        result.sortBy = 'quality';
    }
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Settings error:', e);
  }
  return result;
}

// --- Settings definition ---
function onSettings() {
  return [{
    type: 'select', key: 'sortBy', name: 'sort_by', label: 'Sort By',
    options: [
      { label: 'Quality', value: 'quality' },
      { label: 'Largest', value: 'size' }
    ],
    default: 'quality'
  }];
}

// --- Fetch text with headers ---
async function fetchText(url, referer = BASE_URL) {
  const res = await fetch(url, {
    headers: { ...HEADERS, Referer: referer + '/' }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
  return res.text();
}

// --- Resolve absolute URL ---
function absoluteUrl(path, base = BASE_URL) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  try { return new URL(path, base).toString(); }
  catch { return ''; }
}

// --- Base64 decode ---
function decodeBase64(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const cleaned = String(input || '').replace(/=+$/, '');
  let result = '', pos = 0, temp, ch, i = 0;
  while (ch = cleaned.charAt(i++)) {
    ch = alphabet.indexOf(ch);
    if (ch < 0) continue;
    temp = pos % 4 ? temp * 64 + ch : ch;
    pos++ % 4 && (result += String.fromCharCode(temp * 25 & 0xff));
  }
  return result;
}

// --- ROT13 ---
function rot13(input) {
  return String(input || '').replace(/[a-zA-Z]/g, c => {
    const shifted = c.charCodeAt(0) + 13;
    const limit = c <= 'Z' ? 0x5a : 0x7a;
    return String.fromCharCode(shifted <= limit ? shifted : shifted - 26);
  });
}

// --- Decode HTML entities ---
function decodeEntities(input) {
  if (!input) return '';
  const entities = /&(nbsp|amp|quot|lt|gt|#038);/g;
  const map = { 'nbsp': ' ', 'amp': '&', 'quot': '"', 'lt': '<', 'gt': '>', '#038': '&' };
  return input.replace(entities, function(_, key) { return map[key]; })
    .replace(/&#(\d+);/g, function(_, code) { return String.fromCharCode(code); });
}

// --- Normalize title for comparison ---
function normalizeTitle(title) {
  return String(title || '').toLowerCase()
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\b(the|a|an|directors?|cut)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// --- Score title match ---
function titleScore(pageTitle, targetTitle) {
  const tokens = normalizeTitle(targetTitle).split(' ').filter(Boolean);
  const pageSet = new Set(normalizeTitle(pageTitle).split(' ').filter(Boolean));
  if (!tokens.length) return 0;
  const matches = tokens.filter(t => pageSet.has(t)).length;
  return matches / tokens.length;
}

// --- Parse quality from text ---
function parseQuality(text) {
  const upper = String(text || '').toLowerCase();
  if (upper.indexOf('2160') >= 0 || upper.indexOf('4k') >= 0) return '2160p';
  if (upper.indexOf('1080') >= 0) return '1080p';
  if (upper.indexOf('720') >= 0) return '720p';
  if (upper.indexOf('480') >= 0) return '480p';
  return '1080p';
}

// --- Quality rank for sorting ---
function getQualityRank(quality) {
  const upper = String(quality).toLowerCase();
  if (upper.includes('2160p') || upper.includes('4k') || upper.includes('uhd')) return 4;
  if (upper.includes('1080') || upper.includes('fhd')) return 3;
  if (upper.includes('720') || upper.includes('hd')) return 2;
  if (upper.includes('480') || upper.includes('sd')) return 1;
  return 0;
}

// --- Parse size string ---
function parseSize(text) {
  const match = String(text || '').match(/([\d.]+)\s*(GB|MB|KB)/i);
  return match ? match[1] + ' ' + match[2].toUpperCase() : 'N/A';
}

// --- Check if URL is direct video ---
function isDirectVideo(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('cloudflarestorage.com') || host.endsWith('.r2.cloudflarestorage.com');
  } catch { return false; }
}

// --- Get TMDB metadata ---
async function getMetadata(tmdbId, type) {
  const mediaType = (type === 'tv' || type === 'series') ? 'tv' : 'movie';
  const res = await fetch(TMDB_URL + '/' + mediaType + '/' + encodeURIComponent(tmdbId) + '?api_key=' + TMDB_KEY + '&language=en-US', {
    headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const json = await res.json();
  const date = mediaType === 'tv' ? json.first_air_date : json.release_date;
  return {
    title: mediaType === 'tv' ? json.name : json.title,
    year: date ? Number(date.slice(0, 4)) : null
  };
}

// --- Find matching page on 4KHDHub ---
async function findPage(metadata, isTV, season) {
  const searchQuery = isTV && season
    ? metadata.title + ' S' + season
    : (metadata.title + ' ' + (metadata.year || '')).trim();

  const html = await fetchText(BASE_URL + '/?s=' + encodeURIComponent(searchQuery));
  const $ = cheerio.load(html);
  let bestMatch = null;

  $('article').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h2 a').text().trim();
    const category = $el.find('.cat-links a').text().trim();
    const meta = $el.find('.entry-meta').text();
    const link = $el.attr('href') || $el.find('a[href]').first().attr('href');

    if (!title || !link) return;
    if (isTV && !/series/i.test(category)) return;
    if (!isTV && !/movies?/i.test(category)) return;

    const yearMatch = meta.match(/\b(19|20)\d{2}\b/);
    const pageYear = yearMatch ? Number(yearMatch[0]) : null;
    let score = titleScore(metadata.title, title);

    if (metadata.year && pageYear === metadata.year) score += 0.35;
    else if (metadata.year && pageYear && Math.abs(pageYear - metadata.year) > 1) score -= 0.5;

    if (isTV && season) {
      const seasonMatch = title.match(/(?:season\s*|s)(\d+)/i);
      if (seasonMatch && Number(seasonMatch[1]) === Number(season)) score += 0.4;
      else if (seasonMatch) score -= 0.6;
    }

    if (!bestMatch || score > bestMatch.score)
      bestMatch = { url: absoluteUrl(link), score, title };
  });

  return bestMatch && bestMatch.score >= 0.7 ? bestMatch.url : '';
}

// --- Decode redirect chain ---
async function decodeRedirect(url) {
  if (/hubcloud|hubdrive/i.test(url)) return url;
  try {
    const html = await fetchText(url);
    const encoded = html.match(/['"]o['"]\s*,\s*['"]([^'"]+)['"]/)?.[1]
      || html.match(/'o','([^']+)'/)?.[1];
    if (!encoded) return url;
    const decoded = decodeBase64(rot13(decodeBase64(decodeBase64(encoded))));
    const json = JSON.parse(decoded);
    return json.o ? decodeBase64(json.o).trim() : url;
  } catch { return url; }
}

// --- Find HubCloud link ---
async function findHubCloud($page, pageUrl, getText) {
  const links = $page('a[href]').get();
  for (const link of links) {
    const $link = $page(link);
    const href = $link.attr('href');
    const text = $link.text();
    if (!href) continue;

    if (/hubcloud/i.test(text) || /hubcloud/i.test(href))
      return decodeRedirect(absoluteUrl(href, pageUrl));

    if (/hubdrive/i.test(text) || /hubdrive/i.test(href)) {
      const hubUrl = await decodeRedirect(absoluteUrl(href, pageUrl));
      try {
        const hubHtml = await fetchText(hubUrl, pageUrl);
        const $hub = cheerio.load(hubHtml);
        const cloudLink = $hub('a[href]').filter((_, el) => {
          const $el = $hub(el);
          return /hubcloud/i.test($el.text() + ' ' + ($el.attr('href') || ''));
        }).first().attr('href');
        if (cloudLink) return absoluteUrl(cloudLink, hubUrl);
      } catch {}
    }
  }
  return '';
}

// --- Extract direct video from HubCloud page ---
async function extractHubCloud(hubUrl, metadata) {
  try {
    let html = await fetchText(hubUrl, hubUrl);
    let pageUrl = hubUrl;

    const urlMatch = html.match(/var url\s*=\s*['"]([^'"]+)['"]/);
    const redirectUrl = urlMatch?.[1] || cheerio.load(html)('a.link').attr('href');
    if (redirectUrl) {
      pageUrl = absoluteUrl(redirectUrl, hubUrl);
      html = await fetchText(pageUrl, hubUrl);
    }

    const $ = cheerio.load(html);
    const title = $('div.card-header').text().replace(/\s+/g, ' ').trim()
      || $('title').text().trim() || metadata.title;
    const size = parseSize($('div.card-body').first().text());
    const fileSize = size !== 'N/A' ? size : metadata.size;
    const quality = parseQuality(title);
    const results = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || !isDirectVideo(href)) return;
      results.push({ url: href, title, quality, size: fileSize });
    });

    return results;
  } catch { return []; }
}

// --- Extract streams from content page ---
async function extractStreams(pageUrl, isTV, season, episode) {
  const html = await fetchText(pageUrl);
  const $ = cheerio.load(html);
  const items = [];

  if (isTV && season && episode) {
    const seasonStr = 'S' + String(season).padStart(2, '0');
    const episodeStr = 'Episode-' + String(episode).padStart(2, '0');

    $('.episode-item').each((_, el) => {
      const $el = $(el);
      if (!$el.find('.season-title').text().includes(seasonStr)) return;
      $el.find('.episode-download-item').each((_, dl) => {
        if ($(dl).text().includes(episodeStr))
          items.push($(dl));
      });
    });
  } else {
    $('.download-item').each((_, el) => items.push($(el)));
  }

  const allStreams = await Promise.all(items.map(async item => {
    const label = item.text().replace(/\s+/g, ' ').trim();
    const link = item.find('a[href]').text().trim();
    const info = {
      title: item.find('a[href]').text().trim() || label,
      quality: parseQuality(label),
      size: parseSize(label)
    };
    const hubLink = await findHubCloud(item, pageUrl, $);
    return hubLink ? extractHubCloud(hubLink, info) : [];
  }));

  return allStreams.flat();
}

// --- Build stream object for Nuvio ---
function buildStreamObject(title, label, url, quality, size, headers, seLabel, metadata, sortBy) {
  let decodedUrl = '';
  try { decodedUrl = decodeURIComponent(url || ''); }
  catch { decodedUrl = url || ''; }

  const cleanLabel = decodeEntities(label || '').replace(/[\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const combined = (cleanLabel + ' ' + decodedUrl).toUpperCase();
  let finalQuality = quality;

  const resMatch = combined.match(/\b(2160p|4k|1080p|720p|480p)\b/i);
  if (resMatch) {
    const res = resMatch[1].toLowerCase();
    if (res === '4k' || res === '2160p') finalQuality = '2160p';
    else if (res === '1080p') finalQuality = '1080p';
    else if (res === '720p') finalQuality = '720p';
    else if (res === '480p') finalQuality = '480p';
  }
  if (!finalQuality || finalQuality === 'N/A') finalQuality = parseQuality(comb);

  const qualityRank = getQualityRank(finalQuality);
  let audioType = 'Single-Audio';
  if (/\b(multi|multi\-audio)\b/i.test(combined)) audioType = 'Multi-Audio';
  else if (/\b(dual|dual\-audio|dubbed|hindi)\b/i.test(combined) || decodeEntities(title || '').toLowerCase().includes('hindi'))
    audioType = 'Dual-Audio';

  let displaySize = size && size !== 'N/A' ? size : 'N/A';
  const sizeMatch2 = cleanLabel.match(/\[\s*(\d+(?:\.\d+)?\s*[MG]B)\s*\]/i)
    || cleanLabel.match(/(\d+(?:\.\d+)?\s*[MG]B)/i)
    || decodedUrl.match(/(\d+(?:\.\d+)?\s*[MG]B)/i);
  if (sizeMatch2) displaySize = sizeMatch2[1].toUpperCase().replace(/\s+/g, '');

  let sizeInMB = 0;
  if (displaySize !== 'N/A') {
    const sizeMatch3 = displaySize.match(/([\d.]+)\s*(GB|MB)/i);
    if (sizeMatch3) {
      const num = parseFloat(sizeMatch3[1]);
      const unit = sizeMatch3[2].toUpperCase();
      sizeInMB = Math.round(unit === 'GB' ? num * 1024 : num);
    }
  }

  let sortTag = '';
  if (sortBy === 'size') sortTag = getInvertedSortTag(sizeInMB, 999999);
  else sortTag = getInvertedSortTag(qualityRank * 100000 + sizeInMB, 999999);

  const name = sortTag + PROVIDER_NAME + ' | ' + finalQuality + ' | ' + audioType;
  const displayTitle = metadata && metadata.title ? metadata.title : title;
  const displayYear = metadata && metadata.year ? metadata.year : 'N/A';

  const titleLine = seLabel && (seLabel.startsWith('S') || seLabel.includes('E'))
    ? '🎬 ' + displayTitle + ' - (' + displayYear + ') | ' + seLabel.replace(/E0*(\d+)/i, 'E$1').replace(/S0*(\d+)/i, 'S$1')
    : '🎬 ' + displayTitle + ' - (' + displayYear + ')';

  const qualityEmoji = finalQuality === '2160p' ? '⚡' : finalQuality === '720p' ? '💎' : '🔥';
  const format = /\.mp4($|\?)/i.test(decodedUrl) || /\.mp4\b/i.test(cleanLabel) ? 'MP4' : 'MKV';
  const line2 = qualityEmoji + ' ' + finalQuality + ' | 💾 ' + displaySize + ' | 📼 ' + format;

  const hdr = /\bhdr10\+/i.test(combined) ? 'HDR10+' : /\bhdr10\b/i.test(combined) ? 'HDR10' : 'HDR';
  const codec = /\b(h\.?265|x265|hevc)\b/i.test(combined) ? 'H.265' : 'H.264';
  const hdrTags = ['🌈 ' + hdr, '🎞️ ' + codec];
  if (/\b(dolby\s*vision|dovi|\.dv\.)\b/i.test(combined) || /[.\-_]dv[.\-_]/i.test(combined))
    hdrTags.push('👁️ DV');
  const line3 = hdrTags.join(' | ');

  const audio = /\btruehd\s*7\.1\b/i.test(combined) ? 'TrueHD 7.1' :
    /\bddp5\.1\b/i.test(combined) || /\beac3\b/i.test(combined) ? 'DDP5.1' : 'DD5.1';
  const atmos = /\batmos\b/i.test(combined) ? ' 🔊 Atmos' : '';
  const line5 = '🗣️ ' + audioType + ' | 🎧 ' + audio + atmos;

  const src = /\b(bluray|blu\-ray)\b/i.test(combined) ? 'BluRay' : 'WEB-DL';
  const line7 = '📡 ' + src;

  const fullTitle = titleLine + '\n' + line2 + '\n' + line3 + '\n' + line5 + '\n' + line7;

  return {
    qualityRank, sizeInMB,
    data: {
      name, title: fullTitle, size: fullTitle, description: fullTitle,
      url: url || '',
      behaviorHints: {
        notWebReady: true,
        proxyHeaders: { request: headers || { 'Referer': BASE_URL + '/' } }
      }
    }
  };
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season = null, episode = null, settings = {}) {
  const isTV = type === 'tv' || type === 'series';
  if (!tmdbId || (!isTV && type !== 'movie')) return [];

  try {
    const config = resolveSettings(settings);
    console.log('[4KHDHub] Request: ' + tmdbId + ' type=' + type + ' S=' + season + ' E=' + episode + ' sort=' + config.sortBy);

    const metadata = await getMetadata(tmdbId, type);
    const pageUrl = await findPage(metadata, isTV, season);
    if (!pageUrl) return [];

    const streams = await extractStreams(pageUrl, isTV, season, episode);

    let seLabel = '';
    if (isTV) {
      const s = parseInt(season, 10) || 1;
      const ep = parseInt(episode, 10) || 1;
      seLabel = 'S' + (s < 10 ? '0' : '') + s + 'E' + (ep < 10 ? '0' : '') + ep;
    }

    const seen = {};
    const results = [];

    for (let i = 0; i < streams.length; i++) {
      const s = streams[i];
      if (!isDirectVideo(s.url) || seen[s.quality]) continue;
      seen[s.quality] = true;

      const label = s.title + ' [' + s.quality + '] ' + s.size;
      const stream = buildStreamObject(
        metadata.title, label, s.url, s.quality, s.size,
        { 'Referer': BASE_URL + '/', 'User-Agent': USER_AGENT },
        seLabel.trim(), metadata, config.sortBy
      );
      results.push(stream);
    }

    results.sort((a, b) => {
      if (config.sortBy === 'size') return b.sizeInMB - a.sizeInMB;
      if (b.qualityRank !== a.qualityRank) return b.qualityRank - a.qualityRank;
      return b.sizeInMB - a.sizeInMB;
    });

    console.log('[4KHDHub] Returning ' + results.length + ' stream(s) sorted by ' + config.sortBy);
    return results.map(s => s.data);
  } catch (e) {
    console.error('[4KHDHub] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams, onSettings };
