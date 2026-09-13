// ============================================
// DECODED: providers/desiflix.js
// Provider: DesiFlix
// Original: Stremio-style manifest API with detailed metadata
// Features: Multi-language detection, codec detection, HDR detection
// ============================================

const PROVIDER_NAME = 'DesiFlix';
const DESIFLIX_BASE = 'https://manifest.desitvhub.eu.org';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const FETCH_TIMEOUT = 12000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function log(msg) { console.log('[' + PROVIDER_NAME + '] ' + msg); }
function err(msg) { console.error('[' + PROVIDER_NAME + '] ' + msg); }

function raceTimeout(ms) {
  return new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('Timeout: ' + ms + 'ms')); }, ms);
  });
}

async function fetchJson(url) {
  try {
    const fetchPromise = fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } });
    const res = await Promise.race([fetchPromise, raceTimeout(FETCH_TIMEOUT)]);
    if (res && res.ok) return await res.json();
  } catch (e) {
    err('fetch failed: ' + url + ' -> ' + (e.message || ''));
  }
  return null;
}

// --- TMDB metadata ---
async function getTMDBDetails(tmdbId, type) {
  const isTV = type === 'tv' || type === 'series';
  const mediaType = isTV ? 'tv' : 'movie';
  const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';
  const data = await fetchJson(url);
  if (!data) return { title: 'DesiFlix Title', year: '', imdbId: null };

  return {
    title: (isTV ? data.name : data.title) || 'DesiFlix Title',
    year: (isTV ? data.first_air_date || '' : data.release_date || '').split('-')[0],
    imdbId: data.imdb_id || data.external_ids && data.external_ids.imdb_id || null
  };
}

// --- Language detection ---
function parseLanguage(text) {
  if (text.indexOf('multi') !== -1) return 'Multi-Audio';
  const hasEnglish = text.indexOf('english') !== -1 || text.indexOf('eng') !== -1;
  const hasHindi = text.indexOf('hindi') !== -1 || text.indexOf('hin') !== -1;
  if (hasEnglish && hasHindi || text.indexOf('dual') !== -1) return 'Dual-Audio';
  if (hasHindi) return 'Hindi';
  if (hasEnglish) return 'English';
  if (text.indexOf('tamil') !== -1) return 'Tamil';
  if (text.indexOf('telugu') !== -1) return 'Telugu';
  if (text.indexOf('malayalam') !== -1) return 'Malayalam';
  if (text.indexOf('kannada') !== -1) return 'Kannada';
  return 'Unknown';
}

