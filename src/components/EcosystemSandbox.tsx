import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, Thermometer, Wind, Eye, Droplets, Mountain, Sprout, Sparkles, Activity, Heart, ShieldAlert, CheckCircle2 } from "lucide-react";
import ThreeDCard from "./ThreeDCard";

interface BiomeSpecies {
  name: string;
  scientificName: string;
  icon: string;
  desc: string;
  optHumidity: [number, number]; // min, max
  optAltitude: [number, number];
  optCanopy: [number, number];
  rarity: "Endangered" | "Rare" | "Endemic" | "Common";
  color: string;
}

const BIOME_SPECIES: BiomeSpecies[] = [
  {
    name: "Snow Leopard",
    scientificName: "Panthera uncia",
    icon: "🐆",
    desc: "Thrives in icy rocky cliffs and extreme cold altitudes with open visibility.",
    optHumidity: [5, 35],
    optAltitude: [65, 100],
    optCanopy: [0, 20],
    rarity: "Endangered",
    color: "from-slate-400 to-indigo-500"
  },
  {
    name: "Blue Morpho",
    scientificName: "Morpho menelaus",
    icon: "🦋",
    desc: "Flourishes under warm, extremely humid, dense tree canopy covers.",
    optHumidity: [70, 100],
    optAltitude: [0, 40],
    optCanopy: [60, 100],
    rarity: "Rare",
    color: "from-cyan-400 to-blue-600"
  },
  {
    name: "Giant Tree Fern",
    scientificName: "Cyathea cooperi",
    icon: "🌿",
    desc: "Prefers cool, damp middle-elevation slopes with moderate forest canopy shading.",
    optHumidity: [55, 90],
    optAltitude: [35, 75],
    optCanopy: [45, 80],
    rarity: "Endemic",
    color: "from-emerald-400 to-teal-600"
  },
  {
    name: "Desert Horned Lizard",
    scientificName: "Phrynosoma platyrhinos",
    icon: "🦎",
    desc: "Adapted to ultra-dry, arid flatlands with scorching open sun exposure.",
    optHumidity: [0, 25],
    optAltitude: [0, 45],
    optCanopy: [0, 15],
    rarity: "Common",
    color: "from-amber-500 to-red-600"
  },
  {
    name: "Bengal Tiger",
    scientificName: "Panthera tigris",
    icon: "🐅",
    desc: "Dominates semi-humid dense subtropical valley basin lowlands.",
    optHumidity: [45, 80],
    optAltitude: [0, 45],
    optCanopy: [40, 85],
    rarity: "Endangered",
    color: "from-orange-400 to-amber-700"
  }
];

interface EcosystemSandboxProps {
  theme: "light" | "night";
}

