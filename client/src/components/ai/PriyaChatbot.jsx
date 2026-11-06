import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, ShieldCheck, Heart } from 'lucide-react';
import { aiService } from '../../services/api';

export const PriyaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 Main Priya hoon, aapki BL Jewels stylist. Whether you need wedding trousseau styling, Hallmark purity guidance, or gifting suggestions, I am here to assist you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const QUICK_QUESTIONS = [
    '✨ Wedding Choker Suggestions',
    '👑 22K vs 18K Gold Purity Guide',
    '💍 Diamond Solitaire Engagement',
    '📿 Auspicious Mangalsutras',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(newMessages);
      if (res.success && res.message) {
        setMessages([...newMessages, { role: 'assistant', content: res.message }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: "At BL Jewels, every piece is BIS 916 certified. Would you like me to recommend our Maya Royal Kundan Choker or Auspicious Swarna Mangalsutra?",
          },
        ]);
      }
    } catch {
      // Local graceful styling fallback
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Namaste! Our master karigars craft each design with 100% BIS 916 certified gold. You can explore our bridal chokers or solitaire rings with lifetime buyback guarantee.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#930303] via-[#7A0303] to-[#5C0202] text-white shadow-lg shadow-[#930303]/40 border-2 border-gold-300 flex items-center justify-center hover:scale-105 transition-all duration-300"
          title="Chat with Priya — BL Jewels Stylist"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-gold-400/30 animate-ping -z-10" />
          
          <div className="relative">
            <Sparkles className="w-6 h-6 text-gold-300" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          </div>

          {/* Hover tooltip */}
          <span className="absolute right-16 bg-charcoal text-pearl text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            Chat with Priya • Jewelry Stylist
          </span>
        </button>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[520px] bg-pearl rounded-2xl shadow-2xl border border-gold-300/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#930303] via-[#7A0303] to-[#5C0202] text-white p-4 flex items-center justify-between border-b border-gold-400/40">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gold-500/20 border border-gold-300 flex items-center justify-center text-gold-200">
                <Sparkles className="w-5 h-5 text-gold-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#930303]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-accent text-sm font-bold tracking-wider">
                    PRIYA
                  </h3>
                  <span className="text-[10px] bg-gold-400/20 text-gold-200 px-1.5 py-0.2 rounded font-body">
                    AI Stylist
                  </span>
                </div>
                <p className="text-[11px] text-gold-200/90 font-body">
                  BL Jewels Fine Jewelry Expert
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gold-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hallmark Trust Notice */}
          <div className="bg-gold-50/90 px-4 py-1.5 border-b border-gold-200/60 flex items-center justify-center gap-1.5 text-[11px] text-gold-900 font-body">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>Official BIS 916 Hallmark Advice & Sizing Support</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pearl">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#930303] text-gold-300 flex items-center justify-center shrink-0 border border-gold-400/40 text-xs">
                    P
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-body leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#930303] text-white rounded-tr-none'
                      : 'bg-white text-stone-800 rounded-tl-none border border-border-light shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-[#930303] text-gold-300 flex items-center justify-center text-xs">
                  P
                </div>
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none border border-border-light shadow-sm flex items-center gap-1.5 text-stone-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-ivory/80 border-t border-border-light overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap text-[11px] bg-white hover:bg-gold-50 border border-gold-200/80 px-2.5 py-1 rounded-pill text-stone-700 font-body transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-border-light flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Priya about gold, bridal sets, sizing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-pearl border border-border-light rounded-xl px-3 py-2 text-xs text-charcoal placeholder-stone-400 focus:outline-none focus:border-gold-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#930303] hover:bg-[#7A0303] disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

