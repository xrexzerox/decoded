import { useState } from 'react';
import { decodedFiles } from '../decodedFiles';

export default function DecodedSource() {
  const [selectedFile, setSelectedFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = decodedFiles[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.decoded], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    decodedFiles.forEach((file, idx) => {
      setTimeout(() => {
        const blob = new Blob([file.decoded], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        a.click();
        URL.revokeObjectURL(url);
      }, idx * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-green-400">📄</span> Fully Decoded Source Files
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {decodedFiles.length} provider files fully reverse-engineered and deobfuscated
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          ⬇️ Download All ({decodedFiles.length} files)
        </button>
      </div>

      {/* File selector */}
      <div className="flex flex-wrap gap-2">
        {decodedFiles.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setSelectedFile(idx)}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${
              selectedFile === idx
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* File info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-white font-semibold">{current.filename}</h3>
            <p className="text-gray-500 text-xs mt-1">{current.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
              Provider: {current.provider}
            </span>
            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
              {current.decoded.split('\n').length} lines
            </span>
          </div>
        </div>
      </div>

      {/* Code display */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-gray-400 text-xs font-mono ml-2">{current.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              ⬇️ Download
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <pre className="p-4 text-xs font-mono leading-relaxed text-gray-300 whitespace-pre">
            {current.decoded}
          </pre>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-gray-900 border border-yellow-600/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-yellow-400 font-semibold text-sm">Decoding Notes</h4>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              These files have been manually reverse-engineered from the obfuscated originals. 
              The obfuscation used string array rotation with base64 encoding, hex variable name mangling, 
              and property access obfuscation. All string literals have been decoded, variable names 
              restored to meaningful identifiers, and code structure preserved. Some runtime-specific 
              behaviors (like the exact string array rotation order) were determined through static analysis 
              of the decoder function patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
