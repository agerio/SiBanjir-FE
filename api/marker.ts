import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, ALLOW_LOCATION_SHARING } from '@/context/GlobalContext';
import { FloodWatch, SpecialWarning, FriendLocation } from '@/types/Marker'

const isValidCoordinates = (lat: string, long: string): boolean => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(long);

  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const fetchAllowLocationSharing = async (): Promise<void> => {
  try {
    const response = await axios.get<{ allow_location: boolean }>(`${API_URL}/user/switchLocation`);
    await AsyncStorage.setItem(ALLOW_LOCATION_SHARING, JSON.stringify(response.data.allow_location));
  } catch (error) {
    console.error('Error fetching allow location sharing:', error);
    throw error;
  }
};

export const fetchFloodwatches = async (): Promise<FloodWatch[]> => {
  try {
    const response = await axios.get<any[]>(`${API_URL}/govapi`);
    return response.data
      .filter((floodwatch) => isValidCoordinates(floodwatch.lat, floodwatch.long))
      .map((floodwatch) => ({
        id: floodwatch.stn_num,
        name: floodwatch.name,
        coordinates: {
          latitude: parseFloat(floodwatch.lat),
          longitude: parseFloat(floodwatch.long),
        },
        xingname: floodwatch.xingname,
        class: floodwatch.class.toLowerCase(),
        tendency: floodwatch.tendency,
        hgt: floodwatch.hgt,
        obs_time: floodwatch.obs_time,
      }));
  } catch (error) {
    console.error('Error fetching floodwatches:', error);
    throw error;
  }
};

export const fetchSpecialWarnings = async (): Promise<SpecialWarning[]> => {
  try {
    const response = await axios.get<any[]>(`${API_URL}/specialwarning/warnings`);
    return response.data
      .filter((warning) => isValidCoordinates(warning.lat, warning.long))
      .map((warning) => ({
        id: warning.id.toString(),
        description: warning.name,
        coordinates: {
          latitude: parseFloat(warning.lat),
          longitude: parseFloat(warning.long),
        },
        image_url: warning.image,
        created_at: warning.created_at,
        profile_picture: warning.profile_picture,
        verified_count: warning.verified_by.length,
        created_by: warning.created_by,
        has_verified: warning.has_verified,
        has_denied: warning.has_denied,
        is_creator: warning.is_creator,
      }));
  } catch (error) {
    console.error('Error fetching special warnings:', error);
    throw error;
  }
};

export const fetchFriendLocation = async (): Promise<FriendLocation[]> => {
  try {
    const response = await axios.get<any[]>(`${API_URL}/user/sendLocation`);
    return response.data
      .filter((friend_location) => isValidCoordinates(friend_location.lat, friend_location.long))
      .map((friend_location) => ({
        id: friend_location.username,
        last_login: friend_location.last_login,
        coordinates: {
          latitude: parseFloat(friend_location.lat),
          longitude: parseFloat(friend_location.long),
        },
        image_url: friend_location.profile_picture,
        created_at: friend_location.created_at,
      }));
  } catch (error) {
    console.error('Error fetching friend locations:', error);
    throw error;
  }
};