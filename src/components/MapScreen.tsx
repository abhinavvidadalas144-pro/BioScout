import React, { useState, useRef, useEffect } from "react";
import { ActiveScreen, Sighting } from "../types";
import { IMAGES } from "../assets";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ShareSightingModal from "./ShareSightingModal";

// --- Dynamic Web Audio Nature Ambiance Synthesizer ---
class NatureAmbianceSynth {
  private ctx: AudioContext | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private chirpTimer: any = null;
  private isPlaying = false;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.isPlaying = true;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.24, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Wind Noise Buffer Generation (2 seconds)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = "lowpass";
      this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.filterNode.frequency.setValueAtTime(250, this.ctx.currentTime);

      whiteNoise.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      whiteNoise.start();

      // slow organic wind modulation
      const modulateWind = () => {
        if (!this.isPlaying || !this.filterNode || !this.ctx) return;
        const targetFreq = 160 + Math.random() * 220;
        const duration = 2.5 + Math.random() * 3.5;
        this.filterNode.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + duration);
        this.chirpTimer = setTimeout(modulateWind, duration * 1000);
      };
      modulateWind();

      // Random natural animal sounds loop
      const playRandomSound = () => {
        if (!this.isPlaying || !this.ctx) return;
        if (Math.random() < 0.45) {
          this.synthesizeBird();
        } else {
          this.synthesizeCricket();
        }
        this.chirpTimer = setTimeout(playRandomSound, 4000 + Math.random() * 6000);
      };
      playRandomSound();

    } catch (e) {
      console.error("Failed to start nature ambiance:", e);
    }
  }

  private synthesizeBird() {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.24);
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.035, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.005, now + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    
    osc.connect(g);
    g.connect(this.gainNode);
    
    osc.start(now);
    osc.stop(now + 0.27);
  }

  private synthesizeCricket() {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const g = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(4300, now);
    
    mod.type = "sawtooth";
    mod.frequency.setValueAtTime(13, now);
    modGain.gain.setValueAtTime(250, now);
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.015, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.007, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    
    mod.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(g);
    g.connect(this.gainNode);
    
    mod.start(now);
    osc.start(now);
    
    mod.stop(now + 0.41);
    osc.stop(now + 0.41);
  }

  stop() {
    this.isPlaying = false;
    if (this.chirpTimer) {
      clearTimeout(this.chirpTimer);
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.filterNode = null;
    this.gainNode = null;
  }
}

interface MapScreenProps {
  sightings: Sighting[];
  onNavigate: (screen: ActiveScreen) => void;
  onSelectSpecies: (speciesName: string) => void;
  onReportSighting: () => void;
  onAddSightingDirectly?: (sighting: Sighting) => void;
  onUpdateSighting?: (sighting: Sighting) => void;
  theme?: "light" | "night";
  isFullscreen?: boolean;
  onToggleFullscreen?: (val: boolean) => void;
  initialSelectedSightingId?: string;
}

// In-app species database for catalog search and direct map deployment
const TAXONOMIC_DATABASE = [
  {
    speciesName: "Poison Dart Frog",
    scientificName: "Oophaga pumilio",
    kingdom: "animalia",
    category: "Fauna",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_GLNVdDeMP3lk8SDdvomq7Bt1CyboiiduGNJ_4g-UGPSrvJZCp9GscqXr6kdGdWPLlA1pHyr4VfB3tzL98-lIh-vYVb2G5wIcjvXxgxHl7PquOOOoGk3-jgu9MaB9v-G2rWHoZd2lDLQY1YuiqYNp3O6lFoZaaTLlav9QJOxDa7w_91zTCm2eoO0oTy9cf_mrY957glomVUzSbTW7dPo7s-2-P6jKxcFuMuBfmBPiPlvYosEQqqjIiE1JZJmEiJWNhRDOQ6QqtNvD",
    description: "Highly toxic bright red amphibian with denim-blue legs, indicating warning coloration.",
    confidence: 97,
    notes: "Active near damp fallen leaves. High toxicity protects it from local rainforest predators."
  },
  {
    speciesName: "Jaguar",
    scientificName: "Panthera onca",
    kingdom: "animalia",
    category: "Fauna",
    image: IMAGES.snowLeopard,
    description: "Apex neotropical cat characterized by powerful jaws and rosetted jungle camouflage.",
    confidence: 95,
    notes: "Prowling near riverbed coordinates. Moves with complete sound isolation and absolute grace."
  },
  {
    speciesName: "Pink River Dolphin",
    scientificName: "Inia geoffrensis",
    kingdom: "animalia",
    category: "Fauna",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCSSal4hAKu_BpQg4T6Pst86pFDQbbV60Jc7VlNtMoaIRigohWced41Mq_sDnZdx4v1KlJqYH3qMb4WjbVpqI8xDJpqQGfisNXVwRj2GeE9MZh1IHcjV8FVM1QvfGoP2OyydUiJYU-cKZkp5vlypPM8qAEOI4BTOYNCHuYvzLKuALMut5kaM3BcDibdCijn-1TMGGJ-CRnGTYeAw6tqPlTB8uY87k6tUXqQ6ZDks_FY_-20HqxxS7QKoETShly070zDsvQsGZMUVhb",
    description: "Freshwater dolphin native to the Amazon, known for its distinctive pink coloration and curious nature.",
    confidence: 98,
    notes: "Spotted hunting in group near river tributary junction. Very friendly interactions with trackers."
  },
  {
    speciesName: "Three-Toed Sloth",
    scientificName: "Bradypus variegatus",
    kingdom: "animalia",
    category: "Fauna",
    image: IMAGES.archiveMount,
    description: "Extremely slow-moving arboreal mammal that hosts green algae symbiotic networks on its fur.",
    confidence: 91,
    notes: "Hanging from cecropia branch. Extremely slow response times, well camouflaged in the forest canopy."
  },
  {
    speciesName: "Amazon Giant Otter",
    scientificName: "Pteronura brasiliensis",
    kingdom: "animalia",
    category: "Fauna",
    image: IMAGES.snowLeopard,
    description: "Social aquatic carnivore with unique cream-colored throat markings and high-pitched vocal arrays.",
    confidence: 93,
    notes: "Active family group swimming near the oxbow lake borders. Highly territorial behavior observed."
  },
  {
    speciesName: "Harpy Eagle",
    scientificName: "Harpia harpyja",
    kingdom: "animalia",
    category: "Fauna",
    image: IMAGES.blueEmperor,
    description: "Apex canopy raptor with majestic double crest, specialized in silent canopy tracking.",
    confidence: 92,
    notes: "Resting on primary brazil nut branch. Excellent facial disc acoustic focal properties."
  },
  {
    speciesName: "Squirrel Monkey",
    scientificName: "Saimiri sciureus",
    kingdom: "animalia",
    category: "Fauna",
    image: IMAGES.monarchButterfly,
    description: "Small, highly active canopy primate foraging in large, expressive social troops.",
    confidence: 96,
    notes: "Observed gathering in high-understory berry branches. High alert alarm calls emitted upon predator sight."
  },
  {
    speciesName: "Kapok Tree",
    scientificName: "Ceiba pentandra",
    kingdom: "plantae",
    category: "Flora",
    image: IMAGES.giantTreeFern,
    description: "Emergent rain forest canopy giant growing over 60m, forming vital ecological micro-habitats.",
    confidence: 100,
    notes: "Deep root flare stabilization. Provides canopy shelters for hundreds of insect and orchid species."
  },
  {
    speciesName: "Pitcher Plant",
    scientificName: "Nepenthes rafflesiana",
    kingdom: "plantae",
    category: "Flora",
    image: IMAGES.cloudForestOrchid,
    description: "Carnivorous slippery pitcher adapted to trap and digest insects in nutrient-scarce biomes.",
    confidence: 99,
    notes: "Fluid enzyme reserves in excellent condition. Prominent crimson peristome visible."
  },
  {
    speciesName: "Heliconia Flower",
    scientificName: "Heliconia rostrata",
    kingdom: "plantae",
    category: "Flora",
    image: IMAGES.cloudForestOrchid,
    description: "Stunning neon-red downward-curving lobster-claw flower bracts that feed tropical hummingbirds.",
    confidence: 96,
    notes: "Pristine bloom clusters. Nectar wells are fully saturated and actively drawing pollinators."
  }
];

