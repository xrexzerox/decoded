// ============================================
// DECODED: providers/xpass.js
// Provider: XPass (play.xpass.top)
// Original: Multi-source M3U8 fetcher with JSON extraction
// ============================================

const XPASS_API = 'https://play.xpass.top';
const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Referer': XPASS_API + '/'
};

// --- M3U8 playlist parser ---
async function generateM3u8(providerName, playlistUrl, headers = {}) {
  try {
    console.log('[Xpass] Parsing M3U8: ' + playlistUrl);
    const res = await fetch(playlistUrl, { headers });
    const content = await res.text();
    const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/')) + '/';
    const streams = [];
    const regex = /#EXT-X-STREAM-INF:.*?RESOLUTION=(\d+x\d+).*?\n([^\n]+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const quality = match[1].split('x')[1] + 'p';
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

    if (streams.length === 0) return [{ quality: 'Auto', url: playlistUrl }];
    return streams;
  } catch (e) {
    console.warn('[Xpass] Error parsing M3U8, returning master URL.', e);
    return [{ quality: 'Auto', url: playlistUrl }];
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  console.log('[Xpass] Fetching: ' + type + ' ' + tmdbId);
  const streams = [];

  try {
    const url = type === 'tv'
      ? XPASS_API + '/api/tv/' + tmdbId + '/' + season + '/' + episode
      : XPASS_API + '/api/movie/' + tmdbId;

    console.log('[Xpass] API URL: ' + url);

    const res = await fetch(url, { headers: BASE_HEADERS });
    const html = await res.text();

    // Extract JSON data from script tag
    const jsonMatch = html.match(new RegExp('<script[^>]*>\\s*var\\s+sources\\s*=\\s*(\\[.*?\\]);\\s*</script>', 's'));
    if (!jsonMatch) return console.log('[Xpass] No sources found'), [];

    let sources = [];
    try {
      sources = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('[Xpass] JSON parse error:', e);
      return [];
    }

    console.log('[Xpass] Found ' + sources.length + ' source groups');

    for (const source of sources) {
      try {
        const providerName = source.name || 'Unknown';
        let streamUrl = source.url;
        if (!streamUrl) continue;

        // Make relative URLs absolute
        if (!streamUrl.startsWith('http')) streamUrl = XPASS_API + streamUrl;

        console.log('[Xpass] Fetching: ' + streamUrl);

        const streamRes = await fetch(streamUrl, { headers: BASE_HEADERS });
        const data = await streamRes.json();
        const playlistData = data.playlist || [];

        if (playlistData.length === 0) continue;

        const sourcesList = playlistData[0].sources || [];

        for (const item of sourcesList) {
          const file = item.file;
          if (!file || !file.startsWith('http')) continue;

          const isHls = item.type && item.type.toLowerCase().includes('hls') || file.includes('.m3u8');

          if (isHls) {
            const variants = await generateM3u8(providerName, file, BASE_HEADERS);
            variants.forEach(v => {
              streams.push({
                name: 'XPass [' + providerName + ']',
                title: v.quality,
                url: v.url,
                quality: v.quality,
                type: 'm3u8',
                headers: { 'Referer': XPASS_API + '/', 'User-Agent': BASE_HEADERS['User-Agent'] },
                provider: 'xpass'
              });
            });
          } else {
            streams.push({
              name: 'XPass [' + providerName + ']',
              title: 'Auto',
              url: file,
              quality: 'Auto',
              type: file.includes('.mp4') || file.includes('.mkv') ? 'video' : null,
              headers: { 'Referer': XPASS_API + '/', 'User-Agent': BASE_HEADERS['User-Agent'] },
              provider: 'xpass'
            });
          }
        }
      } catch (e) {
        console.warn('[Xpass] Error processing source ' + source.name + ':', e.message);
      }
    }
  } catch (e) {
    console.error('[Xpass] Error:', e.message);
  }

  console.log('[Xpass] Found ' + streams.length + ' streams');
  return streams;
}

module.exports = { getStreams };
