'use client';

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas3D } from './Canvas3D';
import { Book3D } from './Book3D';

interface BookData {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  source: string;
  publishedYear?: number;
  readable?: boolean;
}

interface BookExplorer3DProps {
  books: BookData[];
  className?: string;
  style?: React.CSSProperties;
  onBookClick?: (book: BookData) => void;
  viewMode?: 'grid' | 'shelf' | 'floating' | 'carousel';
  onViewModeChange?: (mode: 'grid' | 'shelf' | 'floating' | 'carousel') => void;
}

const COVERS_PER_ROW = 6;
const BOOK_SPACING = 1.3;
const SHELF_SPACING = 3.5;

function BookGrid({ books, onClick }: { books: BookData[]; onClick?: (book: BookData) => void }) {
  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const rows = Math.ceil(books.length / COVERS_PER_ROW);
    for (let row = 0; row < rows; row++) {
      const booksInRow = Math.min(COVERS_PER_ROW, books.length - row * COVERS_PER_ROW);
      const startX = -(booksInRow - 1) * BOOK_SPACING / 2;
      for (let i = 0; i < booksInRow; i++) {
        pos.push(new THREE.Vector3(
          startX + i * BOOK_SPACING,
          2 + row * SHELF_SPACING,
          -row * 2
        ));
      }
    }
    return pos;
  }, [books.length]);

  return (
    <group>
      {books.map((book, i) => (
        <Book3D
          key={book.id}
          coverUrl={book.coverUrl}
          title={book.title}
          author={book.author}
          position={[positions[i].x, positions[i].y, positions[i].z]}
          scale={0.9}
          hoverable
          tiltOnHover
          floating
          floatAmplitude={0.08}
          floatSpeed={0.5 + (i % 3) * 0.2}
          onClick={() => onClick?.(book)}
        />
      ))}
    </group>
  );
}

