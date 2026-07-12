import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body size limit for base64 images
app.use(express.json({ limit: "15mb" }));

// Enable CORS for all API endpoints to support PWAs and installed APKs
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

// Helper to extract base64 data from data URI
function parseBase64Image(dataURI: string) {
  const matches = dataURI.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data URI");
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

// Helper to call generateContent with retry and exponential backoff
async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, maxRetries = 4) {
  let delay = 1000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling Gemini API (Attempt ${attempt}/${maxRetries})...`);
      const response = await aiClient.models.generateContent(params);
      return response;
    } catch (error: any) {
      console.error(`Gemini API Attempt ${attempt} failed:`, error.message || error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Waiting ${delay}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error("Failed to generate content after retries");
}

// API endpoint to analyze the watermelon
app.post("/api/analyze-watermelon", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API client is not initialized. Please configure your GEMINI_API_KEY in Secrets.",
      });
    }

    const { image, soundType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image parameter" });
    }

    const parsedImage = parseBase64Image(image);

    const imagePart = {
      inlineData: {
        mimeType: parsedImage.mimeType,
        data: parsedImage.data,
      },
    };

    const soundDescription = soundType
      ? `The user tapped the watermelon and selected the following sound: "${soundType}" (which means: hollow/drum-like, dull/flat-thud, or tight/metallic). Please integrate this sound feedback into your quality/ripeness scoring. Ripe watermelon usually sounds hollow/drum-like, overripe/mushy sounds dull, and unripe/hard sounds tight/metallic.`
      : "No tap sound was provided. Analyze quality based purely on visual inspection.";

    const systemPrompt = `You are an expert Watermelon Quality Inspector and agricultural grading specialist.
Your task is to analyze the provided image, verify if it is indeed a watermelon, and if so, perform a comprehensive inspection including OCR (text on labels/stickers), color separation/analysis, ground spot detection, stripe contrast, and stem status.
Analyze carefully to see if there is any other fruit or object. If the object in the image is NOT a watermelon, you MUST explicitly state that it is not a watermelon.

IMPORTANT: Respond in Persian (Farsi) for user-facing descriptions, evaluations, and recommendations, so it matches the user's localized app interface. But keep JSON structure keys in English.

Your response must strictly be in JSON matching the following schema. Make sure everything is filled out accurately based on real visual cues in the image.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        {
          text: `Inspect this watermelon image. Sound feedback details: ${soundDescription}.
Provide your analysis strictly matching the JSON schema. Use natural Persian for Farsi fields.`,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "is_watermelon",
            "is_watermelon_explanation",
            "ocr_text",
            "ocr_found",
            "ripeness_score",
            "quality_score",
            "ground_spot",
            "stripes",
            "stem",
            "shape_profile",
            "color_palette",
            "recommendation",
            "detailed_analysis",
            "visual_hotspots"
          ],
          properties: {
            is_watermelon: {
              type: Type.BOOLEAN,
              description: "True if the image clearly contains a watermelon (whole or sliced/cut). False if it's anything else (e.g., a melon, pumpkin, human, cat, car, apple, etc.)",
            },
            is_watermelon_explanation: {
              type: Type.STRING,
              description: "Brief explanation in Persian about whether it is a watermelon or not (e.g., 'این تصویر حاوی یک هندوانه رسیده است' or 'این تصویر هندوانه نیست و به نظر می‌رسد یک سیب باشد')",
            },
            ocr_text: {
              type: Type.STRING,
              description: "Any text, price tag, brand label, PLU code (e.g., 4032), or sticker text extracted from the surface of the watermelon or its packaging. Empty string if nothing found.",
            },
            ocr_found: {
              type: Type.BOOLEAN,
              description: "True if any sticker/text/label is detected and read.",
            },
            ripeness_score: {
              type: Type.INTEGER,
              description: "Score from 0 (very unripe/white inside) to 100 (perfectly ripe, sweet, deep red). Consider stem dryness, field spot color, sound, and stripes contrast.",
            },
            quality_score: {
              type: Type.INTEGER,
              description: "Overall quality score from 0 (damaged, rotten, deformed) to 100 (flawless, organic premium grade).",
            },
            ground_spot: {
              type: Type.OBJECT,
              properties: {
                color: { type: Type.STRING, description: "Color in Persian (e.g., زرد کرمی, سفید, ندارد)" },
                description: { type: Type.STRING, description: "Detailed description in Persian of the field spot (where it sat on the ground)" },
                ripeness_impact: { type: Type.STRING, description: "Impact on ripeness in Persian (e.g., رنگ زرد نشانه رسیدگی عالی است, سفید نشانه کال بودن است)" },
              },
              required: ["color", "description", "ripeness_impact"],
            },
            stripes: {
              type: Type.OBJECT,
              properties: {
                contrast: { type: Type.STRING, description: "Contrast level in Persian (e.g., کنتراست بالا, کنتراست ضعیف, نامشخص)" },
                description: { type: Type.STRING, description: "Detailed description of stripe patterns and green color separation in Persian" },
                ripeness_impact: { type: Type.STRING, description: "Impact of stripe patterns in Persian (e.g., خطوط تیره و روشنِ واضح نشان‌دهنده رسیدگی خوب است)" },
              },
              required: ["contrast", "description", "ripeness_impact"],
            },
            stem: {
              type: Type.OBJECT,
              properties: {
                state: { type: Type.STRING, description: "State of stem in Persian (e.g., خشک شده, سبز و تازه, بدون ساقه)" },
                description: { type: Type.STRING, description: "Description of the stem tail in Persian" },
                ripeness_impact: { type: Type.STRING, description: "Ripeness impact in Persian (e.g., ساقه خشک نشان‌دهنده چیده شدن در زمان مناسب است)" },
              },
              required: ["state", "description", "ripeness_impact"],
            },
            shape_profile: {
              type: Type.OBJECT,
              properties: {
                shape: { type: Type.STRING, description: "Shape type in Persian (e.g., گرد منظم, بیضی کشیده, نامتقارن)" },
                description: { type: Type.STRING, description: "Detailed description of shape in Persian" },
                uniformity: { type: Type.STRING, description: "Evaluation of watering uniformity based on shape in Persian (e.g., تقارن بالا نشان‌دهنده آبیاری منظم است)" },
              },
              required: ["shape", "description", "uniformity"],
            },
            color_palette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 4-5 dominant hex color codes detected on the watermelon (e.g., ['#1b4332', '#40916c', '#d3f3f1', '#fcd581']) representing stripes, skin, and field spot",
            },
            recommendation: {
              type: Type.STRING,
              description: "Summary recommendation in Persian (e.g., 'بسیار شیرین و آماده مصرف. نوش جان!', 'بهتر است ۱-۲ روز بماند تا کامل برسد', 'بیش از حد رسیده و احتمالاً نرم است', 'این هندوانه نیست')",
            },
            detailed_analysis: {
              type: Type.STRING,
              description: "Comprehensive overall evaluation of the watermelon's sweetness, juiciness, skin thickness, and taste expectations in Persian",
            },
            visual_hotspots: {
              type: Type.ARRAY,
              description: "Define localized bounding box coordinates (percentages 0-100) on the watermelon image where features were spotted for overlay visualization.",
              items: {
                type: Type.OBJECT,
                required: ["label", "x", "y", "width", "height", "type"],
                properties: {
                  label: { type: Type.STRING, description: "Name of spotted region in Persian (e.g., 'دمبرگ/ساقه', 'لکه زمین (فیلد اسپات)', 'برچسب/OCR', 'خطوط تیره')" },
                  type: { type: Type.STRING, description: "Type: 'stem', 'field_spot', 'ocr', 'stripes', 'general'" },
                  x: { type: Type.INTEGER, description: "X percentage from top-left (0-100)" },
                  y: { type: Type.INTEGER, description: "Y percentage from top-left (0-100)" },
                  width: { type: Type.INTEGER, description: "Width percentage (5-50)" },
                  height: { type: Type.INTEGER, description: "Height percentage (5-50)" }
                }
              }
            }
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze watermelon image." });
  }
});

