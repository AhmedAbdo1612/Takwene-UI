import React from 'react';
import { motion } from 'framer-motion';

export default function Spinner({
  size = 'md',
  fullScreen = false,
  message = '',
  light = false,
  className = '',
}) {
  // Size mapping
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const spinnerColor = light
    ? 'border-white/30 border-t-white'
    : 'border-primary/20 border-t-primary dark:border-primary/10 dark:border-t-primary';

  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        className={`rounded-full border-solid ${sizeClasses[size] || sizeClasses.md} ${spinnerColor}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 0.8,
        }}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`text-sm font-medium ${
            light ? 'text-white' : 'text-muted-foreground'
          }`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md transition-colors duration-300">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
