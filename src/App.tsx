import { useState } from 'react';
import Header from './components/Header';
import Overview from './components/Overview';
import ObfuscationAnalysis from './components/ObfuscationAnalysis';
import ProvidersGrid from './components/ProvidersGrid';
import Architecture from './components/Architecture';
import CodeBreakdown from './components/CodeBreakdown';
import DecodedSource from './components/DecodedSource';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('decoded');

  const tabs = [
    { id: 'decoded', label: 'Decoded Source', icon: '📄' },
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'obfuscation', label: 'Obfuscation', icon: '🔐' },
    { id: 'providers', label: 'Providers', icon: '🎬' },
    { id: 'architecture', label: 'Architecture', icon: '🏗️' },
    { id: 'code', label: 'Code Analysis', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'decoded' && <DecodedSource />}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'obfuscation' && <ObfuscationAnalysis />}
        {activeTab === 'providers' && <ProvidersGrid />}
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'code' && <CodeBreakdown />}
      </main>

      <Footer />
    </div>
  );
}
