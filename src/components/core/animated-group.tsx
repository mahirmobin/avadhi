'use client';
import { motion } from 'framer-motion';
import React from 'react';

export function AnimatedGroup({ children, className, preset }: { children: React.ReactNode, className?: string, preset?: string }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: preset === 'blur-slide' ? 0 : 0, y: preset === 'blur-slide' ? 20 : 0, filter: preset === 'blur-slide' ? 'blur(10px)' : 'none' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)' }
  };

  // Check if we need to wrap children
  const childrenArray = React.Children.toArray(children);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {childrenArray.map((child, i) => (
        <motion.div key={i} variants={item} className="h-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
