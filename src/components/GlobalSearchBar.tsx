import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Leaf, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sighting, SpeciesData } from "../types";

interface GlobalSearchBarProps {
  theme: "light" | "night";
  sightings: Sighting[];
  customGuides?: SpeciesData[];
  onSelectSpecies: (name: string) => void;
  onSelectSighting: (id: string) => void;
  onFocusChange?: (focused: boolean) => void;
}

const BASE_SPECIES = [
  { name: "Blue Morpho", scientific: "Morpho menelaus", category: "Insects" },
  { name: "Snow Leopard", scientific: "Panthera uncia", category: "Mammals" },
  { name: "Giant Tree Fern", scientific: "Cyathea cooperi", category: "Flora" },
  { name: "Cloud Forest Orchid", scientific: "Cyrtochilum macranthum", category: "Flora" },
  { name: "Scarlet Macaw", scientific: "Ara macao", category: "Birds" },
  { name: "Poison Dart Frog", scientific: "Oophaga pumilio", category: "Amphibians" },
  { name: "Jaguar", scientific: "Panthera onca", category: "Mammals" },
  { name: "Pink River Dolphin", scientific: "Inia geoffrensis", category: "Mammals" },
  { name: "Three-Toed Sloth", scientific: "Bradypus variegatus", category: "Mammals" },
  { name: "Amazon Giant Otter", scientific: "Pteronura brasiliensis", category: "Mammals" },
  { name: "Harpy Eagle", scientific: "Harpia harpyja", category: "Birds" },
  { name: "Squirrel Monkey", scientific: "Saimiri sciureus", category: "Mammals" },
  { name: "Kapok Tree", scientific: "Ceiba pentandra", category: "Flora" },
  { name: "Pitcher Plant", scientific: "Nepenthes rafflesiana", category: "Flora" },
  { name: "Heliconia Flower", scientific: "Heliconia rostrata", category: "Flora" }
];

interface SearchResult {
  type: "species" | "sighting";
  id: string;
  title: string;
  subtitle: string;
  extra?: string;
}

export default function GlobalSearchBar({
  theme,
  sightings,
  customGuides = [],
  onSelectSpecies,
  onSelectSighting,
  onFocusChange
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Propagate focus changes to parent container
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute search results whenever query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const tempResults: SearchResult[] = [];

    // 1. Gather all species candidates (Base + Custom Guides)
    const allSpeciesMap = new Map<string, { scientific: string; category: string }>();
    BASE_SPECIES.forEach(s => allSpeciesMap.set(s.name, { scientific: s.scientific, category: s.category }));
    customGuides.forEach(s => allSpeciesMap.set(s.speciesName, { scientific: s.scientificName, category: s.category || "Flora" }));

    // Match Species Profiles
    allSpeciesMap.forEach((meta, name) => {
      if (
        name.toLowerCase().includes(cleanQuery) ||
        meta.scientific.toLowerCase().includes(cleanQuery) ||
        meta.category.toLowerCase().includes(cleanQuery)
      ) {
        tempResults.push({
          type: "species",
          id: name,
          title: name,
          subtitle: meta.scientific,
          extra: meta.category
        });
      }
    });

    // 2. Match Sightings Locations
    sightings.forEach(s => {
      const alreadyHasSpecies = tempResults.some(r => r.type === "species" && r.title === s.speciesName);
      const matchesSightingText = 
        s.location.toLowerCase().includes(cleanQuery) || 
        (s.notes && s.notes.toLowerCase().includes(cleanQuery)) ||
        s.reporter.toLowerCase().includes(cleanQuery);

      if (matchesSightingText) {
        tempResults.push({
          type: "sighting",
          id: s.id,
          title: s.location,
          subtitle: `${s.speciesName} • ${s.reporter}`,
          extra: s.timestamp
        });
      }
    });

    // Limit total results shown to prevent clutter
    setResults(tempResults.slice(0, 8));
    setActiveIndex(-1);
  }, [query, sightings, customGuides]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === "species") {
      onSelectSpecies(item.title);
    } else {
      onSelectSighting(item.id);
    }
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full z-[3000]">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center h-10 px-3 rounded-xl border transition-all duration-300 ${
          theme === "night"
            ? isFocused
              ? "bg-[#002c1f] border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_18px_rgba(52,211,153,0.4)] brightness-105"
              : "bg-[#00140e] border-emerald-950/70 hover:border-emerald-800"
            : isFocused
              ? "bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-[0_0_15px_rgba(16,185,129,0.22),_0_4px_16px_rgba(16,185,129,0.08)]"
              : "bg-[#f4f6f5] border-transparent hover:border-[#bfc9c3]"
        }`}
      >
        <Search className={`w-4 h-4 mr-2 ${theme === "night" ? "text-emerald-500/60" : "text-emerald-800/60"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Global sector search..."
          className={`w-full bg-transparent border-none outline-none text-xs font-medium placeholder-current leading-none ${
            theme === "night"
              ? "text-emerald-300 placeholder-emerald-500/50"
              : "text-[#003527] placeholder-[#404944]/50"
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`p-0.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer ${
              theme === "night" ? "text-emerald-400" : "text-[#404944]"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Search Results */}
      <AnimatePresence>
        {isFocused && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute top-12 left-0 right-0 rounded-2xl border p-2 overflow-hidden shadow-xl max-h-[380px] overflow-y-auto scrollbar-thin ${
              theme === "night"
                ? "bg-[#002017] border-emerald-900/80 text-[#6ffbbe] shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
                : "bg-white border-[#bfc9c3]/50 text-[#1a1c1c] shadow-[0_12px_40px_rgba(6,78,59,0.12)]"
            }`}
          >
            <div className="flex flex-col gap-1">
              {results.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isSpecies = item.type === "species";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer select-none ${
                      isActive
                        ? theme === "night"
                          ? "bg-emerald-900/40 text-emerald-300 border-l-4 border-emerald-400 pl-1.5"
                          : "bg-emerald-50 text-emerald-950 border-l-4 border-emerald-600 pl-1.5"
                        : theme === "night"
                          ? "hover:bg-emerald-950/20 text-emerald-400"
                          : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    {isSpecies ? (
                      <Leaf className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${isActive ? "text-emerald-500" : "text-emerald-600/60"}`} />
                    ) : (
                      <MapPin className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${isActive ? "text-teal-500" : "text-teal-600/60"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate leading-tight">{item.title}</span>
                        {item.extra && (
                          <span className={`text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                            theme === "night" 
                              ? isSpecies ? "bg-emerald-950/60 text-emerald-400" : "bg-teal-950/60 text-teal-400"
                              : isSpecies ? "bg-emerald-50 text-emerald-800" : "bg-teal-50 text-teal-800"
                          }`}>
                            {item.extra}
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-medium leading-none">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}

              {results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <AlertCircle className="w-5 h-5 mb-2 text-slate-400" />
                  <p className="text-xs font-bold text-slate-400">No telemetry matches</p>
                  <p className="text-[10px] text-slate-400/80 max-w-[200px] mt-1 font-medium">
                    Try entering different taxonomy names or sector locations
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
