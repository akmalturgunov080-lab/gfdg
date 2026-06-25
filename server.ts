import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI securely (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  const hasApiKey = !!apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";
  
  const ai = hasApiKey ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasApiKey,
      timestamp: new Date().toISOString() 
    });
  });

  // 2. Chat with Gemini API (very fast via gemini-3.5-flash)
  app.post("/api/chat", async (req, res) => {
    const { prompt, history = [], speedProfile = 'balanced' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt bo'sh bo'lishi mumkin emas." });
    }

    const startTime = Date.now();
    const isPerformanceSaver = speedProfile === 'performance_saver';
    const isAllOutPower = speedProfile === 'all_out_power';

    // Set resource limitations dynamically depending on mobile speed configs
    const maxTokens = isPerformanceSaver ? 250 : isAllOutPower ? 4096 : 1500;
    const temp = isPerformanceSaver ? 0.35 : isAllOutPower ? 0.85 : 0.65;
    
    let speedHintInstruction = "Siz AJIB SmartAI deb nomlangan daho sun'iy intellektsiz. Dunyodagi barcha sohalarni (kod yozish, matematika, fizika, falsafa, tillar va adabiyotlar, san'at va boshqalar) mukammal darajada bilasiz. Foydalanuvchining har qanday va har sohadagi murakkab savollariga o'ta aniq, chuqur, mukammal va daho darajasida javoblar va chiroyli formatlangan to'liq kodlarni taqdim etasiz. Foydalanuvchi o'zbek tilida gaplashadi.";
    if (isPerformanceSaver) {
      speedHintInstruction += " DIQQAT: Hozirda quvvatni tejash rejimi faol. Shunga qaramasdan savolga eng to'g'ri, lo'nda va eng kerakli faktlardan iborat 1-3 jumlali javob qaytaring!";
    }

    // Prepare message contents format for Gemini list of messages
    const formattedContents: any[] = [];
    
    // Add history
    for (const msg of history) {
      formattedContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // Add current prompt
    formattedContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const modelName = "gemini-3.5-flash";

    // Prepare raw request representation for "kodini ko'rish" (seeing the code/payload)
    const requestPayload = {
      model: modelName,
      contents: formattedContents,
      config: {
        temperature: temp,
        maxOutputTokens: maxTokens,
        systemInstruction: speedHintInstruction
      }
    };

    // If API Key is not set or valid, use a super smart fast local mock response engine to keep the app functional
    if (!ai) {
      const mockResponses: { keywords: string[]; response: string }[] = [
        {
          keywords: ["kod", "function", "javascript", "python", "html", "css", "yoz"],
          response: "Mana siz so'ragan kod namunasi:\n\n```javascript\n// Ikki sonni qo'shuvchi tezkor funksiya\nfunction qoshish(a, b) {\n  return a + b;\n}\n\nconsole.log(qoshish(5, 7)); // 12\n```\nVa o'ta tezkor ishlash uchun React virtual DOM'dan foydalaniladi."
        },
        {
          keywords: ["salom", "assalom", "hello", "qalesiz", "qalaysiz"],
          response: "Assalomu alaykum! Men sizning telefoningiz ichidagi o'ta tez ishlovchi aqlli AI yordamchingizman. Men sizga hamma narsada: kod yozishda, savollarga javob berishda va hisob-kitoblarda yordam bera olaman!"
        },
        {
          keywords: ["kim", "yaratgan", "isming", "nima"],
          response: "Mening ismim SmartAI! Men Google AI Studio Build yordamida yaratilganman va o'ta tez ishlayman!"
        },
        {
          keywords: ["tezlik", "fast", "speed"],
          response: "Men soniyaning ulushlarida ishlayman! Chunki mening tizimim eng ilg'or arxitekturaga va to'g'ridan-to'g'ri server-side Gemini 3.5-Flash modeliga ulangan."
        }
      ];

      // Find keyword match
      let text = "Sizning so'rovingiz qabul qilindi! Menga juda ham yoqdi. Men hamma narsani bilaman. Haqiqiy AI javoblarini olish uchun Secrets panelida GEMINI_API_KEY ni sozlang. \n\nMana sizga tezkor javob:\nUshbu telefon mockup'i sizga real vaqtda API so'rovlarni va tizim kodini kuzatish imkonini beradi. Chap yoki o'ng paneldagi 'DevTools'ni ochib raw payloadlar va kodlarni ko'rishingiz mumkin!";
      
      const lowerPrompt = prompt.toLowerCase();
      for (const item of mockResponses) {
        if (item.keywords.some(kw => lowerPrompt.includes(kw))) {
          text = item.response;
          break;
        }
      }

      const latencyMs = Math.floor(Math.random() * 80) + 20; // 20-100ms ultra fast
      const responsePayload = {
        candidates: [{
          content: {
            parts: [{ text }]
          },
          finishReason: "STOP",
          index: 0
        }],
        usageMetadata: {
          promptTokenCount: Math.floor(prompt.length / 4) + 12,
          candidatesTokenCount: Math.floor(text.length / 4) + 10,
          totalTokenCount: Math.floor(prompt.length / 4) + Math.floor(text.length / 4) + 22
        }
      };

      return res.json({
        text,
        requestPayload,
        responsePayload,
        latencyMs,
        isMocked: true
      });
    }

    try {
      // Call standard server-side Gemini API
      const geminiResponse = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: requestPayload.config
      });

      const latencyMs = Date.now() - startTime;
      const text = geminiResponse.text || "Hech qanday javob qaytmadi.";

      // Send actual request, response alongside latency
      res.json({
        text,
        requestPayload,
        responsePayload: geminiResponse, // full response object from Gemini
        latencyMs,
        isMocked: false
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const latencyMs = Date.now() - startTime;
      res.status(500).json({
        error: "Gemini API chaqiruvida xatolik yuz berdi.",
        details: error.message,
        latencyMs,
        requestPayload
      });
    }
  });

  // 2b. Code Interpreter API Route
  app.post("/api/interpret", async (req, res) => {
    const { code, language, speedProfile = 'balanced' } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Tahlil qilish uchun kod kiritilmadi." });
    }

    const startTime = Date.now();
    const isPerformanceSaver = speedProfile === 'performance_saver';
    const isAllOutPower = speedProfile === 'all_out_power';

    // Set token limits depending on mobile speed optimization settings
    const maxTokens = isPerformanceSaver ? 250 : isAllOutPower ? 800 : 450;
    const modelName = "gemini-3.5-flash";

    // System instruction mapping out strict JSON schema and efficiency rules
    const systemInstruction = `Siz vaqt va xotirani ideal darajada tejovchi OmniCore mobil neyron yordamchisiz. Kiritilgan kodni o'qib, o'zbek tilida tahlil qiling.
Javobingiz to'liq va faqatgina mana shu JSON strukturasida chiqishi shart:
{
  "explanation": "Kodning umumiy vazifasi va logikasi haqida juda qisqa, lo'nda va tushunarli o'zbekcha sharh.",
  "bugs": [
    {
      "severity": "High" | "Medium" | "Low",
      "line": 0,
      "message": "Topilgan xatolik, cheksiz sikl, xotira oqishi, sintaksis nuqsonga qarshi tushuntirish."
    }
  ],
  "optimizationSuggestions": [
    "CPU, xotira yoki batareya quvvatini tejash bo'yicha o'zbekcha tavsiya (masalan, kesh, sikllarni qisqartirish, var o'rniga const/let, recurisya o'rniga iteratsiya)."
  ],
  "refactoredCode": "Optimallashtirilgan, mukammal va xatolardan xoli bo'lgan toza kod bloki."
}
Alohida eslatma: Hech qanday markdown \`\`\`json o'ramlarisiz, faqat toza JSON matnini qaytaring.`;

    const requestPayload = {
      model: modelName,
      contents: [{
        role: "user",
        parts: [{ text: `Mana tahlil etiladigan ${language} kodi:\n\n${code}` }]
      }],
      config: {
        temperature: 0.1, // more deterministic and faster
        maxOutputTokens: maxTokens,
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    };

    if (!ai) {
      // High-fidelity server-side lexical heuristic mock code analyzer
      const lowerCode = code.toLowerCase();
      const detectedBugs: any[] = [];
      const suggestions: string[] = [];
      let refactored = code;

      // 1. Syntactic analysis
      if (lowerCode.includes("recursive") || (lowerCode.includes("def ") && lowerCode.split("def ").length > 2)) {
        detectedBugs.push({
          severity: "Medium",
          line: code.split("\n").findIndex(l => l.includes("def") || l.includes("function")) + 1 || 1,
          message: "Recursion (rekursiya) chuqur stekni ishg'ol etib, StackOverflow xatoligini yoki yuqori xotira yuklamasini keltirib chiqarishi mumkin."
        });
        suggestions.push("Rekursiya o'rniga hot-loop davriy (iterative) yondashuvdan foydalaning (xotira sig'imi O(1) gacha tejaladi).");
      }

      if (lowerCode.includes("while (true)") || lowerCode.includes("while true")) {
        detectedBugs.push({
          severity: "High",
          line: code.split("\n").findIndex(l => l.includes("while")) + 1 || 1,
          message: "Check-point yetishmasligi sababli cheksiz tsikl (infinite loop) xavfi mavjud. CPU darhol 100% yuklanib, mobil batareya quvvatini tezda tugatadi."
        });
        suggestions.push("Tsikl ichiga mutlaq sinish (break) shartini yoki maksimal urinishlar limitini (max_retries) kiriting.");
      }

      if (lowerCode.includes("var ")) {
        detectedBugs.push({
          severity: "Low",
          line: code.split("\n").findIndex(l => l.includes("var ")) + 1 || 1,
          message: "'var' kalit so'zi global doirada o'zgaruvchilarni e'lon qilib xotirada qolib ketadi vaoqishlar (memory leaks) chaqiradi."
        });
        suggestions.push("Eldagi zamonaviy standartlar bo'yicha 'var' o'rniga 'const' yoki 'let' dan foydalaning.");
      }

      if (lowerCode.includes("eval(") || lowerCode.includes("exec(")) {
        detectedBugs.push({
          severity: "High",
          line: code.split("\n").findIndex(l => l.includes("eval") || l.includes("exec")) + 1 || 1,
          message: "Tizim kodini dinamik bajaruvchi eval/exec xavfsizlikka o'ta daxldor va SQL-injection kabi jiddiy zaifliklarni ochishi mumkun."
        });
        suggestions.push("Dinamik kod bajarish funksiyasini olib tashlang, xavfsiz JSON parser yoki strukturali xaritalardan foydalaning.");
      }

      if (detectedBugs.length === 0) {
        // Fallback low severity code advice
        detectedBugs.push({
          severity: "Low",
          line: 1,
          message: "Yaxshi yozilgan kod. Sintaksisda kritika topilmadi, lekin barcha parametrlarni keshga (memoization) joylash orqali unumdorlikni yana 2x ga oshirish mumkin."
        });
      }

      suggestions.push("Protsessor quvvatini va tarmoq trafigini tejash uchun ushbu algoritmni keshlab oling (Memoization pattern).");
      suggestions.push("Mobil ilovalarda katta ma'lumotlar massivi bilan ishlashda garbage collection yuklamasini kamaytirish uchun massivlarni qayta-qayta yaratmasdan (pool design) xotirani qayta ishlating.");

      // Quick Refactoring generator mimicking real AI
      if (language === 'javascript' || language === 'typescript') {
        refactored = `// Optimallashtirilgan va CPU tejamkor shakli\n// Caching va xavfsiz o'zgaruvchi scopes qo'llanildi\nconst memoCache = new Map();\n\nexport function optimizedCalc(input) {\n  if (memoCache.has(input)) return memoCache.get(input);\n  \n  // Hisoblash murakkabligi kamaytirildi\n  const result = input * 2.5; \n  memoCache.set(input, result);\n  return result;\n}`;
      } else if (language === 'python') {
        refactored = `# Optimallashtirilgan va xotirani tejovchi shakli\n# Rekursiya iteratsiyaga o'tkazildi\ndef optimized_fib(n):\n    if n < 0: return 0\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`;
      } else {
        refactored = `// Qayta ishlangan optimal va xotira oqishidan xoli kod\n${code}\n// Tahlil yakuni bo'yicha optimallashtirildi.`;
      }

      const explanation = `Ushbu kiritilgan ${language.toUpperCase()} kodi loyihani harakatlantiruvchi muayyan hisoblash yoki mantiqiy vazifani bajarishga qaratilgan. Uni tahlil qilganda mobil protsessor uchun unumdorlik xavflari (${detectedBugs.length} ta xavf) aniqlandi.`;

      const mockResponseObj = {
        explanation,
        bugs: detectedBugs,
        optimizationSuggestions: suggestions,
        refactoredCode: refactored
      };

      const latencyMs = Math.floor(Math.random() * 95) + 35; // 35-130ms near instantaneous

      return res.json({
        text: JSON.stringify(mockResponseObj),
        requestPayload,
        responsePayload: {
          candidates: [{
            content: { parts: [{ text: JSON.stringify(mockResponseObj) }] }
          }]
        },
        latencyMs,
        isMocked: true
      });
    }

    try {
      // Call actual server-side Gemini Model with optimized params
      const response = await ai.models.generateContent({
        model: modelName,
        contents: requestPayload.contents,
        config: requestPayload.config
      });

      const latencyMs = Date.now() - startTime;
      const responseText = response.text || "{}";

      // Secure cleanup to ensure the text contains valid JSON
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      res.json({
        text: cleanedText,
        requestPayload,
        responsePayload: response,
        latencyMs,
        isMocked: false
      });
    } catch (error: any) {
      console.error("Gemini Interpreter Error:", error);
      const latencyMs = Date.now() - startTime;
      res.status(500).json({
        error: "Kodni neyron tahlil qilishda xatolik yuz berdi.",
        details: error.message,
        latencyMs,
        requestPayload
      });
    }
  });

  // 3. Serve the code of current files securely for inspection ("kodini ko'rish")
  app.get("/api/code", async (req, res) => {
    const filePath = req.query.file as string;
    const allowedFiles = [
      "server.ts",
      "src/App.tsx",
      "src/main.tsx",
      "package.json",
      "vite.config.ts",
      "metadata.json"
    ];

    if (!filePath || !allowedFiles.includes(filePath)) {
      return res.status(403).json({ 
        error: "Ruxsat etilmagan fayl yo'li yoki fayl nomi so'ralmadi." 
      });
    }

    try {
      const absolutePath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(absolutePath, "utf-8");
      res.json({
        file: filePath,
        content
      });
    } catch (err: any) {
      res.status(500).json({ error: "Faylni o'qib bo'lmadi: " + err.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server start failure:", err);
});
