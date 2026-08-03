import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Product from './pages/Product';
import ChatAssistant from './components/ChatAssistant';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      {/* Navbar goes here, it's sticky and outside main */}
      <Navbar />
      
      {/* Main Multi-view Router Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/product/:barcode" element={<Product />} />
        </Routes>
      </main>
      
      <ChatAssistant />
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
