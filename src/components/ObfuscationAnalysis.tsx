export default function ObfuscationAnalysis() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">🔐</span> Obfuscation Techniques Identified
        </h2>
        <p className="text-gray-400 mb-6">
          All provider files in this repository use advanced JavaScript obfuscation to protect their source code. 
          Below is a detailed breakdown of each technique identified during the reverse engineering process.
        </p>

        {/* Technique 1: Variable Name Mangling */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-mono rounded">TECHNIQUE 1</span>
            <h3 className="text-white font-semibold">Hex Variable Name Mangling</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            All variable and function names are replaced with hex-encoded identifiers like <code className="text-green-400 bg-gray-800 px-1 rounded">_0x3cd342</code>, 
            <code className="text-green-400 bg-gray-800 px-1 rounded">_0x5e70</code>, <code className="text-green-400 bg-gray-800 px-1 rounded">_0x5bde39</code>. 
            This makes the code virtually unreadable without a deobfuscator.
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">// Obfuscated:</div>
            <div className="text-red-300">const _0x3cd342 = _0x5e70;</div>
            <div className="text-red-300">function _0x5e70(_0x24c6a8, _0x181650) {'{'}</div>
            <div className="text-red-300 pl-4">_0x24c6a8 = _0x24c6a8 - 0x1a4;</div>
            <div className="text-red-300 pl-4">const _0x5eb021 = _0x5eb0();</div>
            <div className="text-red-300">{'}'}</div>
            <div className="text-gray-500 mt-4 mb-2">// Deobfuscated equivalent:</div>
            <div className="text-green-300">const decoder = getStringFromArray;</div>
            <div className="text-green-300">function getStringFromArray(index, shift) {'{'}</div>
            <div className="text-green-300 pl-4">index = index - 0x1a4;</div>
            <div className="text-green-300 pl-4">const stringArray = getArray();</div>
            <div className="text-green-300">{'}'}</div>
          </div>
        </div>

        {/* Technique 2: String Array Rotation */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs font-mono rounded">TECHNIQUE 2</span>
            <h3 className="text-white font-semibold">String Array with Rotation (Shuffle)</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            A large array of base64-encoded strings is stored in a function. An IIFE (Immediately Invoked Function Expression) 
            rotates this array until a checksum matches, making static analysis extremely difficult.
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">// String array rotation loop:</div>
            <div className="text-orange-300">(function(_0x5bde39, _0x597b92) {'{'}</div>
            <div className="text-orange-300 pl-4">const _0x35abec = _0x5bde39();</div>
            <div className="text-orange-300 pl-4">while (!![]) {'{'}</div>
            <div className="text-orange-300 pl-8">try {'{'}</div>
            <div className="text-orange-300 pl-12">const _0x47cb6f = parseInt(decoder(0x1f0)) / 0x1 *</div>
            <div className="text-orange-300 pl-16">(-parseInt(decoder(0x23f)) / 0x2) + ...</div>
            <div className="text-orange-300 pl-12">if (_0x47cb6f === _0x597b92) break;</div>
            <div className="text-orange-300 pl-12">else _0x35abec.push(_0x35abec.shift());</div>
            <div className="text-orange-300 pl-8">{'}'} catch {'{'} _0x35abec.push(_0x35abec.shift()); {'}'}</div>
            <div className="text-orange-300 pl-4">{'}'}</div>
            <div className="text-orange-300">{'}'}) (stringArray, 0xaf6cc);</div>
          </div>
        </div>

        {/* Technique 3: Base64 String Encoding */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-mono rounded">TECHNIQUE 3</span>
            <h3 className="text-white font-semibold">Custom Base64 Decoder with Caching</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Strings are stored as custom base64 and decoded at runtime using a decoder function that includes 
            a cache (HKRVTU object) to avoid re-decoding the same strings.
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">// Decoded strings from the array (examples):</div>
            <div className="text-yellow-300">decoder(0x1c0) → "https://api.showboxapi.com"</div>
            <div className="text-yellow-300">decoder(0x1d2) → "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."</div>
            <div className="text-yellow-300">decoder(0x1fb) → "application/json"</div>
            <div className="text-yellow-300">decoder(0x1c5) → "en-US,en;q=0.9"</div>
            <div className="text-yellow-300">decoder(0x22c) → "ORIGINAL"</div>
            <div className="text-yellow-300">decoder(0x1f7) → "1080P"</div>
            <div className="text-yellow-300">decoder(0x1cf) → "1440P"</div>
            <div className="text-yellow-300">decoder(0x1f6) → ".MKV"</div>
            <div className="text-yellow-300">decoder(0x1d4) → "📥 WEB-DL"</div>
            <div className="text-yellow-300">decoder(0x1c9) → "uiToken"</div>
            <div className="text-yellow-300">decoder(0x1b5) → "SCRAPER_SETTINGS"</div>
          </div>
        </div>

        {/* Technique 4: Crypto Operations */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-mono rounded">TECHNIQUE 4</span>
            <h3 className="text-white font-semibold">AES Encryption/Decryption (CryptoJS)</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Multiple providers use CryptoJS AES-CBC encryption to decrypt API responses. Keys are either hardcoded 
            or fetched dynamically from provider APIs.
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">// Castle provider - Dynamic key fetch:</div>
            <div className="text-purple-300">const securityKey = yield getSecurityKey();</div>
            <div className="text-purple-300">// Key = "T!BgJB" (IV derivation)</div>
            <div className="text-purple-300">const decrypted = CryptoJS.AES.decrypt(cipher, key, {'{'}</div>
            <div className="text-purple-300 pl-4">iv: derivedIV,</div>
            <div className="text-purple-300 pl-4">mode: CryptoJS.mode.CBC,</div>
            <div className="text-purple-300 pl-4">padding: CryptoJS.pad.Pkcs7</div>
            <div className="text-purple-300">{'}'}).toString(CryptoJS.enc.Utf8);</div>
            <div className="text-gray-500 mt-4 mb-2">// ShowBox provider - JWT token decryption:</div>
            <div className="text-purple-300">const key = CryptoJS.enc.Utf8.parse("wEiphTn!");</div>
            <div className="text-purple-300">const iv = CryptoJS.enc.Utf8.parse(jwtPayload);</div>
            <div className="text-purple-300">const decrypted = CryptoJS.AES.decrypt(token, iv, {'{'}</div>
            <div className="text-purple-300 pl-4">iv: key, mode: CBC, padding: Pkcs7</div>
            <div className="text-purple-300">{'}'});</div>
          </div>
        </div>

        {/* Technique 5: Control Flow Flattening */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-mono rounded">TECHNIQUE 5</span>
            <h3 className="text-white font-semibold">Property Access Obfuscation</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Object property accesses are replaced with bracket notation using decoded strings, making it harder to trace data flow.
          </p>
          <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">// Obfuscated property access:</div>
            <div className="text-blue-300">_0x4420f9['versions']['length']</div>
            <div className="text-blue-300">_0x4420f9[_0x5b7332(0x206)] // → 'versions'</div>
            <div className="text-blue-300">_0x55405b[_0x398ee8(0x22d)] // → 'length'</div>
            <div className="text-gray-500 mt-4 mb-2">// Async wrapper obfuscation:</div>
            <div className="text-blue-300">var __async = (_0x1e07e2, _0x2cc067, _0x1be933) =&gt; {'{'}</div>
            <div className="text-blue-300 pl-4">return new Promise((resolve, reject) =&gt; {'{'}</div>
            <div className="text-blue-300 pl-8">// Custom async/await polyfill</div>
            <div className="text-blue-300 pl-4">{'}'});</div>
            <div className="text-blue-300">{'}'}</div>
          </div>
        </div>
      </section>

      {/* Dependencies */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">📦</span> External Dependencies
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'crypto-js', desc: 'AES encryption/decryption for API response handling', version: 'Latest', icon: '🔑' },
            { name: 'cheerio-without-node-native', desc: 'HTML parsing for scraping web pages (React Native compatible)', version: 'Latest', icon: '🌿' },
            { name: 'TMDB API', desc: 'Movie/TV metadata lookup (key: 439c478a...)', version: 'v3', icon: '🎬' },
          ].map((dep) => (
            <div key={dep.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{dep.icon}</span>
                <span className="text-white font-semibold text-sm">{dep.name}</span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{dep.version}</span>
              </div>
              <p className="text-gray-400 text-xs">{dep.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
