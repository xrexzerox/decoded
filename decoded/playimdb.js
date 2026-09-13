// ============================================
// DECODED: providers/playimdb.js
// Provider: PlayIMDb
// Original: Stream data API with quality detection from filenames
// ============================================

const PROVIDER_NAME = 'PlayIMDb';
const BASE_API = 'https://streamdata.vaplayer.ru/api';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

const HEADERS = {
  'Origin': 'https://nextgencloudfabric.com',
  'Referer': 'https://nextgencloudfabric.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

// --- Fetch with timeout ---
async function fetchWithTimeout(url, options) {
  const timeout = 10000;
  const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(timeout) : null;
  const opts = { ...options, headers: { ...HEADERS, ...(options?.headers || {}) } };
  if (signal) opts.signal = signal;
  return await fetch(url, opts);
}

async function fetchJson(url, options) {
  try {
    const res = await fetchWithTimeout(url, options || {});
    if (res.ok) return await res.json();
    return null;
  } catch (e) {
    console.error('[' + PROVIDER_NAME + '] Error:', e);
    return null;
  }
}

// --- TMDB metadata ---
async function getTmdbMetadata(tmdbId, type, season, episode) {
  let fallbackTitle = 'Unknown Title';
  let fallbackDuration = type === 'tv' ? '45 min' : '90 min';

  try {
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url);
    if (!res.ok) return { name: fallbackTitle, year: 'N/A', duration: fallbackDuration };

    const data = await res.json();
    let duration = fallbackDuration;

    if (type === 'movie' && data.runtime) {
      duration = data.runtime + ' min';
    } else if (type === 'tv') {
      const epUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId + '/season/' + season + '/episode/' + episode + '?api_key=' + TMDB_API_KEY;
      const epRes = await fetch(epUrl);
      if (epRes.ok) {
        const epData = await epRes.json();
        if (epData.runtime) duration = epData.runtime + ' min';
        else if (data.episode_run_time && data.episode_run_time.length > 0)
          duration = data.episode_run_time[0] + ' min';
      }
    }

    return {
      name: data.title || data.name || fallbackTitle,
      year: (data.release_date || data.first_air_date || '').split('-')[0] || 'N/A',
      duration: duration
    };
  } catch {
    return { name: fallbackTitle, year: 'N/A', duration: fallbackDuration };
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  const streams = [];

  try {
    const isTV = type === 'tv' || type === 'series';
    const mediaType = isTV ? 'tv' : 'movie';

    if (!tmdbId) return console.log('[PlayIMDb] Missing TMDB ID'), streams;

    const metadata = await getTmdbMetadata(tmdbId, mediaType, season, episode);

    let apiUrl = BASE_API + '?tmdb=' + tmdbId + '&type=' + mediaType;
    if (isTV) {
      if (!season || !episode) return streams;
      apiUrl += '&season=' + season + '&episode=' + episode;
    }

    console.log('[PlayIMDb] API URL: ' + apiUrl);

    const data = await fetchJson(apiUrl, { headers: HEADERS });

    if (data && (data.status_code === 200 || data.status === 'success') && data.data && data.data.stream_urls) {
      // Detect quality from filename
      let qualityLabel = '1080p FHD';
      let quality = '1080P';
      const fileName = String(data.data.file_name || '').toLowerCase();

      if (fileName.includes('2160p') || fileName.includes('4k')) {
        qualityLabel = '4K UHD';
        quality = '2160P';
      } else if (fileName.includes('1080p')) {
        qualityLabel = '1080p FHD';
        quality = '1080P';
      } else if (fileName.includes('720p')) {
        qualityLabel = '720p HD';
        quality = '720P';
      }

      // Detect audio type
      let audioLabel = 'Original-Audio';
      let audioLang = 'Original-Audio';
      if (fileName.includes('dual') || (fileName.includes('multi') && fileName.includes('english'))) {
        audioLabel = 'Dual-Audio';
        audioLang = 'Dual';
      } else if (fileName.includes('multi')) {
        audioLabel = 'Multi-Audio';
        audioLang = 'Multilingual';
      } else if (fileName.includes('hindi')) {
        audioLabel = 'Hindi-Audio';
        audioLang = 'Hindi';
      } else if (fileName.includes('english')) {
        audioLabel = 'English-Audio';
        audioLang = 'English';
      }

      const title = metadata.name || 'Unknown';
      const year = metadata.year || 'N/A';

      data.data.stream_urls.forEach((url, index) => {
        const lower = url.toLowerCase();
        let serverName = 'Server ' + (index + 1);
        let format = 'MKV';
        if (lower.includes('.mp4')) format = 'MP4';
        if (lower.includes('.m3u8')) format = 'M3U8';

        const streamName = PROVIDER_NAME + ' | ' + qualityLabel + ' | ' + audioLabel;
        const titleLine = isTV
          ? '🎬 ' + title + ' | S' + season + 'E' + episode + ' (' + year + ')'
          : '🎬 ' + title + ' - ' + year;
        const line2 = '💎 ' + quality + ' | 🌍 ' + audioLang;
        const line3 = '🎞️ ' + format + ' | ⏱️ ' + metadata.duration + ' | 🖥️ ' + serverName;
        const fullTitle = titleLine + '\n' + line2 + '\n' + line3;

        const stream = {
          name: streamName,
          title: fullTitle,
          url: url,
          quality: quality.toLowerCase(),
          type: 'm3u8'
        };
        stream.headers = HEADERS;

        if (data.default_subs && Array.isArray(data.default_subs) && data.default_subs.length > 0) {
          stream.subtitles = data.default_subs.map(sub => ({
            id: sub.code || sub.id,
            url: sub.url,
            lang: sub.lang
          }));
        }

        streams.push(stream);
      });
    }
  } catch (e) {
    console.log('[PlayIMDb] Error: ' + e.message);
  }

  return streams;
}

typeof module !== 'undefined' && module.exports ? module.exports = { getStreams } : global.getStreams = getStreams;
