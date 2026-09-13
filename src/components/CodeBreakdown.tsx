import { useState } from 'react';

interface CodeSample {
  id: string;
  title: string;
  description: string;
  obfuscated: string;
  deobfuscated: string;
  provider: string;
}

const codeSamples: CodeSample[] = [
  {
    id: 'showbox-headers',
    title: 'HTTP Headers Construction',
    description: 'How providers build request headers to avoid detection',
    provider: 'showbox.js',
    obfuscated: `const WORKING_HEADERS = {
  'User-Agent': _0x3cd342(0x1d2),
  'Accept': _0x3cd342(0x1fb),
  'Accept-Language': _0x3cd342(0x1c5),
  'Content-Type': 'application/json'
};`,
    deobfuscated: `const WORKING_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) 
    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/json'
};`,
  },
  {
    id: 'showbox-quality',
    title: 'Quality Detection Logic',
    description: 'Parsing resolution from filenames and quality labels',
    provider: 'showbox.js',
    obfuscated: `function getQualityFromName(_0x2d088c) {
  if (!_0x2d088c) return 'Unknown';
  const _0x7bee4 = _0x2d088c.toUpperCase();
  if (_0x7bee4 === 'ORIGINAL') return _0x184f07(0x22c);
  if (_0x7bee4 === '4K' || _0x7bee4 === '2160P') return '4K';
  if (_0x7bee4 === '1440P' || _0x7bee4 === '2K') return '1440p';
  // ... more conditions
}`,
    deobfuscated: `function getQualityFromName(name) {
  if (!name) return 'Unknown';
  const upper = name.toUpperCase();
  if (upper === 'ORIGINAL') return 'ORIGINAL';
  if (upper === '4K' || upper === '2160P') return '4K';
  if (upper === '1440P' || upper === '2K') return '1440p';
  if (upper === '1080P' || upper === 'FHD') return '1080p';
  if (upper === '720P' || upper === 'HD') return '720p';
  if (upper === '480P' || upper === 'SD') return '480p';
  // Regex fallback for numeric patterns
  const match = name.match(/(\\d{3,4})[pP]?/);
  if (match) {
    const res = parseInt(match[1]);
    if (res >= 2160) return '4K';
    if (res >= 1440) return '1440p';
    if (res >= 1080) return '1080p';
    if (res >= 720) return '720p';
    if (res >= 480) return '480p';
  }
  return 'Unknown';
}`,
  },
  {
    id: 'castle-decrypt',
    title: 'AES Decryption (Castle Provider)',
    description: 'How Castle decrypts API responses using dynamic security keys',
    provider: 'castle.js',
    obfuscated: `function decryptCastle(_0xc6ebf1, _0x4830a9) {
  const _0x227260 = 'T!BgJB';
  const _0x482d9c = CryptoJS.enc.Utf8.parse(_0x4830a9);
  const _0x1339d3 = CryptoJS.enc.Utf8.parse(_0x227260);
  const _0xd52821 = _0x482d9c.concat(_0x1339d3);
  // Key padding to 16 bytes...
  const _0x165e51 = CryptoJS.AES.decrypt(_0xc6ebf1, _0x59f612, {
    iv: _0x305fbb,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return _0x165e51.toString(CryptoJS.enc.Utf8);
}`,
    deobfuscated: `function decryptCastle(cipherText, securityKey) {
  // IV derivation constant
  const IV_SALT = 'T!BgJB';
  
  // Parse the security key and salt
  const keyBytes = CryptoJS.enc.Utf8.parse(securityKey);
  const saltBytes = CryptoJS.enc.Utf8.parse(IV_SALT);
  
  // Combine key + salt
  let combined = keyBytes.concat(saltBytes);
  
  // Pad or truncate to exactly 16 bytes for AES-128
  if (combined.sigBytes < 16) {
    const padding = CryptoJS.lib.WordArray.create(
      new Array(16 - combined.sigBytes).fill(0)
    );
    combined = combined.concat(padding);
  } else if (combined.sigBytes > 16) {
    combined = CryptoJS.lib.WordArray.create(
      combined.words.slice(0, 4), 16
    );
  }
  
  // Use combined as both key and IV
  const aesKey = combined;
  const iv = combined;
  
  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(cipherText, aesKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}`,
  },
  {
    id: 'showbox-token',
    title: 'JWT Token Parsing (ShowBox)',
    description: 'Extracting user ID from encrypted JWT-like tokens',
    provider: 'showbox.js',
    obfuscated: `function parseSingleToken(_0x9c54e1) {
  if (_0x9c54e1.startsWith('eyJ')) {
    const _0xd3e108 = CryptoJS.enc.Base64.parse(_0x9c54e1);
    const _0x4e7e6c = _0xd3e108.toString(CryptoJS.enc.Utf8);
    const _0x3928dd = JSON.parse(_0x4e7e6c);
    if (_0x3928dd && _0x3928dd.data) {
      const _0x541660 = 'wEiphTn!';
      const _0x1e7ff6 = _0x422d01(0x20b);
      const _0x1b80a3 = CryptoJS.enc.Utf8.parse(_0x1e7ff6);
      const _0x5c6b74 = CryptoJS.enc.Utf8.parse(_0x541660);
      const _0x38f31a = CryptoJS.AES.decrypt(
        _0x3928dd.data, _0x1b80a3,
        { iv: _0x5c6b74, mode: CBC, padding: Pkcs7 }
      );
      const _0x6ece35 = JSON.parse(_0x38f31a.toString(Utf8));
      if (_0x6ece35 && _0x6ece35.uid) return String(_0x6ece35.uid);
    }
  }
  return _0x9c54e1;
}`,
    deobfuscated: `function parseSingleToken(token) {
  if (!token) return '';
  
  // Check if it's a JWT-like token
  if (token.startsWith('eyJ')) {
    try {
      // Decode base64 payload
      const payload = CryptoJS.enc.Base64.parse(token);
      const jsonStr = payload.toString(CryptoJS.enc.Utf8);
      const parsed = JSON.parse(jsonStr);
      
      if (parsed && parsed.data) {
        // Decrypt the nested data field
        const AES_KEY = 'wEiphTn!';
        const encryptedData = parsed.data;
        const key = CryptoJS.enc.Utf8.parse(encryptedData);
        const iv = CryptoJS.enc.Utf8.parse(AES_KEY);
        
        const decrypted = CryptoJS.AES.decrypt(
          encryptedData, key,
          { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        
        const userData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        if (userData && userData.uid) {
          return String(userData.uid);
        }
      }
    } catch (e) {
      console.log('Token parse error:', e.message);
    }
  }
  
  // Return raw token if not JWT format
  return token;
}`,
  },
  {
    id: 'metadata-parser',
    title: 'Video Metadata Parser',
    description: 'Extracting codec, HDR, and audio info from filenames',
    provider: 'showbox.js',
    obfuscated: `function parseFilenameMetadata(_0x169c64) {
  const _0x2fa54d = _0x169c64.toUpperCase();
  let codec = '';
  if (_0x2fa54d.includes('HEVC') || _0x2fa54d.includes('X265') 
      || _0x2fa54d.includes('H265') || _0x2fa54d.includes('X265'))
    codec = '🎞️ H.265';
  else if (_0x2fa54d.includes('AVC') || _0x2fa54d.includes('H264'))
    codec = '🎞️ H.264';
  
  let hdr = '';
  if (_0x2fa54d.includes('DV') || _0x2fa54d.includes('DOLBYVISION'))
    hdr = '🌈 Dolby Vision';
  else if (_0x2fa54d.includes('HDR10+'))
    hdr = '✨ HDR10+';
  
  let audio = '';
  if (_0x2fa54d.includes('ATMOS'))
    audio = '🎧 Atmos';
  // ... more patterns
}`,
    deobfuscated: `function parseFilenameMetadata(filename) {
  if (!filename) return {
    line3: '🎞️ H.264 | 📺 SDR | 🎧 Stereo',
    source: '📥 WEB-DL'
  };
  
  const upper = filename.toUpperCase();
  
  // Detect video codec
  let codec = '';
  if (upper.includes('HEVC') || upper.includes('X265') || 
      upper.includes('H265') || upper.includes('H.265'))
    codec = '🎞️ H.265';
  else if (upper.includes('AVC') || upper.includes('H264') || 
           upper.includes('H.264'))
    codec = '🎞️ H.264';
  else if (upper.includes('AV1'))
    codec = '🎞️ AV1';
  
  // Detect HDR format
  let hdr = '';
  if (upper.includes('DV') || upper.includes('DOLBYVISION'))
    hdr = '🌈 Dolby Vision';
  else if (upper.includes('HDR10+'))
    hdr = '✨ HDR10+';
  else if (upper.includes('HDR10'))
    hdr = '✨ HDR10';
  else if (upper.includes('HDR'))
    hdr = '✨ HDR';
  else
    hdr = '📺 SDR';
  
  // Detect audio format
  let audio = '';
  if (upper.includes('ATMOS'))
    audio = '🎧 Atmos';
  else if (upper.includes('DD+') || upper.includes('EAC3 5.1'))
    audio = '🎧 DDP 5.1';
  else if (upper.includes('DDP7.1') || upper.includes('EAC3 7.1'))
    audio = '🎧 DDP 7.1';
  else if (upper.includes('AAC'))
    audio = '🎧 AAC';
  
  // Detect source type
  let source = '📥 WEB-DL';
  if (upper.includes('BLURAY') || upper.includes('BDREMUX'))
    source = '💿 BluRay';
  else if (upper.includes('WEBRIP') || upper.includes('WEB-RIP'))
    source = '🌐 WEB-Rip';
  
  return {
    line3: [codec, hdr, audio].filter(Boolean).join(' | '),
    source: source
  };
}`,
  },
  {
    id: 'settings-system',
    title: 'Settings System (User Configuration)',
    description: 'How providers read user-configured tokens and API keys',
    provider: 'showbox.js',
    obfuscated: `function getAllUiTokens() {
  try {
    let tokens = '';
    if (typeof global !== 'undefined' && 
        global['SCRAPER_SETTINGS'] && 
        global['SCRAPER_SETTINGS']['uiToken'])
      tokens = String(global['SCRAPER_SETTINGS']['uiToken']).trim();
    else if (typeof window !== 'undefined' && 
             window['SCRAPER_SETTINGS'] && 
             window['SCRAPER_SETTINGS']['uiToken'])
      tokens = String(window['SCRAPER_SETTINGS']['uiToken']).trim();
    
    if (!tokens) return [];
    return tokens.split(',').map(t => t.trim()).filter(Boolean);
  } catch (e) { return []; }
}`,
    deobfuscated: `function getAllUiTokens() {
  try {
    let tokens = '';
    
    // Check global scope (Node.js / React Native)
    if (typeof global !== 'undefined' && 
        global.SCRAPER_SETTINGS && 
        global.SCRAPER_SETTINGS.uiToken) {
      tokens = String(global.SCRAPER_SETTINGS.uiToken).trim();
    }
    // Check window scope (Browser)
    else if (typeof window !== 'undefined' && 
             window.SCRAPER_SETTINGS && 
             window.SCRAPER_SETTINGS.uiToken) {
      tokens = String(window.SCRAPER_SETTINGS.uiToken).trim();
    }
    
    if (!tokens) return [];
    
    // Support multiple tokens separated by commas
    return tokens.split(',').map(t => t.trim()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

// Settings UI definition
function onSettings() {
  return [
    {
      type: 'input',
      isPassword: true,
      key: 'uiToken',
      label: 'Cookie Token',
      placeholder: 'Enter your token...',
      description: 'Add multiple tokens separated by commas.'
    },
    {
      type: 'input',
      key: 'ossGroup',
      label: 'OSS Group',
      placeholder: '',
      description: 'Optional OSS group identifier.'
    }
  ];
}`,
  },
];

