// ============================================
// DECODED: providers/allmovieland.js
// Provider: AllMovieLand (allmovieland.you)
// Original: Web scraping with cheerio, multi-step stream extraction
// Features: Title similarity matching, CSRF token auth, folder-based episode navigation
// ============================================

const cheerio = require('cheerio-without-node-native');

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const MAIN_URL = 'https://allmovieland.you';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

// --- TMDB metadata ---
async function getTMDBDetails(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const url = TMDB_BASE_URL + '/' + mediaType + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';
  const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.status);
  const data = await res.json();
  const title = type === 'tv' ? data.name : data.title;
  const date = type === 'tv' ? data.first_air_date : data.release_date;
  const year = date ? parseInt(date.split('-')[0]) : null;
  return { title, year, imdbId: data.external_ids?.imdb_id || null, data };
}

// --- Title normalization and similarity ---
function normalizeTitle(title) {
  if (!title) return '';
  return title.toLowerCase()
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/[:\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function calculateTitleSimilarity(a, b) {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);
  if (normA === normB) return 1;
  const wordsA = normA.split(/\s+/).filter(w => w.length > 0);
  const wordsB = normB.split(/\s+/).filter(w => w.length > 0);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = wordsA.filter(w => setB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  const jaccard = intersection.length / union.size;
  const extraInB = wordsB.filter(w => !setA.has(w)).length;
  let score = jaccard - extraInB * 0.05;
  if (wordsA.length > 0 && wordsA.every(w => setB.has(w))) score += 0.2;
  return score;
}

function findBestTitleMatch(media, results) {
  if (!results || results.length === 0) return null;
  let bestMatch = null, bestScore = 0;
  for (const result of results) {
    let score = calculateTitleSimilarity(media.title, result.title);
    if (media.year && result.year) {
      const yearDiff = Math.abs(media.year - result.year);
      if (yearDiff === 0) score += 0.2;
      else if (yearDiff <= 1) score += 0.1;
      else if (yearDiff > 5) score -= 0.3;
    }
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestMatch = result;
    }
  }
  return bestMatch;
}

// --- Main getStreams function ---
async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  console.log('[AllMovieLand] Request: ' + tmdbId + ', Type: ' + type);
  try {
    const media = await getTMDBDetails(tmdbId, type);
    console.log('[AllMovieLand] Found: "' + media.title + '" (' + (media.year || 'N/A') + ')');

    const title = media.title;

    // Step 1: Search on AllMovieLand
    const searchUrl = MAIN_URL + '/search?keyword=' + encodeURIComponent(title) + '&type=all';
    const searchRes = await fetch(searchUrl, { headers: HEADERS });
    const searchHtml = await searchRes.text();
    const $search = cheerio.load(searchHtml);
    const results = [];

    $search('.col-md-3').each((_, el) => {
      const itemTitle = $search(el).find('h5').text().trim();
      const href = $search(el).find('a').attr('href');
      const yearMatch = itemTitle.match(new RegExp('(\\d{4})'));
      const year = yearMatch ? parseInt(yearMatch[0]) : null;
      results.push({ title: itemTitle, href, year });
    });

    if (results.length === 0) return console.log('[AllMovieLand] No search results found.'), [];

    // Step 2: Find best match
    const bestMatch = findBestTitleMatch(media, results);
    const match = bestMatch || results[0];
    console.log('[AllMovieLand] Best match: ' + match.title + ' (' + match.year + ')');

    // Step 3: Fetch content page and extract stream domain
    const pageRes = await fetch(match.href, { headers: HEADERS });
    const pageHtml = await pageRes.text();
    const $page = cheerio.load(pageHtml);
    const scriptContent = $page('script').map((_, el) => $page(el).html()).get().join('') || '';

    const domainMatch = scriptContent.match(/const AwsIndStreamDomain\s*=\s*'([^']+)'/);
    const streamDomain = domainMatch ? domainMatch[1].replace(/\/$/, '') : null;
    const srcMatch = scriptContent.match(/src:\s*'([^']+)'/);
    const srcValue = srcMatch ? srcMatch[1] : null;

    if (!streamDomain || !srcValue) return console.log('[AllMovieLand] Could not extract stream info'), [];

    // Step 4: Fetch play page
    const playUrl = streamDomain + '/play/' + srcValue;
    const playRes = await fetch(playUrl, { headers: { ...HEADERS, 'Referer': match.href } });
    const playHtml = await playRes.text();
    const $play = cheerio.load(playHtml);
    const playScript = $play('script').eq(0).html() || '';
    const jsonMatch = playScript.match(/let\s+p3\s*=\s*(\{.*\});/);

    if (!jsonMatch) return console.log('[AllMovieLand] Could not extract p3 data'), [];

    const p3Data = JSON.parse(jsonMatch[1]);
    let baseUrl = p3Data.file.replace(/\\\//g, '/');
    if (!baseUrl.startsWith('http')) baseUrl = '' + streamDomain + baseUrl;

    // Step 5: Fetch stream list with CSRF token
    const streamListRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { ...HEADERS, 'X-CSRF-TOKEN': p3Data.csrf, 'Referer': playUrl }
    });
    const streamListText = await streamListRes.text();
    let streamList = JSON.parse(streamListText.replace(/,\]/g, ']'));

    let streamFiles = [];
    if (type === 'movie') {
      streamFiles = streamList.filter(s => s && s.file);
    } else if (type === 'tv') {
      const seasonData = streamList.find(s => s.id == season);
      if (seasonData && seasonData.folder) {
        const epData = seasonData.folder.find(e => e.ep == episode);
        if (epData && epData.folder) {
          streamFiles = epData.folder.filter(f => f && f.file);
        }
      }
    }

    if (streamFiles.length === 0) return console.log('[AllMovieLand] No stream files found'), [];

    // Step 6: Fetch individual stream URLs
    const streams = [];
    await Promise.all(streamFiles.map(async (file) => {
      try {
        const token = file.file.replace(/^~/, '');
        const streamUrl = streamDomain + '/getlink-' + token + '.json';
        const streamRes = await fetch(streamUrl, {
          method: 'POST',
          headers: { ...HEADERS, 'X-CSRF-TOKEN': p3Data.csrf, 'Referer': playUrl }
        });
        const finalUrl = (await streamRes.text()).trim();

        if (finalUrl && finalUrl.startsWith('http')) {
          const quality = file.title || '1080p';
          streams.push({
            name: 'AllMovieLand',
            title: '🎬 ' + quality,
            url: finalUrl,
            quality: quality,
            headers: { 'Referer': streamDomain + '/', 'Origin': streamDomain, 'User-Agent': HEADERS['User-Agent'] },
            provider: 'allmovieland'
          });
        }
      } catch (e) {
        console.warn('[AllMovieLand] Error fetching stream: ' + e.message);
      }
    }));

    return streams;
  } catch (e) {
    console.error('[AllMovieLand] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
