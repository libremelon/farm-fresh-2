"use client";

import { useState, useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockApi } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Check,
  Camera,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar } from "@/components/Avatar";

export interface WeeklyPrice {
  week: string;
  price: number;
  mandi: string;
}

export interface AiSuggestion {
  action: "HOLD" | "SELL_NOW";
  suggestedPrice: number;
  confidence: number;
  marketSignals?: {
    demand: string;
    arrivals: string;
    weather: string;
  };
  message: string;
}

export interface CropConfig {
  name: string;
  emoji: string;
  minPrice: number;
  maxPrice: number;
  recommendation: number;
  image: string;
  priceHistory: WeeklyPrice[];
}

const CROP_PRESETS: Record<string, CropConfig> = {
  Tomato: {
    name: "Tomato",
    emoji: "🍅",
    minPrice: 20,
    maxPrice: 28,
    recommendation: 24,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 20, mandi: "Sonipat" },
      { week: "Jul 22", price: 22, mandi: "Azadpur" },
      { week: "Jul 29", price: 27, mandi: "Sonipat" },
      { week: "Aug 05", price: 26, mandi: "Azadpur" },
      { week: "Aug 12", price: 23, mandi: "Sonipat" },
      { week: "Current", price: 24, mandi: "Sonipat" },
    ],
  },
  Potato: {
    name: "Potato",
    emoji: "🥔",
    minPrice: 14,
    maxPrice: 18,
    recommendation: 16,
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 14, mandi: "Karnal" },
      { week: "Jul 22", price: 15, mandi: "Karnal" },
      { week: "Jul 29", price: 15, mandi: "Azadpur" },
      { week: "Aug 05", price: 17, mandi: "Sonipat" },
      { week: "Aug 12", price: 18, mandi: "Azadpur" },
      { week: "Current", price: 16, mandi: "Karnal" },
    ],
  },
  Onion: {
    name: "Onion",
    emoji: "🧅",
    minPrice: 18,
    maxPrice: 25,
    recommendation: 22,
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 18, mandi: "Lasalgaon" },
      { week: "Jul 22", price: 19, mandi: "Lasalgaon" },
      { week: "Jul 29", price: 21, mandi: "Azadpur" },
      { week: "Aug 05", price: 25, mandi: "Lasalgaon" },
      { week: "Aug 12", price: 24, mandi: "Azadpur" },
      { week: "Current", price: 22, mandi: "Lasalgaon" },
    ],
  },
  Wheat: {
    name: "Wheat",
    emoji: "🌾",
    minPrice: 31,
    maxPrice: 37,
    recommendation: 34,
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 31, mandi: "Sehore" },
      { week: "Jul 22", price: 32, mandi: "Patiala" },
      { week: "Jul 29", price: 34, mandi: "Sehore" },
      { week: "Aug 05", price: 36, mandi: "Samana" },
      { week: "Aug 12", price: 37, mandi: "Patiala" },
      { week: "Current", price: 34, mandi: "Patiala" },
    ],
  },
  Mango: {
    name: "Mango",
    emoji: "🥭",
    minPrice: 175,
    maxPrice: 220,
    recommendation: 190,
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 220, mandi: "Devgad" },
      { week: "Jul 22", price: 210, mandi: "Devgad" },
      { week: "Jul 29", price: 200, mandi: "Azadpur" },
      { week: "Aug 05", price: 185, mandi: "Ratnagiri" },
      { week: "Aug 12", price: 175, mandi: "Azadpur" },
      { week: "Current", price: 190, mandi: "Devgad" },
    ],
  },
  Spinach: {
    name: "Spinach",
    emoji: "🥬",
    minPrice: 22,
    maxPrice: 32,
    recommendation: 28,
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 22, mandi: "Alwar" },
      { week: "Jul 22", price: 24, mandi: "Alwar" },
      { week: "Jul 29", price: 26, mandi: "Azadpur" },
      { week: "Aug 05", price: 32, mandi: "Sonipat" },
      { week: "Aug 12", price: 30, mandi: "Azadpur" },
      { week: "Current", price: 28, mandi: "Alwar" },
    ],
  },
  Carrot: {
    name: "Carrot",
    emoji: "🥕",
    minPrice: 22,
    maxPrice: 30,
    recommendation: 26,
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 22, mandi: "Sonipat" },
      { week: "Jul 22", price: 23, mandi: "Sonipat" },
      { week: "Jul 29", price: 25, mandi: "Azadpur" },
      { week: "Aug 05", price: 30, mandi: "Sonipat" },
      { week: "Aug 12", price: 28, mandi: "Azadpur" },
      { week: "Current", price: 26, mandi: "Sonipat" },
    ],
  },
  Garlic: {
    name: "Garlic",
    emoji: "🧄",
    minPrice: 90,
    maxPrice: 130,
    recommendation: 115,
    image:
      "https://images.unsplash.com/photo-1615477032219-bc188649a507?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 95, mandi: "Mandsaur" },
      { week: "Jul 22", price: 105, mandi: "Mandsaur" },
      { week: "Jul 29", price: 110, mandi: "Azadpur" },
      { week: "Aug 05", price: 125, mandi: "Mandsaur" },
      { week: "Aug 12", price: 120, mandi: "Azadpur" },
      { week: "Current", price: 115, mandi: "Mandsaur" },
    ],
  },
  Chili: {
    name: "Chili",
    emoji: "🌶️",
    minPrice: 42,
    maxPrice: 62,
    recommendation: 52,
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 44, mandi: "Guntur" },
      { week: "Jul 22", price: 48, mandi: "Guntur" },
      { week: "Jul 29", price: 54, mandi: "Azadpur" },
      { week: "Aug 05", price: 60, mandi: "Guntur" },
      { week: "Aug 12", price: 56, mandi: "Azadpur" },
      { week: "Current", price: 52, mandi: "Azadpur" },
    ],
  },
  Basmati: {
    name: "Basmati",
    emoji: "🌾",
    minPrice: 72,
    maxPrice: 88,
    recommendation: 80,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    priceHistory: [
      { week: "Jul 15", price: 74, mandi: "Karnal" },
      { week: "Jul 22", price: 76, mandi: "Narela" },
      { week: "Jul 29", price: 82, mandi: "Karnal" },
      { week: "Aug 05", price: 85, mandi: "Narela" },
      { week: "Aug 12", price: 83, mandi: "Karnal" },
      { week: "Current", price: 80, mandi: "Narela" },
    ],
  },
};

