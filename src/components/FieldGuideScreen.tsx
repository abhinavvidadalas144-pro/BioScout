import React, { useState, useEffect, useRef } from "react";
import { ActiveScreen, SpeciesData } from "../types";
import { IMAGES } from "../assets";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Thermometer, 
  Droplets, 
  Globe, 
  Award, 
  ChevronRight, 
  Info, 
  Layers, 
  Activity, 
  CheckCircle2,
  AlertCircle,
  Bird,
  PawPrint,
  Leaf,
  Bug,
  Compass,
  Volume2,
  Radio
} from "lucide-react";

interface FieldGuideScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  selectedSpeciesName: string;
  onReportSighting: () => void;
  customGuides?: SpeciesData[]; // Custom identified species guides
  onAddCustomGuide?: (newGuide: SpeciesData) => void;
  theme?: "light" | "night";
}

export const getSpeciesCategory = (g: SpeciesData): string => {
  if (g.category) return g.category;
  
  const name = (g.speciesName || "").toLowerCase();
  const kingdom = (g.kingdom || "").toLowerCase();
  const order = (g.order || "").toLowerCase();
  
  if (kingdom === "plantae" || name.includes("fern") || name.includes("orchid") || name.includes("tree") || name.includes("plant") || name.includes("flora") || name.includes("flower")) {
    return "Flora";
  }
  if (order === "lepidoptera" || name.includes("butterfly") || name.includes("moth") || name.includes("insect") || name.includes("beetle") || name.includes("bug")) {
    return "Insects";
  }
  if (order === "carnivora" || name.includes("leopard") || name.includes("cat") || name.includes("bear") || name.includes("mammal") || name.includes("wolf") || name.includes("panther")) {
    return "Mammals";
  }
  if (order === "psittaciformes" || name.includes("macaw") || name.includes("bird") || name.includes("eagle") || name.includes("owl") || name.includes("parrot") || name.includes("falcon")) {
    return "Birds";
  }
  return "Others";
};

export const getSpeciesImage = (speciesName: string, customImage?: string): string => {
  if (customImage && customImage.trim() !== "") {
    return customImage;
  }
  const name = (speciesName || "").trim().toLowerCase();
  
  // Explicit high-quality authentic species mappings
  switch (name) {
    // Primary Species
    case "blue morpho":
      return IMAGES.blueMorphoMain;
    case "snow leopard":
      return IMAGES.snowLeopard;
    case "giant tree fern":
      return IMAGES.giantTreeFern;
    case "cloud forest orchid":
      return IMAGES.cloudForestOrchid;
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

    // Similar / Secondary Species Map
    case "common morpho":
    case "common morpho achilles":
      return IMAGES.commonMorpho || "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?auto=format&fit=crop&w=800&q=85";
    case "helenor morpho":
    case "helenor morpho rainforest":
      return IMAGES.helenorMorpho || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85";
    case "blue emperor":
      return IMAGES.blueEmperor || "https://images.unsplash.com/photo-1545155998-0c679a9f4fbd?auto=format&fit=crop&w=800&q=85";
    case "monarch butterfly":
      return IMAGES.monarchButterfly || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85";
    case "red-and-green macaw":
      return "https://upload.wikimedia.org/wikipedia/commons/a/a3/Ara_chloropterus_at_Jardin_des_Plantes.jpg";
    case "military macaw":
      return "https://upload.wikimedia.org/wikipedia/commons/a/a2/Military_macaw_closeup_Ara_militaris.jpg";
    case "golden poison frog":
    case "golden poison dart frog":
      return "https://upload.wikimedia.org/wikipedia/commons/3/3b/Golden_Poison_Dart_Frog_%28Phyllobates_terribilis%29.jpg";
    case "splash-back poison frog":
      return "https://upload.wikimedia.org/wikipedia/commons/a/ac/Ranitomeya_variabilis_French_Guiana.jpg";
    case "leopard":
      return "https://upload.wikimedia.org/wikipedia/commons/e/e7/Panthera_pardus_leopard.jpg";
    case "cougar":
    case "mountain lion":
      return "https://upload.wikimedia.org/wikipedia/commons/d/d6/Mountain_Lion_in_heavy_snow.jpg";
    case "tucuxi":
      return "https://upload.wikimedia.org/wikipedia/commons/6/6f/Sotalia_fluviatilis2.jpg";
    case "bolivian river dolphin":
      return "https://upload.wikimedia.org/wikipedia/commons/c/ca/Inia_geoffrensis_boliviensis_in_Bolivia.jpg";
    case "two-toed sloth":
      return "https://upload.wikimedia.org/wikipedia/commons/b/b4/Choloepus_hoffmanni_Costa_Rica.jpg";
    case "neotropical otter":
      return "https://upload.wikimedia.org/wikipedia/commons/5/52/Lontra_longicaudis.jpg";
    case "crested eagle":
      return "https://upload.wikimedia.org/wikipedia/commons/e/e6/Morphnus_guianensis_Crested_Eagle_Gavi%C3%A3o-real-falso.jpg";
    case "steller's sea eagle":
      return "https://upload.wikimedia.org/wikipedia/commons/5/5a/Steller%27s_Sea_Eagle_closeup.jpg";
    case "capuchin monkey":
      return "https://upload.wikimedia.org/wikipedia/commons/4/40/White-headed_capuchin_monkey_%28Cebus_capucinus%29_profile.jpg";
    case "spider monkey":
      return "https://upload.wikimedia.org/wikipedia/commons/4/4c/Geoffroy%27s_Spider_Monkey_%28Ateles_geoffroyi%29_in_Corcovado.jpg";
    case "brazil nut tree":
      return "https://upload.wikimedia.org/wikipedia/commons/3/33/Bertholletia_excelsa_opening.jpg";
    case "tropical pitcher plant":
      return "https://upload.wikimedia.org/wikipedia/commons/4/4c/Nepenthes_ampullaria_pitchers.jpg";
    case "wild plantain":
      return "https://upload.wikimedia.org/wikipedia/commons/b/bf/Heliconia_caribaea_blooms.jpg";
    case "soft tree fern":
      return "https://upload.wikimedia.org/wikipedia/commons/b/b3/Dicksonia_antarctica_fronds.jpg";
    case "black tree fern":
      return "https://upload.wikimedia.org/wikipedia/commons/b/ba/Cyathea_medullaris_New_Zealand.jpg";
    case "tiger orchid":
      return "https://upload.wikimedia.org/wikipedia/commons/c/cf/Rossioglossum_grande_orchid.jpg";
    case "clouded leopard":
      return "https://upload.wikimedia.org/wikipedia/commons/a/ab/Clouded_Leopard_Neofelis_nebulosa_profile.jpg";
  }

  // Broad keyword-based matcher fallbacks to maintain premium authentic photos
  if (name.includes("butterfly") || name.includes("morpho") || name.includes("insect") || name.includes("caterpillar") || name.includes("moth")) {
    return IMAGES.blueMorphoMain;
  }
  if (name.includes("macaw") || name.includes("parrot") || name.includes("toucan") || name.includes("bird") || name.includes("hummingbird") || name.includes("owl") || name.includes("falcon")) {
    return "https://upload.wikimedia.org/wikipedia/commons/c/c4/Ara_macao_-Copan_Ruins%2C_Honduras_-wild-8.jpg";
  }
  if (name.includes("eagle")) {
    return "https://upload.wikimedia.org/wikipedia/commons/2/22/Harpy_Eagle_Harpia_harpyja_2000px.jpg";
  }
  if (name.includes("leopard") || name.includes("jaguar") || name.includes("cat") || name.includes("puma") || name.includes("cougar") || name.includes("panther") || name.includes("tiger") || name.includes("lion")) {
    if (name.includes("snow")) return IMAGES.snowLeopard;
    return "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg";
  }
  if (name.includes("frog") || name.includes("toad") || name.includes("amphibian") || name.includes("dart") || name.includes("salamander")) {
    return "https://upload.wikimedia.org/wikipedia/commons/d/da/Strawberry_poison-dart_frog_%28Oophaga_pumilio%29.jpg";
  }
  if (name.includes("dolphin") || name.includes("whale") || name.includes("boto") || name.includes("tucuxi") || name.includes("porpoise") || name.includes("aquatic")) {
    return "https://upload.wikimedia.org/wikipedia/commons/e/e0/Boto_Inia_geoffrensis_3.jpg";
  }
  if (name.includes("sloth") || name.includes("bradypus") || name.includes("choloepus")) {
    return "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bradypus_variegatus_-_Manuel_Antonio.jpg";
  }
  if (name.includes("otter") || name.includes("pteronura") || name.includes("lontra")) {
    return "https://upload.wikimedia.org/wikipedia/commons/2/2f/Giant_Otter_%28Pteronura_brasiliensis%29_%288015949673%29.jpg";
  }
  if (name.includes("monkey") || name.includes("primate") || name.includes("capuchin") || name.includes("spider") || name.includes("ape") || name.includes("chimpanzee") || name.includes("tamarin")) {
    return "https://upload.wikimedia.org/wikipedia/commons/2/20/Saimiri_sciureus-top.jpg";
  }
  if (name.includes("fern")) {
    return IMAGES.giantTreeFern;
  }
  if (name.includes("orchid")) {
    return IMAGES.cloudForestOrchid;
  }
  if (name.includes("kapok") || name.includes("tree") || name.includes("forest") || name.includes("jungle") || name.includes("canopy") || name.includes("wood")) {
    return "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
  }
  if (name.includes("pitcher") || name.includes("nepenthes")) {
    return "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nepenthes_alata_pitcher_plant.jpg";
  }
  if (name.includes("heliconia") || name.includes("flower") || name.includes("flora") || name.includes("plant") || name.includes("bromeliad") || name.includes("vine")) {
    return "https://upload.wikimedia.org/wikipedia/commons/e/ec/Heliconia_rostrata.jpg";
  }

  // Final premium neutral botanical-scientific card illustration placeholder (No Picsum)
  return IMAGES.giantTreeFern;
};

