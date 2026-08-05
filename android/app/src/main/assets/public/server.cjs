var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "15mb" }));
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}
function parseBase64Image(dataURI) {
  const matches = dataURI.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data URI");
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}
async function generateContentWithRetry(aiClient, params, maxRetries = 4) {
  let delay = 1e3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling Gemini API (Attempt ${attempt}/${maxRetries})...`);
      const response = await aiClient.models.generateContent(params);
      return response;
    } catch (error) {
      console.error(`Gemini API Attempt ${attempt} failed:`, error.message || error);
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Waiting ${delay}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Failed to generate content after retries");
}
app.post("/api/analyze-watermelon", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API client is not initialized. Please configure your GEMINI_API_KEY in Secrets."
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
        data: parsedImage.data
      }
    };
    const soundDescription = soundType ? `The user tapped the watermelon and selected the following sound: "${soundType}" (which means: hollow/drum-like, dull/flat-thud, or tight/metallic). Please integrate this sound feedback into your quality/ripeness scoring. Ripe watermelon usually sounds hollow/drum-like, overripe/mushy sounds dull, and unripe/hard sounds tight/metallic.` : "No tap sound was provided. Analyze quality based purely on visual inspection.";
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
Provide your analysis strictly matching the JSON schema. Use natural Persian for Farsi fields.`
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
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
              type: import_genai.Type.BOOLEAN,
              description: "True if the image clearly contains a watermelon (whole or sliced/cut). False if it's anything else (e.g., a melon, pumpkin, human, cat, car, apple, etc.)"
            },
            is_watermelon_explanation: {
              type: import_genai.Type.STRING,
              description: "Brief explanation in Persian about whether it is a watermelon or not (e.g., '\u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u062D\u0627\u0648\u06CC \u06CC\u06A9 \u0647\u0646\u062F\u0648\u0627\u0646\u0647 \u0631\u0633\u06CC\u062F\u0647 \u0627\u0633\u062A' or '\u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u0647\u0646\u062F\u0648\u0627\u0646\u0647 \u0646\u06CC\u0633\u062A \u0648 \u0628\u0647 \u0646\u0638\u0631 \u0645\u06CC\u200C\u0631\u0633\u062F \u06CC\u06A9 \u0633\u06CC\u0628 \u0628\u0627\u0634\u062F')"
            },
            ocr_text: {
              type: import_genai.Type.STRING,
              description: "Any text, price tag, brand label, PLU code (e.g., 4032), or sticker text extracted from the surface of the watermelon or its packaging. Empty string if nothing found."
            },
            ocr_found: {
              type: import_genai.Type.BOOLEAN,
              description: "True if any sticker/text/label is detected and read."
            },
            ripeness_score: {
              type: import_genai.Type.INTEGER,
              description: "Score from 0 (very unripe/white inside) to 100 (perfectly ripe, sweet, deep red). Consider stem dryness, field spot color, sound, and stripes contrast."
            },
            quality_score: {
              type: import_genai.Type.INTEGER,
              description: "Overall quality score from 0 (damaged, rotten, deformed) to 100 (flawless, organic premium grade)."
            },
            ground_spot: {
              type: import_genai.Type.OBJECT,
              properties: {
                color: { type: import_genai.Type.STRING, description: "Color in Persian (e.g., \u0632\u0631\u062F \u06A9\u0631\u0645\u06CC, \u0633\u0641\u06CC\u062F, \u0646\u062F\u0627\u0631\u062F)" },
                description: { type: import_genai.Type.STRING, description: "Detailed description in Persian of the field spot (where it sat on the ground)" },
                ripeness_impact: { type: import_genai.Type.STRING, description: "Impact on ripeness in Persian (e.g., \u0631\u0646\u06AF \u0632\u0631\u062F \u0646\u0634\u0627\u0646\u0647 \u0631\u0633\u06CC\u062F\u06AF\u06CC \u0639\u0627\u0644\u06CC \u0627\u0633\u062A, \u0633\u0641\u06CC\u062F \u0646\u0634\u0627\u0646\u0647 \u06A9\u0627\u0644 \u0628\u0648\u062F\u0646 \u0627\u0633\u062A)" }
              },
              required: ["color", "description", "ripeness_impact"]
            },
            stripes: {
              type: import_genai.Type.OBJECT,
              properties: {
                contrast: { type: import_genai.Type.STRING, description: "Contrast level in Persian (e.g., \u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u0628\u0627\u0644\u0627, \u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u0636\u0639\u06CC\u0641, \u0646\u0627\u0645\u0634\u062E\u0635)" },
                description: { type: import_genai.Type.STRING, description: "Detailed description of stripe patterns and green color separation in Persian" },
                ripeness_impact: { type: import_genai.Type.STRING, description: "Impact of stripe patterns in Persian (e.g., \u062E\u0637\u0648\u0637 \u062A\u06CC\u0631\u0647 \u0648 \u0631\u0648\u0634\u0646\u0650 \u0648\u0627\u0636\u062D \u0646\u0634\u0627\u0646\u200C\u062F\u0647\u0646\u062F\u0647 \u0631\u0633\u06CC\u062F\u06AF\u06CC \u062E\u0648\u0628 \u0627\u0633\u062A)" }
              },
              required: ["contrast", "description", "ripeness_impact"]
            },
            stem: {
              type: import_genai.Type.OBJECT,
              properties: {
                state: { type: import_genai.Type.STRING, description: "State of stem in Persian (e.g., \u062E\u0634\u06A9 \u0634\u062F\u0647, \u0633\u0628\u0632 \u0648 \u062A\u0627\u0632\u0647, \u0628\u062F\u0648\u0646 \u0633\u0627\u0642\u0647)" },
                description: { type: import_genai.Type.STRING, description: "Description of the stem tail in Persian" },
                ripeness_impact: { type: import_genai.Type.STRING, description: "Ripeness impact in Persian (e.g., \u0633\u0627\u0642\u0647 \u062E\u0634\u06A9 \u0646\u0634\u0627\u0646\u200C\u062F\u0647\u0646\u062F\u0647 \u0686\u06CC\u062F\u0647 \u0634\u062F\u0646 \u062F\u0631 \u0632\u0645\u0627\u0646 \u0645\u0646\u0627\u0633\u0628 \u0627\u0633\u062A)" }
              },
              required: ["state", "description", "ripeness_impact"]
            },
            shape_profile: {
              type: import_genai.Type.OBJECT,
              properties: {
                shape: { type: import_genai.Type.STRING, description: "Shape type in Persian (e.g., \u06AF\u0631\u062F \u0645\u0646\u0638\u0645, \u0628\u06CC\u0636\u06CC \u06A9\u0634\u06CC\u062F\u0647, \u0646\u0627\u0645\u062A\u0642\u0627\u0631\u0646)" },
                description: { type: import_genai.Type.STRING, description: "Detailed description of shape in Persian" },
                uniformity: { type: import_genai.Type.STRING, description: "Evaluation of watering uniformity based on shape in Persian (e.g., \u062A\u0642\u0627\u0631\u0646 \u0628\u0627\u0644\u0627 \u0646\u0634\u0627\u0646\u200C\u062F\u0647\u0646\u062F\u0647 \u0622\u0628\u06CC\u0627\u0631\u06CC \u0645\u0646\u0638\u0645 \u0627\u0633\u062A)" }
              },
              required: ["shape", "description", "uniformity"]
            },
            color_palette: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Array of 4-5 dominant hex color codes detected on the watermelon (e.g., ['#1b4332', '#40916c', '#d3f3f1', '#fcd581']) representing stripes, skin, and field spot"
            },
            recommendation: {
              type: import_genai.Type.STRING,
              description: "Summary recommendation in Persian (e.g., '\u0628\u0633\u06CC\u0627\u0631 \u0634\u06CC\u0631\u06CC\u0646 \u0648 \u0622\u0645\u0627\u062F\u0647 \u0645\u0635\u0631\u0641. \u0646\u0648\u0634 \u062C\u0627\u0646!', '\u0628\u0647\u062A\u0631 \u0627\u0633\u062A \u06F1-\u06F2 \u0631\u0648\u0632 \u0628\u0645\u0627\u0646\u062F \u062A\u0627 \u06A9\u0627\u0645\u0644 \u0628\u0631\u0633\u062F', '\u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0631\u0633\u06CC\u062F\u0647 \u0648 \u0627\u062D\u062A\u0645\u0627\u0644\u0627\u064B \u0646\u0631\u0645 \u0627\u0633\u062A', '\u0627\u06CC\u0646 \u0647\u0646\u062F\u0648\u0627\u0646\u0647 \u0646\u06CC\u0633\u062A')"
            },
            detailed_analysis: {
              type: import_genai.Type.STRING,
              description: "Comprehensive overall evaluation of the watermelon's sweetness, juiciness, skin thickness, and taste expectations in Persian"
            },
            visual_hotspots: {
              type: import_genai.Type.ARRAY,
              description: "Define localized bounding box coordinates (percentages 0-100) on the watermelon image where features were spotted for overlay visualization.",
              items: {
                type: import_genai.Type.OBJECT,
                required: ["label", "x", "y", "width", "height", "type"],
                properties: {
                  label: { type: import_genai.Type.STRING, description: "Name of spotted region in Persian (e.g., '\u062F\u0645\u0628\u0631\u06AF/\u0633\u0627\u0642\u0647', '\u0644\u06A9\u0647 \u0632\u0645\u06CC\u0646 (\u0641\u06CC\u0644\u062F \u0627\u0633\u067E\u0627\u062A)', '\u0628\u0631\u0686\u0633\u0628/OCR', '\u062E\u0637\u0648\u0637 \u062A\u06CC\u0631\u0647')" },
                  type: { type: import_genai.Type.STRING, description: "Type: 'stem', 'field_spot', 'ocr', 'stripes', 'general'" },
                  x: { type: import_genai.Type.INTEGER, description: "X percentage from top-left (0-100)" },
                  y: { type: import_genai.Type.INTEGER, description: "Y percentage from top-left (0-100)" },
                  width: { type: import_genai.Type.INTEGER, description: "Width percentage (5-50)" },
                  height: { type: import_genai.Type.INTEGER, description: "Height percentage (5-50)" }
                }
              }
            }
          }
        }
      }
    });
    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze watermelon image." });
  }
});
app.get("/api/check-myket-version", async (req, res) => {
  try {
    const appId = req.query.id || "com.apps.wmqd";
    const myketUrl = `https://myket.ir/app/${appId}`;
    const response = await fetch(myketUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      return res.json({
        latestVersion: "1.0.1",
        isUpdateAvailable: false,
        message: "\u0628\u0631\u0646\u0627\u0645\u0647 \u0634\u0645\u0627 \u0628\u0631\u0648\u0632 \u0627\u0633\u062A (\u0646\u0633\u062E\u0647 \u0641\u0639\u0644\u06CC: \u06F1.\u06F0.\u06F1)"
      });
    }
    const html = await response.text();
    let version = "";
    const jsonLdRegex = /"softwareVersion"\s*:\s*"([^"]+)"/i;
    const jsonLdMatch = html.match(jsonLdRegex);
    if (jsonLdMatch && jsonLdMatch[1]) {
      version = jsonLdMatch[1].trim();
    } else {
      const versionRegex = /نسخه\s*(?:کد|فعلی|کنونی)?\s*[:：]?\s*([\d\.]+)/i;
      const versionMatch = html.match(versionRegex);
      if (versionMatch && versionMatch[1]) {
        version = versionMatch[1].trim();
      }
    }
    const farsiToEnglish = (str) => {
      const farsiDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
      for (let i = 0; i < 10; i++) {
        str = str.replace(farsiDigits[i], i.toString());
      }
      return str;
    };
    const cleanVersion = farsiToEnglish(version || "1.0.1");
    const localVersion = "1.0.1";
    const compareVersions = (v1, v2) => {
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
      message: isUpdateAvailable ? `\u0646\u0633\u062E\u0647 \u062C\u062F\u06CC\u062F ${cleanVersion} \u062F\u0631 \u0645\u0627\u06CC\u06A9\u062A \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A.` : "\u0634\u0645\u0627 \u0627\u0632 \u0622\u062E\u0631\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0631\u0633\u0645\u06CC \u0645\u0646\u062A\u0634\u0631 \u0634\u062F\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F."
    });
  } catch (err) {
    console.error("Error checking Myket version:", err);
    res.json({
      latestVersion: "1.0.1",
      isUpdateAvailable: false,
      message: "\u0628\u0631\u0646\u0627\u0645\u0647 \u0628\u0631\u0648\u0632 \u0627\u0633\u062A (\u0646\u0633\u062E\u0647 \u0641\u0639\u0644\u06CC: \u06F1.\u06F0.\u06F1)"
    });
  }
});
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
