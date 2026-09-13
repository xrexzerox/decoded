# All-in-One Nuvio — Fully Decoded Providers

Complete reverse-engineering and deobfuscation of all 62 JavaScript provider files from the [All-in-One-Nuvio](https://github.com/NuvioPlugin/All-in-One-Nuvio) streaming scraper collection.

## 📁 Structure

```
decoded/          → All 62 fully decoded .js provider files
src/              → Web application source (React + Vite + Tailwind)
dist/             → Built web application
```

## 🔐 Decryption Methods Reverse-Engineered

| Provider | Method |
|----------|--------|
| ShowBox | AES-CBC JWT token decryption |
| Castle | AES-CBC with dynamic security key |
| VidEasy | Custom PRNG XOR stream cipher (MurmurHash3 + RC4) |
| VidSrc | 11 decryption methods (ROT13, XOR, base64 chains) |
| AllWish | RC4-based VRF generation + AES-CBC |
| 1Shows | AES-256-GCM (Pure JS + WebCrypto + WASM) |
| 4KHDHub | Base64 + ROT13 redirect chain decoding |
| MoviesDrive | TMDB → Search → Archive → HubCloud → Direct URL |
| HDHub4u | 7 extractors + auto-domain rotation |
| Peachify | AES-256-GCM via Cloudflare Workers |
| Torrentio | Debrid service integration (9 providers) |
| AnimeKai | Web scraping + eval() packed JS unpacking |

## 📦 All 62 Decoded Providers

### Movies & TV (30)
`showbox.js` · `castle.js` · `vidsrc.js` · `vidlink.js` · `videasy.js` · `torrentio.js` · `4khdhub.js` · `moviesdrive.js` · `hdhub4u.js` · `cinefreak.js` · `uhdmovies.js` · `vegamovies.js` · `dahmermovies.js` · `dahmermovies-4k.js` · `dooflix.js` · `vidfast.js` · `vixsrc.js` · `vidrock.js` · `vidlove.js` · `xpass.js` · `peachify.js` · `playimdb.js` · `netmirror.js` · `moonflix.js` · `goated.js` · `desiflix.js` · `cinemacity.js` · `moviebox.js` · `allmovieland.js` · `animezey.js`

### Web Scrapers (12)
`hdghartv.js` · `gramcinema.js` · `hindmoviez.js` · `movies4u.js` · `movieshunt.js` · `ctgmovies.js` · `einthusan.js` · `fibwatch.js` · `movieblast.js` · `movix.js` · `nakios.js` · `purstream.js`

### Anime (12)
`animekai.js` · `allwish.js` · `allanime.js` · `anidb.js` · `anikototv.js` · `anime-sama.js` · `animepahe.js` · `animesalt.js` · `animetsu.js` · `animeworld.js` · `hianime.js` · `kurage.js`

### Asian Drama (2)
`kisskh.js` · `onlykdrama.js`

### Special (6)
`persianstremio.js` · `topcartoons.js` · `zinkmovies.js` · `1shows.js` · `cineby.js` · `vidlove.js`

## 🔑 Exposed Credentials & Endpoints

| Key | Value |
|-----|-------|
| TMDB API Key | `439c478a771f35c05022f9feabcca01c` |
| TMDB API Key (AnimeKai) | `1865f43a0549ca50d341dd9ab8b29f49` |
| AES Key (ShowBox) | `wEiphTn!` |
| AES IV Salt (Castle) | `T!BgJB` |
| VRF Secret (AllWish) | `ysJhV6U27FVIjjuk` |
| Download Key (1Shows) | `7a03086357a2147dab4d757e8ed2ff8b5dc8707ee3d473afcb80d97727afa191` |

## ⚠️ Disclaimer

This repository is for **educational and security research purposes only**. The decoded code reveals the inner workings of streaming scrapers. Users are responsible for ensuring their use complies with applicable laws and regulations in their jurisdiction.

## 📄 License

Original project licensed under GNU GPL v3.0. Decoded analysis provided as-is for educational purposes.