function BookShelf({ books, onClick }: { books: BookData[]; onClick?: (book: BookData) => void }) {
  const shelfData = useMemo(() => {
    const shelves = [];
    const booksPerShelf = 10;
    const shelvesNeeded = Math.ceil(books.length / booksPerShelf);

    for (let shelf = 0; shelf < shelvesNeeded; shelf++) {
      const shelfBooks = books.slice(shelf * booksPerShelf, (shelf + 1) * booksPerShelf);
      shelves.push({
        y: 1 + shelf * 3.5,
        z: -shelf * 2,
        books: shelfBooks,
      });
    }
    return shelves;
  }, [books.length]);

  return (
    <group>
      {shelfData.map((shelf, shelfIndex) => (
        <group key={shelfIndex} position={[0, shelf.y, shelf.z]}>
          {shelf.books.map((book, i) => (
            <Book3D
              key={book.id}
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
              position={[
                (i - (shelf.books.length - 1) / 2) * BOOK_SPACING,
                0,
                0
              ]}
              scale={0.8}
              hoverable
              tiltOnHover
              floating
              floatAmplitude={0.05}
              floatSpeed={0.4 + (i % 4) * 0.15}
              onClick={() => onClick?.(book)}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function BookCarousel({ books, onClick }: { books: BookData[]; onClick?: (book: BookData) => void }) {
  const radius = 15;
  const positions = useMemo(() => {
    return books.map((_, i) => {
      const angle = (i / books.length) * Math.PI * 2;
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        2 + Math.sin(i * 0.5) * 0.5,
        Math.cos(angle) * radius
      );
    });
  }, [books.length]);

  const groupRef = useRef<THREE.Group>(null);
  const autoRotate = true;

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {books.map((book, i) => (
        <Book3D
          key={book.id}
          coverUrl={book.coverUrl}
          title={book.title}
          author={book.author}
          position={[positions[i].x, positions[i].y, positions[i].z]}
          rotation={[0, (i / books.length) * Math.PI * 2 + Math.PI / 2, 0]}
          scale={1.2}
          hoverable
          tiltOnHover
          floating
          floatAmplitude={0.1}
          floatSpeed={0.3 + (i % 3) * 0.1}
          onClick={() => { onClick?.(book); }}
        />
      ))}
    </group>
  );
}

function FloatingMode({ books, onClick }: { books: BookData[]; onClick?: (book: BookData) => void }) {
  return (
    <group>
      {books.map((book, i) => {
        const angle = (i / books.length) * Math.PI * 2;
        const radius = 12;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = 1 + (i % 3 - 1) * 0.5;

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
            onClick={() => onClick?.(book)}
          />
        );
      })}
    </group>
  );
}

function ExplorerScene({ books, viewMode, onClick }: {
  books: BookData[];
  viewMode: 'grid' | 'shelf' | 'floating' | 'carousel';
  onClick?: (book: BookData) => void;
}) {
  return (
    <>
      <color attach="background" args={['#f5f5f7']} />

      <directionalLight
        position={[10, 15, 10]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 10, -5]} intensity={1} color="#fff5e6" />
      <ambientLight intensity={0.5} color="#fff5e6" />
      <hemisphereLight intensity={1} groundColor="#e8e8e8" color="#fff5e6" />

      <ContactShadows opacity={0.3} scale={40} blur={4} far={30} resolution={512} />

      {viewMode === 'grid' && <BookGrid books={books} onClick={onClick} />}
      {viewMode === 'shelf' && <BookShelf books={books} onClick={onClick} />}
      {viewMode === 'carousel' && <BookCarousel books={books} onClick={onClick} />}
      {viewMode === 'floating' && <FloatingMode books={books} onClick={onClick} />}
    </>
  );
}

export function BookExplorer3D({
  books,
  className = '',
  style,
  onBookClick,
  viewMode = 'shelf',
  onViewModeChange,
}: BookExplorer3DProps) {
  const [mounted, setMounted] = useState(false);
  const [currentMode, setCurrentMode] = useState(viewMode);
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!prefersReducedMotion) {
      setMounted(true);
    }
  }, [prefersReducedMotion]);

  const handleViewModeChange = (mode: 'grid' | 'shelf' | 'floating' | 'carousel') => {
    setCurrentMode(mode);
    onViewModeChange?.(mode);
  };

  if (!mounted) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <div className="absolute inset-0 flex items-center justify-center bg-canvas dark:bg-dark-canvas">
          <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-center gap-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {(['grid', 'shelf', 'floating', 'carousel'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewModeChange(mode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentMode === mode
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-dark-surface/80 text-ink dark:text-white hover:bg-primary-50 dark:hover:bg-primary-500/10'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Canvas3D
        cameraPosition={[0, 5, 20]}
        shadows
        className="absolute inset-0"
        onLoad={() => console.log('3D Explorer loaded')}
      >
        <Suspense fallback={null}>
          <ExplorerScene
            books={books}
            viewMode={currentMode}
            onClick={onBookClick}
          />
        </Suspense>
      </Canvas3D>
    </div>
  );
}

export function BookExplorer3DPage({ books: allBooks }: { books: BookData[] }) {
  const [filteredBooks, setFilteredBooks] = useState(allBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'shelf' | 'floating' | 'carousel'>('shelf');
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredBooks(allBooks);
    } else {
      const lower = query.toLowerCase();
      setFilteredBooks(allBooks.filter(b =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower)
      ));
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-dark-canvas">
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/60 dark:border-dark-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-display font-bold text-xl text-ink dark:text-white">3D Book Explorer</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search books in 3D..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 px-4 py-2 bg-white/80 dark:bg-dark-surface/80 border border-slate-200 dark:border-dark-border rounded-xl text-sm text-ink dark:text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {selectedBook ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-border">
                <h2 className="font-display font-bold text-xl">{selectedBook.title}</h2>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-raised transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-6 mb-6">
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-2xl text-ink dark:text-white mb-2">{selectedBook.title}</h3>
                    <p className="text-lg text-muted dark:text-dark-muted mb-4">by {selectedBook.author}</p>
                    <p className="text-sm text-muted dark:text-dark-muted">
                      Source: {selectedBook.source} {selectedBook.publishedYear ? `· ${selectedBook.publishedYear}` : ''}
                    </p>
                    {selectedBook.readable && (
                      <button className="mt-4 btn-primary">
                        Read Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <BookExplorer3D
          books={filteredBooks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBookClick={(book) => setSelectedBook(book)}
          className="absolute inset-0"
        />
      </main>
    </div>
  );
}