import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get('https://nutrizen-2ozq.onrender.com/api/products/trending');
        setTrending(response.data);
      } catch (error) {
        console.error('Failed to fetch trending products');
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="view-home" className="screen-view active space-y-12 sm:space-y-16">
      {/* Premium App Hero Block */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-emerald-50/40 via-white dark:from-emerald-900/40 dark:via-slate-900/80 to-transparent border border-emerald-500/5 px-6 sm:px-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ultra-Premium Metabolic Evaluation Core
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Your Personal <br className="hidden sm:inline" />
              <span className="text-emerald-500">AI Nutritionist</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Instantly scan any retail snack or food barcode to unlock biochemical breakdown metrics, prebiotic indicators, allergen warnings, and clinical-grade AI feedback on physical wellness.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button 
                onClick={() => navigate('/scan')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Scan Product Barcode
              </button>
              <button 
                onClick={() => smoothScrollTo('trending-grid-section')}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore Trending Library
              </button>
            </div>
          </div>

          {/* Graphic Card Preview */}
          <div className="lg:col-span-5 relative flex items-center justify-center select-none hidden lg:flex">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl"></div>
            <div className="relative w-full max-w-[340px] h-[340px] flex items-center justify-center">
              
              {/* Core Floating Product Base Card */}
              <div className="absolute w-60 h-80 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/10 shadow-2xl p-4 flex flex-col justify-between animate-[pulseSoft_2.5s_infinite_ease-in-out]">
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80" alt="Matcha" className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-extrabold flex items-center justify-center shadow-md">A</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Beverages</span>
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 leading-tight">Zen Matcha Latte</h3>
                  <p className="text-[11px] text-slate-400">PureHarvest Organics</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">🌿 Vegan</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">115 kcal</span>
                </div>
              </div>

              {/* Offset Glass Accent Badge */}
              <div className="absolute -right-2 top-8 glass-card rounded-2xl p-3.5 shadow-xl flex items-center gap-3 border-emerald-500/10 z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  🧬
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Antioxidants</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">98% High Purity</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Grid: Trending Products */}
      <section id="trending-grid-section" className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">Trending Verified Products</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">Click any premium card below to execute instantaneous high-level biochemical breakdown views</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full font-mono self-start sm:self-auto">
            {trending.length > 0 ? `${trending.length} ACTIVE CORES` : 'LOADING...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingTrending ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse bg-slate-100/50"></div>
            ))
          ) : trending.map((product) => (
            <Link 
              key={product._id} 
              to={`/product/${product.barcode}`}
              className="glass-card p-4 flex flex-col group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="relative w-full h-40 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center p-4 mb-4">
                <img src={product.imageFrontUrl} alt={product.productName} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                {product.aiAnalysis?.healthScore && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md">
                    {product.aiAnalysis.healthScore >= 8 ? 'A' : product.aiAnalysis.healthScore >= 5 ? 'C' : 'E'}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1 block">{product.category || 'Food'}</span>
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">{product.productName}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{product.brand || 'Unknown'}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {product.nutrition?.calories ? `${Math.round(product.nutrition.calories)} kcal` : 'N/A'}
                  </span>
                  <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
