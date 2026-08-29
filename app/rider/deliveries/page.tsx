"use client";

import { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { Navbar } from "@/components/Navbar";
import { Avatar } from "@/components/Avatar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  Power,
  RotateCcw,
  Check,
  ShieldCheck,
  MessageSquare,
  Map,
  Radio,
  User,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface DeliveryOrder {
  id: string;
  cropName: string;
  quantityKg: number;
  pickupName: string;
  pickupLocation: string;
  dropName: string;
  dropLocation: string;
  payout: number;
  pickupDistanceKm: number;
  tripDistanceKm: number;
  estTimeMins: number;
  vehicleRequired: string;
  isHeavy: boolean;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

interface RiderReview {
  id: string;
  author: string;
  role: "Farmer" | "Bulk Buyer" | "Retailer";
  rating: number;
  comment: string;
  date: string;
  tag: string;
}

// Initial Delivery Orders with regional geo-coordinates
const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: "del-1",
    cropName: "Fresh Shimla Tomatoes",
    quantityKg: 350,
    pickupName: "Rameshwar Patel Farms",
    pickupLocation: "Sonipat Vegetable Belt (2 km away)",
    dropName: "Azadpur APMC Terminal Gate 4",
    dropLocation: "Delhi Wholesale Market (12 km trip)",
    payout: 480,
    pickupDistanceKm: 2,
    tripDistanceKm: 14,
    estTimeMins: 40,
    vehicleRequired: "Mini-Truck / Tata Ace",
    isHeavy: true,
    pickupLat: 28.993,
    pickupLng: 77.015,
    dropLat: 28.718,
    dropLng: 77.175,
  },
  {
    id: "del-2",
    cropName: "Organic Desi Spinach (Palak)",
    quantityKg: 60,
    pickupName: "Jaivik Krishi Kendra",
    pickupLocation: "Alwar Road Farm Gate (3 km away)",
    dropName: "Gurugram Organic Consumer Co-op",
    dropLocation: "Sector 54 Hub (8 km trip)",
    payout: 180,
    pickupDistanceKm: 3,
    tripDistanceKm: 11,
    estTimeMins: 25,
    vehicleRequired: "2-Wheeler / Cargo Bike",
    isHeavy: false,
    pickupLat: 28.459,
    pickupLng: 77.026,
    dropLat: 28.435,
    dropLng: 77.108,
  },
  {
    id: "del-3",
    cropName: "MP Sharbati Wheat Sacks",
    quantityKg: 1200,
    pickupName: "Kisan Producer Org (FPO)",
    pickupLocation: "Karnal Grains Mandi (5 km away)",
    dropName: "Central Warehousing Corp",
    dropLocation: "Sonipat Logistics Depot (22 km trip)",
    payout: 950,
    pickupDistanceKm: 5,
    tripDistanceKm: 27,
    estTimeMins: 60,
    vehicleRequired: "3-Wheeler Loader",
    isHeavy: true,
    pickupLat: 29.685,
    pickupLng: 76.99,
    dropLat: 28.993,
    dropLng: 77.015,
  },
  {
    id: "del-4",
    cropName: "Nasik High-Pungency Red Onions",
    quantityKg: 800,
    pickupName: "Suresh Patil & Sons",
    pickupLocation: "Lasalgaon Mandi Hub (4 km away)",
    dropName: "Vashi APMC Wholesale Bay 9",
    dropLocation: "Navi Mumbai Hub (32 km trip)",
    payout: 740,
    pickupDistanceKm: 4,
    tripDistanceKm: 36,
    estTimeMins: 70,
    vehicleRequired: "Tata 407 / Canter",
    isHeavy: true,
    pickupLat: 20.147,
    pickupLng: 74.225,
    dropLat: 19.076,
    dropLng: 72.998,
  },
];

