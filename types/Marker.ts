export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  export interface FloodWatch {
    id: string;
    name: string;
    coordinates: Coordinates;
    xingname: string;
    class: string;
    tendency: string;
    hgt: string;
    obs_time: string;
  }
  
  export interface SpecialWarning {
    id: string;
    description: string;
    coordinates: Coordinates;
    image_url: string;
    created_at: string;
    profile_picture: string;
    verified_count: number;
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
    floodwatches: FloodWatch[];
    specialWarnings: SpecialWarning[];
    friendLocation: FriendLocation[];
  }