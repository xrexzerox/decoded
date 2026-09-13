// ============================================
// DECODED: providers/animekai.js
// Provider: AnimeKai (www3.anikai.cc)
// Original: String array + base64 obfuscation
// ============================================

const TMDB_API_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const ANIKAI_BASE = 'https://www3.anikai.cc';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function getResolutionEmoji(resolution) {
  const res = String(resolution || '').toLowerCase();
  if (res.includes('2160') || res.includes('4k') || res.includes('uhd')) return '🌟 2160p';
  if (res.includes('1080') || res.includes('fhd')) return '🔥 1080p';
  if (res.includes('720') || res.includes('hd')) return '💎 720p';
  if (res.includes('480') || res.includes('sd')) return '📱 480p';
  return '📺 ' + (resolution || 'Auto');
}

function qualityRank(quality) {
  if (/2160p|4k/i.test(quality)) return 4;
  if (/1080p/i.test(quality)) return 3;
  if (/720p/i.test(quality)) return 2;
  if (/480p/i.test(quality)) return 1;
  return 0;
}

function getInvertedSortTag(num, max = 999999) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  const inverted = Math.max(0, max - n);
  const binary = inverted.toString(2).padStart(20, '0');
  return binary.split('').map(c => c === '1' ? '\ufeff' : '\u200b').join('');
}

function getSimilarity(a, b) {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams = str => {
    const set = new Set();
    for (let i = 0; i < str.length - 1; i++) set.add(str.substring(i, i + 2));
    return set;
  };

  const b1 = bigrams(s1), b2 = bigrams(s2);
  let intersection = 0;
  for (const bg of b1) if (b2.has(bg)) intersection++;
  return 2 * intersection / (b1.size + b2.size);
}

function toRoman(num) {
  const map = [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let result = '';
  for (const [val, sym] of map) {
    while (num >= val) { result += sym; num -= val; }
  }
  return result;
}

function isMovieOrSpecial(title, type) {
  const lower = title.toLowerCase();
  if (lower.includes('movie') || lower.includes('film') || lower.includes('compilation') ||
      lower.includes('gekijouban') || lower.includes('ova') || lower.includes('ona') ||
      lower.includes('special') || lower.includes('oav') || lower.includes('pic') ||
      lower.includes('mini') || lower.includes('reigen') || lower.includes('recap') ||
      lower.includes('hen') || lower.includes('episode 0') ||
      lower.endsWith('-sp') || lower.endsWith('-ona') || lower.endsWith('-special') ||
      lower.endsWith('-movie') || lower.endsWith('-film')) return true;
  if (type && (type === 'movie' || type === 'ova' || type === 'music' || type === 'tvshort')) return true;
  return false;
}

async function imdbToTmdb(imdbId) {
  try {
    const url = TMDB_BASE + '/find/' + imdbId + '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id';
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.tv_results && data.tv_results.length > 0) return data.tv_results[0];
    if (data.movie_results && data.movie_results.length > 0) return data.movie_results[0];
    return null;
  } catch { return null; }
}

