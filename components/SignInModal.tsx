// components/SignInModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore, UserRole, PRESET_USERS } from "@/lib/auth-store";
import { X, Check, Phone, ShieldCheck, Sparkles, ArrowRight, Lock, Mail, Sprout, Store, Truck } from "lucide-react";
import { Avatar } from "@/components/Avatar";

export function SignInModal() {
  const { isModalOpen, modalDefaultRole, closeAuthModal, quickDemoLogin, login } = useAuthStore();
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const [authMethod, setAuthMethod] = useState<"demo" | "otp" | "password">("demo");

  const selectedRole = roleOverride ?? modalDefaultRole;

  // OTP Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpLoading, setOtpLoading] = useState(false);

  // Password Form State
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleClose = () => {
    setRoleOverride(null);
    setAuthMethod("demo");
    setOtpSent(false);
    setOtpCode(["", "", "", "", "", ""]);
    closeAuthModal();
  };

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!isModalOpen) return null;

  const currentPreset = PRESET_USERS[selectedRole];

  // Send simulated OTP
  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtpTimer(30);
      setOtpCode(["1", "2", "3", "4", "5", "6"]); // Pre-fill mock OTP for easy testing
      setOtpLoading(false);
    }, 600);
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = () => {
    const enteredOtp = otpCode.join("");
    if (enteredOtp.length < 6) return;

    // Create user from phone
    login({
      id: `user_${selectedRole}_${Date.now()}`,
      name: currentPreset.name,
      phone: `+91 ${phoneNumber}`,
      role: selectedRole,
      location: currentPreset.location,
      buyerProfile: currentPreset.buyerProfile,
      farmerProfile: currentPreset.farmerProfile,
      riderProfile: currentPreset.riderProfile,
    });
  };

  // Password Sign In
  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      id: `user_${selectedRole}_${Date.now()}`,
      name: nameInput || currentPreset.name,
      phone: currentPreset.phone,
      email: emailInput || currentPreset.email,
      role: selectedRole,
      location: currentPreset.location,
      buyerProfile: currentPreset.buyerProfile,
      farmerProfile: currentPreset.farmerProfile,
      riderProfile: currentPreset.riderProfile,
    });
  };

  const roleConfig = {
    buyer: {
      title: "Consumer & Retail Sign In",
      badge: "🛒 Mandi Marketplace",
      desc: "Order farm-fresh produce direct from regional farmers within 50 km.",
      themeColor: "from-teal-600 to-emerald-800",
      accentBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-teal-200",
      btnClass: "bg-[#002f34] hover:bg-[#003d44] text-white",
      icon: Store,
    },
    farmer: {
      title: "Kisaan / Farmer Sign In",
      badge: "🌾 Seller Portal",
      desc: "List harvests, check AI mandi price trends, and receive direct payments.",
      themeColor: "from-amber-600 via-emerald-800 to-[#0b3b20]",
      accentBg: "bg-amber-50 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 border-amber-200",
      btnClass: "bg-[#0b3b20] hover:bg-[#072a16] text-amber-300 border border-amber-400/40",
      icon: Sprout,
    },
    rider: {
      title: "Rider Logistics Partner Sign In",
      badge: "🛵 Delivery Console",
      desc: "Accept farm-to-mandi cargo dispatches, earn distance incentives and surge pay.",
      themeColor: "from-emerald-700 via-amber-600 to-emerald-950",
      accentBg: "bg-emerald-50 dark:bg-zinc-800 text-emerald-900 dark:text-emerald-200 border-emerald-200",
      btnClass: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-emerald-950 font-black",
      icon: Truck,
    },
  };

  const activeConf = roleConfig[selectedRole];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-glass-backdrop transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-2 border-amber-200/80 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className={`bg-gradient-to-r ${activeConf.themeColor} text-white p-6 relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs border border-white/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {activeConf.badge}
            </span>
          </div>

          <h2 className="text-2xl font-black font-serif tracking-tight text-white">
            {activeConf.title}
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-md font-medium leading-relaxed">
            {activeConf.desc}
          </p>
        </div>

        {/* Portal Role Switcher Tabs */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/40">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
            Select Portal Account Type:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setRoleOverride("buyer")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                selectedRole === "buyer"
                  ? "bg-[#002f34] text-white border-[#002f34] shadow-sm font-black"
                  : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              <Store className="w-4 h-4 text-teal-400" />
              <span>🛒 Consumer</span>
            </button>

            <button
              onClick={() => setRoleOverride("farmer")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                selectedRole === "farmer"
                  ? "bg-[#0b3b20] text-amber-300 border-[#0b3b20] shadow-sm font-black"
                  : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              <Sprout className="w-4 h-4 text-amber-400" />
              <span>🧑‍🌾 Farmer / Kisaan</span>
            </button>

            <button
              onClick={() => setRoleOverride("rider")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                selectedRole === "rider"
                  ? "bg-amber-500 text-emerald-950 border-amber-500 shadow-sm font-black"
                  : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-300" />
              <span>🛵 Rider Partner</span>
            </button>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="px-6 pt-4 flex gap-4 border-b border-gray-100 dark:border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setAuthMethod("demo")}
            className={`pb-2.5 border-b-2 cursor-pointer transition ${
              authMethod === "demo"
                ? "border-amber-500 text-emerald-950 dark:text-amber-400 font-black"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
          >
            ⚡ 1-Click Demo Login
          </button>
          <button
            onClick={() => setAuthMethod("otp")}
            className={`pb-2.5 border-b-2 cursor-pointer transition ${
              authMethod === "otp"
                ? "border-amber-500 text-emerald-950 dark:text-amber-400 font-black"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
          >
            📱 Mobile OTP
          </button>
          <button
            onClick={() => setAuthMethod("password")}
            className={`pb-2.5 border-b-2 cursor-pointer transition ${
              authMethod === "password"
                ? "border-amber-500 text-emerald-950 dark:text-amber-400 font-black"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
          >
            ✉️ Email / Password
          </button>
        </div>

        {/* Content Body based on Auth Method */}
        <div className="p-6 space-y-4">
          {/* METHOD 1: 1-CLICK DEMO LOGIN */}
          {authMethod === "demo" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/80 border border-amber-200/80 dark:border-zinc-700 flex items-start gap-4">
                <Avatar name={currentPreset.name} className="w-12 h-12 rounded-xl text-sm shrink-0 border border-amber-300" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-emerald-950 dark:text-white truncate">
                      {currentPreset.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    📞 {currentPreset.phone}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    📍 {currentPreset.location}
                  </p>

                  {/* Role Specific Highlight */}
                  <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-zinc-700 text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                    {selectedRole === "buyer" && "⭐ FarmFresh Gold Member • Saved Delhi NCR Addresses"}
                    {selectedRole === "farmer" && "🌾 Kisan ID: KCC-HR-894120 • 42 Harvest Batches Published"}
                    {selectedRole === "rider" && "🛵 Tata Ace EV (DL 1S AB 4421) • 4.92 Rating (348 Trips)"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => quickDemoLogin(selectedRole)}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer ${activeConf.btnClass}`}
              >
                <span>Sign In as {currentPreset.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* METHOD 2: MOBILE OTP LOGIN */}
          {authMethod === "otp" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!otpSent ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Enter 10-digit Indian Mobile Number
                  </label>
                  <div className="flex rounded-xl border-2 border-gray-300 dark:border-zinc-700 overflow-hidden focus-within:border-amber-500 bg-white dark:bg-zinc-800">
                    <span className="px-3.5 py-2.5 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98100 12345"
                      className="flex-1 px-3 py-2.5 text-sm font-semibold focus:outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    We will send a high-priority 6-digit verification code to this mobile.
                  </p>

                  <button
                    onClick={handleSendOtp}
                    disabled={phoneNumber.length < 10 || otpLoading}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 ${activeConf.btnClass}`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{otpLoading ? "Sending SMS OTP..." : "Send Verification Code"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Code sent to <strong>+91 {phoneNumber}</strong>
                    </span>
                    <button
                      onClick={() => setOtpSent(false)}
                      className="text-amber-700 dark:text-amber-400 underline font-bold cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6-Digit Box */}
                  <div className="flex justify-between gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value;
                          const copy = [...otpCode];
                          copy[idx] = val;
                          setOtpCode(copy);
                        }}
                        className="w-11 h-12 text-center text-lg font-black rounded-xl border-2 border-gray-300 dark:border-zinc-700 focus:border-amber-500 bg-white dark:bg-zinc-800 focus:outline-none"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Didn&apos;t receive code?</span>
                    {otpTimer > 0 ? (
                      <span className="font-bold">Resend in {otpTimer}s</span>
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        className="text-amber-700 dark:text-amber-400 font-bold underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${activeConf.btnClass}`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Sign In to {activeConf.badge}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD 3: EMAIL / PASSWORD */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordSignIn} className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={currentPreset.name}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={currentPreset.email}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2 ${activeConf.btnClass}`}
              >
                <span>Continue to {activeConf.badge}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Security & Support Footer */}
        <div className="p-3.5 bg-gray-50 dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-bit encrypted authentication
          </span>
          <span>DoCA Krishi Network</span>
        </div>
      </div>
    </div>
  );
}
