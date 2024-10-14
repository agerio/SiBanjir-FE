import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Appearance,
  View,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Button,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import ShowMap from "../../components/ShowMap";
import { SafeAreaView } from "react-native-safe-area-context";
import { FloodWatch, SpecialWarning, FriendLocation } from "@/types/Marker";
import { API_URL, ALLOW_LOCATION_SHARING } from "@/context/GlobalContext";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;

interface Markers {
  floodwatches: FloodWatch[];
  specialWarnings: SpecialWarning[];
  friendLocation: FriendLocation[];
}

export default function App() {
  const params = useLocalSearchParams();
  const initialLocation = params.initialLocation?.toString();

  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [markers, setMarkers] = useState<Markers>({
    floodwatches: [],
    specialWarnings: [],
    friendLocation: [],
  });

  // Function to trigger refresh
  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Increment key to force re-render
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchAllowLocationSharing();
      await fetchFloodwatches();
      await fetchSpecialWarnings();
      await fetchFriendLocation();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowLocationSharing = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/switchLocation`);
      await AsyncStorage.setItem(
        ALLOW_LOCATION_SHARING,
        JSON.stringify(response.data.allow_location)
      );
    } catch (error) {
      console.error("Error fetching allow location sharing:", error);
    }
  };

  const fetchFloodwatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/govapi`);
      const floodwatches = response.data
        .filter((floodwatch: any) =>
          isValidCoordinates(floodwatch.lat, floodwatch.long)
        )
        .map((floodwatch: any) => ({
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
      setMarkers((prevState) => ({ ...prevState, floodwatches }));
    } catch (error) {
      console.error("Error fetching floodwatches:", error);
    }
  };

  const fetchSpecialWarnings = async () => {
    try {
      const response = await axios.get(`${API_URL}/specialwarning/warnings`);
      const specialWarnings = response.data
        .filter((warning: any) => isValidCoordinates(warning.lat, warning.long))
        .map((warning: any) => ({
          id: warning.id.toString(),
          description: warning.name,
          coordinates: {
            latitude: parseFloat(warning.lat),
            longitude: parseFloat(warning.long),
          },
          image_url: warning.image,
          created_at: warning.created_at,
        }));
      setMarkers((prevState) => ({ ...prevState, specialWarnings }));
    } catch (error) {
      console.error("Error fetching special warnings:", error);
    }
  };

  const fetchFriendLocation = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/sendLocation`);
      const friendLocation = response.data
        .filter((friend_location: any) =>
          isValidCoordinates(friend_location.lat, friend_location.long)
        )
        .map((friend_location: any) => ({
          id: friend_location.username,
          last_login: friend_location.last_login,
          coordinates: {
            latitude: parseFloat(friend_location.lat),
            longitude: parseFloat(friend_location.long),
          },
          image_url: friend_location.profile_picture,
          created_at: friend_location.created_at,
        }));
      setMarkers((prevState) => ({ ...prevState, friendLocation }));
    } catch (error) {
      console.error("Error fetching special friend_locations:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchAllowLocationSharing(),
          fetchFloodwatches(),
          fetchSpecialWarnings(),
          fetchFriendLocation(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Refresh Map" onPress={handleRefresh} />
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshData}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="gray" style={{ marginRight: 8 }}/>
            <Text style={{ color: "gray", fontWeight: "bold" }}>Loading</Text>
          </>
        ) : (
          <>
            <Ionicons name="refresh" size={24} color="gray" style={{ marginRight: 8 }}/>
            <Text style={{ color: "gray", fontWeight: "bold" }}>Refresh</Text>
          </>
        )}
      </TouchableOpacity>
      <ShowMap
				initialLocation={initialLocation}
				refreshKey={refreshKey}
				floodWatches={markers.floodwatches}
				specialWarnings={markers.specialWarnings}
				friendLocations={markers.friendLocation}
			/>
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calloutContainer: {
    width: 0.7 * screenWidth,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutImage: {
    width: 200,
    height: 100,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
  },
  calloutDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  friendMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'blue',
  },
  refreshButton: {
    position: 'absolute',
    opacity: 0.80,
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});