export default function NewCropPage() {
  const { currentUser, openAuthModal } = useAuthStore();
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const activeUser = isHydrated ? currentUser : null;
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [customCrop, setCustomCrop] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("500");
  const [unit, setUnit] = useState<"kg" | "Quintal" | "Ton">("kg");
  const [pricePerKg, setPricePerKg] = useState<string>("24");
  const [quality, setQuality] = useState<"A" | "B" | "C">("A");
  const [imageFile, setImageFile] = useState<string | null>(
    CROP_PRESETS.Tomato.image,
  );
  const [loading, setLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [priceApplied, setPriceApplied] = useState(false);
  const [listed, setListed] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>({
    action: "SELL_NOW",
    suggestedPrice: 25,
    confidence: 88,
    marketSignals: {
      demand: "High (+14% week-on-week)",
      arrivals: "Moderate (340 MT daily)",
      weather: "Clear highway transit forecast",
    },
    message:
      "🌡️ Favorable Azadpur mandi procurement demand. Current rate offers a 12% premium over 6-week low.",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredPoint, setHoveredPoint] = useState<WeeklyPrice | null>(null);

  // Crop selection handler (avoids cascading effect renders)
  const handleSelectCrop = (cropKey: string) => {
    setSelectedCrop(cropKey);
    setListed(false);
    setPriceApplied(false);
    if (cropKey !== "Other" && CROP_PRESETS[cropKey]) {
      const preset = CROP_PRESETS[cropKey];
      setPricePerKg(String(preset.recommendation));
      setImageFile(preset.image);
      const isHold = preset.recommendation > (preset.minPrice + preset.maxPrice) / 2;
      setAiSuggestion({
        action: isHold ? "HOLD" : "SELL_NOW",
        suggestedPrice: preset.recommendation,
        confidence: 86,
        marketSignals: {
          demand: isHold ? "Rising (+18% expected)" : "Steady daily procurement",
          arrivals: "Balanced regional inflow",
          weather: "Optimal harvesting condition",
        },
        message: `📈 APMC benchmark rates for ${preset.name} indicate steady retail buyer inflow. Recommended farm gate listing: ₹${preset.recommendation}/kg.`,
      });
    } else {
      setImageFile(null);
      setAiSuggestion(null);
    }
  };

  // Derived price stats for active crop
  const activeCropConfig =
    selectedCrop !== "Other" ? CROP_PRESETS[selectedCrop] : null;
  const historyData = useMemo(() => {
    return activeCropConfig?.priceHistory || [];
  }, [activeCropConfig]);

  const priceStats = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return { min: 0, max: 0, avg: 0, changePercent: 0, isUp: true };
    }
    const prices = historyData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const avg = Number((sum / prices.length).toFixed(1));
    const first = prices[0];
    const latest = prices[prices.length - 1];
    const changePercent = Number((((latest - first) / first) * 100).toFixed(1));
    return { min, max, avg, changePercent, isUp: changePercent >= 0 };
  }, [historyData]);

  // Conversion calculations helper
  const quantityInKg = (() => {
    const qNum = Number(quantity) || 0;
    if (unit === "Quintal") return qNum * 100;
    if (unit === "Ton") return qNum * 1000;
    return qNum;
  })();

  const estimatedEarnings = quantityInKg * (Number(pricePerKg) || 0);

  // Validate form
  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (selectedCrop === "Other" && !customCrop.trim()) {
      tempErrors.name = "Please specify the crop name";
    }
    if (!quantity || Number(quantity) <= 0) {
      tempErrors.quantity = "Please enter a valid quantity";
    }
    if (!pricePerKg || Number(pricePerKg) <= 0) {
      tempErrors.price = "Please enter a valid price";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Analyze crop pricing
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const cropName = selectedCrop === "Other" ? customCrop : selectedCrop;

    try {
      const recommendation = (await mockApi.getAIRecommendation(
        cropName,
        Number(pricePerKg),
      )) as AiSuggestion;
      setAiSuggestion(recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock listing completion
  const handlePublish = () => {
    if (!validate()) return;
    setListed(true);
  };

  // Auto fill pricing recommendation
  const applyAiPrice = () => {
    if (aiSuggestion) {
      setPricePerKg(String(aiSuggestion.suggestedPrice));
    } else if (selectedCrop !== "Other" && CROP_PRESETS[selectedCrop]) {
      setPricePerKg(String(CROP_PRESETS[selectedCrop].recommendation));
    }
    setPriceApplied(true);
    setTimeout(() => setPriceApplied(false), 2200);
  };

  // Re-analyze live APMC Mandi signals
  const handleReanalyzeSignals = async () => {
    setIsReanalyzing(true);
    const cropName = selectedCrop === "Other" ? customCrop || "Crop" : selectedCrop;
    try {
      await new Promise((res) => setTimeout(res, 650));
      const preset = selectedCrop !== "Other" ? CROP_PRESETS[selectedCrop] : null;
      const baseRec = preset ? preset.recommendation : Number(pricePerKg) || 25;
      const isHold = baseRec > (preset ? (preset.minPrice + preset.maxPrice) / 2 : 25);
      setAiSuggestion({
        action: isHold ? "HOLD" : "SELL_NOW",
        suggestedPrice: baseRec,
        confidence: Math.floor(Math.random() * 6) + 89,
        marketSignals: {
          demand: isHold ? "Surging (+18% daily wholesale inquiry)" : "Steady daily procurement volume",
          arrivals: "Azadpur APMC terminal arrivals down 6%",
          weather: "Optimal harvesting & transit conditions",
        },
        message: `📈 APMC live benchmark for ${cropName} indicates strong procurement momentum. Recommended farm-gate quote: ₹${baseRec}/kg.`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Mock visual upload trigger
  const triggerMockUpload = () => {
    if (selectedCrop !== "Other" && CROP_PRESETS[selectedCrop]) {
      setImageFile(CROP_PRESETS[selectedCrop].image);
    }
  };

  // SVG Line Chart coordinates generator
  const chartCoordinates = useMemo(() => {
    if (!historyData || historyData.length === 0)
      return { pathD: "", areaD: "", points: [] };

    const svgWidth = 320;
    const svgHeight = 130;
    const paddingX = 24;
    const paddingTop = 20;
    const paddingBottom = 28;

    const prices = historyData.map((d) => d.price);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const range = maxP - minP || 1;

    const points = historyData.map((item, idx) => {
      const x =
        paddingX + (idx / (historyData.length - 1)) * (svgWidth - paddingX * 2);
      const y =
        paddingTop +
        (1 - (item.price - minP) / range) *
          (svgHeight - paddingTop - paddingBottom);
      return { x, y, item };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingBottom + 8} L ${points[0].x},${svgHeight - paddingBottom + 8} Z`;

    return { pathD, areaD, points };
  }, [historyData]);

  return (
    <div className="min-h-screen bg-[#faf8f2] dark:bg-zinc-950 text-emerald-950 dark:text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      {/* 1. UNIFIED NAVBAR */}
      <Navbar />

      {/* 2. MAIN RESPONSIVE CONTAINER WITH SIDEBAR GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Header Ribbon */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border-2 border-amber-200/80 dark:border-zinc-800 p-5 rounded-3xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#0b3b20] text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Farmer Portal • Mandi Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white font-serif tracking-tight">
              🌾 List Your Crop Produce
            </h1>
            <p className="text-xs text-emerald-900/80 dark:text-gray-400 mt-0.5 font-medium">
              Real-time APMC Mandi trends, AI pricing guidance, and direct buyer
              connections with zero commission.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activeUser && activeUser.role === "farmer" ? (
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300">
                <Avatar
                  name={activeUser.name}
                  className="w-8 h-8 rounded-xl text-xs bg-[#0b3b20] text-amber-300 border border-amber-400"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-950 dark:text-white leading-tight">
                      {activeUser.name}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      KCC Verified
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    {activeUser.farmerProfile?.kisanId || "KCC-HR-894120"} •{" "}
                    {activeUser.farmerProfile?.district || "Sonipat"}
                  </span>
                </div>
                <button
                  onClick={() => openAuthModal("farmer")}
                  className="ml-1 text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Switch
                </button>
              </div>
            ) : (
              <Button
                onClick={() => openAuthModal("farmer")}
                className="bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 font-black px-3.5 py-2 rounded-xl text-xs border border-amber-400/40 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>🧑‍🌾 Farmer Sign In</span>
              </Button>
            )}

            <Link href="/buyer/marketplace">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Marketplace Feed ➔
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. RESPONSIVE GRID LAYOUT (LEFT SIDEBAR + RIGHT FORM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: PRICE HISTORY GRAPH & AI RECOMMENDATION     */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 lg:order-1 space-y-6 lg:sticky lg:top-24">
            {/* 1. Dynamic Price History Card */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-zinc-800 rounded-3xl p-5 shadow-md overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-zinc-800 flex items-center justify-center text-amber-700">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-emerald-950 dark:text-white font-serif">
                      6-Week Mandi Trend
                    </h3>
                    <span className="text-[10px] text-gray-500 font-semibold block">
                      {selectedCrop === "Other"
                        ? "Custom Produce"
                        : activeCropConfig?.name}
                    </span>
                  </div>
                </div>

                {priceStats.changePercent !== 0 && (
                  <Badge
                    className={`text-[10px] font-black ${
                      priceStats.isUp
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-red-100 text-red-900 border-red-300"
                    }`}
                  >
                    {priceStats.isUp ? (
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1 inline" />
                    )}
                    {priceStats.isUp
                      ? `+${priceStats.changePercent}%`
                      : `${priceStats.changePercent}%`}
                  </Badge>
                )}
              </div>

              {/* SVG Trend Graph */}
              {historyData.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative bg-[#faf8f2] dark:bg-zinc-950 rounded-2xl p-2 border border-amber-200/70 dark:border-zinc-800">
                    {/* Hover tooltip indicator */}
                    {hoveredPoint && (
                      <div className="absolute top-2 right-2 z-10 bg-[#0b3b20] text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-md shadow-md animate-in fade-in flex items-center gap-1.5 border border-amber-400/40">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                        <span>
                          {hoveredPoint.week}: ₹{hoveredPoint.price}/kg ({hoveredPoint.mandi} APMC)
                        </span>
                      </div>
                    )}

                    <svg
                      viewBox="0 0 320 130"
                      className="w-full h-32 overflow-visible select-none"
                    >
                      <defs>
                        <linearGradient
                          id="trendGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#f59e0b"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="#f59e0b"
                            stopOpacity="0.02"
                          />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line
                        x1="20"
                        y1="20"
                        x2="300"
                        y2="20"
                        stroke="#e5e7eb"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="20"
                        y1="60"
                        x2="300"
                        y2="60"
                        stroke="#e5e7eb"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="20"
                        y1="100"
                        x2="300"
                        y2="100"
                        stroke="#e5e7eb"
                        strokeDasharray="3 3"
                      />

                      {/* Vertical Guideline for Hovered Point */}
                      {hoveredPoint && (() => {
                        const activePt = chartCoordinates.points.find(p => p.item.week === hoveredPoint.week);
                        if (!activePt) return null;
                        return (
                          <line
                            x1={activePt.x}
                            y1="15"
                            x2={activePt.x}
                            y2="105"
                            stroke="#0b3b20"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                            className="opacity-70"
                          />
                        );
                      })()}

                      {/* Area Fill */}
                      <path
                        d={chartCoordinates.areaD}
                        fill="url(#trendGradient)"
                      />

                      {/* Line Path */}
                      <path
                        d={chartCoordinates.pathD}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Points */}
                      {chartCoordinates.points.map((pt, idx) => {
                        const isLast =
                          idx === chartCoordinates.points.length - 1;
                        const isHovered = hoveredPoint?.week === pt.item.week;
                        return (
                          <g key={idx} className="cursor-pointer">
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={9}
                                className="fill-amber-400/30 animate-ping"
                              />
                            )}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 6 : isLast ? 5.5 : 4}
                              className={`${
                                isHovered
                                  ? "fill-amber-400 stroke-[#0b3b20] stroke-2"
                                  : isLast
                                  ? "fill-[#0b3b20] stroke-amber-400 stroke-2"
                                  : "fill-amber-500 hover:fill-[#0b3b20]"
                              } transition-all`}
                              onMouseEnter={() => setHoveredPoint(pt.item)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {/* X-axis labels */}
                            <text
                              x={pt.x}
                              y={122}
                              fontSize="8.5"
                              fontWeight={isHovered ? "900" : "bold"}
                              textAnchor="middle"
                              fill={isHovered ? "#0b3b20" : "#6b7280"}
                            >
                              {pt.item.week}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* 6-Week High / Low / Avg metric chips */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-[#faf8f2] dark:bg-zinc-800 p-2.5 rounded-xl border border-amber-200/80 text-center shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">
                        6-Wk Low
                      </span>
                      <span className="text-sm font-black text-emerald-900 dark:text-emerald-400 font-serif">
                        ₹{priceStats.min}
                      </span>
                    </div>

                    <div className="bg-[#faf8f2] dark:bg-zinc-800 p-2.5 rounded-xl border border-amber-200/80 text-center shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">
                        6-Wk High
                      </span>
                      <span className="text-sm font-black text-amber-700 dark:text-amber-400 font-serif">
                        ₹{priceStats.max}
                      </span>
                    </div>

                    <div className="bg-[#faf8f2] dark:bg-zinc-800 p-2.5 rounded-xl border border-amber-200/80 text-center shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">
                        Mandi Avg
                      </span>
                      <span className="text-sm font-black text-[#0b3b20] dark:text-white font-serif">
                        ₹{priceStats.avg}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500 bg-[#faf8f2] rounded-2xl border border-dashed border-amber-200">
                  <span>
                    Custom crop selected. Live mandi benchmark available upon
                    submission.
                  </span>
                </div>
              )}
            </div>

            {/* 2. AI Mandi Price Recommendation Panel */}
            <div className="bg-gradient-to-br from-[#0b3b20] to-[#072a16] text-white rounded-3xl p-5 shadow-md border-2 border-emerald-700/80 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    AI Mandi Price Advisor
                  </h3>
                </div>
                {aiSuggestion && (
                  <Badge className={`font-black text-[10px] border-none ${
                    aiSuggestion.action === "HOLD"
                      ? "bg-amber-400 text-emerald-950"
                      : "bg-emerald-400 text-emerald-950"
                  }`}>
                    {aiSuggestion.action}
                  </Badge>
                )}
              </div>

              {aiSuggestion ? (
                <div className="space-y-3 relative z-10 text-xs">
                  <p className="text-emerald-100/90 leading-relaxed font-medium">
                    {aiSuggestion.message}
                  </p>

                  {/* Market Signals Checklist */}
                  {aiSuggestion.marketSignals && (
                    <div className="bg-[#052112]/70 rounded-xl p-2.5 border border-emerald-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-emerald-200">
                        <span className="text-gray-400">Demand:</span>
                        <span className="font-bold text-amber-300">{aiSuggestion.marketSignals.demand}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-200">
                        <span className="text-gray-400">Arrivals:</span>
                        <span className="font-bold text-emerald-300">{aiSuggestion.marketSignals.arrivals}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-200">
                        <span className="text-gray-400">Weather:</span>
                        <span className="font-bold text-emerald-300">{aiSuggestion.marketSignals.weather}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Rate & Apply Button */}
                  <div className="p-3 bg-[#052112]/90 rounded-2xl border border-emerald-600/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block">
                        Suggested Rate
                      </span>
                      <span className="text-xl font-black text-amber-300 font-serif">
                        ₹{aiSuggestion.suggestedPrice}{" "}
                        <span className="text-xs font-normal text-emerald-200">
                          / kg
                        </span>
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={applyAiPrice}
                      className={`font-black text-xs rounded-xl shadow cursor-pointer transition ${
                        priceApplied
                          ? "bg-emerald-400 text-emerald-950 border border-emerald-300"
                          : "bg-amber-400 hover:bg-amber-300 text-emerald-950 border border-amber-300"
                      }`}
                    >
                      {priceApplied ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Applied!
                        </span>
                      ) : (
                        <span>Apply this price</span>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-emerald-300/80 pt-1 font-semibold">
                    <span>
                      Forecast Confidence: {aiSuggestion.confidence || 85}%
                    </span>
                    <button
                      type="button"
                      onClick={handleReanalyzeSignals}
                      disabled={isReanalyzing}
                      className="underline text-amber-300 hover:text-amber-200 cursor-pointer disabled:opacity-50"
                    >
                      {isReanalyzing ? "Fetching APMC..." : "⚡ Re-check Signals"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-200/80 py-2 relative z-10">
                  Click &ldquo;⚡ Run AI Mandi Price Check&rdquo; on the form to analyze
                  weather, demand, and APMC historical quotes.
                </div>
              )}

              {/* Subtle background graphic */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-sm pointer-events-none" />
            </div>

            {/* 3. Farmer Direct Selling Tips Card */}
            <div className="bg-amber-50 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-2 text-emerald-950 dark:text-zinc-300">
              <span className="font-extrabold text-amber-900 dark:text-amber-400 uppercase text-[10px] block">
                💡 Direct Farmer Selling Tip
              </span>
              <p className="text-[11px] leading-relaxed">
                Listings with clear harvest photos and benchmark rates get{" "}
                <strong>3x more buyer inquiries</strong> within the first 4
                hours of morning harvest.
              </p>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: PRODUCE LISTING FORM                       */}
          {/* ======================================================== */}
          <section className="lg:col-span-8 lg:order-2">
            <Card className="pt-0 shadow-xl border-2 border-amber-300/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <CardHeader className="bg-[#0b3b20] text-white p-6 border-b border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-white font-serif tracking-tight">
                      Crop Inventory Details
                    </CardTitle>
                    <p className="text-xs text-emerald-200/90 leading-relaxed font-medium mt-0.5">
                      Specify crop parameters, harvest grade, and pricing for
                      verified nearby buyers.
                    </p>
                  </div>
                  <span className="text-3xl">🌾</span>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {listed ? (
                  /* Success Board */
                  <div className="text-center py-10 space-y-4 animate-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-md border-2 border-emerald-400">
                      🎉
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-emerald-950 dark:text-white font-serif">
                        Listing Active!
                      </h3>
                      <p className="text-sm text-emerald-900/80 dark:text-gray-400 max-w-md mx-auto mt-2 leading-relaxed font-medium">
                        Your{" "}
                        <strong>
                          {selectedCrop === "Other" ? customCrop : selectedCrop}
                        </strong>{" "}
                        batch of{" "}
                        <strong>
                          {quantity} {unit}
                        </strong>{" "}
                        is now live on the marketplace at{" "}
                        <strong>₹{pricePerKg}/kg</strong>.
                      </p>
                    </div>
                    <div className="pt-4 flex justify-center gap-3">
                      <Button
                        onClick={() => {
                          setListed(false);
                          setAiSuggestion(null);
                        }}
                        variant="outline"
                        className="font-bold border-emerald-800 text-emerald-900 rounded-xl"
                      >
                        + List Another Crop
                      </Button>
                      <Link href="/buyer/marketplace">
                        <Button className="bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 font-black rounded-xl">
                          View Marketplace Feed 🚀
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAnalyze} className="space-y-6">
                    {/* Farmer Verification Banner */}
                    {currentUser && currentUser.role === "farmer" ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-zinc-800/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-950 dark:text-emerald-200 font-bold">
                            Listing as: <strong>{currentUser.name}</strong> ({currentUser.farmerProfile?.farmName || "Direct Farm"})
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                          Direct Escrow Bank Linked
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-zinc-800/80 border border-amber-300 dark:border-zinc-700 flex items-center justify-between text-xs">
                        <span className="text-amber-900 dark:text-amber-300 font-medium">
                          🌾 Listing as Guest Farmer. Sign in with Kisan ID to attach verified seller badges.
                        </span>
                        <button
                          type="button"
                          onClick={() => openAuthModal("farmer")}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-lg text-xs cursor-pointer shrink-0"
                        >
                          Sign In
                        </button>
                      </div>
                    )}

                    {/* 1. Visual Crop Selection Grid */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-emerald-950 dark:text-zinc-200 uppercase tracking-wider">
                          1. Choose Produce
                        </label>
                        <span className="text-[11px] text-amber-700 font-bold">
                          One-tap quick select
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                        {Object.entries(CROP_PRESETS).map(([key, config]) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => handleSelectCrop(key)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
                              selectedCrop === key
                                ? "border-amber-500 bg-amber-50 dark:bg-zinc-800 font-black shadow-sm scale-105"
                                : "border-amber-200/80 dark:border-zinc-800 bg-[#faf8f2] dark:bg-zinc-900 hover:bg-amber-50/60"
                            }`}
                          >
                            <span className="text-2xl mb-1">
                              {config.emoji}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-950 dark:text-white tracking-tight leading-none">
                              {config.name}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleSelectCrop("Other")}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
                            selectedCrop === "Other"
                              ? "border-amber-500 bg-amber-50 dark:bg-zinc-800 font-black shadow-sm scale-105"
                              : "border-dashed border-amber-300 dark:border-zinc-700 bg-[#faf8f2] dark:bg-zinc-900 hover:bg-amber-50/60"
                          }`}
                        >
                          <span className="text-2xl mb-1">➕</span>
                          <span className="text-[11px] font-bold text-emerald-950 dark:text-white tracking-tight leading-none">
                            Other
                          </span>
                        </button>
                      </div>

                      {selectedCrop === "Other" && (
                        <div className="pt-2">
                          <Input
                            type="text"
                            placeholder="Enter custom crop name (e.g. Ginger / Turmeric)"
                            value={customCrop}
                            onChange={(e) => setCustomCrop(e.target.value)}
                            className="rounded-xl border-2 border-amber-300 font-bold"
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500 mt-1 font-semibold">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Visual Photo Drop Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-emerald-950 dark:text-zinc-200 uppercase tracking-wider block">
                        2. Produce Harvest Photo
                      </label>

                      <div
                        onClick={triggerMockUpload}
                        className="border-2 border-dashed border-amber-300 dark:border-zinc-700 bg-[#faf8f2] dark:bg-zinc-800/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition group"
                      >
                        {imageFile ? (
                          <div className="relative aspect-[16/9] w-full max-w-sm rounded-xl overflow-hidden shadow border border-amber-200">
                            <img
                              src={imageFile}
                              alt="Crop Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span className="text-xs text-white font-bold bg-black/60 px-3 py-1.5 rounded-full">
                                Click to change photo
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 space-y-1">
                            <Camera className="w-8 h-8 text-amber-600 mx-auto" />
                            <span className="text-xs font-bold text-emerald-950 dark:text-white block">
                              Upload Live Farm Harvest Photo
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Clear photos get 3x more buyer inquiries
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Quantity & Unit Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-emerald-950 dark:text-zinc-200 uppercase tracking-wider block">
                        3. Available Stock Quantity
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 500"
                            className="font-black text-base rounded-xl border-2 border-amber-200"
                          />
                          {errors.quantity && (
                            <p className="text-xs text-red-500 mt-1 font-semibold">
                              {errors.quantity}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-5">
                          <div className="flex bg-amber-50 dark:bg-zinc-800 p-1 rounded-xl border border-amber-200 dark:border-zinc-700 h-10 items-center justify-between">
                            {(["kg", "Quintal", "Ton"] as const).map((u) => (
                              <button
                                type="button"
                                key={u}
                                onClick={() => setUnit(u)}
                                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                                  unit === u
                                    ? "bg-[#0b3b20] text-amber-300 shadow-xs"
                                    : "text-gray-600 dark:text-gray-400 hover:text-emerald-900"
                                }`}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Quality Grade Badges */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-emerald-950 dark:text-zinc-200 uppercase tracking-wider block">
                        4. Quality Standard
                      </label>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            g: "A",
                            title: "Grade A",
                            sub: "Export / Premium",
                            desc: "Uniform size, zero blemishes",
                          },
                          {
                            g: "B",
                            title: "Grade B",
                            sub: "Standard Mandi",
                            desc: "Fresh, healthy, normal size",
                          },
                          {
                            g: "C",
                            title: "Grade C",
                            sub: "Processing / Pulp",
                            desc: "For juice, pulp, chips",
                          },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.g}
                            onClick={() => setQuality(item.g as "A" | "B" | "C")}
                            className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                              quality === item.g
                                ? "border-amber-500 bg-amber-50 dark:bg-zinc-800 shadow-xs"
                                : "border-amber-200/80 dark:border-zinc-800 bg-[#faf8f2] hover:bg-amber-50/50"
                            }`}
                          >
                            <span className="text-xs font-black text-emerald-950 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-amber-800 font-bold block">
                              {item.sub}
                            </span>
                            <span className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Expected Price & Live Mandi Guideline */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-emerald-950 dark:text-zinc-200 uppercase tracking-wider">
                          5. Your Selling Price
                        </label>
                        <button
                          type="button"
                          onClick={applyAiPrice}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-fill Mandi
                          Benchmark
                        </button>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 font-bold text-base text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={pricePerKg}
                          onChange={(e) => setPricePerKg(e.target.value)}
                          placeholder="e.g. 24"
                          className="pl-8 font-black text-lg rounded-xl border-2 border-amber-200"
                        />
                      </div>
                      {errors.price && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">
                          {errors.price}
                        </p>
                      )}

                      {selectedCrop !== "Other" &&
                        CROP_PRESETS[selectedCrop] && (
                          <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200">
                            💡 Sonipat & Azadpur Mandi Average:{" "}
                            <strong>
                              ₹{CROP_PRESETS[selectedCrop].minPrice} – ₹
                              {CROP_PRESETS[selectedCrop].maxPrice} / kg
                            </strong>
                          </p>
                        )}
                    </div>

                    {/* 6. Estimated Gross Payout Card */}
                    <div className="bg-amber-50 dark:bg-zinc-800/80 border-2 border-amber-300 dark:border-zinc-700 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-lg">
                          ₹
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">
                            Estimated Gross Revenue
                          </span>
                          <span className="text-2xl font-black text-[#0b3b20] dark:text-amber-300 font-serif">
                            ₹{estimatedEarnings.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        100% Direct Payout
                      </span>
                    </div>

                    {/* Form Actions */}
                    <div className="space-y-2 pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 font-black py-4 rounded-xl shadow-md text-sm cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        <span>
                          {loading
                            ? "Re-checking Mandi AI Rates..."
                            : "⚡ Run AI Mandi Price Check"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        onClick={handlePublish}
                        variant="outline"
                        className="w-full font-bold border-amber-300 text-emerald-950 dark:text-white rounded-xl py-3 text-xs"
                      >
                        Skip AI Advisory & Publish Directly
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* 4. UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
