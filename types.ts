
export interface JournalEntry {
  strainName: string;
  acquired: boolean;
  timestamp: number;
  ratings: Record<string, {
    score: number;
    comment: string;
  }>;
}

export interface FlightRecord {
  id: string;
  timestamp: number;
  effects: string[];
  strains: Strain[];
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  age: number | null;
  sex: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  effects: string[];
  journal: Record<string, JournalEntry>;
  flightsHistory: FlightRecord[];
}

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  uri?: string;
  reviewSnippets?: string[];
}

export interface Strain {
  name: string;
  brand: string;
  thc: string;
  cbd: string;
  terpenes: string[];
  description: string;
}

export enum Screen {
  AUTH = 'auth',
  HOME = 'home',
  ONBOARDING = 'onboarding',
  LOCATION = 'location',
  EFFECTS = 'effects',
  DISPENSARIES = 'dispensaries',
  LOADING = 'loading',
  FLIGHT = 'flight',
  PROFILE = 'profile',
  BLOCKED = 'blocked',
  TERPENES_LIBRARY = 'terpenes_library',
  FEEDBACK = 'feedback'
}
