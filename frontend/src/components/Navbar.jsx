import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedDark = localStorage.getItem('theme') === 'dark';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDark || (!localStorage.getItem('theme') && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.3.2.7.1.8-.2l.7-2c.2-.5.7-.8 1.2-.8h5.6c.5 0 1 .3 1.2-.8l.7 2c.1.3.5.4.8.2 2.7-1.9 4.5-5 4.5-8.5 0-5.5-4.5-10-10-10z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6a6 6 0 00-6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-slate-800 dark:text-slate-100 leading-none">
              Nutri<span className="text-emerald-500">Zen</span>
            </h1>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 font-mono block mt-0.5">AI DIETARY LABS</span>
          </div>
        </Link>

        {/* Live Fuzzy Search input */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-emerald-600/50" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Fuzzy search organic items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full glass-input text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Home
          </Link>
          <Link to="/scan" className="flex items-center gap-1.5 font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2v14H3V5zm4 0h1v14H7V5zm3 0h3v14h-3V5zm5 0h2v14h-2V5zm4 0h1v14h-1V5z" /></svg>
            Scanner
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode} 
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile Burger Trigger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Slide-Down panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-emerald-500/10 bg-white/95 dark:bg-slate-900/95 px-4 py-4 space-y-3 flex flex-col shadow-inner">
          <form onSubmit={handleSearch} className="relative">
            <i className="absolute left-3.5 top-2.5"><svg className="w-4 h-4 text-emerald-600/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></i>
            <input
              type="text"
              placeholder="Fuzzy search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full glass-input text-slate-800 dark:text-slate-100"
            />
          </form>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-left font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400">
            Home Dashboard
          </Link>
          <Link to="/scan" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-left font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400">
            Barcode Scanner
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
