import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi there! I am NutriZen AI. How can I help you with your diet today?' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMsg = { role: 'user', text: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    
    try {
      const response = await axios.post('https://nutrizen-2ozq.onrender.com/api/chat', {
        message: userMsg.text,
        history: messages
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 flex items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center text-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Dietitian AI</h3>
                  <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFDFD]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white rounded-br-sm shadow-sm font-medium' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-sm font-medium leading-relaxed shadow-sm'
                  }`}>
                    <p className="text-[13px]">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-slate-400">
                     <Loader2 size={16} className="animate-spin" />
                     <span className="text-xs font-medium">Typing...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-full shadow-sm focus-within:ring-2 ring-emerald-500/20 transition-all">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:outline-none px-4 text-sm text-slate-800 placeholder-slate-400 font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
