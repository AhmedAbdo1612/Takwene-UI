import React from 'react';
import { motion } from 'framer-motion';

export default function Skeleton({
  variant = 'text', // 'text' | 'circle' | 'card' | 'list'
  count = 1,
  className = '',
}) {
  const pulseTransition = {
    repeat: Infinity,
    duration: 1.5,
    ease: 'easeInOut',
  };

  const renderSkeleton = (key) => {
    switch (variant) {
      case 'circle':
        return (
          <motion.div
            key={key}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={pulseTransition}
            className={`rounded-full bg-muted-foreground/20 ${className}`}
          />
        );
      case 'card':
        return (
          <motion.div
            key={key}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={pulseTransition}
            className={`border border-card-border bg-card rounded-xl p-5 space-y-4 shadow-sm ${className}`}
          >
            {/* Cover art or main image box */}
            <div className="w-full aspect-video rounded-lg bg-muted-foreground/15" />
            
            {/* Card Content lines */}
            <div className="space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-3.5 bg-muted-foreground/15 rounded w-1/2" />
            </div>
            
            {/* Card Footer badges */}
            <div className="flex justify-between items-center pt-2 border-t border-card-border/50">
              <div className="h-3 bg-muted-foreground/15 rounded w-1/4" />
              <div className="h-5 bg-muted-foreground/20 rounded-full w-1/5" />
            </div>
          </motion.div>
        );
      case 'list':
        return (
          <motion.div
            key={key}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={pulseTransition}
            className={`flex items-center justify-between p-4 rounded-xl border border-card-border bg-card/60 ${className}`}
          >
            <div className="flex items-center gap-3.5 w-full">
              {/* Circular thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-muted-foreground/20 shrink-0" />
              {/* Lines */}
              <div className="space-y-2 w-full">
                <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                <div className="h-3.5 bg-muted-foreground/15 rounded w-1/4" />
              </div>
            </div>
            <div className="h-6 bg-muted-foreground/15 rounded-full w-16 shrink-0" />
          </motion.div>
        );
      case 'text':
      default:
        return (
          <motion.div
            key={key}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={pulseTransition}
            className={`h-4 bg-muted-foreground/20 rounded ${className}`}
          />
        );
    }
  };

  if (count > 1) {
    return (
      <div className="space-y-3.5">
        {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
      </div>
    );
  }

  return renderSkeleton(0);
}
