'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

interface Book3DProps {
  coverUrl: string;
  title: string;
  author: string;
  width?: number;
  height?: number;
  thickness?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  hoverable?: boolean;
  floating?: boolean;
  floatAmplitude?: number;
  floatSpeed?: number;
  tiltOnHover?: boolean;
  isHtmlOverlay?: boolean;
}

function useSafeTexture(url: string | undefined) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setTexture(null);
    setFailed(false);
    if (!url) return;

    let cancelled = false;
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        if (!cancelled) setTexture(t);
      },
      undefined,
      () => {
        if (!cancelled) setFailed(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { texture, failed };
}

export function Book3D({
  coverUrl,
  title,
  author,
  width = 1,
  height = 1.5,
  thickness = 0.12,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1,
  onClick,
  hoverable = true,
  floating = false,
  floatAmplitude = 0.15,
  floatSpeed = 1,
  tiltOnHover = true,
  isHtmlOverlay = false,
}: Book3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Euler(...rotation));
  const currentRotation = useRef(new THREE.Euler(...rotation));
  const targetScale = useRef(new THREE.Vector3(scale, scale, scale));
  const currentScale = useRef(new THREE.Vector3(scale, scale, scale));
  const targetPosition = useRef(new THREE.Vector3(...position));
  const currentPosition = useRef(new THREE.Vector3(...position));

  const [isHovered, setIsHovered] = useState(false);
  const isPressed = useRef(false);

  const initialY = position[1];
  const timeOffset = useRef(Math.random() * Math.PI * 2);

  const { texture, failed } = useSafeTexture(coverUrl);

  const coverMaterial = useMemo(
    () => new THREE.MeshStandardMaterial(
      failed || !texture
        ? { color: 0x2a2a35, roughness: 0.8, metalness: 0.05 }
        : { map: texture, roughness: 0.7, metalness: 0.05 }
    ),
    [texture, failed]
  );

  const pageMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xf5f0e6,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
  }), []);

  const pageCount = Math.max(2, Math.floor(thickness * 20));
  const pageThickness = thickness / pageCount;

  const pages = useMemo(() => {
    const meshes: React.ReactNode[] = [];
    for (let i = 0; i < pageCount; i++) {
      const z = -thickness / 2 + (i + 0.5) * pageThickness;
      meshes.push(
        <mesh
          key={i}
          geometry={new THREE.PlaneGeometry(width * 0.98, height * 0.98)}
          material={pageMaterial}
          position={[0, 0, z]}
          castShadow={i < 3}
          receiveShadow
        />
      );
    }
    return meshes;
  }, [pageCount, pageThickness, width, height, pageMaterial]);

  const coverGeometry = useMemo(() => new THREE.PlaneGeometry(width, height, 4, 4), [width, height]);
  const spineGeometry = useMemo(() => new THREE.BoxGeometry(thickness, height, width, 2, 4, 2), [width, height, thickness]);

  const backCoverMaterial = useMemo(
    () => new THREE.MeshStandardMaterial(
      failed || !texture
        ? { color: 0x1e1e28, roughness: 0.8, metalness: 0.05, side: THREE.BackSide }
        : { map: texture, side: THREE.BackSide, roughness: 0.7, metalness: 0.05 }
    ),
    [texture, failed]
  );

  const handlePointerOver = () => {
    if (!hoverable) return;
    setIsHovered(true);
    targetScale.current.set(scale * 1.08, scale * 1.08, scale * 1.08);
    if (tiltOnHover) {
      targetRotation.current.x = -0.1;
      targetRotation.current.z = 0;
    }
  };

  const handlePointerOut = () => {
    if (!hoverable) return;
    setIsHovered(false);
    targetScale.current.set(scale, scale, scale);
    if (floating) {
      targetRotation.current.x = 0;
      targetRotation.current.z = 0;
    } else {
      targetRotation.current.x = rotation[0];
      targetRotation.current.z = rotation[2];
    }
  };

  const handlePointerDown = () => {
    isPressed.current = true;
    targetScale.current.set(scale * 0.95, scale * 0.95, scale * 0.95);
  };

  const handlePointerUp = () => {
    isPressed.current = false;
    targetScale.current.set(
      isHovered ? scale * 1.08 : scale,
      isHovered ? scale * 1.08 : scale,
      isHovered ? scale * 1.08 : scale
    );
    if (onClick) onClick();
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime() + timeOffset.current;

    if (floating && !isHovered) {
      targetPosition.current.y = initialY + Math.sin(t * floatSpeed) * floatAmplitude;
      targetRotation.current.z = Math.sin(t * floatSpeed * 0.7) * 0.08;
      targetRotation.current.x = Math.cos(t * floatSpeed * 0.5) * 0.05;
    }

    currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, delta * 8);
    currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, delta * 8);
    currentRotation.current.z = lerp(currentRotation.current.z, targetRotation.current.z, delta * 8);

    currentScale.current.x = lerp(currentScale.current.x, targetScale.current.x, delta * 12);
    currentScale.current.y = lerp(currentScale.current.y, targetScale.current.y, delta * 12);
    currentScale.current.z = lerp(currentScale.current.z, targetScale.current.z, delta * 12);

    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, delta * 10);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, delta * 10);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, delta * 10);

    groupRef.current.rotation.set(
      currentRotation.current.x,
      currentRotation.current.y,
      currentRotation.current.z
    );
    groupRef.current.scale.set(
      currentScale.current.x,
      currentScale.current.y,
      currentScale.current.z
    );
    groupRef.current.position.set(
      currentPosition.current.x,
      currentPosition.current.y,
      currentPosition.current.z
    );
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={onClick}
    >
      <mesh
        geometry={coverGeometry}
        material={coverMaterial}
        position={[0, 0, thickness / 2 + 0.001]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={coverGeometry}
        material={backCoverMaterial}
        position={[0, 0, -thickness / 2 - 0.001]}
        rotation={[0, Math.PI, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={spineGeometry}
        material={coverMaterial}
        position={[width / 2 + thickness / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      />
      {pages}
      {isHtmlOverlay && (
        <Html
          position={[0, -height / 2 - 0.3, thickness / 2 + 0.05]}
          rotation={[-Math.PI / 6, 0, 0]}
          scale={0.08}
          sprite
          distanceFactor={10}
          zIndexRange={[100, 100]}
        >
          <div className="text-center p-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-dark-border/50 min-w-[200px]">
            <h4 className="font-display font-bold text-sm text-ink dark:text-white truncate">{title}</h4>
            <p className="text-xs text-muted dark:text-dark-muted truncate">{author}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export function FloatingBookshelf({
  books,
  radius = 8,
  height = 0,
  rotationSpeed = 0.1,
  autoRotate = true,
}: {
  books: Array<{ coverUrl: string; title: string; author: string }>;
  radius?: number;
  height?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, height, 0]}>
      {books.map((book, i) => {
        const angle = (i / books.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = height + (i % 3 - 1) * 0.5;

        return (
          <Book3D
            key={i}
            coverUrl={book.coverUrl}
            title={book.title}
            author={book.author}
            position={[x, y, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={0.8}
            floating
            floatAmplitude={0.1}
            floatSpeed={0.8 + i * 0.1}
            tiltOnHover
          />
        );
      })}
    </group>
  );
}

export function HeroBookStack({
  books,
  centerPosition = [0, 0, 0],
  spread = 1.2,
  reduceMotion = false,
  onBookClick,
}: {
  books: Array<{ coverUrl: string; title: string; author: string; tilt?: number; yOffset?: number }>;
  centerPosition?: [number, number, number];
  spread?: number;
  reduceMotion?: boolean;
  onBookClick?: (book: { coverUrl: string; title: string; author: string }) => void;
}) {
  return (
    <group position={centerPosition}>
      {books.map((book, i) => (
        <Book3D
          key={i}
          coverUrl={book.coverUrl}
          title={book.title}
          author={book.author}
          onClick={() => onBookClick?.(book)}
          position={[
            (i - (books.length - 1) / 2) * spread,
            (book.yOffset || 0) + (i === Math.floor(books.length / 2) ? 0.3 : 0),
            (i - (books.length - 1) / 2) * 0.3
          ]}
          rotation={[book.tilt || 0, 0, 0]}
          scale={i === Math.floor(books.length / 2) ? 1.2 : 1}
          floating={!reduceMotion}
          floatAmplitude={0.15}
          floatSpeed={0.6 + i * 0.15}
          tiltOnHover
          hoverable
          isHtmlOverlay={i === Math.floor(books.length / 2)}
        />
      ))}
    </group>
  );
}