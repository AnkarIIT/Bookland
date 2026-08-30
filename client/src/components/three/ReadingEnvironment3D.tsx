'use client';

import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

interface ReadingEnvironment3DProps {
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'sepia' | 'cozy' | 'library';
  children?: React.ReactNode;
  onThemeChange?: (theme: string) => void;
  onBookClick?: (id: number) => void;
}

const themeConfigs = {
  light: { bg: '#fafafa', lightColor: '#fff5e6', groundColor: '#e8e8e8', accentColor: '#0071e3', bookColors: ['#2c3e50', '#1a1a2e', '#0f3460', '#16213e', '#0d1b2a'] },
  dark: { bg: '#0a0a0f', lightColor: '#1a1a2e', groundColor: '#0d0d15', accentColor: '#0a84ff', bookColors: ['#e8e8e8', '#d4d4d4', '#c0c0c0', '#a8a8a8', '#909090'] },
  sepia: { bg: '#f6efe3', lightColor: '#fef9f0', groundColor: '#e8dcc8', accentColor: '#8b6914', bookColors: ['#4a3b26', '#5d4e37', '#3e2f1c', '#6b5b42', '#2c1f0d'] },
  cozy: { bg: '#1a1625', lightColor: '#2d1b4e', groundColor: '#0f0a1a', accentColor: '#e8b4ff', bookColors: ['#fff0f5', '#ffe4ec', '#ffd1dc', '#ffb6c1', '#ff69b4'] },
  library: { bg: '#1e2d3d', lightColor: '#2c3e50', groundColor: '#152030', accentColor: '#f39c12', bookColors: ['#faf0e6', '#f5e6d3', '#ede0c8', '#e6d5b8', '#dfcab0'] },
};

function ReadingRoom({ theme, onBookClick }: { theme: keyof typeof themeConfigs; onBookClick?: (id: number) => void }) {
  const config = themeConfigs[theme];

  return (
    <>
      <color attach="background" args={[config.bg]} />

      <directionalLight
        position={[10, 15, 10]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        color={config.lightColor}
      />
      <directionalLight position={[-5, 8, -5]} intensity={1.5} color={config.lightColor} />
      <ambientLight intensity={0.4} color={config.lightColor} />
      <hemisphereLight color={config.lightColor} groundColor={config.groundColor} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={2} color={config.accentColor} distance={20} decay={2} />

      <Floor config={config} />
      <Bookshelves config={config} onBookClick={onBookClick} />
      <ReadingDesk config={config} />
      <AmbientParticles config={config} />
    </>
  );
}

function Floor({ config }: { config: typeof themeConfigs.light }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      receiveShadow
      castShadow
    >
      <planeGeometry args={[50, 50, 100, 100]} />
      <meshStandardMaterial color={config.groundColor} roughness={0.9} metalness={0.01} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Bookshelves({ config, onBookClick }: { config: typeof themeConfigs.light; onBookClick?: (id: number) => void }) {
  const shelfPositions = React.useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const shelfCount = 4;
    const booksPerShelf = 12;
    const shelfSpacing = 3.5;
    const bookSpacing = 1.2;

    for (let shelf = 0; shelf < shelfCount; shelf++) {
      const y = 0.5 + shelf * shelfSpacing;
      for (let i = 0; i < booksPerShelf; i++) {
        const x = (i - booksPerShelf / 2 + 0.5) * bookSpacing;
        const z = -8 + (shelf % 2) * 16;
        positions.push(new THREE.Vector3(x, y, z));
      }
    }
    return positions;
  }, []);

  return (
    <group>
      {shelfPositions.map((pos, i) => (
        <BookSpine
          key={i}
          position={pos}
          rotation={[0, pos.z > 0 ? 0 : Math.PI, 0]}
          scale={0.7 + Math.random() * 0.3}
          config={config}
          bookId={i}
          onClick={onBookClick}
        />
      ))}
    </group>
  );
}

function BookSpine({ position, rotation, scale, config, bookId, onClick }: {
  position: THREE.Vector3;
  rotation: [number, number, number];
  scale: number;
  config: typeof themeConfigs.light;
  bookId: number;
  onClick?: (id: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const bookColor = config.bookColors[bookId % config.bookColors.length];

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const targetScale = isHovered ? scale * 1.15 : scale;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    meshRef.current.rotation.y = lerp(meshRef.current.rotation.y, rotation[1], delta * 5);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => onClick?.(bookId)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.08, 1.2, 0.8]} />
        <meshStandardMaterial color={bookColor} roughness={0.7} metalness={0.05} />
      <Html position={[0, 0, 0.5]} transform scale={0.05} sprite distanceFactor={10}>
        <div className={`px-2 py-1 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded text-xs font-medium ${isHovered ? 'scale-110' : ''} transition-transform`}>
          Book #{bookId + 1}
        </div>
      </Html>
    </mesh>
  );
}

function ReadingDesk({ config }: { config: typeof themeConfigs.light }) {
  const deskHeight = 1.2;
  const deskWidth = 4;
  const deskDepth = 2;

  return (
    <group position={[0, deskHeight / 2, 6]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskWidth, deskHeight, deskDepth]} />
        <meshStandardMaterial color={config.groundColor} roughness={0.8} metalness={0.02} />
      </mesh>
      <mesh position={[0, deskHeight / 2 + 0.15, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.3, 1.5]} />
        <meshStandardMaterial color={0x1a1a2e} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[1.2, deskHeight / 2 + 0.25, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={0.8} castShadow>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial color={0xffd700} emissive={0xffd700} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function AmbientParticles({ config }: { config: typeof themeConfigs.light }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;

  useFrame((state, delta) => {
    if (!pointsRef.current || isMobile) return;
    pointsRef.current.rotation.y += delta * 0.005;
    pointsRef.current.rotation.x += delta * 0.002;
  });

  const particleCount = isMobile ? 200 : 800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const color1 = new THREE.Color(config.accentColor);
  const color2 = new THREE.Color(config.lightColor);

  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = (Math.random() - 0.3) * 15;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    sizes[i] = Math.random() * 0.8 + 0.2;

    if (i % 2 === 0) {
      colors[i * 3] = color1.r; colors[i * 3 + 1] = color1.g; colors[i * 3 + 2] = color1.b;
    } else {
      colors[i * 3] = color2.r * 0.3; colors[i * 3 + 1] = color2.g * 0.3; colors[i * 3 + 2] = color2.b * 0.3;
    }
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.4} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function ReadingEnvironment3D({
  className = '',
  style,
  theme = 'dark',
  children,
  onBookClick,
}: ReadingEnvironment3DProps) {
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent" />
        {children}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted dark:text-dark-muted">3D environment disabled for reduced motion.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <Canvas
        shadows
        camera={{ position: [0, 2, 12], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[theme === 'dark' ? '#0a0a0f' : '#fafafa']} />
        <Suspense fallback={null}>
          <ReadingRoom theme={theme} onBookClick={onBookClick} />
        </Suspense>
      </Canvas>
      {children}
    </div>
  );
}