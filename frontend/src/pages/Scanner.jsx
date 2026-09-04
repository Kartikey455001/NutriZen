import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException
} from '@zxing/library';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Camera, AlertTriangle, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

const Scanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Status states: 'initializing' | 'scanning' | 'permission_denied' | 'not_found' | 'error'
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedCode, setDetectedCode] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Synchronous scan lock to prevent duplicate scans
  const scanLockedRef = useRef(false);
  const activeStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const codeReaderRef = useRef(null);
  const detectorRef = useRef(null);

  // Stop camera tracks and cleanup
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore track cleanup errors
        }
      });
      activeStreamRef.current = null;
    }
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch {
        // ignore reset errors
      }
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle successful detection
  const handleBarcodeDetected = useCallback((rawCode) => {
    if (scanLockedRef.current) return;
    const code = String(rawCode).trim();
    if (!code || code.length < 4) return;

    // Lock synchronously to prevent multiple scans
    scanLockedRef.current = true;
    setDetectedCode(code);

    if (navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {
        // ignore vibration failure
      }
    }

    // Stop camera immediately
    stopCamera();

    // Visual feedback before navigation
    setTimeout(() => {
      navigate(`/product/${code}`);
    }, 400);
  }, [navigate, stopCamera]);

  // Start camera and continuous scanner
  const startScanner = useCallback(async () => {
    stopCamera();
    scanLockedRef.current = false;
    setDetectedCode(null);
    setCameraStatus('initializing');
    setErrorMessage('');

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('error');
      setErrorMessage('Camera access requires a secure HTTPS connection or a supported modern browser.');
      return;
    }

    // Initialize ZXing Multi-Format Reader with retail barcode hints
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.ITF,
      BarcodeFormat.QR_CODE
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints, 200);
    codeReaderRef.current = reader;

    // Acquire stream with progressive constraints
    let stream = null;
    try {
      try {
        // Prefer environment/back camera with ideal HD resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Environment camera constraint failed, falling back to default video constraint:', firstErr);
        // Fallback to any available video input
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      activeStreamRef.current = stream;

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setCameraStatus('scanning');

      // Initialize hardware-accelerated BarcodeDetector if available
      let nativeDetector = null;
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          nativeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code']
          });
          detectorRef.current = nativeDetector;
        } catch (e) {
          console.warn('Native BarcodeDetector not initialized:', e);
        }
      }

      // Continuous decoding loop
      // Combines native BarcodeDetector (if available) with ZXing continuous reader
      try {
        reader.decodeFromStream(stream, videoRef.current, (result, err) => {
          if (scanLockedRef.current) return;
          if (result && result.getText()) {
            handleBarcodeDetected(result.getText());
          } else if (err && !(err instanceof NotFoundException)) {
            // Non-not-found error
          }
        });
      } catch (readerErr) {
        console.warn('ZXing decodeFromStream error:', readerErr);
      }

      // If native BarcodeDetector is available, run high-speed check alongside ZXing
      if (nativeDetector) {
        const detectNativeFrame = async () => {
          if (scanLockedRef.current || !videoRef.current) return;
          const video = videoRef.current;
          if (video.readyState >= 2) {
            try {
              const barcodes = await nativeDetector.detect(video);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                handleBarcodeDetected(barcodes[0].rawValue);
                return;
              }
            } catch {
              // frame decode ignore
            }
          }
          if (!scanLockedRef.current) {
            animFrameRef.current = requestAnimationFrame(detectNativeFrame);
          }
        };
        animFrameRef.current = requestAnimationFrame(detectNativeFrame);
      }

    } catch (err) {
      console.error('Camera initialization failed:', err);
      stopCamera();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('permission_denied');
        setErrorMessage('Camera access was blocked. Please enable camera permissions in your browser settings to scan barcodes.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('not_found');
        setErrorMessage('No camera device was detected on your system. You can enter the barcode number manually below.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraStatus('error');
        setErrorMessage('Camera is currently in use by another application or tab.');
      } else {
        setCameraStatus('error');
        setErrorMessage(err.message || 'Failed to initialize camera. Please try again or enter the barcode manually.');
      }
    }
  }, [stopCamera, handleBarcodeDetected]);

  useEffect(() => {
    startScanner();
    return () => {
      stopCamera();
    };
  }, [startScanner, stopCamera]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (clean.length > 4) {
      stopCamera();
      navigate(`/product/${clean}`);
    }
  };

  const handleSampleClick = (code) => {
    setManualCode(code);
    stopCamera();
    navigate(`/product/${code}`);
  };

  // Image upload fallback: decode barcode from photo
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      let foundCode = null;

      // Try native BarcodeDetector first if available
      if (detectorRef.current) {
        try {
          const img = new Image();
          img.src = imageUrl;
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
          });
          const detected = await detectorRef.current.detect(img);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            foundCode = detected[0].rawValue;
          }
        } catch {
          // fallback to ZXing
        }
      }

      // Fallback to ZXing reader
      if (!foundCode && codeReaderRef.current) {
        try {
          const zxingRes = await codeReaderRef.current.decodeFromImageUrl(imageUrl);
          if (zxingRes && zxingRes.getText()) {
            foundCode = zxingRes.getText();
          }
        } catch {
          // not found in image
        }
      }

      URL.revokeObjectURL(imageUrl);

      if (foundCode) {
        handleBarcodeDetected(foundCode);
      } else {
        alert('Could not detect a clear barcode in the selected image. Please try a clearer picture or enter the code manually.');
      }
    } catch (imgErr) {
      console.error('Image decode error:', imgErr);
      alert('Failed to process image. Please enter the barcode manually.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div id="view-scanner" className="screen-view active space-y-6 max-w-xl mx-auto px-2 sm:px-0">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> BACK
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full font-semibold">
          AI Dietary Core
        </span>
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 tracking-tight">
          System Barcode Scanner
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
          Align the physical food barcode within the illuminated laser guides below
        </p>
      </div>

      {/* Camera Viewport Screen */}
      <div className="relative w-full max-w-sm mx-auto rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl h-[360px] bg-slate-950 flex items-center justify-center">
        
        {/* State 1: Initializing */}
        {cameraStatus === 'initializing' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 p-6 text-center space-y-3 z-20">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <h3 className="font-bold text-base text-white">Initializing camera...</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Please allow camera access when prompted by your browser.
            </p>
          </div>
        )}

        {/* State 2: Permission Denied */}
        {cameraStatus === 'permission_denied' && (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center space-y-3 z-20 bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Camera size={24} />
            </div>
            <h3 className="font-bold text-base text-white">Camera Access Blocked</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={startScanner}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        )}

        {/* State 3: Not Found */}
        {cameraStatus === 'not_found' && (
          <div className="flex flex-col items-center justify-center h-full text-amber-400 p-6 text-center space-y-3 z-20 bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera size={24} />
            </div>
            <h3 className="font-bold text-base text-white">No Camera Detected</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={startScanner}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              <RefreshCw size={14} /> Check Again
            </button>
          </div>
        )}

        {/* State 4: Generic Error */}
        {cameraStatus === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center space-y-3 z-20 bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-base text-white">Camera Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={startScanner}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Video stream element (always mounted so refs stay bound) */}
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
            cameraStatus === 'scanning' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Scanning Guide Target Frame Overlay */}
        {cameraStatus === 'scanning' && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-between p-6">
            
            {/* Status indicator top pill */}
            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-medium text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Point your camera at a barcode
            </div>

            {/* Target Reticle */}
            <div className="relative w-64 sm:w-72 h-40 sm:h-44 border border-white/20 rounded-2xl flex flex-col justify-between p-4 bg-black/10 backdrop-blur-[1px] shadow-inner overflow-hidden">
              {/* Moving Laser Scan Line */}
              <div className="scanner-line absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] w-full animate-[laser_2.2s_infinite_ease-in-out]"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-xl"></div>
            </div>

            {/* Barcode detected confirmation badge */}
            {detectedCode ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl shadow-xl animate-bounce">
                <CheckCircle2 size={16} /> Barcode: {detectedCode}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-white/60 tracking-wider">
                EAN-13 • UPC-A • EAN-8 • UPC-E
              </span>
            )}
          </div>
        )}
      </div>

      {/* File Upload Option */}
      <div className="flex items-center justify-center pt-1">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingImage}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800"
        >
          {isProcessingImage ? (
            <>
              <Loader2 size={14} className="animate-spin text-emerald-500" />
              Scanning photo...
            </>
          ) : (
            <>
              <Upload size={14} />
              Scan from photo / image file
            </>
          )}
        </button>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleManualSubmit} className="pt-2">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 text-center">
          Or enter barcode manually
        </label>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input 
            type="text" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. 5449000000996" 
            className="flex-1 px-4 py-3 rounded-xl glass-input font-mono text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Lookup
          </button>
        </div>
      </form>

      {/* Sample barcodes for quick testing */}
      <div className="pt-2 text-center space-y-2">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Quick test samples:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleSampleClick('5449000000996')}
            className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            5449000000996 (Coca-Cola)
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick('8901234567890')}
            className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            8901234567890 (Test EAN-13)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scanner;

