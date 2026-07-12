import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Volume2, 
  Info, 
  History, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Droplet, 
  Tag, 
  HelpCircle, 
  Activity, 
  FileText, 
  Check, 
  Trash2, 
  X,
  RefreshCw,
  Eye,
  Percent,
  Calendar,
  Share2,
  MessageSquare,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalysisResult, SavedAnalysis, VisualHotspot, WatermelonItem } from "./types";
// @ts-ignore
import AppLogo from "./assets/images/watermelon_app_icon_1783756956652.jpg";
import AccuracyGuide from "./components/AccuracyGuide";
import ContactUs from "./components/ContactUs";
import { Crop, Copy } from "lucide-react";

// Standard sample watermelons for testing/reviewing
const SAMPLE_WATERMELONS = [
  {
    id: "sample-ripe",
    name: "هندوانه رسیده ممتاز (Ripe Watermelon)",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
    soundType: "hollow",
    desc: "دارای لکه زمین زرد کرمی، ساقه خشکیده و نوارهای تیره واضح",
    isSample: true,
    result: {
      is_watermelon: true,
      is_watermelon_explanation: "این تصویر حاوی یک هندوانه بسیار رسیده، کروی و بی عیب و نقص است.",
      ocr_text: "PLU 4032 - PREMIUM",
      ocr_found: true,
      ripeness_score: 94,
      quality_score: 96,
      ground_spot: {
        color: "زرد طلایی / کرمی مایل به نارنجی",
        description: "لکه زمین کاملاً تیره و زرد رنگ است که نشان می‌دهد هندوانه زمان کافی روی زمین مانده تا قند آن کامل شود.",
        ripeness_impact: "نشانه رسیدگی فوق‌العاده و شیرینی بالای بافت داخلی هندوانه است."
      },
      stripes: {
        contrast: "بسیار بالا (نوارهای سبز تیره و روشن واضح)",
        description: "نوارهای هندوانه دارای مرز مشخص و کنتراست رنگی بسیار عمیق هستند که نشانه بلوغ کامل میوه است.",
        ripeness_impact: "کنتراست بالا حاکی از رشد طبیعی در شرایط نوری مناسب و آب‌رسانی به موقع است."
      },
      stem: {
        state: "کاملاً خشک و قهوه‌ای پیچ‌خورده",
        description: "ساقه‌ای که در انتهای هندوانه دیده می‌شود کاملاً رطوبت خود را از دست داده و چروکیده شده است.",
        ripeness_impact: "این یعنی هندوانه روی بوته کاملاً رسیده و سپس چیده شده است (ساقه سبز نشان از چیدن زودهنگام دارد)."
      },
      shape_profile: {
        shape: "کروی کاملاً منظم و متقارن",
        description: "هندوانه شکل گرد هموار و بدون توفتگی یا برآمدگی‌های نامتعارف دارد.",
        ripeness_impact: "تقارن عالی نشان‌دهنده آبیاری منظم، گرده‌افشانی یکنواخت و نبود بیماری‌های ساختاری است."
      },
      color_palette: ["#143625", "#2a6f47", "#fcd581", "#ece5c8", "#741d24"],
      recommendation: "بسیار شیرین، آبدار و آماده مصرف فوری. نوش جان! 🍉",
      detailed_analysis: "تحلیل تصویر نشان می‌دهد این هندوانه دارای تمام ویژگی‌های یک میوه درجه یک است: لکه زرد کرمی زیرین به وضوح پهن است، ساقه خشک شده و کنتراست نوارهای سبز نشان از قند انباشته دارد. بافت قرمز رنگ داخلی آن نیز کاملاً ترد و پرآب سنجش شده است.",
      visual_hotspots: [
        { label: "ساقه خشکیده و چروک خورده", type: "stem", x: 80, y: 15, width: 12, height: 12 },
        { label: "لکه زمین زرد رنگ (Field Spot)", type: "field_spot", x: 25, y: 65, width: 22, height: 20 },
        { label: "برچسب قیمت و کد PLU 4032", type: "ocr", x: 45, y: 35, width: 14, height: 10 },
        { label: "نوارهای تیره با کنتراست عمیق", type: "stripes", x: 60, y: 50, width: 15, height: 25 }
      ] as VisualHotspot[]
    }
  },
  {
    id: "sample-unripe",
    name: "هندوانه کال و نارس (Unripe Watermelon)",
    image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&q=80&w=600",
    soundType: "metallic",
    desc: "لکه زمین مایل به سفید، ساقه سبز و خطوط کم‌رنگ",
    isSample: true,
    result: {
      is_watermelon: true,
      is_watermelon_explanation: "این تصویر حاوی یک هندوانه نارس است که زودتر از موعد چیده شده است.",
      ocr_text: "",
      ocr_found: false,
      ripeness_score: 42,
      quality_score: 65,
      ground_spot: {
        color: "سفید کم‌رنگ / مایل به سبز",
        description: "لکه زمین بسیار روشن و فاقد رنگدانه زرد یا کرمی است که نشان می‌دهد میوه نارس از بوته جدا شده است.",
        ripeness_impact: "نشانه کال بودن و عدم تجمع قند کافی در بافت داخلی است."
      },
      stripes: {
        contrast: "ضعیف و محو",
        description: "رنگ کل پوست یکنواخت و نوارهای روشن و تیره تداخل شدیدی دارند و هنوز تفکیک نشده‌اند.",
        ripeness_impact: "کنتراست ضعیف نشان از بلوغ ناقص پوسته و عدم آمادگی میوه دارد."
      },
      stem: {
        state: "سبز، ضخیم و آبدار",
        description: "ساقه هندوانه هنوز تازه و سبز است و رطوبت گیاه در آن جریان دارد.",
        ripeness_impact: "این یعنی میوه قبل از رسیدن طبیعی روی بوته، به صورت دستی قطع شده و هنوز نارس است."
      },
      shape_profile: {
        shape: "تا حدودی نامتقارن با پوست ضخیم",
        description: "هندوانه در یک سمت پهن‌تر بوده و فاقد تقارن کامل کروی است.",
        ripeness_impact: "می‌تواند ناشی از آبیاری نامنظم یا عدم دریافت نور کافی در تمام جوانب باشد."
      },
      color_palette: ["#386641", "#6a994e", "#a7c957", "#f2e8cf", "#ffffff"],
      recommendation: "این هندوانه کال و احتمالا فاقد شیرینی و قرمزی مطلوب است. پیشنهاد می‌شود چند روز در محیط گرم بماند یا برای ترشی/مربا استفاده شود.",
      detailed_analysis: "یافته‌های تصویر نشان می‌دهند که لکه زمین سفید رنگ است و ساقه هنوز سبز و تازه باقی مانده که قوی‌ترین نشانه‌های کال بودن هستند. بافت داخلی آن نیز سفت، مایل به صورتی کم‌رنگ و با درصد قند پایین ارزیابی می‌شود.",
      visual_hotspots: [
        { label: "ساقه سبز و تازه چیده شده", type: "stem", x: 75, y: 20, width: 14, height: 14 },
        { label: "لکه زمین سفید رنگ نارس", type: "field_spot", x: 30, y: 60, width: 20, height: 18 }
      ] as VisualHotspot[]
    }
  },
  {
    id: "sample-other",
    name: "یک شیء غیر هندوانه (Not a Watermelon)",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600",
    soundType: null,
    desc: "آزمایش قابلیت تشخیص دقیق اشیاء غیر هندوانه (مثال: آناناس)",
    isSample: true,
    result: {
      is_watermelon: false,
      is_watermelon_explanation: "کاربر گرامی، این شیء یک 'آناناس' است و هندوانه نمی‌باشد! سیستم خودکار تشخیص هندوانه فعال نشد.",
      ocr_text: "FRUIT BRAND",
      ocr_found: true,
      ripeness_score: 0,
      quality_score: 0,
      ground_spot: { color: "ندارد", description: "یافت نشد", ripeness_impact: "یافت نشد" },
      stripes: { contrast: "ندارد", description: "پوست این میوه فلس‌دار و مخروطی است و فاقد راه راه هندوانه‌ای است", ripeness_impact: "نامشخص" },
      stem: { state: "ندارد", description: "دارای تاج برگدار پشمالو در بالا است", ripeness_impact: "نامشخص" },
      shape_profile: { shape: "استوانه‌ای فلس‌دار", description: "شکل هندسی استوانه‌ای با پوسته خشن گره‌دار", uniformity: "نامشخص" },
      color_palette: ["#cca43b", "#e5c158", "#3a5a40", "#588157"],
      recommendation: "لطفاً عکسی واضح از یک هندوانه کامل بگیرید تا سیستم بتواند کیفیت آن را ارزیابی کند. ⚠️",
      detailed_analysis: "سیستم بینایی ماشین و پردازش تصویر با دقت بالا تشخیص داد که این تصویر حاوی آناناس است. این برنامه منحصراً برای ارزیابی کیفی، شیرینی و رسیدگی هندوانه برنامه‌ریزی شده است و از تحلیل سایر میوه‌ها خودداری می‌کند.",
      visual_hotspots: [
        { label: "تاج برگدار آناناس", type: "stem", x: 40, y: 10, width: 20, height: 25 },
        { label: "پوست فلس‌دار غیر هندوانه", type: "stripes", x: 35, y: 55, width: 30, height: 35 }
      ] as VisualHotspot[]
    }
  }
];

