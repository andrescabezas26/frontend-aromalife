"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface SafeImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
}

export function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  fallbackSrc = "/images/placeholder-label.png" 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
    }
  };

  // Si no hay src o ha fallado completamente, mostrar placeholder
  if (!imgSrc || (hasError && imgSrc === fallbackSrc)) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">Sin imagen</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={() => setHasError(false)}
    />
  );
}