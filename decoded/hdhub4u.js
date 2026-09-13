// ============================================
// DECODED: providers/hdhub4u.js (FULL)
// Provider: HDHub4u
// Original: Complex multi-extractor scraper with auto-domain rotation
// Features: HubCloud, VidStack, Pixeldrain, StreamTape, HubCdn extractors
// ============================================

const cheerio = require('cheerio-without-node-native');
const CryptoJS = require('crypto-js');

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
let MAIN_URL = 'https://hdhub4u.mx';
const DOMAINS_URL = 'https://hdhub4u.domains.json'; // auto-update domain
const DOMAIN_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  'Cookie': 'cf_clearance=xxx',
  'Referer': MAIN_URL + '/'
};

function updateMainUrl(newUrl) {
  MAIN_URL = newUrl;
  HEADERS['Referer'] = newUrl + '/';
}

// --- Domain auto-update ---
let domainCacheTimestamp = 0;

async function fetchAndUpdateDomain() {
  const now = Date.now();
  if (now - domainCacheTimestamp < DOMAIN_CACHE_TTL) return;
  console.log('[HDHub4u] Fetching latest domain...');
  try {
    const res = await fetch(DOMAINS_URL, { method: 'GET', headers: { 'User-Agent': HEADERS['User-Agent'] } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.domain) {
        const newDomain = data.domain;
        if (newDomain !== MAIN_URL) {
          console.log('[HDHub4u] Updating domain from ' + MAIN_URL + ' to ' + newDomain);
          updateMainUrl(newDomain);
          domainCacheTimestamp = now;
        }
      }
    }
  } catch (e) { console.error('[HDHub4u] Domain fetch error: ' + e.message); }
}

async function getCurrentDomain() {
  await fetchAndUpdateDomain();
  return MAIN_URL;
}

// --- Utility functions ---
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function extractServerName(text) {
  if (!text) return 'Unknown';
  if (text.includes('HubCloud')) {
    const match = text.match(/HubCloud(?:\s*-\s*([^\[\]]+))?/);
    return match ? match[1] || 'Download' : 'HubCloud';
  }
  if (text.startsWith('Pixeldrain')) return 'Pixeldrain';
  if (text.includes('StreamTape')) return 'StreamTape';
  if (text.includes('VidStack')) return 'VidStack';
  if (text.includes('HubCdn')) return 'HubCdn';
  if (text.startsWith('Direct')) return 'Direct';
  return text.replace(/^www\./, '').split('.')[0];
}

