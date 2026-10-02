import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CostFunctionPage from './pages/CostFunctionPage';
import BatchGDPage from './pages/BatchGDPage';
import SGDPage from './pages/SGDPage';
import MinibatchGDPage from './pages/MinibatchGDPage';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    <HomePage key="home" onStart={() => setCurrentPage(1)} />,
    <CostFunctionPage key="p1" />,
    <BatchGDPage key="p2" />,
    <SGDPage key="p3" />,
    <MinibatchGDPage key="p4" />
  ];

  return (
    <div 
      className="w-full h-screen flex flex-col text-white font-sans overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: 'var(--color-background)',
        backgroundImage: currentPage === 0 ? "url('/src/assets/anime.png')" : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {pages[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
