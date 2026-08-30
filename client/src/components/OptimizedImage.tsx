import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataUrl?: string;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  placeholder = 'blur',
  blurDataUrl,
  className = '',
  style,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden bg-slate-200 dark:bg-dark-raised ${className}`}
        style={style}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-slate-200 dark:bg-dark-raised animate-pulse"
          style={{
            backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-dark-raised animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

export function BookCover({
  src,
  alt,
  width = 100,
  height = 150,
  className = '',
  priority = false,
}: {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  // Generate a simple blur placeholder based on the ID
  const blurDataUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23e2e8f0' width='${width}' height='${height}'/%3E%3C/svg%3E`;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataUrl={blurDataUrl}
      className={`rounded-lg md:rounded-xl overflow-hidden shadow-soft ${className}`}
      style={{ width, height }}
    />
  );
}