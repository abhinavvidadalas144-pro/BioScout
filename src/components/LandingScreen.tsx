import { useState, useRef } from "react";
import { ActiveScreen, UserProfile, Sighting, SpeciesData } from "../types";
import ShaderCanvas from "./ShaderCanvas";
import { IMAGES } from "../assets";
import { Menu, X, Compass, BookOpen, Map, Trophy, LogOut, User, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlobalSearchBar from "./GlobalSearchBar";
import ThreeDCard from "./ThreeDCard";
import EcosystemSandbox from "./EcosystemSandbox";

interface LandingScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  onReportSighting: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onSelectSpecies?: (speciesName: string) => void;
  theme?: "light" | "night";
  onToggleTheme?: () => void;
  sightings: Sighting[];
  customGuides?: SpeciesData[];
  onSelectSighting: (id: string) => void;
}

export default function LandingScreen({ 
  onNavigate, 
  onReportSighting,
  currentUser,
  onLogout,
  onOpenAuth,
  onSelectSpecies,
  theme = "light",
  onToggleTheme,
  sightings,
  customGuides = [],
  onSelectSighting
}: LandingScreenProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 420;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!currentUser) {
    return (
      <div className={`font-sans overflow-x-hidden min-h-screen transition-all duration-300 ${
        theme === "night" ? "bg-[#000d08] text-[#6ffbbe]" : "bg-[#f5f7f6] text-[#003527]"
      }`}>
        {/* Animated shader backdrop */}
        <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <ShaderCanvas />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#000d08]/10 via-[#000d08]/50 to-[#000d08] pointer-events-none"></div>

        {/* Top Navigation */}
        <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl transition-all duration-300 border-b ${
          theme === "night"
            ? "bg-[#001c13]/85 border-emerald-950/80 text-[#6ffbbe] shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
            : "bg-white/80 border-[#bfc9c3]/30 text-[#003527] shadow-[0_4px_32px_rgba(6,78,59,0.05)]"
        }`}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-between h-20">
            <div className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
              theme === "night" ? "text-[#6ffbbe]" : "text-[#003527]"
            }`}>
              <Compass className="w-6 h-6 text-emerald-500 animate-spin-slow" />
              <span>BioScout</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenAuth("login")}
                className={`text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  theme === "night" ? "text-emerald-300 hover:text-emerald-100" : "text-[#404944] hover:text-[#003527]"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="bg-gradient-to-r from-[#044c35] to-[#10b981] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </nav>

        {/* Premium Authentication Landing Experience Hero */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 pt-32 pb-20 relative z-10 min-h-screen flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Conservation Intelligence Gateway</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                  Welcome to <span className="bg-gradient-to-r from-emerald-500 via-[#10b981] to-teal-400 bg-clip-text text-transparent">BioScout</span>
                </h1>
                <p className="text-sm md:text-base text-[#4d5e54] dark:text-emerald-400/70 leading-relaxed max-w-xl font-medium">
                  An AI-powered biodiversity conservation platform for intelligent species identification, wildlife exploration, and citizen science.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="bg-gradient-to-r from-[#044c35] to-[#10b981] text-white px-8 py-4.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-8 py-4.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200/50 dark:border-emerald-950/50 flex gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/40">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-emerald-500">verified_user</span>
                  <span>Secure Naturalist ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-emerald-500">public</span>
                  <span>Active Sighting Cache</span>
                </div>
              </div>
            </div>

            {/* Right Column: High Fidelity Mockup Showcase representing premium features */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[32px] blur opacity-25 dark:opacity-40 animate-pulse-slow"></div>
              <div className="relative border rounded-[32px] overflow-hidden p-6 md:p-8 transition-all duration-300 bg-white/75 border-slate-200/50 dark:bg-[#001c12]/80 dark:border-emerald-950/50 shadow-2xl space-y-6">
                
                {/* Visual Indicator of the AI species scanner */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span>AI Classifier Engine</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>Ready</span>
                    </span>
                  </div>
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-100 dark:border-emerald-950/30">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Ara_macao_-Copan_Ruins%2C_Honduras_-wild-8.jpg" 
                      className="w-full h-full object-cover brightness-95" 
                      alt="Sample Scarlet Macaw Sighting"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 border border-emerald-400 p-2 bg-emerald-950/80 backdrop-blur text-white text-[10px] font-bold rounded-lg flex flex-col">
                      <span className="text-[#6ffbbe]">SCARLET MACAW</span>
                      <span className="text-[8px] text-emerald-300">98% Match Confidence</span>
                    </div>
                  </div>
                </div>

                {/* Visual Indicators of Map & Sandbox */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50/50 dark:bg-[#00140c] space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-emerald-500/50 tracking-wider">Coordinates Mapped</span>
                    <p className="text-xl font-black text-slate-800 dark:text-emerald-300">4.21S 62.45W</p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      <span>Amazon Canopy</span>
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50/50 dark:bg-[#00140c] space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-emerald-500/50 tracking-wider">Ecosystem Sandbox</span>
                    <p className="text-xl font-black text-slate-800 dark:text-emerald-300">Stable Biome</p>
                    <div className="flex gap-2 text-[10px] font-bold text-slate-500 dark:text-emerald-400/70">
                      <span>🌡️ 27°C</span>
                      <span>💧 85% RH</span>
                    </div>
                  </div>
                </div>

                {/* Badge showcase locked overlay */}
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/40 bg-slate-50/20 dark:bg-[#00110a]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-emerald-300">Gamified Rank & Milestones</h4>
                      <p className="text-[10px] text-slate-400 dark:text-emerald-500/50">Gain ranks, badges and complete weekly naturalist tasks</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-sans overflow-x-hidden min-h-screen transition-all duration-300 ${
      theme === "night" ? "bg-[#00100a] text-[#6ffbbe]" : "bg-[#f9f9f8] text-[#1a1c1c]"
    }`}>
      {/* Top Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl transition-all duration-300 border-b ${
        theme === "night"
          ? "bg-[#001c13]/85 border-emerald-950/80 text-[#6ffbbe] shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
          : "bg-white/70 border-transparent text-[#003527] shadow-[0_4px_32px_rgba(6,78,59,0.08)]"
      }`}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-between h-20 gap-8 md:gap-12">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`text-2xl font-extrabold tracking-tight cursor-pointer transition-all ${
              theme === "night" ? "text-[#6ffbbe]" : "text-[#003527]"
            }`} 
            onClick={() => onNavigate(ActiveScreen.LANDING)}
          >
            BioScout
          </motion.div>

          {/* Global Search Bar */}
          <div 
            className={`transition-all duration-300 ease-in-out rounded-xl ${
              isSearchFocused
                ? `flex-grow flex-shrink min-w-[150px] max-w-[200px] xs:max-w-[260px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[540px] xl:max-w-[620px] ${
                    theme === "night"
                      ? "ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.35),inset_0_2px_8px_rgba(0,0,0,0.5)] brightness-110"
                      : "ring-2 ring-emerald-600/30 shadow-[0_0_12px_rgba(16,185,129,0.2),inset_0_2px_6px_rgba(0,0,0,0.06)]"
                  }`
                : "flex-1 min-w-[130px] max-w-[160px] xs:max-w-[200px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[480px]"
            }`}
          >
            <GlobalSearchBar
              theme={theme}
              sightings={sightings}
              customGuides={customGuides}
              onSelectSpecies={(name) => {
                if (onSelectSpecies) {
                  onSelectSpecies(name);
                }
                onNavigate(ActiveScreen.GUIDE);
              }}
              onSelectSighting={(id) => {
                onSelectSighting(id);
                onNavigate(ActiveScreen.MAP);
              }}
              onFocusChange={setIsSearchFocused}
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 lg:gap-4 xl:gap-6 px-2 sm:px-4 mx-1 sm:mx-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onNavigate(ActiveScreen.LANDING)}
              className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "night" 
                  ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" 
                  : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]"
              }`}
            >
              Discover
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onNavigate(ActiveScreen.HQ)}
              className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "night" 
                  ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" 
                  : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
              }`}
            >
              Missions
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onNavigate(ActiveScreen.MAP)}
              className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "night" 
                  ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" 
                  : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
              }`}
            >
              Explore Map
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onNavigate(ActiveScreen.GUIDE)}
              className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "night" 
                  ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" 
                  : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
              }`}
            >
              Field Guide
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -0.5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onNavigate(ActiveScreen.SANDBOX)}
              className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "night" 
                  ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" 
                  : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
              }`}
            >
              Sandbox
            </motion.button>
          </div>
          
          {/* Desktop Right Nav (Hidden on Mobile) */}
          <div className="hidden xl:flex items-center gap-4 shrink-0">
            {/* Active Cache Badge */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all ${
                theme === "night"
                  ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                  : "bg-[#003527]/5 border-[#003527]/10 text-emerald-700"
              }`} title="Ecosystem Database & Mapped Coords Sync Active Offline">
              <span className="flex h-1.5 w-1.5 relative mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Off-Grid Cache</span>
            </motion.div>

            {/* Night Mode HUD Toggle */}
            {onToggleTheme && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  theme === "night"
                    ? "border-emerald-800 bg-[#002419] text-[#6ffbbe] hover:brightness-110 shadow"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
                title={theme === "night" ? "Activate Daylight UI" : "Activate Night Vision HUD"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {theme === "night" ? "visibility" : "visibility_off"}
                </span>
              </motion.button>
            )}

            {currentUser ? (
              <div className={`flex items-center gap-3 border px-4 py-2 rounded-2xl ${
                theme === "night" ? "bg-[#002419] border-emerald-800/30 text-[#6ffbbe]" : "bg-[#003527]/5 border-[#003527]/10 text-[#003527]"
              }`}>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate(ActiveScreen.HQ)}
                  className="text-xl w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#bfc9c3]/30 cursor-pointer overflow-hidden transition-all duration-300"
                  title="Go to HQ Dashboard"
                >
                  {currentUser.avatar.startsWith("data:") || currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/") ? (
                    <img 
                      src={currentUser.avatar} 
                      className="w-full h-full object-cover rounded-full" 
                      alt="User Avatar" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.avatar.includes(" ") ? currentUser.avatar.split(" ")[0] : currentUser.avatar
                  )}
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold max-w-[80px] truncate leading-tight">{currentUser.username}</span>
                  <button 
                    onClick={onLogout}
                    className="text-[10px] text-red-600 font-bold hover:underline self-start leading-none mt-0.5 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenAuth("login")}
                  className={`text-xs font-bold transition-all cursor-pointer ${
                    theme === "night" ? "text-emerald-300 hover:text-emerald-100" : "text-[#404944] hover:text-[#003527]"
                  }`}
                >
                  Sign In
                </motion.button>
                <span className="text-slate-300">|</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenAuth("register")}
                  className={`text-xs font-bold transition-all cursor-pointer mr-2 ${
                    theme === "night" ? "text-[#6ffbbe] hover:brightness-110" : "text-emerald-700 hover:text-emerald-800"
                  }`}
                >
                  Join
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile Hamburg Toggle Menu Button (Visible only on mobile) */}
          <div className="flex md:hidden items-center gap-2">
            {!currentUser && (
              <button
                onClick={() => onOpenAuth("login")}
                className="text-xs font-extrabold text-[#003527] border border-[#003527]/15 bg-white/50 py-1.5 px-3.5 rounded-full"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-[#003527] hover:bg-[#003527]/5 border border-transparent hover:border-[#003527]/10 active:scale-95 transition-all cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#001c14]/40 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#bfc9c3]/30">
                  <span className="text-xl font-extrabold text-[#003527] font-display">BioScout</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-[#404944] hover:text-[#003527] transition-all cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-5 py-8">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.LANDING); }}
                    className="flex items-center gap-3.5 text-left font-extrabold text-sm text-[#003527] hover:text-[#006c49] py-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span>Discover (Home)</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.HQ); }}
                    className="flex items-center gap-3.5 text-left font-extrabold text-sm text-[#404944] hover:text-[#003527] py-2 transition-colors cursor-pointer"
                  >
                    <Trophy className="w-4.5 h-4.5 text-emerald-700" />
                    <span>Missions (HQ)</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.MAP); }}
                    className="flex items-center gap-3.5 text-left font-extrabold text-sm text-[#404944] hover:text-[#003527] py-2 transition-colors cursor-pointer"
                  >
                    <Map className="w-4.5 h-4.5 text-emerald-700" />
                    <span>Explore Map</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.GUIDE); }}
                    className="flex items-center gap-3.5 text-left font-extrabold text-sm text-[#404944] hover:text-[#003527] py-2 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4.5 h-4.5 text-emerald-700" />
                    <span>Field Guide</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.SANDBOX); }}
                    className="flex items-center gap-3.5 text-left font-extrabold text-sm text-[#404944] hover:text-[#003527] py-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4.5 h-4.5 text-emerald-700" />
                    <span>Ecosystem Sandbox</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-[#bfc9c3]/30 pt-6">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-[#003527]/5 border border-[#003527]/10 p-3 rounded-2xl">
                      <div 
                        onClick={() => { setMobileMenuOpen(false); onNavigate(ActiveScreen.HQ); }}
                        className="text-2xl w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#bfc9c3]/30 cursor-pointer hover:scale-110 hover:shadow-md hover:border-emerald-500/50 active:scale-95 overflow-hidden transition-all duration-300"
                        title="Go to HQ Dashboard"
                      >
                        {currentUser.avatar.startsWith("data:") || currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/") ? (
                          <img 
                            src={currentUser.avatar} 
                            className="w-full h-full object-cover rounded-full" 
                            alt="User Avatar" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          currentUser.avatar.includes(" ") ? currentUser.avatar.split(" ")[0] : currentUser.avatar
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-[#003527] truncate">{currentUser.username}</span>
                        <span className="text-[10px] font-bold text-[#006c49]">{currentUser.rank}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth("login"); }}
                      className="border border-[#bfc9c3] hover:border-[#003527] text-[#003527] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth("register"); }}
                      className="bg-[#003527] hover:bg-[#006c49] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Join
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated shader backdrop */}
        <div className="absolute inset-0 w-full h-full opacity-60">
          <ShaderCanvas />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9f8]/20 via-[#f9f9f8]/10 to-[#f9f9f8]"></div>
        
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6">
            <span className="inline-block bg-[#6cf8bb]/30 text-[#00714d] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
              Pioneering Conservation Tech
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#003527] leading-tight tracking-tight">
              Discover Nature. <br />
              <span className="bg-gradient-to-r from-[#003527] to-[#006c49] bg-clip-text text-transparent">
                Protect Biodiversity.
              </span>
            </h1>
            <p className="text-lg text-[#404944] max-w-lg leading-relaxed">
              Join the world's most advanced citizen science network. Identify species with AI precision and contribute directly to global conservation efforts.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate(ActiveScreen.MAP)}
                className="bg-gradient-to-r from-[#064e3b] to-[#006c49] text-white px-8 py-4 rounded-[24px] font-semibold text-sm flex items-center gap-2 shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">explore</span> Start Exploring
              </button>
              <button
                onClick={onReportSighting}
                className="bg-white/40 border border-[#003527]/20 backdrop-blur-md text-[#003527] px-8 py-4 rounded-[24px] font-semibold text-sm hover:bg-white/60 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span> Identify Specimen
              </button>
            </div>
          </div>

          <ThreeDCard className="w-full" depth={10} scale={1.02}>
            <div className="relative p-4 bg-white/65 backdrop-blur-[20px] rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] group h-full w-full [transform-style:preserve-3d]">
              <img
                alt="BioScout Community"
                className="w-full h-auto rounded-[24px]"
                src={IMAGES.seniorNaturalist}
              />
              <div 
                className="absolute -bottom-6 -left-6 bg-white/65 backdrop-blur-[20px] p-6 rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] max-w-[240px] animate-bounce-subtle z-30"
                style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#6cf8bb] flex items-center justify-center text-[#00714d]">
                    <span className="material-symbols-outlined text-[20px]">eco</span>
                  </div>
                  <span className="font-bold text-[#003527] text-sm">Rare Species Found</span>
                </div>
                <p className="text-xs text-[#404944]">Blue Morpho Butterfly detected in Amazon Basin.</p>
              </div>
            </div>
          </ThreeDCard>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-[#f4f4f3]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-extrabold text-[#003527]">1.2M</div>
              <div className="text-xs font-semibold text-[#404944] uppercase tracking-widest">Species Reported</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-extrabold text-[#003527]">500K</div>
              <div className="text-xs font-semibold text-[#404944] uppercase tracking-widest">Global Contributors</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-extrabold text-[#003527]">15K</div>
              <div className="text-xs font-semibold text-[#404944] uppercase tracking-widest">Protected Areas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Sandbox Simulator Section */}
      <section className="py-24 bg-gradient-to-b from-[#f4f4f3] via-[#fafafa] to-white border-t border-b border-emerald-500/10 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 relative z-10">
          <EcosystemSandbox theme={theme} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-[#003527] mb-4">Precision Identification</h2>
            <p className="text-[#404944] max-w-2xl mx-auto text-base">
              Our seamless workflow connects your field observations with elite scientific databases in real-time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <ThreeDCard className="w-full" depth={14}>
              <div className="bg-white/65 backdrop-blur-[20px] p-10 rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]">
                <div 
                  className="w-16 h-16 rounded-[24px] bg-[#064e3b] text-[#80bea6] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-md"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <h3 className="text-xl font-bold text-[#003527] mb-4" style={{ transform: "translateZ(25px)" }}>Capture</h3>
                <p className="text-sm text-[#404944] leading-relaxed" style={{ transform: "translateZ(15px)" }}>
                  Snap a photo of any organism. Our optical sensors optimize for detail and environmental context.
                </p>
              </div>
            </ThreeDCard>

            {/* Step 2 */}
            <ThreeDCard className="w-full" depth={14}>
              <div className="bg-white/65 backdrop-blur-[20px] p-10 rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]">
                <div 
                  className="w-16 h-16 rounded-[24px] bg-[#6cf8bb] text-[#00714d] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-md"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <h3 className="text-xl font-bold text-[#003527] mb-4" style={{ transform: "translateZ(25px)" }}>Identify</h3>
                <p className="text-sm text-[#404944] leading-relaxed" style={{ transform: "translateZ(15px)" }}>
                  AI-driven neural networks process images to provide a scientific classification with 99% accuracy scores.
                </p>
              </div>
            </ThreeDCard>

            {/* Step 3 */}
            <ThreeDCard className="w-full" depth={14}>
              <div className="bg-white/65 backdrop-blur-[20px] p-10 rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]">
                <div 
                  className="w-16 h-16 rounded-[24px] bg-[#004d45] text-[#30c5b3] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-md"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <span className="material-symbols-outlined text-3xl">public</span>
                </div>
                <h3 className="text-xl font-bold text-[#003527] mb-4" style={{ transform: "translateZ(25px)" }}>Contribute</h3>
                <p className="text-sm text-[#404944] leading-relaxed" style={{ transform: "translateZ(15px)" }}>
                  Your data becomes part of an open-access scientific library used by researchers to protect ecosystems.
                </p>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </section>

      {/* Featured Wildlife Cards */}
      <section className="py-32 bg-[#f4f4f3]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#003527] mb-2">Featured Observations</h2>
            <p className="text-sm text-[#404944]">High-impact species currently being tracked by the BioScout community.</p>
          </div>
          <div className="flex gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollSlider("left")}
              className="w-12 h-12 rounded-full border border-[#bfc9c3] flex items-center justify-center hover:bg-[#003527] hover:text-white transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollSlider("right")}
              className="w-12 h-12 rounded-full border border-[#bfc9c3] flex items-center justify-center hover:bg-[#003527] hover:text-white transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </motion.button>
          </div>
        </div>

        <div 
          ref={sliderRef}
          className="flex gap-8 overflow-x-auto pb-12 px-6 md:px-16 scrollbar-hide select-none max-w-[1280px] mx-auto scroll-smooth"
        >
          {/* Card 1 */}
          <ThreeDCard className="min-w-[320px] md:min-w-[380px]" depth={10} scale={1.03}>
            <div
              onClick={() => {
                if (onSelectSpecies) onSelectSpecies("Blue Morpho");
                else onNavigate(ActiveScreen.GUIDE);
              }}
              className="bg-white/65 backdrop-blur-[20px] rounded-[24px] overflow-hidden shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]"
            >
              <div className="h-64 relative overflow-hidden [transform-style:preserve-3d]">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={IMAGES.blueMorphoButterfly}
                  alt="Blue Morpho"
                />
                <div 
                  className="absolute top-4 right-4 bg-[#003527]/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ transform: "translateZ(25px)" }}
                >
                  Rare
                </div>
              </div>
              <div className="p-6 [transform-style:preserve-3d]">
                <h4 className="text-xl font-bold text-[#003527] mb-1" style={{ transform: "translateZ(20px)" }}>Blue Morpho</h4>
                <p className="text-xs text-[#006c49] font-bold uppercase mb-4 tracking-wider" style={{ transform: "translateZ(15px)" }}>Morpho menelaus</p>
                <div className="flex justify-between items-center text-[#404944] text-sm" style={{ transform: "translateZ(10px)" }}>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">location_on</span> Amazon Basin
                  </span>
                  <span className="flex items-center gap-1 text-[#00714d] bg-[#6cf8bb]/20 px-2 py-0.5 rounded-md font-bold">
                    98% Match
                  </span>
                </div>
              </div>
            </div>
          </ThreeDCard>

          {/* Card 2 */}
          <ThreeDCard className="min-w-[320px] md:min-w-[380px]" depth={10} scale={1.03}>
            <div 
              onClick={() => {
                if (onSelectSpecies) onSelectSpecies("Snow Leopard");
                else onNavigate(ActiveScreen.GUIDE);
              }}
              className="bg-white/65 backdrop-blur-[20px] rounded-[24px] overflow-hidden shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]"
            >
              <div className="h-64 relative overflow-hidden [transform-style:preserve-3d]">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={IMAGES.snowLeopard}
                  alt="Snow Leopard"
                />
                <div 
                  className="absolute top-4 right-4 bg-red-600/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ transform: "translateZ(25px)" }}
                >
                  Endangered
                </div>
              </div>
              <div className="p-6 [transform-style:preserve-3d]">
                <h4 className="text-xl font-bold text-[#003527] mb-1" style={{ transform: "translateZ(20px)" }}>Snow Leopard</h4>
                <p className="text-xs text-[#006c49] font-bold uppercase mb-4 tracking-wider" style={{ transform: "translateZ(15px)" }}>Panthera uncia</p>
                <div className="flex justify-between items-center text-[#404944] text-sm" style={{ transform: "translateZ(10px)" }}>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">location_on</span> Himalayas
                  </span>
                  <span className="flex items-center gap-1 text-[#00714d] bg-[#6cf8bb]/20 px-2 py-0.5 rounded-md font-bold">
                    94% Match
                  </span>
                </div>
              </div>
            </div>
          </ThreeDCard>

          {/* Card 3 */}
          <ThreeDCard className="min-w-[320px] md:min-w-[380px]" depth={10} scale={1.03}>
            <div 
              onClick={() => {
                if (onSelectSpecies) onSelectSpecies("Giant Tree Fern");
                else onNavigate(ActiveScreen.GUIDE);
              }}
              className="bg-white/65 backdrop-blur-[20px] rounded-[24px] overflow-hidden shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] border border-emerald-500/5 group cursor-pointer h-full [transform-style:preserve-3d]"
            >
              <div className="h-64 relative overflow-hidden [transform-style:preserve-3d]">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={IMAGES.giantTreeFern}
                  alt="Giant Tree Fern"
                />
                <div 
                  className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ transform: "translateZ(25px)" }}
                >
                  Endemic
                </div>
              </div>
              <div className="p-6 [transform-style:preserve-3d]">
                <h4 className="text-xl font-bold text-[#003527] mb-1" style={{ transform: "translateZ(20px)" }}>Giant Tree Fern</h4>
                <p className="text-xs text-[#006c49] font-bold uppercase mb-4 tracking-wider" style={{ transform: "translateZ(15px)" }}>Cyathea cooperi</p>
                <div className="flex justify-between items-center text-[#404944] text-sm" style={{ transform: "translateZ(10px)" }}>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">location_on</span> Queensland
                  </span>
                  <span className="flex items-center gap-1 text-[#00714d] bg-[#6cf8bb]/20 px-2 py-0.5 rounded-md font-bold">
                    100% Match
                  </span>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </div>
      </section>

      {/* Impact Data Visualization */}
      <section className="py-32 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#003527]">Quantifying Conservation Impact</h2>
              <p className="text-base text-[#404944] leading-relaxed">
                Through collective data intelligence, BioScout has influenced the protection of over 50,000 square kilometers of biodiversity hotspots.
              </p>
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#f4f4f3] border-l-4 border-[#003527]">
                  <div className="text-lg font-bold text-[#003527] mb-1">42% Increase</div>
                  <p className="text-sm text-[#404944]">In identified corridors for migratory species over the last 18 months.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#f4f4f3] border-l-4 border-[#006c49]">
                  <div className="text-lg font-bold text-[#003527] mb-1">12 New Species</div>
                  <p className="text-sm text-[#404944]">Validated by the scientific community via community uploads.</p>
                </div>
              </div>
            </div>

            <ThreeDCard className="w-full h-full" depth={10} scale={1.02}>
              <div className="bg-white/65 backdrop-blur-[20px] rounded-[24px] shadow-[0_4px_32px_0_rgba(6,78,59,0.08)] p-8 relative overflow-hidden aspect-square flex items-center justify-center w-full h-full border border-emerald-500/5 [transform-style:preserve-3d]">
                <div className="absolute inset-0 bg-[#003527]/5 pointer-events-none"></div>
                {/* Mock Data Viz */}
                <div className="relative w-full h-full flex flex-col justify-between [transform-style:preserve-3d]">
                  <div className="flex justify-between items-center mb-8" style={{ transform: "translateZ(20px)" }}>
                    <span className="font-semibold text-sm text-[#003527]">Active Conservation Zones</span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#003527] animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-[#006c49]"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-3 h-48 w-full px-2" style={{ transform: "translateZ(30px)" }}>
                    <div className="w-full bg-[#003527]/10 rounded-t-lg h-[40%] hover:bg-[#003527]/30 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        JAN: 40%
                      </div>
                    </div>
                    <div className="w-full bg-[#003527]/20 rounded-t-lg h-[60%] hover:bg-[#003527]/40 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        FEB: 60%
                      </div>
                    </div>
                    <div className="w-full bg-[#003527]/30 rounded-t-lg h-[45%] hover:bg-[#003527]/50 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        MAR: 45%
                      </div>
                    </div>
                    <div className="w-full bg-[#003527]/40 rounded-t-lg h-[85%] hover:bg-[#003527]/60 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        APR: 85%
                      </div>
                    </div>
                    <div className="w-full bg-[#003527]/50 rounded-t-lg h-[70%] hover:bg-[#003527]/70 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        MAY: 70%
                      </div>
                    </div>
                    <div className="w-full bg-[#003527]/70 rounded-t-lg h-[95%] hover:bg-[#003527]/80 transition-all cursor-pointer relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#003527] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        JUN: 95%
                      </div>
                    </div>
                  </div>
  
                  <div className="mt-8 grid grid-cols-2 gap-4" style={{ transform: "translateZ(20px)" }}>
                    <div className="p-3 bg-white/50 rounded-lg">
                      <span className="block text-[10px] font-bold text-[#404944] uppercase tracking-wider">Ecosystem Health</span>
                      <span className="text-xl font-bold text-[#003527]">8.4 / 10</span>
                    </div>
                    <div className="p-3 bg-white/50 rounded-lg">
                      <span className="block text-[10px] font-bold text-[#404944] uppercase tracking-wider">Data Density</span>
                      <span className="text-xl font-bold text-[#003527]">+12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#003527] text-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <span className="material-symbols-outlined text-6xl text-[#6ffbbe] opacity-50 block leading-none">
              format_quote
            </span>
            <blockquote className="text-2xl md:text-3xl italic font-serif leading-snug">
              "BioScout has bridged the gap between pure scientific research and public engagement. It’s not just an app; it’s a global sensory system for the planet."
            </blockquote>
            <div className="flex items-center justify-center gap-4 pt-4">
              <img
                className="w-16 h-16 rounded-full border-2 border-[#6ffbbe] object-cover"
                src={IMAGES.elenaVos}
                alt="Dr. Elena Vos"
              />
              <div className="text-left">
                <div className="text-lg font-bold">Dr. Elena Vos</div>
                <div className="text-xs text-[#6ffbbe] uppercase tracking-wider font-semibold">
                  Conservation Biologist, UN Environment
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-[#eeeeed]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 relative z-10">
          <div className="bg-white/60 backdrop-blur-xl p-12 md:p-24 rounded-[40px] text-center shadow-[0_4px_32px_0_rgba(6,78,59,0.08)]">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#003527] mb-6">Ready to lead the change?</h2>
            <p className="text-base text-[#404944] max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of citizen scientists today. Your next discovery could be the key to saving an entire ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate(ActiveScreen.MAP)}
                className="bg-gradient-to-r from-[#064e3b] to-[#006c49] text-white px-10 py-5 rounded-[24px] font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                Start Mapping Sighting
              </button>
              <button
                onClick={() => onNavigate(ActiveScreen.HQ)}
                className="bg-white border-2 border-[#003527]/10 text-[#003527] px-10 py-5 rounded-[24px] font-bold text-base hover:bg-[#f4f4f3] active:scale-95 transition-all w-full sm:w-auto"
              >
                Go to Scout Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#bfc9c3]/30 w-full">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold text-[#003527] tracking-tight">BioScout</div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-sm text-[#404944] hover:text-[#003527] transition-colors underline" href="#">
              Privacy Policy
            </a>
            <a className="text-sm text-[#404944] hover:text-[#003527] transition-colors underline" href="#">
              Terms of Service
            </a>
            <a className="text-sm text-[#404944] hover:text-[#003527] transition-colors underline" href="#">
              Scientific Method
            </a>
            <a className="text-sm text-[#404944] hover:text-[#003527] transition-colors underline" href="#">
              Contact Us
            </a>
          </div>
          <div className="text-sm text-[#404944]">
            © {new Date().getFullYear()} BioScout Conservation. Precision in Nature.
          </div>
        </div>
      </footer>
    </div>
  );
}