export default function EcosystemSandbox({ theme }: EcosystemSandboxProps) {
  const [humidity, setHumidity] = useState<number>(75);
  const [altitude, setAltitude] = useState<number>(20);
  const [canopy, setCanopy] = useState<number>(80);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activeSpeciesDetail, setActiveSpeciesDetail] = useState<BiomeSpecies | null>(null);

  // Trigger Biosphere Scan effect
  const handleInitiateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 600);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Calculate compatibility for each species
  const getCompatibility = (s: BiomeSpecies) => {
    const calcMatch = (val: number, range: [number, number]) => {
      const [min, max] = range;
      if (val >= min && val <= max) return 100;
      // Linear penalty outside range
      const dist = val < min ? min - val : val - max;
      return Math.max(0, Math.round(100 - dist * 2.5));
    };

    const hMatch = calcMatch(humidity, s.optHumidity);
    const aMatch = calcMatch(altitude, s.optAltitude);
    const cMatch = calcMatch(canopy, s.optCanopy);

    return Math.round((hMatch * 0.4 + aMatch * 0.3 + cMatch * 0.3));
  };

  const speciesMatches = BIOME_SPECIES.map((s) => ({
    ...s,
    score: getCompatibility(s),
  })).sort((a, b) => b.score - a.score);

  const bestMatch = speciesMatches[0];

  // Calculate environmental classifications
  const getEcosystemType = () => {
    if (humidity < 30 && canopy < 30) {
      return {
        title: "Arid Desert Wasteland",
        desc: "High evaporation rates, sparse cover, and intense solar exposure.",
        textColor: "text-amber-600",
        bgLight: "bg-amber-50 border-amber-200",
        bgDark: "bg-amber-950/20 border-amber-900/30",
        hudTheme: "from-amber-500 to-yellow-600"
      };
    }
    if (altitude > 70) {
      return {
        title: "Alpine Tundra Summit",
        desc: "Low temperatures, harsh rocky winds, and minimal foliage density.",
        textColor: "text-sky-500",
        bgLight: "bg-sky-50 border-sky-200",
        bgDark: "bg-sky-950/20 border-sky-900/30",
        hudTheme: "from-sky-400 to-indigo-500"
      };
    }
    if (humidity > 65 && canopy > 60) {
      return {
        title: "Primal Canopy Rainforest",
        desc: "Hyper-saturated atmospheric water levels with massive canopy shields.",
        textColor: "text-emerald-500",
        bgLight: "bg-emerald-50 border-emerald-200",
        bgDark: "bg-emerald-950/20 border-emerald-900/30",
        hudTheme: "from-emerald-400 to-teal-500"
      };
    }
    return {
      title: "Balanced Meadow Woodland",
      desc: "Moderate seasonal dampness with high flora and fauna diversification.",
      textColor: "text-emerald-700",
      bgLight: "bg-[#003527]/5 border-[#003527]/10",
      bgDark: "bg-emerald-950/10 border-emerald-900/20",
      hudTheme: "from-emerald-500 to-cyan-600"
    };
  };

  const ecoInfo = getEcosystemType();

  // Dynamic biome ambient background gradient depending on variables
  const getAmbientGradient = () => {
    // Red/amber (dry), Emerald/teal (wet), Sky/violet (high altitude)
    const red = Math.round((100 - humidity) * 1.5 + (100 - canopy) * 0.8);
    const green = Math.round(humidity * 1.8 + canopy * 0.7);
    const blue = Math.round(altitude * 2.2);

    return `rgba(${Math.min(255, red + 10)}, ${Math.min(255, green + 15)}, ${Math.min(255, blue + 30)}, 0.08)`;
  };

  // Dynamic educational alert logs
  const getEnvironmentalLogs = () => {
    const logs = [];
    if (humidity < 30) {
      logs.push({
        type: "warning",
        title: "Critical Aridity Detected",
        message: "Severe dry spell in progress. Desert species like the Desert Horned Lizard are at 100% biological comfort, while rainforest insects like the Blue Morpho are experiencing fatal dehydration risks.",
        icon: "⚠️"
      });
    } else if (humidity > 80) {
      logs.push({
        type: "success",
        title: "Hyper-Humid Precipitation",
        message: "Rainforest humidity triggers peak activity. Blue Morpho butterflies are exhibiting active flight. However, high moisture may accelerate fungal pathogens on sensitive high-altitude flora.",
        icon: "🌧️"
      });
    }

    if (altitude > 75) {
      logs.push({
        type: "info",
        title: "Hypoxia-Level Alpine Elevation",
        message: "Oxygen density is reduced by 30%. High altitude specialist Panthera uncia (Snow Leopard) is in peak hunting posture. Lowland mammals find respiration difficult at this altitude.",
        icon: "🏔️"
      });
    } else if (altitude < 15) {
      logs.push({
        type: "info",
        title: "Lowland River Basin",
        message: "Heavy soil deposition and peak atmospheric density. Supports high-density vegetation, but prone to localized flooding if humidity levels cross 85%.",
        icon: "🌊"
      });
    }

    if (canopy > 80) {
      logs.push({
        type: "success",
        title: "Deep Jungle Canopy Occlusion",
        message: "Understory receives less than 5% direct solar radiation. Excellent damp-nesting grounds for Giant Tree Ferns and cryptic hunting for the Bengal Tiger. Solar energy generation is minimized.",
        icon: "🌳"
      });
    } else if (canopy < 20) {
      logs.push({
        type: "warning",
        title: "Extreme Canopy Deficit",
        message: "Ground level is subjected to full UV-radiation exposure. High soil evaporation rates detected. Desert Horned Lizards utilize this for thermoregulation, while forest floor mosses dry out.",
        icon: "☀️"
      });
    }

    if (logs.length === 0) {
      logs.push({
        type: "info",
        title: "Stably Balanced Climate Corridor",
        message: "Average atmospheric readings. Broad-leaved woodlands and generalist species can establish stable nesting patterns. Diversity indices are within standard parameters.",
        icon: "⚖️"
      });
    }

    return logs;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <span className="inline-block bg-[#6cf8bb]/30 text-[#00714d] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
          Interactive Lab
        </span>
        <h2 className={`text-3xl font-extrabold tracking-tight ${theme === "night" ? "text-emerald-400" : "text-[#003527]"}`}>
          Ecosystem Sandbox Simulator
        </h2>
        <p className={`max-w-2xl mx-auto text-sm mt-2 ${theme === "night" ? "text-emerald-500/70" : "text-[#404944]"}`}>
          Manipulate atmospheric conditions in real-time. Witness the algorithmic shifts in biodiversity viability within our hyper-realistic holographic chamber.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT HUD PANEL: Biome Control Sliders */}
        <div className={`lg:col-span-4 p-6 sm:p-8 rounded-[32px] border flex flex-col justify-between transition-all ${
          theme === "night" 
            ? "bg-[#001f15]/80 border-emerald-900/40 text-[#6ffbbe] shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
            : "bg-white border-[#bfc9c3]/30 text-[#003527] shadow-[0_4px_32px_rgba(6,78,59,0.04)]"
        }`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 border-emerald-500/10">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Atmospheric Controls</span>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  Atmospheric Humidity
                </span>
                <span className="font-mono text-cyan-500">{humidity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Arid (Desert)</span>
                <span>Saturated (Rainforest)</span>
              </div>
            </div>

            {/* Altitude Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Mountain className="w-4 h-4 text-sky-500" />
                  Summit Elevation
                </span>
                <span className="font-mono text-sky-500">{altitude * 8}m ({altitude}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={altitude}
                onChange={(e) => setAltitude(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Sea Level</span>
                <span>Alpine Crest</span>
              </div>
            </div>

            {/* Canopy Shade Cover Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-500" />
                  Canopy Density
                </span>
                <span className="font-mono text-emerald-500">{canopy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={canopy}
                onChange={(e) => setCanopy(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Open Grassland</span>
                <span>Intense Jungle</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-500/10 space-y-4">
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-colors ${
              theme === "night" ? ecoInfo.bgDark : ecoInfo.bgLight
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`}></span>
                <span className={ecoInfo.textColor}>{ecoInfo.title}</span>
              </div>
              <p className="opacity-80 text-[11px]">{ecoInfo.desc}</p>
            </div>

            <button
              onClick={handleInitiateScan}
              disabled={isScanning}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isScanning
                  ? "bg-emerald-950/20 text-emerald-500 border border-emerald-500/20 cursor-wait"
                  : "bg-gradient-to-r from-[#064e3b] to-[#006c49] text-white shadow-lg hover:shadow-emerald-500/10 hover:brightness-110 active:scale-98"
              }`}
            >
              <Activity className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? `Stabilizing Biome (${scanProgress}%)` : "Trigger Quantum Bioscan"}</span>
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN: THE 3D HOLOGRAPHIC BIOSPHERE CHAMBER */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[440px] p-6 rounded-[32px] overflow-hidden border bg-gradient-to-b from-[#01140e] to-[#000806] border-emerald-950 shadow-2xl">
          {/* Animated 3D Grid Backdrop */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-500"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundColor: getAmbientGradient()
            }}
          />

          {/* Hologram top & bottom projector rings */}
          <div className="absolute top-6 w-56 h-8 rounded-full border border-emerald-500/20 bg-emerald-500/5 blur-[1px] flex items-center justify-center [transform:rotateX(60deg)]">
            <div className="w-40 h-4 rounded-full border border-emerald-400/40 animate-ping" />
          </div>
          
          <div className="absolute bottom-6 w-64 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 blur-[1px] flex items-center justify-center [transform:rotateX(60deg)]">
            <div className="w-48 h-6 rounded-full border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />
          </div>

          {/* Main 3D Chamber stage */}
          <div className="w-full flex-1 flex flex-col items-center justify-center z-10 relative py-8">
            <AnimatePresence mode="wait">
              {isScanning ? (
                // Scanning Laser Effect
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] absolute top-0 left-0 right-0 animate-scanner z-30" />
                  <motion.div 
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-center space-y-2"
                  >
                    <span className="text-3xl animate-pulse">🧬</span>
                    <h4 className="text-emerald-400 font-mono text-sm font-bold tracking-widest animate-pulse">RECONSTRUCTING BIOME...</h4>
                  </motion.div>
                </motion.div>
              ) : (
                // Floating Holographic Specimen Display
                <motion.div 
                  key={bestMatch.name}
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {/* Floating 3D holographic species ring */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Glowing holographic sphere backings */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent animate-spin-slow blur-md" />
                    <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-emerald-500/20 animate-spin-slow" />
                    <div className="absolute w-32 h-32 rounded-full border border-emerald-400/40 [transform:rotateX(60deg)_rotateY(15deg)] animate-pulse" />

                    {/* Main floating 3D Specimen asset */}
                    <div className="text-7xl absolute z-10 select-none animate-float filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.4)]">
                      {bestMatch.icon}
                    </div>

                    {/* Laser core emitter dots */}
                    <div className="absolute bottom-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{bestMatch.rarity} Species Match</span>
                    </div>
                    <h3 className="text-white text-2xl font-black tracking-tight pt-1">{bestMatch.name}</h3>
                    <p className="text-emerald-500/80 font-mono text-xs italic">{bestMatch.scientificName}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chamber HUD Panel Indicators */}
          <div className="w-full grid grid-cols-3 gap-2 z-10 pt-4 border-t border-emerald-950/60">
            <div className="bg-emerald-950/20 border border-emerald-950 p-2.5 rounded-xl text-center">
              <span className="block text-[9px] text-emerald-500/60 font-bold uppercase tracking-wider">Viability Score</span>
              <span className="text-sm font-black text-emerald-400">{isScanning ? "---" : `${bestMatch.score}%`}</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-950 p-2.5 rounded-xl text-center">
              <span className="block text-[9px] text-emerald-500/60 font-bold uppercase tracking-wider">Biodiversity Index</span>
              <span className="text-sm font-black text-emerald-400">
                {isScanning ? "---" : `${Math.round(bestMatch.score * 0.85 + 15)} / 100`}
              </span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-950 p-2.5 rounded-xl text-center">
              <span className="block text-[9px] text-emerald-500/60 font-bold uppercase tracking-wider">Ecosystem Status</span>
              <span className="text-[10px] font-black text-emerald-400 truncate flex items-center justify-center gap-1">
                {isScanning ? (
                  "STABILIZING..."
                ) : bestMatch.score > 70 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Optimal
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-amber-500 inline" /> Volatile
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED MATCH SPECIES RANK LIST */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${
              theme === "night" 
                ? "bg-[#001f15]/80 border-emerald-900/40 text-[#6ffbbe]" 
                : "bg-white border-[#bfc9c3]/30 text-[#003527]"
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-emerald-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Real-Time Viability Rank
              </h4>
              <p className="text-[11px] opacity-75 mb-3 leading-relaxed">
                As physical attributes warp, watch how biological systems adjust in suitability rating:
              </p>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {speciesMatches.map((s, idx) => (
                  <div
                    key={s.name}
                    onClick={() => setActiveSpeciesDetail(s)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                      bestMatch.name === s.name
                        ? theme === "night"
                          ? "bg-emerald-950/50 border-emerald-500/40 shadow-sm shadow-emerald-500/5 scale-[1.01]"
                          : "bg-emerald-50 border-emerald-200 shadow-sm scale-[1.01]"
                        : theme === "night"
                          ? "bg-[#00281b]/25 border-transparent hover:border-emerald-900/40 text-emerald-500/60"
                          : "bg-slate-50 border-transparent hover:border-[#bfc9c3]/20 text-[#404944]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{s.icon}</span>
                      <div className="min-w-0">
                        <span className="font-extrabold block truncate text-[11px]">{s.name}</span>
                        <span className="text-[9px] opacity-60 block font-mono truncate">{s.scientificName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-12 bg-emerald-500/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[10px] min-w-[28px] text-right">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Species Detail HUD card */}
            <ThreeDCard
              className="w-full"
              depth={8}
              scale={1.02}
            >
              <div className={`p-4 rounded-2xl border transition-all ${
                theme === "night" 
                  ? "bg-[#001f15]/80 border-emerald-900/40 text-[#6ffbbe]" 
                  : "bg-white border-[#bfc9c3]/30 text-[#003527] shadow-sm"
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-emerald-500/10 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Specimen Insight</span>
                  <span className="text-base">🔬</span>
                </div>
                {(() => {
                  const s = activeSpeciesDetail || bestMatch;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                          <span className="font-extrabold block text-xs">{s.name}</span>
                          <span className="text-[10px] font-mono italic opacity-65 block leading-none">{s.scientificName}</span>
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-85">{s.desc}</p>
                      
                      <div className="grid grid-cols-3 gap-1 text-[9px] pt-1 border-t border-emerald-500/5">
                        <div className="text-center p-1 bg-black/5 rounded">
                          <span className="block opacity-60 font-medium">Humidity</span>
                          <span className="font-bold">{s.optHumidity[0]}-{s.optHumidity[1]}%</span>
                        </div>
                        <div className="text-center p-1 bg-black/5 rounded">
                          <span className="block opacity-60 font-medium">Altitude</span>
                          <span className="font-bold">{s.optAltitude[0]}-{s.optAltitude[1]}%</span>
                        </div>
                        <div className="text-center p-1 bg-black/5 rounded">
                          <span className="block opacity-60 font-medium">Canopy</span>
                          <span className="font-bold">{s.optCanopy[0]}-{s.optCanopy[1]}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ThreeDCard>
          </div>
        </div>

      </div>

      {/* Dynamic Environmental Bio-Telemetry & AI Advisory Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`mt-10 p-6 md:p-8 rounded-[32px] border transition-all ${
          theme === "night" 
            ? "bg-[#001f15]/85 border-emerald-900/40 text-[#6ffbbe] shadow-2xl shadow-black/60" 
            : "bg-white border-[#bfc9c3]/30 text-[#003527] shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 border-emerald-500/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">
              📡
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">AI Biosphere Advisor & Telemetry Logs</h3>
              <p className="text-[10px] opacity-60">Real-time educational diagnostics based on atmospheric parameters</p>
            </div>
          </div>
          <span className="font-mono text-[9px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold animate-pulse">
            Chamber Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getEnvironmentalLogs().map((log, i) => (
            <div 
              key={i}
              className={`p-4 rounded-2xl border flex gap-3 items-start transition-all duration-300 ${
                log.type === "warning"
                  ? theme === "night"
                    ? "bg-amber-950/20 border-amber-500/20 text-amber-300 animate-pulse-subtle"
                    : "bg-amber-50 border-amber-100 text-amber-800"
                  : log.type === "success"
                  ? theme === "night"
                    ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                    : "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : theme === "night"
                  ? "bg-sky-950/20 border-sky-500/20 text-sky-300"
                  : "bg-sky-50 border-sky-100 text-sky-800"
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">{log.icon}</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black tracking-tight">{log.title}</h4>
                <p className="text-[10px] leading-relaxed opacity-85">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
