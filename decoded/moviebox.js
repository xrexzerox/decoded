// ============================================
// DECODED: providers/moviebox.js
// Provider: MovieBox
// Original: CineScrape API with auth token and language filtering
// Features: Multi-language support (English/Hindi/Multi), quality detection
// ============================================

async function onSettings() {
  return [
    { type: 'header', label: 'MovieBox Settings' },
    { type: 'toggle', key: 'langEnglish', label: 'Enable English 🏴󠁧󠁢󠁥󠁮󠁧󠁿', defaultValue: true },
    { type: 'toggle', key: 'langHindi', label: 'Enable Hindi 🇮🇳', defaultValue: true }
  ];
}

const PROVIDER_NAME = 'MovieBox';
const CINESCRAPE_BASE = 'https://pengu.uk/%7B%22source_moviebox%22%3A%22on%22%2C%22res_1080%22%3A%22on%22%2C%22disable_direct%22%3A%22on%22%2C%22auth_token%22%3A%22XwZg2rLkLlbjXBeDVCyxgfHXjxN1ijLMkUuToW8KaKc%22%7D';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

async function getStreams(tmdbId, type, season, episode) {
  const isTV = type === 'tv' || type === 'series';
  const tmdbUrl = 'https://api.themoviedb.org/3/' + (isTV ? 'tv' : 'movie') + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';

  try {
    const settings = globalThis.SCRAPER_SETTINGS || {};
    const showEnglish = settings.langEnglish !== false;
    const showHindi = settings.langHindi !== false;

    const tmdbData = await fetch(tmdbUrl).then(r => r.json());
    const imdbId = tmdbData?.external_ids?.imdb_id || tmdbData?.imdb_id;
    if (!imdbId) return [];

    const title = tmdbData.title || tmdbData.name || 'Movie/Show';
    const year = tmdbData.release_date
      ? tmdbData.release_date.split('-')[0]
      : tmdbData.first_air_date
        ? tmdbData.first_air_date.split('-')[0]
        : 'N/A';

    const apiUrl = isTV
      ? CINESCRAPE_BASE + '/stream/series/' + imdbId + ':' + (season || 1) + ':' + (episode || 1) + '.json'
      : CINESCRAPE_BASE + '/stream/movie/' + imdbId + '.json';

    const apiData = await fetch(apiUrl).then(r => r.json());
    if (!apiData?.streams || apiData.streams.length === 0) return [];

    // Filter by language preferences
    const filtered = [];
    apiData.streams.forEach(stream => {
      if (stream.url && stream.url.includes('bcdnxw.hakunaymatata.com')) return;

      const text = (stream.title || stream.description || '').toLowerCase();
      let lang = 'English 🏴󠁧󠁢󠁥󠁮󠁧󠁿';
      let isHindi = false;

      if (/hindi|hin|dual/.test(text)) {
        lang = 'Hindi 🇮🇳';
        isHindi = true;
      } else if (/multi|🌐/.test(text)) {
        lang = 'Multi 🌐';
      }

      if (isHindi && !showHindi) return;
      if (!isHindi && !showEnglish) return;

      filtered.push({ ...stream, lang });
    });

    const streams = [];
    const grouped = {};

    // Group by quality + language
    filtered.forEach(stream => {
      const text = (stream.title || '').toLowerCase();
      const quality = /2160|4k/.test(text) ? '2160p'
        : /1080/.test(text) ? '1080p'
        : /720/.test(text) ? '720p'
        : /480/.test(text) ? '480p'
        : '1080p';
      const key = quality + '-' + stream.lang;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(stream);
    });

    // Build stream objects
    Object.entries(grouped).forEach(([key, items]) => {
      const [quality, lang] = key.split('-');

      items.forEach(stream => {
        const text = (stream.title || stream.description || '').toLowerCase();
        const sizeMatch = stream.title ? stream.title.match(/(\d+(?:\.\d+)?\s*(?:GB|MB))/i) : null;
        const size = sizeMatch ? sizeMatch[1] : '1.99 GB';
        const format = /\b(mp4|avi|m4v)\b/.test(text) ? 'MP4' : 'MKV';
        const cleanLang = lang.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

        const fullTitle = '🎬 ' + title + ' - (' + year + ')\n💎 ' + quality + ' | ' + cleanLang + ' | 💾 ' + size + '\n🎞️ ' + format + ' | ⚡ H.264';

        streams.push({
          name: PROVIDER_NAME + ' | ' + quality + ' | ' + lang,
          title: fullTitle,
          size: fullTitle,
          description: fullTitle,
          url: stream.url,
          behaviorHints: {
            proxyHeaders: {
              request: { 'Referer': 'https://stremio-moviebox-1.onrender.com/' }
            }
          }
        });
      });
    });

    return streams;
  } catch (e) {
    console.error('Global processing failure context:', e);
    return [];
  }
}

typeof module !== 'undefined' && module.exports
  ? module.exports = { getStreams, onSettings }
  : (global.getStreams = getStreams, global.onSettings = onSettings);
