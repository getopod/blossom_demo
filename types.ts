
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
}

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  uri?: string;
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
  AGE_VERIFY = 'age-verify',
  ONBOARDING = 'onboarding',
  LOCATION = 'location',
  EFFECTS = 'effects',
  DISPENSARIES = 'dispensaries',
  LOADING = 'loading',
  FLIGHT = 'flight',
  TRIP_GUIDE = 'trip-guide',
  PROFILE = 'profile'
}
