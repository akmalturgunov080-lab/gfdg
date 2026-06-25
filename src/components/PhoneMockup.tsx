import React, { useState, useEffect } from 'react';
import { Sparkles, Code, Settings, Wifi, Battery, Sun, Moon, Volume2, Home, Compass, Terminal } from 'lucide-react';
import { PhoneApp, PhoneSettings } from '../types';

interface PhoneMockupProps {
  settings: PhoneSettings;
  activeApp: PhoneApp;
  onAppChange: (app: PhoneApp) => void;
  onUpdateSettings?: (settings: PhoneSettings) => void;
  children: React.ReactNode;
}

export default function PhoneMockup({
  settings,
  activeApp,
  onAppChange,
  onUpdateSettings,
  children
}: PhoneMockupProps) {
  const [time, setTime] = useState<string>('07:34');
  const [dateStr, setDateStr] = useState<string>('Payshanba, 11 iyun');

  // Trigger synthesized tactile click sound
  const playTactileSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch tick
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // Very soft
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05); // Rapid decay
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay restrictions ignored
    }
  };

  // Keep simulated time updated
  useEffect(() => {
    const updateTime = () => {
      const parsed = new Date();
      const hrs = parsed.getHours().toString().padStart(2, '0');
      const mins = parsed.getMinutes().toString().padStart(2, '0');
      setTime(`${hrs}:${mins}`);
      
      // Uzbek date string format
      const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
      const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
      setDateStr(`${days[parsed.getDay()]}, ${parsed.getDate()} ${months[parsed.getMonth()]}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 30000); // 30s updates
    return () => clearInterval(interval);
  }, []);

  const handleAppLaunch = (app: PhoneApp) => {
    playTactileSound();
    onAppChange(app);
  };

  const handleHomeBtn = () => {
    playTactileSound();
    onAppChange('home');
  };

  // Map theme IDs to actual border color rings
  const themeAccentColors = {
    emerald: 'border-emerald-500 text-emerald-400',
    cyan: 'border-cyan-500 text-cyan-400',
    amber: 'border-amber-500 text-amber-400',
    indigo: 'border-indigo-500 text-indigo-400',
    rose: 'border-rose-500 text-rose-400'
  };

  const activeColor = themeAccentColors[settings.themeColor];

  return (
    <div className="relative group max-w-[340px] w-full mx-auto select-none">
      
      {/* Front / Back View Quick-Toggler HUD */}
      <div className="flex items-center justify-center space-x-1.5 mb-3 bg-slate-900/80 px-2 py-1 rounded-2xl border border-slate-800 shadow-lg w-fit mx-auto">
        <button
          onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, phoneView: 'front' })}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 ${
            settings.phoneView === 'front' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📱 Oldi (Ekran)</span>
        </button>
        <button
          onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, phoneView: 'back' })}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 ${
            settings.phoneView === 'back' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📷 Orqa (Kamera)</span>
        </button>
      </div>

      {settings.phoneView === 'back' ? (
        /* REAR PREMIUM AJIB DEVICE VIEW */
        <div className="relative rounded-[50px] p-2.5 bg-black border-[8px] border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-emerald-950/20">
          
          {/* Side physical button decorations */}
          <div className="absolute -left-1 top-24 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
          <div className="absolute -left-1 top-38 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
          <div className="absolute -right-1 top-28 w-1 h-12 bg-slate-800 rounded-l border-l border-slate-700"></div>

          {/* Core Rear Shell Chassis Panel */}
          <div className="relative rounded-[32px] overflow-hidden aspect-[9/18.5] bg-gradient-to-b from-[#111e1d] via-[#152e2a] to-[#0b1413] border border-emerald-950/50 flex flex-col items-center justify-between p-6">
            
            {/* Gloss light reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 pointer-events-none"></div>

            {/* Vertical Dual Premium Camera Module Stack */}
            <div className="mt-8 flex items-start justify-center space-x-5 w-full">
              
              {/* Twin Lens Base */}
              <div className="flex flex-col space-y-3.5 items-center bg-black/40 p-2.5 rounded-[30px] border border-white/5 shadow-2xl backdrop-blur-sm">
                
                {/* Primary Large Circle Lens */}
                <div className="w-16 h-16 rounded-full bg-[#141617] border-2 border-slate-700/80 flex items-center justify-center shadow-lg relative">
                  <div className="w-[84%] h-[84%] rounded-full bg-gradient-to-tr from-stone-950 to-stone-900 flex items-center justify-center border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border border-teal-500/20 flex items-center justify-center relative">
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-950/80 relative border border-slate-900">
                        <div className="absolute top-0.5 left-0.5 w-[5px] h-[5px] rounded-full bg-teal-400"></div>
                      </div>
                    </div>
                  </div>
                  {/* Chrome rim tag */}
                  <span className="absolute -bottom-1.5 bg-black px-1.5 py-0.5 rounded text-[5.5px] font-mono text-slate-400 scale-90 border border-slate-800">50MP</span>
                </div>

                {/* Secondary Large Circle Lens */}
                <div className="w-16 h-16 rounded-full bg-[#141617] border-2 border-slate-700/80 flex items-center justify-center shadow-lg relative">
                  <div className="w-[84%] h-[84%] rounded-full bg-gradient-to-tr from-stone-950 to-stone-900 flex items-center justify-center border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border border-purple-500/20 flex items-center justify-center relative">
                      <div className="w-3.5 h-3.5 rounded-full bg-violet-950/80 relative border border-slate-900">
                        <div className="absolute top-0.5 left-0.5 w-[5px] h-[5px] rounded-full bg-cyan-400 font-bold"></div>
                      </div>
                    </div>
                  </div>
                  <span className="absolute -bottom-1.5 bg-black px-1.5 py-0.5 rounded text-[5.5px] font-mono text-slate-400 scale-90 border border-slate-800">TELE</span>
                </div>

              </div>

              {/* Vertical Amber LED Dual Flash Strip */}
              <div className="flex flex-col items-center mt-3">
                <div className="w-3.5 h-9 rounded-full bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-500 border border-amber-600 shadow-inner flex flex-col justify-around items-center py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                </div>
                <span className="text-[6.5px] text-slate-500 font-bold font-mono tracking-widest mt-1">FLASH</span>
              </div>

            </div>

            {/* Central Brushed Silver Minimalist Triangle Logo */}
            <div className="my-auto flex flex-col items-center justify-center space-y-1">
              <span className="text-4xl text-slate-300 font-light tracking-tighter filter drop-shadow select-none">▲</span>
              <span className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">Premium Design</span>
            </div>

            {/* Bottom Premium Branded Identity exactly as shown in picture */}
            <div className="mb-6 flex flex-col items-center space-y-1 select-none">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg text-slate-300 font-medium">▲</span>
                <span className="text-xl font-bold tracking-tight text-white font-sans lowercase">ajib</span>
              </div>
              <span className="text-[7.5px] text-emerald-400/80 tracking-widest font-mono uppercase">Designed by Ajib Electronics</span>
            </div>

          </div>
        </div>
      ) : (
        /* FRONT PREMIUM DEVICE/SCREEN VIEW */
        <div className="relative rounded-[50px] p-2.5 bg-black border-[8px] border-slate-850 shadow-2xl transition-all duration-500 hover:shadow-indigo-950/20">
          
          {/* Custom Waterdrop Notch (No thick bar, match user picture) */}
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-10 h-5 bg-black rounded-b-2xl z-50 border-x border-b border-neutral-900 shadow-md flex items-end justify-center pb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#05060b] border border-neutral-800 flex items-center justify-center relative">
              <div className="w-1 h-1 rounded-full bg-blue-500/85">
                <div className="absolute top-0 w-0.5 h-0.5 rounded-full bg-white opacity-90"></div>
              </div>
            </div>
          </div>

          {/* Side physical button decorations */}
          <div className="absolute -left-1 top-24 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
          <div className="absolute -left-1 top-38 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
          <div className="absolute -right-1 top-28 w-1 h-12 bg-slate-800 rounded-l border-l border-slate-700"></div>

          {/* Inner Screen Panel */}
          <div 
            className="relative rounded-[32px] overflow-hidden aspect-[9/18.5] flex flex-col bg-slate-950 font-sans shadow-2xl"
            style={{ opacity: settings.brightness / 100 }}
          >
            {/* Wallpaper Layer with support for procedural fluid glass orb artwork */}
            {settings.wallpaper === 'ajib_fluid_glass' ? (
              <div className="absolute inset-0 z-0 bg-[#060a12] overflow-hidden">
                {/* Organic fluid loops / color gradients */}
                <div className="absolute top-[8%] left-[-20%] w-[140%] h-[55%] rounded-full bg-gradient-to-br from-pink-500/30 via-purple-600/15 to-blue-500/25 blur-[35px] animate-pulse duration-8500"></div>
                <div className="absolute bottom-[12%] right-[-15%] w-[110%] h-[60%] rounded-full bg-gradient-to-tr from-cyan-400/20 via-teal-500/15 to-indigo-600/30 blur-[45px]"></div>
                <div className="absolute top-[38%] right-[-10%] w-[80%] h-[40%] rounded-full bg-rose-500/15 blur-[30px]"></div>

                {/* Central glossy translucent glass marble/sphere reflecting the elements */}
                <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 w-44 h-44 z-20 flex items-center justify-center pointer-events-none">
                  {/* Soft background light projection */}
                  <div className="absolute w-48 h-48 rounded-full bg-cyan-400/10 blur-xl animate-pulse"></div>
                  
                  {/* Glossy Sphere Body */}
                  <div className="relative w-40 h-40 rounded-full bg-white/5 border border-white/20 shadow-[inset_0_-10px_20px_rgba(255,255,255,0.12),_inset_0_4px_12px_rgba(255,255,255,0.22),_0_15px_30px_rgba(0,0,0,0.55)] backdrop-blur-[4px] overflow-hidden">
                    {/* Swirled warp overlay */}
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-pink-500/35 via-blue-600/30 to-teal-400/35 mix-blend-color-dodge opacity-95 blur-[1px]"></div>
                    {/* Lighting reflections */}
                    <div className="absolute top-2 left-6 w-24 h-12 rounded-full bg-white/25 rotate-[-20deg] blur-[0.5px]"></div>
                    <div className="absolute bottom-3 right-6 w-16 h-8 rounded-full bg-cyan-300/10 rotate-[20deg] blur-[1px]"></div>
                    <div className="absolute inset-4 rounded-full border border-white/5 bg-radial-gradient from-transparent to-black/25"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 z-0">
                <img 
                  src={settings.wallpaper} 
                  alt="Wallpaper" 
                  className="w-full h-full object-cover transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"></div>
              </div>
            )}

            {/* Device Status Bar */}
            <div className="relative z-40 h-8 px-5 flex items-center justify-between text-[10px] text-slate-200 font-medium bg-black/10 select-none">
              <span className="font-mono text-[9px]">{time}</span>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Wifi className="w-2.8 h-2.8 text-emerald-400" />
                <div className="flex items-center space-x-0.5">
                  <span className="text-[8px] font-mono">{settings.batteryLevel}%</span>
                  <Battery className="w-3.5 h-3.5 rotate-90 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Screen Content Area */}
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
              {activeApp === 'home' ? (
                /* HOME SCREEN GRID WITH AJIB PERSONALITY */
                <div className="flex-1 flex flex-col justify-between p-5 text-slate-100">
                  
                  {/* Clock Widget */}
                  <div className="mt-6 text-center space-y-1">
                    <h1 className="text-4xl font-light tracking-tight text-white font-sans">
                      {time}
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase">
                      {dateStr}
                    </p>
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-slate-800/40 text-[9px] text-emerald-450 font-medium">
                      <Sparkles className="w-2.5 h-2.5 fill-current animate-pulse text-emerald-400" />
                      <span>Ajib SmartAI faol va mukammal</span>
                    </div>
                  </div>

                  {/* Icon Matrix Grid */}
                  <div className="grid grid-cols-3 gap-y-4 gap-x-2 my-auto px-1.5">
                    
                    {/* Chat AI */}
                    <button
                      onClick={() => handleAppLaunch('chat')}
                      className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-150">
                        <Sparkles className="w-6 h-6 fill-current group-hover/app:scale-110 transition" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-200 text-center tracking-wide block">
                        SmartAI
                      </span>
                    </button>

                    {/* Code Interpreter */}
                    <button
                      onClick={() => handleAppLaunch('interpreter')}
                      className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150">
                        <Terminal className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-200 text-center tracking-wide block">
                        Kod Tahlil
                      </span>
                    </button>

                    {/* Developer Options */}
                    <button
                      onClick={() => handleAppLaunch('devtools')}
                      className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800/60 flex items-center justify-center text-blue-400 shadow-md active:scale-95 transition-all duration-150">
                        <Code className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-200 text-center tracking-wide block">
                        devConsole
                      </span>
                    </button>

                    {/* System Settings */}
                    <button
                      onClick={() => handleAppLaunch('settings')}
                      className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800/60 flex items-center justify-center text-slate-305 shadow-md active:scale-95 transition-all duration-150">
                        <Settings className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-200 text-center tracking-wide block">
                        Sozlamalar
                      </span>
                    </button>

                  </div>

                  {/* Dock Container */}
                  <div className="p-2 py-2.5 rounded-3xl bg-black/40 border border-slate-800/50 backdrop-blur-md flex items-center justify-around space-x-1 shadow-inner">
                    <button
                      onClick={() => handleAppLaunch('chat')}
                      className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-emerald-400"
                    >
                      <Sparkles className="w-4.5 h-4.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAppLaunch('interpreter')}
                      className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-blue-400"
                    >
                      <Terminal className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleAppLaunch('devtools')}
                      className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-slate-400"
                    >
                      <Code className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleAppLaunch('settings')}
                      className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-slate-405"
                    >
                      <Settings className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>
              ) : (
                /* MOUNTED APP CONTEXT */
                <div className="flex-1 overflow-hidden relative">
                  {children}
                </div>
              )}
            </div>

            {/* Virtual Bottom Home Control Bar */}
            <div className="relative z-50 h-6 bg-black/15 flex items-center justify-center">
              <button
                onClick={handleHomeBtn}
                className="w-24 h-1 bg-slate-300 rounded-full hover:bg-white cursor-pointer active:scale-95 transition-all duration-250 py-0.5"
                title="Bosh sahifaga qaytish"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
