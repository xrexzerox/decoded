# Nuvio Providers — Full Decode Analysis

Complete reverse-engineering and deobfuscation of all **62 JavaScript provider files** from the [All-in-One-Nuvio](https://github.com/NuvioPlugin/All-in-One-Nuvio) streaming scraper collection.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Repository Structure

```
├── decoded/                    # 62 fully decoded .js provider files
│   ├── showbox.js             # AES-CBC JWT decryption
│   ├── castle.js              # AES-CBC dynamic key
│   ├── videasy.js             # Custom PRNG XOR cipher
│   ├── vidsrc.js              # 11 decryption methods
│   ├── allwish.js             # RC4 VRF + AES-CBC
│   ├── 1shows.js              # AES-256-GCM (JS+WebCrypto+WASM)
│   ├── hdhub4u.js             # 7 extractors + domain rotation
│   ├── moviesdrive.js         # Multi-step pipeline
│   ├── torrentio.js           # Debrid integration
│   └── ... (53 more files)
├── src/                        # Web application source
│   ├── App.tsx                # Main app with tab navigation
│   ├── decodedFiles.ts        # Decoded source code data
│   └── components/            # UI components
├── dist/                       # Built web application
└── DECODED_README.md          # Detailed decoded files documentation
```

## 🔐 Decryption Methods Reverse-Engineered

| # | Provider | Encryption Method |
|---|----------|-------------------|
| 1 | **ShowBox** | AES-CBC JWT token decryption, FebBox scraping |
| 2 | **Castle** | AES-CBC with dynamic security key from API |
| 3 | **VidEasy** | Custom PRNG XOR stream cipher (MurmurHash3 + RC4-like) |
| 4 | **VidSrc** | 11 decryption methods (ROT13, XOR, base64 chains) |
| 5 | **AllWish** | RC4-based VRF generation + AES-CBC decryption |
| 6 | **1Shows** | AES-256-GCM (Pure JS + WebCrypto + WASM fallback) |
| 7 | **4KHDHub** | Base64 + ROT13 redirect chain decoding |
| 8 | **MoviesDrive** | TMDB → Search → Archive → HubCloud → Direct URL pipeline |
| 9 | **HDHub4u** | 7 extractors (HubCloud, VidStack, Pixeldrain, StreamTape, HubCdn, HBLinks) + auto-domain rotation |
| 10 | **Peachify** | AES-256-GCM via Cloudflare Workers |
| 11 | **Torrentio** | Debrid service integration (9 providers) |
| 12 | **AnimeKai** | Web scraping + eval() packed JS unpacking |

## 🔑 Exposed Credentials

| Key | Value |
|-----|-------|
| TMDB API Key | `439c478a771f35c05022f9feabcca01c` |
| TMDB API Key (AnimeKai) | `1865f43a0549ca50d341dd9ab8b29f49` |
| AES Key (ShowBox) | `wEiphTn!` |
| AES IV Salt (Castle) | `T!BgJB` |
| VRF Secret (AllWish) | `ysJhV6U27FVIjjuk` |
| Download Key (1Shows) | `7a03086357a2147dab4d757e8ed2ff8b5dc8707ee3d473afcb80d97727afa191` |

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

## 🌐 Web Application

The included web application provides an interactive viewer for browsing all decoded files:

- **Decoded Source** — View all 62 decoded files with syntax highlighting, copy & download
- **Overview** — Repository summary, file structure, manifest analysis
- **Obfuscation** — Detailed breakdown of 5 obfuscation techniques used
- **Providers** — Searchable grid of all 60+ providers with metadata
- **Architecture** — System architecture diagrams and data flow
- **Code Analysis** — Side-by-side obfuscated vs deobfuscated code comparison

## ⚠️ Disclaimer

This repository is for **educational and security research purposes only**. The decoded code reveals the inner workings of streaming scrapers including exposed API keys, encryption methods, and data flow patterns. Users are responsible for ensuring their use complies with applicable laws and regulations in their jurisdiction.

## 📄 License

Original project licensed under GNU GPL v3.0. Decoded analysis provided as-is for educational purposes.
