import React, { useState, useEffect } from 'react';

const SeismicGame = ({ onTriggerEarthquake }) => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    buildings: Array.from({ length: 8 }, (_, i) => ({
      id: i,
      height: Math.floor(Math.random() * 8) + 3,
      stability: 100,
      reinforced: false,
      x: i * 100 + 50
    })),
    budget: 1000,
    isPlaying: false,
    timeLeft: 60
  });

  const [activeEarthquake, setActiveEarthquake] = useState(null);

  // Oyun döngüsü
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    // Random deprem tetikleme
    const earthquakeTimer = setInterval(() => {
      if (Math.random() < 0.3) { // %30 şans
        triggerRandomEarthquake();
      }
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(earthquakeTimer);
    };
  }, [gameState.isPlaying]);

  // Oyun bitişi kontrol
  useEffect(() => {
    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, [gameState.timeLeft]);

  const triggerRandomEarthquake = () => {
    const magnitude = 2 + Math.random() * 6; // 2.0 - 8.0 arası
    const earthquake = {
      magnitude,
      epicenter: Math.floor(Math.random() * 8),
      duration: 3 + magnitude * 0.5
    };

    setActiveEarthquake(earthquake);
    onTriggerEarthquake(magnitude);

    // Binaları hasar ver
    setTimeout(() => {
      damageBuildings(earthquake);
      setActiveEarthquake(null);
    }, earthquake.duration * 1000);
  };

  const damageBuildings = (earthquake) => {
    setGameState(prev => {
      const newBuildings = prev.buildings.map(building => {
        // Episentere yakınlık hesabı
        const distance = Math.abs(building.id - earthquake.epicenter);
        const distanceFactor = Math.max(0.1, 1 - distance * 0.15);
        
        // Hasar hesaplama algoritması
        const baseDamage = earthquake.magnitude * 5 * distanceFactor;
        const reinforcementReduction = building.reinforced ? 0.5 : 1;
        const heightFactor = building.height * 0.1; // Yüksek binalar daha fazla sallanır
        
        const totalDamage = baseDamage * reinforcementReduction * (1 + heightFactor);
        const newStability = Math.max(0, building.stability - totalDamage);
        
        return {
          ...building,
          stability: newStability
        };
      });

      // Skor hesaplama - ayakta kalan binaların stabilitesi
      const totalStability = newBuildings.reduce((sum, b) => sum + b.stability, 0);
      const newScore = Math.floor(totalStability / 10);

      return {
        ...prev,
        buildings: newBuildings,
        score: newScore
      };
    });
  };

  const reinforceBuilding = (buildingId) => {
    const cost = 200;
    if (gameState.budget < cost) return;

    setGameState(prev => ({
      ...prev,
      budget: prev.budget - cost,
      buildings: prev.buildings.map(building =>
        building.id === buildingId
          ? { ...building, reinforced: true, stability: Math.min(100, building.stability + 20) }
          : building
      )
    }));
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      timeLeft: 60,
      score: 0,
      budget: 1000,
      buildings: prev.buildings.map(b => ({ ...b, stability: 100, reinforced: false }))
    }));
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const getBuildingColor = (building) => {
    if (building.stability > 70) return 'bg-green-500';
    if (building.stability > 40) return 'bg-yellow-500';
    if (building.stability > 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <h3 className="text-sm text-gray-400">Skor</h3>
            <p className="text-2xl font-bold text-blue-400">{gameState.score}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400">Bütçe</h3>
            <p className="text-2xl font-bold text-green-400">${gameState.budget}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400">Süre</h3>
            <p className="text-2xl font-bold text-orange-400">{gameState.timeLeft}s</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-400">Seviye</h3>
            <p className="text-2xl font-bold text-purple-400">{gameState.level}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          {!gameState.isPlaying ? (
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Oyunu Başlat
            </button>
          ) : (
            <button
              onClick={endGame}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            >
              Oyunu Durdur
            </button>
          )}
        </div>
      </div>

      {/* Earthquake Alert */}
      {activeEarthquake && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center animate-pulse">
          <h2 className="text-xl font-bold">🚨 DEPREM UYARISI! 🚨</h2>
          <p>Büyüklük: {activeEarthquake.magnitude.toFixed(1)} - Episenter: Bina {activeEarthquake.epicenter + 1}</p>
        </div>
      )}

      {/* Game Instructions */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-2">🎯 Oyun Hedefi:</h3>
        <p className="text-sm text-gray-300 mb-2">
          Binalarınızı güçlendirerek depremlere karşı koruyun. Her bina güçlendirmesi $200 tutar.
          Ayakta kalan binaların stabilitesi skorunuzu belirler.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Seismic Mantık:</strong> Episentere yakınlık, bina yüksekliği ve güçlendirme durumu hasar miktarını etkiler.
        </p>
      </div>

      {/* City Skyline */}
      <div className="relative bg-gray-700 rounded-lg p-4 h-64 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-600 rounded-b-lg"></div>
        
        {/* Buildings */}
        {gameState.buildings.map((building) => (
          <div
            key={building.id}
            className="absolute bottom-8 transition-all duration-500"
            style={{
              left: `${(building.id * 12) + 2}%`,
              width: '10%'
            }}
          >
            {/* Building */}
            <div
              className={`${getBuildingColor(building)} transition-colors duration-300 ${
                activeEarthquake ? 'animate-bounce' : ''
              } ${building.reinforced ? 'ring-2 ring-blue-400' : ''}`}
              style={{ height: `${building.height * 6}px` }}
            >
              {/* Stability bar */}
              <div className="absolute -top-6 left-0 right-0 bg-gray-800 h-2 rounded">
                <div
                  className="bg-gradient-to-r from-red-500 to-green-500 h-full rounded transition-all duration-300"
                  style={{ width: `${building.stability}%` }}
                />
              </div>
            </div>

            {/* Reinforcement button */}
            {gameState.isPlaying && !building.reinforced && (
              <button
                onClick={() => reinforceBuilding(building.id)}
                disabled={gameState.budget < 200}
                className="absolute -bottom-6 left-0 right-0 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-1 py-1 rounded"
              >
                Güçlendir
              </button>
            )}

            {/* Building number */}
            <div className="absolute top-1 left-1 text-xs font-bold bg-black bg-opacity-50 px-1 rounded">
              {building.id + 1}
            </div>
          </div>
        ))}

        {/* Seismograph */}
        <div className="absolute bottom-0 right-4 w-16 h-16 bg-gray-900 rounded border-2 border-gray-500 flex items-center justify-center">
          <div className={`text-2xl ${activeEarthquake ? 'animate-spin text-red-500' : 'text-gray-500'}`}>
            📊
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {!gameState.isPlaying && gameState.timeLeft === 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">🏆 Oyun Bitti!</h2>
          <p className="text-lg mb-2">Final Skorunuz: {gameState.score}</p>
          <p className="text-gray-400">
            Ayakta kalan binalar: {gameState.buildings.filter(b => b.stability > 0).length}/8
          </p>
        </div>
      )}
    </div>
  );
};

export default SeismicGame;
