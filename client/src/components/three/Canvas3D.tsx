'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface Canvas3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  shadows?: boolean;
  orthographic?: boolean;
  cameraPosition?: [number, number, number];
  onLoad?: () => void;
}

const fallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-canvas dark:bg-dark-canvas">
    <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function Canvas3D({
  children,
  className = '',
  style,
  shadows = true,
  orthographic = false,
  cameraPosition = [0, 0, 15],
  onLoad,
}: Canvas3DProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (hasLoaded) onLoad?.();
  }, [hasLoaded, onLoad]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      <Canvas
        shadows={shadows}
        orthographic={orthographic}
        camera={{ position: cameraPosition, fov: isMobile ? 60 : 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          setHasLoaded(true);
        }}
      >
        <color attach="background" args={['#f5f5f7']} />
        <Suspense fallback={fallback()}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas dark:bg-dark-canvas z-10">
      <div className="flex flex-col items-center gap-4 text-muted dark:text-dark-muted">
        <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading 3D scene...</p>
      </div>
    </div>
  );
}