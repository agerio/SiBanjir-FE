export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  export interface FloodWatch {
    id: string;
    name: string;
    coordinates: Coordinates;
    hgt: number;
    class: string;
    obs_time: string;
    area_id: number;
  }
  
  export interface SpecialWarning {
    id: string;
    description: string;
    coordinates: Coordinates;
    image_url: string;
    created_at: string;
    profile_picture: string;
    verified_count: number;
    denied_count: number;
    created_by: string;
    has_verified: boolean;
    has_denied: boolean;
    is_creator: boolean;
  }
  
  export interface FriendLocation {
    id: string;
    last_login: string;
    coordinates: Coordinates;
    image_url: string;
    created_at: string;
  }
  
  export interface Markers {
    floodWatches: FloodWatch[];
    specialWarnings: SpecialWarning[];
    friendLocation: FriendLocation[];
  }