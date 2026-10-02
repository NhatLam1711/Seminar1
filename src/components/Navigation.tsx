import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const navItems = [
  { id: 0, title: '🏠 Trang chủ' },
  { id: 1, title: '01 Cost Function' },
  { id: 2, title: '02 Batch GD' },
  { id: 3, title: '03 Stochastic GD' },
  { id: 4, title: '04 Mini-batch GD' }
];

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="w-full h-16 bg-surface/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-50 relative">
      <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
        <span>⛩️</span> Gradient Descent <span>🌸</span> 勾配降下法
      </div>
      <div className="flex space-x-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-md ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-md border border-white/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
