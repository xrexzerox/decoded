// ============================================
// DECODED: providers/moviesdrive.js (FULL)
// Provider: MoviesDrive (new1.moviesdrive.christmas)
// Original: Complex multi-step scraping pipeline
// Pipeline: TMDB → Site Search → Archive Links → HubCloud → Direct Video URLs
// ============================================

const PROVIDER_NAME = 'MoviesDrive';
const MAIN_URL = 'https://new1.moviesdrive.christmas';
const ARCHIVE_DOMAIN = 'https://mdrive.lol';
const TMDB_KEY = '439c478a771f35c05022f9feabcca01c';

const MOBILE_UAS = [
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];

function getHeaders(overrides) {
  const userAgent = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  const headers = { 'User-Agent': userAgent, 'Accept-Language': 'en-US,en;q=0.9' };
  if (overrides) for (const key in overrides) headers[key] = overrides[key];
  return headers;
}

function log(msg) { console.log('[MoviesDrive] ' + msg); }
function err(msg) { console.error('[MoviesDrive] ' + msg); }

// --- Fetch text with timeout ---
async function fetchText(url, options, timeout) {
  timeout = timeout || 12000;
  try {
    var signal = null;
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
      signal = AbortSignal.timeout(timeout);
    var headers = getHeaders(options && options.headers ? null : null);
    if (options && options.headers) for (var k in options.headers) headers[k] = options.headers[k];
    var fetchOptions = { ...options, headers };
    if (signal) fetchOptions.signal = signal;
    var fetchPromise = fetch(url, fetchOptions);
    var timeoutPromise = new Promise(function(_, reject) {
      setTimeout(function() { reject(new Error('Timeout: ' + timeout + 'ms')); }, timeout);
    });
    var result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result.ok) return await result.text();
    return null;
  } catch (e) {
    err('fetch: ' + url.substring(0, 80) + ' -> ' + (e.message || ''));
    return null;
  }
}

async function fetchJson(url, options, timeout) {
  var text = await fetchText(url, options, timeout);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// --- Parse quality from label ---
function parseQuality(text) {
  var str = String(text || '');
  var match = str.match(/(2160|1080|720|480)\s*P/i);
  if (match) return match[1] + 'p';
  if (/4K|UHD/i.test(str)) return '2160p';
  if (/1440|2K/i.test(str)) return '1440p';
  return 'HD';
}

// --- Extract clean title from HTML <title> ---
function extractSiteTitle(html) {
  var match = html.match(/<title>(.*?)<\/title>/i);
  if (!match) return '';
  var raw = match[1];
  var clean = raw.match(/Download\s+(.+?)\s+(?:In HD Free|Free Download)/i);
  if (clean) return clean[1].trim();
  var result = raw.replace(/^(?:Download\s+)?/, '');
  result = result.replace(/\s+(?:\d{3,4}p\b|4K\b|WEB-DL\b|BluRay\b|HDTV\b|x26[45]\b|HEVC\b|SDR\b|HDR\b|DD\d|DDP\d|Hindi|English|Dual\s*Audio|ESubs?)\b.*$/i, '');
  result = result.replace(/\s*[-–|]\s*\w*\s*$/i, '').trim();
  result = result.replace(/&#8211;/g, '–');
  return result || raw;
}

// --- Strict title matching ---
function isStrictMatch(mediaTitle, mediaYear, pageTitle, pageYear) {
  if (!mediaTitle || !pageTitle) return false;
  var cleanMedia = mediaTitle.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim().replace(/\s+/g, ' ');
  var cleanPage = pageTitle.toLowerCase().replace(/download\s*/g, '').replace(/[^a-z0-9\s]/g, ' ').trim().replace(/\s+/g, ' ');
  if (cleanPage !== cleanMedia && cleanPage.indexOf(cleanMedia + ' ') !== 0 &&
      cleanPage.indexOf(' ' + cleanMedia + ' ') === -1 &&
      cleanPage.indexOf(' ' + cleanMedia) !== cleanPage.length - cleanMedia.length - 1)
    return false;
  if (mediaYear && pageYear) {
    var y1 = parseInt(mediaYear), y2 = parseInt(pageYear);
    if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1 - y2) > 1) return false;
  }
  return true;
}