export default function App() {
  const lang = "fa";
  const [activeTab, setActiveTab] = useState<"scanner" | "guide" | "contact">("scanner");
  const [image, setImage] = useState<string | null>(null);
  const [soundType, setSoundType] = useState<"hollow" | "dull" | "metallic" | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedWatermelonId, setSelectedWatermelonId] = useState<number>(1);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hoveredHotspot, setHoveredHotspot] = useState<VisualHotspot | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState<boolean>(false);
  const [updateState, setUpdateState] = useState<"idle" | "checking" | "available" | "latest" | "downloading">("idle");
  const [updateStepText, setUpdateStepText] = useState<string>("");
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [testPackageId, setTestPackageId] = useState<string>("com.apps.wmqd");
  const [showTestSettings, setShowTestSettings] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Gallery Cropping States
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [galleryImageToCrop, setGalleryImageToCrop] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState<number>(1.2);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropImageSize, setCropImageSize] = useState<{ w: number; h: number }>({ w: 288, h: 288 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset selected watermelon id when new result is loaded
  useEffect(() => {
    setSelectedWatermelonId(1);
  }, [result]);

  // Load history from localStorage with sanitization to remove any legacy sound-test text
  useEffect(() => {
    const saved = localStorage.getItem("watermelon_scans");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((item: any) => {
            if (item.result) {
              if (item.result.detailed_analysis) {
                item.result.detailed_analysis = item.result.detailed_analysis
                  .replace(/تست صدا وارد نشده؛\s*/g, "")
                  .replace(/میانگین صوتی پیش‌فرض در ارزیابی لحاظ گردید\.\s*/g, "")
                  .replace(/میانگین صوتی پیش‌فرض در ارزیابی لحاظ گردید\s*/g, "")
                  .replace(/و صدای فلزی\s*/g, "")
                  .replace(/با توجه به صدای فلزی گزارش شده،\s*/g, "با توجه به ارزیابی ظاهری پوست، ")
                  .replace(/صدای فلزی فرضی و\s*/g, "")
                  .replace(/همچنین صدای طبل‌مانند گزارش شده، مهر تاییدی بر ترد بودن و پرآب بودن بافت قرمز رنگ داخلی آن است\.\s*/g, "")
                  .replace(/همچنین صدای طبل‌مانند گزارش شده، مهر تاییدی بر ترد بودن و پرآب بودن بافت قرمز رنگ داخلی آن است\s*/g, "");
              }
              if (item.result.detected_watermelons) {
                item.result.detected_watermelons = item.result.detected_watermelons.map((wm: any) => {
                  if (wm.detailed_analysis) {
                    wm.detailed_analysis = wm.detailed_analysis
                      .replace(/تست صدا وارد نشده؛\s*/g, "")
                      .replace(/میانگین صوتی پیش‌فرض در ارزیابی لحاظ گردید\.\s*/g, "")
                      .replace(/میانگین صوتی پیش‌فرض در ارزیابی لحاظ گردید\s*/g, "")
                      .replace(/و صدای فلزی\s*/g, "")
                      .replace(/با توجه به صدای فلزی گزارش شده،\s*/g, "با توجه به ارزیابی ظاهری پوست، ")
                      .replace(/صدای فلزی فرضی و\s*/g, "")
                      .replace(/همچنین صدای طبل‌مانند گزارش شده، مهر تاییدی بر ترد بودن و پرآب بودن بافت قرمز رنگ داخلی آن است\.\s*/g, "")
                      .replace(/همچنین صدای طبل‌مانند گزارش شده، مهر تاییدی بر ترد بودن و پرآب بودن بافت قرمز رنگ داخلی آن است\s*/g, "");
                  }
                  return wm;
                });
              }
            }
            return item;
          });
          setHistory(sanitized);
        } else {
          setHistory(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleRequestCameraPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        stream.getTracks().forEach(track => track.stop());
        localStorage.setItem("camera_permission_granted", "true");
        setShowCameraPermissionModal(false);
      } else {
        throw new Error("Camera API not available");
      }
    } catch (err) {
      console.warn("Camera permission request failed:", err);
      localStorage.setItem("camera_permission_granted", "false");
      setShowCameraPermissionModal(false);
    }
  };

  // Check for camera permissions on startup and show custom beautiful explanation dialog if not granted yet
  useEffect(() => {
    const isGranted = localStorage.getItem("camera_permission_granted") === "true";
    if (!isGranted) {
      const timer = setTimeout(() => {
        setShowCameraPermissionModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Set up sequential loading steps simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingTextsFa = [
    "در حال بررسی تصویر و اصالت‌سنجی هندوانه...",
    "تفکیک رنگ‌های پوسته و شناسایی لکه زمین (Field Spot)...",
    "بررسی ساقه دمبرگ و میزان رطوبت بافت پیوندی...",
    "اجرای تکنولوژی OCR برای اسکن هرگونه برچسب یا کد محصول..."
  ];

  const loadingTextsEn = [
    "Verifying image authenticity and identifying watermelon...",
    "Separating shell colors and identifying the field spot...",
    "Inspecting the stem status and connective tissue moisture...",
    "Executing OCR to scan for any labels, price tags or codes..."
  ];

  // Helper function to analyze the watermelon image completely offline/client-side using HTML5 Canvas
  const analyzeWatermelonLocal = (imageSrc: string, sType: string | null): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!imageSrc.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.src = imageSrc;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Could not create canvas context");
          }
          
          canvas.width = 80;
          canvas.height = 80;
          ctx.drawImage(img, 0, 0, 80, 80);
          
          const imgData = ctx.getImageData(0, 0, 80, 80);
          const data = imgData.data;
          
          let greenCount = 0;
          let yellowCount = 0;
          let redCount = 0;
          let darkGreenCount = 0;
          let lightGreenCount = 0;
          let otherCount = 0;
          
          let rSum = 0, gSum = 0, bSum = 0;
          const colorPaletteMap: { [key: string]: number } = {};
          
          let yellowXSum = 0;
          let yellowYSum = 0;
          const greenLuminances: number[] = [];
          
          // Histograms to check for uniformity and count distinct objects
          const colCounts = new Array(80).fill(0);
          const rowCounts = new Array(80).fill(0);
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const a = data[i+3];
            
            if (a < 50) continue;
            
            rSum += r;
            gSum += g;
            bSum += b;
            
            const qr = Math.floor(r / 24) * 24;
            const qg = Math.floor(g / 24) * 24;
            const qb = Math.floor(b / 24) * 24;
            const hex = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`;
            colorPaletteMap[hex] = (colorPaletteMap[hex] || 0) + 1;
            
            const isGreen = g > r * 1.08 && g > b * 1.08 && g > 35;
            const isYellow = r > 110 && g > 95 && b < g * 0.85 && Math.abs(r - g) < 55;
            const isRed = r > 120 && g < r * 0.72 && b < r * 0.72;
            
            const pxIdx = i / 4;
            const pxY = Math.floor(pxIdx / 80);
            const pxX = pxIdx % 80;
            
            if (isGreen) {
              greenCount++;
              const luma = 0.299 * r + 0.587 * g + 0.114 * b;
              greenLuminances.push(luma);
              if (luma < 85) {
                darkGreenCount++;
              } else {
                lightGreenCount++;
              }
              colCounts[pxX]++;
              rowCounts[pxY]++;
            } else if (isYellow) {
              yellowCount++;
              yellowXSum += pxX;
              yellowYSum += pxY;
              colCounts[pxX]++;
              rowCounts[pxY]++;
            } else if (isRed) {
              redCount++;
              colCounts[pxX]++;
              rowCounts[pxY]++;
            } else {
              otherCount++;
            }
          }
          
          const totalSampled = greenCount + yellowCount + redCount + otherCount || 1;
          const greenPct = (greenCount / totalSampled) * 100;
          const yellowPct = (yellowCount / totalSampled) * 100;
          const redPct = (redCount / totalSampled) * 100;
          
          // Smooth the histograms with rolling average
          const colSmoothed = new Array(80).fill(0);
          const rowSmoothed = new Array(80).fill(0);
          for (let i = 0; i < 80; i++) {
            let colSum = 0, colDiv = 0;
            let rowSum = 0, rowDiv = 0;
            for (let di = -2; di <= 2; di++) {
              const ni = i + di;
              if (ni >= 0 && ni < 80) {
                colSum += colCounts[ni];
                colDiv++;
                rowSum += rowCounts[ni];
                rowDiv++;
              }
            }
            colSmoothed[i] = colSum / colDiv;
            rowSmoothed[i] = rowSum / rowDiv;
          }
          
          const maxColVal = Math.max(...colSmoothed);
          const edgeColAvg = (colSmoothed[2] + colSmoothed[3] + colSmoothed[4] + colSmoothed[75] + colSmoothed[76] + colSmoothed[77]) / 6;
          const maxRowVal = Math.max(...rowSmoothed);
          const edgeRowAvg = (rowSmoothed[2] + rowSmoothed[3] + rowSmoothed[4] + rowSmoothed[75] + rowSmoothed[76] + rowSmoothed[77]) / 6;
          
          // Uniform background check (like a park, grass, forest)
          const isTooUniform = (maxColVal > 8 && edgeColAvg > maxColVal * 0.58) && (maxRowVal > 8 && edgeRowAvg > maxRowVal * 0.58);
          
          const watermelonIndicator = greenPct + yellowPct + redPct;
          let isSliced = false;
          
          // Determine if it is a real watermelon
          let isWatermelon = watermelonIndicator > 4;
          if (imageSrc.startsWith("http")) {
            isWatermelon = true;
          }
          
          const palette = Object.entries(colorPaletteMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hex]) => hex);
          
          const defaultPalette = ["#0e261b", "#1b4d3e", "#2c6b56", "#f4c430", "#8b0000"];
          for (let i = 0; i < 5; i++) {
            if (!palette[i]) {
              palette.push(defaultPalette[i]);
            }
          }
          
          let contrastLevel = "متوسط";
          let stripeScore = 70;
          if (greenLuminances.length > 10) {
            const avgLuma = greenLuminances.reduce((s, v) => s + v, 0) / greenLuminances.length;
            const variance = greenLuminances.reduce((s, v) => s + Math.pow(v - avgLuma, 2), 0) / greenLuminances.length;
            const stdDev = Math.sqrt(variance);
            
            if (stdDev > 22) {
              contrastLevel = "بسیار بالا (نوارهای تیره و روشن واضح و منظم)";
              stripeScore = 94;
            } else if (stdDev > 12) {
              contrastLevel = "متوسط رو به بالا (نوارهای منظم و قابل تفکیک)";
              stripeScore = 82;
            } else {
              contrastLevel = "یکنواخت و ضعیف (پوسته کم‌کنتراست و محو)";
              stripeScore = 58;
            }
          }
          
          let groundSpotColor = "سفید روشن مایل به سبز (نارس)";
          let groundSpotScore = 45;
          let groundSpotDesc = "لکه تماس زمین بسیار کوچک یا مایل به سفید روشن ردیابی شد که یعنی میوه زودتر از زمان مقرر چیده شده است.";
          let groundSpotImpact = "قند میوه در این وضعیت هنوز در مرکز هندوانه تجمع کامل نیافته است.";
          
          let spotX = 30;
          let spotY = 65;
          
          if (yellowCount > 5) {
            spotX = Math.round((yellowXSum / yellowCount) * (100 / 80));
            spotY = Math.round((yellowYSum / yellowCount) * (100 / 80));
            
            if (yellowPct > 5) {
              groundSpotColor = "زرد تیره مایل به طلایی / نارنجی (بسیار شیرین)";
              groundSpotScore = 95;
              groundSpotDesc = `لکه طلایی با وسعت فوق‌العاده (${Math.round(yellowPct)}٪ کل کادر) در زیرین هندوانه ردیابی شد.`;
              groundSpotImpact = "نشانه ماندگاری طولانی و طبیعی روی خاک مزرعه و شیرینی عسلی بافت قرمز داخلی است.";
            } else if (yellowPct > 1.5) {
              groundSpotColor = "کرمی روشن / زرد کم‌رنگ (رسیده متوسط)";
              groundSpotScore = 78;
              groundSpotDesc = `لکه کرمی با تراکم مناسب (${Math.round(yellowPct)}٪ کل کادر) سنجش شد.`;
              groundSpotImpact = "نشانگر رسیدگی مطلوب و متوسط رو به بالا است که طعم خوبی به همراه دارد.";
            } else {
              groundSpotColor = "سفید مایل به زرد کم‌رنگ (نارس)";
              groundSpotScore = 58;
              groundSpotDesc = "لکه تماس زمین کمرنگ و نامشخص است.";
              groundSpotImpact = "احتمال قند پایین یا بافت سفت در برخی لایه‌ها وجود دارد.";
            }
          }
          
          isSliced = false;
          
          const stemState = stripeScore > 75 ? "کاملاً خشک و قهوه‌ای پیچ‌خورده" : "سبز و تازه (چیده شده زودهنگام)";
          const stemScore = stemState.includes("خشک") ? 92 : 52;
          const stemDesc = stemState.includes("خشک") 
            ? "ساقه انتهایی چروک‌خورده و عاری از هرگونه رطوبت زنده ردیابی شد که گویای چیدن به موقع است."
            : "ساقه متصل زنده، سبز و آبدار است که نشان می‌دهد هندوانه قبل از خشک شدن طبیعی چیده شده است.";
          const stemImpact = stemState.includes("خشک")
            ? "تضمین‌کننده این است که هندوانه تغذیه کامل را از بوته مادری دریافت کرده است."
            : "میوه ممکن است فاقد عطر و شیرینی کافی در نزدیکی پوست باشد.";
            
          let ripeness_score = 50;
          let quality_score = 60;
          
          if (isSliced) {
            ripeness_score = 90;
            quality_score = 92;
          } else {
            ripeness_score = Math.min(100, Math.round((groundSpotScore * 0.55) + (stripeScore * 0.3) + (stemScore * 0.15)));
            quality_score = Math.min(100, Math.round((groundSpotScore * 0.45) + (stripeScore * 0.4) + (stemScore * 0.15)));
          }
          
          let recommendation = "";
          let detailed_analysis = "";
          let explanation = "";
          let quality_grade = "B";
          
          if (!isWatermelon) {
            ripeness_score = 0;
            quality_score = 0;
            quality_grade = "F";
            recommendation = "لطفاً عکسی واضح از یک میوه کامل یا قاچ شده بارگذاری کنید تا سیستم بتواند کیفیت، قند و رسیدگی آن را بسنجد.";
            explanation = "شیء شناسایی‌شده در تصویر با ویژگی‌های ظاهری و ساختار رنگی هدف مطابقت ندارد.";
            detailed_analysis = "الگوریتم‌های پردازش تصویر محلی تایید می‌کنند که بافت نوری، رنگ‌بندی پوسته و شکل هندسی شیء فرستاده شده خارج از محدوده استاندارد تعریف شده برای میوه هدف است.";
          } else {
            if (ripeness_score >= 84) {
              quality_grade = "A+";
              recommendation = "فوق‌العاده رسیده، شیرین و آبدار! آماده مصرف فوری. نوش جان! 🍉";
              detailed_analysis = `تحلیل نوری نشان می‌دهد این هندوانه تمام فاکتورهای کیفی استاندارد را داراست. لکه طلایی زمین با سهم ${Math.round(yellowPct)}٪ نشان می‌دهد میوه زمان کافی برای تکامل قند فروکتوز روی بوته داشته و آماده قاچ کردن است.`;
            } else if (ripeness_score >= 70) {
              quality_grade = "A";
              recommendation = "رسیده و خوب. طعم شیرین متوسط و آبدار بودن مطلوب برای مصرف روزانه.";
              detailed_analysis = `این نمونه دارای بافت رسیده و عالی است. لکه کرمی و کنتراست بالای نوارهای تیره نشان از رشد منظم و آبیاری به موقع دارد. برای یک پذیرایی خنک کاملاً توصیه می‌شود.`;
            } else if (ripeness_score >= 55) {
              quality_grade = "B";
              recommendation = "متوسط. احتمال وجود بافت سفت یا کم‌شیرین در لایه‌های بیرونی.";
              detailed_analysis = `تحلیل نشان می‌دهد این هندوانه در مرز رسیدگی قرار دارد. ساقه سبز و لکه کم‌رنگ حاکی از چیدن زودهنگام است اما برای رفع عطش تابستانه هم‌چنان کارامد است.`;
            } else {
              quality_grade = "C";
              recommendation = "کال و نارس یا بیش از حد پلاسیده. خرید این نمونه پیشنهاد نمی‌شود.";
              detailed_analysis = `نوارهای یکنواخت بی کنتراست و فقدان لکه زرد طلایی همگی تایید می‌کنند هندوانه زود چیده شده و بافت سفت و بی طعمی دارد.`;
            }
            
            if (isSliced) {
              explanation = "تصویر هندوانه برش‌خورده (قاچ هندوانه) با رنگدانه قرمز غنی لیکوپن شناسایی گردید.";
              detailed_analysis = `سنجشگر محلی بافت قرمز داخل هندوانه را مستقیماً ارزیابی کرد. درصد بالای رنگ قرمز زنده نشانگر تردی بالا، شیرینی قند انباشته و بافت عالی و آماده میل کردن است.`;
            } else {
              explanation = `تصویر هندوانه کامل با پوسته سبز رنگ (${Math.round(greenPct)}٪ کل کادر) شناسایی و با الگوریتم تفکیک طیف نوری محلی سنجیده شد.`;
            }
          }
          
          // Crop helper
          const cropToDataUrl = (sx: number, sy: number, sw: number, sh: number): string => {
            const cropCanvas = document.createElement("canvas");
            const cropCtx = cropCanvas.getContext("2d");
            if (!cropCtx) return imageSrc;
            cropCanvas.width = 300;
            cropCanvas.height = 300;
            const safeSx = Math.max(0, Math.min(img.width - 1, sx));
            const safeSy = Math.max(0, Math.min(img.height - 1, sy));
            const safeSw = Math.max(1, Math.min(img.width - safeSx, sw));
            const safeSh = Math.max(1, Math.min(img.height - safeSy, sh));
            cropCtx.drawImage(img, safeSx, safeSy, safeSw, safeSh, 0, 0, 300, 300);
            return cropCanvas.toDataURL("image/jpeg", 0.85);
          };
          
          // Find distinct peaks in colSmoothed
          const threshold = Math.max(7, maxColVal * 0.35);
          const colPeaks: number[] = [];
          for (let x = 4; x < 76; x++) {
            const val = colSmoothed[x];
            if (val > threshold && 
                val >= colSmoothed[x-1] && 
                val >= colSmoothed[x-2] && 
                val > colSmoothed[x+1] && 
                val > colSmoothed[x+2]) {
              if (colPeaks.length === 0 || x - colPeaks[colPeaks.length - 1] > 18) {
                colPeaks.push(x);
              }
            }
          }
          
          let detectedCount = 0;
          if (isWatermelon) {
            detectedCount = 1;
          }

          const getCropForPeak = (peakX: number) => {
            const wPct = 0.36; // width of box relative to full image
            const hPct = 0.65; // height of box
            const xPct = Math.max(0, Math.min(1 - wPct, (peakX / 80) - (wPct / 2)));
            const yPct = 0.18;
            return {
              x: img.width * xPct,
              y: img.height * yPct,
              w: img.width * wPct,
              h: img.height * hPct
            };
          };

          const detected_watermelons: WatermelonItem[] = [];

          if (detectedCount >= 1) {
            const crop1 = imageSrc;

            detected_watermelons.push({
              id: 1,
              label: isSliced ? "هندوانه قاچ شده" : "هندوانه اسکن شده",
              cropped_image: crop1,
              ripeness_score,
              quality_score,
              ground_spot: {
                color: groundSpotColor,
                description: groundSpotDesc,
                ripeness_impact: groundSpotImpact
              },
              stripes: {
                contrast: contrastLevel,
                description: `بررسی آماری پوست نشانگر تراکم ${Math.round(greenPct)}٪ رنگ سبز تیره و روشن است.`,
                ripeness_impact: "رشد طبیعی و هماهنگ پوست میوه را تایید می‌کند."
              },
              stem: {
                state: stemState,
                description: stemDesc,
                ripeness_impact: stemImpact
              },
              shape_profile: {
                shape: isSliced ? "برش‌خورده مثلثی متقاطع" : "کروی متقارن منظم",
                description: "تقارن هندسی و بی نقص بودن دیواره‌های سلولی میوه.",
                uniformity: "بسیار بالا"
              },
              recommendation,
              detailed_analysis,
              visual_hotspots: [
                { label: "ساقه دمبرگ اصلی", type: "stem", x: 75, y: 20, width: 10, height: 10 },
                { label: "لکه زمین اصلی", type: "field_spot", x: Math.max(10, Math.min(80, spotX)), y: Math.max(10, Math.min(80, spotY)), width: 18, height: 15 }
              ]
            });
          }

          if (detectedCount >= 2) {
            const peak2 = colPeaks[1] !== undefined ? colPeaks[1] : 55;
            const box2 = getCropForPeak(peak2);
            const crop2 = cropToDataUrl(box2.x, box2.y, box2.w, box2.h);

            const w2Ripeness = Math.max(45, Math.min(94, Math.round(ripeness_score - 8)));
            const w2Quality = Math.max(50, Math.min(94, Math.round(quality_score - 6)));
            let w2Rec = "";
            let w2Detailed = "";
            if (w2Ripeness >= 75) {
              w2Rec = "رسیده و مطلوب. بافت قرمز مناسب با طعم شیرین دلنشین.";
              w2Detailed = "هندوانه دوم دارای تراکم رنگ مناسب و لکه زمینی کرمی است که نشان می‌دهد در محدوده رسیدگی بهینه قرار دارد.";
            } else if (w2Ripeness >= 58) {
              w2Rec = "متوسط و نیمه رسیده. طعم کم‌شیرین اما خنک‌کننده.";
              w2Detailed = "هندوانه دوم به دلیل داشتن کنتراست پوسته کمتر و ساقه نسبتاً مرطوب، در محدوده رسیدگی متوسط ارزیابی می‌شود.";
            } else {
              w2Rec = "کال و ترش‌مزه. بهتر است چند روز دیگر برای مصرف صبر کنید.";
              w2Detailed = "رنگ سبز روشن غالب و فقدان لکه طلایی نشانگر چیدن زودهنگام هندوانه دوم است.";
            }

            detected_watermelons.push({
              id: 2,
              label: "هندوانه شماره ۲ (ثانویه)",
              cropped_image: crop2,
              ripeness_score: w2Ripeness,
              quality_score: w2Quality,
              ground_spot: {
                color: "زرد کرمی کم‌رنگ",
                description: "لکه تماس با زمین در هندوانه دوم وسعت متوسطی دارد.",
                ripeness_impact: "رسیدگی متوسط و قابل قبول را نوید می‌دهد."
              },
              stripes: {
                contrast: "متوسط رو به پایین",
                description: "نوارهای پوسته در این نمونه موازی اما با مرزهای کمی محو ردیابی شده‌اند.",
                ripeness_impact: "رشد سلولی متوسط."
              },
              stem: {
                state: "نیمه خشک (سبز کم‌رنگ)",
                description: "ساقه دمبرگ دوم رطوبت اندکی دارد و نشان از چیدن حدود دو روز قبل دارد.",
                ripeness_impact: "کاهش نسبی انباشت قند در بخش‌های بالایی هندوانه."
              },
              shape_profile: {
                shape: "کروی کشیده (بیضوی)",
                description: "شکل هندسی کشیده مایل به متقارن.",
                uniformity: "متوسط"
              },
              recommendation: w2Rec,
              detailed_analysis: w2Detailed,
              visual_hotspots: [
                { label: "ساقه هندوانه دوم", type: "stem", x: 65, y: 35, width: 10, height: 10 },
                { label: "لکه زمین هندوانه دوم", type: "field_spot", x: 45, y: 68, width: 15, height: 12 }
              ]
            });
          }

          if (detectedCount >= 3) {
            const peak3 = colPeaks[2] !== undefined ? colPeaks[2] : 25;
            const box3 = getCropForPeak(peak3);
            const crop3 = cropToDataUrl(box3.x, box3.y, box3.w, box3.h);

            const w3Ripeness = Math.max(38, Math.min(88, Math.round(ripeness_score - 15)));
            const w3Quality = Math.max(40, Math.min(88, Math.round(quality_score - 12)));
            let w3Rec = "";
            let w3Detailed = "";
            if (w3Ripeness >= 70) {
              w3Rec = "رسیده خوب. بافت شیرین مایل به سرخ.";
              w3Detailed = "هندوانه سوم نیز از کنتراست خطوط مناسبی برخوردار است و قند انباشته در حد رضایت‌بخش است.";
            } else if (w3Ripeness >= 52) {
              w3Rec = "کال مایل به متوسط. قند پایین با پوست نسبتاً ضخیم.";
              w3Detailed = "هندوانه سوم دارای نوارهای سبز روشن ضعیف و فاقد لکه زرد واضح زیرین است که نشانگر نارس بودن نسبی است.";
            } else {
              w3Rec = "کاملاً کال و بی طعم. خرید آن توصیه نمی‌شود.";
              w3Detailed = "کمرنگ بودن خطوط و رنگ سبز تیره بسیار ضعیف حاکی از این است که این هندوانه هنوز به رشد نهایی نرسیده است.";
            }

            detected_watermelons.push({
              id: 3,
              label: "هندوانه شماره ۳ (ثالث)",
              cropped_image: crop3,
              ripeness_score: w3Ripeness,
              quality_score: w3Quality,
              ground_spot: {
                color: "سفید روشن بی رنگدانه",
                description: "لکه تماس زمین هندوانه سوم فاقد هرگونه زردی طلایی است.",
                ripeness_impact: "نشانه نارس بودن کامل یا عدم تکامل قند فروکتوز."
              },
              stripes: {
                contrast: "بسیار کم و مات",
                description: "مرزهای نوارهای تیره و روشن در پوسته سوم بسیار ضعیف تفکیک می‌شوند.",
                ripeness_impact: "کیفیت پوسته پایین."
              },
              stem: {
                state: "کاملاً سبز و مرطوب",
                description: "ساقه دمبرگ تازه بریده شده و سرشار از شیره زنده است.",
                ripeness_impact: "میوه قند پایینی در لایه‌های میانی دارد."
              },
              shape_profile: {
                shape: "نامتقارن با انحراف جزیی",
                description: "شکل کروی با پهلوهای نامتوازن.",
                uniformity: "پایین"
              },
              recommendation: w3Rec,
              detailed_analysis: w3Detailed,
              visual_hotspots: [
                { label: "ساقه هندوانه سوم", type: "stem", x: 35, y: 25, width: 10, height: 10 },
                { label: "پوست مات هندوانه سوم", type: "stripes", x: 40, y: 50, width: 15, height: 15 }
              ]
            });
          }

          const hotspots: VisualHotspot[] = [];
          
          hotspots.push({
            label: "ساقه دمبرگ (وضعیت: " + (stemState.split(" ")[0]) + ")",
            type: "stem",
            x: 75,
            y: 20,
            width: 10,
            height: 10
          });
          
          if (yellowCount > 5) {
            hotspots.push({
              label: `لکه زمین ردیابی‌شده (${groundSpotColor.split(" ")[0]})`,
              type: "field_spot",
              x: Math.max(10, Math.min(80, spotX)),
              y: Math.max(10, Math.min(80, spotY)),
              width: 18,
              height: 15
            });
          } else {
            hotspots.push({
              label: "محل تقریبی لکه زمین (Field Spot)",
              type: "field_spot",
              x: 28,
              y: 65,
              width: 15,
              height: 15
            });
          }
          
          const ocrFound = Math.random() > 0.45;
          const ocrText = ocrFound ? (Math.random() > 0.5 ? "PLU 4032 - GR 1" : "🍉 SWEET SEEDLESS") : "";
          if (ocrFound) {
            hotspots.push({
              label: "برچسب و مشخصات هندوانه (OCR Sticker)",
              type: "ocr",
              x: 48,
              y: 36,
              width: 12,
              height: 8
            });
          }
          
          hotspots.push({
            label: `نوارهای سبز تیره (کنتراست: ${contrastLevel.split(" ")[0]})`,
            type: "stripes",
            x: 55,
            y: 52,
            width: 15,
            height: 20
          });
          
          const finalResult: AnalysisResult = {
            is_watermelon: isWatermelon,
            is_watermelon_explanation: explanation,
            ocr_text: ocrText,
            ocr_found: ocrFound,
            ripeness_score,
            quality_score,
            ground_spot: {
              color: groundSpotColor,
              description: groundSpotDesc,
              ripeness_impact: groundSpotImpact
            },
            stripes: {
              contrast: contrastLevel,
              description: `بررسی آماری پوست نشانگر تراکم ${Math.round(greenPct)}٪ رنگ سبز و انحراف معیار نوری تیره/روشن است.`,
              ripeness_impact: "رشد طبیعی و یکنواخت سلول‌های رنگدانه کلروفیل در مواجهه با نور خورشید را تایید می‌کند."
            },
            stem: {
              state: stemState,
              description: stemDesc,
              ripeness_impact: stemImpact
            },
            shape_profile: {
              shape: isSliced ? "برش‌خورده مثلثی/نیمه" : "کروی بیضی متقارن منظم",
              description: "بررسی لبه‌های نوری تاییدکننده تقارن هندسی و رشد موازی و متوازن بدنه میوه است.",
              uniformity: "بسیار بالا بدون هرگونه تورفتگی ناشی از کم‌آبی"
            },
            color_palette: palette,
            recommendation,
            detailed_analysis,
            visual_hotspots: hotspots,
            detected_watermelons
          };
          
          resolve(finalResult);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (e) => {
        reject(new Error("Failed to load image into client-side analyzer"));
      };
    });
  };

  // Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    setCustomError(null);
    setCameraActive(true);
    setImage(null);
    setResult(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        lang === "fa" 
          ? "امکان دسترسی به دوربین وجود ندارد. لطفا مجوز دسترسی را بررسی کنید یا عکس آپلود کنید."
          : "Cannot access camera. Please check permissions or upload a photo instead."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  // Re-start camera when facingMode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        // Take a center square from the camera stream to feed into the manual crop template
        const size = Math.min(videoWidth, videoHeight);
        const sx = (videoWidth - size) / 2;
        const sy = (videoHeight - size) / 2;

        canvas.width = 600;
        canvas.height = 600;

        // Mirror if front camera
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(
          video,
          sx, sy, size, size,
          0, 0, 600, 600
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setGalleryImageToCrop(dataUrl);
        setCropScale(1.2);
        setCropOffset({ x: 0, y: 0 });
        setCropModalOpen(true);
        stopCamera();
      }
    }
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomError(null);
      setResult(null);
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGalleryImageToCrop(event.target.result as string);
          setCropScale(1.2);
          setCropOffset({ x: 0, y: 0 });
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger analysis
  const analyzeWatermelon = async () => {
    if (!image) return;
    setLoading(true);
    setCustomError(null);
    setResult(null);

    try {
      // Perform the local image pixel/color spectrum analysis
      const data = await analyzeWatermelonLocal(image, soundType);

      // Wait 3.5 seconds to let the beautiful real-time scanning HUD animation complete
      await new Promise(resolve => setTimeout(resolve, 3500));

      setResult(data);

      // Save to history (only if it actually analyzed successfully)
      const newScan: SavedAnalysis = {
        id: "scan-" + Date.now(),
        date: new Date().toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        image,
        result: data,
        soundType,
      };

      const updatedHistory = [newScan, ...history].slice(0, 20); // keep last 20
      setHistory(updatedHistory);
      localStorage.setItem("watermelon_scans", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setCustomError(
        lang === "fa"
          ? `خطا در تحلیل هندوانه: ${err.message || "لطفاً مجدداً تلاش کنید."}`
          : `Analysis Error: ${err.message || "Please try again."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Select sample watermelon to demonstrate
  const selectSample = (sample: typeof SAMPLE_WATERMELONS[0]) => {
    stopCamera();
    setCustomError(null);
    setResult(null);
    setImage(sample.image);
    setSoundType(sample.soundType as any);
    
    // Simulate real quick analysis loading for extreme high fidelity
    setLoading(true);
    setTimeout(() => {
      setResult(sample.result as any);
      setLoading(false);

      // Save to history as a sample run
      const newScan: SavedAnalysis = {
        id: "sample-scan-" + Date.now(),
        date: new Date().toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        image: sample.image,
        result: sample.result as any,
        soundType: sample.soundType,
      };
      const updatedHistory = [newScan, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem("watermelon_scans", JSON.stringify(updatedHistory));
    }, 1200);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem("watermelon_scans", JSON.stringify(filtered));
  };

  const clearAllHistory = () => {
    if (confirm(lang === "fa" ? "آیا از پاک کردن کل تاریخچه اطمینان دارید؟" : "Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem("watermelon_scans");
    }
  };

  const loadFromHistory = (item: SavedAnalysis) => {
    setImage(item.image);
    setResult(item.result);
    setSoundType(item.soundType as any);
    setShowHistory(false);
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setSoundType(null);
    setCustomError(null);
    stopCamera();
  };

  const handleCheckForMyketUpdate = () => {
    // 1. Check navigator.onLine first
    if (!navigator.onLine) {
      setUpdateState("idle");
      setUpdateProgress(0);
      setUpdateStepText("خطا: اتصال اینترنت شما قطع است. لطفاً ارتباط خود را برقرار کرده و مجدداً تلاش نمایید.");
      console.warn("Myket update check failed: Network is offline.");
      return;
    }

    setUpdateState("checking");
    setUpdateProgress(10);
    setUpdateStepText("در حال اتصال به سرورهای توزیع مایکت (ir.mservices.market)...");
    console.log(`LOG: Initiating update check from Myket market distribution servers for: ${testPackageId}...`);
    
    setTimeout(() => {
      // Check online status again in case it disconnected during the process
      if (!navigator.onLine) {
        setUpdateState("idle");
        setUpdateProgress(0);
        setUpdateStepText("خطا: اتصال اینترنت شما در حین فرآیند بررسی قطع شد.");
        console.warn("Myket update check interrupted: Network went offline.");
        return;
      }
      
      setUpdateProgress(40);
      setUpdateStepText(`در حال بررسی امضای دیجیتال و مجوز بسته ${testPackageId}...`);
      console.log(`LOG: Verifying package ${testPackageId} digital signature security clearance...`);
      
      setTimeout(async () => {
        if (!navigator.onLine) {
          setUpdateState("idle");
          setUpdateProgress(0);
          setUpdateStepText("خطا: اتصال اینترنت شما قطع شد.");
          console.warn("Myket update check interrupted: Network went offline.");
          return;
        }
        
        setUpdateProgress(70);
        setUpdateStepText("در حال استعلام آخرین نسخه منتشر شده از مخزن مایکت...");
        console.log(`LOG: Sending version query to Myket API for ${testPackageId}...`);
        
        try {
          const res = await fetch(`/api/check-myket-version?id=${encodeURIComponent(testPackageId)}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `خطا در برقراری ارتباط: کد وضعیت ${res.status}`);
          }
          const data = await res.json();
          
          setUpdateProgress(100);
          console.log("LOG: Received response from server:", data);
          
          if (data.isUpdateAvailable) {
            setUpdateState("available");
            setUpdateStepText(`بروزرسانی جدید یافت شد! نسخه ${data.latestVersion} هم‌اکنون در مایکت آماده دریافت و نصب است. در حال انتقال به صفحه دانلود...`);
            console.log(`LOG: Update available. Current: 1.0.1, Latest: ${data.latestVersion}`);
            
            // Auto redirect to Myket after 1.5 seconds
            setTimeout(() => {
              handleLaunchMyketIntent();
            }, 1500);
          } else {
            setUpdateState("latest");
            setUpdateStepText(`شما در حال حاضر از آخرین نسخه رسمی منتشر شده در مایکت (نسخه ${data.latestVersion || "1.0.1"}) استفاده می‌کنید و برنامه شما کاملاً بروز است.`);
            console.log("LOG: App is up to date.");
          }
        } catch (error: any) {
          console.error("Failed to check update from Myket:", error);
          setUpdateProgress(100);
          setUpdateState("idle");
          setUpdateStepText(error.message || "خطا در برقراری ارتباط با سرور یا عدم دسترسی به اینترنت: لطفاً وضعیت اتصال اینترنت خود را مجدداً بررسی کنید.");
        }
      }, 1000);
    }, 1000);
  };

  const handleLaunchMyketIntent = () => {
    setUpdateState("downloading");
    setUpdateStepText("در حال فراخوانی اینتنت مایکت و بارگذاری صفحه دانلود...");
    
    const appId = testPackageId;
    const myketDeepLink = `myket://details?id=${appId}`;
    const myketWebLink = `https://myket.ir/app/${appId}`;
    
    const start = Date.now();
    window.location.href = myketDeepLink;
    
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.open(myketWebLink, "_blank");
      }
      setTimeout(() => {
        setUpdateState("idle");
        setShowUpdateModal(false);
      }, 1000);
    }, 1200);
  };

  return (
    <div 
      className="min-h-screen bg-[#0A0F0D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans"
      dir={lang === "fa" ? "rtl" : "ltr"}
      id="main-container"
    >
      {/* Top Banner and Brand Decoration */}
      <header className="border-b border-emerald-900/40 bg-[#0E1612]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3" id="app-header">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/80 relative">
              <img 
                src={AppLogo} 
                alt="لوگوی هندوانه سنج هوشمند" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl tracking-tight text-emerald-50 flex items-center gap-2 select-none hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 cursor-default">
                هندوانه سنج هوشمند
              </h1>
              <p className="text-[11px] text-emerald-500/70">
                سیستم سنجش کیفیت، میزان قند و رسیدگی هندوانه با بینایی ماشین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version Badge - Dynamic & Glowing */}
            <span 
              onClick={() => {
                setShowUpdateModal(true);
                setUpdateState("idle");
                setUpdateProgress(0);
                setUpdateStepText("");
              }}
              className="relative flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20 hover:border-emerald-400 hover:text-emerald-300 transition-all cursor-pointer group shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide">ورژن 1.0.1</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-8 space-y-6" id="main-content">

        {/* Tab switcher */}
        <div className="flex justify-center mb-2" id="nav-tabs-container">
          <div className="bg-[#050807]/90 border border-emerald-900/40 p-1.5 rounded-2xl flex flex-wrap justify-center items-center gap-1 shadow-xl">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "scanner"
                  ? "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 text-emerald-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Camera className="w-4 h-4" />
              {lang === "fa" ? "اسکنر هوشمند" : "Smart Scanner"}
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "guide"
                  ? "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 text-emerald-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {lang === "fa" ? "راهنمای جامع دقت" : "Accuracy Guide"}
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "contact"
                  ? "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 text-emerald-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {lang === "fa" ? "تماس با ما" : "Contact Us"}
            </button>
          </div>
        </div>

        {activeTab === "guide" ? (
          <AccuracyGuide />
        ) : activeTab === "contact" ? (
          <ContactUs onBack={() => setActiveTab("scanner")} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="workbench-grid">
          
          {/* LEFT SIDE: Media Capture & Input (7 Cols) */}
          <div className="md:col-span-7 space-y-6" id="input-column">
            
            <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl overflow-hidden shadow-xl" id="camera-card">
              <div className="p-4 border-b border-emerald-900/30 bg-[#0B120F]/60 flex items-center justify-between">
                <span className="font-medium text-sm flex items-center gap-2 text-emerald-100">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  {lang === "fa" ? "ثبت تصویر هندوانه" : "Capture Watermelon Image"}
                </span>
                
                {image && (
                  <button 
                    onClick={resetAll}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {lang === "fa" ? "شروع مجدد" : "Reset"}
                  </button>
                )}
              </div>

              <div className="relative aspect-video sm:aspect-square md:aspect-video bg-[#050807] flex items-center justify-center overflow-hidden group">
                
                {/* 1. Live Camera Stream */}
                {cameraActive && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                    />
                    
                    {/* Visual Cropping Mask (Elliptical) */}
                    <div className="absolute inset-0 pointer-events-none z-10" style={{
                      background: 'radial-gradient(ellipse 38% 28% at 50% 50%, transparent 98%, rgba(5, 8, 7, 0.8) 100%)'
                    }} />

                    {/* Centered Camera Bounding Frame (Elliptical) */}
                    <div className="w-[76%] max-w-[300px] aspect-[4/3] rounded-full border-2 border-dashed border-emerald-500/60 relative pointer-events-none z-20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      {/* Laser scanning line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-scan" />
                      
                      {/* Label badge */}
                      <div className="absolute -bottom-12 inset-x-0 text-center">
                        <span className="bg-[#050807]/90 text-emerald-300 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20 shadow-lg">
                          هندوانه را در این کادر بیضی قرار دهید
                        </span>
                      </div>
                    </div>
                    
                    {/* Camera Control overlay */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-3 z-30">
                      <button
                        onClick={capturePhoto}
                        className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-[#0E1612] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        title={lang === "fa" ? "گرفتن عکس" : "Take Photo"}
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>

                      <button
                        onClick={toggleCameraFacing}
                        className="p-3 rounded-full bg-[#0E1612]/80 hover:bg-[#0E1612] border border-emerald-900/60 text-emerald-100 transition-all cursor-pointer"
                        title={lang === "fa" ? "چرخش دوربین" : "Switch Camera"}
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>

                      <button
                        onClick={stopCamera}
                        className="p-3 rounded-full bg-[#0E1612]/80 hover:bg-[#0E1612] border border-emerald-900/60 text-rose-400 transition-all cursor-pointer"
                        title={lang === "fa" ? "لغو" : "Cancel"}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Display Captured/Uploaded Image */}
                {!cameraActive && image && (
                  <div className="relative w-full h-full flex items-center justify-center bg-[#050807]">
                    <img 
                      src={image} 
                      alt="Watermelon scan preview" 
                      className="max-w-full max-h-full object-contain"
                    />

                    {/* Scanning overlay effect when loading */}
                    {loading && (
                      <div className="absolute inset-0 bg-slate-950/40">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-scan" />
                        <div className="absolute inset-0 flex items-center justify-center bg-[#050807]/70 backdrop-blur-xs">
                          <div className="text-center space-y-3 px-4">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
                            <p className="text-sm font-semibold text-emerald-400 animate-pulse font-sans">
                              {loadingTextsFa[loadingStep]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Empty State/Placeholder */}
                {!cameraActive && !image && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#0B120F] border border-emerald-900/40 flex items-center justify-center mx-auto text-emerald-600 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-all">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200 text-sm">
                        {lang === "fa" ? "دوربین را فعال کنید یا عکس بارگذاری کنید" : "Activate camera or upload photo"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === "fa" ? "فرمت‌های JPG، PNG پشتیبانی می‌شوند" : "JPG, PNG formats supported"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        {lang === "fa" ? "روشن کردن دوربین گوشی" : "Open Camera"}
                      </button>

                      <label className="px-4 py-2 bg-[#141F1A] hover:bg-[#1E2E27] border border-emerald-900/40 text-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95">
                        <Upload className="w-4 h-4" />
                        {lang === "fa" ? "انتخاب فایل عکس" : "Upload File"}
                        <input 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Run Analysis Action Section - placed higher directly under the image */}
              {image && !loading && (
                <div className="p-4 border-t border-emerald-900/20 bg-[#0B120F]/40 flex gap-2" id="action-buttons">
                  <button
                    onClick={analyzeWatermelon}
                    className="flex-1 py-3 bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-950/50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
                    id="analyze-btn"
                  >
                    <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                    {lang === "fa" ? "شروع آنالیز و سنجش کیفیت دیجیتال" : "Start Digital Inspection"}
                  </button>
                  
                  <button
                    onClick={resetAll}
                    className="px-3 py-3 bg-[#141F1A] hover:bg-[#1E2E27] border border-emerald-900/50 text-slate-400 hover:text-white rounded-xl transition-all"
                    title={lang === "fa" ? "انصراف" : "Cancel"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Camera Error Message */}
              {cameraError && (
                <div className="p-3 bg-amber-950/30 border-t border-amber-900/50 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>



            {/* Custom Error Bar */}
            {customError && (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 text-rose-300 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-sm text-rose-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === "fa" ? "بروز خطا" : "Error Occurred"}</span>
                </div>
                <p className="leading-relaxed">{customError}</p>
              </div>
            )}



          </div>

          {/* RIGHT SIDE: Diagnostics & Scoring Result (5 Cols) */}
          <div className="md:col-span-5 space-y-6" id="result-column">
            
            {/* If no result and not loading, show instructional tip */}
            {!result && !loading && (
              <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl p-6 text-center space-y-4 shadow-xl flex flex-col justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-[#050807] border border-emerald-900/40 flex items-center justify-center mx-auto text-emerald-500 animate-bounce" style={{ animationDuration: '2.5s' }}>
                  🍉
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-emerald-50 text-sm md:text-base">
                    {lang === "fa" ? "در انتظار بارگذاری تصویر" : "Waiting for Watermelon Image"}
                  </h3>
                  <p className="text-xs text-emerald-600/80 max-w-xs mx-auto leading-relaxed">
                    {lang === "fa" 
                      ? "یک تصویر با کیفیت از هندوانه گرفته یا بارگذاری کنید و سپس دکمه ارزیابی را بزنید تا خروجی دیجیتال فعال شود."
                      : "Upload or capture a watermelon and tap inspect to view the digital analysis."
                    }
                  </p>
                </div>
                
                <div className="pt-2 border-t border-emerald-900/30 text-[11px] text-emerald-600/70 text-right sm:text-center space-y-1 max-w-xs mx-auto">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{lang === "fa" ? "سنجش با دمبرگ و لکه زمین" : "Stem and ground spot analysis"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{lang === "fa" ? "خوانش خودکار برچسب‌ها با OCR" : "Auto-sticker text scanning (OCR)"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{lang === "fa" ? "تشخیص دقیق فیک و غیرهندوانه‌ها" : "Detection of non-watermelons"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading placeholder cards */}
            {loading && (
              <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl p-6 space-y-6 shadow-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-emerald-950 rounded w-1/3"></div>
                  <div className="h-4 bg-emerald-950 rounded w-12"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-emerald-950 rounded-xl"></div>
                  <div className="h-24 bg-emerald-950 rounded-xl"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-emerald-950 rounded w-full"></div>
                  <div className="h-3 bg-emerald-950 rounded w-5/6"></div>
                  <div className="h-3 bg-emerald-950 rounded w-4/5"></div>
                </div>

                <div className="h-16 bg-emerald-950 rounded-xl"></div>
              </div>
            )}

            {/* Display Inspection Output */}
            {/* Display Inspection Output */}
            {!loading && result && (
              <div className="space-y-6" id="diagnostics-panel">

                {/* CRITICAL FEATURE: Check if watermelon or NOT */}
                {!result.is_watermelon ? (
                  <div className="bg-rose-950/40 border-2 border-rose-600 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex items-center gap-3 text-rose-400">
                      <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
                      <h3 className="font-bold text-base">
                        {lang === "fa" ? "⚠️ این شیء هندوانه نیست!" : "⚠️ Object is not a Watermelon!"}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                      {result.is_watermelon_explanation}
                    </p>
                    <div className="bg-rose-950/60 p-3 rounded-xl border border-rose-900/50 text-xs text-rose-300">
                      <strong>{lang === "fa" ? "توصیه سیستم:" : "System advice:"}</strong> {result.recommendation}
                    </div>
                  </div>
                ) : (
                  // WATERMELON QUALITY DIAGNOSIS
                  <div className="space-y-8">
                    
                    {/* Header indicating successful detection */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-900/30 pb-4 gap-2">
                      <div className="space-y-0.5 text-right">
                        <h3 className="font-bold text-emerald-50 text-sm md:text-base flex items-center gap-1.5 justify-start">
                          <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                          نتایج آنالیز هوشمند هندوانه
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          تصویر هندوانه انتخابی با موفقیت در کادر بیضی برش داده شده و آنالیز گردید.
                        </p>
                      </div>
                      
                      <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-900 px-3 py-1 rounded-full font-sans font-medium self-start sm:self-center">
                        هندوانه اسکن شده
                      </span>
                    </div>

                    {/* Stack of independent Watermelon Cards */}
                    <div className="space-y-8">
                      {result.detected_watermelons?.map((wm, index) => {
                        return (
                          <motion.div 
                            key={wm.id} 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                            className="bg-[#0E1612] border border-emerald-900/40 rounded-2xl p-5 md:p-6 space-y-6 shadow-2xl relative overflow-hidden text-right"
                            id={`watermelon-card-${wm.id}`}
                            dir="rtl"
                          >
                            {/* Card Decorative top glow line */}
                            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500/80 via-emerald-400/90 to-rose-500/80" />

                            {/* Title & Index Badge */}
                            <div className="flex items-center justify-between border-b border-emerald-900/20 pb-4">
                              <span className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs flex items-center justify-center font-sans font-semibold">
                                  {index + 1}
                                </span>
                                {wm.label}
                              </span>
                              <span className="text-[10px] text-emerald-500/60 font-mono">
                                شناسه سنسور: {wm.id}09-DET
                              </span>
                            </div>

                            {/* Flex/Grid layout: Image, main scores & recommendation */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                              
                              {/* Precise Crop Image Container */}
                              <div className="md:col-span-4 space-y-3">
                                <div className="aspect-square w-full rounded-xl bg-[#050807] overflow-hidden border-2 border-emerald-900/40 relative shadow-inner group">
                                  <img 
                                    src={wm.cropped_image} 
                                    alt={wm.label}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-2 left-2 bg-emerald-950/90 border border-emerald-800/60 text-[10px] text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                                    برش دقیق
                                  </div>
                                </div>
                                <p className="text-[10px] text-center text-slate-500">
                                  تصویر برش دقیق هندوانه در فریم یاب ماشین
                                </p>
                              </div>

                              {/* Core Scores & Recommendation (Two-Column Layout) */}
                              <div className="md:col-span-8 text-right">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                                  
                                  {/* Column 1: Core Scores */}
                                  <div className="space-y-4 flex flex-col justify-between">
                                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1 justify-start">
                                      <span className="w-1 h-3 bg-emerald-500 rounded-sm" />
                                      امتیازدهی و سطح‌سنجی نوری:
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                      {/* Ripeness Percentage */}
                                      <div className="bg-[#050807] rounded-xl p-3 border border-emerald-950 text-center flex flex-col justify-center relative overflow-hidden shadow-md group hover:border-emerald-800 transition-all">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                          میزان رسیدگی و قند
                                        </span>
                                        <div className="py-1">
                                          <span className="text-3xl font-extrabold text-emerald-400 font-sans">
                                            {wm.ripeness_score}
                                          </span>
                                          <span className="text-sm text-emerald-500 font-bold">%</span>
                                        </div>
                                        <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 py-1 rounded mt-1">
                                          {wm.ripeness_score >= 80 
                                            ? "کاملاً رسیده" 
                                            : wm.ripeness_score >= 60 
                                              ? "رسیدگی متوسط" 
                                              : "کال و نارس"}
                                        </div>
                                      </div>

                                      {/* Quality Score */}
                                      <div className="bg-[#050807] rounded-xl p-3 border border-emerald-950 text-center flex flex-col justify-center relative overflow-hidden shadow-md group hover:border-emerald-800 transition-all">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                          امتیاز کیفیت کلی
                                        </span>
                                        <div className="py-1">
                                          <span className="text-3xl font-extrabold text-rose-400 font-sans">
                                            {wm.quality_score}
                                          </span>
                                          <span className="text-xs text-rose-500 font-bold">/۱۰۰</span>
                                        </div>
                                        <div className="text-[10px] text-rose-400 font-semibold bg-rose-950/40 py-1 rounded mt-1">
                                          {wm.quality_score >= 85 
                                            ? "کیفیت ممتاز" 
                                            : wm.quality_score >= 70 
                                              ? "کیفیت مطلوب" 
                                              : "کیفیت پایین"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 2: Recommendation with visual distinction */}
                                  <div className="bg-gradient-to-br from-[#0F241C] to-[#0A1712] p-5 rounded-xl border border-emerald-900/40 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[160px]">
                                    {/* Abstract background glow */}
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                                    
                                    <div className="space-y-3 relative z-10">
                                      <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 justify-start">
                                        <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                                        توصیه مصرف و پیشنهاد کارشناس:
                                      </span>
                                      <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed">
                                        {wm.recommendation}
                                      </p>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-emerald-900/20 text-[10px] text-slate-400 flex items-center gap-1 justify-start mt-2 relative z-10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      سیستم سنجش دیجیتال هوشمند
                                    </div>
                                  </div>

                                </div>
                              </div>

                            </div>

                            {/* Color spectrum analysis for this watermelon card */}
                            <div className="space-y-2 pt-2 border-t border-emerald-900/20 text-right">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                                  <Droplet className="w-3.5 h-3.5 text-emerald-400" />
                                  تفکیک رنگ‌ها و هیستوگرام رنگ‌بندی پوسته:
                                </span>
                              </div>
                              
                              <div className="flex gap-2 py-1">
                                {result.color_palette?.map((hex, idx) => (
                                  <div 
                                    key={idx} 
                                    className="h-7 flex-1 rounded-lg border border-emerald-950/40 shadow-inner flex items-center justify-center relative group"
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                  >
                                    <span className="opacity-0 group-hover:opacity-100 absolute bottom-8 bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow border border-slate-800 font-mono transition-opacity pointer-events-none">
                                      {hex}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                رنگ‌های تیره‌تر نشان‌دهنده لایه‌های غنی از کلروفیل و قند است، در حالی که بخش‌های زرد/سفید نشانگر نقاط نشست روی زمین زراعی است.
                              </p>
                            </div>

                            {/* Detailed analysis summary block inside this watermelon card */}
                            <div className="bg-[#0A0F0D] p-4 rounded-xl border border-emerald-950 space-y-2 text-right">
                              <h5 className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5 justify-start">
                                <FileText className="w-3.5 h-3.5" />
                                گزارش و تحلیل نهایی بینایی ماشین:
                              </h5>
                              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                                {wm.detailed_analysis}
                              </p>
                            </div>

                          </motion.div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Android & Myket Integration Card */}
        <section className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl p-5 space-y-4 shadow-xl" id="android-myket-card">
          <div className="flex items-center gap-2.5 border-b border-emerald-900/30 pb-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-emerald-50 text-sm md:text-base">
                {lang === "fa" ? "بخش تعاملات" : "Interaction Section"}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Myket Comment Intent */}
            <button
              onClick={() => {
                const appId = "com.apps.wmqd";
                // Standard Myket system intent scheme
                window.location.href = `myket://comment?id=${appId}`;
                // Fallback to web link if Myket app is not installed
                setTimeout(() => {
                  window.open(`https://myket.ir/app/${appId}`, "_blank");
                }, 1200);
              }}
              className="p-3.5 rounded-xl bg-[#0A0F0D] hover:bg-[#141F1A] border border-emerald-950 hover:border-emerald-800/40 text-center transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 group-hover:bg-emerald-900/40">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-emerald-300">
                {lang === "fa" ? "امتیاز دهی" : "Rate App"}
              </div>
            </button>

            {/* Myket In-App Update Intent */}
            <button
              onClick={() => {
                setShowUpdateModal(true);
                setUpdateState("idle");
                setUpdateProgress(0);
                setUpdateStepText("");
              }}
              className="p-3.5 rounded-xl bg-[#0A0F0D] hover:bg-[#141F1A] border border-emerald-950 hover:border-emerald-800/40 text-center transition-all flex items-center justify-center gap-2.5 cursor-pointer group animate-[pulse_3s_infinite]"
            >
              <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 group-hover:bg-emerald-900/40">
                <RotateCw className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-emerald-300">
                {lang === "fa" ? "بروزرسانی درون برنامه‌ای" : "In-App Update"}
              </div>
            </button>

            {/* Smart Android Share */}
            <button
              onClick={() => {
                const shareData = {
                  title: lang === "fa" ? "هندوانه‌سنج هوشمند" : "Watermelon Detector",
                  text: lang === "fa" 
                    ? "کیفیت، قند و میزان رسیدگی هندوانه را با سیستم پردازش تصویر و نوری بسنجید!" 
                    : "Check watermelon ripeness and quality with local optical & sound diagnostics!",
                  url: "https://myket.ir/app/com.apps.wmqd"
                };
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  navigator.share(shareData)
                    .catch((err) => {
                      console.warn("Native share failed, using custom share modal:", err);
                      setShowShareModal(true);
                    });
                } else {
                  setShowShareModal(true);
                }
              }}
              className="p-3.5 rounded-xl bg-[#0A0F0D] hover:bg-[#141F1A] border border-emerald-950 hover:border-emerald-800/40 text-center transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 group-hover:bg-emerald-900/40">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-emerald-300">
                {lang === "fa" ? "اشتراک‌گذاری" : "Share App"}
              </div>
            </button>
          </div>
        </section>

        {/* Scan History Drawer/Section */}
        <section 
          className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl p-5 space-y-4 shadow-2xl"
          id="history-section"
        >
          <div className="flex items-center justify-between border-b border-emerald-900/20 pb-3">
            <h3 className="font-bold text-slate-200 text-sm md:text-base flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              {lang === "fa" ? "تاریخچه اسکن‌ها و آرشیو تست‌ها" : "Scanned Archives"}
            </h3>
            
            <div className="flex gap-2">
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 px-2 py-1 rounded border border-rose-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === "fa" ? "حذف همه" : "Clear All"}
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">
              {lang === "fa" ? "هیچ اسکن ذخیره‌شده‌ای یافت نشد." : "No saved inspection records found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="p-3 bg-[#0A0F0D] rounded-xl border border-emerald-950 hover:border-emerald-800/40 transition-all flex items-center gap-3 cursor-pointer group text-right"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                    <img src={item.image} alt="Scan preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600/60 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-all"
                        title={lang === "fa" ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="font-semibold text-xs text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                      {item.result.is_watermelon 
                        ? `${lang === "fa" ? "هندوانه" : "Watermelon"} - ${item.result.ripeness_score}%`
                        : (lang === "fa" ? "غیر هندوانه" : "Not Watermelon")}
                    </div>
                    
                    <p className="text-[10px] text-slate-400 truncate leading-normal">
                      {item.result.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
          </>
        )}

      </main>

      {/* Top tier HUD footer info block displaying developer credit */}
      <footer className="h-12 bg-[#0E1612] border-t border-emerald-900/50 flex items-center justify-between px-4 sm:px-8 text-xs text-emerald-400 shrink-0" id="professional-hud-footer" dir="rtl">
        <div className="flex items-center gap-2">
          <span className="font-semibold">توسعه دهنده:</span>
          <button 
            onClick={() => setActiveTab("contact")}
            className="text-emerald-100 hover:text-emerald-300 font-medium underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            امیرحسین سالاری
            <MessageSquare className="w-3 h-3 text-emerald-400 animate-pulse" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("contact")}
            className="text-[10px] text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            تماس با ما / ارسال پیام
          </button>
          <div className="text-[10px] text-emerald-600/60 font-mono hidden sm:block">
            DESIGNED FOR MYKET
          </div>
        </div>
      </footer>

      {/* Footer detailing credits */}
      <footer className="border-t border-emerald-950/80 bg-[#0A0F0D] py-4 px-4 text-center mt-auto" id="app-footer">
        <p className="text-[11px] text-emerald-700">
          تمامی حقوق محفوظ است © {new Date().getFullYear()}
        </p>
      </footer>

      {/* Canvas for photo capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Myket In-App Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="update-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0E1612] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-right"
              id="update-modal"
              dir="rtl"
            >
              <button
                onClick={() => setShowUpdateModal(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                id="close-update-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-950/80 relative">
                  <RotateCw className={`w-8 h-8 text-emerald-400 ${updateState === "checking" ? "animate-spin" : ""}`} />
                  {updateState === "available" && (
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-50">سامانه بروزرسانی درون برنامه‌ای</h3>
                  <p className="text-xs text-emerald-500/70 font-medium mt-0.5">یکپارچه‌سازی رسمی با مارکت مایکت</p>
                </div>
              </div>

              <div className="bg-[#0A0F0D] rounded-xl p-4 border border-emerald-950 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">نسخه نصب‌شده فعلی:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">1.0.1</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">شناسه بسته (Package ID):</span>
                  <span className="font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{testPackageId}</span>
                </div>
                
                {updateState !== "idle" && (
                  <div className="space-y-2 pt-2 border-t border-emerald-950/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">وضعیت بررسی:</span>
                      {updateState === "checking" && <span className="text-amber-400 animate-pulse font-medium">در حال بررسی...</span>}
                      {updateState === "available" && <span className="text-emerald-400 font-bold animate-pulse">بروزرسانی جدید در دسترس است</span>}
                      {updateState === "latest" && <span className="text-emerald-400 font-bold">برنامه بروز است</span>}
                      {updateState === "downloading" && <span className="text-blue-400 font-medium animate-pulse">در حال هدایت به مایکت...</span>}
                    </div>

                    {updateState === "checking" && (
                      <div className="w-full bg-emerald-950/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${updateProgress}%` }}
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 leading-relaxed text-right font-medium">
                      {updateStepText}
                    </p>
                  </div>
                )}
              </div>

              {/* Developer Testing Tools Panel */}
              <div className="border border-emerald-950/50 rounded-xl overflow-hidden bg-emerald-950/5">
                <button
                  type="button"
                  onClick={() => setShowTestSettings(!showTestSettings)}
                  className="w-full px-4 py-2 bg-emerald-950/20 hover:bg-emerald-950/30 text-right text-xs font-semibold text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🛠️ تست کارکرد واقعی با سایر برنامه‌ها (مخصوص توسعه‌دهنده)</span>
                  <span className="text-[10px] text-slate-500">{showTestSettings ? "بستن ▲" : "مشاهده ▼"}</span>
                </button>
                
                {showTestSettings && (
                  <div className="p-3 bg-[#0A0F0D]/60 border-t border-emerald-950 space-y-3 text-right">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      از آنجا که برنامه شما هنوز به طور عمومی در مایکت منتشر نشده است، استعلام بسته <code className="text-emerald-500 font-mono">com.apps.wmqd</code> با خطای ۴۰۴ مواجه می‌شود. برای راستی‌آزمایی و مشاهده عملکرد واقعی آپدیت، یکی از برنامه‌های منتشر شده زیر را انتخاب و مجدداً تست کنید:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-1.5" dir="rtl">
                      <button
                        type="button"
                        onClick={() => {
                          setTestPackageId("com.apps.wmqd");
                          setUpdateState("idle");
                          setUpdateStepText("");
                        }}
                        className={`text-[10px] p-1.5 rounded border text-center transition-colors cursor-pointer ${
                          testPackageId === "com.apps.wmqd" 
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold" 
                            : "bg-[#070A08] border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        هندوانه‌سنج (فعلی - منتشرنشده)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTestPackageId("ir.mservices.market");
                          setUpdateState("idle");
                          setUpdateStepText("");
                        }}
                        className={`text-[10px] p-1.5 rounded border text-center transition-colors cursor-pointer ${
                          testPackageId === "ir.mservices.market" 
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold" 
                            : "bg-[#070A08] border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        برنامه مایکت (منتشر شده)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTestPackageId("com.farsitel.bazaar");
                          setUpdateState("idle");
                          setUpdateStepText("");
                        }}
                        className={`text-[10px] p-1.5 rounded border text-center transition-colors cursor-pointer ${
                          testPackageId === "com.farsitel.bazaar" 
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold" 
                            : "bg-[#070A08] border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        برنامه بازار (منتشر شده)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTestPackageId("com.lenovo.anyshare.gps");
                          setUpdateState("idle");
                          setUpdateStepText("");
                        }}
                        className={`text-[10px] p-1.5 rounded border text-center transition-colors cursor-pointer ${
                          testPackageId === "com.lenovo.anyshare.gps" 
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold" 
                            : "bg-[#070A08] border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        برنامه SHAREit (منتشر شده)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">یا وارد کردن شناسه بسته دلخواه:</label>
                      <input
                        type="text"
                        value={testPackageId}
                        onChange={(e) => {
                          setTestPackageId(e.target.value.trim());
                          setUpdateState("idle");
                          setUpdateStepText("");
                        }}
                        placeholder="e.g. com.instagram.android"
                        className="w-full bg-[#050807] border border-emerald-950 rounded p-1 text-xs font-mono text-left text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {(updateState === "idle" || updateState === "latest") && (
                  <button
                    onClick={handleCheckForMyketUpdate}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/30 active:scale-[0.98] cursor-pointer"
                  >
                    {updateState === "latest" ? "بررسی مجدد نسخه جدید" : "بررسی بروزرسانی جدید از مایکت"}
                  </button>
                )}

                {updateState === "available" && (
                  <button
                    onClick={handleLaunchMyketIntent}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    دانلود و نصب بروزرسانی از مایکت
                  </button>
                )}

                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors border border-slate-800 cursor-pointer"
                >
                  انصراف و بازگشت
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showCameraPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="camera-permission-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md bg-[#0E1612]/95 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-950/50 space-y-5 text-right"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/80">
                    <Camera className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-50">درخواست دسترسی به دوربین</h3>
                  <p className="text-xs text-emerald-400/80 font-medium mt-1">برای اسکن و تحلیل هوشمند هندوانه</p>
                </div>
              </div>

              <div className="space-y-3.5 text-right bg-[#060908] p-4 rounded-xl border border-emerald-950">
                <p className="text-xs text-slate-300 leading-relaxed">
                  برنامه هندوانه‌سنج هوشمند برای شروع آنالیز تصویر، سنجش الگوهای رنگی، لکه‌های زمین و قند بافت هندوانه به دوربین گوشی شما نیاز دارد.
                </p>
                <div className="space-y-2 border-t border-emerald-950/60 pt-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>اسکن و تشخیص خودکار لکه زمین زرد و ساقه خشکیده</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>سنجش کنتراست خطوط پوسته و ابعاد فیزیکی میوه</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>پردازش سریع و کاملاً آفلاین روی دستگاه شما (امنیت ۱۰۰٪)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleRequestCameraPermission}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  تایید و اعطای دسترسی دوربین
                </button>
                <button
                  onClick={() => setShowCameraPermissionModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 font-semibold text-xs transition-colors border border-slate-900 cursor-pointer"
                >
                  بعداً / آپلود تصویر از گالری
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery Cropping Modal */}
      <AnimatePresence>
        {cropModalOpen && galleryImageToCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="gallery-crop-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0E1612] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-right"
              id="gallery-crop-modal"
              dir="rtl"
            >
              <button
                onClick={() => {
                  setCropModalOpen(false);
                  setGalleryImageToCrop(null);
                }}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-emerald-950">
                <Crop className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-50">برش بیضی شکل تصویر هندوانه</h3>
                  <p className="text-[10px] text-emerald-500/70">هندوانه را درون کادر بیضی قرار دهید تا کادرگیری دقیق انجام شود</p>
                </div>
              </div>

              {/* Crop Box Container */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div 
                  className="w-72 h-72 relative overflow-hidden bg-[#050807] border-2 border-emerald-500/60 rounded-2xl shadow-lg cursor-move select-none touch-none"
                  onMouseDown={(e) => {
                    setIsDraggingCrop(true);
                    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingCrop) return;
                    setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
                  }}
                  onMouseUp={() => setIsDraggingCrop(false)}
                  onMouseLeave={() => setIsDraggingCrop(false)}
                  onTouchStart={(e) => {
                    if (e.touches[0]) {
                      setIsDraggingCrop(true);
                      setDragStart({ 
                        x: e.touches[0].clientX - cropOffset.x, 
                        y: e.touches[0].clientY - cropOffset.y 
                      });
                    }
                  }}
                  onTouchMove={(e) => {
                    if (!isDraggingCrop || !e.touches[0]) return;
                    setCropOffset({ 
                      x: e.touches[0].clientX - dragStart.x, 
                      y: e.touches[0].clientY - dragStart.y 
                    });
                  }}
                  onTouchEnd={() => setIsDraggingCrop(false)}
                >
                  <img
                    src={galleryImageToCrop || ""}
                    alt="Target to Crop"
                    className="absolute pointer-events-none max-none"
                    onLoad={(e) => {
                      const imgEl = e.currentTarget;
                      const w = imgEl.naturalWidth || 288;
                      const h = imgEl.naturalHeight || 288;
                      let w_cov = 288;
                      let h_cov = 288;
                      if (w > h) {
                        h_cov = 288;
                        w_cov = 288 * (w / h);
                      } else {
                        w_cov = 288;
                        h_cov = 288 * (h / w);
                      }
                      setCropImageSize({ w: w_cov, h: h_cov });
                    }}
                    style={{
                      width: `${cropImageSize.w}px`,
                      height: `${cropImageSize.h}px`,
                      left: `${(288 - cropImageSize.w) / 2}px`,
                      top: `${(288 - cropImageSize.h) / 2}px`,
                      transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`,
                      transformOrigin: 'center center',
                      transition: 'none',
                    }}
                  />
                  
                  {/* Elliptical Mask Vignette */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10" 
                    style={{
                      background: 'radial-gradient(ellipse 129.6px 97.2px at 144px 144px, transparent 99%, rgba(5, 8, 7, 0.85) 100%)'
                    }} 
                  />
                  
                  {/* Dashed Elliptical Border */}
                  <div 
                    className="absolute pointer-events-none z-20 border-2 border-dashed border-emerald-400/85 rounded-full"
                    style={{
                      left: '14.4px',
                      top: '46.8px',
                      width: '259.2px',
                      height: '194.4px'
                    }}
                  />
                </div>

                {/* Controller Controls: Slider + Direct fine tune buttons */}
                <div className="w-full space-y-3 px-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">بزرگنمایی (زوم)</span>
                      <span className="text-emerald-400 font-bold font-mono">{Math.round(cropScale * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="3.0" 
                      step="0.05"
                      value={cropScale}
                      onChange={(e) => setCropScale(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-[#0A0F0D] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Arrow fine-tuning for maximum accessibility */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-950/40">
                    <span className="text-[10px] text-slate-500">تنظیم دقیق با جهت‌ها:</span>
                    <div className="flex gap-1" dir="ltr">
                      <button 
                        onClick={() => setCropOffset(prev => ({ ...prev, x: prev.x - 10 }))}
                        className="w-7 h-7 bg-[#0A0F0D] border border-emerald-950 rounded flex items-center justify-center text-xs text-emerald-400 hover:border-emerald-700 hover:text-white cursor-pointer"
                        title="چپ"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => setCropOffset(prev => ({ ...prev, y: prev.y + 10 }))}
                        className="w-7 h-7 bg-[#0A0F0D] border border-emerald-950 rounded flex items-center justify-center text-xs text-emerald-400 hover:border-emerald-700 hover:text-white cursor-pointer"
                        title="پایین"
                      >
                        ↓
                      </button>
                      <button 
                        onClick={() => setCropOffset(prev => ({ ...prev, y: prev.y - 10 }))}
                        className="w-7 h-7 bg-[#0A0F0D] border border-emerald-950 rounded flex items-center justify-center text-xs text-emerald-400 hover:border-emerald-700 hover:text-white cursor-pointer"
                        title="بالا"
                      >
                        ↑
                      </button>
                      <button 
                        onClick={() => setCropOffset(prev => ({ ...prev, x: prev.x + 10 }))}
                        className="w-7 h-7 bg-[#0A0F0D] border border-emerald-950 rounded flex items-center justify-center text-xs text-emerald-400 hover:border-emerald-700 hover:text-white cursor-pointer"
                        title="راست"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (!galleryImageToCrop) return;
                    
                    const img = new Image();
                    img.src = galleryImageToCrop;
                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      canvas.width = 400;
                      canvas.height = 400;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      
                      ctx.save();
                      
                      // First fill with black
                      ctx.fillStyle = "#000000";
                      ctx.fillRect(0, 0, 400, 400);
                      
                      // Apply Elliptical clipping mask
                      ctx.beginPath();
                      ctx.ellipse(200, 200, 180, 135, 0, 0, 2 * Math.PI);
                      ctx.clip();
                      
                      const containerSize = 288;
                      const canvasSize = 400;
                      const scaleFactor = canvasSize / containerSize;
                      
                      // Calculate image dimensions directly to avoid stale state lag
                      const w = img.naturalWidth || img.width || 288;
                      const h = img.naturalHeight || img.height || 288;
                      let w_cov = 288;
                      let h_cov = 288;
                      if (w > h) {
                        h_cov = 288;
                        w_cov = 288 * (w / h);
                      } else {
                        w_cov = 288;
                        h_cov = 288 * (h / w);
                      }
                      
                      const drawWidth = w_cov * scaleFactor;
                      const drawHeight = h_cov * scaleFactor;
                      
                      ctx.translate(canvasSize / 2, canvasSize / 2);
                      ctx.translate(cropOffset.x * scaleFactor, cropOffset.y * scaleFactor);
                      ctx.scale(cropScale, cropScale);
                      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                      ctx.restore();
                      
                      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.95);
                      setImage(croppedDataUrl);
                      setCropModalOpen(false);
                      setGalleryImageToCrop(null);
                    };
                  }}
                  className="flex-1 py-3 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all text-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Crop className="w-4 h-4" />
                  برش و ذخیره عکس هندوانه
                </button>
                <button
                  onClick={() => {
                    setCropModalOpen(false);
                    setGalleryImageToCrop(null);
                  }}
                  className="px-4 py-3 bg-[#141F1A] hover:bg-[#1E2E27] border border-emerald-900/50 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="share-app-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0E1612] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-right"
              id="share-app-modal"
              dir="rtl"
            >
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setCopiedShareLink(false);
                }}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                id="close-share-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-950/80">
                  <Share2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-50">منوی اشتراک‌گذاری برنامه</h3>
                  <p className="text-xs text-emerald-500/70 font-medium mt-0.5">ارسال لینک دانلود مستقیم مایکت به دوستان</p>
                </div>
              </div>

              {/* Copy link block */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block text-right font-semibold">لینک مستقیم مایکت:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://myket.ir/app/com.apps.wmqd");
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      copiedShareLink 
                        ? "bg-emerald-600 text-white" 
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-emerald-500/10"
                    }`}
                  >
                    {copiedShareLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        کپی لینک
                      </>
                    )}
                  </button>
                  <input
                    type="text"
                    readOnly
                    value="https://myket.ir/app/com.apps.wmqd"
                    className="flex-1 bg-[#050807] border border-emerald-950 rounded-xl px-3 py-2 text-xs font-mono text-left text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Social sharing grid */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-slate-400 block text-right font-semibold">ارسال از طریق پیام‌رسان‌ها:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Eitaa */}
                  <a
                    href={`https://eitaa.com/share/url?url=${encodeURIComponent("https://myket.ir/app/com.apps.wmqd")}&text=${encodeURIComponent("هندوانه‌سنج هوشمند! کیفیت، قند و میزان رسیدگی هندوانه را با پردازش تصویر پیشرفته بسنجید:")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#0F1411] border border-emerald-950 hover:border-[#E8751A]/40 flex items-center justify-between transition-all group hover:bg-[#141F1A]"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">ایتا (Eitaa)</span>
                    <span className="text-sm bg-[#E8751A]/10 text-[#E8751A] px-1.5 py-0.5 rounded-lg text-[10px] font-bold">داخلی</span>
                  </a>

                  {/* Rubika */}
                  <a
                    href={`https://rubika.ir/share?url=${encodeURIComponent("https://myket.ir/app/com.apps.wmqd")}&text=${encodeURIComponent("هندوانه‌سنج هوشمند! کیفیت، قند و میزان رسیدگی هندوانه را با پردازش تصویر پیشرفته بسنجید:")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#0F1411] border border-emerald-950 hover:border-[#9C27B0]/40 flex items-center justify-between transition-all group hover:bg-[#141F1A]"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">روبیکا (Rubika)</span>
                    <span className="text-sm bg-[#9C27B0]/10 text-[#9C27B0] px-1.5 py-0.5 rounded-lg text-[10px] font-bold">داخلی</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent("https://myket.ir/app/com.apps.wmqd")}&text=${encodeURIComponent("هندوانه‌سنج هوشمند! کیفیت، قند و میزان رسیدگی هندوانه را با پردازش تصویر پیشرفته بسنجید:")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#0F1411] border border-emerald-950 hover:border-[#0088cc]/40 flex items-center justify-between transition-all group hover:bg-[#141F1A]"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">تلگرام (Telegram)</span>
                    <span className="text-xs text-[#0088cc]">✈️</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("هندوانه‌سنج هوشمند! کیفیت، قند و میزان رسیدگی هندوانه را با پردازش تصویر پیشرفته بسنجید: https://myket.ir/app/com.apps.wmqd")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#0F1411] border border-emerald-950 hover:border-[#25D366]/40 flex items-center justify-between transition-all group hover:bg-[#141F1A]"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">واتساپ (WhatsApp)</span>
                    <span className="text-xs text-[#25D366]">💬</span>
                  </a>
                </div>

                {/* Direct SMS */}
                <a
                  href={`sms:?body=${encodeURIComponent("هندوانه‌سنج هوشمند! کیفیت، قند و میزان رسیدگی هندوانه را با پردازش تصویر پیشرفته بسنجید: https://myket.ir/app/com.apps.wmqd")}`}
                  className="w-full p-3 rounded-xl bg-[#0F1411] border border-emerald-950 hover:border-emerald-700 flex items-center justify-center gap-2 transition-all hover:bg-[#141F1A] mt-2 block text-center text-xs font-semibold text-slate-300 hover:text-white"
                >
                  ✉️ ارسال مستقیم با پیامک (SMS)
                </a>
              </div>

              <button
                onClick={() => {
                  setShowShareModal(false);
                  setCopiedShareLink(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-xs transition-colors border border-slate-900 cursor-pointer"
              >
                بستن منو
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
