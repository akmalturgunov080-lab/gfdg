import React from 'react';
import { Smartphone, Palette, ShieldAlert, Wifi, Battery, Volume2, HelpCircle, HardDrive, Cpu } from 'lucide-react';
import { PhoneSettings } from '../types';

interface PhoneSettingsAppProps {
  settings: PhoneSettings;
  onUpdateSettings: (settings: PhoneSettings) => void;
  hasApiKey: boolean;
}

const WALLPAPERS = [
  { name: 'Midnight Cosmic', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80' },
  { name: 'Aurora Borealis', url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=600&q=80' },
  { name: 'Neon Cyberpunk', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Abstract Emerald', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80' }
];

const THEME_COLORS: { id: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose'; name: string; bg: string }[] = [
  { id: 'emerald', name: 'Zümrad', bg: 'bg-emerald-500' },
  { id: 'cyan', name: 'Firuza', bg: 'bg-cyan-500' },
  { id: 'amber', name: 'Alanga', bg: 'bg-amber-500' },
  { id: 'indigo', name: 'Kosmos', bg: 'bg-indigo-500' },
  { id: 'rose', name: 'Tilla', bg: 'bg-rose-500' }
];

export default function PhoneSettingsApp({
  settings,
  onUpdateSettings,
  hasApiKey
}: PhoneSettingsAppProps) {
  
  const handleThemeChange = (color: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose') => {
    onUpdateSettings({ ...settings, themeColor: color });
  };

  const handleWallpaperChange = (url: string) => {
    onUpdateSettings({ ...settings, wallpaper: url });
  };

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans select-none overflow-y-auto scrollbar-none pb-4">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-850">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold">Tizim Sozlamalari</h2>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Connection Status Section */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-2">
          <h3 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">Tarmoq va Xavfsizlik</h3>
          
          <div className="flex items-center justify-between py-1 border-b border-slate-700/40">
            <span className="text-slate-300">Tizim Tarmoqi:</span>
            <div className="flex items-center space-x-1 font-mono text-[10px] text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>100% (5G FAST)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-300">Gemini API status:</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              hasApiKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
            }`}>
              {hasApiKey ? 'FAOL (Ulandi)' : 'Kalit mavjud emas'}
            </span>
          </div>
        </div>

        {/* Wallpaper Picker */}
        <div className="space-y-2">
          <h3 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Palette className="w-3.5 h-3.5" />
            <span>Ekran Fonlari (Wallpaper)</span>
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            {WALLPAPERS.map((wall) => {
              const active = settings.wallpaper === wall.url;
              return (
                <button
                  key={wall.name}
                  onClick={() => handleWallpaperChange(wall.url)}
                  className={`relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                    active ? 'border-emerald-500 scale-102 shadow-md shadow-emerald-500/15' : 'border-slate-800'
                  }`}
                  title={wall.name}
                >
                  <img src={wall.url} alt={wall.name} className="w-full h-full object-cover" />
                  {active && (
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                      <span className="bg-emerald-500 text-slate-950 p-0.5 rounded-full text-[8px] font-bold">✔</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">Aksent Ranglar</h3>
          <div className="flex items-center space-x-2">
            {THEME_COLORS.map((col) => {
              const isActive = settings.themeColor === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => handleThemeChange(col.id)}
                  className={`h-8 flex-1 rounded-xl cursor-pointer ${col.bg} transition-all duration-300 ${
                    isActive ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={col.name}
                >
                  <span className="text-[9px] font-bold text-slate-950 leading-none">
                    {isActive ? '✔' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Mobile Acceleration Engine Controls */}
        <div className="p-3 rounded-xl bg-slate-800/85 border border-slate-700/60 space-y-3">
          <h3 className="font-bold text-[11px] text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>AI mobil tezlashtirish</span>
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-350 block">Mavjud ishlash rejimi:</label>
            <div className="grid grid-cols-3 gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, speedProfile: 'performance_saver' })}
                className={`p-1.5 rounded-lg border text-[9px] font-bold text-center transition cursor-pointer ${
                  settings.speedProfile === 'performance_saver'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Batareya quvvatini tejash, qisqa tezkor javoblar"
              >
                Tejamkor
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, speedProfile: 'balanced' })}
                className={`p-1.5 rounded-lg border text-[9px] font-bold text-center transition cursor-pointer ${
                  settings.speedProfile === 'balanced'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Muvozanatlangan tezlik va chuqurlik"
              >
                Muvozanat
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, speedProfile: 'all_out_power' })}
                className={`p-1.5 rounded-lg border text-[9px] font-bold text-center transition cursor-pointer ${
                  settings.speedProfile === 'all_out_power'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Maksimal aniqlik va kengaytirilgan kod tahlili"
              >
                Maksimal
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-705/30 pt-2">
            <span className="text-slate-300">GPU/NPU Hardware Acceleration:</span>
            <button
              onClick={() => onUpdateSettings({ ...settings, neuralCoreTurbo: !settings.neuralCoreTurbo })}
              className={`text-[9px] px-2 py-1 rounded-lg border font-mono transition cursor-pointer ${
                settings.neuralCoreTurbo 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-slate-900 border-transparent text-slate-500'
              }`}
            >
              {settings.neuralCoreTurbo ? 'TURBO ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-300">Instant Prompt Caching (0ms):</span>
            <button
              onClick={() => onUpdateSettings({ ...settings, onDeviceCache: !settings.onDeviceCache })}
              className={`text-[9px] px-2 py-1 rounded-lg border font-mono transition cursor-pointer ${
                settings.onDeviceCache 
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-450' 
                  : 'bg-slate-900 border-transparent text-slate-500'
              }`}
            >
              {settings.onDeviceCache ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Device Controls */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-3">
          <h3 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">Mobl va Ovoz Nazorati</h3>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Ovoz (Click tovushi):</span>
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border cursor-pointer transition ${
                settings.soundEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Ekran Yorug'ligi (Brightness):</span>
              <span>{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ ...settings, brightness: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded"
            />
          </div>
        </div>

        {/* Specs */}
        <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <h3 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Smartfon Texnik Ma'lumotlari</span>
          </h3>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between"><span className="text-slate-500">Model:</span> <span>SmartAI Phone Ultra</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Protsessor:</span> <span>Dual-Core Neural Engine</span></div>
            <div className="flex justify-between"><span className="text-slate-500">RAM:</span> <span>16GB LPDDR5X</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tizim:</span> <span>Vite + React OS 19</span></div>
          </div>
        </div>

        {/* Explanatory Credits */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] leading-relaxed flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
          <div>
            <b>"Kodini ko'rish" haqida:</b> Chatdagi har bir javob tagida uchrashadigan va tepadagi o'ng paneldagi "API Payload" va "Tizim kodi" bo'limi orqali siz real API so'rovlarni, xatoliklarni hamda butun dasturni harakatga keltiruvchi ssenariylarni to'liq kuzatishingiz mumkin.
          </div>
        </div>
      </div>
    </div>
  );
}
