import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Code, Terminal, Activity, HelpCircle, HardDrive, 
  Cpu, RotateCw, Copy, Check, Info, Landmark, Lightbulb, ExternalLink
} from 'lucide-react';
import { Message, PhoneApp, PhoneSettings } from './types';
import PhoneMockup from './components/PhoneMockup';
import SmartAIChat from './components/SmartAIChat';
import DevToolsApp from './components/DevToolsApp';
import PhoneSettingsApp from './components/PhoneSettingsApp';
import CodeInterpreterApp from './components/CodeInterpreterApp';
import { highlightCode } from './utils';

const DEFAULT_WALLPAPER = "ajib_fluid_glass";

const CODE_FILES = [
  "server.ts",
  "src/App.tsx",
  "src/main.tsx",
  "package.json",
  "vite.config.ts",
  "metadata.json"
];

export default function App() {
  // Navigation & States
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeApp, setActiveApp] = useState<PhoneApp>('chat');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Smartphone personalization Settings
  const [settings, setSettings] = useState<PhoneSettings>({
    wallpaper: DEFAULT_WALLPAPER,
    themeColor: 'emerald',
    soundEnabled: true,
    brightness: 100,
    batteryLevel: 98,
    speedProfile: 'balanced',
    neuralCoreTurbo: true,
    onDeviceCache: true,
    phoneView: 'front'
  });

  // Active transaction payload for "Kodini ko'rish" / Cockpit displays
  const [activePayloadReq, setActivePayloadReq] = useState<any>(null);
  const [activePayloadRes, setActivePayloadRes] = useState<any>(null);
  const [activeLatency, setActiveLatency] = useState<number>(0);
  
  // Cockpit view tabs on desktop (outside phone)
  const [cockpitTab, setCockpitTab] = useState<'payload' | 'source'>('source');
  const [cockpitFile, setCockpitFile] = useState<string>('server.ts');
  const [cockpitFileContent, setCockpitFileContent] = useState<string>('');
  const [isCockpitFileLoading, setIsCockpitFileLoading] = useState<boolean>(false);
  const [cockpitError, setCockpitError] = useState<string | null>(null);

  // General telemetry log
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "Tizim ishga tushirildi.",
    "SmartAI yig'ma moduli yuklandi.",
    "Port: 3000 asinxron eshitish jarayoni boshlandi."
  ]);

  // Copy indicators
  const [isCopiedCockpit, setIsCopiedCockpit] = useState<boolean>(false);

  // Check API status & setup initial payload metrics
  useEffect(() => {
    async function checkApiHealth() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
        addTelemetryLog(`Xavfsiz server-side aloqa o'rnatildi. API Kalit mavjudligi: ${data.hasApiKey ? 'HA' : 'YO\'Q (Demo)'}`);
      } catch (e: any) {
        console.error("Health check error:", e);
        addTelemetryLog("Server aloqa xatosi! Iltimos, server.ts ishlayotganini tekshiring.");
      }
    }
    checkApiHealth();
  }, []);

  // Fetch file code from backend
  const fetchFileContent = async (fileName: string): Promise<string> => {
    const res = await fetch(`/api/code?file=${fileName}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Faylni yuklashda xatolik");
    }
    const data = await res.json();
    return data.content;
  };

  // Helper to load file content specifically for Left-Side Expanded cockpit
  const loadCockpitFile = async (fileName: string) => {
    setIsCockpitFileLoading(true);
    setCockpitError(null);
    try {
      const content = await fetchFileContent(fileName);
      setCockpitFileContent(content);
    } catch (err: any) {
      setCockpitError(err.message);
    } finally {
      setIsCockpitFileLoading(false);
    }
  };

  // Load selected source file initially or when file tab changes
  useEffect(() => {
    if (cockpitTab === 'source') {
      loadCockpitFile(cockpitFile);
    }
  }, [cockpitTab, cockpitFile]);

  // Telemetry logger
  const addTelemetryLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 50)]);
  };

  // Process prompt submission from smartphone
  const handleSendMessage = async (text: string) => {
    setIsLoading(true);
    addTelemetryLog(`AI so'rov yuborildi: "${text.substring(0, 25)}${text.length > 25 ? '...' : ''}"`);

    // Prepare history payload
    const historyPayload = messages.map(m => ({
      role: m.role,
      text: m.text
    }));

    // Optimistically push user message inside screen
    const userMsgId = 'user-' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMsg]);

    // Battery simulation effect
    setSettings(prev => ({
      ...prev,
      batteryLevel: Math.max(10, prev.batteryLevel - (Math.random() > 0.6 ? 1 : 0))
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: text,
          history: historyPayload,
          speedProfile: settings.speedProfile
        })
      });

      if (!response.ok) {
        throw new Error("Server xatosi: " + response.statusText);
      }

      const data = await response.json();

      // Formulate assistant message with received data
      const assistantMsg: Message = {
        id: 'model-' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: new Date(),
        latencyMs: data.latencyMs,
        isMocked: data.isMocked,
        requestPayload: data.requestPayload,
        responsePayload: data.responsePayload
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Update cockpit/DevTools live payload viewer immediately on response
      setActivePayloadReq(data.requestPayload);
      setActivePayloadRes(data.responsePayload);
      setActiveLatency(data.latencyMs);

      addTelemetryLog(`Javob muvaffaqiyatli qabul qilindi. Tezlik: ${data.latencyMs}ms. Model: Gemini 3.5-Flash.`);

    } catch (err: any) {
      console.error(err);
      addTelemetryLog(`Xato yuz berdi: ${err.message}`);
      
      // Fallback error message inside chat
      const errorMsg: Message = {
        id: 'model-err-' + Date.now(),
        role: 'model',
        text: `Kechirasiz, aloqa o'rnatishda xatolik yuz berdi. Iltimos, internetingizni tekshiring yoki sozlangan API Key'ni qayta ko'ring.\n\nXatolik tafsiloti: ${err.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening raw API details directly inside desktop Dev cockpit
  const handleSelectPayload = (req: any, res: any, latency: number) => {
    setActivePayloadReq(req);
    setActivePayloadRes(res);
    setActiveLatency(latency);
    setCockpitTab('payload');
  };

  const handleCopyCockpitCode = () => {
    let copyText = '';
    if (cockpitTab === 'source') {
      copyText = cockpitFileContent;
    } else {
      copyText = JSON.stringify({ request: activePayloadReq, response: activePayloadRes }, null, 2);
    }
    navigator.clipboard.writeText(copyText);
    setIsCopiedCockpit(true);
    setTimeout(() => setIsCopiedCockpit(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans select-none overflow-x-hidden md:h-screen relative">
      
      {/* Background Decorative Gradient Glows */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-purple-600 rounded-full blur-[180px]"></div>
      </div>

      {/* Top Main Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800/80 py-4 px-6 flex items-center justify-between shadow-lg shrink-0 z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <Sparkles className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-widest uppercase">OMNICORE AI WORKBENCH</h1>
            <p className="text-[10px] text-slate-400 font-medium">Barcha sohalarni biluvchi o&apos;ta tezkor mobil neyron yordamchisi</p>
          </div>
        </div>

        {/* Global specs badge */}
        <div className="hidden lg:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-400">Server Port: <b className="text-slate-200 font-mono">3000</b></span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-slate-400">Engine: <b className="text-slate-200 font-mono">Gemini-3.5</b></span>
          </div>
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden z-10 relative">
        
        {/* LEFT WORKSPACE PANELS (EXPANDED DEVELOPER COCKPIT) */}
        <section className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-md border-r border-slate-800/80 overflow-hidden min-w-[320px]">
          
          {/* Header select tab row */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-905 border-b border-slate-800 shrink-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setCockpitTab('source')}
                className={`text-[11px] font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  cockpitTab === 'source'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Loyiha Kodlari</span>
              </button>
              
              <button
                onClick={() => setCockpitTab('payload')}
                className={`text-[11px] font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  cockpitTab === 'payload'
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Canli API Call (JSON)</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={handleCopyCockpitCode}
              disabled={cockpitTab === 'payload' && !activePayloadReq}
              className="px-3 py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-755/60 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed font-medium"
            >
              {isCopiedCockpit ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Nusxa olindi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kodni Nusxalash</span>
                </>
              )}
            </button>
          </div>

          {/* Tab Screen Output display */}
          <div className="flex-1 overflow-hidden relative bg-slate-950/80">
            
            {/* SOURCE WORKSPACE TAB */}
            {cockpitTab === 'source' && (
              <div className="h-full flex flex-col">
                {/* File tab switcher panel */}
                <div className="p-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center space-x-2 shrink-0 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase tracking-widest">Fayllar:</span>
                  {CODE_FILES.map((file) => (
                    <button
                      key={file}
                      onClick={() => setCockpitFile(file)}
                      className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                        cockpitFile === file
                          ? 'bg-blue-600/15 text-blue-400 border-blue-500/30 font-semibold shadow-inner'
                          : 'bg-slate-900 border-slate-800/80 text-slate-450 hover:bg-slate-800/60'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                {/* File syntax highlight sandbox */}
                <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text scrollbar-thin">
                  {isCockpitFileLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-405 py-20 space-y-3">
                      <RotateCw className="w-7 h-7 animate-spin text-blue-400" />
                      <span className="text-xs font-medium text-slate-505">Fayl tizim kodi o&apos;qilmoqda...</span>
                    </div>
                  ) : cockpitError ? (
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 max-w-md mx-auto mt-10">
                      <Info className="w-5 h-5 mb-2 text-rose-400" />
                      <h4 className="font-semibold mb-1">Yuklashda xatolik</h4>
                      <p className="text-xs">{cockpitError}</p>
                    </div>
                  ) : (
                    <div className="table w-full">
                      {highlightCode(cockpitFileContent, cockpitFile.endsWith('.json') ? 'json' : 'typescript').map((tokens, idx) => (
                        <div key={idx} className="table-row">
                          <span className="table-cell text-slate-600 select-none text-right pr-4 w-8 font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="table-cell whitespace-pre">
                            {tokens.map((t, tIdx) => {
                              let colorClass = 'text-slate-300';
                              if (t.type === 'keyword') colorClass = 'text-pink-400 font-semibold';
                              if (t.type === 'string') colorClass = 'text-emerald-400';
                              if (t.type === 'comment') colorClass = 'text-slate-500 italic';
                              if (t.type === 'number') colorClass = 'text-amber-400';
                              if (t.type === 'function') colorClass = 'text-blue-400';
                              if (t.type === 'operator') colorClass = 'text-purple-405';
                              return (
                                <span key={tIdx} className={colorClass}>{t.value}</span>
                              );
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE API CONSOLE TAB */}
            {cockpitTab === 'payload' && (
              <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {!activePayloadReq ? (
                  <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 py-16 px-6 space-y-4">
                    <Terminal className="w-12 h-12 text-slate-700" />
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">Hech qanday so&apos;rov kechmadi</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                        Smartfonda SmartAI yordamchisi bilan suhbat boshlang. Sohaga oid so&apos;rov yuborishingiz bilan, siz va Google GenAI serveri orasidagi asildagi JSON payload&apos;lari ushbu ekranda real-vaqtda kodi bilan tahlil qilinadi.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-[11px] font-mono leading-relaxed select-text">
                    
                    {/* Live stats summary */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-3 gap-4">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 tracking-wider">So&apos;nggi Kechikish</span>
                        <span className="block text-sm font-bold text-emerald-400 mt-0.5">{activeLatency} ms</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 tracking-wider">Ulanish</span>
                        <span className="block text-sm font-bold text-blue-400 mt-0.5">Asinxron Express</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 tracking-wider">Tanlangan Model</span>
                        <span className="block text-sm font-bold text-purple-400 mt-0.5">gemini-3.5-flash</span>
                      </div>
                    </div>

                    {/* Request JSON */}
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-blue-400 px-1 font-sans flex items-center space-x-1">
                        <span>⚡ Dastur Yuborgan Asil JSON So&apos;rov:</span>
                      </div>
                      <pre className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-x-auto text-slate-300">
                        {JSON.stringify(activePayloadReq, null, 2)}
                      </pre>
                    </div>

                    {/* Response JSON */}
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-emerald-400 px-1 font-sans flex items-center space-x-1">
                        <span>✅ Google Generative AI Qaytargan JSON Javobi:</span>
                      </div>
                      <pre className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-x-auto text-emerald-300/90">
                        {JSON.stringify(activePayloadRes, null, 2)}
                      </pre>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Live System Telemetry logger stream console */}
          <div className="h-32 bg-[#0F172A]/90 border-t border-slate-800/80 p-3 overflow-hidden flex flex-col font-mono text-[9px] text-slate-400 select-text shrink-0">
            <div className="text-[10px] uppercase font-bold text-blue-400 mb-1.5 shrink-0 flex items-center justify-between font-sans tracking-widest">
              <span>🖥️ SERVER LOG TIMELINE TELEMETRY_STREAM</span>
              <span className="text-[9px] text-slate-500 font-normal">Secure Connection (TLS 1.3)</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
              {telemetryLogs.map((log, lIdx) => (
                <div key={lIdx} className="leading-snug truncate flex items-start space-x-2">
                  <span className="text-emerald-500 font-semibold shrink-0">[OK]</span>
                  <span className="text-slate-305">{log}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT WORKSPACE PHONE SIMULATOR PANEL */}
        <section className="p-4 md:p-8 flex items-center justify-center bg-transparent overflow-y-auto scrollbar-thin md:max-w-md w-full shrink-0 z-10">
          
          <PhoneMockup 
            settings={settings} 
            activeApp={activeApp} 
            onAppChange={(app) => setActiveApp(app)}
            onUpdateSettings={setSettings}
          >
            {/* Conditional Smartphone Application Routing Rendering */}
            {activeApp === 'chat' && (
              <SmartAIChat
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                hasApiKey={hasApiKey}
                onSelectPayload={handleSelectPayload}
              />
            )}

            {activeApp === 'devtools' && (
              <DevToolsApp
                activePayloadReq={activePayloadReq}
                activePayloadRes={activePayloadRes}
                activeLatency={activeLatency}
                availableFiles={CODE_FILES}
                onFetchFile={fetchFileContent}
              />
            )}

            {activeApp === 'settings' && (
              <PhoneSettingsApp
                settings={settings}
                onUpdateSettings={(newSet) => setSettings(newSet)}
                hasApiKey={hasApiKey}
              />
            )}

            {activeApp === 'interpreter' && (
              <CodeInterpreterApp
                onSelectPayload={handleSelectPayload}
                speedProfile={settings.speedProfile}
              />
            )}
          </PhoneMockup>

        </section>

      </main>
    </div>
  );
}
