export interface UserProfile {
  username: string;
  email: string;
  points: number;
  streak: number;
  avatar: string;
  rank: string;
  registeredAt: string;
}

export enum ActiveScreen {
  LANDING = "landing",
  MAP = "map",
  HQ = "hq",
  GUIDE = "guide"
}

export interface SimilarSpecies {
  speciesName: string;
  scientificName: string;
  similarity: string;
  imageUrl?: string;
}

export interface SpeciesData {
  speciesName: string;
  scientificName: string;
  confidence: number;
  kingdom: string;
  order: string;
  family: string;
  description: string;
  conservationStatus: string;
  nativeRange: string;
  funFacts: string[];
  ecosystem: string;
  avgTemp: string;
  humidity: string;
  similarSpecies: SimilarSpecies[];
  customImage?: string; // Stored uploaded image URL
  category?: string; // e.g. "Birds", "Mammals", "Flora", "Insects", "Others"
  warning?: string; // Informative warning message when server fails
}

export interface Sighting {
  id: string;
  speciesName: string;
  scientificName: string;
  location: string;
  timestamp: string;
  reporter: string;
  confidence: number;
  image: string;
  verified: boolean;
  notes?: string;
  coords?: { top: string; left: string };
  lat?: number;
  lng?: number;
}
