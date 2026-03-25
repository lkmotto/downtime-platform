export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  scenario: string;
  source: string;
  source_url: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  date_start: string | null;
  date_end: string | null;
  time_info: string;
  price_range: string;
  price_note: string;
  image_url: string | null;
  camera_worthy: boolean;
  camera_note: string | null;
  tags: string[];
  score: number;
  is_featured: boolean;
  created_at: string;
}

export interface City {
  name: string;
  state: string;
  state_code: string;
  lat: number;
  lon: number;
  display: string;
}

export type Scenario = "all" | "date-night" | "solo" | "weekend-adventure" | "travel";
export type Category = "all" | "music" | "sports" | "arts" | "food" | "outdoor" | "nightlife" | "film" | "festivals" | "photography" | "motorsports";

export const SCENARIOS: { value: Scenario; label: string; icon: string; description: string }[] = [
  { value: "all", label: "Discover", icon: "Compass", description: "Everything worth doing" },
  { value: "date-night", label: "Date Night", icon: "Heart", description: "Impress your person" },
  { value: "solo", label: "Solo", icon: "User", description: "Camera-ready downtime" },
  { value: "weekend-adventure", label: "Weekend", icon: "Mountain", description: "Day trips & adventures" },
  { value: "travel", label: "Travel", icon: "Plane", description: "Worth the drive" },
];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "food", label: "Food" },
  { value: "outdoor", label: "Outdoor" },
  { value: "nightlife", label: "Nightlife" },
  { value: "film", label: "Film" },
  { value: "festivals", label: "Festivals" },
  { value: "photography", label: "Photo" },
  { value: "motorsports", label: "Motors" },
];

export const INTERESTS = [
  "Live Music", "Art Galleries", "Food & Dining", "Outdoor Adventures",
  "Photography", "Motorsports", "Film & Cinema", "Comedy",
  "Nightlife & Bars", "Festivals", "Sports", "Fitness",
  "Theater", "Markets & Shopping", "Tech & Gaming", "Wellness"
];

export const TOP_CITIES: City[] = [
  { name: "Dallas", state: "Texas", state_code: "TX", lat: 32.7767, lon: -96.7970, display: "Dallas, TX" },
  { name: "Austin", state: "Texas", state_code: "TX", lat: 30.2672, lon: -97.7431, display: "Austin, TX" },
  { name: "Houston", state: "Texas", state_code: "TX", lat: 29.7604, lon: -95.3698, display: "Houston, TX" },
  { name: "San Antonio", state: "Texas", state_code: "TX", lat: 29.4241, lon: -98.4936, display: "San Antonio, TX" },
  { name: "New York", state: "New York", state_code: "NY", lat: 40.7128, lon: -74.0060, display: "New York, NY" },
  { name: "Los Angeles", state: "California", state_code: "CA", lat: 34.0522, lon: -118.2437, display: "Los Angeles, CA" },
  { name: "Chicago", state: "Illinois", state_code: "IL", lat: 41.8781, lon: -87.6298, display: "Chicago, IL" },
  { name: "Miami", state: "Florida", state_code: "FL", lat: 25.7617, lon: -80.1918, display: "Miami, FL" },
  { name: "San Francisco", state: "California", state_code: "CA", lat: 37.7749, lon: -122.4194, display: "San Francisco, CA" },
  { name: "Seattle", state: "Washington", state_code: "WA", lat: 47.6062, lon: -122.3321, display: "Seattle, WA" },
  { name: "Denver", state: "Colorado", state_code: "CO", lat: 39.7392, lon: -104.9903, display: "Denver, CO" },
  { name: "Nashville", state: "Tennessee", state_code: "TN", lat: 36.1627, lon: -86.7816, display: "Nashville, TN" },
  { name: "Portland", state: "Oregon", state_code: "OR", lat: 45.5152, lon: -122.6784, display: "Portland, OR" },
  { name: "Atlanta", state: "Georgia", state_code: "GA", lat: 33.7490, lon: -84.3880, display: "Atlanta, GA" },
  { name: "Phoenix", state: "Arizona", state_code: "AZ", lat: 33.4484, lon: -112.0740, display: "Phoenix, AZ" },
  { name: "San Diego", state: "California", state_code: "CA", lat: 32.7157, lon: -117.1611, display: "San Diego, CA" },
  { name: "Boston", state: "Massachusetts", state_code: "MA", lat: 42.3601, lon: -71.0589, display: "Boston, MA" },
  { name: "Philadelphia", state: "Pennsylvania", state_code: "PA", lat: 39.9526, lon: -75.1652, display: "Philadelphia, PA" },
  { name: "Minneapolis", state: "Minnesota", state_code: "MN", lat: 44.9778, lon: -93.2650, display: "Minneapolis, MN" },
  { name: "Detroit", state: "Michigan", state_code: "MI", lat: 42.3314, lon: -83.0458, display: "Detroit, MI" },
  { name: "Fort Worth", state: "Texas", state_code: "TX", lat: 32.7555, lon: -97.3308, display: "Fort Worth, TX" },
  { name: "Charlotte", state: "North Carolina", state_code: "NC", lat: 35.2271, lon: -80.8431, display: "Charlotte, NC" },
  { name: "Las Vegas", state: "Nevada", state_code: "NV", lat: 36.1699, lon: -115.1398, display: "Las Vegas, NV" },
  { name: "New Orleans", state: "Louisiana", state_code: "LA", lat: 29.9511, lon: -90.0715, display: "New Orleans, LA" },
];
