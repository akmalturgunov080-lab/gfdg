export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  latencyMs?: number;
  isMocked?: boolean;
  requestPayload?: any;
  responsePayload?: any;
}

export type PhoneApp = 'home' | 'chat' | 'devtools' | 'settings' | 'browser' | 'interpreter';

export interface PhoneSettings {
  wallpaper: string;
  themeColor: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose';
  soundEnabled: boolean;
  brightness: number;
  batteryLevel: number;
  speedProfile: 'performance_saver' | 'balanced' | 'all_out_power';
  neuralCoreTurbo: boolean;
  onDeviceCache: boolean;
}

export interface AppFileCode {
  file: string;
  content: string;
}

export interface MetricPoint {
  time: string;
  latency: number;
}
