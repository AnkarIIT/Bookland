'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas3D } from './Canvas3D';
import { HeroBookStack } from './Book3D';

const HERO_BOOKS = [
  { id: 11, title: 'Alice in Wonderland', author: 'Lewis Carroll', tilt: -0.25, yOffset: 0.3 },
  { id: 2701, title: 'Moby Dick', author: 'Herman Melville', tilt: -0.09, yOffset: -0.4 },
  { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen', tilt: 0, yOffset: -1.0 },
  { id: 345, title: 'Dracula', author: 'Bram Stoker', tilt: 0.09, yOffset: -0.4 },
  { id: 84, title: 'Frankenstein', author: 'Mary Shelley', tilt: 0.25, yOffset: 0.3 },
];

const gutenbergCover = (id: number) =>
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;

function HeroScene({ onBookClick, reduceMotion }: { onBookClick?: (id: number) => void; reduceMotion?: boolean }) {
  const idByCover = new Map(HERO_BOOKS.map((b) => [gutenbergCover(b.id), b.id]));

  return (
    <>
      <color attach="background" args={['#f5f5f7']} />
      <directionalLight
        position={[5, 10, 7]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 5, -5]} intensity={1} color="#ffedd5" />
      <ambientLight intensity={0.5} color="#fff8f0" />
      <hemisphereLight color="#fff5e6" groundColor="#332211" intensity={0.8} />

      <HeroBookStack
        books={HERO_BOOKS.map((book) => ({
          ...book,
          coverUrl: gutenbergCover(book.id),
        }))}
        centerPosition={[0, -0.5, 0]}
        spread={1.4}
        reduceMotion={reduceMotion}
        onBookClick={(book) => {
          const id = idByCover.get(book.coverUrl);
          if (id) onBookClick?.(id);
        }}
      />
    </>
  );
}

function ParticleField({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;

  useEffect(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    (pointsRef.current.geometry.attributes.position as any).originalPositions = new Float32Array(positions);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || isMobile || reduceMotion) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    const originalPositions = (pointsRef.current.geometry.attributes.position as any).originalPositions;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = originalPositions[i + 1] + Math.sin(time * 0.5 + i * 0.1) * 0.05;
      positions[i] = originalPositions[i] + Math.cos(time * 0.3 + i * 0.07) * 0.03;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.01;
  });

  const particleCount = isMobile ? 500 : 2000;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 8 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    sizes[i] = Math.random() * 1.5 + 0.5;

    if (i % 3 === 0) {
      colors[i * 3] = 0.039; colors[i * 3 + 1] = 0.518; colors[i * 3 + 2] = 1;
    } else if (i % 3 === 1) {
      colors[i * 3] = 0.686; colors[i * 3 + 1] = 0.365; colors[i * 3 + 2] = 0.906;
    } else {
      colors[i * 3] = 0; colors[i * 3 + 1] = 0.831; colors[i * 3 + 2] = 0.667;
    }
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function supportsWebGL() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function Hero3D({ className = '', style, onBookClick }: { className?: string; style?: React.CSSProperties; onBookClick?: (bookId: number) => void }) {
  const [webglOk] = useState(supportsWebGL);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (matches: boolean) => setReduceMotion(matches);
    update(mq.matches);
    mq.addEventListener('change', (event) => update(event.matches));
    return () => mq.removeEventListener('change', (event) => update(event.matches));
  }, []);

  if (!webglOk) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent" />
      </div>
    );
  }

  return (
    <Canvas3D
      className={className}
      style={style}
      cameraPosition={[0, 1, 18]}
      shadows
      onLoad={() => console.log('3D Hero loaded')}
    >
      <Suspense fallback={null}>
        <ParticleField reduceMotion={reduceMotion} />
      </Suspense>
      <Suspense fallback={null}>
        <HeroScene reduceMotion={reduceMotion} onBookClick={onBookClick} />
      </Suspense>

      <Html
        position={[0, -4.5, 0]}
        transform
        scale={0.12}
        sprite
        distanceFactor={15}
        className="pointer-events-none"
      >
        <div className="text-center px-4 py-2 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 dark:border-dark-border/50 max-w-xs">
          <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-widest mb-1">
            Interactive 3D Library
          </p>
          <p className="text-sm font-semibold text-ink dark:text-white">
            Click any book to explore
          </p>
        </div>
      </Html>
    </Canvas3D>
  );
}