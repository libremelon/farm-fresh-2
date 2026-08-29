"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Store,
  Boxes,
  Truck,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";
import { useAuthStore, UserRole } from "@/lib/auth-store";
import { SignInModal } from "@/components/SignInModal";
import { Avatar } from "@/components/Avatar";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { currentUser, logout, openAuthModal } = useAuthStore();

  const currentPortalRole: UserRole = pathname.startsWith("/farmer")
    ? "farmer"
    : pathname.startsWith("/rider")
    ? "rider"
    : "buyer";

  const navLinks = [
    {
      name: "Mandi Marketplace",
      href: "/buyer/marketplace",
      icon: Store,
    },
    {
      name: "Bulk Sourcing",
      href: "/buyer/bulk-order",
      icon: Boxes,
    },
    {
      name: "Farmer Portal",
      href: "/farmer/crops/new",
      icon: Sprout,
    },
    {
      name: "Rider Logistics",
      href: "/rider/deliveries",
      icon: Truck,
    },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. TOP LIVE MANDI TICKER STRIP */}
      <div className="bg-[#052514] text-amber-300 text-[11px] font-medium py-1.5 px-4 border-b border-amber-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] border border-amber-400/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Live Mandi Ticker
            </span>
          </div>

          <div className="truncate hidden sm:flex items-center gap-6 text-emerald-100/90 text-xs">
            <span>
              🍅 Sonipat Tomatoes: <strong>₹24/kg</strong>{" "}
              <span className="text-emerald-400">▲ +4%</span>
            </span>
            <span>
              🧅 Lasalgaon Onions: <strong>₹22/kg</strong>{" "}
              <span className="text-emerald-400">▲ +2%</span>
            </span>
            <span>
              🌾 MP Sharbati Wheat: <strong>₹34/kg</strong>{" "}
              <span className="text-amber-300">● Stable</span>
            </span>
            <span>
              🥭 Ratnagiri Mangoes: <strong>₹190/kg</strong>{" "}
              <span className="text-emerald-400">▲ +8%</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-emerald-200/80 text-[11px]">
            <span className="hidden md:inline font-semibold">
              📞 Kisan Helpline: 1800-180-1551
            </span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-amber-200 border border-emerald-700/50 font-bold">
              DoCA Direct
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND NAVIGATION BAR */}
      <nav className="bg-[#0b3b20] border-b border-emerald-800/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 p-0.5 shadow-md group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0b3b20] rounded-[10px] flex items-center justify-center text-xl">
                🌾
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-serif">
                  FarmFresh
                </span>
                <span className="text-[10px] font-extrabold bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded font-sans tracking-wide">
                  KRISHI
                </span>
              </div>
              <p className="text-[10px] font-medium text-emerald-300/90 tracking-wide">
                100% Direct Farm Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#072a16]/80 p-1 rounded-xl border border-emerald-700/60 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? "bg-amber-400 text-emerald-950 shadow-sm"
                      : "text-emerald-100 hover:text-white hover:bg-emerald-800/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-emerald-950" : "text-amber-400"}`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick CTA, Sign In & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Context-Aware Sign In / User Profile Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#072a16] hover:bg-emerald-800/60 border border-emerald-600 text-xs font-bold transition cursor-pointer text-white"
                >
                  <Avatar name={currentUser.name} className="w-6 h-6 rounded-lg text-[10px] border border-amber-400" />
                  <div className="text-left hidden sm:block">
                    <span className="block leading-tight font-extrabold max-w-[90px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="block text-[9px] text-amber-300 font-semibold uppercase">
                      {currentUser.role === "farmer"
                        ? "🧑‍🌾 Kisaan"
                        : currentUser.role === "rider"
                        ? "🛵 Rider"
                        : "🛒 Consumer"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-2 z-50 animate-in fade-in zoom-in-95 text-xs text-gray-800 dark:text-zinc-200">
                    <div className="p-2.5 bg-emerald-50 dark:bg-zinc-800 rounded-xl mb-1.5">
                      <span className="font-extrabold text-emerald-950 dark:text-white block">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {currentUser.phone}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                        Role: {currentUser.role.toUpperCase()}
                      </span>
                    </div>

                    {currentUser.role === "buyer" && (
                      <Link
                        href="/buyer/marketplace?orders=true"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-zinc-800 text-teal-800 dark:text-teal-300 font-bold cursor-pointer flex items-center justify-between mb-1"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-teal-600" />
                          <span>My Orders</span>
                        </div>
                        <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1.5 py-0.2 rounded font-black">
                          Track
                        </span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openAuthModal(currentPortalRole);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium cursor-pointer flex items-center justify-between"
                    >
                      <span>Switch Role / Account</span>
                      <User className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold cursor-pointer flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 mt-1"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => openAuthModal(currentPortalRole)}
                className="h-10 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {currentPortalRole === "farmer"
                    ? "🧑‍🌾 Farmer Sign In"
                    : currentPortalRole === "rider"
                    ? "🛵 Rider Sign In"
                    : "Sign In"}
                </span>
              </Button>
            )}

            <Link href="/farmer/crops/new" className="hidden md:block">
              <Button className="h-10 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black shadow-md border border-amber-300/40 text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 leading-none transition">
                <span>🧑‍🌾</span>
                <span>List Crop</span>
              </Button>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-emerald-900/60 text-emerald-100 hover:text-white border border-emerald-700 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#072a16] border-t border-emerald-800 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Auth Button */}
            <div className="pb-2 border-b border-emerald-800/80">
              {currentUser ? (
                <div className="p-3 bg-[#0b3b20] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar name={currentUser.name} className="w-8 h-8 rounded-lg text-xs" />
                    <div>
                      <span className="font-extrabold text-white block">{currentUser.name}</span>
                      <span className="text-[10px] text-amber-300 block">{currentUser.role.toUpperCase()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 text-red-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    openAuthModal(currentPortalRole);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs h-10"
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  <span>
                    {currentPortalRole === "farmer"
                      ? "🧑‍🌾 Sign In as Farmer"
                      : currentPortalRole === "rider"
                      ? "🛵 Sign In as Rider"
                      : "🛒 Sign In as Consumer"}
                  </span>
                </Button>
              )}
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm font-bold ${
                    isActive
                      ? "bg-amber-400 text-emerald-950"
                      : "text-emerald-100 hover:bg-emerald-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/farmer/crops/new"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm">
                  🧑‍🌾 List Crop
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Global Interactive Sign In Modal */}
      <SignInModal />
    </header>
  );
}