function rot13(input) {
  return input.replace(/[a-zA-Z]/g, function(c) {
    return String.fromCharCode((c <= 'Z' ? 0x5a : 0x7a) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function atob(input) {
  if (!input) return '';
  let str = String(input).replace(/=+$/, '');
  let output = '', pos = 0, a, b, i = 0;
  while (b = str.charAt(i++)) {
    b = BASE64_CHARS.indexOf(b);
    ~b && (a = pos % 4 ? a * 64 + b : b, pos++ % 4 && (output += String.fromCharCode(255 & a >> (-2 * pos & 6))));
  }
  return output;
}

function cleanTitle(filename) {
  let name = filename.replace(/\.[a-zA-Z0-9]{2,4}$/, '');
  const normalized = name
    .replace(/WEB[-_. ]?DL/gi, ' ')
    .replace(/WEB[-_. ]?RIP/gi, 'WEBRIP')
    .replace(/H[ .]?265/gi, ' ')
    .replace(/H[ .]?264/gi, ' ')
    .replace(/DDP[ .]?([0-9]\.[0-9])/gi, 'DDP$1');
  const parts = normalized.split(/[\s_.]/);
  const sources = new Set(['WEB-DL', 'WEBRIP', 'BLURAY', 'HDRIP', 'DVDRIP', 'HDTV', 'CAM', 'TS', 'TELESYNC']);
  const codecs = new Set(['H264', 'H265', 'X264', 'X265', 'HEVC', 'AVC']);
  const audioKeywords = ['AAC', 'AC3', 'DTS', 'MP3', 'FLAC', 'DD', 'DDP', 'EAC3'];
  const atmos = new Set(['ATMOS']);
  const hdr = new Set(['SDR', 'HDR', 'HDR10', 'HDR10+', 'DV', 'DOLBYVISION']);
  const tags = parts.map(part => {
    const upper = part.toUpperCase();
    if (sources.has(upper)) return upper;
    if (codecs.has(upper)) return upper;
    if (audioKeywords.some(k => upper.includes(k))) return upper;
    if (atmos.has(upper)) return upper;
    if (hdr.has(upper)) return upper === 'DOLBYVISION' || upper === 'DV' ? 'DV' : upper;
    if (upper === 'NF' || upper === 'CR') return upper;
    return null;
  }).filter(Boolean);
  return [...new Set(tags)].join(' ');
}

// --- Title matching ---
function normalizeTitle(title) {
  if (!title) return '';
  return title.toLowerCase()
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/[:\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function calculateTitleSimilarity(a, b) {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);
  if (normA === normB) return 1;
  const wordsA = normA.split(/\s+/).filter(w => w.length > 0);
  const wordsB = normB.split(/\s+/).filter(w => w.length > 0);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = wordsA.filter(w => setB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  const jaccard = intersection.length / union.size;
  const extraInB = wordsB.filter(w => !setA.has(w)).length;
  let score = jaccard - extraInB * 0.05;
  if (wordsA.length > 0 && wordsA.every(w => setB.has(w))) score += 0.2;
  return score;
}

function findBestTitleMatch(media, results, type, season) {
  if (!results || results.length === 0) return null;
  let bestMatch = null, bestScore = 0;
  for (const result of results) {
    let score = calculateTitleSimilarity(media.title, result.title);
    if (media.year && result.year) {
      const yearDiff = Math.abs(media.year - result.year);
      if (yearDiff === 0) score += 0.2;
      else if (yearDiff <= 1) score += 0.1;
      else if (yearDiff > 5) score -= 0.3;
    }
    if (type === 'tv' && season) {
      const lower = result.title.toLowerCase();
      const seasonPatterns = ['season ' + season, 's' + season, 'season ' + String(season).padStart(2, '0'), 's' + String(season).padStart(2, '0')];
      const hasSeason = seasonPatterns.some(p => lower.includes(p));
      const seasonMatch = lower.match(/season\s*(\d+)|s(\d+)/i);
      if (seasonMatch) {
        const foundSeason = parseInt(seasonMatch[1] || seasonMatch[2]);
        if (foundSeason !== season) score -= 0.8;
      }
      if (hasSeason) score += 0.5;
      else score -= 0.3;
    }
    if ((result.title.toLowerCase().includes('2160p') || result.title.toLowerCase().includes('4k'))) score += 0.05;
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestMatch = result;
    }
  }
  if (bestMatch) console.log('[HDHub4u] Best match: ' + bestMatch.title + ' (score: ' + bestScore.toFixed(2) + ')');
  return bestMatch;
}

// --- TMDB details ---
async function getTMDBDetails(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const url = TMDB_BASE_URL + '/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&language=en-US';
  const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json', 'User-Agent': HEADERS['User-Agent'] } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.status);
  const data = await res.json();
  const title = type === 'tv' ? data.name : data.title;
  const date = type === 'tv' ? data.first_air_date : data.release_date;
  const year = date ? parseInt(date.split('-')[0]) : null;
  return { title, year, imdbId: data.external_ids?.imdb_id || null };
}

// --- Redirect link resolver (base64 + rot13 chain) ---
async function getRedirectLinks(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
    const html = await res.text();
    const encodedRegex = /s\s*\(\s*['"]o['"]\s*,\s*['"]([A-Za-z0-9+/=]+)['"]|ck\s*\(\s*['"]_wp_http_\d+['"]\s*,\s*['"]([^'"]+)['"]/g;
    let encoded = '', match;
    while ((match = encodedRegex.exec(html)) !== null) {
      const chunk = match[1] || match[2];
      if (chunk) encoded += chunk;
    }
    if (!encoded) {
      const redirectMatch = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (redirectMatch && redirectMatch[1]) {
        const newUrl = redirectMatch[1];
        if (newUrl !== url && !newUrl.includes(url)) return await getRedirectLinks(newUrl);
      }
      return null;
    }
    const decoded = atob(rot13(atob(atob(encoded))));
    const json = JSON.parse(decoded);
    const finalUrl = atob(json['o'] || '').trim();
    if (finalUrl) return finalUrl;
    const redirectPath = atob(json['r'] || '').trim();
    const baseUrl = (json['b'] || '').trim();
    if (baseUrl && redirectPath) {
      const res2 = await fetch(baseUrl + '?re=' + redirectPath, { headers: HEADERS });
      const html2 = await res2.text();
      const $ = cheerio.load(html2);
      return ($('a').attr('href') || html2).trim();
    }
    return null;
  } catch { return null; }
}

// --- VidStack/Hubstream extractor (AES-CBC decryption) ---
async function vidStackExtractor(url) {
  try {
    const fileId = url.split('#').pop().split('/').pop();
    const origin = new URL(url).origin;
    const apiUrl = origin + '/api/' + fileId;
    const res = await fetch(apiUrl, { headers: { ...HEADERS, 'Referer': url } });
    const encrypted = (await res.text()).trim();
    const key = CryptoJS.enc.Utf8.parse('hIgsN0n1H5gDs1k0');
    const ivOptions = ['hIgsN0n1H5gDs1k0', '0s1kDs5gH1n0sGIh'];
    for (const ivStr of ivOptions) {
      try {
        const iv = CryptoJS.enc.Utf8.parse(ivStr);
        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Base64.parse(encrypted) },
          key,
          { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (result && result.includes('"source"')) {
          const sourceMatch = result.match(/"source":"(.*?)"/);
          const sourceUrl = sourceMatch?.[1]?.replace(/\\/g, '');
          const subtitles = [];
          const subtitleBlock = result.match(/"subtitle":\{(.*?)\}/)?.[1];
          if (subtitleBlock) {
            const subRegex = /"([^"]+)":\s*"([^"]+)"/g;
            let subMatch;
            while ((subMatch = subRegex.exec(subtitleBlock)) !== null) {
              const subUrl = subMatch[2].split('#')[0].replace(/\\/g, '');
              if (subUrl) subtitles.push({ language: subMatch[1], url: subUrl.includes('http') ? subUrl : '' + origin + subUrl });
            }
          }
          if (sourceUrl) return [{
            source: 'Vidstack Hubstream', quality: '1080p',
            url: sourceUrl.replace('https:', 'http:'),
            headers: { 'Referer': url, 'Origin': url.split('/').slice(0, 3).join('/') },
            subtitles
          }];
        }
      } catch {}
    }
    return [];
  } catch { return []; }
}

// --- HubCloud extractor ---
async function hubCloudExtractor(url, referer) {
  try {
    let pageUrl = url.replace(/hubcloud\.[a-z]+/, 'hubcloud.dad');
    const res = await fetch(pageUrl, { headers: { ...HEADERS, 'Referer': referer } });
    let html = await res.text();
    let finalUrl = pageUrl;
    if (!pageUrl.includes('hubcloud.php')) {
      let redirectUrl = '';
      const $ = cheerio.load(html);
      const downloadBtn = $('a#download');
      if (downloadBtn.length) redirectUrl = downloadBtn.attr('href');
      else {
        const varMatch = html.match(/var url = '([^']*)'/);
        if (varMatch) redirectUrl = varMatch[1];
      }
      if (redirectUrl) {
        if (!redirectUrl.startsWith('http')) {
          const parsed = new URL(pageUrl);
          redirectUrl = parsed.protocol + '//' + parsed.host + '/' + redirectUrl.replace(/^\//, '');
        }
        finalUrl = redirectUrl;
        const res2 = await fetch(finalUrl, { headers: { ...HEADERS, 'Referer': pageUrl } });
        html = await res2.text();
      }
    }
    const $ = cheerio.load(html);
    const fileSize = $('div.card-body').text().trim();
    const headerText = $('div.card-header').text().trim();
    const qualityMatch = headerText.match(/(\d{3,4})[pP]/);
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : 1080;
    const tags = cleanTitle(headerText);
    const label = (tags ? '[' + tags + ']' : '') + (fileSize ? '[' + fileSize + ']' : '');
    const sizeBytes = (() => {
      const match = fileSize.match(/([\d.]+)\s*(GB|MB|KB)/i);
      if (!match) return 0;
      const units = { 'GB': 1024**3, 'MB': 1024**2, 'KB': 1024 };
      return parseFloat(match[1]) * (units[match[2].toUpperCase()] || 0);
    })();
    const streams = [];
    const buttons = $('a.btn').get();
    for (const btn of buttons) {
      const href = $(btn).attr('href');
      const text = $(btn).text().trim().toLowerCase();
      const fileName = headerText || tags || 'Unknown';
      if (text.includes('download file') || text.includes('fsl') || text.includes('hubcloud') || text.includes('fslv2') || text.includes('mega server') || href && href.includes('r2.dev')) {
        let serverName = 'HubCloud - Direct';
        if (href && href.includes('r2.dev')) serverName = 'HubCloud - R2';
        else if (href && href.includes('workers.dev')) serverName = 'HubCloud - Workers';
        else if (text.includes('fsl')) serverName = 'HubCloud - FSL';
        else if (text.includes('10gbps')) serverName = 'HubCloud - S3';
        else if (text.includes('fslv2')) serverName = 'HubCloud - FSLv2';
        else if (text.includes('mega server')) serverName = 'HubCloud - Mega';
        streams.push({ source: serverName + ' ' + label, quality, url: href, size: sizeBytes, fileName });
      } else if (text.includes('buzzserver')) {
        try {
          const buzzRes = await fetch(href + '?auto=1', { method: 'GET', headers: { ...HEADERS, 'Referer': href }, redirect: 'follow' });
          let buzzUrl = buzzRes.headers.get('location') || buzzRes.headers.get('url');
          if (!buzzUrl && buzzRes.url && buzzRes.url !== href + '?auto=1') buzzUrl = buzzRes.url;
          if (buzzUrl) streams.push({ source: 'HubCloud - BuzzServer ' + label, quality, url: buzzUrl, size: sizeBytes, fileName });
        } catch {}
      } else if (text.includes('10gbps') || href && href.includes('gigabytes')) {
        let streamUrl = href;
        if (href && !href.includes('gigabytes')) {
          try {
            const redirectRes = await fetch(href, { method: 'GET', redirect: 'follow' });
            const location = redirectRes.headers.get('location');
            if (location && location.includes('video') && (streamUrl = location.substring(location.indexOf('video') + 5)));
          } catch {}
        }
        streams.push({ source: 'HubCloud - 10Gbps ' + label, quality, url: streamUrl, size: sizeBytes, fileName });
      } else if (text.includes('cloudflare') || href && href.includes('workers.dev')) {
        streams.push({ source: 'HubCloud - Cloudflare ' + label, quality, url: href, size: sizeBytes, fileName });
      } else if (href && href.includes('pixeldrain')) {
        const pdStreams = await pixelDrainExtractor(href);
        streams.push(...pdStreams.map(s => ({ ...s, source: s.source + ' ' + label, size: sizeBytes, fileName })));
      } else if (href && !href.includes('zip') && href.includes('http')) {
        const extracted = await loadExtractor(href, finalUrl);
        streams.push(...extracted.map(s => ({ ...s, quality: s.quality || quality })));
      }
    }
    return streams;
  } catch { return []; }
}

// --- HubCdn extractor ---
async function hubCdnExtractor(url, referer) {
  try {
    const res = await fetch(url, { headers: { ...HEADERS, 'Referer': referer } });
    const html = await res.text();
    const $ = cheerio.load(html);
    let scriptContent = '';
    $('script').each((_, el) => {
      const text = $(el).html();
      if (text && text.includes('reurl')) scriptContent = text;
    });
    if (scriptContent) {
      const reurlMatch = scriptContent.match(/reurl\s*=\s*["']([^"']+)["']/);
      if (reurlMatch && reurlMatch[1]) {
        const reurl = reurlMatch[1];
        if (reurl.includes('?r=')) {
          const encoded = reurl.split('?r=').pop();
          try {
            const decoded = atob(encoded);
            const videoUrl = decoded.substring(decoded.lastIndexOf('/') + 5);
            if (videoUrl && videoUrl.includes('http')) return [{ source: 'HubCdn', quality: 1080, url: videoUrl }];
          } catch {}
        } else if (reurl.includes('/video')) {
          const videoPath = reurl.split('/video').pop();
          if (videoPath && videoPath.startsWith('http')) return [{ source: 'HubCdn', quality: 1080, url: videoPath }];
        } else if (reurl.includes('http')) {
          return [{ source: 'HubCdn', quality: 1080, url: reurl }];
        }
      }
    }
    const rMatch = html.match(/r=([A-Za-z0-9+/=]+)/);
    if (rMatch && rMatch[1]) {
      try {
        const decoded = atob(rMatch[1]);
        const videoUrl = decoded.substring(decoded.lastIndexOf('/') + 5);
        if (videoUrl && videoUrl.includes('http')) return [{ source: 'HubCdn', quality: 1080, url: videoUrl }];
      } catch {}
    }
    return [];
  } catch { return []; }
}

// --- Pixeldrain extractor ---
async function pixelDrainExtractor(url) {
  try {
    const parsed = new URL(url);
    const origin = parsed.protocol + '//' + parsed.host;
    const fileId = url.match(/(?:file|u)\/([A-Za-z0-9]+)/)?.[1] || url.split('/').pop();
    if (!fileId) return [{ source: 'Pixeldrain', quality: 0, url }];
    const apiUrl = url.includes('?download') ? url : origin + '/api/file/' + fileId + '?download';
    return [{ source: 'Pixeldrain', quality: 0, url: apiUrl }];
  } catch { return [{ source: 'Pixeldrain', quality: 0, url }]; }
}

// --- StreamTape extractor ---
async function streamTapeExtractor(url) {
  try {
    const parsed = new URL(url);
    parsed.host = 'streamtape.com';
    const res = await fetch(parsed.toString(), { headers: HEADERS });
    const html = await res.text();
    let videoUrl = html.match(/document\.getElementById\('videolink'\)\.innerHTML = (.*?);/)?.[1]
      ?.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)?.[1];
    if (!videoUrl) videoUrl = html.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)?.[1];
    return videoUrl ? [{ source: 'StreamTape', quality: 720, url: 'https:' + videoUrl }] : [];
  } catch { return []; }
}

// --- HBLinks extractor ---
async function hbLinksExtractor(url) {
  try {
    const res = await fetch(url, { headers: { ...HEADERS, 'Referer': url } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const links = $('h3 a, h5 a, div.entry-content p a').map((_, el) => $(el).attr('href')).get();
    const results = await Promise.all(links.map(link => loadExtractor(link, url)));
    return results.flat().map(s => ({ ...s, source: s.source + ' [HB]' }));
  } catch { return []; }
}

// --- Load appropriate extractor based on URL ---
async function loadExtractor(url, referer = MAIN_URL) {
  try {
    const hostname = new URL(url).hostname;
    const isRedirect = url.includes('hdhub4u.') || hostname.includes('hdhub4u') || hostname.includes('hub4u') || hostname.includes('bloggingvector') || hostname.includes('ampproject.org');
    if (isRedirect) {
      const redirectUrl = await getRedirectLinks(url);
      if (redirectUrl && redirectUrl !== url) return await loadExtractor(redirectUrl, url);
      return [];
    }
    if (hostname.includes('hubcloud')) return await hubCloudExtractor(url, referer);
    if (hostname.includes('hubcdn')) return await hubCdnExtractor(url, referer);
    if (hostname.includes('hblinks') || hostname.includes('hubstream.dad')) return await hbLinksExtractor(url);
    if (hostname.includes('hubstream') || hostname.includes('vidstack')) return await vidStackExtractor(url);
    if (hostname.includes('pixeldrain')) return await pixelDrainExtractor(url);
    if (hostname.includes('streamtape')) return await streamTapeExtractor(url);
    if (hostname.includes('direct')) return [{ source: 'Direct', quality: 1080, url }];
    if (hostname.includes('hubdrive')) {
      const res = await fetch(url, { headers: { ...HEADERS, 'Referer': referer } });
      const html = await res.text();
      const $ = cheerio.load(html);
      const btn = $('.btn.btn-primary.btn-user.btn-success1.m-1').attr('href');
      if (btn) return await loadExtractor(btn, url);
    }
    return [];
  } catch { return []; }
}

// --- Search HDHub4u ---
async function search(query) {
  const dateStr = new Date().toISOString().split('T')[0];
  const url = MAIN_URL + '/?s=' + encodeURIComponent(query) + '&query_by=post_title,category&query_by_weights=4,2&sort_by=sort_by_date:desc&limit=15&highlight_fields=none&use_cache=true&page=1&analytics_tag=' + dateStr;
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  if (!data || !data.hits) return [];
  return data.hits.map(hit => {
    const doc = hit.document;
    const title = doc.post_title;
    const yearMatch = title.match(/\((\d{4})\)|\b(\d{4})\b/);
    const year = yearMatch ? parseInt(yearMatch[1] || yearMatch[2]) : null;
    let permalink = doc.permalink;
    if (permalink && permalink.startsWith('/')) permalink = '' + MAIN_URL + permalink;
    return { title, url: permalink, poster: doc.image, year };
  });
}

// --- Get download links from page ---
async function getDownloadLinks(pageUrl) {
  const currentDomain = await getCurrentDomain();
  if (pageUrl.includes('hdhub4u.')) {
    try {
      const parsed = new URL(pageUrl);
      const domainParsed = new URL(currentDomain);
      parsed.host = domainParsed.host;
      pageUrl = parsed.toString();
    } catch {}
  }
  const res = await fetch(pageUrl, { headers: { ...HEADERS, 'Referer': currentDomain + '/' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const entryTitle = $('.entry-title').text();
  const isMovie = entryTitle.toLowerCase().includes('movie');
  if (isMovie) {
    const qualityLinks = $('h3, h4').filter((_, el) => $(el).text().match(/480|720|1080|2160|4K/i));
    const hubLinks = $('a').filter((_, el) => {
      const href = $(el).attr('href');
      return href && (href.includes('hubcloud') || href.includes('hubstream'));
    });
    const allUrls = [...new Set([...qualityLinks.map((_, el) => $(el).attr('href')).get(), ...hubLinks.map((_, el) => $(el).attr('href')).get()])];
    const results = await Promise.all(allUrls.map(url => loadExtractor(url, pageUrl)));
    const flat = results.flat();
    const seen = new Set();
    const filtered = flat.filter(s => {
      if (!s.url || s.url.includes('.zip')) return false;
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
    return { finalLinks: filtered, isMovie };
  } else {
    // TV series - parse episodes
    const episodeMap = new Map();
    const movieLinks = [];
    $('h3, h4').each((_, el) => {
      const $el = $(el);
      const heading = $el.text();
      const links = $el.nextAll('a');
      const hrefs = links.map((_, a) => $(a).attr('href')).get();
      const hasQuality = hrefs.some((_, i) => $(links[i]).text().match(/1080|720|4K|2160/i));
      if (hasQuality) { movieLinks.push(...hrefs); return; }
      const epMatch = heading.match(/(?:EPiSODE\s*(\d+)|E(\d+))/i);
      if (epMatch) {
        const epNum = parseInt(epMatch[1] || epMatch[2]);
        if (!episodeMap.has(epNum)) episodeMap.set(epNum, []);
        episodeMap.get(epNum).push(...hrefs);
        let next = $el.next();
        while (next.length && next[0].tagName !== 'hr') {
          const epLinks = next.find('a[href]').map((_, a) => $(a).attr('href')).get();
          episodeMap.get(epNum).push(...epLinks);
          next = next.next();
        }
      }
    });
    // Process movie links
    if (movieLinks.length > 0) {
      await Promise.all(movieLinks.map(async (link) => {
        try {
          const redirect = await getRedirectLinks(link);
          if (!redirect) return;
          const res = await fetch(redirect, { headers: HEADERS });
          const html = await res.text();
          const $ = cheerio.load(html);
          $('h3').each((_, el) => {
            const text = $(el).text();
            const href = $(el).attr('href');
            const epMatch = text.match(/Episode\s*(\d+)/i);
            if (epMatch && href) {
              const epNum = parseInt(epMatch[1]);
              if (!episodeMap.has(epNum)) episodeMap.set(epNum, []);
              episodeMap.get(epNum).push(href);
            }
          });
        } catch {}
      }));
    }
    const episodeLinks = [];
    episodeMap.forEach((links, epNum) => {
      const unique = [...new Set(links)];
      episodeLinks.push(...unique.map(url => ({ url, episode: epNum })));
    });
    const results = await Promise.all(episodeLinks.map(async (item) => {
      try {
        const streams = await loadExtractor(item.url, pageUrl);
        return streams.map(s => ({ ...s, episode: item.episode }));
      } catch { return []; }
    }));
    const flat = results.flat();
    const seen = new Set();
    const filtered = flat.filter(s => {
      if (!s.url || s.url.includes('.zip')) return false;
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
    return { finalLinks: filtered, isMovie };
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[HDHub4u] Request: ' + tmdbId + ' type=' + type);
  try {
    const media = await getTMDBDetails(tmdbId, type);
    console.log('[HDHub4u] Found: "' + media.title + '" (' + (media.year || 'N/A') + ')');
    const searchQuery = type === 'tv' && season ? media.title + ' Season ' + season : media.title;
    const results = await search(searchQuery);
    if (results.length === 0) return [];
    const bestMatch = findBestTitleMatch(media, results, type, season);
    const match = bestMatch || results[0];
    console.log('[HDHub4u] Using: ' + match.title + ' (' + match.url + ')');
    const downloadData = await getDownloadLinks(match.url);
    const allLinks = downloadData.finalLinks;
    let filteredLinks = allLinks;
    if (type === 'tv' && episode !== null) filteredLinks = allLinks.filter(l => l.episode === episode);
    const streams = filteredLinks.map(link => {
      let fileName = link.fileName && link.fileName !== 'Unknown' ? link.fileName : media.title;
      if (type === 'tv' && season && episode) fileName = media.title + ' S' + String(season).padStart(2, '0') + 'E' + String(episode).padStart(2, '0');
      const serverName = extractServerName(link.source);
      let quality = 'Unknown';
      if (typeof link.quality === 'number' && link.quality > 0) {
        if (link.quality >= 2160) quality = '4K';
        else if (link.quality >= 1080) quality = '1080p';
        else if (link.quality >= 720) quality = '720p';
        else if (link.quality >= 480) quality = '480p';
      } else if (typeof link.quality === 'string') quality = link.quality;
      return {
        name: 'HDHub4u | ' + serverName,
        title: fileName,
        url: link.url,
        quality: quality,
        size: formatBytes(link.size),
        headers: link.headers || undefined,
        provider: 'HDHub4u'
      };
    });
    const qualityRank = { '4K': 4, '1080p': 2, '720p': 1, '480p': 0, 'Unknown': -2 };
    return streams.sort((a, b) => (qualityRank[b.quality] || -3) - (qualityRank[a.quality] || -3));
  } catch (e) {
    console.error('[HDHub4u] Scraping error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
