// ============================================
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

function extractDataBlock(response) {
  if (response && response.data && typeof response.data === 'object')
    return response.data;
  return response || {};
}

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

async function decryptCastle(cipherText, securityKey) {
  console.log('[Castle] Decrypting response...');
  try {
    const CryptoJS = require('crypto-js');

    const IV_SALT = 'T!BgJB';
    const keyBytes = CryptoJS.enc.Utf8.parse(securityKey);
    const saltBytes = CryptoJS.enc.Utf8.parse(IV_SALT);
    let combined = keyBytes.concat(saltBytes);

    if (combined.sigBytes < 16) {
      const padding = CryptoJS.lib.WordArray.create(new Array(16 - combined.sigBytes).fill(0));
      combined = combined.concat(padding);
    } else if (combined.sigBytes > 16) {
      combined = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    }

    const aesKey = combined;
    const iv = combined;

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

async function getSecurityKey() {
  console.log('[Castle] Fetching security key...');
  const url = CASTLE_BASE + '/api/v1/security?key=' + CHANNEL + '&clientType=' + CLIENT + '&packageName=' + PKG + '&lang=' + LANG;
  const res = await makeRequest(url);
  const data = await res.json();
  if (data.code !== 200 || !data.data) throw new Error('Security key error: ' + JSON.stringify(data));
  console.log('[Castle] Got security key');
  return data.data;
}

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

async function getDetails(securityKey, movieId) {
  console.log('[Castle] Getting details for ID: ' + movieId);
  const url = CASTLE_BASE + '/api/v1/detail?channel=' + CHANNEL + '&clientType=' + CLIENT +
    '&lang=' + LANG + '&movieId=' + movieId + '&packageName=' + PKG;
  const res = await makeRequest(url);
  const cipher = await extractCipherFromResponse(res);
  const decrypted = await decryptCastle(cipher, securityKey);
  return JSON.parse(decrypted);
}

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

async function findCastleMovieId(securityKey, metadata) {
  const query = metadata.year ? metadata.year + ' ' + metadata.title : metadata.title;
  const searchResult = await searchCastle(securityKey, query);
  const data = extractDataBlock(searchResult);
  const results = data.list || [];
  if (results.length === 0) throw new Error('No search results found');

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

  const first = results[0];
  const id = first.id || first.redirectId || first.redirectIdStr;
  if (id) {
    console.log('[Castle] Using first result: ' + (first.title || first.name) + ' (ID: ' + id + ')');
    return id.toString();
  }
  throw new Error('No matching content found');
}

function getQualityValue(resolution) {
  if (!resolution) return 0;
  const cleaned = resolution.toString().toLowerCase()
    .replace(/^(sd|hd|fhd|uhd|4k)\s*/i, '').replace(/p$/, '').trim();
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

function processVideoResponse(videoData, metadata, season, episode, resolution, langLabel) {
  const streams = [];
  const data = extractDataBlock(videoData);
  const videoUrl = data.videoUrl;
  if (!videoUrl) { console.log('[Castle] No video URL'); return streams; }

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
      q = q.replace(/^(SD|HD|FHD)\s+/i, '');
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

async function getStreams(tmdbId, type, season, episode) {
  console.log('[Castle] Starting extraction for TMDB ID: ' + tmdbId + ', Type: ' + type +
    (type === 'tv' ? ', S:' + season + 'E:' + episode : ''));

  try {
    const metadata = await getTMDBDetails(tmdbId, type);
    console.log('[Castle] Found: "' + metadata.title + '" (' + (metadata.year || 'N/A') + ')');

    const securityKey = await getSecurityKey();
    const castleId = await findCastleMovieId(securityKey, metadata);

    let details = await getDetails(securityKey, castleId);
    let activeMovieId = castleId;

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

    const episodeData = episodes.find(e => e.id.toString() === episodeId);
    const languages = episodeData?.languages || [];
    const resolution = 2;
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

    if (allStreams.length === 0) {
      console.log('[Castle] Trying shared video endpoint...');
      const videoData = await getVideo2(securityKey, activeMovieId, episodeId, resolution);
      const streams = processVideoResponse(videoData, metadata, season, episode, resolution, '[Shared]');
      allStreams.push(...streams);
    }

    allStreams.sort((a, b) => getQualityValue(b.quality) - getQualityValue(a.quality));
    console.log('[Castle] Total streams: ' + allStreams.length);
    return allStreams;
  } catch (e) {
    console.error('[Castle] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
