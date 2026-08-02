import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Product from './pages/Product';
import ChatAssistant from './components/ChatAssistant';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="font-sans text-slate-900 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/product/:barcode" element={<Product />} />
        </Routes>
        <ChatAssistant />
        <Toaster position="bottom-center" />
      </div>
    </Router>
  );
}

export default App;
