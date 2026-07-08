import React from "react";
import { ActiveScreen, UserProfile, Sighting, SpeciesData } from "../types";
import { IMAGES } from "../assets";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  ArrowLeft, 
  Award, 
  Flame, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  User, 
  ChevronRight, 
  Plus, 
  Activity, 
  Target, 
  Dna, 
  Leaf, 
  ShieldCheck,
  TrendingUp,
  MapPin,
  Camera,
  Palette,
  RefreshCw,
  Lock,
  LockOpen,
  HelpCircle,
  Check,
  Download,
  Thermometer,
  Droplets,
  Sun,
  Mic,
  Wind,
  Radio,
  AlertTriangle,
  Bell,
  X
} from "lucide-react";

interface HqDashboardProps {
  onNavigate: (screen: ActiveScreen) => void;
  onReportSighting: () => void;
  streakCount: number;
  totalPoints: number;
  currentUser: UserProfile | null;
  onOpenAuth: (tab: "login" | "register") => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  sightings?: Sighting[];
  customGuides?: SpeciesData[];
  theme?: "light" | "night";
}

export default function HqDashboard({ 
  onNavigate, 
  onReportSighting, 
  streakCount, 
  totalPoints,
  currentUser,
  onOpenAuth,
  onUpdateUser,
  sightings = [],
  customGuides = [],
  theme = "light"
}: HqDashboardProps) {
  // Avatar selector state
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = React.useState(false);
  const [activeAvatarTab, setActiveAvatarTab] = React.useState<"presets" | "ai" | "upload">("presets");
  const [selectedPreset, setSelectedPreset] = React.useState("🦊");
  const [aiPrompt, setAiPrompt] = React.useState("Bio-Luminescent Forest Shaman ✨🌳");
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);
  const [aiProgress, setAiProgress] = React.useState(0);
  const [aiStatusText, setAiStatusText] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);

  const [isScanning, setIsScanning] = React.useState(false);
  const [lastScanTime, setLastScanTime] = React.useState<string>("04:51:50 AM");
  const [sensors, setSensors] = React.useState({
    canopyTemp: 24.8,
    soilMoisture: 68,
    uvIndex: 3.4,
    bioluminescence: 14,
    acousticBioActivity: 74,
    carbonAbsorption: 1.84,
  });

  const handleScanSensors = () => {
    setIsScanning(true);
    setTimeout(() => {
      setSensors({
        canopyTemp: parseFloat((20 + Math.random() * 8).toFixed(1)),
        soilMoisture: Math.floor(45 + Math.random() * 45),
        uvIndex: parseFloat((1 + Math.random() * 6).toFixed(1)),
        bioluminescence: Math.floor(5 + Math.random() * 45),
        acousticBioActivity: Math.floor(40 + Math.random() * 55),
        carbonAbsorption: parseFloat((0.8 + Math.random() * 2).toFixed(2)),
      });
      const now = new Date();
      setLastScanTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsScanning(false);
    }, 1800);
  };

  const compressAndSetAvatar = (file: File) => {
    if (!currentUser || !onUpdateUser) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 120; // 120x120 is perfect for an avatar
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.84);
          const updatedUser: UserProfile = {
            ...currentUser,
            avatar: compressedDataUrl
          };
          onUpdateUser(updatedUser);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetAvatar(file);
    }
  };

  const handleDragProfilePic = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDropProfilePic = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      compressAndSetAvatar(file);
    }
  };

  const handleExportCSV = () => {
    const sightingsToExport = sightings || [];
    const guidesToExport = customGuides || [];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Name,Scientific Name,Location,Coordinates,Timestamp,Confidence,Reporter,Verified,Notes\n";

    sightingsToExport.forEach((s) => {
      const isNote = s.scientificName === "Environmental Landmark";
      const type = isNote ? "Landmark Note" : "Fauna/Flora Sighting";
      const esc = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      
      const row = [
        type,
        s.speciesName,
        s.scientificName,
        s.location,
        `${s.lat || ""}/${s.lng || ""}`,
        s.timestamp,
        `${s.confidence}%`,
        s.reporter,
        s.verified ? "Yes" : "No",
        s.notes || ""
      ].map(esc).join(",");
      
      csvContent += row + "\n";
    });

    guidesToExport.forEach((g) => {
      const esc = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      const row = [
        "Personal Library Species",
        g.speciesName,
        g.scientificName,
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "You (Self)",
        "Yes",
        g.description || ""
      ].map(esc).join(",");
      
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bioscout-expedition-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presetNatureAvatars = [
    { char: "🦊", label: "Cunning Fox" },
    { char: "🦉", label: "Midnight Owl" },
    { char: "🐻", label: "Saber Bear" },
    { char: "🐼", label: "Zen Panda" },
    { char: "🐸", label: "Rainforest Frog" },
    { char: "🦁", label: "Apex Panther" },
    { char: "🦅", label: "Wind Eagle" },
    { char: "🦌", label: "Forest Stag" },
    { char: "🐝", label: "Royal Honeybee" },
    { char: "🦋", label: "Morpho Nymph" },
    { char: "🦖", label: "Canopy Iguana" },
    { char: "🦦", label: "River Otter" }
  ];

  const aiPrompts = [
    { text: "Bio-Luminescent Forest Shaman ✨🌳", emoji: "🧙‍♂️" },
    { text: "Cyberpunk Moss Jaguar 🐆⚡", emoji: "🐆" },
    { text: "Celestial Solar Phoenix 🐦🌌", emoji: "🐉" },
    { text: "Prehistoric Sequoia Golem 🪨🌿", emoji: "🦄" }
  ];

  // AI generator simulation
  const handleGenerateAiAvatar = () => {
    if (!currentUser || !onUpdateUser) return;
    setIsAiGenerating(true);
    setAiProgress(10);
    setAiStatusText("Initializing quantum bio-token generator...");

    const intervals = [
      { t: 600, p: 35, text: "Synthesizing forest canopy color spectrum..." },
      { t: 1200, p: 65, text: "Injecting organic neural-network details..." },
      { t: 1800, p: 90, text: "Stabilizing sentinel guardian companion matrix..." },
      { t: 2400, p: 100, text: "Companionship finalized!" }
    ];

    intervals.forEach(({ t, p, text }) => {
      setTimeout(() => {
        setAiProgress(p);
        setAiStatusText(text);

        if (p === 100) {
          setTimeout(() => {
            setIsAiGenerating(false);
            // Select the target emoji based on current selection
            const matchingPrompt = aiPrompts.find(p => p.text === aiPrompt);
            const generatedEmoji = matchingPrompt ? matchingPrompt.emoji : "🐉";
            
            const updatedUser: UserProfile = {
              ...currentUser,
              avatar: generatedEmoji,
              username: currentUser.username.endsWith(" (AI)") ? currentUser.username : `${currentUser.username} (AI)`
            };
            onUpdateUser(updatedUser);
            setIsAvatarSelectorOpen(false);
          }, 600);
        }
      }, t);
    });
  };

  const handleSelectPreset = (emoji: string) => {
    if (!currentUser || !onUpdateUser) return;
    setSelectedPreset(emoji);
    const updatedUser: UserProfile = {
      ...currentUser,
      avatar: emoji
    };
    onUpdateUser(updatedUser);
  };

  // Let's generate cells for our emerald GitHub-style contribution map (representing 15 weeks of contributions)
  const contributionGrid = Array.from({ length: 7 * 15 }, (_, i) => {
    // Semi-randomized emerald shades to represent contributions
    const value = (i * 3 + 17) % 5;
    if (value === 0) return { bg: "bg-[#e2e8f0]/60", label: "0 detections", intensity: 0 }; // None
    if (value === 1) return { bg: "bg-emerald-100/80", label: "1-2 detections", intensity: 1 }; // Low
    if (value === 2) return { bg: "bg-emerald-300/80", label: "3-5 detections", intensity: 2 }; // Medium
    if (value === 3) return { bg: "bg-emerald-500/80", label: "6-8 detections", intensity: 3 }; // High
    return { bg: "bg-emerald-700/90 animate-pulse-subtle", label: "9+ detections", intensity: 4 }; // Extreme
  });

  const challenges = [
    {
      id: "ch-1",
      title: "Lepidoptera Hunt",
      description: "Spot 3 different butterfly species in high humidity zones.",
      progress: 2,
      max: 3,
      reward: "+100 PTS",
      icon: Dna,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      active: true
    },
    {
      id: "ch-2",
      title: "Canopy Guardian",
      description: "Map 5 unique observations in understory canopy gaps.",
      progress: 4,
      max: 5,
      reward: "+150 PTS",
      icon: Compass,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      active: true
    },
    {
      id: "ch-3",
      title: "Flora Pioneer",
      description: "Identify and verify 2 endangered tree ferns.",
      progress: 1,
      max: 2,
      reward: "+80 PTS",
      icon: Leaf,
      color: "text-teal-600 bg-teal-50 border-teal-100",
      active: true
    },
    {
      id: "ch-4",
      title: "Nocturnal Sentinel",
      description: "Identify a species during night monitoring hours (8 PM - 4 AM).",
      progress: 0,
      max: 1,
      reward: "+200 PTS",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      active: false
    }
  ];

  const trackedAchievements = [
    {
      id: "ach-pioneer",
      name: "Pioneer Scout",
      desc: "Log your first sighting in BioScout.",
      requirementText: "1 Sighting",
      unlocked: sightings.length >= 1,
      icon: "🧭",
      color: "from-blue-500 to-cyan-500",
      progress: Math.min(sightings.length, 1),
      max: 1
    },
    {
      id: "ach-veteran",
      name: "Veteran Spotter",
      desc: "Log 5 ecological observations in BioScout.",
      requirementText: "5 Sightings",
      unlocked: sightings.length >= 5,
      icon: "🐆",
      color: "from-emerald-500 to-teal-500",
      progress: Math.min(sightings.length, 5),
      max: 5
    },
    {
      id: "ach-legendary",
      name: "Legendary Tracker",
      desc: "Log 10 ecological observations in BioScout.",
      requirementText: "10 Sightings",
      unlocked: sightings.length >= 10,
      icon: "👑",
      color: "from-amber-500 to-orange-500",
      progress: Math.min(sightings.length, 10),
      max: 10
    },
    {
      id: "ach-streak",
      name: "Streak Master",
      desc: "Maintain a 5-day research patrol streak.",
      requirementText: "5 Day Streak",
      unlocked: streakCount >= 5,
      icon: "🔥",
      color: "from-purple-500 to-pink-500",
      progress: Math.min(streakCount, 5),
      max: 5
    },
    {
      id: "ach-rank",
      name: "Explorer Rank",
      desc: "Reach Explorer Level 3 (1000+ total points).",
      requirementText: "Level 3",
      unlocked: Math.floor(totalPoints / 500) + 1 >= 3,
      icon: "🎓",
      color: "from-rose-500 to-red-500",
      progress: Math.min(Math.floor(totalPoints / 500) + 1, 3),
      max: 3
    }
  ];

  // Daily Research Missions State
  const [dailyMissions, setDailyMissions] = React.useState(() => {
    const cached = localStorage.getItem("bioscout_daily_missions");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "dm-1",
        title: "Understory Search",
        description: "Log an observation located in an Understory quadrant.",
        points: 60,
        completed: false,
        claimed: false
      },
      {
        id: "dm-2",
        title: "High Confidence Verification",
        description: "Register a sighting with >= 95% confidence verification.",
        points: 80,
        completed: false,
        claimed: false
      },
      {
        id: "dm-3",
        title: "Elite Streak Patrolling",
        description: "Maintain a research patrol streak of at least 5 days.",
        points: 120,
        completed: false,
        claimed: false
      }
    ];
  });

  // Sync daily missions status
  React.useEffect(() => {
    const isUnderstoryCompleted = sightings.some(s => 
      (s.location || "").toLowerCase().includes("understory") || 
      (s.notes || "").toLowerCase().includes("understory")
    );
    const isHighConfCompleted = sightings.some(s => s.confidence >= 95);
    const isStreakCompleted = streakCount >= 5;

    setDailyMissions(prev => {
      const updated = prev.map(m => {
        if (m.id === "dm-1") return { ...m, completed: isUnderstoryCompleted };
        if (m.id === "dm-2") return { ...m, completed: isHighConfCompleted };
        if (m.id === "dm-3") return { ...m, completed: isStreakCompleted };
        return m;
      });
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        localStorage.setItem("bioscout_daily_missions", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [sightings, streakCount]);

  const handleClaimReward = (missionId: string, pointsToAward: number) => {
    if (!currentUser || !onUpdateUser) return;
    const updatedMissions = dailyMissions.map(m => 
      m.id === missionId ? { ...m, claimed: true } : m
    );
    setDailyMissions(updatedMissions);
    localStorage.setItem("bioscout_daily_missions", JSON.stringify(updatedMissions));

    const newPoints = totalPoints + pointsToAward;
    const updatedUser: UserProfile = {
      ...currentUser,
      points: newPoints,
      rank: newPoints >= 500 ? "SENTINEL" : newPoints >= 200 ? "GUARDIAN" : "NOVICE"
    };
    onUpdateUser(updatedUser);
  };

  // Conservation alerts simulation
  const [alerts, setAlerts] = React.useState<Array<{
    id: string;
    type: "emergency" | "sighting" | "weather";
    title: string;
    location: string;
    description: string;
    time: string;
    severity: "high" | "medium" | "low";
    active: boolean;
  }>>(() => {
    const cached = localStorage.getItem("bioscout_conservation_alerts");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "alert-1",
        type: "emergency",
        title: "Critical Wildfire Warning",
        location: "Southern Quadrant C (Sector 12)",
        description: "Thermal sensors in Southern Quadrant C have detected a 15% surge in surface temperatures. Early forest fire caution recommended.",
        time: "2 mins ago",
        severity: "high",
        active: true
      },
      {
        id: "alert-2",
        type: "sighting",
        title: "Rare Jaguar Spotted",
        location: "Protected Jaguar Reserve",
        description: "A camera trap in Quadrant A has captured a maternal adult Jaguar with two cubs. Stay alert during active exploration runs.",
        time: "45 mins ago",
        severity: "medium",
        active: true
      },
      {
        id: "alert-3",
        type: "weather",
        title: "Canopy Precipitation Alert",
        location: "Rio Negro Delta Basin",
        description: "Atmospheric tracking reports 98% relative humidity saturation. Rapid flash flooding risk predicted within 2 hours.",
        time: "1 hour ago",
        severity: "low",
        active: true
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("bioscout_conservation_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
  };

  const handleSimulateAlert = () => {
    const simulationPool = [
      {
        type: "emergency" as const,
        title: "Illegal Logging Activity Signal",
        location: "Northeast Canopy Sanctuary",
        description: "Acoustic bio-sensors flagged chain-saw audio footprints near Station 4. Ranger teams mobilized.",
        severity: "high" as const
      },
      {
        type: "sighting" as const,
        title: "Pink River Dolphin Pod",
        location: "Lower Amazon Tributary",
        description: "Local trackers logged an active nursery pod of 6 dolphins swimming upstream. Coordinate logs updated.",
        severity: "medium" as const
      },
      {
        type: "weather" as const,
        title: "Thermal Heatwave Advisory",
        location: "All Tracked Regions",
        description: "Solar flux levels projected to peak at 41°C. Implement shade-seeking measures for vulnerable understory biomes.",
        severity: "medium" as const
      },
      {
        type: "emergency" as const,
        title: "Invasive Beetle Infestation",
        location: "Western Kapok Groves",
        description: "High density of bark beetle vectors detected. Immediate chemical pheromone containment recommended.",
        severity: "high" as const
      },
      {
        type: "sighting" as const,
        title: "Legendary Harpy Eagle Nest",
        location: "Sentinel Tree #402",
        description: "Satellite telemetry confirmed active nesting patterns of a breeding Harpy Eagle pair. Restricted zone active.",
        severity: "high" as const
      }
    ];

    const randomTemplate = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    const newAlert = {
      id: `alert-sim-${Date.now()}`,
      ...randomTemplate,
      time: "Just now",
      active: true
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleExportJSON = () => {
    const exportData = {
      reportGeneratedAt: new Date().toISOString(),
      systemInfo: "BioScout Field Journal & Taxonomic Archive",
      currentUser: currentUser ? {
        username: currentUser.username,
        email: currentUser.email,
        rank: currentUser.rank,
        points: currentUser.points,
        streak: currentUser.streak,
      } : "Guest Scout",
      achievementsUnlockedCount: trackedAchievements.filter(a => a.unlocked).length,
      achievements: trackedAchievements.map(a => ({
        name: a.name,
        unlocked: a.unlocked,
        progress: `${a.progress}/${a.max}`
      })),
      sightingsCount: sightings.length,
      sightings: sightings.map(s => ({
        id: s.id,
        speciesName: s.speciesName,
        scientificName: s.scientificName,
        location: s.location,
        timestamp: s.timestamp,
        reporter: s.reporter,
        confidence: s.confidence,
        verified: s.verified,
        notes: s.notes,
        lat: s.lat,
        lng: s.lng
      })),
      customSpeciesGuidesCount: customGuides.length,
      customSpeciesGuides: customGuides.map(g => ({
        speciesName: g.speciesName,
        scientificName: g.scientificName,
        category: g.category,
        conservationStatus: g.conservationStatus,
        nativeRange: g.nativeRange,
        avgTemp: g.avgTemp,
        humidity: g.humidity,
        ecosystem: g.ecosystem
      }))
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `bioscout_field_journal_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Recharts Sighting Frequency Last 7 Days
  const last7DaysData = React.useMemo(() => {
    const data = [];
    const baseDate = new Date(2026, 6, 2); // July 2, 2026
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const count = sightings.filter(s => {
        const timestampLower = (s.timestamp || "").toLowerCase();
        const dateStringLower = dateString.toLowerCase();
        return timestampLower.includes(dateStringLower);
      }).length;
      
      data.push({
        day: dayLabel,
        date: dateString,
        sightings: count
      });
    }
    return data;
  }, [sightings]);

  const levelProgress = totalPoints % 500;
  const currentLevel = Math.floor(totalPoints / 500) + 1;
  const progressPercent = (levelProgress / 500) * 100;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className={`font-sans min-h-screen pt-28 pb-16 relative overflow-hidden transition-all duration-300 ${
      theme === "night" 
        ? "bg-[#00100a] text-[#6ffbbe]" 
        : "bg-[#f9f9f8] text-[#1a1c1c]"
    }`}>
      
      {/* Decorative background grid elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>

      {/* Top Breadcrumb Nav Bar */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-between mb-8 relative z-10">
        <motion.div 
          whileHover={{ x: -4 }}
          onClick={() => onNavigate(ActiveScreen.LANDING)}
          className={`flex items-center gap-2 cursor-pointer transition-all font-semibold text-xs uppercase tracking-wider ${
            theme === "night" ? "text-emerald-500/80 hover:text-emerald-400" : "text-[#404944] hover:text-[#003527]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit HQ</span>
        </motion.div>
        
        <div className={`flex items-center gap-4 text-xs font-mono ${theme === "night" ? "text-emerald-500/80" : "text-[#404944]"}`}>
          <span className={`px-3 py-1 rounded-full flex items-center gap-2 font-bold tracking-wider border ${
            theme === "night" 
              ? "bg-[#002419]/60 border-emerald-950/80 text-emerald-400" 
              : "bg-[#003527]/5 border border-[#003527]/10"
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SECURED FIELD CHANNEL
          </span>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
      >
        
        {/* Profile and Rank Progress Column (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10 mb-5">
              {currentUser ? (
                <>
                  <div 
                    onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
                    className="relative cursor-pointer group shrink-0"
                    title="Click to customize companion avatar"
                  >
                    <div className="w-16 h-16 rounded-2xl border-2 border-emerald-600 bg-emerald-50/80 flex items-center justify-center text-3xl shadow-md overflow-hidden transition-all group-hover:scale-105 group-hover:brightness-95">
                      {currentUser.avatar.startsWith("data:") || currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/") ? (
                        <img 
                          src={currentUser.avatar} 
                          className="w-full h-full object-cover" 
                          alt="User Avatar" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        currentUser.avatar.includes(" ") ? currentUser.avatar.split(" ")[0] : currentUser.avatar
                      )}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 bg-[#003527] text-white p-1 rounded-lg border border-white group-hover:bg-[#006c49] transition-colors">
                      <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block bg-[#064e3b]/10 text-[#006c49] border border-[#064e3b]/10 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest mb-1.5">
                      RANK {currentLevel} {currentUser.rank}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-extrabold text-[#003527] tracking-tight font-display truncate" title={currentUser.username}>
                        {currentUser.username}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
                      className="text-[10px] font-extrabold text-[#006c49] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Customize Avatar</span>
                    </button>
                    
                    {/* Unique Achievement Badge Rewards */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {trackedAchievements.filter(a => a.unlocked).map(a => (
                        <span 
                          key={a.id} 
                          className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 text-sm shadow-sm cursor-help hover:scale-110 transition-all"
                          title={`${a.name}: ${a.desc}`}
                        >
                          {a.icon}
                        </span>
                      ))}
                      {trackedAchievements.filter(a => a.unlocked).length === 0 && (
                        <span className="text-[8px] font-extrabold text-slate-400 font-mono uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">No Badges</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl border-2 border-slate-300 bg-slate-50 flex items-center justify-center text-3xl shadow-md text-slate-400">
                      👤
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest mb-1.5">
                      GUEST SCOUT
                    </span>
                    <button 
                      onClick={() => onOpenAuth("login")}
                      className="text-sm font-extrabold text-[#003527] hover:underline block text-left"
                    >
                      Sign In / Join
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Expandable Companion Avatar Selector */}
            {isAvatarSelectorOpen && currentUser && (
              <div 
                className="overflow-hidden border-t border-[#bfc9c3]/30 mt-4 pt-4 mb-4 relative z-10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-extrabold text-[#404944] uppercase tracking-wider font-mono">Companion Avatar</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setActiveAvatarTab("presets")}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border transition-all cursor-pointer ${activeAvatarTab === "presets" ? "bg-[#003527] border-[#003527] text-white" : "bg-white border-slate-200 text-[#404944]"}`}
                    >
                      Presets
                    </button>
                    <button 
                      onClick={() => setActiveAvatarTab("ai")}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border transition-all cursor-pointer ${activeAvatarTab === "ai" ? "bg-[#003527] border-[#003527] text-white" : "bg-white border-slate-200 text-[#404944]"}`}
                    >
                      AI Engine
                    </button>
                    <button 
                      onClick={() => setActiveAvatarTab("upload")}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border transition-all cursor-pointer ${activeAvatarTab === "upload" ? "bg-[#003527] border-[#003527] text-white" : "bg-white border-slate-200 text-[#404944]"}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {activeAvatarTab === "presets" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {presetNatureAvatars.map((preset) => {
                      const isCurrent = currentUser.avatar === preset.char;
                      return (
                        <button
                          key={preset.char}
                          onClick={() => handleSelectPreset(preset.char)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border transition-all cursor-pointer relative ${isCurrent ? "bg-emerald-50 border-emerald-600 shadow-sm scale-95" : "bg-white border-slate-200 hover:border-[#003527]"}`}
                          title={preset.label}
                        >
                          <span>{preset.char}</span>
                          {isCurrent && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border border-white">
                              <Check className="w-2.5 h-2.5 font-bold" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : activeAvatarTab === "ai" ? (
                  <div className="space-y-3 bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/40">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-extrabold text-[#006c49] uppercase tracking-widest font-mono">Select AI Prompt Aura</span>
                      <select
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={isAiGenerating}
                        className="w-full text-xs font-bold text-[#003527] bg-white border border-[#bfc9c3]/40 rounded-xl p-2 outline-none cursor-pointer"
                      >
                        {aiPrompts.map((p) => (
                          <option key={p.text} value={p.text}>{p.text}</option>
                        ))}
                      </select>
                    </div>

                    {isAiGenerating ? (
                      <div className="space-y-2 py-1">
                        <div className="flex justify-between text-[9px] font-mono text-emerald-800 font-bold">
                          <span className="animate-pulse">{aiStatusText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-600"
                            animate={{ width: `${aiProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateAiAvatar}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-[#006c49] text-white rounded-xl text-xs font-extrabold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulate AI Generation</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      onDragEnter={handleDragProfilePic}
                      onDragOver={handleDragProfilePic}
                      onDragLeave={handleDragProfilePic}
                      onDrop={handleDropProfilePic}
                      onClick={() => document.getElementById("profile-pic-file-input")?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        dragActive
                          ? "border-emerald-500 bg-emerald-50/40"
                          : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-600"
                      }`}
                    >
                      <input
                        id="profile-pic-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                      <Camera className="w-6 h-6 text-emerald-600 animate-pulse-subtle" />
                      <div className="space-y-0.5">
                        <span className="block text-xs font-extrabold text-[#003527]">
                          Drag & drop picture here
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          or click to select file
                        </span>
                      </div>
                    </div>
                    {currentUser.avatar.startsWith("data:image/") && (
                      <div className="flex items-center gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/40">
                        <img
                          src={currentUser.avatar}
                          className="w-8 h-8 rounded-lg object-cover border border-emerald-600/20"
                          alt="preview"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-extrabold text-[#003527] truncate">
                            Custom avatar is active
                          </span>
                          <span className="block text-[8px] font-bold text-[#006c49] uppercase tracking-widest font-mono">
                            Optimized JPEG Compression
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Progress metrics */}
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-[11px] mb-2 font-mono text-[#404944]">
                  <span className="font-bold uppercase tracking-wider">Rank Progression</span>
                  <span className="text-[#006c49] font-extrabold">{levelProgress} / 500 PTS</span>
                </div>
                <div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden border border-white/20 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-4 mt-4">
                <div className="p-3 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                  <span className="block text-[10px] font-bold text-[#8d928f] uppercase tracking-wider">Streak</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                    <span className="text-base font-extrabold text-[#003527] font-display">{streakCount} Days</span>
                  </div>
                </div>
                <div className="p-3 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                  <span className="block text-[10px] font-bold text-[#8d928f] uppercase tracking-wider">Total Score</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="text-base font-extrabold text-[#003527] font-display">{totalPoints} PTS</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scout Achievements Section */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#404944] font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#006c49]" />
                Scout Achievements
              </h3>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                {trackedAchievements.filter(a => a.unlocked).length} / 5 Unlocked
              </span>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
              {trackedAchievements.map((ach) => {
                const isUnlocked = ach.unlocked;
                return (
                  <motion.div
                    key={ach.id}
                    whileHover={isUnlocked ? { y: -2 } : {}}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${isUnlocked ? "bg-white border-emerald-500/10 shadow-[0_4px_16px_rgba(16,185,129,0.03)]" : "bg-[#f4f4f3]/40 border-slate-100 opacity-60"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative text-xl ${isUnlocked ? `bg-gradient-to-br ${ach.color} text-white shadow-sm` : "bg-slate-100 text-slate-400"}`}>
                      <span>{ach.icon}</span>
                      {!isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-300 text-white rounded-full p-0.5 border border-white">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] font-extrabold block truncate ${isUnlocked ? "text-[#003527]" : "text-slate-500"}`}>
                          {ach.name}
                        </span>
                        <span className={`text-[9px] font-bold shrink-0 font-mono ${isUnlocked ? "text-emerald-700" : "text-slate-400"}`}>
                          {ach.progress} / {ach.max}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#404944] leading-tight mt-0.5 font-sans">
                        {ach.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Heatmap Grid & Challenges Column (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Conservation Alerts & Environmental Monitoring Panel */}
          <motion.div 
            variants={cardVariants}
            className="bg-[#fffbeb] border border-amber-200/60 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(217,119,6,0.03)] relative overflow-hidden"
          >
            {/* Blinking red radar aura decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 relative z-10">
              <div>
                <h3 className="text-base font-extrabold text-amber-900 tracking-tight font-display flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                  Conservation Alerts & Regional Emergencies
                </h3>
                <p className="text-xs text-amber-800/80 mt-0.5">Real-time alerts for environmental emergencies or rare sightings in tracked grids.</p>
              </div>
              
              <button
                onClick={handleSimulateAlert}
                className="px-3 py-1.5 bg-amber-800 text-white rounded-xl text-[10px] font-mono font-black uppercase tracking-wider hover:bg-amber-950 transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Trigger Alert
              </button>
            </div>

            {/* Alert List */}
            <div className="space-y-3 relative z-10">
              {alerts.filter(a => a.active).length === 0 ? (
                <div className="text-center py-6 bg-white/50 rounded-2xl border border-amber-100/50 flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xl">🛡️</span>
                  <p className="text-xs font-bold text-emerald-800 font-mono">ALL REGIONAL SYSTEMS NOMINAL</p>
                  <p className="text-[10px] text-slate-500 max-w-sm">No active wildfires, illegal logging, or critical wildlife hazards detected in your Amazon quadrants.</p>
                </div>
              ) : (
                alerts.filter(a => a.active).map((alert) => {
                  const isHigh = alert.severity === "high";
                  const isMed = alert.severity === "medium";
                  const cardBg = isHigh ? "bg-red-50/70 border-red-200/60" : isMed ? "bg-amber-50/50 border-amber-200/50" : "bg-blue-50/50 border-blue-200/50";
                  const titleColor = isHigh ? "text-red-900" : isMed ? "text-amber-900" : "text-blue-900";
                  const badgeColor = isHigh ? "bg-red-600 text-white animate-pulse" : isMed ? "bg-amber-600 text-white" : "bg-blue-600 text-white";

                  return (
                    <motion.div
                      key={alert.id}
                      layoutId={alert.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex gap-3.5 p-4 rounded-2xl border transition-all relative ${cardBg}`}
                    >
                      {/* Dismiss button */}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 w-5 h-5 rounded-full hover:bg-black/5 flex items-center justify-center transition-all cursor-pointer animate-none"
                        title="Dismiss Alert"
                      >
                        <X className="w-3.5 h-3.5 animate-none" />
                      </button>

                      <div className="mt-0.5 shrink-0">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold ${badgeColor}`}>
                          {alert.type === "emergency" ? "🚨" : alert.type === "sighting" ? "🐾" : "⚡"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 pr-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`font-extrabold text-xs tracking-tight ${titleColor}`}>
                            {alert.title}
                          </h4>
                          <span className="text-[8px] font-black uppercase tracking-widest bg-black/5 px-1.5 py-0.5 rounded font-mono text-slate-500">
                            {alert.location}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Heatmap Grid */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[#003527] tracking-tight font-display flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Sighting Density Log
                </h3>
                <p className="text-xs text-[#404944] mt-0.5">Tracking biological data uploads across forest grids.</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8d928f] bg-slate-100 px-2.5 py-1 rounded-lg">
                <span>Less</span>
                <div className="w-3 h-3 bg-[#e2e8f0]/60 rounded"></div>
                <div className="w-3 h-3 bg-emerald-100/80 rounded"></div>
                <div className="w-3 h-3 bg-emerald-300/80 rounded"></div>
                <div className="w-3 h-3 bg-emerald-500/80 rounded"></div>
                <div className="w-3 h-3 bg-emerald-700/90 rounded"></div>
                <span>More</span>
              </div>
            </div>

            {/* Heatmap matrix representation */}
            <div className="relative">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {contributionGrid.map((cell, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.25, zIndex: 10 }}
                    className={`w-4.5 h-4.5 rounded cursor-pointer border border-white/20 transition-all shadow-sm ${cell.bg}`}
                    title={`${cell.label} on cell ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Last 7 Days Conservation Contributions Mini-Bar Chart */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#003527] tracking-tight font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Conservation Contributions (Last 7 Days)
              </h3>
              <p className="text-xs text-[#404944] mt-0.5">Real-time daily frequency index of biological sightings.</p>
            </div>

            <div className="h-44 w-full select-none mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#8d928f" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#8d928f" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1a1c1c] text-white p-2.5 rounded-xl border border-emerald-500/20 text-[10px] font-mono shadow-md">
                            <p className="font-extrabold text-[#6ffbbe]">{payload[0].payload.date}</p>
                            <p className="mt-0.5 text-slate-300 font-bold">{payload[0].value} Sightings Logged</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sightings" radius={[6, 6, 0, 0]}>
                    {last7DaysData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.sightings > 0 ? '#10b981' : '#e2e8f0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Biosphere Climate Telemetry HUD */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] overflow-hidden relative"
          >
            {/* Ambient sensor scanner glowing scan line when scanning */}
            {isScanning && (
              <div className="absolute inset-x-0 h-[2px] bg-emerald-400 opacity-60 shadow-[0_0_8px_#34d399] z-20 animate-laser-sweep"></div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[#003527] tracking-tight font-display flex items-center gap-2">
                  <Radio className={`w-4 h-4 text-emerald-600 ${isScanning ? "animate-pulse" : ""}`} />
                  Biosphere Climate Telemetry HUD
                </h3>
                <p className="text-xs text-[#404944] mt-0.5">Real-time local ecosystem index & sensor gateway signals.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono text-[#8d928f] uppercase">
                  LAST SIGNAL: <span className="font-bold text-emerald-700">{lastScanTime}</span>
                </span>
                <button
                  onClick={handleScanSensors}
                  disabled={isScanning}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isScanning
                      ? "bg-slate-100 text-slate-400 border border-slate-200"
                      : "bg-[#003527] text-white hover:brightness-110 border border-transparent"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Receiving Data..." : "Scan Sensors"}</span>
                </button>
              </div>
            </div>

            {/* Grid of Sensors */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Canopy Temperature",
                  value: `${sensors.canopyTemp} °C`,
                  status: sensors.canopyTemp > 28 ? "Warm Canopy" : sensors.canopyTemp < 20 ? "Understory Cool" : "Optimal (Steady)",
                  statusColor: sensors.canopyTemp > 28 ? "text-amber-600 bg-amber-50" : "text-emerald-700 bg-emerald-50",
                  icon: Thermometer,
                  iconColor: "text-red-500 bg-red-50",
                  progress: ((sensors.canopyTemp - 15) / 20) * 100
                },
                {
                  label: "Understory Humidity",
                  value: `${sensors.soilMoisture}%`,
                  status: sensors.soilMoisture > 75 ? "Supersaturated" : sensors.soilMoisture < 50 ? "Arid Layer" : "Normal Moisture",
                  statusColor: sensors.soilMoisture > 75 ? "text-blue-600 bg-blue-50" : "text-emerald-700 bg-emerald-50",
                  icon: Droplets,
                  iconColor: "text-blue-500 bg-blue-50",
                  progress: sensors.soilMoisture
                },
                {
                  label: "Ambient Solar Index",
                  value: `${sensors.uvIndex} UV`,
                  status: sensors.uvIndex > 5 ? "Extreme Exposure" : sensors.uvIndex < 2 ? "Shaded Canopy" : "Filtered Sunlight",
                  statusColor: sensors.uvIndex > 5 ? "text-rose-600 bg-rose-50" : "text-emerald-700 bg-emerald-50",
                  icon: Sun,
                  iconColor: "text-amber-500 bg-amber-50",
                  progress: (sensors.uvIndex / 10) * 100
                },
                {
                  label: "Bioluminescence",
                  value: `${sensors.bioluminescence}%`,
                  status: sensors.bioluminescence > 30 ? "Fungal Outburst" : "Dormant Flora",
                  statusColor: sensors.bioluminescence > 30 ? "text-purple-600 bg-purple-50" : "text-slate-500 bg-slate-50",
                  icon: Sparkles,
                  iconColor: "text-indigo-500 bg-indigo-50",
                  progress: sensors.bioluminescence
                },
                {
                  label: "Acoustic Activity",
                  value: `${sensors.acousticBioActivity}%`,
                  status: sensors.acousticBioActivity > 75 ? "High Avian Chorus" : sensors.acousticBioActivity < 30 ? "Nocturnal Silence" : "Steady Biophony",
                  statusColor: sensors.acousticBioActivity > 75 ? "text-orange-600 bg-orange-50" : "text-emerald-700 bg-emerald-50",
                  icon: Mic,
                  iconColor: "text-emerald-500 bg-emerald-50",
                  progress: sensors.acousticBioActivity
                },
                {
                  label: "Canopy Wind Flow",
                  value: `${(sensors.canopyTemp * 0.4).toFixed(1)} km/h`,
                  status: sensors.canopyTemp * 0.4 > 10 ? "Moderate Breeze" : "Calm Drafts",
                  statusColor: "text-teal-700 bg-teal-50",
                  icon: Wind,
                  iconColor: "text-sky-500 bg-sky-50",
                  progress: (sensors.canopyTemp * 0.4 / 25) * 100
                }
              ].map((sensor, sIdx) => {
                const IconComp = sensor.icon;
                return (
                  <div key={sIdx} className="p-3.5 rounded-2xl border border-[#bfc9c3]/20 bg-white shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#003527]/10 transition-all duration-300">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono truncate">{sensor.label}</span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${sensor.iconColor}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="my-1.5">
                      <span className="text-xl font-black text-[#003527] font-display">{sensor.value}</span>
                      <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${sensor.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-50">
                      <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md ${sensor.statusColor}`}>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Daily Research Missions List */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-[#003527] tracking-tight font-display flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Daily Research Missions
                </h3>
                <p className="text-xs text-[#404944] mt-0.5">Complete real patrol targets to claim raw energy score outputs.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReportSighting}
                className="text-xs font-bold text-emerald-700 hover:text-[#003527] transition-all flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-100"
              >
                <span>Launch Patrol</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyMissions.map((dm, index) => {
                return (
                  <motion.div
                    key={dm.id}
                    variants={itemVariants}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      dm.completed 
                        ? dm.claimed 
                          ? "bg-slate-50/50 border-slate-200 opacity-70" 
                          : "bg-emerald-50/40 border-emerald-300 shadow-sm"
                        : "bg-white border-[#bfc9c3]/20 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Mission 0{index + 1}</span>
                        <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                          dm.completed 
                            ? "bg-emerald-100/60 text-emerald-800 border-emerald-200" 
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {dm.completed ? "COMPLETED" : "ACTIVE"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[#003527] font-display mb-1">{dm.title}</h4>
                      <p className="text-[10px] text-[#404944] mb-3 leading-normal min-h-[30px]">{dm.description}</p>
                    </div>

                    <div className="border-t border-slate-100/60 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold font-mono text-[#006c49]">+{dm.points} PTS</span>
                        {dm.claimed ? (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-slate-400" />
                            Claimed
                          </span>
                        ) : dm.completed ? (
                          <button
                            onClick={() => handleClaimReward(dm.id, dm.points)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                          >
                            Claim Reward
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">In Progress</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Off-grid Synchronization & Data Export Hub */}
          <motion.div
            variants={cardVariants}
            className={`rounded-[32px] p-6 border transition-all ${
              theme === "night"
                ? "bg-[#002419]/70 border-emerald-800/40 text-[#6ffbbe] shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                : "bg-white/65 backdrop-blur-[24px] border-white/50 text-[#003527] shadow-[0_12px_40px_rgba(6,78,59,0.04)]"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold tracking-tight font-display flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${theme === "night" ? "text-emerald-400 animate-spin" : "text-emerald-600 animate-pulse-subtle"}`} />
                  Off-Grid Synchronization Hub
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${theme === "night" ? "text-emerald-300/80" : "text-[#404944]"}`}>
                  All field observations, biological species libraries, and coordinates are dynamically cached in your browser's sandboxed offline storage. Ready for remote conservation wilderness sectors.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className={`text-[10px] font-mono font-bold tracking-widest ${theme === "night" ? "text-emerald-400" : "text-emerald-700"}`}>
                  SECURE LOCAL SYNCED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-dashed border-[#bfc9c3]/15">
              <div className={`p-4 rounded-2xl border ${theme === "night" ? "bg-[#001c13] border-emerald-800/25" : "bg-white border-[#bfc9c3]/20 shadow-sm"} flex flex-col justify-between gap-3`}>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs truncate">Log Feed Export (CSV)</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Download raw CSV mapping records of all species and environmental logs.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className={`w-full py-2 rounded-xl font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    theme === "night"
                      ? "bg-[#6ffbbe] text-[#001c13] hover:brightness-110"
                      : "bg-[#003527] text-white hover:brightness-110 active:scale-95 shadow-sm"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>

              <div className={`p-4 rounded-2xl border ${theme === "night" ? "bg-[#001c13] border-emerald-800/25" : "bg-white border-[#bfc9c3]/20 shadow-sm"} flex flex-col justify-between gap-3`}>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs truncate">Log Feed Export (JSON)</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Download a formatted offline JSON research report of sightings & achievements.</p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className={`w-full py-2 rounded-xl font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    theme === "night"
                      ? "bg-[#6ffbbe] text-[#001c13] hover:brightness-110"
                      : "bg-emerald-600 text-white hover:brightness-110 active:scale-95 shadow-sm"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </div>

              <div className={`p-4 rounded-2xl border ${theme === "night" ? "bg-[#001c13] border-emerald-800/25" : "bg-white border-[#bfc9c3]/20 shadow-sm"} flex flex-col justify-between gap-3`}>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs truncate">Forced Remote Reload</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Manually re-initialize and integrity-check offline database guide indices.</p>
                </div>
                <button
                  onClick={() => {
                    const notify = document.getElementById("sync-notifier");
                    if (notify) {
                      notify.classList.remove("hidden", "opacity-0");
                      notify.classList.add("opacity-100");
                      setTimeout(() => {
                        notify.classList.remove("opacity-100");
                        notify.classList.add("opacity-0");
                        setTimeout(() => notify.classList.add("hidden"), 300);
                      }, 2500);
                    }
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                    theme === "night"
                      ? "border-emerald-800 text-[#6ffbbe] bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Verify Cache
                </button>
              </div>
            </div>

            {/* Quick interactive Sync Feedback Notifier */}
            <div 
              id="sync-notifier" 
              className="hidden opacity-0 transition-all duration-300 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Offline tracking cache validated successfully! {sightings.length} sightings and {customGuides.length} taxonomic records fully secure.</span>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
}
