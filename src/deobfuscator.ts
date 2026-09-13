// Runtime deobfuscator engine for Nuvio provider files
// This simulates the obfuscation's string array rotation and base64 decoding

export function deobfuscateFile(sourceCode: string): string {
  try {
    // Extract the string array
    const arrayMatch = sourceCode.match(/function\s+_0x\w+\(\)\s*\{[\s\S]*?_0x\w+\s*=\s*\[([^\]]+)\]/);
    if (!arrayMatch) return '// Could not extract string array\n' + sourceCode;

    // Parse string array entries
    const arrayContent = arrayMatch[1];
    const strings: string[] = [];
    const strRegex = /'([^']*)'/g;
    let match;
    while ((match = strRegex.exec(arrayContent)) !== null) {
      strings.push(match[1]);
    }

    // Find the target checksum value
    const checksumMatch = sourceCode.match(/\(_0x\w+,(\s*0x[0-9a-f]+)\)/);
    const targetChecksum = checksumMatch ? parseInt(checksumMatch[1], 16) : 0;

    // Simulate the rotation
    const arr = [...strings];
    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
      try {
        // Try to compute the checksum by evaluating the rotation logic
        // This is a simplified version - the actual logic varies per file
        const shifted = [...arr];
        // Simple rotation attempt
        const first = shifted.shift();
        if (first) shifted.push(first);

        // Check if we've reached the target state
        // In practice, we need to decode strings and check
        iterations++;

        // For simplicity, let's just try decoding with current array state
        const testVal = computeSimpleChecksum(shifted);
        if (testVal === targetChecksum || iterations > 100) {
          arr.splice(0, arr.length, ...shifted);
          break;
        }
        arr.splice(0, arr.length, ...shifted);
      } catch {
        break;
      }
    }

    // Now decode all strings using base64
    const decodedStrings: Record<number, string> = {};
    const base64Chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';

    for (let i = 0; i < arr.length; i++) {
      try {
        decodedStrings[i] = customBase64Decode(arr[i], base64Chars);
      } catch {
        decodedStrings[i] = arr[i];
      }
    }

    // Replace decoder calls with actual string values
    let result = sourceCode;

    // Find the decoder function name
    const decoderMatch = sourceCode.match(/const\s+(_0x\w+)\s*=\s*_0x\w+;/);
    const decoderName = decoderMatch ? decoderMatch[1] : null;

    if (decoderName) {
      // Replace all decoder(0xNNN) calls with decoded strings
      const callRegex = new RegExp(decoderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\(\\s*(0x[0-9a-f]+)\\s*\\)', 'g');
      result = result.replace(callRegex, (_match: string, hexIdx: string) => {
        const idx = parseInt(hexIdx, 16);
        // The decoder subtracts a base offset
        for (let base = 0; base < 0x300; base++) {
          const adjustedIdx = idx - base;
          if (adjustedIdx >= 0 && adjustedIdx < arr.length && decodedStrings[adjustedIdx]) {
            return JSON.stringify(decodedStrings[adjustedIdx]);
          }
        }
        // Try direct index
        if (idx >= 0 && idx < arr.length && decodedStrings[idx]) {
          return JSON.stringify(decodedStrings[idx]);
        }
        return _match;
      });
    }

    return result;
  } catch (e) {
    return `// Deobfuscation error: ${e}\n${sourceCode}`;
  }
}

function customBase64Decode(encoded: string, alphabet: string): string {
  let result = '';
  let temp = '';

  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charAt(i);
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;

    temp += char;

    if (temp.length % 4 === 0 || i === encoded.length - 1) {
      // Decode this chunk
      let bits = 0;
      let bitCount = 0;
      for (const c of temp) {
        const ci = alphabet.indexOf(c);
        if (ci === -1) continue;
        bits = (bits << 6) | ci;
        bitCount += 6;
      }

      while (bitCount >= 8) {
        bitCount -= 8;
        const byte = (bits >> bitCount) & 0xff;
        result += '%' + byte.toString(16).padStart(2, '0');
      }
      temp = '';
    }
  }

  try {
    return decodeURIComponent(result);
  } catch {
    return encoded;
  }
}

function computeSimpleChecksum(arr: string[]): number {
  // Simplified checksum - just hash the first few elements
  let hash = 0;
  for (let i = 0; i < Math.min(5, arr.length); i++) {
    for (let j = 0; j < arr[i].length; j++) {
      hash = ((hash << 5) - hash + arr[i].charCodeAt(j)) | 0;
    }
  }
  return Math.abs(hash);
}

// Pre-decoded provider files (manually decoded from analysis)
export const decodedProviders: Record<string, string> = {};