// --- Build detailed metadata for display ---
function buildDropdownMetadata(media, quality, isTV, season, episode, stream) {
  const title = media.title || 'Unknown Title';
  const year = media.year ? ' (' + media.year + ')' : '';
  const combined = ((stream.title || '') + ' ' + (stream.name || '') + ' ' + (stream.url || '')).toLowerCase();

  let titleLine = '🎬 ' + title + year;
  if (isTV && season != null && episode != null) {
    titleLine += ' | S' + String(season).padStart(2, '0') + 'E' + String(episode).padStart(2, '0');
  }

  let emoji = '💎';
  if (combined.indexOf('2160') !== -1 || combined.indexOf('4k') !== -1) emoji = '🌟';
  else if (combined.indexOf('1080') !== -1) emoji = '🔥';

  const language = parseLanguage(combined);
  const sizeMatch = combined.match(/(\d+(?:\.\d+)?\s*(?:gb|mb))/i);
  const size = sizeMatch ? sizeMatch[1].toUpperCase() : 'Variable Size';
  const line2 = emoji + ' ' + quality + ' | 💾 ' + size + ' | 🗣️ ' + language;

  // Codec detection
  let codec = 'x264';
  if (combined.indexOf('hevc') !== -1 && (combined.indexOf('10bit') !== -1 || combined.indexOf('10-bit') !== -1)) codec = 'x265 10bit';
  else if (combined.indexOf('hevc') !== -1) codec = 'x265';
  else (combined.indexOf('av1') !== -1 || combined.indexOf('av-1') !== -1) && (codec = 'AV1');

  // Audio detection
  let audio = 'AAC';
  if (combined.indexOf('ddp5.1') !== -1 || combined.indexOf('eac3') !== -1) audio = 'DDP5.1';
  else if (combined.indexOf('dd5.1') !== -1 || combined.indexOf('5.1') !== -1) audio = 'DD5.1';
  else if (combined.indexOf('7.1') !== -1) audio = '7.1';
  else if (combined.indexOf('atmos') !== -1) audio = 'Atmos';

  const atmosTag = combined.indexOf('atmos') !== -1 ? ' | 🔊 Atmos' : '';
  const line3 = '🎞️ ' + codec + ' | 🎧 ' + audio + atmosTag;

  // Source detection
  let source = '📥 WEB-DL';
  if (combined.indexOf('web-rip') !== -1 || combined.indexOf('webrip') !== -1) source = '🌐 WEB-RIP';
  else if (combined.indexOf('bluray') !== -1) source = '💿 BluRay';
  else if (combined.indexOf('hdrip') !== -1) source = '📺 HD-RIP';

  // Format detection
  const format = stream.url && stream.url.indexOf('.mp4') !== -1 ? 'MP4' : 'MKV';

  // HDR detection
  let hdr = 'SDR';
  if (combined.indexOf('10bit') !== -1 || combined.indexOf('10-bit') !== -1) hdr = combined.indexOf('hdr') !== -1 ? '10bit HDR' : '10bit';
  else if (combined.indexOf('hdr10+') !== -1) hdr = 'HDR10+';
  else if (combined.indexOf('hdr') !== -1) hdr = 'HDR';
  else (combined.indexOf('dv') !== -1 || combined.indexOf('dolby') !== -1) && (hdr = 'DV');

  const line4 = source + ' | 📼 ' + format + ' | 🎨 ' + hdr;
  const line5 = '📎 ' + PROVIDER_NAME;

  return titleLine + '\n' + line2 + '\n' + line3 + '\n' + line4 + '\n' + line5;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  const isTV = type === 'tv' || type === 'series';
  log('Request: ' + tmdbId + ' type=' + type + ' s=' + season + ' e=' + episode);

  const media = await getTMDBDetails(tmdbId, type);
  const contentId = media.imdbId || tmdbId;

  let url = '';
  if (isTV) {
    const s = season != null ? season : 1;
    const ep = episode != null ? episode : 1;
    url = DESIFLIX_BASE + '/stream/series/' + contentId + ':' + s + ':' + ep + '.json';
  } else {
    url = DESIFLIX_BASE + '/stream/movie/' + contentId + '.json';
  }

  log('Fetching streams from: ' + url);
  let data = await fetchJson(url);

  // Fallback to TMDB ID if IMDB ID fails
  if ((!data || !data.streams || !data.streams.length) && media.imdbId) {
    const fallbackUrl = isTV
      ? DESIFLIX_BASE + '/stream/series/' + tmdbId + ':' + (season || 1) + ':' + (episode || 1) + '.json'
      : DESIFLIX_BASE + '/stream/movie/' + tmdbId + '.json';
    log('Retrying with fallback endpoint: ' + fallbackUrl);
    data = await fetchJson(fallbackUrl);
  }

  if (!data || !data.streams || !data.streams.length) return log('No streams found'), [];

  const streams = [];
  const seen = {};

  for (let i = 0; i < data.streams.length; i++) {
    const stream = data.streams[i];
    const streamUrl = stream.url || stream.externalUrl;
    if (!streamUrl || seen[streamUrl]) continue;
    seen[streamUrl] = true;

    const combined = ((stream.title || '') + ' ' + (stream.name || '') + ' ' + streamUrl).toLowerCase();

    let quality = '1080p';
    if (combined.indexOf('2160') !== -1 || combined.indexOf('4k') !== -1) quality = '2160p';
    else if (combined.indexOf('720') !== -1) quality = '720p';
    else if (combined.indexOf('480') !== -1) quality = '480p';

    const language = parseLanguage(combined);
    const fullTitle = buildDropdownMetadata(media, quality, isTV, season, episode, stream);

    streams.push({
      name: PROVIDER_NAME + ' | ' + quality + ' | ' + language,
      title: fullTitle,
      size: fullTitle,
      description: fullTitle,
      url: streamUrl,
      quality: '',
      language: '',
      headers: { 'User-Agent': USER_AGENT, 'Referer': DESIFLIX_BASE + '/' }
    });
  }

  // Sort by quality
  function qualityScore(name) {
    const lower = name.toLowerCase();
    if (lower.indexOf('2160p') !== -1 || lower.indexOf('4k') !== -1) return 2160;
    if (lower.indexOf('1080p') !== -1) return 1080;
    if (lower.indexOf('720p') !== -1) return 720;
    if (lower.indexOf('480p') !== -1) return 480;
    return 0;
  }

  streams.sort(function(a, b) {
    return qualityScore(b.name) - qualityScore(a.name);
  });

  log('Returning ' + streams.length + ' streams');
  return streams;
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
