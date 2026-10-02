import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end pb-32 text-center relative overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="z-10"
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(217, 0, 22, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white bg-primary rounded-full overflow-hidden transition-all duration-300 hover:bg-red-700 shadow-2xl"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative flex items-center gap-2">
            Bắt đầu học <Play size={28} fill="currentColor" />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
