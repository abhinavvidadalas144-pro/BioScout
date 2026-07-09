import { useState, useEffect, lazy, Suspense } from "react";
import { ActiveScreen, Sighting, SpeciesData, UserProfile } from "./types";
import GlobalSearchBar from "./components/GlobalSearchBar";
import { IMAGES } from "./assets";
import { motion, AnimatePresence } from "motion/react";

import LandingScreen from "./components/LandingScreen";

// Lazy load screen modules to optimize bundle size and split initial chunk payloads
const MapScreen = lazy(() => import("./components/MapScreen"));
const HqDashboard = lazy(() => import("./components/HqDashboard"));
const FieldGuideScreen = lazy(() => import("./components/FieldGuideScreen"));
const EcosystemSandbox = lazy(() => import("./components/EcosystemSandbox"));
const ReportSightingModal = lazy(() => import("./components/ReportSightingModal"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const RegisterPage = lazy(() => import("./components/RegisterPage"));

// Ambient loading skeleton designed to blend seamlessly with the conservation terminal UI
const ScreenLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#031510] text-white p-6">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
    </div>
    <p className="mt-4 font-sans text-xs font-semibold text-emerald-400/80 tracking-widest uppercase animate-pulse">Loading Environment...</p>
  </div>
);

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(ActiveScreen.LANDING);
  const [selectedSpeciesName, setSelectedSpeciesName] = useState<string>("Blue Morpho");
  const [focusedSightingId, setFocusedSightingId] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Naturalist gamified trackers
  const [totalPoints, setTotalPoints] = useState<number>(350);
  const [streakCount, setStreakCount] = useState<number>(5);

  // Global night-vision theme state
  const [theme, setTheme] = useState<"light" | "night">(() => {
    const saved = localStorage.getItem("bioscout_theme");
    return (saved === "night" ? "night" : "light") as "light" | "night";
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "night" : "light";
    setTheme(nextTheme);
    localStorage.setItem("bioscout_theme", nextTheme);
  };
  
  // Custom uploaded guides list to support dynamic expansion
  const [customGuides, setCustomGuides] = useState<SpeciesData[]>([]);

  // Preloaded real sightings
  const [sightings, setSightings] = useState<Sighting[]>([
    {
      id: "1",
      speciesName: "Blue Morpho",
      scientificName: "Morpho menelaus",
      location: "Amazon Basin Understory",
      timestamp: "Jun 24, 2026",
      reporter: "Dr. Elena Vos",
      confidence: 98,
      image: IMAGES.blueMorphoMain,
      verified: true,
      notes: "Detected flying slowly through canopy gap 12 near coordinates 4.21S 62.45W. Reflective structural wings are in pristine condition.",
      lat: -3.1190,
      lng: -60.0217
    },
    {
      id: "2",
      speciesName: "Snow Leopard",
      scientificName: "Panthera uncia",
      location: "Amazon Protected Reserve East",
      timestamp: "Jun 28, 2026",
      reporter: "Agent Caleb Vance",
      confidence: 94,
      image: IMAGES.snowLeopard,
      verified: true,
      notes: "Prowling near the high elevation ridge. Camera trap isolated thick pelt contours and tail-wrap thermal signs.",
      lat: -3.0750,
      lng: -59.9400
    },
    {
      id: "3",
      speciesName: "Giant Tree Fern",
      scientificName: "Cyathea cooperi",
      location: "Rio Negro Forest Canopy",
      timestamp: "Jun 12, 2026",
      reporter: "Senior Tracker Liam",
      confidence: 100,
      image: IMAGES.giantTreeFern,
      verified: true,
      notes: "Massive specimen standing approximately 5.8 meters tall. Spore pattern density under the mature fronds indicates active propagation.",
      lat: -3.1550,
      lng: -60.0600
    },
    {
      id: "4",
      speciesName: "Cloud Forest Orchid",
      scientificName: "Cyrtochilum macranthum",
      location: "Amazon Highlands Cloud Forest",
      timestamp: "Jun 29, 2026",
      reporter: "Agent Maria Gomez",
      confidence: 96,
      image: IMAGES.cloudForestOrchid,
      verified: true,
      notes: "Climbing epiphytically on mature podocarpus trunk. Constant cloud mist saturation provides optimal nutrient transport.",
      lat: -3.0900,
      lng: -60.0100
    }
  ]);

  // Load state from local storage on mount (for persistent user-authored sightings!)
  useEffect(() => {
    const cachedSightings = localStorage.getItem("bioscout_sightings");
    const cachedPoints = localStorage.getItem("bioscout_points");
    const cachedStreak = localStorage.getItem("bioscout_streak");
    const cachedGuides = localStorage.getItem("bioscout_custom_guides");
    const cachedCurrentUser = localStorage.getItem("bioscout_current_user");

    const sanitizeImageUrl = (speciesName: string, currentUrl: string): string => {
      if (!currentUrl) return currentUrl;
      const lower = speciesName.trim().toLowerCase();
      if (currentUrl.includes("unsplash.com") || currentUrl.includes("picsum.photos")) {
        switch (lower) {
          case "scarlet macaw":
            return "https://upload.wikimedia.org/wikipedia/commons/c/c4/Ara_macao_-Copan_Ruins%2C_Honduras_-wild-8.jpg";
          case "poison dart frog":
            return "https://upload.wikimedia.org/wikipedia/commons/d/da/Strawberry_poison-dart_frog_%28Oophaga_pumilio%29.jpg";
          case "jaguar":
            return "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg";
          case "pink river dolphin":
            return "https://upload.wikimedia.org/wikipedia/commons/e/e0/Boto_Inia_geoffrensis_3.jpg";
          case "three-toed sloth":
            return "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bradypus_variegatus_-_Manuel_Antonio.jpg";
          case "amazon giant otter":
            return "https://upload.wikimedia.org/wikipedia/commons/2/2f/Giant_Otter_%28Pteronura_brasiliensis%29_%288015949673%29.jpg";
          case "harpy eagle":
            return "https://upload.wikimedia.org/wikipedia/commons/2/22/Harpy_Eagle_Harpia_harpyja_2000px.jpg";
          case "squirrel monkey":
            return "https://upload.wikimedia.org/wikipedia/commons/2/20/Saimiri_sciureus-top.jpg";
          case "kapok tree":
            return "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
          case "pitcher plant":
            return "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nepenthes_alata_pitcher_plant.jpg";
          case "heliconia flower":
            return "https://upload.wikimedia.org/wikipedia/commons/e/ec/Heliconia_rostrata.jpg";
        }
      }
      return currentUrl;
    };

    if (cachedSightings) {
      try {
        const parsed: Sighting[] = JSON.parse(cachedSightings);
        const sanitized = parsed.map(s => ({
          ...s,
          image: sanitizeImageUrl(s.speciesName, s.image)
        }));
        setSightings(sanitized);
        localStorage.setItem("bioscout_sightings", JSON.stringify(sanitized));
      } catch (e) {
        console.error(e);
      }
    }
    if (cachedPoints) {
      setTotalPoints(parseInt(cachedPoints, 10));
    }
    if (cachedStreak) {
      setStreakCount(parseInt(cachedStreak, 10));
    }
    if (cachedGuides) {
      try {
        const parsed: SpeciesData[] = JSON.parse(cachedGuides);
        const sanitized = parsed.map(g => ({
          ...g,
          customImage: g.customImage ? sanitizeImageUrl(g.speciesName, g.customImage) : g.customImage
        }));
        setCustomGuides(sanitized);
        localStorage.setItem("bioscout_custom_guides", JSON.stringify(sanitized));
      } catch (e) {
        console.error(e);
      }
    }
    if (cachedCurrentUser) {
      try {
        const parsed = JSON.parse(cachedCurrentUser);
        if (parsed && typeof parsed.avatar === "string") {
          const isUrlOrBase64 = parsed.avatar.startsWith("data:") || parsed.avatar.startsWith("http") || parsed.avatar.startsWith("/");
          if (!isUrlOrBase64) {
            parsed.avatar = parsed.avatar.replace(/\s*\(AI\)\s*/gi, "").trim();
            if (parsed.avatar.includes(" ")) {
              parsed.avatar = parsed.avatar.split(" ")[0];
            }
          }
        }
        setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Listen to browser pathname changes for clean URL SPA routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const cachedCurrentUser = localStorage.getItem("bioscout_current_user");

      if (!cachedCurrentUser && !currentUser) {
        // Unauthenticated users can only access LANDING, LOGIN, or REGISTER
        if (path === "/register") {
          setActiveScreen(ActiveScreen.REGISTER);
        } else if (path === "/login") {
          setActiveScreen(ActiveScreen.LOGIN);
        } else {
          // Any other route forces login or landing gate
          if (path === "/map" || path === "/hq" || path === "/guide" || path === "/sandbox") {
            setActiveScreen(ActiveScreen.LOGIN);
            if (window.location.pathname !== "/login") {
              window.history.pushState({}, "", "/login");
            }
          } else {
            setActiveScreen(ActiveScreen.LANDING);
          }
        }
      } else {
        // Authenticated users
        if (path === "/login" || path === "/register") {
          setActiveScreen(ActiveScreen.HQ);
          if (window.location.pathname !== "/hq") {
            window.history.pushState({}, "", "/hq");
          }
        } else if (path === "/map") {
          setActiveScreen(ActiveScreen.MAP);
        } else if (path === "/hq") {
          setActiveScreen(ActiveScreen.HQ);
        } else if (path === "/guide") {
          setActiveScreen(ActiveScreen.GUIDE);
        } else if (path === "/sandbox") {
          setActiveScreen(ActiveScreen.SANDBOX);
        } else {
          setActiveScreen(ActiveScreen.LANDING);
        }
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    handleLocationChange(); // Run initial check on mount

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [currentUser]);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("bioscout_current_user", JSON.stringify(user));
    setTotalPoints(user.points);
    setStreakCount(user.streak);
  };

  const handleLogout = () => {
    if (currentUser) {
      const usersRaw = localStorage.getItem("bioscout_users_pool");
      if (usersRaw) {
        try {
          const users: UserProfile[] = JSON.parse(usersRaw);
          const index = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (index !== -1) {
            users[index] = {
              ...currentUser,
              points: totalPoints,
              streak: streakCount
            };
            localStorage.setItem("bioscout_users_pool", JSON.stringify(users));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    setCurrentUser(null);
    localStorage.removeItem("bioscout_current_user");
    setTotalPoints(50);
    setStreakCount(1);
    navigateToScreen(ActiveScreen.LOGIN);
  };

  const handleSightingConfirmed = (newSighting: Sighting, speciesData: SpeciesData) => {
    // 1. Add sighting to feed
    const updatedSightings = [newSighting, ...sightings];
    setSightings(updatedSightings);
    localStorage.setItem("bioscout_sightings", JSON.stringify(updatedSightings));

    // 2. Add species details to custom guides list if not already present
    if (!customGuides.some((g) => g.speciesName === speciesData.speciesName)) {
      const updatedGuides = [...customGuides, { ...speciesData, customImage: newSighting.image }];
      setCustomGuides(updatedGuides);
      localStorage.setItem("bioscout_custom_guides", JSON.stringify(updatedGuides));
    }

    // 3. Award points (+50)
    const updatedPoints = totalPoints + 50;
    setTotalPoints(updatedPoints);
    localStorage.setItem("bioscout_points", updatedPoints.toString());

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        points: updatedPoints,
        rank: updatedPoints >= 500 ? "SENTINEL" : updatedPoints >= 200 ? "GUARDIAN" : "NOVICE"
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("bioscout_current_user", JSON.stringify(updatedUser));

      // Update in user pool
      const usersRaw = localStorage.getItem("bioscout_users_pool");
      if (usersRaw) {
        try {
          const users: UserProfile[] = JSON.parse(usersRaw);
          const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (idx !== -1) {
            users[idx] = updatedUser;
            localStorage.setItem("bioscout_users_pool", JSON.stringify(users));
          }
        } catch (e) {}
      }
    }

    // 4. Set selected species in guide
    setSelectedSpeciesName(speciesData.speciesName);
  };

  const handleAddSightingDirectly = (newSighting: Sighting) => {
    const updatedSightings = [newSighting, ...sightings];
    setSightings(updatedSightings);
    localStorage.setItem("bioscout_sightings", JSON.stringify(updatedSightings));

    // Award direct-pin points (+25)
    const updatedPoints = totalPoints + 25;
    setTotalPoints(updatedPoints);
    localStorage.setItem("bioscout_points", updatedPoints.toString());

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        points: updatedPoints,
        rank: updatedPoints >= 500 ? "SENTINEL" : updatedPoints >= 200 ? "GUARDIAN" : "NOVICE"
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("bioscout_current_user", JSON.stringify(updatedUser));

      // Update in user pool
      const usersRaw = localStorage.getItem("bioscout_users_pool");
      if (usersRaw) {
        try {
          const users: UserProfile[] = JSON.parse(usersRaw);
          const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (idx !== -1) {
            users[idx] = updatedUser;
            localStorage.setItem("bioscout_users_pool", JSON.stringify(users));
          }
        } catch (e) {}
      }
    }
  };

  const handleUpdateSighting = (updatedSighting: Sighting) => {
    const updated = sightings.map((s) => s.id === updatedSighting.id ? updatedSighting : s);
    setSightings(updated);
    localStorage.setItem("bioscout_sightings", JSON.stringify(updated));
  };

  const handleSelectSpeciesFromMap = (speciesName: string) => {
    setSelectedSpeciesName(speciesName);
    setActiveScreen(ActiveScreen.GUIDE);
  };

  const handleAddCustomGuide = (newGuide: SpeciesData) => {
    const updatedGuides = [...customGuides, newGuide];
    setCustomGuides(updatedGuides);
    localStorage.setItem("bioscout_custom_guides", JSON.stringify(updatedGuides));
    
    // Also award points for manual guide registration (+75 points!)
    if (currentUser) {
      const updatedPoints = totalPoints + 75;
      const updatedUser = {
        ...currentUser,
        points: updatedPoints,
        rank: updatedPoints >= 500 ? "SENTINEL" : updatedPoints >= 200 ? "GUARDIAN" : "NOVICE"
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("bioscout_current_user", JSON.stringify(updatedUser));
      setTotalPoints(updatedPoints);
      localStorage.setItem("bioscout_points", updatedPoints.toString());
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("bioscout_current_user", JSON.stringify(updatedUser));
    if (updatedUser.points !== undefined) {
      setTotalPoints(updatedUser.points);
      localStorage.setItem("bioscout_points", updatedUser.points.toString());
    }
    if (updatedUser.streak !== undefined) {
      setStreakCount(updatedUser.streak);
      localStorage.setItem("bioscout_streak", updatedUser.streak.toString());
    }

    const usersRaw = localStorage.getItem("bioscout_users_pool");
    if (usersRaw) {
      try {
        const users: UserProfile[] = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (idx !== -1) {
          users[idx] = updatedUser;
          localStorage.setItem("bioscout_users_pool", JSON.stringify(users));
        }
      } catch (e) {}
    }
  };

  const navigateToScreen = (screen: ActiveScreen) => {
    // If not authenticated, restrict access to only LANDING, LOGIN, and REGISTER
    const isAuth = !!localStorage.getItem("bioscout_current_user") || !!currentUser;
    let targetScreen = screen;
    if (!isAuth && screen !== ActiveScreen.LOGIN && screen !== ActiveScreen.REGISTER && screen !== ActiveScreen.LANDING) {
      targetScreen = ActiveScreen.LOGIN;
    }

    setActiveScreen(targetScreen);
    if (targetScreen !== ActiveScreen.MAP) {
      setFocusedSightingId(undefined);
    }

    // Synchronize browser URL pathname
    let path = "/";
    if (targetScreen === ActiveScreen.MAP) path = "/map";
    else if (targetScreen === ActiveScreen.HQ) path = "/hq";
    else if (targetScreen === ActiveScreen.GUIDE) path = "/guide";
    else if (targetScreen === ActiveScreen.SANDBOX) path = "/sandbox";
    else if (targetScreen === ActiveScreen.LOGIN) path = "/login";
    else if (targetScreen === ActiveScreen.REGISTER) path = "/register";

    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    // Scroll to top on navigation to ensure a premium responsive transition
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`min-h-screen relative transition-all duration-300 ${
      theme === "night" 
        ? "bg-[#00100a] text-[#6ffbbe]" 
        : "bg-[#f9f9f8] text-[#1a1c1c]"
    }`}>
      {/* Top Header Floating Navigation (Visible for non-landing screens to support effortless tab toggling) */}
      <AnimatePresence>
        {activeScreen !== ActiveScreen.LANDING && !(activeScreen === ActiveScreen.MAP && mapFullscreen) && (
          <motion.nav
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 w-full z-[2500] border-b backdrop-blur-xl transition-all duration-300 ${
              theme === "night"
                ? "bg-[#001c13]/85 border-emerald-950/80 text-[#6ffbbe] shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
                : "bg-white/70 border-[#bfc9c3]/30 text-[#003527] shadow-[0_4px_32px_0_rgba(6,78,59,0.04)]"
            }`}
          >
            <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-between h-20 gap-8 md:gap-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-2xl font-extrabold tracking-tight cursor-pointer transition-all ${
                  theme === "night" ? "text-[#6ffbbe]" : "text-[#003527]"
                }`}
                onClick={() => navigateToScreen(ActiveScreen.LANDING)}
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
                    setSelectedSpeciesName(name);
                    navigateToScreen(ActiveScreen.GUIDE);
                  }}
                  onSelectSighting={(id) => {
                    setFocusedSightingId(id);
                    navigateToScreen(ActiveScreen.MAP);
                  }}
                  onFocusChange={setIsSearchFocused}
                />
              </div>

              <div className="flex items-center gap-2 lg:gap-4 xl:gap-6 px-2 sm:px-4 mx-1 sm:mx-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => navigateToScreen(ActiveScreen.LANDING)}
                  className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeScreen === ActiveScreen.LANDING 
                      ? theme === "night" ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]" 
                      : theme === "night" ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
                  }`}
                >
                  Discover
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => navigateToScreen(ActiveScreen.HQ)}
                  className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeScreen === ActiveScreen.HQ 
                      ? theme === "night" ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]" 
                      : theme === "night" ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
                  }`}
                >
                  Missions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => navigateToScreen(ActiveScreen.MAP)}
                  className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeScreen === ActiveScreen.MAP 
                      ? theme === "night" ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]" 
                      : theme === "night" ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
                  }`}
                >
                  Explore Map
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => navigateToScreen(ActiveScreen.GUIDE)}
                  className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeScreen === ActiveScreen.GUIDE 
                      ? theme === "night" ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]" 
                      : theme === "night" ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
                  }`}
                >
                  Field Guide
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => navigateToScreen(ActiveScreen.SANDBOX)}
                  className={`font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeScreen === ActiveScreen.SANDBOX 
                      ? theme === "night" ? "text-emerald-400 bg-emerald-950/30 border-b-2 border-emerald-400" : "text-[#003527] bg-[#003527]/5 border-b-2 border-[#003527]" 
                      : theme === "night" ? "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-[#404944] hover:text-[#003527] hover:bg-[#003527]/5"
                  }`}
                >
                  Sandbox
                </motion.button>
              </div>

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
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleTheme}
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

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border mr-2 ${
                    theme === "night" ? "bg-[#002419] border-emerald-800 text-[#6ffbbe]" : "bg-[#003527]/5 border-[#003527]/10 text-[#003527]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">verified</span>
                  <span className="text-xs font-bold">{totalPoints} PTS</span>
                </motion.div>
                
                {currentUser ? (
                  <div className="flex items-center gap-2.5 border-l border-[#bfc9c3]/30 pl-4">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateToScreen(ActiveScreen.HQ)}
                      className="text-lg bg-emerald-50 w-8 h-8 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm cursor-pointer overflow-hidden transition-all duration-300"
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
                      <span className="text-xs font-extrabold text-[#003527] max-w-[80px] truncate leading-tight">{currentUser.username}</span>
                      <button 
                        onClick={handleLogout}
                        className="text-[10px] text-red-600 font-bold hover:underline self-start leading-none mt-0.5 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-l border-[#bfc9c3]/30 pl-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateToScreen(ActiveScreen.LOGIN)}
                      className="text-xs font-bold text-[#404944] hover:text-[#003527] transition-all cursor-pointer"
                    >
                      Sign In
                    </motion.button>
                    <span className="text-slate-300">|</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateToScreen(ActiveScreen.REGISTER)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-all cursor-pointer"
                    >
                      Join
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Screen Render Switch with smooth transition wrapper */}
      <Suspense fallback={<ScreenLoader />}>
        <AnimatePresence mode="wait">
          {activeScreen === ActiveScreen.LANDING && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingScreen
                onNavigate={navigateToScreen}
                onReportSighting={() => setIsReportModalOpen(true)}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenAuth={(tab) => navigateToScreen(tab === "login" ? ActiveScreen.LOGIN : ActiveScreen.REGISTER)}
                onSelectSpecies={handleSelectSpeciesFromMap}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                sightings={sightings}
                customGuides={customGuides}
                onSelectSighting={(id) => {
                  setFocusedSightingId(id);
                  navigateToScreen(ActiveScreen.MAP);
                }}
              />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.MAP && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <MapScreen
                sightings={sightings}
                onNavigate={navigateToScreen}
                onSelectSpecies={handleSelectSpeciesFromMap}
                onReportSighting={() => setIsReportModalOpen(true)}
                onAddSightingDirectly={handleAddSightingDirectly}
                onUpdateSighting={handleUpdateSighting}
                theme={theme}
                isFullscreen={mapFullscreen}
                onToggleFullscreen={setMapFullscreen}
                initialSelectedSightingId={focusedSightingId}
              />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.HQ && (
            <motion.div
              key="hq"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <HqDashboard
                onNavigate={navigateToScreen}
                onReportSighting={() => setIsReportModalOpen(true)}
                streakCount={streakCount}
                totalPoints={totalPoints}
                currentUser={currentUser}
                onOpenAuth={(tab) => navigateToScreen(tab === "login" ? ActiveScreen.LOGIN : ActiveScreen.REGISTER)}
                onUpdateUser={handleUpdateUser}
                sightings={sightings}
                customGuides={customGuides}
                theme={theme}
              />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.GUIDE && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <FieldGuideScreen
                onNavigate={navigateToScreen}
                selectedSpeciesName={selectedSpeciesName}
                onReportSighting={() => setIsReportModalOpen(true)}
                customGuides={customGuides}
                onAddCustomGuide={handleAddCustomGuide}
                theme={theme}
              />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.SANDBOX && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-24 pb-12 max-w-[1280px] mx-auto px-6 md:px-16"
            >
              <EcosystemSandbox theme={theme} />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.LOGIN && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <LoginPage
                onNavigate={navigateToScreen}
                onAuthSuccess={handleAuthSuccess}
                theme={theme}
              />
            </motion.div>
          )}

          {activeScreen === ActiveScreen.REGISTER && (
            <motion.div
              key="register"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <RegisterPage
                onNavigate={navigateToScreen}
                onAuthSuccess={handleAuthSuccess}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>

      {/* Sighting Multi-Step Overlay Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {isReportModalOpen && (
            <ReportSightingModal
              onClose={() => setIsReportModalOpen(false)}
              onSightingConfirmed={handleSightingConfirmed}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </main>
  );
}