// --- Extract HTML section for specific season ---
function extractSeasonHtml(html, season) {
  if (!html || season == null) return html;
  var seasonPattern = new RegExp(
    '(<h[1-6][^>]*>|<strong[^>]*>|<span[^>]*>)[\\s\\S]{0,100}?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\b(?!\\s*[-–+&])', 'gi'
  );
  var match, markers = [];
  while ((match = seasonPattern.exec(html)) !== null) {
    markers.push({ index: match.index, season: parseInt(match[2]) });
  }
  var startIdx = -1, endIdx = -1;
  for (var i = 0; i < markers.length; i++) {
    if (markers[i].season === season) { if (startIdx === -1) startIdx = i; }
    else endIdx = i;
  }
  if (startIdx === -1) {
    // Try range pattern like "Season 1-3"
    var rangePattern = /(?:Season|Saison|Staffel)\s*0*(\d+)\s*[-–]\s*0*(\d+)/gi;
    var rangeMatch, foundIdx = -1;
    while ((rangeMatch = rangePattern.exec(html)) !== null) {
      if (season >= parseInt(rangeMatch[2]) && season <= parseInt(rangeMatch[3])) {
        foundIdx = rangeMatch.index; break;
      }
    }
    if (foundIdx !== -1) return html.substring(foundIdx);
    return null;
  }
  var contentStart = markers[startIdx].index;
  if (endIdx > startIdx)
    for (var i = 0; i < markers.length; i++)
      if (markers[i].season === season && i > endIdx) {
        contentStart = markers[i].index; break;
      }
  var contentEnd = html.length;
  for (var i = 0; i < markers.length; i++)
    if (markers[i].index > contentStart && markers[i].season !== season) {
      contentEnd = markers[i].index; break;
    }
  return html.substring(contentStart, contentEnd);
}

// --- TMDB media lookup ---
async function getMedia(tmdbId, type) {
  var id = String(tmdbId || '').trim();
  var isImdb = id.indexOf('tt') === 0;
  var mediaType = (type === 'tv' || type === 'series') ? 'tv' : 'movie';
  try {
    if (isImdb) {
      var data = await fetchJson(
        'https://api.themoviedb.org/3/find/' + id + '?api_key=' + TMDB_KEY + '&external_source=imdb_id', {}, 10000
      );
      var results = data ? (mediaType === 'tv' ? data.tv_results : data.movie_results) : null;
      if (results && results.length > 0) {
        var item = results[0];
        return {
          title: mediaType === 'tv' ? item.name : item.title,
          year: (item.first_air_date || item.release_date || '').split('-')[0],
          imdb: id
        };
      }
    } else {
      var data = await fetchJson(
        'https://api.themoviedb.org/3/' + mediaType + '/' + id + '?api_key=' + TMDB_KEY + '&append_to_response=external_ids', {}, 10000
      );
      if (data) return {
        title: mediaType === 'tv' ? data.name : data.title,
        year: (data.first_air_date || data.release_date || '').split('-')[0],
        imdb: data.imdb_id || data.external_ids && data.external_ids.imdb_id || null
      };
    }
  } catch (e) { err('tmdb: ' + e.message); }
  return { title: id, year: null, imdb: null };
}

