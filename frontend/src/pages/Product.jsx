import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, CheckCircle, Droplet, Candy, ArrowLeft } from 'lucide-react';

const Product = () => {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://nutrizen-2ozq.onrender.com/api/products/${barcode}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to analyze product. It might not exist in the public database yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [barcode]);

  if (loading) {
    return (
      <div className="screen-view active flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">Extracting Metrics</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Evaluating biochemical compounds via AI core...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-view active flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight max-w-sm">{error}</h2>
        </div>
        <button 
          onClick={() => navigate('/scan')}
          className="px-8 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
        >
          Try Another Scan
        </button>
      </div>
    );
  }

  const { basicInfo, analysis } = data;
  const isHealthy = analysis.healthScore >= 8;
  const isWarning = analysis.healthScore >= 5 && analysis.healthScore < 8;

  const scoreColor = isHealthy ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-red-500';
  const scoreStroke = isHealthy ? 'stroke-emerald-500' : isWarning ? 'stroke-amber-500' : 'stroke-red-500';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - ((analysis.healthScore / 10) * circumference);

  return (
    <div className="screen-view active space-y-8 max-w-5xl mx-auto">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={16} /> BACK TO PREVIOUS
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Product Profile */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 flex flex-col items-center text-center relative">
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden mb-6 flex items-center justify-center p-6 border border-slate-200/50 dark:border-slate-700/50">
              {basicInfo.imageFrontUrl ? (
                <img src={basicInfo.imageFrontUrl} alt="Product" className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              ) : (
                <div className="text-6xl">📦</div>
              )}
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">{basicInfo.category || 'Unknown Category'}</span>
            <h2 className="font-display font-bold text-3xl text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-2">{basicInfo.productName || 'Unknown Product'}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">{basicInfo.brand || 'Unknown Brand'}</p>
          </div>
        </div>

        {/* Right Side: Analytical Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Verdict Box */}
          <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row gap-6 items-center sm:items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldAlert size={100} />
            </div>
            
            {/* Circular Gauge */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="45" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" cy="64" r="45" 
                  className={`progress-circle ${scoreStroke}`} 
                  strokeWidth="8" fill="none" strokeLinecap="round" 
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-display font-extrabold tracking-tighter ${scoreColor}`}>{analysis.healthScore}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Score</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left z-10">
              <h3 className={`font-display text-xl font-bold tracking-tight mb-2 ${scoreColor}`}>
                {analysis.healthStatus}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Deep Analysis Grid */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-6 flex items-center gap-2">
              <ShieldAlert className="text-emerald-500" size={20} /> Biochemical Deep Dive
            </h3>
            
            <div className="space-y-6">
              
              {analysis.harmfulIngredients?.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-500 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono">
                    <AlertTriangle size={14}/> Flagged Compounds
                  </h4>
                  <div className="space-y-2">
                    {analysis.harmfulIngredients.map((ing, i) => (
                      <div key={i} className="bg-red-50/80 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                        <strong className="text-slate-800 dark:text-slate-200 text-sm block mb-1">{ing.name}</strong>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{ing.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-500 dark:text-slate-400 mb-3 text-xs uppercase tracking-wider font-mono">Additives & Preservatives</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.preservatives?.length > 0 ? (
                    analysis.preservatives.map((pres, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">{pres}</span>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-xl font-medium text-sm">
                      <CheckCircle size={16}/> No artificial preservatives detected
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Candy className="text-indigo-400 mb-2" size={20} />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Sugar Profile</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{analysis.sugarLevel}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{analysis.sugar}</p>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Droplet className="text-amber-400 mb-2" size={20} />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Lipid Quality</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{analysis.oilQuality}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate w-full px-2" title={analysis.oilType}>{analysis.oilType || 'N/A'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Alternatives */}
          {analysis.healthyAlternatives?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs">A</span>
                Superior Alternatives
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {analysis.healthyAlternatives.map((alt, i) => (
                  <div key={i} className="glass-card p-4 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-default">
                    <div className="pr-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{alt.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{alt.brand}</p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">{alt.reason}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold font-display shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800">
                      {alt.healthScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Product;
