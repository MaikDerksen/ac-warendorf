
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ images, startIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);
  
  const handleDownload = async () => {
    try {
      const imageUrl = images[currentIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from URL
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      link.setAttribute('download', filename || `ac-warendorf-bild-${currentIndex + 1}.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // You could add a user-facing error message here (e.g., using a toast)
    }
  };


  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, onClose]);
  
  const currentImage = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
           <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full"
          >
            <Image
              src={currentImage}
              alt={`Galeriebild ${currentIndex + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
              sizes="90vw"
            />
          </motion.div>
        </AnimatePresence>

      </motion.div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDownload} className="bg-black/50 hover:bg-black/70 border-white/20 text-white hover:text-white">
            <Download className="h-5 w-5" />
            <span className="sr-only">Download</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onClose} className="bg-black/50 hover:bg-black/70 border-white/20 text-white hover:text-white">
          <X className="h-5 w-5" />
          <span className="sr-only">Schließen</span>
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-white/20 text-white hover:text-white"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Vorheriges Bild</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-white/20 text-white hover:text-white"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Nächstes Bild</span>
      </Button>
    </motion.div>
  );
}