// --- Search MoviesDrive site ---
async function searchSite(query) {
  var encoded = encodeURIComponent(query);
  var url = MAIN_URL + '/?s=' + encoded + '&per_page=10';
  var data = await fetchJson(url, { headers: { 'Referer': MAIN_URL + '/' } }, 10000);
  if (!data || !data.hits || data.hits.length === 0) return log('no search results for: ' + query), [];
  var results = [];
  for (var i = 0; i < data.hits.length; i++) {
    var hit = data.hits[i];
    if (hit && hit.permalink && hit.post_title) {
      var yearMatch = hit.post_title.match(/\((\d{4})\)/);
      results.push({
        title: hit.post_title,
        href: hit.permalink,
        year: yearMatch ? parseInt(yearMatch[1]) : null,
        imdb: hit.imdb || null
      });
    }
  }
  return log('found ' + results.length + ' for: ' + query), results;
}

// --- Parse archive links from page ---
async function parsePage(url, season, cachedHtml) {
  var html = cachedHtml || await fetchText(url, { headers: { 'Referer': MAIN_URL + '/' } }, 12000);
  if (!html) return [];
  var isTV = season != null;
  var section = isTV ? extractSeasonHtml(html, season) : html;
  if (!section) return log('season ' + season + ' not found'), [];
  var archives = [];
  var linkRegex = /href="(https?:\/\/mdrive\.lol\/archive\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  var match;
  while ((match = linkRegex.exec(section)) !== null) {
    var label = match[3].replace(/<[^>]+>/g, '').trim();
    if (isTV && /zip/i.test(label)) continue;
    var quality = parseQuality(label);
    if (quality === 'HD') continue;
    var sizeMatch = label.match(/\[([\d.]+)\s*(MB|GB|TB)\]/i);
    var size = sizeMatch ? sizeMatch[0] : '';
    archives.push({ id: match[2], url: match[1], label: label, q: quality, size: size });
  }
  return log('archive links: ' + archives.length + (isTV ? ' (season ' + season + ')' : '')), archives;
}

// --- Parse HubCloud links from archive page ---
async function parseArchive(archiveUrl, episode) {
  var html = await fetchText(archiveUrl, { headers: { 'Referer': MAIN_URL + '/' } }, 12000);
  if (!html) return [];
  var links = [];
  var hubRegex = /https?:\/\/hubcloud\.[a-z]+\/drive\/([a-z0-9_]+)/gi;
  var match;
  while ((match = hubRegex.exec(html)) !== null) {
    var url = match[0];
    var isTV = episode != null;
    if (isTV) {
      var contextStart = Math.max(0, match.index - 300);
      var context = html.substring(contextStart, match.index);
      var epRegex = /(?:EP|Episode|E)\D*0*(\d+)/gi;
      var epMatch, foundEp = -1;
      while ((epMatch = epRegex.exec(context)) !== null) foundEp = parseInt(epMatch[1]);
      if (foundEp === -1 || foundEp !== episode) continue;
    }
    links.push({ url: url, id: match[1] });
  }
  return log('hubcloud links: ' + links.length + (isTV ? ' (ep ' + episode + ')' : '')), links;
}

// --- Get current minutes for URL token ---
function minutes() { return String(new Date().getMinutes()); }

// --- Base64 decode ---
function decodeBase64(input) {
  if (typeof atob === 'function') return atob(input);
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var output = '';
  input = String(input).replace(/=+$/, '');
  for (var i = 0, a, b, c = 0; b = input.charAt(c++); ~b && (a = i % 4 ? a * 64 + b : b, i++ % 4) ? output += String.fromCharCode(255 & a >> (-2 * i & 6)) : 0) {
    b = chars.indexOf(b);
  }
  return output;
}

