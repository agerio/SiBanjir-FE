import React, { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Appearance, Dimensions } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import ShowMap from "../../components/ShowMap";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markers } from "@/types/Marker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker'

const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;

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

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAllowLocationSharing();
      const [floodwatches, specialWarnings, friendLocation] = await Promise.all([
        fetchFloodwatches(),
        fetchSpecialWarnings(),
        fetchFriendLocation(),
      ]);
      setMarkers({ floodwatches, specialWarnings, friendLocation });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
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