// Recent Customer Reviews for Rajesh Kumar
const RIDER_REVIEWS: RiderReview[] = [
  {
    id: "rev-1",
    author: "Rameshwar Patel",
    role: "Farmer",
    rating: 5,
    comment:
      "Arrived 10 mins early at my Sonipat farm gate! Careful loading of 350 kg tomatoes without damaging crates.",
    date: "Yesterday",
    tag: "Punctual & Careful",
  },
  {
    id: "rev-2",
    author: "Jaivik Krishi Kendra",
    role: "Farmer",
    rating: 5,
    comment:
      "Polite communication, covered cargo with clean tarpaulin to protect organic greens from sun heat.",
    date: "3 days ago",
    tag: "Protective Tarpaulin",
  },
];

export default function RiderDeliveries() {
  const { currentUser, openAuthModal } = useAuthStore();
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const activeUser = isHydrated ? currentUser : null;
  const isRiderLoggedIn = activeUser && activeUser.role === "rider";
  const riderName = isRiderLoggedIn ? activeUser.name : "Rajesh Kumar";
  const riderRating = isRiderLoggedIn ? (activeUser.riderProfile?.rating || 4.92) : 4.92;
  const riderVehicle = isRiderLoggedIn
    ? `${activeUser.riderProfile?.vehicleType || "Electric Tata Ace"} (${activeUser.riderProfile?.vehicleNumber || "DL 1S AB 4421"})`
    : "Vehicle: Electric Tata Ace (DL 1S AB 4421)";
  const riderSafetyScore = isRiderLoggedIn
    ? (activeUser.riderProfile?.safetyScore || 99)
    : 99;

  const [isOnline, setIsOnline] = useState(true);
  const [deliveries, setDeliveries] =
    useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryOrder | null>(
    INITIAL_DELIVERIES[0],
  );
  const [deliveryStep, setDeliveryStep] = useState<
    "pickup" | "transit" | "dropoff" | "completed"
  >("pickup");
  const [todayEarnings, setTodayEarnings] = useState(660);
  const [todayTrips, setTodayTrips] = useState(2);

  // Decline request handler
  const handleDecline = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
    if (activeDelivery?.id === id) {
      setActiveDelivery(null);
    }
  };

  // Accept request handler
  const handleAccept = (order: DeliveryOrder) => {
    setActiveDelivery(order);
    setDeliveryStep("pickup");
  };

  // Progress active delivery steps: pickup -> transit -> dropoff -> completed
  const handleNextStep = () => {
    if (deliveryStep === "pickup") {
      setDeliveryStep("transit");
    } else if (deliveryStep === "transit") {
      setDeliveryStep("dropoff");
    } else if (deliveryStep === "dropoff") {
      if (activeDelivery) {
        setTodayEarnings((prev) => prev + activeDelivery.payout);
        setTodayTrips((prev) => prev + 1);
      }
      setDeliveryStep("completed");
    }
  };

  const handleFinishDelivery = () => {
    if (activeDelivery) {
      setDeliveries((prev) => prev.filter((d) => d.id !== activeDelivery.id));
    }
    setActiveDelivery(null);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* 1. UNIFIED NAVBAR */}
      <Navbar />

      {/* 2. STREAMLINED RIDER PROFILE & METRICS HEADER BANNER */}
      <div className="bg-[#0b3b20] text-white border-b border-emerald-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Column: Rider Identity & Vehicle Tag */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Avatar
                name={riderName}
                className="w-14 h-14 rounded-2xl border-2 border-amber-400 text-base shadow-md bg-emerald-950 text-amber-300"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 rounded-full p-1 shadow">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight font-sans">
                  {riderName}
                </h1>
                <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                  ★ {riderRating} · Diamond Rider
                </span>
                {isRiderLoggedIn ? (
                  <button
                    onClick={() => openAuthModal("rider")}
                    className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                  >
                    Switch Partner
                  </button>
                ) : (
                  <button
                    onClick={() => openAuthModal("rider")}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition shadow-xs btn-interactive"
                  >
                    <User className="w-3 h-3" />
                    <span>Sign in</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-200/90 mt-1 flex-wrap font-medium">
                <span>{riderVehicle}</span>
                <span>•</span>
                <span className="text-emerald-300">Delhi-Sonipat Corridor</span>
              </div>

              {/* Inline Surge Announcement Chip */}
              {isOnline && (
                <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-amber-300 font-semibold bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Morning Surge: +₹50 bonus per delivered batch</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Consolidated Metrics & Duty Toggle */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-3 bg-[#052112] border border-emerald-800/80 px-4 py-2 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  Today&apos;s Earnings
                </span>
                <span className="text-sm font-extrabold text-amber-300 font-sans tabular-nums">
                  ₹{todayEarnings}
                </span>
              </div>
              <div className="h-6 w-px bg-emerald-800" />
              <div>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  Trips
                </span>
                <span className="text-sm font-extrabold text-white font-sans tabular-nums">
                  {todayTrips}
                </span>
              </div>
              <div className="h-6 w-px bg-emerald-800" />
              <div>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  SLA / Safety
                </span>
                <span className="text-sm font-extrabold text-white font-sans tabular-nums">
                  99% / {riderSafetyScore}%
                </span>
              </div>
            </div>

            {/* Sleek Online / Offline Duty Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer select-none shadow-xs btn-interactive ${
                isOnline
                  ? "bg-amber-400 hover:bg-amber-300 text-emerald-950 border border-amber-500/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? "Duty Online" : "Duty Offline"}</span>
            </button>
          </div>
        </div>

        {/* Guest Partner Notification Bar */}
        {!isRiderLoggedIn && (
          <div className="bg-[#052112] text-amber-300 border-t border-emerald-800/60 px-4 py-2 text-xs font-medium flex items-center justify-between">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
              <span>
                🔒 Guest Mode: Sign in to activate your assigned vehicle GPS tracking and claim active farm dispatches.
              </span>
              <button
                onClick={() => openAuthModal("rider")}
                className="underline font-bold text-white hover:text-amber-200 shrink-0 cursor-pointer text-xs"
              >
                Sign in as Delivery Partner ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN DASHBOARD: 2-COLUMN RESPONSIVE LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: DISPATCHES & ACTIVE TRIP                     */}
          {/* ======================================================== */}
          <section className="lg:col-span-7 space-y-6">
            {/* Wallet Summary Card */}
            <div className="grid grid-cols-3 gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Today&apos;s Payout
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0b3b20] dark:text-emerald-400 font-sans tabular-nums">
                  ₹{todayEarnings}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Completed Trips
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-sans tabular-nums">
                  {todayTrips} trips
                </span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Weekly Volume
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-sans tabular-nums">
                  1,280 kg
                </span>
              </div>
            </div>

            {/* ACTIVE TRIP CARD */}
            {activeDelivery && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="bg-[#0b3b20] text-white p-4 flex flex-row justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full">
                      Active Trip
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {activeDelivery.quantityKg} kg {activeDelivery.cropName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 block font-medium">
                      Guaranteed Payout
                    </span>
                    <span className="text-xl font-extrabold text-amber-300 font-sans tabular-nums">
                      ₹{activeDelivery.payout}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {deliveryStep !== "completed" ? (
                    <div className="space-y-4">
                      {/* Minimalist Route Stepper */}
                      <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        {/* Step 1: Pickup */}
                        <div className="flex gap-3 items-start">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              deliveryStep === "pickup"
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-700 text-white"
                            }`}>
                              {deliveryStep === "pickup" ? "1" : <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700 my-1" />
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              🟢 Farm Gate Pickup: {activeDelivery.pickupName}
                            </span>
                            <span className="text-zinc-500 block text-[11px]">
                              {activeDelivery.pickupLocation} ({activeDelivery.quantityKg} kg)
                            </span>
                          </div>
                        </div>

                        {/* Step 2: Transit */}
                        <div className="flex gap-3 items-start">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              deliveryStep === "transit"
                                ? "bg-amber-400 text-emerald-950"
                                : deliveryStep === "dropoff"
                                ? "bg-emerald-700 text-white"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                            }`}>
                              {deliveryStep === "dropoff" ? <Check className="w-3 h-3 stroke-[3]" /> : "2"}
                            </div>
                            <div className="w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700 my-1" />
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              🛣️ Transit: NH-44 GT Corridor
                            </span>
                            <span className="text-zinc-500 block text-[11px]">
                              {activeDelivery.tripDistanceKm} km • ~{activeDelivery.estTimeMins} mins
                            </span>
                          </div>
                        </div>

                        {/* Step 3: Dropoff */}
                        <div className="flex gap-3 items-start">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              deliveryStep === "dropoff"
                                ? "bg-amber-400 text-emerald-950"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                            }`}>
                              3
                            </div>
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              🔴 Drop Destination: {activeDelivery.dropName}
                            </span>
                            <span className="text-zinc-500 block text-[11px]">
                              {activeDelivery.dropLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Single High-Visibility CTA Button */}
                      <button
                        onClick={handleNextStep}
                        className="w-full bg-[#0b3b20] hover:bg-emerald-800 text-amber-300 py-3 px-4 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xs btn-interactive"
                      >
                        <Navigation className="w-4 h-4 text-amber-400" />
                        <span>
                          {deliveryStep === "pickup"
                            ? "Confirm Farm Pickup & Start Transit"
                            : deliveryStep === "transit"
                            ? "Arrive at APMC Terminal & Unload"
                            : `Complete POD & Collect ₹${activeDelivery.payout}`}
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Finished Delivery screen */
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto border border-emerald-300">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                          Trip Completed Successfully!
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Payout of <strong>₹{activeDelivery.payout}</strong> has been added to your daily wallet.
                        </p>
                      </div>
                      <button
                        onClick={handleFinishDelivery}
                        className="w-full bg-[#0b3b20] hover:bg-emerald-800 text-amber-300 py-2.5 font-bold text-xs rounded-2xl btn-interactive cursor-pointer"
                      >
                        Accept Next Sourced Trip ➔
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INCOMING DISPATCH REQUESTS FEED */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                    Nearby Sourced Farm Requests
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Direct dispatches from verified regional APMC mandi farms
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  {deliveries.length} loads available
                </span>
              </div>

              {!isOnline ? (
                /* Offline Mode Banner */
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl text-center space-y-3">
                  <span className="text-2xl block">📴</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    You are currently offline
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Toggle your status to Duty Online above to receive live farm pickup requests.
                  </p>
                </div>
              ) : deliveries.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl text-center space-y-3">
                  <span className="text-2xl block">🔎</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Looking for nearby farm loads...
                  </h4>
                  <p className="text-xs text-zinc-500">
                    New listings appear as soon as farmers schedule harvest dispatch.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveries(INITIAL_DELIVERIES)}
                    className="flex items-center gap-1 mx-auto text-xs font-bold rounded-2xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Requests
                  </Button>
                </div>
              ) : (
                /* Requests list */
                <div className="space-y-4">
                  {deliveries.map((del) => {
                    const isActive = activeDelivery?.id === del.id;
                    return (
                      <div
                        key={del.id}
                        className={`bg-white dark:bg-zinc-900 border rounded-3xl p-4 transition-all duration-200 shadow-xs space-y-3 ${
                          isActive
                            ? "border-amber-400 bg-amber-50/10 dark:bg-amber-950/10"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        {/* Header: Title, Vehicle Tag, Crisp Tabular Badge Payout */}
                        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                {del.quantityKg} kg {del.cropName}
                              </span>
                              <span className="text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                                {del.vehicleRequired}
                              </span>
                            </div>
                          </div>

                          {/* Crisp Tabular Payout Indicator */}
                          <div className="text-right shrink-0 bg-[#0b3b20] px-3 py-1.5 rounded-2xl text-white">
                            <span className="text-[10px] text-amber-300 block font-semibold">
                              Payout
                            </span>
                            <span className="text-base font-extrabold text-amber-300 font-sans tabular-nums">
                              ₹{del.payout}
                            </span>
                          </div>
                        </div>

                        {/* Clean Route Visual Timeline */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-semibold text-zinc-900 dark:text-white truncate">
                              {del.pickupName}
                            </span>
                            <span className="text-zinc-400 truncate text-[11px]">
                              ({del.pickupLocation})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span className="font-semibold text-zinc-900 dark:text-white truncate">
                              {del.dropName}
                            </span>
                            <span className="text-zinc-400 truncate text-[11px]">
                              ({del.dropLocation})
                            </span>
                          </div>
                        </div>

                        {/* Bottom Metric Badge + Actions */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs text-zinc-500 font-medium">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-[11px] tabular-nums">
                            {del.tripDistanceKm} km · {del.estTimeMins} mins
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecline(del.id)}
                              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold transition cursor-pointer text-xs btn-interactive"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAccept(del)}
                              className="px-4 py-1.5 bg-[#0b3b20] hover:bg-emerald-800 text-amber-300 rounded-2xl font-bold transition cursor-pointer text-xs btn-interactive shadow-xs"
                            >
                              {isActive ? "Viewing Route" : "Accept Trip"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: LIVE MAP & CUSTOMER REVIEWS                 */}
          {/* ======================================================== */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* OpenStreetMap Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs overflow-hidden space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-white">
                    Live OpenStreetMap Route
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300/40">
                  <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> GPS Active
                </span>
              </div>

              {/* Integrated Map Container with Floating Overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 aspect-[4/3] shadow-inner flex flex-col justify-between p-3">
                <iframe
                  title="OpenStreetMap Sourcing Route"
                  className="absolute inset-0 w-full h-full border-none opacity-85 pointer-events-none"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    activeDelivery?.pickupLat && activeDelivery?.pickupLng && activeDelivery?.dropLat && activeDelivery?.dropLng
                      ? `${Math.min(activeDelivery.pickupLng, activeDelivery.dropLng) - 0.06}%2C${Math.min(activeDelivery.pickupLat, activeDelivery.dropLat) - 0.06}%2C${Math.max(activeDelivery.pickupLng, activeDelivery.dropLng) + 0.06}%2C${Math.max(activeDelivery.pickupLat, activeDelivery.dropLat) + 0.06}`
                      : "76.9000%2C28.6000%2C77.2500%2C29.0500"
                  }&layer=mapnik`}
                />

                {/* Animated Route SVG Overlay */}
                <svg viewBox="0 0 320 220" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 50,55 Q 125,75 160,110 T 260,165" fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="5 3" className="animate-pulse" />
                  <circle cx="50" cy="55" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="260" cy="165" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                </svg>

                {/* Floating Top Route Info Badge Overlay */}
                <div className="relative z-20 bg-black/75 backdrop-blur-md border border-zinc-700/60 rounded-xl p-2 shadow-md flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Navigation className="w-3 h-3 text-amber-400" />
                    {activeDelivery ? `${activeDelivery.tripDistanceKm} km` : "14 km"}
                  </span>
                  <span className="text-[11px] text-amber-300">
                    ETA ~{activeDelivery ? `${activeDelivery.estTimeMins} mins` : "40 mins"}
                  </span>
                </div>

                {/* Integrated Floating Milestone Overlay */}
                <div className="relative z-20 bg-black/75 backdrop-blur-md rounded-xl p-2 border border-zinc-700/60 text-[11px] text-zinc-200">
                  <span className="font-semibold text-amber-300 block text-[10px]">
                    Turn-by-turn Milestone:
                  </span>
                  <p className="truncate text-zinc-300 text-[11px]">
                    {deliveryStep === "pickup"
                      ? "Feeder road to Sonipat farm gate for loading"
                      : deliveryStep === "transit"
                      ? "Merge onto NH-44 GT Corridor toward Azadpur"
                      : "Azadpur Gate 4 weighbridge commercial lane"}
                  </p>
                </div>
              </div>
            </div>

            {/* Flattened Customer Reviews Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-white">
                    Feedback & Ratings
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  ★ 4.92 / 5.0
                </span>
              </div>

              {/* Flattened Review Rows */}
              <div className="space-y-2.5">
                {RIDER_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {rev.author} ({rev.role}) • ★ {rev.rating}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {rev.date}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <div className="pt-0.5">
                      <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-full">
                        {rev.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 4. UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