// Landmark points to overlay on the map
const GEOGRAPHIC_LANDMARKS = [
  { name: "Manaus BioStation Delta", lat: -3.1190, lng: -60.0217, icon: "biotech" },
  { name: "Canopy Research Tower A", lat: -3.0950, lng: -59.9800, icon: "settings_input_antenna" },
  { name: "Protected Jaguar Reserve", lat: -3.0750, lng: -59.9400, icon: "nature" },
  { name: "Rio Negro Tributary", lat: -3.1550, lng: -60.0600, icon: "waves" },
  { name: "Cloud Forest Boundary", lat: -3.0900, lng: -60.0100, icon: "filter_hdr" }
];

export default function MapScreen({
  sightings,
  onNavigate,
  onSelectSpecies,
  onReportSighting,
  onAddSightingDirectly,
  onUpdateSighting,
  theme = "light",
  isFullscreen = false,
  onToggleFullscreen,
  initialSelectedSightingId
}: MapScreenProps) {
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(() => {
    if (initialSelectedSightingId) {
      const found = sightings.find(s => s.id === initialSelectedSightingId);
      if (found) return found;
    }
    return sightings[0] || null;
  });

  // Focus on searched sighting reactively
  useEffect(() => {
    if (initialSelectedSightingId && mapRef.current) {
      const found = sightings.find(s => s.id === initialSelectedSightingId);
      if (found) {
        setSelectedSighting(found);
        const latlng = getSightingLatLng(found);
        mapRef.current.setView(latlng, 14);
      }
    }
  }, [initialSelectedSightingId, sightings]);

  const [kingdomFilter, setKingdomFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"pins" | "catalog">("pins");
  const [zoomLevel, setZoomLevel] = useState<number>(11);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState<boolean>(false);

  // Share Modal & Environmental Note States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteCoords, setNoteCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [noteType, setNoteType] = useState("Water Source");
  const [noteContent, setNoteContent] = useState("");

  // Map view theme: 'satellite' | 'topographic' | 'thermal' (technical dark map)
  const [mapStyle, setMapStyle] = useState<"satellite" | "topographic" | "thermal">("topographic");

  // Interactive Legend Toggles for Improved Data Exploration
  const [visibleRarityTiers, setVisibleRarityTiers] = useState<Record<string, boolean>>({
    Common: true,
    Uncommon: true,
    Rare: true,
    Legendary: true,
  });
  const [showHeatMapOverlay, setShowHeatMapOverlay] = useState<boolean>(true);
  const [showLandmarksLayer, setShowLandmarksLayer] = useState<boolean>(true);
  const [showEnvironmentalNotes, setShowEnvironmentalNotes] = useState<boolean>(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  const getSpeciesRarity = (name: string): "Common" | "Uncommon" | "Rare" | "Legendary" => {
    const norm = name.toLowerCase();
    if (norm.includes("morpho") || norm.includes("heliconia")) return "Common";
    if (norm.includes("orchid") || norm.includes("sloth") || norm.includes("monkey")) return "Uncommon";
    if (norm.includes("dolphin") || norm.includes("otter") || norm.includes("pitcher") || norm.includes("frog")) return "Rare";
    if (norm.includes("leopard") || norm.includes("jaguar") || norm.includes("eagle") || norm.includes("fern") || norm.includes("kapok")) return "Legendary";
    return "Common";
  };

  // Active sound state
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("bioscout_sound_enabled") === "true";
  });
  const synthRef = useRef<NatureAmbianceSynth | null>(null);

  useEffect(() => {
    if (isSoundEnabled) {
      if (!synthRef.current) {
        synthRef.current = new NatureAmbianceSynth();
      }
      synthRef.current.start();
    } else {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    }
    localStorage.setItem("bioscout_sound_enabled", isSoundEnabled ? "true" : "false");

    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    };
  }, [isSoundEnabled]);

  // Active placement mode state
  const [placementSpecies, setPlacementSpecies] = useState<typeof TAXONOMIC_DATABASE[0] | null>(null);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Use a ref for placementSpecies so that the leaflet map click callback always has access to the freshest state
  const placementSpeciesRef = useRef<typeof TAXONOMIC_DATABASE[0] | null>(null);
  useEffect(() => {
    placementSpeciesRef.current = placementSpecies;
  }, [placementSpecies]);

  // Translate static coords to Leaflet [Lat, Lng]
  const getSightingLatLng = (s: Sighting): [number, number] => {
    if (s.lat !== undefined && s.lng !== undefined) {
      return [s.lat, s.lng];
    }
    // Fallback based on s.coords
    if (s.coords) {
      const topVal = parseFloat(s.coords.top) / 100;
      const leftVal = parseFloat(s.coords.left) / 100;
      // Map percentages around the center bio-station
      const lat = -3.1190 + (0.5 - topVal) * 0.15;
      const lng = -60.0217 + (leftVal - 0.5) * 0.15;
      return [lat, lng];
    }
    return [-3.1190, -60.0217];
  };

  const filteredSightings = sightings.filter((s) => {
    // Kingdom filter
    if (kingdomFilter !== "all") {
      const isPlant = s.speciesName === "Giant Tree Fern" || s.speciesName === "Cloud Forest Orchid" || s.speciesName === "Kapok Tree" || s.speciesName === "Pitcher Plant" || s.speciesName === "Heliconia Flower";
      const sKingdom = isPlant ? "plantae" : "animalia";
      if (sKingdom !== kingdomFilter) return false;
    }
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "verified" && !s.verified) return false;
      if (statusFilter === "pending" && s.verified) return false;
    }
    // Rarity Tier or Note check
    const isNote = s.scientificName === "Environmental Landmark";
    if (isNote) {
      if (!showEnvironmentalNotes) return false;
    } else {
      const rarity = getSpeciesRarity(s.speciesName);
      if (!visibleRarityTiers[rarity]) return false;
    }
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.speciesName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter taxonomic database
  const filteredCatalog = TAXONOMIC_DATABASE.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.speciesName.toLowerCase().includes(q) ||
        item.scientificName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Zoom helpers
  const zoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };
  const zoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };
  const resetMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([-3.1190, -60.0217], 11);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Center at Amazon rainforest basin (Manaus coordinates)
    const map = L.map(mapContainerRef.current, {
      center: [-3.1190, -60.0217],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    mapRef.current = map;
    setZoomLevel(map.getZoom());

    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    // Create marker groups
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    const landmarksLayer = L.layerGroup().addTo(map);
    landmarksLayerRef.current = landmarksLayer;

    const heatLayer = L.layerGroup().addTo(map);
    heatLayerRef.current = heatLayer;

    // Handle Map click for exact pin deployment
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (placementSpeciesRef.current) {
        deploySightingAtLatLng(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map tile styles reactively
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = "";
    let attribution = "";
    if (mapStyle === "satellite") {
      // High-res Esri Satellite World Imagery
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri";
    } else if (mapStyle === "topographic") {
      // OpenTopoMap
      url = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attribution = "Tiles &copy; OpenTopoMap";
    } else {
      // Canopy Heat / Thermal (using high-contrast technical CartoDB Dark Matter)
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attribution = "Tiles &copy; CartoDB";
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom: 18,
      attribution
    });

    tileLayer.addTo(mapRef.current);
    tileLayerRef.current = tileLayer;
  }, [mapStyle]);

  // Update Landmarks layer reactively based on Interactive Legend
  useEffect(() => {
    if (!landmarksLayerRef.current) return;
    landmarksLayerRef.current.clearLayers();

    if (showLandmarksLayer) {
      GEOGRAPHIC_LANDMARKS.forEach((landmark) => {
        const landmarkHtml = `
          <div class="flex items-center gap-1.5 whitespace-nowrap bg-zinc-950/90 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-md">
            <div class="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center">
              <span class="material-symbols-outlined text-[10px] text-emerald-400">${landmark.icon}</span>
            </div>
            <span class="text-[8px] font-extrabold uppercase tracking-widest text-emerald-300">
              ${landmark.name}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: landmarkHtml,
          className: "custom-landmark-marker",
          iconSize: [120, 24],
          iconAnchor: [60, 12]
        });

        L.marker([landmark.lat, landmark.lng], { icon: customIcon }).addTo(landmarksLayerRef.current!);
      });
    }
  }, [showLandmarksLayer]);

  // Draw Heatmap Overlay circles reactively
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current) return;
    heatLayerRef.current.clearLayers();

    if (showHeatMapOverlay) {
      sightings.forEach((s) => {
        const latlng = getSightingLatLng(s);
        const isPlant = s.speciesName === "Giant Tree Fern" || s.speciesName === "Cloud Forest Orchid" || s.speciesName === "Kapok Tree" || s.speciesName === "Pitcher Plant" || s.speciesName === "Heliconia Flower";
        const heatColor = isPlant ? "#10b981" : "#f59e0b"; // Emerald green for flora, warm orange for fauna

        // Outer glow
        L.circle(latlng, {
          radius: 1200,
          color: "transparent",
          fillColor: heatColor,
          fillOpacity: 0.12,
          interactive: false
        }).addTo(heatLayerRef.current!);

        // Inner core
        L.circle(latlng, {
          radius: 400,
          color: "transparent",
          fillColor: heatColor,
          fillOpacity: 0.28,
          interactive: false
        }).addTo(heatLayerRef.current!);
      });
    }
  }, [sightings, showHeatMapOverlay]);

  // Redraw Markers whenever filteredSightings or selectedSighting changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    filteredSightings.forEach((s) => {
      const latlng = getSightingLatLng(s);
      const isSelected = selectedSighting?.id === s.id;
      
      const isNote = s.scientificName === "Environmental Landmark";
      const isInanimate = s.scientificName === "Inanimata" || s.scientificName === "Non-Biological";
      const isPlant = !isNote && !isInanimate && (s.speciesName === "Giant Tree Fern" || s.speciesName === "Cloud Forest Orchid" || s.speciesName === "Kapok Tree" || s.speciesName === "Pitcher Plant" || s.speciesName === "Heliconia Flower");

      let iconName = "flutter_dash";
      if (isNote) {
        if (s.speciesName === "Water Source") iconName = "water_drop";
        else if (s.speciesName === "Animal Tracks") iconName = "pets";
        else if (s.speciesName === "Camp Site") iconName = "explore";
        else if (s.speciesName === "Hazard") iconName = "warning";
        else iconName = "sticky_note_2";
      } else if (isInanimate) {
        iconName = "device_unknown";
      } else {
        iconName = isPlant ? "eco" : "flutter_dash";
      }

      // Styles
      const borderClass = isNote 
        ? "border-blue-400" 
        : isInanimate
          ? "border-zinc-500 text-zinc-400"
          : s.verified 
            ? "border-emerald-400" 
            : "border-amber-400";
            
      const badgeBg = isSelected 
        ? isNote
          ? "bg-blue-500 border-white text-white scale-125 z-50 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
          : isInanimate
            ? "bg-zinc-600 border-white text-white scale-125 z-50 shadow-[0_0_15px_rgba(113,113,122,0.8)]"
            : "bg-emerald-500 border-white text-white scale-125 z-50 shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
        : isNote
          ? `bg-[#0f2a4a]/95 border-2 hover:scale-110 ${borderClass} text-blue-400`
          : isInanimate
            ? `bg-zinc-900 border-2 border-zinc-500 text-zinc-400 hover:scale-110`
            : `bg-zinc-950/95 border-2 hover:scale-110 ${borderClass} ${s.verified ? "text-emerald-400" : "text-amber-400"}`;

      const isNew = !isNaN(Number(s.id)) || s.id.startsWith("note-") || (s.id && isNaN(Number(s.id)));
      const pulseColor = isNote ? "bg-blue-400" : isInanimate ? "bg-zinc-500" : s.verified ? "bg-emerald-400" : "bg-amber-400";
      const pulseBorder = isNote ? "border-blue-400/80" : isInanimate ? "border-zinc-500/80" : s.verified ? "border-emerald-400/80" : "border-amber-400/80";

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-all">
          <div class="absolute -inset-2 rounded-full animate-ping opacity-25 ${pulseColor}"></div>
          ${isNew ? `
            <div class="absolute w-12 h-12 rounded-full border-2 ${pulseBorder} animate-new-pulse-1 pointer-events-none"></div>
            <div class="absolute w-12 h-12 rounded-full border-2 ${pulseBorder} animate-new-pulse-2 pointer-events-none"></div>
          ` : ""}
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-[0_3px_12px_rgba(0,0,0,0.6)] transition-all ${badgeBg}">
            <span class="material-symbols-outlined" style="font-size: 16px;">
              ${iconName}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Enable marker dragging and assign custom icon
      const marker = L.marker(latlng, { 
        icon: customIcon,
        draggable: true
      });

      // Bind a highly interactive Leaflet pop-up details card to the marker
      const isLeastConcern = s.verified;
      const popupHtml = `
        <div class="p-2 text-[#003527] font-sans min-w-[200px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2 h-2 rounded-full ${isLeastConcern ? "bg-emerald-500" : "bg-amber-500"}"></span>
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#404944]">
              ${isLeastConcern ? "Verified Spotting" : "Pending Verification"}
            </span>
          </div>
          <div class="font-extrabold text-sm text-[#003527] font-display">${s.speciesName}</div>
          <div class="text-[9px] text-emerald-700 italic font-medium font-mono mb-2">${s.scientificName}</div>
          <p class="text-[11px] text-[#404944] leading-relaxed line-clamp-2 mb-2 bg-[#f4f4f3]/60 p-1.5 rounded-lg border border-slate-100">${s.notes || "Local ecological tracker observation records."}</p>
          <div class="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 mt-1.5 pt-1 border-t border-slate-100">
            <span class="truncate pr-1">${s.location.split(' (')[0]}</span>
            <span class="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded shrink-0 uppercase font-extrabold">${s.reporter.replace('Agent ', '').replace('Senior Tracker ', '')}</span>
          </div>
          <div class="text-[8px] text-amber-600 font-extrabold mt-1.5 uppercase tracking-widest text-center bg-amber-50 py-1 rounded border border-amber-200/30">
            ✥ Drag pin to relocate position
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -8]
      });

      // Handle drag end to update coordinates
      marker.on("dragend", (e: L.LeafletEvent) => {
        const target = e.target as L.Marker;
        const newLatLng = target.getLatLng();
        
        const updatedSighting: Sighting = {
          ...s,
          lat: newLatLng.lat,
          lng: newLatLng.lng,
          location: `Amazon Quadrant (${newLatLng.lat.toFixed(4)}°S, ${newLatLng.lng.toFixed(4)}°W)`
        };

        if (onUpdateSighting) {
          onUpdateSighting(updatedSighting);
        }
        
        setSelectedSighting(updatedSighting);
      });

      // Click callback
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedSighting(s);
        // Pan smoothly to selected sighting
        if (mapRef.current) {
          mapRef.current.panTo(latlng);
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredSightings, selectedSighting]);

  const handleDropNoteAtCurrentLocation = () => {
    const handleSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setNoteCoords({ lat, lng });
      setIsNoteModalOpen(true);
    };

    const handleFailure = () => {
      let centerLat = -3.1190;
      let centerLng = -60.0217;
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        centerLat = center.lat;
        centerLng = center.lng;
      }
      setNoteCoords({ lat: centerLat, lng: centerLng });
      setIsNoteModalOpen(true);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleFailure, {
        timeout: 5000,
        enableHighAccuracy: true
      });
    } else {
      handleFailure();
    }
  };

  const handleDeployNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteCoords) return;

    let imageLink = "https://images.unsplash.com/photo-1438786657495-640937046d18?auto=format&fit=crop&q=80&w=600";
    if (noteType === "Water Source") {
      imageLink = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600";
    } else if (noteType === "Animal Tracks") {
      imageLink = "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=600";
    } else if (noteType === "Camp Site") {
      imageLink = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600";
    } else if (noteType === "Hazard") {
      imageLink = "https://images.unsplash.com/photo-1518098268026-4e43a1a009de?auto=format&fit=crop&q=80&w=600";
    }

    const newNoteSighting: Sighting = {
      id: "note-" + Date.now().toString(),
      speciesName: noteType,
      scientificName: "Environmental Landmark",
      location: `Amazon Quadrant (${noteCoords.lat.toFixed(4)}°S, ${noteCoords.lng.toFixed(4)}°W)`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reporter: "Field Agent (You)",
      confidence: 100,
      image: imageLink,
      verified: true,
      notes: noteContent || `Environmental note marking an observation of: ${noteType}.`,
      lat: noteCoords.lat,
      lng: noteCoords.lng
    };

    if (onAddSightingDirectly) {
      onAddSightingDirectly(newNoteSighting);
    }

    setSelectedSighting(newNoteSighting);
    setIsNoteModalOpen(false);
    setNoteContent("");
    setActiveSidebarTab("pins");

    if (mapRef.current) {
      mapRef.current.setView([noteCoords.lat, noteCoords.lng], 12);
    }
  };

  // Handle tactical on-map click placement
  const deploySightingAtLatLng = (lat: number, lng: number) => {
    if (!placementSpecies) return;

    const newSighting: Sighting = {
      id: Date.now().toString(),
      speciesName: placementSpecies.speciesName,
      scientificName: placementSpecies.scientificName,
      location: `Amazon Quadrant (${lat.toFixed(4)}°S, ${lng.toFixed(4)}°W)`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reporter: "Field Agent (You)",
      confidence: placementSpecies.confidence,
      image: placementSpecies.image,
      verified: true, // Auto-verified by direct coordinate deployment
      notes: placementSpecies.notes,
      lat,
      lng
    };

    if (onAddSightingDirectly) {
      onAddSightingDirectly(newSighting);
    }

    setSelectedSighting(newSighting);
    setPlacementSpecies(null);
    setActiveSidebarTab("pins");

    // Recenter
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 12);
    }
  };

  // Quick Add handler to instantly spawn a species in the viewport center
  const handleQuickAdd = (item: typeof TAXONOMIC_DATABASE[0]) => {
    let center: [number, number] = [-3.1190, -60.0217];
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      center = [currentCenter.lat, currentCenter.lng];
    }

    // Add a tiny random jitter so multiple additions don't overlap perfectly
    const jitterLat = (Math.random() - 0.5) * 0.012;
    const jitterLng = (Math.random() - 0.5) * 0.012;
    const finalLat = center[0] + jitterLat;
    const finalLng = center[1] + jitterLng;

    const newSighting: Sighting = {
      id: Date.now().toString(),
      speciesName: item.speciesName,
      scientificName: item.scientificName,
      location: `Amazon Sector (${finalLat.toFixed(4)}°S, ${finalLng.toFixed(4)}°W)`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reporter: "Field Agent (You)",
      confidence: item.confidence,
      image: item.image,
      verified: true,
      notes: `Observed during high-fidelity patrol sweep. ${item.notes || ""}`,
      lat: finalLat,
      lng: finalLng
    };

    if (onAddSightingDirectly) {
      onAddSightingDirectly(newSighting);
    }

    setSelectedSighting(newSighting);
    setActiveSidebarTab("pins");

    if (mapRef.current) {
      mapRef.current.setView([finalLat, finalLng], 12);
    }
  };

  return (
    <div className={`bg-[#111313] text-[#f4f4f3] min-h-screen relative overflow-hidden flex flex-col md:flex-row font-sans transition-all duration-300 ${isFullscreen ? "" : "pt-20"}`}>
      
      {/* Side Filters and Search Catalog Bar */}
      <aside className={`transition-all duration-300 z-10 flex flex-col overflow-y-auto bg-[#1a1c1c]/95 border-[#bfc9c3]/15 ${
        isConsoleMinimized
          ? "w-0 p-0 h-0 border-b-0 md:border-r-0 md:h-screen overflow-hidden opacity-0 pointer-events-none"
          : `w-full md:w-80 p-5 border-b md:border-b-0 md:border-r gap-5 pt-6 ${
              isFullscreen ? "md:h-screen" : "md:h-[calc(100vh-80px)]"
            }`
      }`}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 cursor-pointer text-emerald-400" onClick={() => onNavigate(ActiveScreen.LANDING)}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="font-semibold text-xs uppercase tracking-wider">Back</span>
            </div>
            <button
              onClick={() => setIsConsoleMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-[#272a29] text-[#8d928f] hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Minimize Console"
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">Grid Map Console</h2>
          <p className="text-xs text-[#8d928f] mt-1">Real-time telemetry and species deployer.</p>
        </div>

        {/* Console Mode Selection Tabs */}
        <div className="grid grid-cols-2 bg-[#272a29] p-1 rounded-xl border border-[#bfc9c3]/10">
          <button
            onClick={() => {
              setActiveSidebarTab("pins");
              setPlacementSpecies(null);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSidebarTab === "pins"
                ? "bg-emerald-600 text-white shadow-lg font-extrabold"
                : "text-[#8d928f] hover:text-[#bfc9c3]"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">map</span> Active Pins ({filteredSightings.length})
          </button>
          <button
            onClick={() => setActiveSidebarTab("catalog")}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSidebarTab === "catalog"
                ? "bg-emerald-600 text-white shadow-lg font-extrabold"
                : "text-[#8d928f] hover:text-[#bfc9c3]"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">library_add</span> Search & Add
          </button>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder={activeSidebarTab === "pins" ? "Search active pins..." : "Search Taxonomic DB..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#272a29] border border-[#bfc9c3]/20 rounded-xl px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-[#8d928f]"
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-xs text-[#8d928f]">search</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2 text-[#8d928f] hover:text-white">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Global Filter Drawer (Only visible when active tab is 'pins') */}
        {activeSidebarTab === "pins" && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8d928f] mb-1.5">Kingdom Filter</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["all", "animalia", "plantae"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKingdomFilter(k)}
                    className={`py-1 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                      kingdomFilter === k
                        ? "bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow"
                        : "bg-[#272a29] border-transparent text-[#bfc9c3] hover:bg-[#343836]"
                    }`}
                  >
                    {k === "all" ? "All" : k === "animalia" ? "Fauna" : "Flora"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8d928f] mb-1.5">Status Verification</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#272a29] border border-[#bfc9c3]/20 rounded-xl px-3 py-1.5 text-xs text-[#bfc9c3] focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Pin Conditions</option>
                <option value="verified">Verified Observations</option>
                <option value="pending">Pending Validation</option>
              </select>
            </div>
          </div>
        )}

        {/* Sidebar Tab Render Panels */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          {activeSidebarTab === "pins" ? (
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d928f] mb-2.5 block">Active Sightings ({filteredSightings.length})</span>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] md:max-h-[calc(100vh-420px)] scrollbar-thin pr-1">
                {filteredSightings.length === 0 ? (
                  <div className="p-6 bg-[#272a29]/30 rounded-xl border border-dashed border-[#bfc9c3]/15 text-center">
                    <span className="material-symbols-outlined text-teal-700 block mb-1">travel_explore</span>
                    <p className="text-[10px] text-[#8d928f]">No matching telemetry found.</p>
                  </div>
                ) : (
                  filteredSightings.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSighting(s);
                        const latlng = getSightingLatLng(s);
                        if (mapRef.current) mapRef.current.setView(latlng, 12);
                      }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 items-center border ${
                        selectedSighting?.id === s.id
                          ? "bg-emerald-950/40 border-emerald-500/50 shadow-md"
                          : "bg-[#272a29]/40 border-transparent hover:bg-[#272a29]"
                      }`}
                    >
                      <img src={s.image} alt={s.speciesName} className="w-10 h-10 object-cover rounded-lg border border-[#bfc9c3]/10" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">{s.speciesName}</div>
                        <div className="text-[9px] text-emerald-400 italic truncate">{s.scientificName}</div>
                        <div className="text-[9px] text-[#8d928f] truncate mt-0.5">{s.location}</div>
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        s.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {s.verified ? "OK" : "PEND"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="mb-2 bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-2.5 text-[10px] text-emerald-300 leading-normal">
                <span className="font-extrabold uppercase block text-white mb-0.5 font-mono">💡 ADD OPTIONS</span>
                Choose <b>Quick Add</b> to place directly near map center, or <b>Deploy Pin</b> to select custom coordinates on the map.
              </div>

              {/* Environmental Note Pin Quick Entry */}
              <div className="mb-4 bg-blue-950/30 border border-blue-800/35 rounded-xl p-3 text-[11px] text-blue-200 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center gap-1.5 font-bold text-white uppercase font-mono text-[10px]">
                  <span className="material-symbols-outlined text-[15px] text-blue-400">sticky_note_2</span>
                  <span>Environmental Note Pin</span>
                </div>
                <p className="text-[9px] text-slate-300 leading-snug">Mark field observations like water sources, animal tracks, hazards, or base camps.</p>
                <button
                  onClick={handleDropNoteAtCurrentLocation}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">add_location_alt</span>
                  Drop Environmental Note
                </button>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d928f] mb-2 block">Taxonomic DB Catalog ({filteredCatalog.length})</span>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] md:max-h-[calc(100vh-420px)] scrollbar-thin pr-1">
                {filteredCatalog.map((item) => {
                  const isSelectedForDeploy = placementSpecies?.speciesName === item.speciesName;
                  return (
                    <div
                      key={item.speciesName}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSelectedForDeploy
                          ? "bg-emerald-950/60 border-emerald-500"
                          : "bg-[#272a29]/40 border-[#bfc9c3]/5 hover:bg-[#272a29]"
                      }`}
                    >
                      <div className="flex gap-2.5 items-center">
                        <img src={item.image} alt={item.speciesName} className="w-10 h-10 object-cover rounded-lg border border-[#bfc9c3]/15" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-white truncate">{item.speciesName}</div>
                          <div className="text-[9px] text-emerald-300 italic truncate">{item.scientificName}</div>
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">{item.category}</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-[#8d928f] mt-2 line-clamp-2">{item.description}</p>
                      
                      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="py-1.5 bg-[#272a29] hover:bg-[#323635] text-white rounded-lg text-[9px] font-bold uppercase tracking-wider border border-[#bfc9c3]/10 active:scale-95 transition-all flex items-center justify-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[12px] text-emerald-400">bolt</span>
                          Quick Add
                        </button>
                        
                        <button
                          onClick={() => setPlacementSpecies(isSelectedForDeploy ? null : item)}
                          className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-0.5 shadow-sm ${
                            isSelectedForDeploy
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isSelectedForDeploy ? "cancel" : "add_location"}
                          </span>
                          {isSelectedForDeploy ? "Cancel" : "Deploy Pin"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onReportSighting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all mt-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_a_photo</span> File Optical Report
        </button>
      </aside>

      {/* Main Draggable / Zoomable Map Viewer Area */}
      <main className={`flex-1 relative w-full select-none overflow-hidden bg-[#071310] flex flex-col transition-all duration-300 ${
        isFullscreen ? "h-screen md:h-screen" : "h-[60vh] md:h-[calc(100vh-80px)]"
      }`}>
        
        {/* Floating Restore Console Button */}
        {isConsoleMinimized && (
          <button
            onClick={() => setIsConsoleMinimized(false)}
            className="absolute top-4 left-4 z-[2000] bg-[#1a1c1c]/95 border border-[#bfc9c3]/30 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-emerald-400 hover:text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center gap-2 hover:bg-[#272a29] transition-all cursor-pointer"
            title="Expand Console"
          >
            <span className="material-symbols-outlined text-[18px]">menu_open</span>
            <span>Expand Console</span>
          </button>
        )}
        
        {/* Placement Mode Top Overlay Banner */}
        <AnimatePresence>
          {placementSpecies && (
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-[#162722]/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center gap-4 max-w-lg text-center"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <p className="text-xs text-white">
                <span className="font-extrabold uppercase tracking-wide text-emerald-400 block sm:inline">Tactical Placement Mode active: </span>
                Click anywhere directly on the map to place your <b>{placementSpecies.speciesName}</b> pin!
              </p>
              <button
                onClick={() => setPlacementSpecies(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retractable Interactive Legend Overlay */}
        <div className="absolute top-4 right-4 z-20 select-none flex flex-col items-end gap-2">
          {isLegendExpanded ? (
            <div className="bg-[#1a1c1c]/95 backdrop-blur-md rounded-2xl border border-[#bfc9c3]/15 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.6)] w-60 animate-fade-in-down">
              <div className="flex items-center justify-between border-b border-[#bfc9c3]/10 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">layers</span>
                  <span className="text-xs font-bold text-white font-display">Interactive Map Legend</span>
                </div>
                <button
                  onClick={() => setIsLegendExpanded(false)}
                  className="p-1 rounded hover:bg-white/5 text-[#8d928f] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Collapse Legend"
                >
                  <span className="material-symbols-outlined text-[14px]">unfold_less</span>
                </button>
              </div>

              {/* Sighting Tiers Toggles */}
              <div className="space-y-1.5 mb-3">
                <span className="block text-[8px] font-black tracking-widest text-[#8d928f] uppercase font-mono mb-1">Sighting Rarity Tiers</span>
                
                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 border border-slate-300"></span>
                    <span className="font-mono text-[9px]">Common</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={visibleRarityTiers.Common}
                    onChange={() => setVisibleRarityTiers(prev => ({ ...prev, Common: !prev.Common }))}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 border border-blue-400"></span>
                    <span className="font-mono text-[9px]">Uncommon</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={visibleRarityTiers.Uncommon}
                    onChange={() => setVisibleRarityTiers(prev => ({ ...prev, Uncommon: !prev.Uncommon }))}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 border border-orange-400"></span>
                    <span className="font-mono text-[9px]">Rare</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={visibleRarityTiers.Rare}
                    onChange={() => setVisibleRarityTiers(prev => ({ ...prev, Rare: !prev.Rare }))}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-400 animate-pulse"></span>
                    <span className="font-mono text-[9px]">Legendary</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={visibleRarityTiers.Legendary}
                    onChange={() => setVisibleRarityTiers(prev => ({ ...prev, Legendary: !prev.Legendary }))}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Layer Overlay Toggles */}
              <div className="space-y-1.5 border-t border-[#bfc9c3]/10 pt-2.5">
                <span className="block text-[8px] font-black tracking-widest text-[#8d928f] uppercase font-mono mb-1">Ecological Layers</span>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px] text-orange-400">grain</span>
                    <span className="font-mono text-[9px]">Canopy Heatmap</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showHeatMapOverlay}
                    onChange={() => setShowHeatMapOverlay(!showHeatMapOverlay)}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px] text-[#6ffbbe]">location_searching</span>
                    <span className="font-mono text-[9px]">Geographic Landmarks</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showLandmarksLayer}
                    onChange={() => setShowLandmarksLayer(!showLandmarksLayer)}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px] text-blue-400">sticky_note_2</span>
                    <span className="font-mono text-[9px]">Environmental Notes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEnvironmentalNotes}
                    onChange={() => setShowEnvironmentalNotes(!showEnvironmentalNotes)}
                    className="w-3.5 h-3.5 rounded border-[#bfc9c3]/20 bg-zinc-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLegendExpanded(true)}
              className="bg-[#1a1c1c]/95 border border-[#bfc9c3]/25 p-3 rounded-xl hover:bg-[#272a29] text-emerald-400 hover:text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
              title="Expand Legend"
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              <span>Map Legend</span>
            </button>
          )}
        </div>

        {/* Off-Grid HUD Status Panel showing current zoom level and offline cache status */}
        <div className="absolute bottom-[64px] right-[72px] z-20 bg-[#1a1c1c]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#bfc9c3]/15 shadow-md flex items-center gap-3 text-[9px] font-mono select-none">
          <div className="flex items-center gap-1 text-[#8d928f]">
            <span className="text-emerald-500 font-extrabold uppercase tracking-widest text-[8px]">ZOOM:</span>
            <span className="text-white font-black">{zoomLevel}x</span>
          </div>
          <div className="w-px h-2.5 bg-[#bfc9c3]/15"></div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-extrabold uppercase tracking-widest text-[8px]">OFF-GRID SYNC ACTIVE</span>
          </div>
        </div>

        {/* Map Style Overlay Toggle controls - placed in bottom-right quadrant with z-20 to avoid header overlaps */}
        <div className="absolute bottom-6 right-[72px] z-20 flex gap-1.5 bg-[#1a1c1c]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#bfc9c3]/15 shadow-lg select-none">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              isSoundEnabled ? "bg-[#003527] text-[#6ffbbe] border border-emerald-500/30" : "text-[#8d928f] hover:text-white"
            }`}
            title="Toggle Nature Sound Ambiance"
          >
            <span className="material-symbols-outlined text-[12px]">{isSoundEnabled ? "volume_up" : "volume_off"}</span>
            <span>{isSoundEnabled ? "Ambiance ON" : "Ambiance OFF"}</span>
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              mapStyle === "satellite" ? "bg-emerald-600 text-white" : "text-[#8d928f] hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle("topographic")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              mapStyle === "topographic" ? "bg-emerald-600 text-white" : "text-[#8d928f] hover:text-white"
            }`}
          >
            Topographic
          </button>
          <button
            onClick={() => setMapStyle("thermal")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              mapStyle === "thermal" ? "bg-emerald-600 text-white" : "text-[#8d928f] hover:text-white"
            }`}
          >
            Canopy Heat
          </button>
        </div>

        {/* LEAFLET INTERACTIVE MAP CONTAINER */}
        <div
          ref={mapContainerRef}
          className="w-full h-full relative"
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        />

        {/* Compass / Map Zoom Panning HUD controls overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[2000]">
          <button
            onClick={() => onToggleFullscreen?.(!isFullscreen)}
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer ${
              isFullscreen
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-[#1a1c1c]/80 border-[#bfc9c3]/15 text-white hover:bg-[#272a29]"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Immersive Fullscreen"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
          <button
            onClick={handleDropNoteAtCurrentLocation}
            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg border border-blue-400/20 flex items-center justify-center hover:brightness-115 transition-all text-white active:scale-90 shadow-lg cursor-pointer"
            title="Drop Environmental Note Pin"
          >
            <span className="material-symbols-outlined text-[20px]">sticky_note_2</span>
          </button>
          <button
            onClick={zoomIn}
            className="w-10 h-10 bg-[#1a1c1c]/80 backdrop-blur-md rounded-lg border border-[#bfc9c3]/15 flex items-center justify-center hover:bg-[#272a29] transition-all text-white active:scale-90 shadow-lg"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 bg-[#1a1c1c]/80 backdrop-blur-md rounded-lg border border-[#bfc9c3]/15 flex items-center justify-center hover:bg-[#272a29] transition-all text-white active:scale-90 shadow-lg"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <button
            onClick={resetMap}
            className="w-10 h-10 bg-[#1a1c1c]/80 backdrop-blur-md rounded-lg border border-[#bfc9c3]/15 flex items-center justify-center hover:bg-[#272a29] transition-all text-emerald-400 active:scale-90 shadow-lg"
            title="Recenter Grid Map"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </button>
        </div>

        {/* Selected Species Detail Popup Card overlay */}
        {selectedSighting && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-[#1a1c1c]/90 backdrop-blur-xl rounded-2xl border border-[#bfc9c3]/15 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-[2000] animate-fade-in-up pr-9">
            <button
              onClick={() => setSelectedSighting(null)}
              className="absolute top-4 right-4 text-[#8d928f] hover:text-white w-6 h-6 rounded-full hover:bg-[#272a29] flex items-center justify-center transition-all cursor-pointer z-10"
              title="Close Details"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <div className="flex gap-4">
              <img
                src={selectedSighting.image}
                alt={selectedSighting.speciesName}
                className="w-24 h-24 object-cover rounded-xl border border-[#bfc9c3]/15 bg-emerald-950/50"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-base text-white truncate font-display">{selectedSighting.speciesName}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/30">
                    {selectedSighting.confidence}% Match
                  </span>
                </div>
                <p className="text-xs text-emerald-300 italic truncate mb-2">{selectedSighting.scientificName}</p>
                <div className="space-y-1 text-[10px] text-[#8d928f]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-500">location_on</span> {selectedSighting.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-500">schedule</span> {selectedSighting.timestamp}
                  </div>
                </div>
              </div>
            </div>

            {selectedSighting.notes && (
              <p className="text-xs text-[#bfc9c3] mt-3 italic line-clamp-3 bg-[#272a29]/30 p-2 rounded-lg border border-[#bfc9c3]/5">
                "{selectedSighting.notes}"
              </p>
            )}

            {/* Reporter Profile Badge */}
            <div className="flex items-center justify-between border-t border-[#bfc9c3]/15 pt-3 mt-3">
              <div className="flex items-center gap-2">
                <img
                  src={IMAGES.youngAsianTracker}
                  alt="Reporter"
                  className="w-6 h-6 rounded-full object-cover border border-[#bfc9c3]/10"
                />
                <span className="text-[10px] text-[#8d928f]">Reported by <span className="font-bold text-white">{selectedSighting.reporter}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="text-[11px] font-bold text-blue-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">share</span>
                  <span>Share</span>
                </button>
                {selectedSighting.scientificName !== "Environmental Landmark" && (
                  <>
                    <span className="text-zinc-700">|</span>
                    <button
                      onClick={() => onSelectSpecies(selectedSighting.speciesName)}
                      className="text-[11px] font-bold text-emerald-400 hover:text-white transition-all flex items-center gap-0.5 cursor-pointer"
                    >
                      View Guide <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Share Sighting Modal */}
      <AnimatePresence>
        {isShareModalOpen && selectedSighting && (
          <ShareSightingModal
            sighting={selectedSighting}
            onClose={() => setIsShareModalOpen(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Environmental Note Placement Modal */}
      <AnimatePresence>
        {isNoteModalOpen && noteCoords && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border ${
                theme === "night" 
                  ? "bg-[#002419] border-emerald-800/40 text-[#6ffbbe]" 
                  : "bg-white border-slate-200 text-[#003527]"
              } shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-base font-display uppercase tracking-wider">Log Field Observation Note</h3>
                <button 
                  onClick={() => setIsNoteModalOpen(false)} 
                  className="text-xs p-1 rounded hover:bg-black/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDeployNote} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-75">Landmark Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Water Source", "Animal Tracks", "Camp Site", "Hazard"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNoteType(type)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          noteType === type
                            ? theme === "night"
                              ? "bg-[#6ffbbe]/20 border-[#6ffbbe] text-[#6ffbbe]"
                              : "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm"
                            : theme === "night"
                              ? "bg-[#001c13] border-emerald-800/20 text-emerald-300"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {type === "Water Source" ? "water_drop" : type === "Animal Tracks" ? "pets" : type === "Camp Site" ? "explore" : "warning"}
                        </span>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-75">Geographic Location</label>
                  <div className={`p-3 rounded-xl text-xs font-mono border ${theme === "night" ? "bg-[#001c13] border-emerald-800/20" : "bg-slate-50 border-slate-200"}`}>
                    LAT: {noteCoords.lat.toFixed(6)}°S<br />
                    LNG: {noteCoords.lng.toFixed(6)}°W
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-75">Observation Notes</label>
                  <textarea
                    required
                    placeholder="Enter water safety, trace status, tracks pattern, obstacle dimensions or general landmark metadata..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className={`w-full rounded-xl border p-3 text-xs focus:outline-none h-24 ${
                      theme === "night"
                        ? "bg-[#001c13] border-emerald-800/20 focus:border-[#6ffbbe] text-white placeholder-emerald-800"
                        : "bg-white border-slate-200 focus:border-emerald-600 text-slate-800 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      theme === "night"
                        ? "border-emerald-800 bg-[#001c13] text-[#6ffbbe]"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center shadow-sm transition-all cursor-pointer ${
                      theme === "night"
                        ? "bg-[#6ffbbe] text-[#001c13] hover:brightness-110"
                        : "bg-emerald-700 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    Deploy Note Pin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
