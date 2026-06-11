import React, { useState, useEffect } from 'react';
import { Sparkles, Code, Settings, Wifi, Battery, Sun, Moon, Volume2, Home, Compass, Terminal } from 'lucide-react';
import { PhoneApp, PhoneSettings } from '../types';

interface PhoneMockupProps {
  settings: PhoneSettings;
  activeApp: PhoneApp;
  onAppChange: (app: PhoneApp) => void;
  children: React.ReactNode;
}

export default function PhoneMockup({
  settings,
  activeApp,
  onAppChange,
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
      {/* Outer Phone Bezel / Glass case representation */}
      <div className="relative rounded-[50px] p-2.5 bg-black border-[8px] border-slate-850 shadow-2xl transition-all duration-500 hover:shadow-indigo-950/20">
        
        {/* Dynamic Island / Device Notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-50 flex items-center justify-between px-3 px-3.5 border border-slate-900 shadow-inner">
          <div className="w-1.5 h-1.5 bg-indigo-950 rounded-full border border-slate-900 flex items-center justify-center">
            <div className="w-0.5 h-0.5 bg-blue-500/80 rounded-full animate-pulse"></div>
          </div>
          <span className="text-[7.5px] font-semibold font-mono text-slate-500">OmniCore OS</span>
          <div className="w-1 h-1 bg-neutral-900 rounded-full"></div>
        </div>

        {/* Side physical button decorations */}
        <div className="absolute -left-1 top-24 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
        <div className="absolute -left-1 top-38 w-1 h-10 bg-slate-800 rounded-r border-r border-slate-700"></div>
        <div className="absolute -right-1 top-28 w-1 h-12 bg-slate-800 rounded-l border-l border-slate-700"></div>

        {/* Inner LCD / TFT Screen Container shadow */}
        <div 
          className="relative rounded-[32px] overflow-hidden aspect-[9/18.5] flex flex-col bg-slate-950 font-sans shadow-2xl"
          style={{ opacity: settings.brightness / 100 }}
        >
          {/* Wallpaper Asset Wrapper */}
          <div className="absolute inset-0 z-0">
            <img 
              src={settings.wallpaper} 
              alt="Wallpaper" 
              className="w-full h-full object-cover transition-all duration-700" 
            />
            {/* Dark glass backdrop filter over wallpaper */}
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"></div>
          </div>

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

          {/* Screen Content Window */}
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            {activeApp === 'home' ? (
              /* HOME SCREEN APPGRID */
              <div className="flex-1 flex flex-col justify-between p-5 text-slate-100">
                {/* Dynamic Clock Widget */}
                <div className="mt-6 text-center space-y-1">
                  <h1 className="text-4xl font-light tracking-tight text-white font-sans">
                    {time}
                  </h1>
                  <p className="text-[10px] font-medium text-slate-300/90 tracking-wide uppercase">
                    {dateStr}
                  </p>
                  <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-slate-800/40 text-[9px] text-emerald-400">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    <span>SmartAI faol va tayyor</span>
                  </div>
                </div>

                {/* App Grid Launcher */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 my-auto px-1.5">
                  {/* SmartAI Chat app shortcut */}
                  <button
                    onClick={() => handleAppLaunch('chat')}
                    className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-150">
                      <Sparkles className="w-6 h-6 fill-current group-hover/app:scale-110 transition" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-200 text-center tracking-wide block">
                      SmartAI
                    </span>
                  </button>

                  {/* Code Interpreter App shortcut */}
                  <button
                    onClick={() => handleAppLaunch('interpreter')}
                    className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150">
                      <Terminal className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-200 text-center tracking-wide block">
                      Kod Tahlil
                    </span>
                  </button>

                  {/* DevTools inspection app shortcut */}
                  <button
                    onClick={() => handleAppLaunch('devtools')}
                    className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800/60 flex items-center justify-center text-blue-400 shadow-md active:scale-95 transition-all duration-150">
                      <Code className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-200 text-center tracking-wide block">
                      devConsole
                    </span>
                  </button>

                  {/* System Settings App shortcut */}
                  <button
                    onClick={() => handleAppLaunch('settings')}
                    className="flex flex-col items-center space-y-1 cursor-pointer group/app"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800/60 flex items-center justify-center text-slate-300 shadow-md active:scale-95 transition-all duration-150">
                      <Settings className="w-5.5 h-5.5 group-hover/app:scale-110 transition" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-200 text-center tracking-wide block">
                      Sozlamalar
                    </span>
                  </button>
                </div>

                {/* Bottom Dock Rails */}
                <div className="p-2 py-2.5 rounded-3xl bg-black/40 border border-slate-800/50 backdrop-blur-md flex items-center justify-around space-x-1">
                  <button
                    onClick={() => handleAppLaunch('chat')}
                    className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-emerald-500"
                    title="Chaqqon AI"
                  >
                    <Sparkles className="w-4.5 h-4.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleAppLaunch('interpreter')}
                    className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-blue-500"
                    title="Code Interpreter"
                  >
                    <Terminal className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleAppLaunch('devtools')}
                    className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-slate-400"
                    title="Dastur kodi"
                  >
                    <Code className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleAppLaunch('settings')}
                    className="p-1.5 rounded-xl transition hover:bg-slate-800/50 text-slate-400"
                    title="Sozlamalar"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE MOUNTED APPLICATION BODY */
              <div className="flex-1 overflow-hidden relative">
                {children}
              </div>
            )}
          </div>

          {/* Virtual iOS Glass Home Button Bar */}
          <div className="relative z-50 h-6 bg-black/15 flex items-center justify-center">
            <button
              onClick={handleHomeBtn}
              className="w-24 h-1 bg-slate-300 rounded-full hover:bg-white cursor-pointer active:scale-95 transition-all duration-250 py-0.5"
              title="Bosh sahifaga qaytish"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
