// ============================================
// DECODED: providers/vidlove.js
// Provider: VidLove (❤️ VidLove)
// Original: Multi-provider aggregator with 10 sources
// Sources: moviebox, ipcloud, tcloud, vidapi, embedsu, autoembed, xpass, vidrift, lookmovie, vidnest
// ============================================

const BASE_URL = 'https://ballerinacappuccinalovestungtungtungsahur.com';
const REFERER = 'https://player.vidlove.cc';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
const MIN_QUALITY = 1080;
const DEFAULT_QUALITY = '1080p';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';

const PROVIDERS = ['moviebox', 'ipcloud', 'tcloud', 'vidapi', 'embedsu', 'autoembed', 'xpass', 'vidrift', 'lookmovie', 'vidnest'];

const DEFAULT_HEADERS = {
  'accept': 'application/json',
  'accept-language': 'en-US,en;q=0.9',
  'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
  'Referer': REFERER,
  'User-Agent': USER_AGENT
};

// --- Sort tag using zero-width characters ---
function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  return inverted.toString(2).padStart(20, '0').split('').map(c => c === '1' ? '\ufeff' : '\u200b').join('');
}

function getResolutionEmoji(quality) {
  const lower = String(quality || '').toLowerCase();
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd')) return '🌟 4K';
  if (lower.includes('1080') || lower.includes('fhd')) return '🔥 1080p';
  if (lower.includes('720') || lower.includes('hd')) return '💎 720p';
  if (lower.includes('480') || lower.includes('sd')) return '📱 480p';
  return '📺 ' + (quality || '1080p');
}

function qualityRank(quality) {
  if (/2160p|4k/i.test(quality)) return 4;
  if (/1080p/i.test(quality)) return 3;
  if (/720p/i.test(quality)) return 2;
  if (/480p/i.test(quality)) return 1;
  return 0;
}

const parseQuality = quality => {
  const match = String(quality || '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const normalizeQuality = quality => {
  const trimmed = String(quality || '').trim();
  return trimmed ? trimmed : DEFAULT_QUALITY;
};

const isQualityAcceptable = quality => {
  return parseQuality(normalizeQuality(quality)) >= MIN_QUALITY;
};

// --- TMDB metadata fetcher ---
async function fetchTmdbMeta(tmdbId, type, season = null, episode = null) {
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const res = await fetch(TMDB_BASE + '/' + mediaType + '/' + encodeURIComponent(tmdbId) + '?api_key=' + TMDB_KEY, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT }
    });
    if (!res.ok) return { title: 'Unknown', year: null, episodeTitle: '' };

    const data = await res.json();
    const title = data.title || data.name || data.original_title || data.original_name || 'Unknown';
    const date = data.release_date || data.first_air_date || '';
    const year = date ? parseInt(date.substring(0, 4)) : null;

    let episodeTitle = '';
    if (type === 'tv' && season && episode) {
      try {
        const seasonRes = await fetch(TMDB_BASE + '/tv/' + encodeURIComponent(tmdbId) + '/season/' + season + '?api_key=' + TMDB_KEY, {
          headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT }
        });
        if (seasonRes.ok) {
          const seasonData = await seasonRes.json();
          if (seasonData && Array.isArray(seasonData.episodes)) {
            const epNum = parseInt(episode);
            const ep = seasonData.episodes.find(e => e.episode_number === epNum);
            if (ep && ep.name) episodeTitle = ep.name;
          }
        }
      } catch {}
    }
    return { title, year, episodeTitle };
  } catch {
    return { title: 'Unknown', year: null, episodeTitle: '' };
  }
}

// --- Build API endpoint URL ---
const buildEndpointUrl = (provider, tmdbId, type, season, episode) => {
  const params = new URLSearchParams({
    'id': tmdbId,
    'mode': type,
    'sources': provider,
    'hevc': '1'
  });
  if (season != null) params.set('season', season);
  if (episode != null) params.set('episode', episode);
  return BASE_URL + '/' + provider + '?' + params;
};

// --- Map quality to stream object ---
const mapQualityToStream = (source, providerName, index, metadata) => {
  const quality = normalizeQuality(source.quality);
  const emoji = getResolutionEmoji(quality);
  const rank = qualityRank(quality);
  const sortTag = getInvertedSortTag(rank * 100000 + (100 - index), 999999);
  const name = sortTag + '❤️ VidLove | ' + quality + ' • ' + providerName;

  const titleLine = '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '');
  let epLine = null;
  if (metadata.mediaType === 'tv' && metadata.season && metadata.episode) {
    epLine = '📋 S' + metadata.season + ' E' + metadata.episode + (metadata.episodeTitle ? ' - ' + metadata.episodeTitle : '');
  }
  const audioLine = emoji + ' | 🗣️ Multi-Audio';
  const formatLine = '🎞️ M3U8 | ⚡ H.264';
  const sourceLine = '🔗 Vidlove | 🌐 ' + providerName;
  const fullTitle = [titleLine, epLine, audioLine, formatLine, sourceLine].filter(Boolean).join('\n');

  const headers = {
    'Referer': REFERER,
    'Origin': 'https://player.vidlove.cc',
    'User-Agent': USER_AGENT
  };

  return {
    name, title: fullTitle, size: fullTitle, description: fullTitle,
    url: source.url, quality, headers,
    behaviorHints: { notWebReady: true, proxyHeaders: { request: headers } }
  };
};

// --- Fetch streams from a single provider ---
async function fetchProviderStreams(providerName, tmdbId, type, season, episode, metadata) {
  try {
    const res = await fetch(buildEndpointUrl(providerName, tmdbId, type, season, episode), {
      method: 'GET',
      headers: DEFAULT_HEADERS
    });
    if (!res.ok) return [];

    const { source } = await res.json();
    if (!source) return [];

    const sources = Array.isArray(source.files) ? source.files : [];
    const providerLabel = source.provider || providerName;

    // Multiple quality variants
    if (sources.length > 0) {
      return sources
        .filter(s => s?.url && isQualityAcceptable(s.quality))
        .map((s, i) => mapQualityToStream(s, providerLabel, i, metadata));
    }

    // Single source
    if (source.url && isQualityAcceptable(source.quality)) {
      return [mapQualityToStream({ url: source.url, quality: source.quality }, providerLabel, 0, metadata)];
    }

    return [];
  } catch {
    return [];
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  try {
    const normalizedType = String(type || '').toLowerCase().trim();
    const mediaType = normalizedType === 'series' || normalizedType === 'show' || normalizedType === 'tvshow' || normalizedType === 'tv' ? 'tv' : 'movie';

    if (mediaType === 'tv' && (season == null || episode == null)) return [];

    const metadata = await fetchTmdbMeta(tmdbId, mediaType, season, episode);
    metadata.mediaType = mediaType;
    metadata.season = season;
    metadata.episode = episode;

    // Fetch from all providers in parallel
    const results = await Promise.all(
      PROVIDERS.map(provider => fetchProviderStreams(provider, tmdbId, mediaType, season, episode, metadata))
    );

    // Deduplicate by URL
    const seen = new Set();
    return results.flat().filter(s => s.url && !seen.has(s.url) && seen.add(s.url));
  } catch {
    return [];
  }
}

module.exports = { getStreams };
