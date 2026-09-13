// ============================================
// DECODED: providers/netmirror.js
// Provider: NetMirror
// Original: Multi-platform (Netflix/Prime/Hotstar/Disney) with NewTV API
// Features: Domain rotation, platform fallback, episode pagination
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

const PLATFORM_MAP = {
  'netflix': {
    ott: 'nf',
    search: '/mobile/search.php',
    post: '/mobile/post.php',
    episodes: '/mobile/episodes.php',
    playlist: '/mobile/playlist.php',
    img: 'nf/v',
    epImg: 'nfepimg'
  },
  'primevideo': {
    ott: 'pv',
    search: '/mobile/pv/search.php',
    post: '/mobile/pv/post.php',
    episodes: '/mobile/pv/episodes.php',
    playlist: '/mobile/pv/playlist.php',
    img: 'pvepimg',
    epImg: 'pvepimg'
  },
  'hotstar': {
    ott: 'hs',
    search: '/mobile/hs/search.php',
    post: '/mobile/hs/post.php',
    episodes: '/mobile/hs/episodes.php',
    playlist: '/mobile/hs/playlist.php',
    img: 'hs/v',
    epImg: 'hsepimg'
  },
  'disney': {
    ott: 'hs',
    search: '/mobile/hs/search.php',
    post: '/mobile/hs/post.php',
    episodes: '/mobile/hs/episodes.php',
    playlist: '/mobile/hs/playlist.php',
    img: 'hs/v',
    epImg: 'hsepimg'
  }
};

const NEW_TV_BASE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0',
  'Accept': 'application/json, text/plain, */*'
};

// Base64-encoded domain list for NewTV API
const NEW_TV_DOMAINS = [
  'aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LmNvbQ==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LmNvbQ==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0Lm5ldA==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0Lm9yZw==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0LnRvcA==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcHA=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jb20=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saW5r',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5uZXQ=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zaXRl',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==',
  'aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo='
];

let resolvedApiUrl = '';

function safeAtob(input) {
  if (typeof atob === 'function') return atob(input);
  return Buffer.from(input, 'base64').toString('binary');
}