async function getTmdbMeta(tmdbId, type) {
  try {
    const url = type === 'movie'
      ? TMDB_BASE + '/movie/' + tmdbId + '?api_key=' + TMDB_API_KEY
      : TMDB_BASE + '/tv/' + tmdbId + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getSeasonDetails(tmdbId, season) {
  try {
    const url = TMDB_BASE + '/tv/' + tmdbId + '/season/' + season + '?api_key=' + TMDB_API_KEY;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function searchAnikai(query) {
  try {
    const url = ANIKAI_BASE + '/browser?keyword=' + encodeURIComponent(query);
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const results = [];
    const items = html.split('class="item');

    for (let i = 1; i < items.length; i++) {
      const chunk = items[i].substring(0, 2500);
      const linkMatch = chunk.match(/href="([^"]*\/watch\/[^"]*)"/);
      if (!linkMatch) continue;

      let watchUrl = linkMatch[1];
      if (!watchUrl.startsWith('http')) watchUrl = ANIKAI_BASE + watchUrl;

      const titleMatch = chunk.match(/class="title[^"]*"[^>]*>([^<]*)/);
      const title = titleMatch ? titleMatch[1].trim() : '';

      const typeMatches = [...chunk.matchAll(/<span>\s*<b>\s*([^<]+?)\s*<\/b>\s*<\/span>/g)];
      const type = typeMatches.length > 0
        ? typeMatches[typeMatches.length - 1][1].trim().toLowerCase()
        : '';

      results.push({ url: watchUrl, title, type });
    }
    return results;
  } catch { return []; }
}

async function getEpisodeCount(watchUrl) {
  try {
    const res = await fetch(watchUrl + '/ep-1', { headers: { 'User-Agent': UA } });
    if (!res.ok) return 0;
    const html = await res.text();
    const slug = watchUrl.split('/watch/')[1];
    const regex = new RegExp('href="[^"]*/watch/' + slug + '/ep-(\\d+)', 'g');
    let match, maxEp = 0;
    while ((match = regex.exec(html)) !== null) {
      const ep = parseInt(match[1]);
      if (ep > maxEp) maxEp = ep;
    }
    return maxEp;
  } catch { return 0; }
}

function unpackPacked(code) {
  try {
    const evalIdx = code.indexOf('eval(function(p,a,c,k,e,d)');
    if (evalIdx === -1) return null;

    const braceStart = code.indexOf('{', evalIdx);
    let depth = 1, pos = braceStart + 1;
    while (pos < code.length && depth > 0) {
      if (code[pos] === '{') depth++;
      else if (code[pos] === '}') depth--;
      pos++;
    }

    const parenStart = code.indexOf('(', pos - 1);
    if (parenStart === -1) return null;
    depth = 1; pos = parenStart + 1;
    while (pos < code.length && depth > 0) {
      if (code[pos] === '(') depth++;
      else if (code[pos] === ')') depth--;
      pos++;
    }

    const args = code.substring(parenStart + 1, pos - 1).trim();
    const quote = args[0];
    let packed = '', i = 1;
    while (i < args.length) {
      if (args[i] === quote) {
        let backslashes = 0, j = i - 1;
        while (j >= 0 && args[j] === '\\') { backslashes++; j--; }
        if (backslashes % 2 === 0) break;
      }
      packed += args[i]; i++;
    }
    packed = packed.replace(new RegExp('\\\\' + quote, 'g'), quote).replace(/\\\\/g, '\\');

    const rest = args.substring(i + 1).trim();
    const nums = rest.match(/^,?\s*(\d+)\s*,\s*(\d+)/);
    if (!nums) return null;

    const radix = parseInt(nums[1]);
    const count = parseInt(nums[2]);
    const keywords = rest.match(/['"]([^'"]*\|[^'"]*)['"]/);
    if (!keywords) return null;

    const words = keywords[1].split('|');
    const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
    let unpacked = packed;

    for (let idx = count - 1; idx >= 0; idx--) {
      if (idx < words.length && words[idx]) {
        let encoded = '';
        if (idx === 0) encoded = '0';
        else {
          let n = idx;
          while (n > 0) {
            encoded = charset[n % radix] + encoded;
            n = Math.floor(n / radix);
          }
        }
        unpacked = unpacked.replace(new RegExp('\\b' + encoded + '\\b', 'g'), words[idx]);
      }
    }
    return unpacked;
  } catch { return null; }
}

async function extractFromEmbed(embedUrl) {
  try {
    const res = await fetch(embedUrl, {
      headers: { 'User-Agent': UA, 'Referer': ANIKAI_BASE + '/' }
    });
    if (!res.ok) return [];

    const html = await res.text();
    const streams = [];
    const m3u8Regex = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
    let match;

    while ((match = m3u8Regex.exec(html)) !== null) {
      let quality = 'Auto';
      if (match[1].includes('2160') || match[1].includes('4k')) quality = '2160p';
      else if (match[1].includes('1080')) quality = '1080p';
      else if (match[1].includes('720')) quality = '720p';
      else if (match[1].includes('480')) quality = '480p';
      else if (match[1].includes('auto')) quality = 'Auto';

      streams.push({
        url: match[1], quality,
        headers: { 'Referer': embedUrl, 'User-Agent': UA }
      });
    }

    if (streams.length === 0 && html.includes('eval(function(p,a,c,k,e,d)')) {
      const unpacked = unpackPacked(html);
      if (unpacked) {
        while ((match = m3u8Regex.exec(unpacked)) !== null) {
          streams.push({
            url: match[1], quality: 'Auto',
            headers: { 'Referer': embedUrl, 'User-Agent': UA }
          });
        }
      }
    }
    return streams;
  } catch { return []; }
}

async function getStreamsFromWatchPage(watchUrl, metadata = {}) {
  try {
    const res = await fetch(watchUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];

    const html = await res.text();
    const streams = [];
    const seenUrls = new Set();

    const serverRegex = /class="server-items[^"]*"[^>]*data-id="([^"]*)"[\\s\\S]*?<\\/div>/g;
    let serverMatch;

    while ((serverMatch = serverRegex.exec(html)) !== null) {
      const serverId = serverMatch[1];
      if (!['sub', 'softsub', 'dub'].includes(serverId)) continue;

      const isDub = serverId === 'dub';
      const audioHeaderTag = isDub ? 'English [DUB]' : 'Japanese [SUB]';
      const audioSubLine = isDub ? 'English 🇺🇸 - [DUB]' : 'Japanese 🇯🇵 - [SUB]';

      const iframeRegex = /data-video="([^"]*)"/g;
      let iframeMatch, serverNum = 0;

      while ((iframeMatch = iframeRegex.exec(serverMatch[0])) !== null) {
        const videoUrl = iframeMatch[1];
        serverNum++;
        const serverSubLine = isDub
          ? '🗂️ Server ' + serverNum + ' • 🔉 English Dubbed'
          : '🗂️ Server ' + serverNum + ' • 📑 English Subtitles';

        const embedStreams = await extractFromEmbed(videoUrl);
        for (const stream of embedStreams) {
          if (seenUrls.has(stream.url)) continue;
          seenUrls.add(stream.url);

          streams.push({
            url: stream.url,
            quality: stream.quality,
            audioHeaderTag,
            audioSubLine,
            serverSubLine,
            headers: stream.headers
          });
        }
      }
    }

    return streams.sort((a, b) => {
      const qA = a.quality || '1080p';
      const qB = b.quality || '1080p';
      const rankA = qualityRank(qA);
      const rankB = qualityRank(qB);
      const sortTagA = getInvertedSortTag(rankA * 100000 + (100 - streams.indexOf(a)), 999999);
      const sortTagB = getInvertedSortTag(rankB * 100000 + (100 - streams.indexOf(b)), 999999);
      const nameA = sortTagA + 'AnimeKai | ' + qA + ' • ' + a.audioHeaderTag;
      const nameB = sortTagB + 'AnimeKai | ' + qB + ' • ' + b.audioHeaderTag;
      return nameA.localeCompare(nameB);
    }).map(stream => {
      const quality = stream.quality || '1080p';
      const emoji = getResolutionEmoji(quality);
      const titleLine = '🎬 ' + metadata.title + (metadata.year ? ' (' + metadata.year + ')' : '');
      const epLine = metadata.type === 'tv'
        ? '📋 S' + metadata.season + ' E' + metadata.episode +
          (metadata.episodeTitle ? ' - ' + metadata.episodeTitle : '')
        : null;
      const audioLine = emoji + ' | 🗣️ ' + stream.audioSubLine;
      const techLine = '🎞️ ' + (metadata.duration || '24m') + ' | ⚡ H.264';
      const serverLine = stream.serverSubLine;
      const fullTitle = [titleLine, epLine, audioLine, techLine, serverLine]
        .filter(Boolean).join('\n');

      return {
        name: getInvertedSortTag(qualityRank(quality) * 100000, 999999) + 'AnimeKai | ' + quality + ' • ' + stream.audioHeaderTag,
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: stream.url,
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: { request: stream.headers }
        }
      };
    });
  } catch { return []; }
}

async function findBestAnikaiEntry(results, title, season) {
  if (!results || results.length === 0) return null;

  if (season === 0) {
    const movies = results.filter(r => isMovieOrSpecial(r.title, r.type));
    if (movies.length > 0) {
      let best = null, bestScore = -1;
      for (const entry of movies) {
        const score = getSimilarity(entry.title, title);
        if (score > bestScore) { bestScore = score; best = entry; }
      }
      return best || movies[0];
    }
    return results[0];
  }

  const series = results.filter(r => !isMovieOrSpecial(r.title, r.type));
  if (series.length === 0) return results[0];

  const targetTitle = (title || '').toLowerCase().trim();

  if (!season || season === 1) {
    const exact = series.find(r => (r.title || '').toLowerCase().trim() === targetTitle);
    if (exact) return exact;

    const first = series.find(r => {
      const slug = r.url.split('/watch/')[1] || '';
      return !slug.match(/-(ii|iii|iv|v|vi|vii|viii|ix|x)$/i);
    });
    if (first) return first;
  }

  if (season && season > 1) {
    const roman = toRoman(season).toLowerCase();
    const match = series.find(r => {
      const slug = r.url.split('/watch/')[1] || '';
      return slug.toLowerCase().endsWith('-' + roman) ||
        slug.toLowerCase().includes('-' + roman + '-') ||
        slug.toLowerCase().includes('season ' + season) ||
        slug.toLowerCase().includes('s' + season);
    });
    if (match) return match;
  }

  let best = null, bestScore = 0;
  for (const entry of series) {
    const score = getSimilarity(entry.title, title);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best || series[0];
}

async function getStreams(tmdbId, type = 'tv', season = null, episode = null) {
  try {
    let id = tmdbId;
    if (typeof tmdbId === 'string' && tmdbId.startsWith('tt')) {
      const tmdbResult = await imdbToTmdb(tmdbId);
      if (tmdbResult) id = tmdbResult.id;
      else return [];
    }

    const meta = await getTmdbMeta(id, type);
    if (!meta) return [];

    const title = meta.name || meta.title || 'Unknown';
    const year = (meta.first_air_date || meta.release_date || '').slice(0, 4);
    let episodeTitle = '';
    let duration = '24m';

    if (type === 'movie') {
      duration = meta.runtime ? meta.runtime + 'm' : '120m';
      const metadata = { title, year, type, duration };
      const results = await searchAnikai(title);
      if (results.length === 0) return [];
      const movieEntry = results.find(r => isMovieOrSpecial(r.title, r.type));
      const entry = movieEntry || results[0];
      return await getStreamsFromWatchPage(entry.url + '/ep-1', metadata);
    }

    const s = season ?? 1;
    const e = episode || 1;

    const seasonData = await getSeasonDetails(id, s);
    if (seasonData && seasonData.episodes) {
      const ep = seasonData.episodes.find(ep => ep.episode_number === e);
      if (ep) {
        episodeTitle = ep.name || '';
        if (ep.runtime) duration = ep.runtime + 'm';
      }
    }
    if (duration === '24m' && meta.episode_run_time && meta.episode_run_time.length > 0)
      duration = meta.episode_run_time[0] + 'm';

    const metadata = { title, year, type, season: s, episode: e, episodeTitle, duration };

    const seasons = meta.seasons || [];
    const seasonInfo = seasons.find(s => s.season_number === s);
    const totalEps = seasonInfo ? seasonInfo.episode_count : 0;

    let results = await searchAnikai(title);
    if (results.length === 0) {
      results = await searchAnikai(meta.original_name || title);
      if (results.length === 0) return [];
    }

    const bestEntry = await findBestAnikaiEntry(results, title, s);
    if (!bestEntry) return [];

    const epCount = await getEpisodeCount(bestEntry.url);
    let actualEp;
    if (epCount > totalEps && s > 1) {
      let adjustedEp = e;
      for (const prevSeason of seasons) {
        if (prevSeason.season_number < s && prevSeason.season_number > 0)
          adjustedEp += prevSeason.episode_count;
      }
      actualEp = adjustedEp;
    } else {
      actualEp = e;
    }

    return await getStreamsFromWatchPage(bestEntry.url + '/ep-' + actualEp, metadata);
  } catch (e) {
    console.error('[AnimeKai] Error:', e.message);
    return [];
  }
}

module.exports = { getStreams };
