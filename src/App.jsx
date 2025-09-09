import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SeismicGame from './components/SeismicGame';
import WaveVisualizer from './components/WaveVisualizer';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState('visualizer');
  const [seismicData, setSeismicData] = useState({
    magnitude: 0,
    frequency: 1,
    amplitude: 0,
    isActive: false
  });

  const triggerEarthquake = (magnitude) => {
    setSeismicData({
      magnitude,
      frequency: magnitude * 0.5 + 1,
      amplitude: magnitude * 10,
      isActive: true
    });
    
    // Deprem simülasyonu 5 saniye sürer
    setTimeout(() => {
      setSeismicData(prev => ({ ...prev, isActive: false }));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-center">
          🌍 Seismic Interactive Platform
        </h1>
        <p className="text-center mt-2 text-gray-300">
          Deprem bilimi ve sismik dalgaları keşfedin
        </p>
      </header>

      {/* Mode Switcher */}
      <div className="p-4 text-center">
        <button
          onClick={() => setGameMode('visualizer')}
          className={`mx-2 px-4 py-2 rounded ${
            gameMode === 'visualizer' ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          Dalga Görselleştirici
        </button>
        <button
          onClick={() => setGameMode('game')}
          className={`mx-2 px-4 py-2 rounded ${
            gameMode === 'game' ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          Deprem Simülatörü
        </button>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {gameMode === 'visualizer' ? (
          <div className="h-96 bg-black rounded-lg">
            <Canvas camera={{ position: [0, 0, 10] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <WaveVisualizer seismicData={seismicData} />
              <OrbitControls />
            </Canvas>
          </div>
        ) : (
          <SeismicGame onTriggerEarthquake={triggerEarthquake} />
        )}

        {/* Control Panel */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Seismic Kontrol Paneli</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Büyüklük (Magnitude)</label>
              <div className="text-2xl font-bold text-red-400">
                {seismicData.magnitude.toFixed(1)}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Frekans (Hz)</label>
              <div className="text-2xl font-bold text-blue-400">
                {seismicData.frequency.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Amplitüd</label>
              <div className="text-2xl font-bold text-green-400">
                {seismicData.amplitude.toFixed(0)}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Deprem Tetikleme:</h4>
            <div className="flex gap-2">
              <button
                onClick={() => triggerEarthquake(2.5)}
                className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
              >
                Hafif (2.5)
              </button>
              <button
                onClick={() => triggerEarthquake(5.0)}
                className="px-3 py-1 bg-orange-600 rounded hover:bg-orange-700"
              >
                Orta (5.0)
              </button>
              <button
                onClick={() => triggerEarthquake(7.5)}
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
              >
                Güçlü (7.5)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 mt-8 border-t border-gray-700 text-center text-gray-400">
        <p>© 2024 Seismic Interactive Platform - Bilim ve teknoloji buluşuyor</p>
      </footer>
    </div>
  );
}

export default App;
