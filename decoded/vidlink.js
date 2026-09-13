// ============================================
// DECODED: providers/vidlink.js
// Provider: VidLink
// Original: String array + base64 obfuscation
// ============================================

const VIDLINK_API = 'https://vidlink.pro';
const DECRYPT_API = 'https://api.vidlink.pro';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Connection': 'keep-alive',
  'Referer': 'https://vidlink.pro/',
  'Origin': 'https://vidlink.pro'
};

// --- Format bytes to human-readable ---
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
  return bytes.toFixed(2) + ' ' + units[i];
}

// --- Calculate estimated file size ---
function calculateCalculatedFallbackSize(quality, duration) {
  const dur = parseInt(duration) || 90;
  const q = String(quality || '').toLowerCase();
  let bitrate = 5200; // kbps default

  if (q.includes('4k') || q.includes('2160')) bitrate = 16000;
  else if (q.includes('1080') || q.includes('fhd')) bitrate = 5200;
  else if (q.includes('720') || q.includes('hd')) bitrate = 2500;
  else if (q.includes('480') || q.includes('sd')) bitrate = 1200;

  const factor = 0.94 + (dur % 9) / 100;
  const sizeBytes = bitrate * factor * 1000 / 8 * (dur * 60);
  return formatBytes(sizeBytes);
}

// --- TMDB metadata fetcher ---
async function getTmdbMetadata(tmdbId, type, season, episode) {
  let fallbackDuration = type === 'tv' ? '45 min' : '90 min';
  try {
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    const url = 'https://api.themoviedb.org/3/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url);
    if (!res.ok) return { name: 'Unknown Title', year: 'N/A', duration: fallbackDuration };

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
      name: data.title || data.name || 'Unknown Title',
      year: (data.release_date || data.first_air_date || '').split('-')[0] || 'N/A',
      duration: duration
    };
  } catch {
    return { name: 'Unknown Title', year: 'N/A', duration: fallbackDuration };
  }
}

// --- M3U8 playlist parser ---
async function generateM3u8(playlistUrl, headers = {}) {
  try {
    console.log('[VidLink] Parsing M3U8: ' + playlistUrl);
    const res = await fetch(playlistUrl, { headers });
    const content = await res.text();
    const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/')) + '/';
    const streams = [];
    const regex = /#EXT-X-STREAM-INF:.*?RESOLUTION=(\d+x\d+).*?\n([^\n]+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const height = parseInt(match[1].split('x')[1]);
      if (height < 720) continue;
      const quality = height + 'p';
      let streamUrl = match[2].trim();

      if (!streamUrl.startsWith('http')) {
        if (streamUrl.startsWith('/')) {
          const origin = new URL(playlistUrl).origin;
          streamUrl = origin + streamUrl;
        } else {
          streamUrl = baseUrl + streamUrl;
        }
      }
      streams.push({ quality, url: streamUrl });
    }
    return streams;
  } catch (e) {
    console.warn('[VidLink] M3U8 parse error:', e);
    return [];
  }
}

// --- Quality sorting with zero-width chars ---
function getSortedQuality(quality) {
  if (!quality) return 'Auto';
  const lower = quality.toLowerCase();
  if (lower.includes('auto')) return '1080p';
  if (lower.includes('2160') || lower.includes('4k') || lower.includes('uhd'))
    return '\u200b' + quality;
  if (lower.includes('1080') || lower.includes('fhd'))
    return '\u200b\u200b' + quality;
  if (lower.includes('720') || lower.includes('hd'))
    return '\u200b\u200b\u200b' + quality;
  if (lower.includes('480') || lower.includes('sd'))
    return '\u200b\u200b\u200b\u200b' + quality;
  return '\u200b\u200b' + quality;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  console.log('[Vidlink] Fetching streams for ' + type + ' ' + tmdbId);
  try {
    // Step 1: Get encrypted TMDB ID from decrypt API
    const decryptUrl = DECRYPT_API + '/api/m/' + tmdbId;
    const decryptRes = await fetch(decryptUrl);
    const decryptData = await decryptRes.json();
    const encryptedId = decryptData.result;
    if (!encryptedId) {
      console.log('[Vidlink] No encrypted ID returned');
      return [];
    }

    // Step 2: Get TMDB metadata
    const isMovie = type !== 'tv' && season == null;
    const mediaType = isMovie ? 'movie' : 'tv';
    const metadata = await getTmdbMetadata(tmdbId, mediaType, season, episode);

    // Step 3: Fetch stream playlist
    const streamUrl = isMovie
      ? VIDLINK_API + '/api/b/movie/' + encryptedId
      : VIDLINK_API + '/api/b/tv/' + encryptedId + '/' + season + '/' + episode;

    console.log('[Vidlink] Fetching: ' + streamUrl);
    const streamRes = await fetch(streamUrl, { headers: HEADERS });
    const streamData = await streamRes.json();
    const playlistUrl = streamData && streamData.stream && streamData.stream.url;
    if (!playlistUrl) {
      console.log('[Vidlink] No playlist in response');
      return [];
    }

    // Step 4: Build stream entries
    const streams = [];

    const addStream = (quality, url) => {
      let qualityLabel = '1080P';
      let displayQuality = '1080p FHD';
      const q = String(quality).toLowerCase();

      if (q.includes('2160') || q.includes('4k')) {
        displayQuality = '2160p 4K'; qualityLabel = '2160P';
      } else if (q.includes('1080')) {
        displayQuality = '1080p FHD'; qualityLabel = '1080P';
      } else if (q.includes('720')) {
        displayQuality = '720p HD'; qualityLabel = '720P';
      } else if (q.includes('480')) {
        displayQuality = '480p SD'; qualityLabel = '480P';
      }

      const size = calculateCalculatedFallbackSize(qualityLabel, metadata.duration);
      const titleText = metadata.name + (!isMovie ? ' S' + season + 'E' + episode : '');

      const name = 'VidLink | ' + displayQuality;
      const fullTitle = '🎬 ' + titleText + ' (' + metadata.year + ') | ' + qualityLabel + ' | ' + size +
        '\n🎞️ M3U8 | ⏱️ ' + metadata.duration + ' | 📌 Main Mirror';

      streams.push({
        name: name,
        title: fullTitle,
        url: url,
        quality: quality,
        type: 'm3u8',
        headers: {
          'User-Agent': HEADERS['User-Agent'],
          'Referer': VIDLINK_API + '/',
          'Origin': VIDLINK_API
        },
        provider: 'vidlink'
      });
    };

    // Add main playlist
    addStream('1080p', playlistUrl);

    // Parse M3U8 for quality variants
    try {
      const variants = await generateM3u8(playlistUrl, {
        'Referer': VIDLINK_API + '/',
        'User-Agent': HEADERS['User-Agent']
      });
      variants.forEach(v => addStream(v.quality, v.url));
    } catch {}

    console.log('[Vidlink] Found playlist stream');
    return streams.map(s => ({ ...s, quality: getSortedQuality(s.quality) }));
  } catch (e) {
    console.error('[Vidlink] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
