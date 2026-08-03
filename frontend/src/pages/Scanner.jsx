import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const Scanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState(null);
  const [manualCode, setManualCode] = useState('');
  
  // Persist a single reader instance across renders
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Handle successful scan
  const handleScan = useCallback((result) => {
    if (result && result.text && isScanning) {
      const scannedText = result.text.trim();
      setLastScan(scannedText); // Show the user what it saw
      console.log("ZXing Scanned:", scannedText);
      
      // Accept any barcode string longer than 4 characters
      if (scannedText.length > 4) {
        setIsScanning(false);
        if (navigator.vibrate) navigator.vibrate(100);
        navigate(`/product/${scannedText}`);
      }
    }
  }, [isScanning, navigate]);

  // Native ZXing camera initialization
  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        if (!mounted) return;
        
        let selectedDeviceId;
        
        // Prefer back camera ("environment")
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          selectedDeviceId = backCamera.deviceId;
        } else if (videoInputDevices.length > 0) {
          // Fallback to the last device (often the back camera on mobile)
          selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
        }

        // Let ZXing handle the continuous decode loop natively
        codeReader.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (mounted && isScanning && result) {
              handleScan(result);
            }
          }
        );
        
        setHasPermission(true);
      } catch (err) {
        console.error("Camera startup error:", err);
        setHasPermission(false);
      }
    };

    if (isScanning) {
      startScanner();
    }

    return () => {
      mounted = false;
      // Properly shuts down camera tracks and terminates decoder
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [isScanning, handleScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim().length > 4) {
      setIsScanning(false);
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
      <div className="relative w-full max-w-sm mx-auto rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl h-[360px] bg-slate-950">
        
        {hasPermission === false ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 relative z-10 bg-slate-950">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h3 className="font-bold mb-2">Camera Access Denied</h3>
            <p className="text-sm">Please enable camera permissions.</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover z-0"
              muted
              playsInline
            />
            
            {/* Scanning Guide Target Frame Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 sm:w-72 h-40 sm:h-44 border border-white/20 rounded-2xl flex flex-col justify-between p-4 bg-black/10 backdrop-blur-[2px] shadow-inner overflow-hidden">
                {/* Moving Laser Scan Line */}
                <div className="scanner-line absolute left-0 right-0 h-1 bg-emerald-400 w-full animate-[laser_2.2s_infinite_ease-in-out]"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-xl"></div>
              </div>
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
