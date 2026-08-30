'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | '3d';
  size?: 'sm' | 'md' | 'lg';
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  depth?: number;
  bevel?: number;
}

const buttonMaterials = {
  primary: {
    front: { color: 0x0071e3, roughness: 0.3, metalness: 0.1 },
    side: { color: 0x005fc4, roughness: 0.4, metalness: 0.15 },
  },
  secondary: {
    front: { color: 0xffffff, roughness: 0.5, metalness: 0.02 },
    side: { color: 0xe8e8e8, roughness: 0.6, metalness: 0.05 },
  },
  ghost: {
    front: { color: 0x000000, roughness: 0.8, metalness: 0, opacity: 0, transparent: true },
    side: { color: 0x000000, roughness: 0.8, metalness: 0, opacity: 0, transparent: true },
  },
  '3d': {
    front: { color: 0x1d1d1f, roughness: 0.2, metalness: 0.3 },
    side: { color: 0x0d0d0f, roughness: 0.3, metalness: 0.4 },
  },
};

const sizeConfig = {
  sm: { width: 2, height: 0.7, depth: 0.15, bevel: 0.08, fontSize: 0.2 },
  md: { width: 3, height: 1, depth: 0.2, bevel: 0.12, fontSize: 0.3 },
  lg: { width: 4.5, height: 1.3, depth: 0.25, bevel: 0.15, fontSize: 0.35 },
};

export function Button3D({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  disabled = false,
  className = '',
  style,
  depth,
}: ThreeDButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const config = sizeConfig[size];
  const buttonDepth = depth ?? config.depth;
  const mats = buttonMaterials[variant];

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetScale = disabled ? scale * 0.8 : isPressed ? scale * 0.92 : isHovered ? scale * 1.06 : scale;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 15);
  });

  const handlePointerOver = () => { if (!disabled) setIsHovered(true); };
  const handlePointerOut = () => setIsHovered(false);
  const handlePointerDown = () => { if (!disabled) setIsPressed(true); };
  const handlePointerUp = () => {
    setIsPressed(false);
    if (!disabled && onClick) onClick();
  };

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[config.width, config.height, buttonDepth]} />
        <meshStandardMaterial {...mats.front} />

        <Html
          position={[0, 0, buttonDepth / 2 + 0.02]}
          transform
          scale={config.fontSize}
          sprite
          distanceFactor={10}
          zIndexRange={[100, 100]}
          className={className}
          style={style}
          fullscreen={false}
        >
          <div className={`flex items-center justify-center gap-2 ${className}`} style={style}>
            {children}
          </div>
        </Html>
      </mesh>
    </group>
  );
}

export function Button3DGroup({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  gap = 1.5,
  direction = 'horizontal',
}: {
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  gap?: number;
  direction?: 'horizontal' | 'vertical';
}) {
  return (
    <group position={position} rotation={rotation}>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return null;
        const count = React.Children.count(children);
        const offset: [number, number, number] = direction === 'horizontal'
          ? [(i - (count - 1) / 2) * gap, 0, 0]
          : [0, -(i - (count - 1) / 2) * gap, 0];

        return React.cloneElement(
          child as React.ReactElement<{ position?: [number, number, number] }>,
          { position: offset }
        );
      })}
    </group>
  );
}

interface ThreeDCardProps {
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  width?: number;
  height?: number;
  depth?: number;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  elevation?: number;
}

export function Card3D({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2.5,
  height = 3.5,
  depth = 0.15,
  hoverable = true,
  onClick,
  className = '',
  elevation = 2,
}: ThreeDCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetY = isHovered ? elevation * 0.5 : 0;
    const targetRotationX = isHovered ? -0.08 : 0;
    const targetRotationY = isHovered ? 0.08 : 0;

    meshRef.current.position.y = lerp(meshRef.current.position.y, targetY, delta * 10);
    meshRef.current.rotation.x = lerp(meshRef.current.rotation.x, targetRotationX, delta * 10);
    meshRef.current.rotation.y = lerp(meshRef.current.rotation.y, targetRotationY, delta * 10);
    meshRef.current.scale.lerp(
      new THREE.Vector3(scale * (isHovered ? 1.02 : 1), scale * (isHovered ? 1.02 : 1), scale),
      delta * 10
    );
  });

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={rotation}
        castShadow
        receiveShadow
        onPointerOver={() => hoverable && setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={0xffffff}
          roughness={0.4}
          metalness={0.02}
        />
        <meshStandardMaterial
          color={0xf0f0f0}
          roughness={0.6}
          metalness={0.05}
          side={THREE.BackSide}
        />

        <Html
          position={[0, 0, depth / 2 + 0.01]}
          transform
          scale={0.4}
          sprite
          distanceFactor={10}
          zIndexRange={[100, 100]}
          className={className}
        >
          <div className={`w-full h-full ${className}`}>
            {children}
          </div>
        </Html>

        {isHovered && (
          <mesh
            position={[0, elevation * 0.5, -depth / 2 - 0.1]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[width * 1.2, height * 1.2, 1]}
          >
            <planeGeometry args={[width * 1.2, height * 1.2]} />
            <meshBasicMaterial
              color={0x0a84ff}
              transparent
              opacity={0.08}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

interface ThreeDTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'flip' | 'zoom' | 'morph';
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'power1' | 'power2' | 'power3' | 'elastic' | 'bounce';
}

export function Transition3D({
  children,
  type = 'fade',
  duration = 0.6,
  delay = 0,
  direction = 'up',
  easing = 'power2',
}: ThreeDTransitionProps) {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  const getInitialTransform = (): string => {
    switch (type) {
      case 'fade':
        return '';
      case 'slide':
        if (direction === 'left') return 'translateX(-100px)';
        if (direction === 'right') return 'translateX(100px)';
        if (direction === 'up') return 'translateY(-100px)';
        return 'translateY(100px)';
      case 'flip':
        if (direction === 'left') return 'rotateY(-90deg)';
        if (direction === 'right') return 'rotateY(90deg)';
        if (direction === 'up') return 'rotateX(-90deg)';
        return 'rotateX(90deg)';
      case 'zoom':
        return 'scale(0.8)';
      case 'morph':
        return 'scale(0.5) rotateX(-90deg)';
      default:
        return 'scale(0.6) translateY(20px)';
    }
  };

  const initialTransform = getInitialTransform();

  return (
    <div
      ref={elementRef}
      className="inline-block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : initialTransform,
        transition: `all ${duration}s ${easing}`,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
}

interface ThreeDContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  perspective?: number;
  perspectiveOrigin?: string;
  preserve3D?: boolean;
}

export function Container3D({
  children,
  className = '',
  style,
  perspective = 1000,
  perspectiveOrigin = 'center',
  preserve3D = true,
}: ThreeDContainerProps) {
  return (
    <div
      className={className}
      style={{
        ...style,
        perspective: `${perspective}px`,
        perspectiveOrigin,
        transformStyle: preserve3D ? 'preserve-3d' : 'flat',
      }}
    >
      {children}
    </div>
  );
}

export function Parallax3D({
  children,
  strength = 20,
  className = '',
  style,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setOffset({ x: x * strength, y: y * strength });
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    ref.current?.addEventListener('mousemove', handleMouseMove);
    ref.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ref.current?.removeEventListener('mousemove', handleMouseMove);
      ref.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {React.Children.map(children, (child, i) =>
          React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, {
            style: {
              ...child.props.style,
              transform: `translateZ(${i * 10}px)`,
              transition: 'transform 0.3s ease-out',
            },
          }) : child
        )}
      </div>
    </div>
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}