const PRELOADED_SPECIES: Record<string, SpeciesData> = {
  "Blue Morpho": {
    speciesName: "Blue Morpho",
    scientificName: "Morpho menelaus",
    confidence: 98,
    kingdom: "Animalia",
    order: "Lepidoptera",
    family: "Nymphalidae",
    category: "Insects",
    description: "Predominantly found throughout Central and South America, particularly within the deep understory of the Amazon Rainforest. They thrive in humid, shaded environments where canopy gaps provide slivers of intense sunlight.",
    conservationStatus: "Least Concern",
    nativeRange: "Central & South America",
    funFacts: [
      "Their brilliant blue color comes from microscopic scales reflecting light, not chemical pigment.",
      "When flying, the contrast between the blue tops and brown undersides creates a flashing effect.",
      "Adults primarily feed on fermenting fruit juices in the tropical canopy."
    ],
    ecosystem: "Amazon Basin Understory",
    avgTemp: "27°C",
    humidity: "85%",
    similarSpecies: [
      { speciesName: "Common Morpho", scientificName: "Morpho peleides", similarity: "82% Similar" },
      { speciesName: "Helenor Morpho", scientificName: "Morpho helenor", similarity: "75% Similar" },
      { speciesName: "Blue Emperor", scientificName: "Morpho rhetenor", similarity: "68% Similar" }
    ]
  },
  "Snow Leopard": {
    speciesName: "Snow Leopard",
    scientificName: "Panthera uncia",
    confidence: 94,
    kingdom: "Animalia",
    order: "Carnivora",
    family: "Felidae",
    category: "Mammals",
    description: "Well adapted to alpine, rugged mountain landscapes in central Asia. These highly secretive predators traverse steep rocky ridges and cold dry valleys above the tree line.",
    conservationStatus: "Vulnerable",
    nativeRange: "Central Asia Mountains",
    funFacts: [
      "They use their long, thick tails for balance and as a blanket to protect their face from cold winds.",
      "Snow leopards cannot roar due to the physical structure of their vocal cords.",
      "They can leap up to 15 meters horizontally to chase prey over cliffs."
    ],
    ecosystem: "Alpine Tundra",
    avgTemp: "-10°C",
    humidity: "40%",
    similarSpecies: [
      { speciesName: "Leopard", scientificName: "Panthera pardus", similarity: "64% Similar" },
      { speciesName: "Clouded Leopard", scientificName: "Neofelis nebulosa", similarity: "58% Similar" }
    ]
  },
  "Giant Tree Fern": {
    speciesName: "Giant Tree Fern",
    scientificName: "Cyathea cooperi",
    confidence: 100,
    kingdom: "Plantae",
    order: "Cyatheales",
    family: "Cyatheaceae",
    category: "Flora",
    description: "A fast-growing tree fern native to Australia. It flourishes in moist gullies, temperate rainforest valleys, and coastal forest fringes with ample rainfall.",
    conservationStatus: "Least Concern",
    nativeRange: "Eastern Australia",
    funFacts: [
      "These ferns are direct descendants of ancient flora that populated earth during the Jurassic period.",
      "The trunk consists of compressed fibrous roots that support fronds stretching up to 6 meters in length.",
      "They reproduce via millions of microscopic spores produced under mature fronds."
    ],
    ecosystem: "Temperate Rainforest",
    avgTemp: "19°C",
    humidity: "78%",
    similarSpecies: [
      { speciesName: "Soft Tree Fern", scientificName: "Dicksonia antarctica", similarity: "88% Similar" },
      { speciesName: "Black Tree Fern", scientificName: "Cyathea medullaris", similarity: "72% Similar" }
    ]
  },
  "Cloud Forest Orchid": {
    speciesName: "Cloud Forest Orchid",
    scientificName: "Cyrtochilum macranthum",
    confidence: 96,
    kingdom: "Plantae",
    order: "Asparagales",
    family: "Orchidaceae",
    category: "Flora",
    description: "An epiphytic orchid that climbs cloud forest tree trunks at altitudes between 2,000 and 3,000 meters. Thrives in constant mist, dripping fog, and cool highland conditions.",
    conservationStatus: "Vulnerable",
    nativeRange: "Andean Highlands",
    funFacts: [
      "It absorbs moisture and nutrients directly from the air and moss-covered bark using velamen-covered aerial roots.",
      "Its spectacular golden flowers can span up to 10 centimeters and resemble small dancing figures.",
      "It relies on specific mycorrhizal fungi to germinate and grow in high elevations."
    ],
    ecosystem: "Cloud Forest Canopy",
    avgTemp: "12°C",
    humidity: "95%",
    similarSpecies: [
      { speciesName: "Tiger Orchid", scientificName: "Rossioglossum grande", similarity: "60% Similar" }
    ]
  },
  "Scarlet Macaw": {
    speciesName: "Scarlet Macaw",
    scientificName: "Ara macao",
    confidence: 97,
    kingdom: "Animalia",
    order: "Psittaciformes",
    family: "Psittacidae",
    category: "Birds",
    description: "A large and stunning red, yellow, and blue South American parrot. It is native to humid evergreen forests of tropical South America, where it nests in cavities of large trees. Recognized for its exceptional intelligence and highly social demeanor.",
    conservationStatus: "Least Concern",
    nativeRange: "Central & South America",
    funFacts: [
      "They can live up to 75 years in captivity, and form lifetime monogamous pairs.",
      "Macaws use their strong beaks to crush hard nuts and seeds, and can even eat clay to neutralize toxins.",
      "Their vocalizations can be heard from miles away to keep in contact with their flock."
    ],
    ecosystem: "Humid Rainforest Canopy",
    avgTemp: "26°C",
    humidity: "80%",
    similarSpecies: [
      { speciesName: "Red-and-green Macaw", scientificName: "Ara chloropterus", similarity: "85% Similar" },
      { speciesName: "Military Macaw", scientificName: "Ara militaris", similarity: "70% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Ara_macao_-Copan_Ruins%2C_Honduras_-wild-8.jpg"
  },
  "Poison Dart Frog": {
    speciesName: "Poison Dart Frog",
    scientificName: "Oophaga pumilio",
    confidence: 97,
    kingdom: "Animalia",
    order: "Anura",
    family: "Dendrobatidae",
    category: "Others",
    description: "Highly toxic bright red amphibian with denim-blue legs, indicating warning coloration (aposematism). Endemic to humid lowland rainforests, they rely on small pools of water in bromeliads to raise their tadpoles.",
    conservationStatus: "Least Concern",
    nativeRange: "Central & South America",
    funFacts: [
      "Their toxic secretions come from their diet of ants, mites, and termites in the wild.",
      "The bright red body and blue legs earned them the common nickname 'strawberry poison frog'.",
      "Mothers carry tadpoles on their backs to individual water-filled bromeliad plants."
    ],
    ecosystem: "Damp Rainforest Floor",
    avgTemp: "25°C",
    humidity: "90%",
    similarSpecies: [
      { speciesName: "Golden Poison Frog", scientificName: "Phyllobates terribilis", similarity: "80% Similar" },
      { speciesName: "Splash-back Poison Frog", scientificName: "Ranitomeya variabilis", similarity: "72% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/d/da/Strawberry_poison-dart_frog_%28Oophaga_pumilio%29.jpg"
  },
  "Jaguar": {
    speciesName: "Jaguar",
    scientificName: "Panthera onca",
    confidence: 95,
    kingdom: "Animalia",
    order: "Carnivora",
    family: "Felidae",
    category: "Mammals",
    description: "The largest cat species in the Americas, boasting a exceptionally powerful bite that can pierce turtle shells. They are supreme stalkers with beautiful rosette pattern camouflage, highly comfortable swimming in jungle rivers.",
    conservationStatus: "Near Threatened",
    nativeRange: "North & South America",
    funFacts: [
      "Jaguars are outstanding swimmers and frequently hunt fish, turtles, and even caimans in rivers.",
      "Their name comes from the Indigenous word 'yaguara', meaning 'he who kills with one leap'.",
      "Unlike many other cats, jaguars do not avoid water; they thrive in flooded forests."
    ],
    ecosystem: "Flooded Forests & Riverbanks",
    avgTemp: "26°C",
    humidity: "82%",
    similarSpecies: [
      { speciesName: "Leopard", scientificName: "Panthera pardus", similarity: "88% Similar" },
      { speciesName: "Cougar", scientificName: "Puma concolor", similarity: "70% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg"
  },
  "Pink River Dolphin": {
    speciesName: "Pink River Dolphin",
    scientificName: "Inia geoffrensis",
    confidence: 98,
    kingdom: "Animalia",
    order: "Artiodactyla",
    family: "Iniidae",
    category: "Mammals",
    description: "A freshwater dolphin native to the Amazon and Orinoco river basins. Known for its highly flexible neck, long snout, and stunning pink coloring that deepens as the dolphin matures or becomes active.",
    conservationStatus: "Endangered",
    nativeRange: "Amazon & Orinoco Basins",
    funFacts: [
      "Their pink color is a result of scar tissue, age, and blood capillaries close to the skin surface.",
      "They have unfused neck vertebrae, allowing them to turn their heads 90 degrees to navigate flooded tree roots.",
      "According to Amazonian folklore, these dolphins can transform into handsome men at night to lure villagers."
    ],
    ecosystem: "Flooded River Canals",
    avgTemp: "28°C",
    humidity: "88%",
    similarSpecies: [
      { speciesName: "Tucuxi", scientificName: "Sotalia fluviatilis", similarity: "75% Similar" },
      { speciesName: "Bolivian River Dolphin", scientificName: "Inia boliviensis", similarity: "85% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Boto_Inia_geoffrensis_3.jpg"
  },
  "Three-Toed Sloth": {
    speciesName: "Three-Toed Sloth",
    scientificName: "Bradypus variegatus",
    confidence: 91,
    kingdom: "Animalia",
    order: "Pilosa",
    family: "Bradypodidae",
    category: "Mammals",
    description: "An arboreal mammal famous for its extreme slowness. They spend almost their entire lives hanging upside down in the forest canopy, hosting specialized green algae in their grooved fur which acts as camouflage.",
    conservationStatus: "Least Concern",
    nativeRange: "Central & South America",
    funFacts: [
      "Their metabolism is so slow that it can take up to a month for them to digest a single leaf meal.",
      "They descend from the canopy only once a week to defecate on the forest floor, risking predators.",
      "Sloths are surprisingly excellent swimmers, using their long arms to paddle through river waters."
    ],
    ecosystem: "Rainforest Upper Canopy",
    avgTemp: "26°C",
    humidity: "80%",
    similarSpecies: [
      { speciesName: "Two-Toed Sloth", scientificName: "Choloepus hoffmanni", similarity: "82% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bradypus_variegatus_-_Manuel_Antonio.jpg"
  },
  "Amazon Giant Otter": {
    speciesName: "Amazon Giant Otter",
    scientificName: "Pteronura brasiliensis",
    confidence: 93,
    kingdom: "Animalia",
    order: "Carnivora",
    family: "Mustelidae",
    category: "Mammals",
    description: "The longest member of the weasel family, reaching up to 1.8 meters. These highly social, noisy carnivores live in complex family groups and are formidable aquatic predators known as 'river wolves'.",
    conservationStatus: "Endangered",
    nativeRange: "South American Rivers",
    funFacts: [
      "Each giant otter has a unique creamy-white throat patch pattern, used by trackers to identify individuals.",
      "They are highly vocal and have distinct calls to warn the group of predators or signal feeding times.",
      "They can hunt and consume large fish, crabs, and even small anacondas or caimans."
    ],
    ecosystem: "Oxbow Lakes & Slow Rivers",
    avgTemp: "27°C",
    humidity: "85%",
    similarSpecies: [
      { speciesName: "Neotropical Otter", scientificName: "Lontra longicaudis", similarity: "78% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Giant_Otter_%28Pteronura_brasiliensis%29_%288015949673%29.jpg"
  },
  "Harpy Eagle": {
    speciesName: "Harpy Eagle",
    scientificName: "Harpia harpyja",
    confidence: 92,
    kingdom: "Animalia",
    order: "Accipitriformes",
    family: "Accipitridae",
    category: "Birds",
    description: "A legendary, massive canopy raptor. With hind talons as large as a grizzly bear's claws, they are apex avian predators capable of lifting prey equal to their own body weight out of the tree branches.",
    conservationStatus: "Vulnerable",
    nativeRange: "Central & South America Canopy",
    funFacts: [
      "Their massive claws can measure up to 13 centimeters, larger than a grizzly bear's claws.",
      "They have a double crest of feathers on their head that rises when they hear a potential target.",
      "They can fly through dense forest canopies at speeds up to 80 kilometers per hour."
    ],
    ecosystem: "Pristine Rainforest Canopy",
    avgTemp: "24°C",
    humidity: "75%",
    similarSpecies: [
      { speciesName: "Crested Eagle", scientificName: "Morphnus guianensis", similarity: "84% Similar" },
      { speciesName: "Steller's Sea Eagle", scientificName: "Haliaeetus pelagicus", similarity: "65% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/2/22/Harpy_Eagle_Harpia_harpyja_2000px.jpg"
  },
  "Squirrel Monkey": {
    speciesName: "Squirrel Monkey",
    scientificName: "Saimiri sciureus",
    confidence: 96,
    kingdom: "Animalia",
    order: "Primates",
    family: "Cebidae",
    category: "Mammals",
    description: "Small, highly energetic New World primates. They live in large social troops of up to 500 members in the tropical canopy, communicating through a rich spectrum of vocal chirps and alarm calls.",
    conservationStatus: "Least Concern",
    nativeRange: "Amazon Basin Canopy",
    funFacts: [
      "They do not use their long tails to grab branches; instead, they use them purely for balancing.",
      "They have a brain-to-body mass ratio higher than humans, making them exceptionally intelligent.",
      "They feed primarily on insects and fruits, move in fast-foraging paths through the understory."
    ],
    ecosystem: "Tropical Forest Understory",
    avgTemp: "26°C",
    humidity: "84%",
    similarSpecies: [
      { speciesName: "Capuchin Monkey", scientificName: "Cebus capucinus", similarity: "70% Similar" },
      { speciesName: "Spider Monkey", scientificName: "Ateles geoffroyi", similarity: "62% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/2/20/Saimiri_sciureus-top.jpg"
  },
  "Kapok Tree": {
    speciesName: "Kapok Tree",
    scientificName: "Ceiba pentandra",
    confidence: 100,
    kingdom: "Plantae",
    order: "Malvales",
    family: "Malvaceae",
    category: "Flora",
    description: "An absolute giant of the rainforest, emerging up to 60 meters high above the canopy. It features massive buttress roots that stabilize its weight and hosts rich micro-ecosystems of bromeliads, orchids, and frogs.",
    conservationStatus: "Least Concern",
    nativeRange: "Neotropics & West Africa",
    funFacts: [
      "A single Kapok tree can produce up to 4,000 seed pods containing fluffy, water-resistant fiber called Kapok.",
      "Its buttress roots can extend up to 10 meters outwards from the trunk, preventing soil erosion.",
      "Ancient Maya civilizations considered the Kapok tree sacred, believing it linked the underworld to heaven."
    ],
    ecosystem: "Emergent Forest Layer",
    avgTemp: "25°C",
    humidity: "78%",
    similarSpecies: [
      { speciesName: "Brazil Nut Tree", scientificName: "Bertholletia excelsa", similarity: "76% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg"
  },
  "Pitcher Plant": {
    speciesName: "Pitcher Plant",
    scientificName: "Nepenthes rafflesiana",
    confidence: 99,
    kingdom: "Plantae",
    order: "Caryophyllales",
    family: "Nepenthaceae",
    category: "Flora",
    description: "A highly specialized carnivorous vine. It grows slippery pitchers filled with digestive fluid enzymes to capture, drown, and digest crawling or flying insects to absorb nitrogen in nutrient-poor soils.",
    conservationStatus: "Least Concern",
    nativeRange: "Southeast Asia & South America",
    funFacts: [
      "The peristome (lip) of the pitcher becomes incredibly slippery when wet, causing bugs to slide right in.",
      "Some pitcher species have symbiotic relationships with bats, which roost inside and leave nutrient-rich droppings.",
      "The fluid inside is so sterile that it has been used as emergency drinking water in dense jungles."
    ],
    ecosystem: "Humid Forest Margins",
    avgTemp: "24°C",
    humidity: "85%",
    similarSpecies: [
      { speciesName: "Tropical Pitcher Plant", scientificName: "Nepenthes ampullaria", similarity: "88% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nepenthes_alata_pitcher_plant.jpg"
  },
  "Heliconia Flower": {
    speciesName: "Heliconia Flower",
    scientificName: "Heliconia rostrata",
    confidence: 96,
    kingdom: "Plantae",
    order: "Zingiberales",
    family: "Heliconiaceae",
    category: "Flora",
    description: "Commonly known as the lobster-claw plant, it produces striking, downward-hanging cascades of neon-red and yellow bracts. These specialized shapes are custom-suited for tropical hummingbirds to drink nectar.",
    conservationStatus: "Least Concern",
    nativeRange: "Central & South America",
    funFacts: [
      "Their sturdy bracts collect tiny pools of water, providing miniature drinking wells for tree frogs.",
      "Because they require specialized bird bills for pollination, insects rarely obtain their deepest nectar.",
      "They are closely related to bananas, gingers, and birds of paradise plants."
    ],
    ecosystem: "Understory Rainforest Edges",
    avgTemp: "23°C",
    humidity: "80%",
    similarSpecies: [
      { speciesName: "Wild Plantain", scientificName: "Heliconia caribaea", similarity: "82% Similar" }
    ],
    customImage: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Heliconia_rostrata.jpg"
  }
};

export const getSpeciesRarity = (name: string): "Common" | "Uncommon" | "Rare" | "Legendary" => {
  const n = (name || "").toLowerCase();
  if (n.includes("dolphin") || n.includes("leopard") || n.includes("jaguar")) {
    return "Legendary";
  }
  if (n.includes("eagle") || n.includes("orchid") || n.includes("macaw")) {
    return "Rare";
  }
  if (n.includes("sloth") || n.includes("frog") || n.includes("pitcher")) {
    return "Uncommon";
  }
  return "Common";
};

interface SpecimenCard3DProps {
  species: SpeciesData;
  isActive: boolean;
  onClick: () => void;
}

export function SpecimenCard3D({ species, isActive, onClick }: SpecimenCard3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = rectRef.current;
    if (!rect) {
      rect = e.currentTarget.getBoundingClientRect();
      rectRef.current = rect;
    }
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    setTilt({
      x: px * 12,
      y: -py * 12
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    rectRef.current = null;
  };

  const getRarityColor = (name: string) => {
    const rarity = getSpeciesRarity(name);
    if (rarity === "Legendary") return "from-amber-500/25 to-yellow-500/5 border-yellow-500/40 text-yellow-300";
    if (rarity === "Rare") return "from-red-500/25 to-rose-500/5 border-red-500/40 text-red-300";
    if (rarity === "Uncommon") return "from-blue-500/25 to-indigo-500/5 border-blue-500/40 text-blue-300";
    return "from-emerald-500/10 to-teal-500/5 border-[#bfc9c3]/20 text-emerald-300";
  };

  const rarity = getSpeciesRarity(species.speciesName);
  
  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="cursor-pointer select-none"
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      <motion.div
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
        }}
        transition={isHovered ? { type: "tween", ease: "linear", duration: 0.05 } : { type: "spring", stiffness: 120, damping: 15 }}
        className={`relative w-44 h-64 rounded-2xl overflow-hidden border p-4 flex flex-col justify-between shadow-md transition-shadow duration-300 ${
          isActive 
            ? "bg-[#002419]/95 border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_12px_24px_rgba(16,185,129,0.2)]" 
            : "bg-white/80 border-slate-200 hover:border-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        }`}
      >
        {/* Background Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(species.speciesName)} pointer-events-none opacity-20`} />
        
        {/* Image */}
        <div className="h-28 rounded-xl overflow-hidden relative mb-2 z-10">
          <img 
            src={getSpeciesImage(species.speciesName, species.customImage)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            alt={species.speciesName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-1.5 left-2">
            <span className="text-[7px] font-black tracking-widest font-mono uppercase bg-black/60 px-1.5 py-0.5 rounded text-white border border-white/10">
              {rarity} Tier
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-end z-10 pointer-events-none" style={{ transform: "translateZ(15px)" }}>
          <h4 className={`text-xs font-black tracking-tight leading-tight line-clamp-1 ${isActive ? "text-white" : "text-[#003527]"}`}>{species.speciesName}</h4>
          <p className="text-[8px] font-bold text-emerald-600 italic font-mono truncate">{species.scientificName}</p>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/30 text-[8px] font-mono text-[#8d928f]">
            <span>{species.conservationStatus.split(" ")[0]}</span>
            <span className="text-emerald-600 font-extrabold">{species.confidence}% MATCH</span>
          </div>
        </div>

        {/* 3D Reflection overlay effect */}
        {isHovered && (
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay z-20"
            style={{
              transform: `translate(${tilt.x * 1.5}px, ${-tilt.y * 1.5}px)`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default function FieldGuideScreen({ onNavigate, selectedSpeciesName, onReportSighting, customGuides = [], onAddCustomGuide, theme = "light" }: FieldGuideScreenProps) {
  
  // Build local copy of species profiles
  const speciesProfiles: Record<string, SpeciesData> = { ...PRELOADED_SPECIES };

  // Merge preloaded profiles with custom uploaded species guides
  customGuides.forEach((g) => {
    if (g && g.speciesName && !speciesProfiles[g.speciesName]) {
      const cat = g.category || getSpeciesCategory(g);
      speciesProfiles[g.speciesName] = { ...g, category: cat };
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<string>("specimen");
  const [profileKey, setProfileKey] = useState<string>(
    speciesProfiles[selectedSpeciesName] ? selectedSpeciesName : "Blue Morpho"
  );
  
  // Real-time search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Immersive 3D Scanner and Web Audio Synthesizer states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [analyserData, setAnalyserData] = useState<number[]>([]);

  const triggerAcousticSimulation = () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        setIsSynthesizing(false);
        return;
      }
      const ctx = new AudioContextClass();
      
      const name = currentProfile.speciesName.toLowerCase();
      let freq1 = 220;
      let freq2 = 880;
      let type: OscillatorType = "sine";
      let duration = 0.8;
      
      if (name.includes("morpho") || name.includes("insect") || name.includes("butterfly")) {
        freq1 = 120;
        freq2 = 180;
        type = "triangle";
        duration = 1.2;
      } else if (name.includes("macaw") || name.includes("bird") || name.includes("eagle") || name.includes("owl")) {
        freq1 = 450;
        freq2 = 950;
        type = "sawtooth";
        duration = 0.6;
      } else if (name.includes("leopard") || name.includes("jaguar") || name.includes("mammal") || name.includes("cat")) {
        freq1 = 80;
        freq2 = 60;
        type = "sine";
        duration = 1.0;
      } else {
        freq1 = 432;
        freq2 = 432;
        type = "sine";
        duration = 1.5;
      }
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + duration);
      
      osc.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
      
      let startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= duration) {
          clearInterval(interval);
          setIsSynthesizing(false);
          setAnalyserData([]);
        } else {
          const wave: number[] = [];
          for (let i = 0; i < 40; i++) {
            const val = Math.sin(i * 0.4 + elapsed * 15) * Math.cos(i * 0.1) * (1 - elapsed / duration) * 40;
            wave.push(val);
          }
          setAnalyserData(wave);
        }
      }, 30);
      
    } catch (err) {
      console.error("Audio Synthesis Error: ", err);
      setIsSynthesizing(false);
    }
  };

  // Comparison mode states
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareLeftKey, setCompareLeftKey] = useState<string>(
    speciesProfiles[selectedSpeciesName] ? selectedSpeciesName : "Blue Morpho"
  );
  const [compareRightKey, setCompareRightKey] = useState<string>("Snow Leopard");

  const getRarityBadge = (name: string) => {
    const rarity = getSpeciesRarity(name);
    let badgeClass = "bg-slate-500/80 text-white border-slate-400/30";
    let icon = "🟢";
    if (rarity === "Legendary") {
      badgeClass = "bg-amber-600/80 text-white border-amber-500/40 animate-pulse";
      icon = "👑";
    } else if (rarity === "Rare") {
      badgeClass = "bg-red-600/80 text-white border-red-500/40";
      icon = "💎";
    } else if (rarity === "Uncommon") {
      badgeClass = "bg-blue-600/80 text-white border-blue-500/40";
      icon = "🌟";
    }
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${badgeClass}`}>
        <span>{icon}</span>
        <span>{rarity} Tier</span>
      </span>
    );
  };

  // Form states for manual registration
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [newScientificName, setNewScientificName] = useState("");
  const [newCategory, setNewCategory] = useState("Flora");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState("Least Concern");
  const [newRange, setNewRange] = useState("Amazon Protection Reserve");
  const [newTemp, setNewTemp] = useState("25°C");
  const [newHumidity, setNewHumidity] = useState("80%");
  const [newEcosystem, setNewEcosystem] = useState("Humid Understory");
  const [newFact1, setNewFact1] = useState("");
  const [newFact2, setNewFact2] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const presetImages = [
    { label: "Lush Jungle", url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80" },
    { label: "Exotic Orchid", url: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80" },
    { label: "Deep Forest", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80" },
    { label: "Wild Mammal", url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80" }
  ];

  const handleSubmitNewSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeciesName || !newScientificName || !newDescription) return;

    const newGuide: SpeciesData = {
      speciesName: newSpeciesName,
      scientificName: newScientificName,
      confidence: 100,
      kingdom: newCategory === "Flora" ? "Plantae" : "Animalia",
      order: newCategory === "Insects" ? "Lepidoptera" : "Unknown",
      family: "Local Discovery",
      category: newCategory,
      description: newDescription,
      conservationStatus: newStatus,
      nativeRange: newRange,
      funFacts: [
        newFact1 || "Registered manually by the scout using verified field telemetry logs.",
        newFact2 || "This specimen contributes critical density indicators to local bio-diversity lists."
      ],
      ecosystem: newEcosystem,
      avgTemp: newTemp,
      humidity: newHumidity,
      similarSpecies: [],
      customImage: newImageUrl || "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"
    };

    if (onAddCustomGuide) {
      onAddCustomGuide(newGuide);
    }

    setProfileKey(newSpeciesName);
    setActiveSlide(0);
    setIsAddModalOpen(false);

    // Reset Form
    setNewSpeciesName("");
    setNewScientificName("");
    setNewDescription("");
    setNewFact1("");
    setNewFact2("");
    setNewImageUrl("");
  };

  // Sync profile key if prop changes (essential map-to-guide seamless linkage)
  useEffect(() => {
    if (selectedSpeciesName && speciesProfiles[selectedSpeciesName]) {
      setProfileKey(selectedSpeciesName);
    }
  }, [selectedSpeciesName]);

  const currentProfile = speciesProfiles[profileKey] || speciesProfiles["Blue Morpho"];

  const climateData = React.useMemo(() => {
    const baseTemp = parseInt(currentProfile.avgTemp) || 25;
    const baseHum = parseInt(currentProfile.humidity) || 75;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, idx) => {
      const seed = (currentProfile.speciesName.length + idx) * 0.85;
      const tempOffset = Math.sin(seed) * 2.5 + Math.cos(seed * 0.5) * 1;
      const humOffset = Math.cos(seed) * 3.5 + Math.sin(seed * 0.5) * 1.5;
      return {
        month: m,
        "Temp (°C)": parseFloat((baseTemp + tempOffset).toFixed(1)),
        "Humidity (%)": parseFloat((baseHum + humOffset).toFixed(1))
      };
    });
  }, [currentProfile.avgTemp, currentProfile.humidity, currentProfile.speciesName]);

  // 1. Available standard categories
  const categoriesList = ["All", "Birds", "Mammals", "Flora", "Insects"];
  
  // 2. Count species in each category dynamically
  const categoryCounts = Object.values(speciesProfiles).reduce((acc, p) => {
    const cat = p.category || getSpeciesCategory(p);
    acc[cat] = (acc[cat] || 0) + 1;
    acc["All"] = (acc["All"] || 0) + 1;
    return acc;
  }, { All: 0 } as Record<string, number>);

  // Render "Others" if any custom guides fall outside standard categories
  const activeCategories = [...categoriesList];
  Object.keys(categoryCounts).forEach((c) => {
    if (!activeCategories.includes(c) && c !== "All" && categoryCounts[c] > 0) {
      activeCategories.push(c);
    }
  });

  // 3. Filter species profiles based on chosen category and search query
  const filteredSpecies = Object.values(speciesProfiles).filter((p) => {
    const matchesCategory = selectedCategory === "All" || (p.category || getSpeciesCategory(p)).toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      p.speciesName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ecosystem && p.ecosystem.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 4. Auto-select first species in category if current selection doesn't match the new category
  useEffect(() => {
    if (selectedCategory === "All") return;
    const currentCat = currentProfile.category || getSpeciesCategory(currentProfile);
    if (currentCat.toLowerCase() !== selectedCategory.toLowerCase()) {
      const match = Object.values(speciesProfiles).find((p) => {
        const cat = p.category || getSpeciesCategory(p);
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      });
      if (match) {
        setProfileKey(match.speciesName);
        setActiveSlide(0);
      }
    }
  }, [selectedCategory]);

  // Gallery slider slides specifically for Blue Morpho or Scarlet Macaw, using realistic illustrations for other species
  const getGallerySlides = (profile: SpeciesData) => {
    const speciesName = profile.speciesName;
    const mainImg = profile.customImage || (profile.speciesName === "Blue Morpho" ? IMAGES.blueMorphoMain : profile.speciesName === "Snow Leopard" ? IMAGES.snowLeopard : profile.speciesName === "Giant Tree Fern" ? IMAGES.giantTreeFern : IMAGES.cloudForestOrchid);

    if (speciesName === "Blue Morpho") {
      return [
        { id: "s1", title: "Scale Microstructure", img: IMAGES.microscopicScale, desc: "Reflective chitinous structures bounce light wavelengths dynamically." },
        { id: "s2", title: "Understory Eyespots", img: IMAGES.undersideEyespots, desc: "Mimics predatory eyes to deter lizards and forest birds." },
        { id: "s3", title: "In-Flight Flash Contrast", img: IMAGES.inFlightFlash, desc: "Flashing visual pattern confuses predators mid-pursuit." },
        { id: "s4", title: "Chrysalis State", img: IMAGES.chrysalis, desc: "Camouflaged as a decaying leaf during pupal development." }
      ];
    } else if (speciesName === "Scarlet Macaw") {
      return [
        { id: "s1", title: "Plumage Detail", img: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=85", desc: "Ultra-vibrant structural feathers reflect pristine tropical sunlight." },
        { id: "s2", title: "Canopy Nesting Site", img: IMAGES.rainforestMapBackdrop, desc: "Nests high in large canopy cavities for predator protection." },
        { id: "s3", title: "Scientific Field Survey", img: IMAGES.analysisTeam, desc: "Understory team recording microclimate temperature and relative humidity." }
      ];
    } else {
      return [
        { 
          id: "s1", 
          title: "Primary Field Specimen", 
          img: mainImg, 
          desc: profile.description || `High-fidelity field photograph capturing distinct taxonomic traits of ${profile.speciesName}.` 
        },
        { 
          id: "s2", 
          title: "Specimen Silhouette", 
          img: mainImg, 
          desc: profile.funFacts?.[0] || `Close-range zoom on key morphologic indicators of this ${profile.category || 'local'} species.` 
        },
        { 
          id: "s3", 
          title: "Specimen Archive Mount", 
          img: IMAGES.archiveMount, 
          desc: `Standard biological herbarium/database mount showcasing morphological characteristics of ${profile.speciesName}.` 
        },
        { 
          id: "s4", 
          title: "Habitat Drone Overview", 
          img: IMAGES.rainforestMapBackdrop, 
          desc: `Environmental GIS grid mapping of active nesting & development quadrants in native range: ${profile.nativeRange || 'Local quadrant'}.` 
        }
      ];
    }
  };

  const gallerySlides = getGallerySlides(currentProfile);
  const [activeSlide, setActiveSlide] = useState(0);

  // Status Badge Builder
  const getStatusBadge = (status: string) => {
    const isLeastConcern = status === "Least Concern";
    const bg = isLeastConcern ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20";
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isLeastConcern ? "bg-emerald-600 animate-pulse-subtle" : "bg-amber-500 animate-pulse"}`}></span>
        {status}
      </span>
    );
  };

  // Animation layout configs
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.03, staggerDirection: -1, when: "afterChildren" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return (
    <div className={`font-sans min-h-screen pt-28 pb-16 relative overflow-hidden transition-all duration-300 ${
      theme === "night" 
        ? "bg-[#00100a] text-[#6ffbbe]" 
        : "bg-[#f9f9f8] text-[#1a1c1c]"
    }`}>
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      {/* Top Search Selector header */}
      <div className={`max-w-[1280px] mx-auto px-6 md:px-16 mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b pb-6 relative z-10 transition-colors duration-300 ${
        theme === "night" ? "border-emerald-950/80" : "border-[#bfc9c3]/30"
      }`}>
        <div>
          <motion.div 
            whileHover={{ x: -4 }}
            className={`flex items-center gap-2 cursor-pointer transition-all mb-1 font-semibold text-xs uppercase tracking-wider ${
              theme === "night" ? "text-emerald-500/80 hover:text-emerald-400" : "text-[#404944] hover:text-[#003527]"
            }`} 
            onClick={() => onNavigate(ActiveScreen.LANDING)}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </motion.div>
          <h2 className={`text-2xl font-extrabold tracking-tight font-display flex items-center gap-2 ${
            theme === "night" ? "text-emerald-400" : "text-[#003527]"
          }`}>
            <BookOpen className="w-6 h-6 text-emerald-700" />
            Taxonomic Field Guide
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
          {/* Real-time search bar */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search local library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`backdrop-blur-md border rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full shadow-sm transition-all duration-300 ${
                theme === "night" 
                  ? "bg-[#001c13] border-emerald-800/30 text-emerald-400 placeholder:text-emerald-800" 
                  : "bg-white/85 border-[#bfc9c3]/40 text-[#003527] placeholder:text-slate-400"
              }`}
            />
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${
              theme === "night" ? "text-emerald-600/80" : "text-[#003527]/50"
            }`}>
              <Compass className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-[10px] font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Custom Select dropdown for species switching */}
          <div className="relative w-full sm:w-56">
            <select
              value={profileKey}
              onChange={(e) => {
                setProfileKey(e.target.value);
                setActiveSlide(0);
              }}
              className={`appearance-none backdrop-blur-md border rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full shadow-sm cursor-pointer transition-all duration-300 ${
                theme === "night" 
                  ? "bg-[#001c13] border-emerald-800/30 text-emerald-400" 
                  : "bg-white/85 border-[#bfc9c3]/40 text-[#003527]"
              }`}
            >
              {filteredSpecies.map((p) => (
                <option key={p.speciesName} value={p.speciesName} className={theme === "night" ? "bg-[#001c13] text-emerald-400" : "bg-white text-[#003527]"}>
                  {p.speciesName}
                </option>
              ))}
              {filteredSpecies.length === 0 && (
                <option disabled className={theme === "night" ? "bg-[#001c13] text-emerald-400" : "bg-white text-[#003527]"}>No species found</option>
              )}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-3 flex items-center ${
              theme === "night" ? "text-emerald-500" : "text-[#003527]"
            }`}>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCompareLeftKey(profileKey);
              setIsCompareMode(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/25 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Compare Species</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md cursor-pointer ${
              theme === "night"
                ? "bg-emerald-950/40 hover:bg-emerald-950/60 text-[#6ffbbe] border border-emerald-500/30"
                : "bg-[#003527] hover:bg-[#064e3b] text-[#6ffbbe] border border-emerald-800/40"
            }`}
          >
            <Plus className="w-4 h-4 text-[#6ffbbe]" />
            <span>Add New Species</span>
          </motion.button>
        </div>
      </div>

      {/* Category Filter Navigation Bar */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-8 relative z-10">
        <div className={`flex flex-wrap items-center gap-2.5 backdrop-blur-md p-1.5 rounded-2xl border w-fit transition-colors duration-300 ${
          theme === "night" ? "bg-[#001c13]/55 border-emerald-950/40" : "bg-white/40 border-[#bfc9c3]/20"
        }`}>
          {activeCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            
            // Assign icons dynamically
            let icon = <Compass className="w-3.5 h-3.5" />;
            if (cat === "Birds") icon = <Bird className="w-3.5 h-3.5" />;
            else if (cat === "Mammals") icon = <PawPrint className="w-3.5 h-3.5" />;
            else if (cat === "Flora") icon = <Leaf className="w-3.5 h-3.5" />;
            else if (cat === "Insects") icon = <Bug className="w-3.5 h-3.5" />;
            else if (cat === "Others") icon = <Layers className="w-3.5 h-3.5" />;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? theme === "night"
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-400/10 scale-[1.02]"
                      : "bg-[#064e3b] text-white shadow-md shadow-emerald-950/15 scale-[1.02]" 
                    : theme === "night"
                      ? "text-emerald-400/80 hover:text-emerald-300 hover:bg-[#002419]/50"
                      : "text-[#404944] hover:text-[#003527] hover:bg-white/60"
                }`}
              >
                {icon}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isActive 
                    ? theme === "night" ? "bg-black/10 text-black" : "bg-white/20 text-white" 
                    : theme === "night" ? "bg-emerald-950/40 text-emerald-400/80" : "bg-black/5 text-[#404944]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Species Deck Carousel */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#003527]/70 font-mono">
              3D Specimen Deck ({filteredSpecies.length} Detected)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Hover to tilt 3D • Click to expand profile
          </span>
        </div>

        {/* Scroll Container */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-800/20 scrollbar-track-transparent flex gap-6 snap-x snap-mandatory">
          {filteredSpecies.map((s) => {
            const isActive = s.speciesName === currentProfile.speciesName;
            return (
              <div key={s.speciesName} className="snap-start shrink-0">
                <SpecimenCard3D 
                  species={s} 
                  isActive={isActive} 
                  onClick={() => {
                    setProfileKey(s.speciesName);
                    setActiveSlide(0);
                  }} 
                />
              </div>
            );
          })}
          {filteredSpecies.length === 0 && (
            <div className="w-full text-center py-10 bg-white/40 backdrop-blur-md rounded-2xl border border-[#bfc9c3]/15 text-xs text-slate-400 font-bold">
              No specimens matched the current category and filters.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <AnimatePresence mode="wait">
        {isCompareMode ? (
          <motion.div
            key="compare-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-[1280px] mx-auto px-6 md:px-16 space-y-6 relative z-10 mb-12"
          >
            {/* Analyzer Header */}
            <div className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[28px] p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider mb-1.5">
                  COMPARATIVE TAXONOMICAL HUB
                </span>
                <h2 className="text-2xl font-extrabold text-[#003527] font-display">Side-by-Side Taxonomy Analyzer</h2>
                <p className="text-xs text-[#404944] mt-0.5">Select two species from your bio-library to run side-by-side ecological and physiological matches.</p>
              </div>

              <button
                onClick={() => setIsCompareMode(false)}
                className="flex items-center gap-2 bg-[#003527] hover:bg-[#064e3b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Library</span>
              </button>
            </div>

            {/* Compare Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column Component */}
              <div className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-sm space-y-5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#404944] font-mono">Select Left Species</label>
                  <select
                    value={compareLeftKey}
                    onChange={(e) => setCompareLeftKey(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none cursor-pointer"
                  >
                    {Object.keys(speciesProfiles).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                {/* Render Left Species Data */}
                {(() => {
                  const s = speciesProfiles[compareLeftKey] || speciesProfiles["Blue Morpho"];
                  return (
                    <div className="space-y-5">
                      <div className="h-44 rounded-2xl overflow-hidden relative border border-slate-200">
                        <img 
                          src={getSpeciesImage(s.speciesName, s.customImage)} 
                          alt={s.speciesName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-3 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono italic">{s.scientificName}</span>
                          </div>
                          <span className="text-[9px] font-black text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/30">
                            {s.confidence}% MATCH
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {getStatusBadge(s.conservationStatus)}
                        {getRarityBadge(s.speciesName)}
                      </div>

                      {/* Stats Table */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Avg Temp</span>
                          <span className="text-xs font-extrabold text-[#003527] font-display">{s.avgTemp}</span>
                          {/* Visual mini bar */}
                          <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(10, (parseInt(s.avgTemp) || 20) * 2.5))}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Humidity</span>
                          <span className="text-xs font-extrabold text-[#003527] font-display">{s.humidity}</span>
                          {/* Visual mini bar */}
                          <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${parseInt(s.humidity) || 50}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center flex flex-col justify-between">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono font-sans">Biome</span>
                          <span className="text-[10px] font-extrabold text-[#003527] truncate font-display">{s.ecosystem}</span>
                          <span className="text-[8px] text-emerald-700 font-bold font-mono">ORGANIC</span>
                        </div>
                      </div>

                      {/* Detail Section */}
                      <div className="space-y-2 text-xs text-[#404944] leading-relaxed">
                        <h4 className="font-extrabold text-[#003527] uppercase tracking-wider text-[10px] font-mono">Taxonomical Profile</h4>
                        <div className="p-3.5 bg-[#f4f4f3]/40 border border-slate-100 rounded-xl space-y-1">
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Kingdom</span><span className="font-bold text-[#003527]">{s.kingdom}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Order</span><span className="font-bold text-[#003527]">{s.order}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Family</span><span className="font-bold text-[#003527]">{s.family}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Native Range</span><span className="font-bold text-[#003527] truncate max-w-[150px]">{s.nativeRange}</span></div>
                        </div>
                        <p className="text-[#404944] bg-white border border-slate-100 p-3.5 rounded-xl">{s.description}</p>
                      </div>

                      {/* Fun Facts */}
                      <div className="space-y-2 text-xs">
                        <h4 className="font-extrabold text-[#003527] uppercase tracking-wider text-[10px] font-mono">Primary Trivia</h4>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium leading-relaxed">
                          {s.funFacts.slice(0, 2).map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column Component */}
              <div className="bg-white/65 backdrop-blur-[24px] border border-white/50 rounded-[32px] p-6 shadow-sm space-y-5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#404944] font-mono">Select Right Species</label>
                  <select
                    value={compareRightKey}
                    onChange={(e) => setCompareRightKey(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none cursor-pointer"
                  >
                    {Object.keys(speciesProfiles).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                {/* Render Right Species Data */}
                {(() => {
                  const s = speciesProfiles[compareRightKey] || speciesProfiles["Snow Leopard"];
                  return (
                    <div className="space-y-5">
                      <div className="h-44 rounded-2xl overflow-hidden relative border border-slate-200">
                        <img 
                          src={getSpeciesImage(s.speciesName, s.customImage)} 
                          alt={s.speciesName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-3 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono italic">{s.scientificName}</span>
                          </div>
                          <span className="text-[9px] font-black text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/30">
                            {s.confidence}% MATCH
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {getStatusBadge(s.conservationStatus)}
                        {getRarityBadge(s.speciesName)}
                      </div>

                      {/* Stats Table */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono font-sans">Avg Temp</span>
                          <span className="text-xs font-extrabold text-[#003527] font-display">{s.avgTemp}</span>
                          {/* Visual mini bar */}
                          <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(10, (parseInt(s.avgTemp) || 20) * 2.5))}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono font-sans">Humidity</span>
                          <span className="text-xs font-extrabold text-[#003527] font-display">{s.humidity}</span>
                          {/* Visual mini bar */}
                          <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${parseInt(s.humidity) || 50}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center flex flex-col justify-between">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Biome</span>
                          <span className="text-[10px] font-extrabold text-[#003527] truncate font-display">{s.ecosystem}</span>
                          <span className="text-[8px] text-emerald-700 font-bold font-mono">ORGANIC</span>
                        </div>
                      </div>

                      {/* Detail Section */}
                      <div className="space-y-2 text-xs text-[#404944] leading-relaxed">
                        <h4 className="font-extrabold text-[#003527] uppercase tracking-wider text-[10px] font-mono">Taxonomical Profile</h4>
                        <div className="p-3.5 bg-[#f4f4f3]/40 border border-[#bfc9c3]/10 rounded-xl space-y-1">
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Kingdom</span><span className="font-bold text-[#003527]">{s.kingdom}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Order</span><span className="font-bold text-[#003527]">{s.order}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Family</span><span className="font-bold text-[#003527]">{s.family}</span></div>
                          <div className="flex justify-between"><span className="font-mono text-[9px] text-slate-400">Native Range</span><span className="font-bold text-[#003527] truncate max-w-[150px]">{s.nativeRange}</span></div>
                        </div>
                        <p className="text-[#404944] bg-white border border-slate-100 p-3.5 rounded-xl">{s.description}</p>
                      </div>

                      {/* Fun Facts */}
                      <div className="space-y-2 text-xs">
                        <h4 className="font-extrabold text-[#003527] uppercase tracking-wider text-[10px] font-mono font-sans">Primary Trivia</h4>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium leading-relaxed">
                          {s.funFacts.slice(0, 2).map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div 
            key={profileKey}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10"
          >
        
        {/* Left Column: Core Overview & Galleries (7 Columns) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main profile banner and image */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] rounded-[32px] overflow-hidden shadow-[0_12px_40px_rgba(6,78,59,0.04)] border border-white/50"
          >
            <div className="h-[360px] relative overflow-hidden group">
              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: isScanning ? 1.08 : 1 }}
                transition={{ duration: 0.6 }}
                src={getSpeciesImage(currentProfile.speciesName, currentProfile.customImage)}
                alt={currentProfile.speciesName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              
              {/* Interactive holographic scan sweeps */}
              {isScanning && (
                <>
                  {/* Neon sweeping laser line */}
                  <div className="absolute inset-x-0 h-[2px] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] z-20 animate-laser-sweep" />
                  
                  {/* Grid matrix overlay */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-10 animate-pulse-subtle" />
                  
                  {/* Pinpoints overlaying the image */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                    <div className="absolute top-1/4 left-1/3 flex items-center gap-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                      <span className="bg-[#002419]/95 border border-emerald-400/50 text-[8px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded shadow-md backdrop-blur-sm">
                        CELL_DENSITY: 98.4%
                      </span>
                    </div>

                    <div className="absolute top-1/2 left-2/3 flex items-center gap-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                      <span className="bg-[#002419]/95 border border-emerald-400/50 text-[8px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded shadow-md backdrop-blur-sm">
                        THERMAL_NODE: ACTIVE
                      </span>
                    </div>

                    <div className="absolute bottom-1/3 left-1/4 flex items-center gap-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6ffbbe]"></span>
                      </span>
                      <span className="bg-[#002419]/95 border border-[#6ffbbe]/50 text-[8px] font-mono font-bold text-[#6ffbbe] px-1.5 py-0.5 rounded shadow-md backdrop-blur-sm">
                        CHITIN_RESONANCE: OK
                      </span>
                    </div>
                  </motion.div>
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#001c14]/90 via-transparent to-transparent"></div>
              
              {/* Scanner Control Trigger */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all shadow-md cursor-pointer ${
                    isScanning
                      ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                      : "bg-[#002419]/80 border-emerald-800 text-emerald-400 hover:bg-[#002419]"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isScanning ? "Scanner Online" : "Bio-Holo Scanner"}</span>
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <div className="mb-2 flex flex-wrap gap-2">
                  {getStatusBadge(currentProfile.conservationStatus)}
                  {getRarityBadge(currentProfile.speciesName)}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">{currentProfile.speciesName}</h1>
                <p className="text-sm text-emerald-300 italic font-medium mt-1 font-mono">{currentProfile.scientificName}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex gap-6 border-b border-slate-100 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab("specimen")}
                  className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === "specimen" ? "border-emerald-700 text-emerald-800" : "border-transparent text-[#8d928f] hover:text-[#003527]"
                  }`}
                >
                  Specimen Profile
                </button>
                <button
                  onClick={() => setActiveTab("ecosystem")}
                  className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === "ecosystem" ? "border-emerald-700 text-emerald-800" : "border-transparent text-[#8d928f] hover:text-[#003527]"
                  }`}
                >
                  Habitat Parameters
                </button>
              </div>

              <div className="relative min-h-[190px]">
                <AnimatePresence mode="wait">
                  {activeTab === "specimen" ? (
                    <motion.div
                      key="specimen"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-[#404944] leading-relaxed font-sans">{currentProfile.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3">
                        <div className="p-3.5 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                          <span className="block text-[9px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Kingdom</span>
                          <span className="text-xs font-bold text-[#003527] font-display">{currentProfile.kingdom}</span>
                        </div>
                        <div className="p-3.5 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                          <span className="block text-[9px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Order</span>
                          <span className="text-xs font-bold text-[#003527] font-display">{currentProfile.order}</span>
                        </div>
                        <div className="p-3.5 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                          <span className="block text-[9px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Family</span>
                          <span className="text-xs font-bold text-[#003527] font-display">{currentProfile.family}</span>
                        </div>
                        <div className="p-3.5 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10">
                          <span className="block text-[9px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Native Range</span>
                          <span className="text-xs font-bold text-[#003527] truncate block font-display">{currentProfile.nativeRange}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ecosystem"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10 text-center">
                          <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                          <span className="block text-[8px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Avg Temp</span>
                          <span className="text-sm font-extrabold text-[#003527] font-display">{currentProfile.avgTemp}</span>
                        </div>
                        <div className="p-4 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10 text-center">
                          <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                          <span className="block text-[8px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Humidity</span>
                          <span className="text-sm font-extrabold text-[#003527] font-display">{currentProfile.humidity}</span>
                        </div>
                        <div className="p-4 bg-[#f4f4f3]/50 rounded-2xl border border-[#bfc9c3]/10 text-center">
                          <Globe className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                          <span className="block text-[8px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Biome</span>
                          <span className="text-xs font-extrabold text-[#003527] truncate block mt-0.5 font-display">{currentProfile.ecosystem}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#404944] leading-relaxed flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                        <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <span>Environmental triggers such as humidity spikes, rainfall frequencies, and microclimatic stability are essential for tracking and maintaining high observation densities.</span>
                      </p>

                      {/* Interactive Historical Climate Trend Widget */}
                      <div className="border-t border-[#bfc9c3]/15 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="block text-[9px] font-bold text-[#8d928f] uppercase tracking-widest font-mono">Habitat Climate Trends (6-Month History)</span>
                          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded font-mono">SENSOR DEPLOYED</span>
                        </div>
                        <div className="h-40 w-full select-none">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={climateData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                              <XAxis 
                                dataKey="month" 
                                stroke="#8d928f" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#8d928f" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "#1a1c1c",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                  borderRadius: "12px",
                                  fontSize: "9px",
                                  fontFamily: "monospace",
                                  color: "white"
                                }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={24} 
                                iconSize={8}
                                wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Temp (°C)" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Humidity (%)" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Scientific Slide Archive (Gallery Carousel) */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] border border-white/50"
          >
            <h3 className="text-base font-bold text-[#003527] mb-4 font-display flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-emerald-700" />
              Scientific Archive Slides
            </h3>
            
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 relative h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    src={gallerySlides[activeSlide].img}
                    alt={gallerySlides[activeSlide].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceiba_pentandra.jpg";
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-widest block mb-0.5">Slide {activeSlide + 1}</span>
                  <span className="font-extrabold text-sm font-display">{gallerySlides[activeSlide].title}</span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {gallerySlides.map((slide, idx) => (
                    <motion.button
                      key={slide.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveSlide(idx)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all uppercase tracking-wider ${
                        activeSlide === idx
                          ? "bg-[#064e3b] text-white border-transparent shadow-md shadow-emerald-950/15"
                          : "bg-[#f4f4f3] text-[#404944] border-transparent hover:bg-slate-200"
                      }`}
                    >
                      {slide.title.split(" ")[0]}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-[#404944] leading-relaxed font-sans min-h-[64px]">
                  {gallerySlides[activeSlide].desc}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Key Stats, Trivia & Comparisons (5 Columns) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Field Identification Stats Card */}
          <motion.div 
            variants={cardVariants}
            className="bg-[#003527] text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#6ffbbe] mb-6 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#6ffbbe]" />
              Field Assessment Telemetry
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs text-white/70">Classification Confidence</span>
                <span className="text-lg font-bold text-[#6ffbbe] font-display">{currentProfile.confidence}% Match</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs text-white/70">Scientific Consensus</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#6cf8bb]/20 text-[#6ffbbe] px-2.5 py-0.5 rounded-full uppercase border border-[#6cf8bb]/15">
                  <CheckCircle2 className="w-3 h-3 text-[#6ffbbe]" />
                  Fully Verified
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs text-white/70">Observation Priority</span>
                <span className="text-xs font-bold text-yellow-400 font-mono">CLASS ALPHA</span>
              </div>
            </div>
          </motion.div>

          {/* Bio-Acoustic Radar & Call Simulator */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] border border-white/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#003527] font-display flex items-center gap-2">
                <Radio className="w-4.5 h-4.5 text-emerald-700 animate-pulse" />
                Acoustic Sonar HUD
              </h3>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${isSynthesizing ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-emerald-500/10 text-emerald-600"}`}>
                {isSynthesizing ? "TRANSMITTING" : "STANDBY"}
              </span>
            </div>

            {/* Radar / Spectrogram Grid Box */}
            <div className="bg-[#001c14] rounded-2xl h-36 relative overflow-hidden flex flex-col justify-between p-4 border border-emerald-950">
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              
              {/* Pulsing Sonar Rings in center when standby */}
              {!isSynthesizing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full border border-emerald-500/20 animate-ping absolute" />
                  <div className="w-12 h-12 rounded-full border border-emerald-500/35 animate-pulse-subtle flex items-center justify-center">
                    <Radio className="w-5 h-5 text-emerald-500/40" />
                  </div>
                </div>
              )}

              {/* Live Oscilloscope Wave */}
              {isSynthesizing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                  <div className="w-full h-20 flex items-end justify-center gap-[2px]">
                    {analyserData.map((val, idx) => {
                      const h = Math.max(4, Math.abs(val));
                      return (
                        <div 
                          key={idx} 
                          style={{ height: `${h}%` }}
                          className="w-[3px] bg-gradient-to-t from-emerald-400 to-teal-300 rounded-full transition-all duration-75"
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overlay HUD Readouts */}
              <div className="flex justify-between items-start text-[8px] font-mono text-emerald-400/80 z-10 pointer-events-none">
                <span>FREQ: {isSynthesizing ? (currentProfile.speciesName.toLowerCase().includes("macaw") ? "950 Hz" : "432 Hz") : "0.0 Hz"}</span>
                <span>SIG_DECIBELS: {isSynthesizing ? "-14.2 dB" : "-Infinity dB"}</span>
              </div>

              <div className="flex justify-between items-end text-[8px] font-mono text-emerald-400/80 z-10 pointer-events-none">
                <span>CH: MONO_01</span>
                <span>RES_INDEX: {isSynthesizing ? "ALPHA_MATCH" : "READY"}</span>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-3">
              <p className="text-[11px] text-[#404944] leading-relaxed">
                Run a synthesized sonic frequency match of this specimen's bio-acoustics. The radar sweeps the local sector frequencies using Web Audio resonance layers.
              </p>

              <button
                onClick={triggerAcousticSimulation}
                disabled={isSynthesizing}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isSynthesizing
                    ? "bg-red-50 text-red-600 border-red-200 cursor-not-allowed"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer"
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isSynthesizing ? "animate-bounce" : ""}`} />
                <span>{isSynthesizing ? "Synthesizing Sector Frequency..." : "Synthesize Bio-Acoustic Call"}</span>
              </button>
            </div>
          </motion.div>

          {/* Educational Trivia facts */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] border border-white/50"
          >
            <h3 className="text-base font-bold text-[#003527] mb-4 font-display flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-700" />
              Observations & Trivia
            </h3>
            <ul className="space-y-4">
              {currentProfile.funFacts.map((fact, idx) => (
                <li key={idx} className="flex gap-3 text-xs text-[#404944] leading-relaxed">
                  <div className="w-5.5 h-5.5 rounded-xl bg-emerald-500/10 flex-shrink-0 flex items-center justify-center text-emerald-800 font-extrabold text-[11px] font-display border border-emerald-500/10">
                    0{idx + 1}
                  </div>
                  <p className="font-sans">{fact}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Similar Species Comparative Matrix */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/65 backdrop-blur-[24px] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(6,78,59,0.04)] border border-white/50"
          >
            <h3 className="text-base font-bold text-[#003527] mb-4 font-display flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-emerald-700" />
              Morphology Comparisons
            </h3>
            <div className="space-y-3">
              {currentProfile.similarSpecies.map((sim, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    if (speciesProfiles[sim.speciesName]) {
                      setProfileKey(sim.speciesName);
                      setActiveSlide(0);
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#f4f4f3]/60 border border-[#bfc9c3]/15 flex items-center justify-between hover:bg-white hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="min-w-0 pr-2">
                    <span className="block font-extrabold text-xs text-[#003527] font-display">{sim.speciesName}</span>
                    <span className="block text-[10px] text-[#8d928f] italic truncate font-mono">{sim.scientificName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/10 whitespace-nowrap">
                    {sim.similarity}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

      </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Species Registration Form Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#001c14]/40 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#003527] text-white px-6 py-5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight font-display">Register Local Species</h3>
                  <p className="text-[10px] text-emerald-300 font-mono mt-0.5 uppercase tracking-wider">Manual Field Entry Form</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitNewSpecies} className="overflow-y-auto p-6 space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Species Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Golden Poison Frog"
                      value={newSpeciesName}
                      onChange={(e) => setNewSpeciesName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Scientific Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phyllobates terribilis"
                      value={newScientificName}
                      onChange={(e) => setNewScientificName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600 italic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="Flora">Flora (Plants, Flowers, Ferns)</option>
                      <option value="Insects">Insects (Butterflies, Beetles)</option>
                      <option value="Mammals">Mammals (Cats, Bears, Wolves)</option>
                      <option value="Birds">Birds (Parrots, Eagles, Owls)</option>
                      <option value="Others">Others / Reptiles / Amphibians</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Conservation Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="Least Concern">Least Concern (LC)</option>
                      <option value="Vulnerable">Vulnerable (VU)</option>
                      <option value="Endangered">Endangered (EN)</option>
                      <option value="Critically Endangered">Critically Endangered (CR)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Taxonomic Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a short description of physical taxonomy, behaviors, habitats, and environmental indicators..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#404944] leading-relaxed outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Native Range</label>
                    <input
                      type="text"
                      placeholder="e.g. Colombia"
                      value={newRange}
                      onChange={(e) => setNewRange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Avg Temp</label>
                    <input
                      type="text"
                      placeholder="e.g. 26°C"
                      value={newTemp}
                      onChange={(e) => setNewTemp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Humidity</label>
                    <input
                      type="text"
                      placeholder="e.g. 85%"
                      value={newHumidity}
                      onChange={(e) => setNewHumidity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Ecosystem</label>
                    <input
                      type="text"
                      placeholder="e.g. Rain Forest"
                      value={newEcosystem}
                      onChange={(e) => setNewEcosystem(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-[#003527] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Fun Fact / Observation 1</label>
                    <input
                      type="text"
                      placeholder="e.g. Possesses bright coloration warning predators of extreme toxicity."
                      value={newFact1}
                      onChange={(e) => setNewFact1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#404944] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Fun Fact / Observation 2</label>
                    <input
                      type="text"
                      placeholder="e.g. Primarily active during daylight humid showers."
                      value={newFact2}
                      onChange={(e) => setNewFact2(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#404944] outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#404944] font-mono">Specimen Image *</label>
                  
                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("guide-file-upload")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] relative ${
                      isDragOver ? "border-emerald-500 bg-emerald-500/5" : "border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/55"
                    }`}
                  >
                    <input
                      type="file"
                      id="guide-file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLocalFileChange}
                    />

                    {newImageUrl ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm">
                        <img src={newImageUrl} alt="Specimen Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[11px] font-bold gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                          <span>🔄 Click or Drag to Replace</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-1.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto">
                          <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-[11px]">Drag and drop file here, or click to browse</p>
                          <p className="text-[9px] text-[#4d5e54] mt-0.5">JPG, PNG, or WebP files supported</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Or Manual URL Field */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 font-mono text-center">— OR ENTER IMAGE URL —</span>
                    <input
                      type="text"
                      placeholder="Enter a direct image URL..."
                      value={newImageUrl.startsWith("data:") ? "" : newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#003527] font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Presets */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">Select from premium stock presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {presetImages.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setNewImageUrl(img.url)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold border transition-all cursor-pointer ${newImageUrl === img.url ? "bg-emerald-600 border-transparent text-white" : "bg-[#f4f4f3] border-slate-200 text-[#404944] hover:bg-slate-200"}`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    Register Species (+75 PTS)
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
