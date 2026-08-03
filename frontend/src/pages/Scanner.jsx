import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useNavigate } from 'react-router-dom';

const Scanner = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const codeReader = useRef(new BrowserMultiFormatReader());

  const handleScan = useCallback((result) => {
    if (result && result.text && isScanning) {
      const scannedText = result.text.trim();
      setLastScan(scannedText); // Show the user what it saw
      console.log("ZXing Scanned:", scannedText);
      
      // Accept any barcode string longer than 4 characters (prevents 1-letter garbage scans)
      if (scannedText.length > 4) {
        setIsScanning(false);
        if (navigator.vibrate) navigator.vibrate(100);
        navigate(`/product/${scannedText}`);
      }
    }
  }, [isScanning, navigate]);

  useEffect(() => {
    let animationFrameId;
    const scan = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        try {
          const videoEl = webcamRef.current.video;
          const result = codeReader.current.decodeFromVideoElement(videoEl);
          handleScan(result);
        } catch (err) {
          if (!(err instanceof NotFoundException)) {
            console.error("Barcode scanning error:", err);
          }
        }
      }
      if (isScanning) {
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      navigate(`/product/${manualCode.trim()}`);
    }
  };

  return (
    <div id="view-scanner" className="screen-view active space-y-8 max-w-xl mx-auto">
      
      <div className="text-center space-y-2">
        <h2 className="font-display font-bold text-3xl text-slate-800 dark:text-slate-100 tracking-tight">System Barcode Scanner</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Align the physical food barcode within the illuminated laser guides below</p>
      </div>

      {/* Simulator Camera Viewport Screen */}
      <div className="relative aspect-square w-full bg-slate-950 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl flex flex-col items-center justify-center select-none group">
        
        {/* Animated Mock Camera Background */}
        <div className="absolute inset-0 opacity-45 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 animate-[pulseSoft_2.5s_infinite_ease-in-out]"></div>
        </div>

        {hasPermission === false ? (
          <div className="text-center p-6 text-red-400 z-10">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h3 className="font-bold mb-2">Camera Access Denied</h3>
            <p className="text-sm">Please enable camera permissions.</p>
          </div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              onUserMedia={() => setHasPermission(true)}
              onUserMediaError={() => setHasPermission(false)}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Scanning Guide Target Frame */}
            <div className="relative w-72 h-44 border border-white/20 rounded-2xl flex flex-col justify-between p-4 bg-black/30 backdrop-blur-sm shadow-inner overflow-hidden z-10">
              
              {/* Moving Laser Scan Line */}
              <div className="scanner-line absolute left-0 right-0 h-1 bg-emerald-400 w-full animate-[laser_2.2s_infinite_ease-in-out]"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-xl"></div>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="pt-6">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 text-center">Or enter barcode manually</label>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input 
            type="text" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. 5449000000996" 
            className="flex-1 px-4 py-3 rounded-xl glass-input font-mono text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button type="submit" className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
            Lookup
          </button>
        </div>
      </form>
    </div>
  );
};

export default Scanner;