export default function CodeBreakdown() {
  const [selectedSample, setSelectedSample] = useState(codeSamples[0].id);
  const [showDeobfuscated, setShowDeobfuscated] = useState(false);

  const current = codeSamples.find(s => s.id === selectedSample)!;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-cyan-400">💻</span> Code Analysis & Deobfuscation
        </h2>
        <p className="text-gray-400 mb-6">
          Below are key code patterns extracted from the obfuscated provider files, 
          with their deobfuscated equivalents for educational analysis.
        </p>
      </section>

      {/* Sample Selector */}
      <div className="flex flex-wrap gap-2">
        {codeSamples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => { setSelectedSample(sample.id); setShowDeobfuscated(false); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedSample === sample.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white font-medium">{current.title}</span>
            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded">{current.provider}</span>
          </div>
          <button
            onClick={() => setShowDeobfuscated(!showDeobfuscated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showDeobfuscated
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showDeobfuscated ? '✅ Deobfuscated' : '🔓 Show Deobfuscated'}
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-4">{current.description}</p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <pre className={showDeobfuscated ? 'text-green-300' : 'text-red-300'}>
              {showDeobfuscated ? current.deobfuscated : current.obfuscated}
            </pre>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">⚠️</span> Security Observations
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Hardcoded API Keys',
              desc: 'TMDB API key (439c478a771f35c05022f9feabcca01c) is embedded directly in source code.',
              severity: 'medium',
            },
            {
              title: 'Static Encryption Keys',
              desc: 'AES keys like "wEiphTn!" and "T!BgJB" are hardcoded, making decryption trivial once code is analyzed.',
              severity: 'high',
            },
            {
              title: 'Exposed User Agents',
              desc: 'Browser user-agent strings are hardcoded, making requests easily identifiable.',
              severity: 'low',
            },
            {
              title: 'Token Storage',
              desc: 'User tokens stored in global SCRAPER_SETTINGS object, accessible to any loaded scraper.',
              severity: 'medium',
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  item.severity === 'high' ? 'bg-red-600/20 text-red-400' :
                  item.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  {item.severity.toUpperCase()}
                </span>
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
              </div>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Endpoints Discovered */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-orange-400">🌐</span> Discovered API Endpoints
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Endpoint</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Provider</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { endpoint: 'https://api.themoviedb.org/3/', provider: 'All', purpose: 'TMDB metadata lookup' },
                { endpoint: 'https://api.hlowb.com', provider: 'Castle', purpose: 'Castle API base (encrypted)' },
                { endpoint: 'https://api.showboxapi.com', provider: 'ShowBox', purpose: 'ShowBox content API' },
                { endpoint: 'https://www.febbox.com/file/file_share_list', provider: 'ShowBox', purpose: 'FebBox file sharing' },
                { endpoint: 'https://www.febbox.com/console/video_quality_list', provider: 'ShowBox', purpose: 'Video quality options' },
              ].map((row) => (
                <tr key={row.endpoint} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-cyan-400">{row.endpoint}</td>
                  <td className="px-4 py-3 text-gray-300">{row.provider}</td>
                  <td className="px-4 py-3 text-gray-400">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
