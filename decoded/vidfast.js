// ============================================
// DECODED: providers/vidfast.js
// Provider: VidFast
// Original: String array + base64 obfuscation with encryption API
// ============================================

const VIDFAST_API = 'https://vidfast.vc/api';
const DECRYPT_API = 'https://decrypt.vidfast.vc';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Referer': 'https://vidfast.vc/',
  'X-Requested-With': 'XMLHttpRequest'
};

// --- M3U8 playlist parser ---
async function generateM3u8(playlistUrl, headers = {}) {
  try {
    console.log('[VidFast] Parsing M3U8: ' + playlistUrl);
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
    console.warn('[VidFast] M3U8 parse error:', e);
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
  if (lower.includes('360'))
    return '\u200b\u200b\u200b\u200b\u200b' + quality;
  return '\u200b\u200b' + quality;
}

// --- Fetch stream from individual server ---
async function fetchServerStream(server, baseUrl, headers) {
  try {
    const data = server.data;
    if (!data) return [];

    const serverName = server.name || 'Server';
    const description = server.description || '';
    const streamUrl = baseUrl + '/' + data;

    const res = await fetch(streamUrl, { method: 'GET', headers });
    const encrypted = await res.text();

    if (!encrypted || encrypted.trim() === '') return [];

    // Decrypt the stream URL
    const decryptRes = await fetch(DECRYPT_API + '/dec-vidfast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': HEADERS['User-Agent']
      },
      body: JSON.stringify({ text: encrypted, version: '1' })
    });
    const decryptData = await decryptRes.json();
    const result = decryptData.result;

    if (!result || !result.url) return [];

    const videoUrl = result.url;
    const is4k = result['4kAvailable'] === true || (description && description.toLowerCase().includes('4k'));
    const quality = is4k ? '2160p' : '1080p';
    const isM3u8 = videoUrl.includes('.m3u8');

    const streams = [{
      name: 'Vidfast [' + serverName + ']',
      title: isM3u8 ? 'Auto' : (description || quality),
      url: videoUrl,
      quality: isM3u8 ? 'Auto' : quality,
      type: isM3u8 ? 'm3u8' : (videoUrl.includes('.mp4') || videoUrl.includes('.mkv') ? 'video' : null),
      headers: headers,
      provider: 'vidfast'
    }];

    // If M3U8, parse for quality variants
    if (isM3u8) {
      try {
        const variants = await generateM3u8(videoUrl, headers);
        variants.forEach(v => {
          streams.push({
            name: 'Vidfast [' + serverName + ']',
            title: v.quality,
            url: v.url,
            quality: v.quality,
            type: 'm3u8',
            headers: headers,
            provider: 'vidfast'
          });
        });
      } catch {}
    }

    console.log('[VidFast] Server ' + serverName + ': found stream (' + (isM3u8 ? 'M3U8' : quality) + ')');
    return streams.map(s => ({ ...s, quality: getSortedQuality(s.quality) }));
  } catch {
    return [];
  }
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type, season, episode) {
  console.log('[VidFast] Fetching streams for ' + type + ' ' + tmdbId);
  try {
    const isMovie = type !== 'tv' && season == null;
    const apiUrl = isMovie
      ? VIDFAST_API + '/movie/' + tmdbId + '/'
      : VIDFAST_API + '/tv/' + tmdbId + '/' + season + '/' + episode + '/';

    console.log('[VidFast] API URL: ' + apiUrl);

    // Step 1: Fetch encrypted stream list
    const res = await fetch(apiUrl, { headers: HEADERS });
    const html = await res.text();
    const match = html.match(/\\"en\\":\\"(.*?)\\"/);

    if (!match || !match[1]) {
      console.log('[VidFast] No encrypted data found');
      return [];
    }

    const encryptedData = match[1];

    // Step 2: Decrypt to get server list
    const decryptUrl = DECRYPT_API + '/enc-vidfast?text=' + encryptedData + '&version=1';
    const decryptRes = await fetch(decryptUrl);
    const decryptData = await decryptRes.json();
    const serverList = decryptData.result;

    if (!serverList || !serverList.servers || !serverList.stream || !serverList.csrf) {
      console.log('[VidFast] Invalid server list response');
      return [];
    }

    const serverBaseUrl = serverList.servers;
    const csrfToken = serverList.csrf;
    const headersWithCsrf = { ...HEADERS, 'X-CSRF-Token': csrfToken };

    // Step 3: Fetch encrypted stream data
    const streamRes = await fetch(serverBaseUrl, { method: 'POST', headers: headersWithCsrf });
    const encryptedStream = await streamRes.text();

    // Step 4: Decrypt stream data
    const decryptStreamRes = await fetch(DECRYPT_API + '/dec-vidfast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': HEADERS['User-Agent']
      },
      body: JSON.stringify({ text: encryptedStream, version: '1' })
    });
    const streamData = await decryptStreamRes.json();
    const servers = streamData.result;

    if (!Array.isArray(servers) || servers.length === 0) {
      console.log('[VidFast] No servers in decrypted response');
      return [];
    }

    console.log('[VidFast] Found ' + servers.length + ' servers');

    // Step 5: Fetch streams from all servers in parallel
    const promises = servers.map(server =>
      fetchServerStream(server, serverBaseUrl, headersWithCsrf).catch(() => [])
    );
    const results = await Promise.all(promises);

    const allStreams = [];
    for (const streams of results) {
      if (streams.length > 0) allStreams.push(...streams);
    }

    console.log('[VidFast] Found ' + allStreams.length + ' streams');
    return allStreams.map(s => ({ ...s, quality: getSortedQuality(s.quality) }));
  } catch (e) {
    console.error('[VidFast] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
