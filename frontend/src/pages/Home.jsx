import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Scan, Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = [
  { name: 'All', emoji: '🌟' },
  { name: 'Snacks', emoji: '🥨' },
  { name: 'Beverages', emoji: '🥤' },
  { name: 'Dairy', emoji: '🧀' },
  { name: 'Chocolates', emoji: '🍫' },
  { name: 'Biscuits', emoji: '🍪' },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch Trending Products
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/trending');
        setTrending(response.data);
      } catch (error) {
        console.error('Failed to fetch trending products');
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Handle Search Autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/products/search?q=${searchTerm}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Click outside search to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/product/${searchTerm.trim()}`);
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'bg-slate-100 text-slate-500';
    if (score >= 8) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (score >= 5) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      {/* Soft Top Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none -z-10"></div>
      
      <header className="pt-16 pb-8 px-6 max-w-lg mx-auto relative z-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              NutriZen
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">AI Nutrition Assistant</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
            <span className="text-xl">👋</span>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="relative mb-10" ref={searchRef}>
          <div className="relative glass-card p-3 flex items-center group z-30">
            <Search className="text-slate-400 ml-2 group-focus-within:text-emerald-500 transition-colors shrink-0" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search products by name or barcode..." 
              className="w-full bg-transparent border-none focus:outline-none px-3 text-slate-700 placeholder-slate-400 font-medium"
            />
            {isSearching && <Loader2 className="animate-spin text-emerald-500 mr-2 shrink-0" size={18} />}
          </div>

          {/* Autocomplete Dropdown Overlay */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-slate-100 overflow-hidden z-40 max-h-[300px] overflow-y-auto"
              >
                {suggestions.map((item) => (
                  <Link 
                    key={item.barcode} 
                    to={`/product/${item.barcode}`}
                    onClick={() => setSuggestions([])}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {item.imageFrontUrl ? (
                        <img src={item.imageFrontUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                      <p className="text-xs font-medium text-slate-500 truncate">{item.brand}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 shrink-0" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Action - Scan Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Link to="/scan" className="block w-full rounded-[2rem] bg-emerald-500 p-8 shadow-[0_8px_30px_rgb(34,197,94,0.25)] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10 flex flex-col justify-end">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 shadow-sm border border-white/20">
                <Scan size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">Scan Barcode</h2>
              <p className="text-emerald-50 font-medium text-sm flex items-center gap-1">
                Get instant AI health analysis <ArrowRight size={16} />
              </p>
            </div>
          </Link>
        </motion.div>
      </header>

      {/* Horizontal Category List */}
      <section className="mb-8 overflow-hidden">
        <div className="flex gap-3 px-6 overflow-x-auto hide-scrollbar pb-4 max-w-lg mx-auto snap-x">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-sm border shadow-sm transition-all snap-start ${
                activeCategory === cat.name 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-6 max-w-lg mx-auto relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Trending Now</h2>
        </div>
        
        {loadingTrending ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {trending.map(product => (
              <Link 
                to={`/product/${product.barcode}`} 
                key={product._id}
                className="glass-card p-4 flex flex-col group relative overflow-hidden bg-white hover:border-emerald-200 transition-colors"
              >
                <div className={`absolute top-3 right-3 z-10 border rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md bg-white/80 ${getScoreColor(product.aiAnalysis?.healthScore)}`}>
                  {product.aiAnalysis?.healthScore || '?'} / 10
                </div>
                <div className="h-28 bg-white rounded-2xl flex items-center justify-center p-2 mb-3">
                  <img src={product.imageFrontUrl} alt={product.productName} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="mt-auto">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2" title={product.productName}>{product.productName}</h4>
                  <span className="text-[11px] font-medium text-slate-500 block mt-1 truncate">{product.brand}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
           <p className="text-center text-slate-500 py-8 font-medium">No trending products found.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
