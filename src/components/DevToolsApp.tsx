import React, { useState, useEffect } from 'react';
import { Code, Terminal, Activity, FileText, Copy, Check, Info, Cpu, Zap, RotateCw } from 'lucide-react';
import { AppFileCode } from '../types';
import { highlightCode } from '../utils';

interface DevToolsAppProps {
  activePayloadReq: any;
  activePayloadRes: any;
  activeLatency: number;
  availableFiles: string[];
  onFetchFile: (file: string) => Promise<string>;
}

export default function DevToolsApp({
  activePayloadReq,
  activePayloadRes,
  activeLatency,
  availableFiles,
  onFetchFile
}: DevToolsAppProps) {
  const [tab, setTab] = useState<'payloads' | 'code' | 'perf'>('code');
  
  // File Code state
  const [selectedFile, setSelectedFile] = useState<string>('server.ts');
  const [fileContent, setFileContent] = useState<string>('');
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Copy indicator
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch codebase files
  const loadFileCode = async (fileName: string) => {
    setIsFileLoading(true);
    setFileError(null);
    try {
      const code = await onFetchFile(fileName);
      setFileContent(code);
    } catch (err: any) {
      setFileError("Fayl kodini yuklab bo'lmadi: " + err.message);
    } finally {
      setIsFileLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'code') {
      loadFileCode(selectedFile);
    }
  }, [tab, selectedFile]);

  const handleCopy = () => {
    let textToCopy = '';
    if (tab === 'payloads') {
      textToCopy = JSON.stringify({ request: activePayloadReq, response: activePayloadRes }, null, 2);
    } else if (tab === 'code') {
      textToCopy = fileContent;
    } else {
      textToCopy = `Latency: ${activeLatency}ms`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 select-none font-sans">
      {/* Dev Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-400 font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>devConsole_v1.0.sh</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[10px] bg-slate-800 hover:bg-slate-700 font-medium px-2 py-1 rounded transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Nusxa olindi</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Nusxa olish</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs selectors inside phone */}
      <div className="grid grid-cols-3 bg-slate-900/60 border-b border-slate-800 text-[10px] font-medium">
        <button
          onClick={() => setTab('code')}
          className={`py-2 px-1 flex items-center justify-center space-x-1 cursor-pointer transition ${
            tab === 'code' ? 'text-blue-400 bg-slate-950 border-b border-blue-500' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Code className="w-3 h-3" />
          <span>Tizim Kodi</span>
        </button>
        <button
          onClick={() => setTab('payloads')}
          className={`py-2 px-1 flex items-center justify-center space-x-1 cursor-pointer transition ${
            tab === 'payloads' ? 'text-blue-400 bg-slate-950 border-b border-blue-500' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>API Payload</span>
        </button>
        <button
          onClick={() => setTab('perf')}
          className={`py-2 px-1 flex items-center justify-center space-x-1 cursor-pointer transition ${
            tab === 'perf' ? 'text-blue-400 bg-slate-950 border-b border-blue-500' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Tezlik</span>
        </button>
      </div>

      {/* Tab Area */}
      <div className="flex-1 overflow-hidden">
        {/* CODE TREE / CODE EXPLORER TAB */}
        {tab === 'code' && (
          <div className="flex flex-col h-full">
            {/* File List Header */}
            <div className="p-2 bg-slate-900/40 border-b border-slate-800/80 overflow-x-auto whitespace-nowrap flex space-x-1.5 scrollbar-none">
              {availableFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`text-[9px] px-2 py-1 rounded font-mono transition cursor-pointer shrink-0 ${
                    selectedFile === file
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700/60'
                  }`}
                >
                  {file.substring(file.lastIndexOf('/') + 1)}
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-3 bg-slate-950 font-mono text-[9px] leading-relaxed scrollbar-thin">
              {isFileLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 space-y-2">
                  <RotateCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Kodni yuklash...</span>
                </div>
              ) : fileError ? (
                <div className="p-4 text-rose-400 border border-rose-500/20 bg-rose-500/5 rounded-lg text-xs leading-relaxed">
                  <Info className="w-4 h-4 mb-1.5" />
                  {fileError}
                </div>
              ) : (
                <div className="w-full">
                  {highlightCode(fileContent, selectedFile.endsWith('.json') ? 'json' : 'javascript').map((tokens, lineIdx) => (
                    <div key={lineIdx} className="table-row">
                      <span className="table-cell text-slate-600 select-none text-right pr-2 w-5 font-mono text-[8px]">
                        {lineIdx + 1}
                      </span>
                      <span className="table-cell whitespace-pre">
                        {tokens.map((t, tIdx) => {
                          let colorClass = 'text-slate-300';
                          if (t.type === 'keyword') colorClass = 'text-blue-400 font-semibold';
                          if (t.type === 'string') colorClass = 'text-emerald-400';
                          if (t.type === 'comment') colorClass = 'text-slate-500 italic';
                          if (t.type === 'number') colorClass = 'text-amber-400';
                          if (t.type === 'function') colorClass = 'text-yellow-300';
                          if (t.type === 'operator') colorClass = 'text-purple-400';
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
              )}
            </div>
          </div>
        )}

        {/* API PAYLOAD (JSON VIEW) */}
        {tab === 'payloads' && (
          <div className="h-full overflow-y-auto p-3 space-y-4 scrollbar-thin">
            {!activePayloadReq ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 space-y-3 px-4">
                <Terminal className="w-8 h-8 text-slate-600" />
                <p className="text-xs">API so'rov tahlili bo'sh.</p>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
                  SmartAI bilan yozishganingizda, real vaqtda yuborilgan @google/genai JSON payloadlari shu yerda paydo bo'ladi.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-[9px] font-mono leading-relaxed">
                {/* Latency card */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <span className="block text-slate-400 text-[8px]">API Kechikishi</span>
                      <span className="block font-bold text-slate-200">{activeLatency} ms</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 text-[8px]">Tizim Turi</span>
                    <span className="text-emerald-400 font-semibold">Barcha sohalarni biluvchi AI</span>
                  </div>
                </div>

                {/* Request Payload block */}
                <div>
                  <h4 className="text-[10px] font-semibold text-blue-400 mb-1 px-1 flex items-center space-x-1 font-sans">
                    <span>⚡ REQUEST PAYLOAD (Gemini 3.5-Flash):</span>
                  </h4>
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-slate-300">
                    {JSON.stringify(activePayloadReq, null, 2)}
                  </pre>
                </div>

                {/* Response Payload block */}
                <div>
                  <h4 className="text-[10px] font-semibold text-emerald-400 mb-1 px-1 flex items-center space-x-1 font-sans">
                    <span>✅ RESPONSE PAYLOAD (Google GenAI Result):</span>
                  </h4>
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-slate-305 text-emerald-300/90">
                    {JSON.stringify(activePayloadRes, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE (LATENCY GRAPHS) */}
        {tab === 'perf' && (
          <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-slate-400 text-[8px] uppercase">So'nggi Kechikish</span>
                <span className="block text-lg font-mono font-bold text-emerald-400 mt-1">{activeLatency || 0} ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-slate-400 text-[8px] uppercase">Model turi</span>
                <span className="block text-xs font-mono font-bold text-blue-400 mt-2">3.5-Flash</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3">
              <h4 className="font-semibold text-slate-100 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Nima uchun Gemini-3.5-Flash shunchalik tez?</span>
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-400">
                Google-ning 3.5-Flash modeli yuqori darajada parallel arxitekturaga va optimize qilingan server-side asinxron hisoblash qobiliyatiga ega.
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-slate-950 p-2 rounded-lg font-mono">
                <div>• Time To First Token:</div>
                <div className="text-emerald-400 text-right">~15ms</div>
                <div>• Token Generation Speed:</div>
                <div className="text-emerald-400 text-right">~120 tokens/sec</div>
                <div>• Memory Footprint:</div>
                <div className="text-emerald-400 text-right">Ultra-light</div>
              </div>
            </div>

            {/* Simulated Speed Performance Meter */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Speed Efficiency Rating:</span>
                <span className="font-semibold text-emerald-400 font-mono">99.8% (EXCELLENT)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[99.8%] animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