// --- Resolve HubCloud to actual video stream URLs ---
async function resolveHubcloud(hubUrl, quality, size) {
  // Step 1: Fetch hubcloud page
  var page1 = await fetchText(hubUrl, {
    headers: { 'Cookie': 'xla=s4t', 'Referer': ARCHIVE_DOMAIN + '/' }
  }, 12000);
  if (!page1) return [];

  // Step 2: Extract download URL
  var downloadUrl = null;
  var urlVar = page1.match(/var\s+url\s*=\s*'([^']+)'/);
  if (urlVar) downloadUrl = urlVar[1];
  if (!downloadUrl) {
    var downloadBtn = page1.match(/<a\s+id="download"\s+(?:x-href|href)="([^"]+)"/);
    if (downloadBtn) {
      downloadUrl = downloadBtn[1];
      if (!downloadUrl.startsWith('http')) try { downloadUrl = decodeBase64(downloadUrl); } catch {}
    }
  }
  if (!downloadUrl) return [];

  // Step 3: Follow to final page
  var page2 = await fetchText(downloadUrl, {
    headers: { 'Cookie': 'xla=s4t', 'Referer': hubUrl }
  }, 15000);
  if (!page2) return [];

  var streams = [];

  // Pattern 1: fsl.gigabytes.icu direct links
  var gigRegex = /href="(https?:\/\/fsl\.gigabytes\.icu[^"]+)"/gi;
  var match;
  while ((match = gigRegex.exec(page2)) !== null) {
    streams.push({ type: 'gig', url: match[1], quality: quality, size: size || '' });
  }

  // Pattern 2: R2 dev / buzz direct links (with timestamp)
  var r2Regex = /href="(https?:\/\/(?:pub-[a-z0-9]+\.r2\.dev|[a-z0-9.]+\.buzz)[^"]+)"/gi;
  while ((match = r2Regex.exec(page2)) !== null) {
    streams.push({ type: 'r2', url: match[1] + '1' + minutes(), quality: quality, size: size || '' });
  }

  // Pattern 3: Token-based URLs
  if (streams.length === 0) {
    var tokenMatch = page2.match(/https?:\/\/[^\s"'<>]+\?token=\d+/);
    if (tokenMatch) {
      var tokenUrl = tokenMatch[0].replace(/["'].*$/, '').replace(/[<>].*$/, '');
      streams.push({ type: 'token', url: tokenUrl + '1' + minutes(), quality: quality, size: size || '' });
    }
  }

  return streams;
}

// --- Deduplicate by URL ---
function dedupe(streams) {
  var seen = {};
  return (streams || []).filter(function(s) {
    if (!s || !s.url || seen[s.url]) return false;
    seen[s.url] = true;
    return true;
  });
}

function pad2(n) { return n != null && n < 10 ? '0' + n : String(n); }

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  try {
    log('request: id=' + tmdbId + ' type=' + type + ' s=' + season + ' e=' + episode);

    // Step 1: Get media metadata
    var media = await getMedia(tmdbId, type);
    if (!media || !media.title) return [];

    var isTV = type === 'tv' || type === 'series';
    var seasonNum = season != null ? Number(season) : null;
    var episodeNum = episode != null ? Number(episode) : null;
    log('resolved: "' + media.title + '" (' + (media.year || '?') + ')');

    // Step 2: Search for matching content
    var results, i, match = null, cachedHtml = null;

    // Try IMDB-based search first
    if (media.imdb && media.imdb.indexOf('tt') === 0) {
      results = await searchSite(media.imdb);
      if (isTV && seasonNum != null) {
        for (i = 0; i < results.length; i++) {
          if (results[i].imdb !== media.imdb) continue;
          var pageUrl = results[i].href.startsWith('http') ? results[i].href : MAIN_URL + results[i].href;
          var html = await fetchText(pageUrl, { headers: { 'Referer': MAIN_URL + '/' } }, 12000);
          if (html && extractSeasonHtml(html, seasonNum) !== null) {
            match = results[i]; cachedHtml = html;
            log('imdb season match: ' + match.title);
            break;
          }
        }
      } else {
        for (i = 0; i < results.length; i++) {
          if (results[i].imdb === media.imdb) {
            match = results[i];
            log('imdb exact match: ' + match.title);
            break;
          }
        }
      }
    }

    // Fallback: title-based search
    if (!match) {
      results = await searchSite(media.title);
      for (i = 0; i < results.length; i++) {
        if (isStrictMatch(media.title, media.year, results[i].title, results[i].year)) {
          var pageUrl = results[i].href.startsWith('http') ? results[i].href : MAIN_URL + results[i].href;
          var html = await fetchText(pageUrl, { headers: { 'Referer': MAIN_URL + '/' } }, 12000);
          if (!isTV || extractSeasonHtml(html, seasonNum) !== null) {
            match = results[i]; cachedHtml = html;
            log('title match: ' + match.title);
            break;
          }
        }
      }
    }

    if (!match) return log('no match'), [];

    // Step 3: Get page HTML
    if (!cachedHtml) {
      var pageUrl = match.href.startsWith('http') ? match.href : MAIN_URL + match.href;
      cachedHtml = await fetchText(pageUrl, { headers: { 'Referer': MAIN_URL + '/' } }, 12000);
      if (!cachedHtml) return [];
    }

    var siteTitle = extractSiteTitle(cachedHtml);
    var displayTitle = '';
    if (isTV) displayTitle = (siteTitle || media.title) + ' [S' + pad2(seasonNum) + 'E' + pad2(episodeNum) + ']';

    // Step 4: Parse archive links
    var archives = await parsePage(
      match.href.startsWith('http') ? match.href : MAIN_URL + match.href,
      seasonNum, cachedHtml
    );
    archives = archives.filter(function(a) { return a.q !== 'HD'; });
    if (archives.length === 0) return log('no archives'), [];

    log('found ' + archives.length + ' archive links');

    // Step 5: Extract HubCloud links from each archive
    var hubLinks = [];
    for (i = 0; i < archives.length; i++) {
      var archive = archives[i];
      try {
        var links = await parseArchive(archive.url, episodeNum);
        links.forEach(function(link) {
          hubLinks.push({ url: link.url, q: archive.q, size: archive.size });
        });
      } catch {}
    }

    if (hubLinks.length === 0) return log('no hubcloud hosts'), [];

    log('resolving ' + hubLinks.length + ' hubcloud links...');

    // Step 6: Resolve each HubCloud link to actual video URLs
    var resolved = [];
    for (i = 0; i < hubLinks.length; i++) {
      var hub = hubLinks[i];
      try {
        var streams = await resolveHubcloud(hub.url, hub.q, hub.size);
        resolved.push(streams);
      } catch {}
    }

    // Flatten
    var allStreams = [];
    resolved.forEach(function(group) {
      group.forEach(function(s) { allStreams.push(s); });
    });

    if (allStreams.length === 0) return log('no streams resolved'), [];

    // Step 7: Build Nuvio stream objects
    var title = isTV && displayTitle ? displayTitle : siteTitle;
    var streams = [];

    allStreams.forEach(function(s) {
      var sizeStr = s.size ? ' ' + s.size : '';
      var name = title + ' - ' + PROVIDER_NAME;
      streams.push({
        name: name,
        title: '🎬 ' + title + '\n' + s.quality + ' | 💾 ' + (s.size || 'N/A') + '\n📡 ' + s.type + ' | ⚡ H.264',
        url: s.url,
        quality: s.quality,
        size: '(' + s.type + ')' + sizeStr,
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: { request: { 'Referer': ARCHIVE_DOMAIN + '/' } }
        }
      });
    });

    streams = dedupe(streams);

    // Sort: non-gig first, then by quality
    var qualityRank = { '2160p': 4, '1080p': 3, '720p': 2, 'HD': 1 };
    streams.sort(function(a, b) {
      var isGig = function(name) { return name.indexOf('gig') !== -1 ? 1 : 0; };
      var gigA = isGig(a.name), gigB = isGig(b.name);
      if (gigA !== gigB) return gigB - gigA;
      return (qualityRank[b.quality] || 0) - (qualityRank[a.quality] || 0);
    });

    log('returning ' + streams.length + ' streams');
    return streams;
  } catch (e) {
    err('error: ' + e.message);
    return [];
  }
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
