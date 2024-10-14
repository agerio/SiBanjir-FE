import React, { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Appearance, Dimensions } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import ShowMap from "../../components/ShowMap";
import RefreshButton from "@/components/RefreshButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markers } from "@/types/Marker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker';

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
      <RefreshButton onRefresh={refreshData} loading={loading}/>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
