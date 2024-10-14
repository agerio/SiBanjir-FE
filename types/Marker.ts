export interface FloodWatch {
    id: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    xingname: string;
    class: string;
    tendency?: string;
    hgt: number;
    obs_time: string;
  }
  
export interface SpecialWarning {
    id: string;
    description: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    image_url: string;
    created_at: string;
}

export interface FriendLocation {
    id: string;
    last_login: string;
    image_url: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}