import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WaveVisualizer = ({ seismicData }) => {
  const meshRef = useRef();
  const timeRef = useRef(0);
  
  // Seismic algoritması parametreleri
  const WAVE_SEGMENTS = 50;
  const WAVE_LENGTH = 20;
  
  // Geometri oluşturma
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(WAVE_LENGTH, 4, WAVE_SEGMENTS, 1);
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    const positions = meshRef.current.geometry.attributes.position;
    
    // Seismic dalga denklemi: A * sin(2πft + φ) * e^(-dt)
    for (let i = 0; i <= WAVE_SEGMENTS; i++) {
      const x = (i / WAVE_SEGMENTS) * WAVE_LENGTH - WAVE_LENGTH / 2;
      
      // P-wave (birincil dalga) - daha hızlı
      const pWaveVelocity = 6; // km/s simülasyonu
      const pWave = seismicData.isActive 
        ? seismicData.amplitude * 0.3 * Math.sin(
            2 * Math.PI * seismicData.frequency * 2 * timeRef.current - 
            (x * pWaveVelocity * 0.1)
          ) * Math.exp(-timeRef.current * 0.5)
        : 0;
      
      // S-wave (ikincil dalga) - daha yavaş ama güçlü
      const sWaveVelocity = 3.5; // km/s simülasyonu
      const sWave = seismicData.isActive 
        ? seismicData.amplitude * 0.8 * Math.sin(
            2 * Math.PI * seismicData.frequency * timeRef.current - 
            (x * sWaveVelocity * 0.1)
          ) * Math.exp(-timeRef.current * 0.3)
        : 0;
      
      // Love wave (yüzey dalgası) - en yavaş
      const loveWave = seismicData.isActive 
        ? seismicData.amplitude * 0.5 * Math.sin(
            2 * Math.PI * seismicData.frequency * 0.7 * timeRef.current - 
            (x * 2 * 0.1)
          ) * Math.exp(-timeRef.current * 0.2)
        : 0;
      
      // Toplam deformasyon
      const totalDisplacement = (pWave + sWave + loveWave) * 0.01;
      
      // Geometriye uygula
      positions.setY(i, totalDisplacement);
    }
    
    positions.needsUpdate = true;
  });

  // Renk hesaplama - büyüklüğe göre
  const waveColor = useMemo(() => {
    if (seismicData.magnitude < 3) return '#4ade80'; // Yeşil - zayıf
    if (seismicData.magnitude < 6) return '#f59e0b'; // Turuncu - orta
    return '#ef4444'; // Kırmızı - güçlü
  }, [seismicData.magnitude]);

  return (
    <group>
      {/* Ana dalga mesh'i */}
      <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color={waveColor}
          wireframe={false}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial 
          color={waveColor}
          wireframe={true}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Grid referansı */}
      <gridHelper 
        args={[WAVE_LENGTH, 20, '#666', '#333']} 
        position={[0, -2, 0]}
      />
      
      {/* Seismograf sensör noktaları */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={i}
          position={[(i - 2) * 4, -1.5, 0]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color={seismicData.isActive ? '#ff0000' : '#888888'} 
          />
        </mesh>
      ))}
      
      {/* Büyüklük göstergesi */}
      {seismicData.isActive && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[seismicData.magnitude * 0.1, 16, 16]} />
          <meshBasicMaterial 
            color={waveColor}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default WaveVisualizer;