// Endpoint to check the latest version of the app from Myket store
app.get("/api/check-myket-version", async (req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  try {
    const appId = req.query.id || "com.apps.wmqd";
    const myketUrl = `https://myket.ir/app/${appId}`;
    
    const response = await fetch(myketUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: "برنامه هنوز در مایکت منتشر نشده است یا شناسه بسته اشتباه است.",
          message: `بسته نرم‌افزاری با شناسه "${appId}" روی مارکت مایکت یافت نشد (خطای ۴۰۴).`,
          appId,
          isPublished: false
        });
      }
      throw new Error(`خطای دریافت اطلاعات از مایکت (کد وضعیت ${response.status})`);
    }
    
    const html = await response.text();
    
    // Look for softwareVersion in Schema.org JSON-LD structured data
    let version = "";
    const jsonLdRegex = /"softwareVersion"\s*:\s*"([^"]+)"/i;
    const jsonLdMatch = html.match(jsonLdRegex);
    if (jsonLdMatch && jsonLdMatch[1]) {
      version = jsonLdMatch[1].trim();
    } else {
      // Fallback regex to search for common Persian/English version text patterns
      const versionRegex = /نسخه\s*(?:کد|فعلی|کنونی)?\s*[:：]?\s*([\d\.]+)/i;
      const versionMatch = html.match(versionRegex);
      if (versionMatch && versionMatch[1]) {
        version = versionMatch[1].trim();
      }
    }
    
    // Convert Farsi/Arabic digits to standard English digits if any
    const farsiToEnglish = (str: string) => {
      const farsiDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
      const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
      for (let i = 0; i < 10; i++) {
        str = str.replace(farsiDigits[i], i.toString());
        str = str.replace(arabicDigits[i], i.toString());
      }
      return str;
    };
    
    const cleanVersion = farsiToEnglish(version || "1.0.1");
    const localVersion = "1.0.1";
    
    // Simple semver comparison helper
    const compareVersions = (v1: string, v2: string) => {
      const p1 = v1.split(".").map(Number);
      const p2 = v2.split(".").map(Number);
      for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
      }
      return 0;
    };
    
    const isUpdateAvailable = compareVersions(cleanVersion, localVersion) > 0;
    
    res.json({
      latestVersion: cleanVersion,
      isUpdateAvailable,
      isPublished: true,
      message: isUpdateAvailable 
        ? `نسخه جدید ${cleanVersion} در مایکت موجود است.`
        : "شما از آخرین نسخه رسمی منتشر شده استفاده می‌کنید."
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("Error checking Myket version:", err);
    res.status(502).json({
      error: "خطا در برقراری ارتباط با مایکت. لطفاً اتصال اینترنت خود را بررسی کنید.",
      details: err.message || ""
    });
  }
});

async function bootstrap() {
  // Serve frontend build files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
