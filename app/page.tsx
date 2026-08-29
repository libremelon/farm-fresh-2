"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { mockListings } from "@/lib/mock-data";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  Truck,
  Sprout,
  ChevronRight,
  Scale,
  Leaf,
} from "lucide-react";

export default function Home() {
  const [activeRoleTab, setActiveRoleTab] = useState<
    "farmer" | "buyer" | "bulk" | "rider"
  >("farmer");

  const roleDetails = {
    farmer: {
      tag: "Farmer & FPO Portal",
      title: "Sell directly to consumers & bulk buyers with AI Mandi Intelligence",
      desc: "List your harvest in seconds. Our AI analyzes live APMC Mandi trends, regional buyer demand, and weather forecasts to recommend whether to Sell Now or Hold for maximum returns.",
      bullets: [
        "100% Direct Payouts — Eliminate middleman commission cuts (save 15-25%).",
        "AI Price Advisory & Weather Insights — Know when prices will surge.",
        "Doorstep Logistics Dispatch — Request nearby mini-truck pickups with zero hassle.",
      ],
      link: "/farmer/crops/new",
      cta: "🧑‍🌾 Open Farmer Listing Portal",
      badge: "Kisaan Empowerment",
      img: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
    },
    buyer: {
      tag: "Consumer & Retail Marketplace",
      title: "Fresh, vine-ripened produce direct from nearby Indian farms",
      desc: "Browse geo-fenced crop listings from verified farmers within 10km to 50km of your doorstep. Enjoy fresher farm produce at lower wholesale prices.",
      bullets: [
        "Farm-to-Fork in 12 Hours — Produce harvested morning of dispatch.",
        "Transparent Farmer Pricing — Know exactly which farmer grew your food.",
        "OLX-Style Local Discovery — Filter by distance, quality grade, and category.",
      ],
      link: "/buyer/marketplace",
      cta: "🛒 Explore Mandi Marketplace",
      badge: "Direct Consumer",
      img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    },
    bulk: {
      tag: "Bulk Sourcing & FPO Aggregation",
      title: "Smart Order Aggregation for Bulk Buyers, Wholesalers & Canteens",
      desc: "Need 1,000 kg or 10 Tons of produce? Our engine automatically pools inventory from multiple verified smallholder farms in your district to fulfill large orders effortlessly.",
      bullets: [
        "Automated Multi-Farm Splitting — Fulfill heavy demand without broker friction.",
        "Integrated Freight & Quality Checks — Grade A/B certified batches.",
        "Single Invoice & Consolidated Transport — One shipment, multiple local farms.",
      ],
      link: "/buyer/bulk-order",
      cta: "📦 Test Bulk Aggregation Engine",
      badge: "B2B Procurement",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    },
    rider: {
      tag: "Rural & Urban Logistics Network",
      title: "AI-Optimized Multi-Stop Agricultural Route Dispatch",
      desc: "Swiggy-style dispatch portal for rural mini-trucks, auto carriers, and two-wheeler delivery partners. Maximize earnings through optimized farm-to-city trip routing.",
      bullets: [
        "Guaranteed Distance & Weight Payouts — Fair transparent earnings per load.",
        "Multi-Pickup Route Optimization — Minimizes empty return trips and fuel usage.",
        "Direct Farmer Coordination — Real-time GPS pick up and delivery timestamps.",
      ],
      link: "/rider/deliveries",
      cta: "🛵 Open Rider Dispatch Console",
      badge: "Agri-Logistics",
      img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    },
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] dark:bg-zinc-950 text-emerald-950 dark:text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      
      {/* 1. UNIFIED NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION WITH AUTHENTIC INDIAN FARM AESTHETICS */}
      <section className="relative bg-gradient-to-b from-[#0b3b20] via-[#09331b] to-[#052112] text-white overflow-hidden py-16 sm:py-24 border-b-4 border-amber-500">
        
        {/* Subtle decorative farm pattern / texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Problem Statement Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>DoCA Initiative: Eliminating Intermediary Markups</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.15] text-white">
                Connecting Indian Farmers Directly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">Consumers & Bulk Buyers</span>
              </h1>

              {/* Sub-headline / Mission */}
              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                Multiple intermediaries reduce farmers&apos; earnings and increase consumer prices. <strong>FarmFresh Krishi</strong> delivers fair prices to farmers, lower costs for buyers, and AI-optimized rural logistics.
              </p>

              {/* Direct CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/buyer/marketplace" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black px-8 py-6 text-base rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-300 cursor-pointer btn-interactive"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    <span>Explore Mandi Marketplace</span>
                  </Button>
                </Link>

                <Link href="/farmer/crops/new" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-emerald-900/60 border-emerald-600/80 text-white hover:bg-emerald-800/80 font-bold px-8 py-6 text-base rounded-2xl shadow-md cursor-pointer btn-interactive"
                  >
                    <Sprout className="w-5 h-5 mr-2 text-amber-400" />
                    <span>Farmer Crop Listing</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-emerald-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Verified Indian APMC Mandi Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Smart Agri-Fleet Integration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Zero Middleman Commissions</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card (Indian Farmer & Harvest Showcase) */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Visual Glow Behind Image */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 to-emerald-500 rounded-3xl blur-lg opacity-40 -z-10" />

                {/* Main Card */}
                <div className="bg-[#082e1a] border-2 border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl p-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                      alt="Indian Farmer in Mustard and Vegetable Field"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-400 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          100% Kisaan Direct
                        </span>
                        <span className="text-xs text-amber-300 font-bold">
                          Sonipat Mandi Cluster
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mt-1.5">Rameshwar Patel</h3>
                      <p className="text-xs text-emerald-200/90">
                        Supplying fresh A-Grade tomatoes directly to 240+ retail buyers with zero commission cuts.
                      </p>
                    </div>
                  </div>

                  {/* Live Mini Price Benchmark Ribbon */}
                  <div className="grid grid-cols-3 gap-2 mt-2 p-3 bg-[#052112] rounded-xl text-center border border-emerald-800">
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase font-bold block">Farm Price</span>
                      <span className="text-sm font-black text-amber-300">₹24 / kg</span>
                    </div>
                    <div className="border-x border-emerald-800">
                      <span className="text-[10px] text-emerald-300 uppercase font-bold block">Middleman Mandi</span>
                      <span className="text-sm font-bold text-red-400 line-through">₹36 / kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase font-bold block">Buyer Saves</span>
                      <span className="text-sm font-black text-emerald-400">33% Direct</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. NATIONAL IMPACT METRICS (Earthy Warm Palette) */}
      <section className="bg-amber-50 dark:bg-zinc-900 border-b border-amber-200 dark:border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 bg-white dark:bg-zinc-800/80 rounded-xl border border-amber-200/80 dark:border-zinc-700 shadow-sm">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-400 font-serif block">
                ₹50 Cr+
              </span>
              <span className="text-xs font-bold text-emerald-950 dark:text-zinc-200 mt-1 block">
                Direct-to-Farmer Earnings
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Bypassing broker fees</span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800/80 rounded-xl border border-amber-200/80 dark:border-zinc-700 shadow-sm">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-400 font-serif block">
                18M kg
              </span>
              <span className="text-xs font-bold text-emerald-950 dark:text-zinc-200 mt-1 block">
                Fresh Produce Dispatched
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Within 12 hours of harvest</span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800/80 rounded-xl border border-amber-200/80 dark:border-zinc-700 shadow-sm">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-400 font-serif block">
                22%
              </span>
              <span className="text-xs font-bold text-emerald-950 dark:text-zinc-200 mt-1 block">
                Lower Cost for Consumers
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Vs. Traditional retail mandis</span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800/80 rounded-xl border border-amber-200/80 dark:border-zinc-700 shadow-sm">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-400 font-serif block">
                15,000+
              </span>
              <span className="text-xs font-bold text-emerald-950 dark:text-zinc-200 mt-1 block">
                FPOs & Logistics Fleets
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Active across 6 states</span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FRESH HARVEST PRODUCE SHOWCASE (Visual Indian Produce Grid) */}
      <section className="py-16 sm:py-20 bg-[#faf8f2] dark:bg-zinc-950 border-b border-emerald-900/10 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full mb-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Daily Morning Harvests</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-emerald-950 dark:text-white font-serif tracking-tight">
                Direct From Verified Regional Farmers
              </h2>
              <p className="text-sm text-emerald-800/70 dark:text-zinc-400 mt-1">
                Harvested within 50 km radius. Zero cold-storage preservatives.
              </p>
            </div>

            <Link href="/buyer/marketplace">
              <Button className="bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 font-bold text-xs rounded-lg px-5 shadow-sm">
                <span>View All 50+ Sourced Crops</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Grid of Produce Cards with Farmer Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockListings.slice(0, 4).map((crop) => (
              <Link
                key={crop.id}
                href="/buyer/marketplace"
                className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-amber-200/80 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Grade & Price Badge */}
                  <div className="relative aspect-[4/3] bg-emerald-950 overflow-hidden">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                        GRADE {crop.quality}
                      </span>
                      {crop.featured && (
                        <span className="bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                          ★ TAUGHT HARVEST
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-[#0b3b20]/90 backdrop-blur-xs text-amber-300 px-2.5 py-1 rounded-lg font-black text-sm border border-amber-400/40">
                      ₹{crop.pricePerKg} <span className="text-[10px] font-normal text-emerald-200">/ kg</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-400 font-bold">
                      <span>{crop.category}</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{crop.postedDate}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-emerald-950 dark:text-white leading-snug group-hover:text-emerald-700 transition">
                      {crop.name}
                    </h4>


                    <div className="pt-2 border-t border-emerald-900/10 dark:border-zinc-800 text-xs text-emerald-900/80 dark:text-zinc-300 flex items-center justify-between">
                      <span className="font-medium truncate max-w-[150px]">
                        🧑‍🌾 {crop.farmer.name.split(" ")[0]}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {crop.quantityKg} kg left
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 group-hover:bg-amber-400 text-emerald-900 dark:text-emerald-200 group-hover:text-emerald-950 text-xs font-bold text-center rounded-lg transition flex items-center justify-center gap-1">
                    <span>Direct Sourcing Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE KISAAN ROLE PLATFORM (Farmer, Buyer, Bulk, Rider) */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-b border-emerald-900/10 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
              Four Connected Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white font-serif tracking-tight">
              An Integrated Ecosystem For Indian Agriculture
            </h2>
            <p className="text-sm text-emerald-800/80 dark:text-zinc-400">
              Select your role below to explore how FarmFresh Krishi digitizes supply chain efficiency.
            </p>
          </div>

          {/* Interactive Role Buttons */}
          <div className="flex justify-center flex-wrap gap-2 max-w-2xl mx-auto p-1.5 bg-[#faf8f2] dark:bg-zinc-800 rounded-2xl border border-amber-200 dark:border-zinc-700">
            {[
              { id: "farmer", label: "🧑‍🌾 Farmer & FPO" },
              { id: "buyer", label: "🛒 Consumer Marketplace" },
              { id: "bulk", label: "📦 Bulk Aggregator" },
              { id: "rider", label: "🛵 Rural Logistics" },
            ].map((tab) => {
              const isSelected = activeRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id as "farmer" | "buyer" | "bulk" | "rider")}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-[#0b3b20] text-amber-300 shadow-md scale-[1.02]"
                      : "text-emerald-900 dark:text-zinc-300 hover:bg-amber-100/60 dark:hover:bg-zinc-700/50"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Showcase Card */}
          <div className="bg-[#faf8f2] dark:bg-zinc-950 border-2 border-amber-300/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-lg max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-3 py-1 rounded-md text-xs font-bold">
                  <span>{roleDetails[activeRoleTab].tag}</span>
                  <span>•</span>
                  <span className="text-amber-700 dark:text-amber-400 font-extrabold">{roleDetails[activeRoleTab].badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white font-serif leading-tight">
                  {roleDetails[activeRoleTab].title}
                </h3>

                <p className="text-sm text-emerald-900/80 dark:text-zinc-300 leading-relaxed">
                  {roleDetails[activeRoleTab].desc}
                </p>

                <ul className="space-y-2.5 pt-1">
                  {roleDetails[activeRoleTab].bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-emerald-950 dark:text-zinc-200">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        ✓
                      </div>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3">
                  <Link href={roleDetails[activeRoleTab].link}>
                    <Button className="bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 font-black text-sm px-7 py-6 rounded-xl shadow-md cursor-pointer">
                      <span>{roleDetails[activeRoleTab].cta}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Photo Preview with Indian farm setting */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-800 shadow-md">
                  <img
                    src={roleDetails[activeRoleTab].img}
                    alt={activeRoleTab}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full">
                      FarmFresh Platform Certified
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. PROVEN CASE STUDIES & FPO SUCCESS STORIES */}
      <section className="py-20 bg-[#faf8f2] dark:bg-zinc-950 border-b border-emerald-900/10 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-emerald-950 dark:text-white font-serif tracking-tight">
              Real Impact In Rural Mandi Corridors
            </h2>
            <p className="text-sm text-emerald-800/80 dark:text-zinc-400">
              How direct digital aggregation solves real supply chain bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-4 hover:shadow-md transition">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80"
                  alt="Farmer Case Study"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                Case Study: Sonipat
              </span>
              <h4 className="font-extrabold text-base text-emerald-950 dark:text-white leading-snug">
                40 Smallholders Pool 5 Tons of Potatoes in 4 Hours
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-zinc-400 leading-relaxed">
                Using our Bulk Aggregation Engine, individual farmers with 100-250 kg surplus each fulfilled a wholesale restaurant contract with one unified mini-truck dispatch.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-4 hover:shadow-md transition">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
                  alt="Grain Corridor"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                Case Study: Patiala
              </span>
              <h4 className="font-extrabold text-base text-emerald-950 dark:text-white leading-snug">
                AI Price Forecasting Prevents Panic Selling of Wheat
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-zinc-400 leading-relaxed">
                Farmers holding Sharbati wheat were notified by our AI Advisory to hold for 48 hours prior to regional mill price hikes, earning ₹4.50 extra per kilogram.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-4 hover:shadow-md transition">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"
                  alt="Logistics Optimization"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                Logistics: Delhi NCR
              </span>
              <h4 className="font-extrabold text-base text-emerald-950 dark:text-white leading-snug">
                Transit Losses Reduced By 22% in Peak Summer
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-zinc-400 leading-relaxed">
                Direct farm pickups scheduled at 5:30 AM delivered leafy greens (palak) to urban consumer societies before 9:00 AM, cutting heat spoilage to near zero.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. UNIFIED FOOTER */}
      <Footer />

    </div>
  );
}
