import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Copy, Check, Zap, Play, HelpCircle } from 'lucide-react';
import { Message } from '../types';
import { parseMarkdownBlocks, highlightCode } from '../utils';

interface SmartAIChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => Promise<void>;
  hasApiKey: boolean;
  onSelectPayload: (req: any, res: any, latency: number) => void;
}

const PRESET_PROMPTS = [
  { label: '💻 Kod yozish', text: 'JavaScript-da ikki sonni xavfsiz ayiradigan va hisoblash tezligini o\'lchaydigan funksiya kodi va uning izohini yozib ber.' },
  { label: '🧠 Matematika', text: 'Kvadrat tenglamani yechish algoritmini (ax² + bx + c = 0) tushuntirib bering va u bo\'yicha o\'zbekcha kod yozing.' },
  { label: '🌍 Tarjima', text: 'Eng foydali 5 ta dasturlash atamalarini o\'zbek tiliga chiroyli va tushunarli qilib tarjima qilib ber.' },
  { label: '🔥 Ma\'lumot', text: 'Gemini 3.5-Flash modeli nima uchun tez ishlaydi va uning afzalliklari nimada?' }
];

export default function SmartAIChat({
  messages,
  isLoading,
  onSendMessage,
  hasApiKey,
  onSelectPayload
}: SmartAIChatProps) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const textToSend = input;
    setInput('');
    onSendMessage(textToSend);
  };

  const handlePresetClick = (text: string) => {
    if (isLoading) return;
    onSendMessage(text);
  };

  const handleCopyText = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1E293B] text-slate-200 font-sans select-none pt-4">
      {/* App Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#1E293B] border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">OmniCore</h3>
            <span className="text-[9px] text-slate-400 block font-sans">v4.2.0 Online</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          {!hasApiKey && (
            <span className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-300/20 text-[9px] px-1.5 py-0.5 rounded-full font-medium animate-pulseScale">
              <Zap className="w-2.5 h-2.5" />
              <span>Demo rejim</span>
            </span>
          )}
        </div>
      </div>

      {/* API Warn banner if missing API key */}
      {!hasApiKey && messages.length === 0 && (
        <div className="p-2.5 mx-3 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-[11px] mb-0.5">Secrets Kaliti Topilmadi</span>
            Siz demo rejimidasiz. Haqiqiy javoblarni olish uchun tepadagi panel yoki o'ng burchakdagi Secrets menyusiga <b>GEMINI_API_KEY</b> ni xavfsiz qo'shing.
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 px-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Nima so'ramoqchisiz?</h4>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                Men o'ta tezkor sun'iy intellektman. So'ragan kodingizni, hisob-kitoblar va barcha savollaringizni bilaman.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4 text-left">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset.text)}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 active:bg-slate-900 transition text-left cursor-pointer"
                >
                  <span className="block text-[11px] font-bold text-blue-400 mb-0.5">
                    {preset.label}
                  </span>
                  <span className="block text-[9px] text-slate-300 line-clamp-2 leading-snug">
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div className={`max-w-[85%] rounded-2xl p-3 shadow-lg ${
                    isUser 
                      ? 'bg-blue-600 text-white rounded-tr-none text-xs font-semibold' 
                      : 'bg-slate-700 border border-slate-600/55 text-slate-200 rounded-tl-none text-xs'
                  }`}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed select-text">{msg.text}</div>
                    ) : (
                      <div className="space-y-3 select-text">
                        {parseMarkdownBlocks(msg.text).map((block, bIdx) => {
                          if (block.type === 'code') {
                            const blockId = `${msg.id}-block-${bIdx}`;
                            return (
                              <div key={bIdx} className="my-2 border border-slate-700/60 rounded-lg overflow-hidden bg-slate-950 font-mono text-[10px]">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[9px] text-slate-400 font-sans">
                                  <span>{block.language.toUpperCase()}</span>
                                  <button
                                    onClick={() => handleCopyText(block.content, blockId)}
                                    className="flex items-center space-x-1 py-0.5 px-1.5 rounded hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                                  >
                                    {copiedId === blockId ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Nusxalandi!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Nusxa olish</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="p-2.5 overflow-x-auto leading-relaxed max-h-56 scrollbar-thin">
                                  {highlightCode(block.content, block.language).map((tokens, lineIdx) => (
                                    <div key={lineIdx} className="table-row">
                                      <span className="table-cell text-slate-600 select-none text-right pr-2 w-5 font-mono text-[9px]">
                                        {lineIdx + 1}
                                      </span>
                                      <span className="table-cell whitespace-pre-wrap">
                                        {tokens.map((t, tIdx) => {
                                          let colorClass = 'text-slate-300';
                                          if (t.type === 'keyword') colorClass = 'text-pink-400 font-semibold';
                                          if (t.type === 'string') colorClass = 'text-emerald-300';
                                          if (t.type === 'comment') colorClass = 'text-slate-500 italic';
                                          if (t.type === 'number') colorClass = 'text-amber-400';
                                          if (t.type === 'function') colorClass = 'text-blue-400';
                                          if (t.type === 'operator') colorClass = 'text-cyan-400';
                                          return (
                                            <span key={tIdx} className={colorClass}>
                                              {t.value}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={bIdx} className="whitespace-pre-wrap leading-relaxed select-text font-sans text-xs">
                              {block.content}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Metadata line beneath bubble (only for model responses or debugging payload) */}
                  {!isUser && (
                    <div className="flex items-center space-x-2 mt-1 px-1 text-[10px] text-slate-400">
                      <span className="font-mono flex items-center space-x-0.5 text-emerald-400">
                        <Zap className="w-2.5 h-2.5" />
                        <span>{msg.latencyMs ? `${msg.latencyMs}ms` : 'fast'}</span>
                      </span>
                      <span>•</span>
                      <button
                        onClick={() => onSelectPayload(msg.requestPayload, msg.responsePayload, msg.latencyMs || 0)}
                        className="text-[9px] text-blue-400 hover:underline cursor-pointer flex items-center space-x-0.5 font-sans"
                      >
                        <span>Kod/API ko'rish ↗</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Loading/Thinking skeleton */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-sm p-3 border border-slate-800/80 shadow">
                  <div className="flex items-center space-x-1.5 py-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2 animate-pulse">
                      Javob tayyorlanmoqda...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Formulation form */}
      <form onSubmit={handleSubmit} className="p-4 pb-8 bg-[#1E293B] border-t border-slate-700/30 flex-shrink-0">
        <div className="bg-slate-900/90 border border-slate-700 rounded-full flex items-center px-3 pl-4 py-1 gap-2 shadow-inner">
          <span className="text-slate-500 text-lg cursor-default select-none font-medium pr-0.5">+</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Har qanday narsani so&apos;rang..."
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-200 placeholder-slate-500"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="text-sm font-bold">↑</span>
          </button>
        </div>
      </form>
    </div>
  );
}
