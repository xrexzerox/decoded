// ============================================
// DECODED: providers/showbox.js
// Provider: ShowBox (via FebBox file sharing)
// Original: AES-CBC JWT decryption + string array obfuscation
// ============================================

const cheerio = require('cheerio-without-node-native');
const CryptoJS = require('crypto-js');

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_API_BASE = 'https://api.showboxapi.com';

const WORKING_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/json'
};

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
    const match = filename.match(/(\d{3,4})[pP]/);
    if (match) return '✨ ' + match[0] + 'p';
    return '✨ Original';
  }
  return getQualityEmoji(quality) + ' ' + quality;
}

function getFileContainerFormat(url) {
  if (!url) return '📦 Unknown';
  const upper = url.toUpperCase();
  if (upper.includes('.MKV') || upper.includes('MATROSKA')) return '📦 MKV';
  if (upper.includes('.AVI') || upper.includes('XVID')) return '📦 AVI';
  if (upper.includes('.MP4') || upper.includes('MPEG4')) return '📦 MP4';
  return '📦 Unknown';
}

function parseFilenameMetadata(filename) {
  if (!filename) return { line3: '🎞️ H.264 | 📺 SDR | 🎧 Stereo', source: '📥 WEB-DL' };
  const upper = filename.toUpperCase();

  let codec = '';
  if (upper.includes('HEVC') || upper.includes('X265') || upper.includes('H265') || upper.includes('H.265'))
    codec = '🎞️ H.265';
  else if (upper.includes('AVC') || upper.includes('H264') || upper.includes('H.264') || upper.includes('X264'))
    codec = '🎞️ H.264';
  else if (upper.includes('AV1'))
    codec = '🎞️ AV1';

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

function parseSingleToken(token) {
  if (!token) return '';

  if (token.startsWith('eyJ')) {
    console.log('[ShowBox] Parsing JWT token...');
    try {
      const payload = CryptoJS.enc.Base64.parse(token);
      const jsonStr = payload.toString(CryptoJS.enc.Utf8);
      const parsed = JSON.parse(jsonStr);

      if (parsed && parsed.data) {
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

function getOssGroup() {
  try {
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.ossGroup)
      return String(global.SCRAPER_SETTINGS.ossGroup);
    if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.ossGroup)
      return String(window.SCRAPER_SETTINGS.ossGroup);
  } catch {}
  return null;
}

function getApiBase() {
  try {
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.apiBase)
      return String(global.SCRAPER_SETTINGS.apiBase);
    if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.apiBase)
      return String(window.SCRAPER_SETTINGS.apiBase);
  } catch {}
  return DEFAULT_API_BASE;
}

function getQualityFromName(name) {
  if (!name) return 'Unknown';
  const upper = name.toUpperCase();
  if (upper === 'ORIGINAL') return 'ORIGINAL';
  if (upper === '4K' || upper === '2160P') return '4K';
  if (upper === '1440P' || upper === '2K') return '1440p';
  if (upper === '1080P' || upper === 'FHD') return '1080p';
  if (upper === '720P' || upper === 'HD') return '720p';
  if (upper === '480P' || upper === 'SD') return '480p';
  if (upper === '360P') return '360p';
  if (upper === '240P') return '240p';

  const match = name.match(/(\d{3,4})[pP]?/);
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
          const fullTitle = seLabel + '\n' + line2 + '\n' + line3 + '\n' + line4;

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
          const fullTitle = titleText + '\n' + line2 + '\n' + line3 + '\n' + line4;

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

      if (type === 'tv' && season && episode) {
        if (ossGroup) {
          contentId = apiBase + '/tv/' + tmdbId + '/group/' + ossGroup + '/' + season + '/' + episode + '?cookie=' + encodeURIComponent(cookie);
        } else {
          contentId = apiBase + '/tv/' + tmdbId + '/' + season + '/' + episode + '?cookie=' + encodeURIComponent(cookie);
        }
      } else {
        contentId = apiBase + '/movie/' + tmdbId + '?cookie=' + encodeURIComponent(cookie);
      }

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

module.exports = { getStreams, onSettings };
