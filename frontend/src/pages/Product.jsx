import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, ShieldAlert, Droplet, Candy } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-[3px] border-emerald-500 border-t-transparent rounded-full mb-6 shadow-sm"
        />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI is analyzing product...</h2>
        <p className="text-slate-500 mt-2 font-medium">Evaluating ingredients & health metrics.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight max-w-sm">{error}</h2>
        <button 
          onClick={() => navigate('/scan')}
          className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-medium shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform"
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
  const scoreBgColor = isHealthy ? 'bg-emerald-50' : isWarning ? 'bg-amber-50' : 'bg-red-50';
  const scoreBorderColor = isHealthy ? 'border-emerald-100' : isWarning ? 'border-amber-100' : 'border-red-100';

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-40">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Analysis Result</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-6 space-y-6 max-w-lg mx-auto pt-6">
        {/* Product Overview */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center text-center">
          {basicInfo.imageFrontUrl ? (
            <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-4 overflow-hidden flex items-center justify-center">
              <img src={basicInfo.imageFrontUrl} alt="Product" className="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>
          ) : (
             <div className="w-32 h-32 rounded-[2rem] bg-slate-50 mb-4 border border-slate-100 flex items-center justify-center text-4xl">🏷️</div>
          )}
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">{basicInfo.productName || 'Unknown Product'}</h2>
          <p className="text-slate-500 font-medium mt-1">{basicInfo.brand || 'Unknown Brand'}</p>
        </motion.div>

        {/* Circular Health Score */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`rounded-3xl p-8 flex flex-col items-center justify-center text-center border ${scoreBgColor} ${scoreBorderColor} shadow-sm`}>
          <div className="relative w-36 h-36 flex items-center justify-center mb-5">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
              <circle cx="72" cy="72" r="66" className="stroke-white" strokeWidth="12" fill="none" />
              <motion.circle 
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ strokeDasharray: `${(analysis.healthScore / 10) * 414} 1000` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="72" cy="72" r="66" 
                className={`stroke-current ${scoreColor}`} 
                strokeWidth="12" fill="none" strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tighter ${scoreColor}`}>{analysis.healthScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 10</span>
            </div>
          </div>
          <h3 className={`text-xl font-bold tracking-tight mb-2 ${scoreColor}`}>{analysis.healthStatus}</h3>
          <p className="text-sm font-medium text-slate-600 max-w-sm leading-relaxed">{analysis.summary}</p>
        </motion.div>

        {/* Detailed Insights */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-5 flex items-center gap-2">
            <ShieldAlert className="text-slate-700" size={20} /> Deep Analysis
          </h3>
          
          <div className="space-y-6">
            {analysis.harmfulIngredients?.length > 0 && (
              <div>
                <h4 className="font-bold text-red-500 mb-3 flex items-center gap-1.5 text-sm uppercase tracking-wide"><AlertTriangle size={16}/> Harmful Ingredients</h4>
                <div className="space-y-2">
                  {analysis.harmfulIngredients.map((ing, i) => (
                    <div key={i} className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                      <strong className="text-slate-800 text-sm block mb-0.5">{ing.name}</strong>
                      <span className="text-sm text-slate-600 font-medium leading-relaxed">{ing.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Preservatives & Additives</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.preservatives?.length > 0 ? (
                  analysis.preservatives.map((pres, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-xl text-sm font-medium text-slate-700">{pres}</span>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl font-medium text-sm">
                    <CheckCircle size={16}/> No preservatives detected
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
                <Candy className="text-indigo-400 mb-2" size={20} />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Sugar Level</p>
                <p className="font-bold text-slate-800">{analysis.sugarLevel}</p>
                <p className="text-sm font-medium text-slate-500">{analysis.sugar}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
                <Droplet className="text-amber-400 mb-2" size={20} />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Oil Quality</p>
                <p className="font-bold text-slate-800">{analysis.oilQuality}</p>
                <p className="text-sm font-medium text-slate-500 truncate w-full px-2" title={analysis.oilType}>{analysis.oilType || 'None'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Healthy Alternatives */}
        {analysis.healthyAlternatives?.length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8 pt-4">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4 px-2">Healthier Alternatives</h3>
            <div className="space-y-3">
              {analysis.healthyAlternatives.map((alt, i) => (
                <div key={i} className="glass-card p-4 flex justify-between items-center bg-white border border-emerald-100/50 hover:border-emerald-200 transition-colors cursor-default">
                  <div className="pr-4">
                    <h4 className="font-bold text-slate-800">{alt.name}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{alt.brand}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-2 leading-snug">{alt.reason}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0 shadow-sm border border-emerald-100">
                    {alt.healthScore}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Product;
