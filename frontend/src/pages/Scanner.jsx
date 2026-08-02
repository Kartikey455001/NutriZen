import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Loader2, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Scanner = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Handle successful scan
  const handleScan = useCallback((result) => {
    if (result && isScanning) {
      setIsScanning(false);
      // Play a tiny beep sound or vibrate if mobile
      if (navigator.vibrate) navigator.vibrate(100);
      navigate(`/product/${result.text}`);
    }
  }, [isScanning, navigate]);

  // Continuous scanning loop
  useEffect(() => {
    let animationFrameId;

    const scan = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        try {
          const videoEl = webcamRef.current.video;
          const result = codeReader.current.decodeFromVideoElement(videoEl);
          handleScan(result);
        } catch (err) {
          // NotFoundException is thrown when no barcode is found in the current frame, which is completely normal.
          if (!(err instanceof NotFoundException)) {
            console.error("Barcode scanning error:", err);
          }
        }
      }
      
      if (isScanning) {
        // Run again next frame
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isScanning) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [handleScan, isScanning]);

  const handleUserMedia = () => setHasPermission(true);
  const handleUserMediaError = () => setHasPermission(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="p-6 flex items-center justify-between z-10 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Scan Barcode</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 relative">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm mt-8 relative z-10"
        >
          <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {hasPermission === false ? (
              <div className="text-center p-6 text-red-500">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-bold mb-2 text-slate-800">Camera Access Denied</h3>
                <p className="text-sm font-medium">Please enable camera permissions in your browser settings to scan barcodes.</p>
              </div>
            ) : (
              <>
                {/* Scanner Target Guide */}
                <div className="absolute inset-4 z-20 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-emerald-500/50 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>
                    {/* Laser line animation */}
                    <motion.div 
                      animate={{ y: [0, 120, 0] }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] absolute top-0"
                    />
                  </div>
                </div>

                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ minHeight: '300px' }}
                />
              </>
            )}

          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full mb-4 border border-emerald-100 shadow-sm">
              <Zap size={16} />
              <span className="font-medium text-sm">Powered by Gemini AI</span>
            </div>
            <p className="text-slate-500 font-medium">Point your camera at a food product's barcode to analyze its health benefits instantly.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Scanner;