// --- Resolve NewTV API URL by trying all domains ---
async function resolveApiUrl() {
  if (resolvedApiUrl) return resolvedApiUrl;

  for (const encoded of NEW_TV_DOMAINS) {
    const domain = safeAtob(encoded).replace(/\/$/, '');
    try {
      const res = await fetch(domain + '/checknewtv.php', {
        headers: { ...NEW_TV_BASE_HEADERS, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const data = await res.json();
      const tokenHash = data.token_hash;
      if (tokenHash) {
        resolvedApiUrl = safeAtob(tokenHash).replace(/\/$/, '');
        return resolvedApiUrl;
      }
    } catch {}
  }
  throw new Error('Failed to resolve NewTV API base URL');
}

function buildNewTvHeaders(ott, extra = {}) {
  return { ...NEW_TV_BASE_HEADERS, Ott: ott, ...extra };
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  try {
    const settings = globalThis.SCRAPER_SETTINGS || {};
    const preferredPlatform = settings.preferredPlatform || 'all';
    const mediaType = type === 'tv' ? 'tv' : 'movie';

    // Fetch TMDB metadata
    const tmdbRes = await fetch('https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const tmdbData = await tmdbRes.json();
    const title = type === 'tv' ? tmdbData.name : tmdbData.title;
    if (!title) throw new Error('Could not fetch title from TMDB');

    // Try platforms in order of preference
    let platforms = ['netflix', 'primevideo', 'hotstar', 'disney'];
    if (preferredPlatform !== 'all') {
      platforms = [preferredPlatform, ...platforms.filter(p => p !== preferredPlatform)];
    }

    for (const platform of platforms) {
      try {
        let streams = [];
        if (platform === 'netflix') {
          streams = await fetchFromNetflixDirect(tmdbId, type, season, episode, title);
        }
        if (!streams || streams.length === 0) {
          streams = await fetchFromPlatform(platform, title, type, season, episode);
        }
        if (streams && streams.length > 0) return streams;
      } catch {}
    }
    return [];
  } catch {
    return [];
  }
}

// --- Netflix direct fetch (net27.cc) ---
async function fetchFromNetflixDirect(tmdbId, type, season, episode, title) {
  try {
    const url = type === 'tv'
      ? 'https://net27.cc/api/embed-tmdb/' + tmdbId + '?type=tv&s=' + season + '&e=' + episode
      : 'https://net27.cc/api/embed-tmdb/' + tmdbId;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://net27.cc/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.ok !== true) return null;

    const headers = {
      'Referer': 'https://net27.cc/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    const subtitles = (data.subtitles || []).map(sub => {
      let subUrl = sub.url;
      if (subUrl.startsWith('/')) subUrl = 'https://net27.cc' + subUrl;
      return {
        url: subUrl,
        language: sub.lang || 'en',
        name: sub.label || 'English',
        headers: headers
      };
    });

    const streams = [];

    if (data.streams && data.streams.length > 0) {
      data.streams.forEach(stream => {
        streams.push({
          name: 'NetMirror | ' + stream.resolution + 'p',
          title: '' + title,
          url: stream.url,
          quality: stream.resolution + 'p',
          headers: headers,
          subtitles: subtitles,
          provider: 'netmirror'
        });
      });
    } else if (data.mp4) {
      streams.push({
        name: 'NetMirror | Auto',
        title: '' + title,
        url: data.mp4,
        quality: 'Auto',
        headers: headers,
        subtitles: subtitles,
        provider: 'netmirror'
      });
    }

    return streams;
  } catch (e) {
    console.error('[NetMirror] Netflix direct error:', e.message);
    return null;
  }
}

// --- Fetch from platform (NewTV API) ---
async function fetchFromPlatform(platform, title, type, season, episode) {
  try {
    const config = PLATFORM_MAP[platform];
    const apiUrl = await resolveApiUrl();

    // Search for content
    const searchUrl = apiUrl + '/newtv/search.php?s=' + encodeURIComponent(title);
    const searchRes = await fetch(searchUrl, { headers: buildNewTvHeaders(config.ott) });
    const searchData = await searchRes.json();

    if (!searchData.status || searchData.status.length === 0) return null;

    const firstResult = searchData.status[0];
    const contentId = firstResult.id;

    // Get content details
    const postUrl = apiUrl + config.post + contentId;
    const postRes = await fetch(postUrl, { headers: buildNewTvHeaders(config.ott, { Lastep: '', Usertoken: '' }) });
    const postData = await postRes.json();

    let targetId = contentId;

    if (type === 'tv') {
      // Find specific episode
      const allEpisodes = await getAllEpisodes(contentId, postData, config, apiUrl);
      const target = allEpisodes.find(ep => ep && ep.s === season && ep.ep === episode);
      if (target) targetId = target.id;
      else return null;
    } else {
      // Movie - check if it's actually a TV show
      const isTV = postData.type === 't' || (postData.episodes && postData.episodes.filter(ep => ep !== null).length > 0);
      if (isTV) return null;
      targetId = postData.main_id || contentId;
    }

    // Get player URL
    const playerUrl = apiUrl + '/newtv/player.php?id=' + targetId;
    const playerRes = await fetch(playerUrl, { headers: buildNewTvHeaders(config.ott, { Usertoken: '' }) });
    const playerData = await playerRes.json();

    if (playerData.status === 'ok' && playerData.video_link) {
      return [{
        name: 'NetMirror (' + (platform.charAt(0).toUpperCase() + platform.slice(1)) + ')',
        title: '' + title,
        url: playerData.video_link,
        quality: '1080p',
        headers: { 'Referer': playerData.referer || apiUrl }
      }];
    }

    return null;
  } catch {
    return null;
  }
}

// --- Get all episodes with pagination ---
async function getAllEpisodes(contentId, postData, config, apiUrl) {
  const episodes = [];
  const seasonIndex = postData.season ? postData.season.findIndex(s => s.active === true) : -1;
  const seasonId = seasonIndex >= 0 ? postData.season[seasonIndex].id : postData.nextPageSeason;
  const seasonNum = seasonIndex >= 0 ? seasonIndex + 1 : null;

  // Add episodes from current page
  if (postData.episodes && postData.episodes.filter(ep => ep !== null).length > 0) {
    postData.episodes.filter(ep => ep !== null).forEach(ep => {
      const epNum = ep.ep ? parseInt(ep.ep) : ep.epNum ? parseInt(ep.epNum.replace('E', '')) : null;
      const sNum = seasonNum || (ep.sNum ? parseInt(ep.sNum.replace('S', '')) : null);
      episodes.push({ id: ep.id, s: sNum, ep: epNum });
    });
  }

  // Fetch additional pages if needed
  if (postData.nextPageShow === 1 && seasonId) {
    const moreEpisodes = await fetchEpisodesPage(contentId, seasonId, 2, seasonNum, config, apiUrl);
    episodes.push(...moreEpisodes);
  }

  // Fetch episodes from other seasons
  if (postData.season) {
    for (let i = 0; i < postData.season.length; i++) {
      const s = postData.season[i];
      if (s.id !== seasonId && s.id) {
        const seasonEpisodes = await fetchEpisodesPage(contentId, s.id, 1, i + 1, config, apiUrl);
        episodes.push(...seasonEpisodes);
      }
    }
  }

  return episodes;
}

// --- Fetch episodes page with pagination ---
async function fetchEpisodesPage(contentId, seasonId, page, seasonNum, config, apiUrl) {
  const episodes = [];
  let currentPage = page;

  while (true) {
    const url = apiUrl + '/newtv/episodes.php?id=' + seasonId + '&page=' + currentPage;
    const res = await fetch(url, { headers: buildNewTvHeaders(config.ott) });
    const data = await res.json();

    data.episodes && data.episodes.filter(ep => ep !== null).forEach(ep => {
      const epNum = ep.ep ? parseInt(ep.ep) : ep.epNum ? parseInt(ep.epNum.replace('E', '')) : null;
      const sNum = seasonNum || (ep.sNum ? parseInt(ep.sNum.replace('S', '')) : null);
      episodes.push({ id: ep.id, s: sNum, ep: epNum });
    });

    if (data.nextPageShow !== 1) break;
    currentPage++;
  }

  return episodes;
}

// --- Settings UI ---
async function onSettings() {
  return [
    { type: 'header', label: 'NetMirror Settings' },
    {
      type: 'select',
      key: 'preferredPlatform',
      label: 'Preferred Streaming Source',
      description: 'Select which platform to try first. If content isn\'t found, others will be searched as fallback.',
      options: [
        { label: 'All (Auto)', value: 'all' },
        { label: 'Netflix', value: 'netflix' },
        { label: 'Prime Video', value: 'primevideo' },
        { label: 'Hotstar / Disney+', value: 'hotstar' }
      ],
      defaultValue: 'all'
    },
    { type: 'divider', label: 'Advanced' },
    {
      type: 'toggle',
      key: 'forceHd',
      label: 'Force HD Quality',
      description: 'Always try to get HD quality streams when available.',
      defaultValue: true
    }
  ];
}

module.exports = { getStreams, onSettings };
