'use client';
import React, { useState, createContext, useContext, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  transition?: any;
  uniqueId: string;
} | null>(null);

export function MorphingDialog({ children, transition }: { children: React.ReactNode, transition?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen, transition, uniqueId }}>
      {children}
    </DialogContext.Provider>
  );
}

export function MorphingDialogTrigger({ children, className }: { children: React.ReactNode, className?: string }) {
  const { setIsOpen, uniqueId } = useContext(DialogContext)!;
  return (
    <motion.div 
      layoutId={`dialog-${uniqueId}`}
      className={className} 
      onClick={() => setIsOpen(true)}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogContainer({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useContext(DialogContext)!;
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          {children}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function MorphingDialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  const { transition, uniqueId } = useContext(DialogContext)!;
  return (
    <motion.div
      layoutId={`dialog-${uniqueId}`}
      transition={transition || { type: 'spring', bounce: 0.05, duration: 0.25 }}
      className={`relative z-[110] overflow-y-auto ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogClose({ className }: { className?: string }) {
  const { setIsOpen } = useContext(DialogContext)!;
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
      className={`absolute top-4 right-4 p-2 rounded-full flex items-center justify-center transition-colors z-[120] ${className || ''}`}
    >
      <X size={16} strokeWidth={3} />
    </button>
  );
}
