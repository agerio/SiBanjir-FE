import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet, View, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import moment from 'moment';
import Ionicons from "@expo/vector-icons/Ionicons";

import { useLocalSearchParams } from "expo-router";
import { getDistance } from "geolib";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Markers, FloodWatch, SpecialWarning } from "@/types/Marker";
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker';

import RefreshButton from "@/components/RefreshButton";
import ShowMap from "@/components/ShowMap";


const screenHeight = Dimensions.get("window").height;

export interface FloodWatchWithDistance extends FloodWatch {
  distance: number;
}

export interface SpecialWarningWithDistance extends SpecialWarning {
  distance: number;
}

export default function App() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialLocation, setInitialLocation] = useState(params.initialLocation?.toString());
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  const [filteredFloodWatches, setFilteredFloodWatches] = useState<FloodWatchWithDistance[]>([]);
  const [filteredSpecialWarnings, setFilteredSpecialWarnings] = useState<SpecialWarningWithDistance[]>([]);
  const [markers, setMarkers] = useState<Markers>({
    floodWatches: [],
    specialWarnings: [],
    friendLocation: [],
  });
  const bottomSheetRef = useRef<BottomSheet>(null);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      await fetchAllowLocationSharing();
      const [floodWatches, specialWarnings, friendLocation] = await Promise.all([
        fetchFloodwatches(),
        fetchSpecialWarnings(),
        fetchFriendLocation(),
      ]);
      setMarkers({ floodWatches, specialWarnings, friendLocation });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNearbyFloodWatches = async () => {
    if (userLocation.latitude && userLocation.longitude) {
      const filteredFloodWatches: FloodWatchWithDistance[] = markers.floodWatches
        .map((fw) => ({
          ...fw,
          distance: getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: fw.coordinates.latitude, longitude: fw.coordinates.longitude }
          ),
        }))
        .filter(fw => fw.distance <= 3000);
  
      setFilteredFloodWatches(filteredFloodWatches);
    }
  };
  
  const getNearbySpecialWarning = async () => {
    if (userLocation.latitude && userLocation.longitude) {
      console.log(markers.specialWarnings.length)
      const filteredSpecialWarning: SpecialWarningWithDistance[] = markers.specialWarnings
        .map((sw) => ({
          ...sw,
          distance: getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: sw.coordinates.latitude, longitude: sw.coordinates.longitude }
          ),
        }))
        .filter(sw => sw.distance <= 1000);
  
      setFilteredSpecialWarnings(filteredSpecialWarning);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    setInitialLocation(params.initialLocation?.toString());
  }, [params.initialLocation]);
  
  useEffect(() => {
    getNearbyFloodWatches();
  }, [userLocation, markers.floodWatches]);
  
  useEffect(() => {
    getNearbySpecialWarning();
  }, [userLocation, markers.specialWarnings]);

  const handlePress = useCallback((id: string) => {
    setRefreshKey((prev) => prev + 1);
    setInitialLocation(id)

    if (bottomSheetRef.current) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <View style={styles.buttonContainer}>
            <RefreshButton onRefresh={refreshAllData} loading={loading} />
          </View>
        </View>

        <ShowMap
          initialLocation={initialLocation}
          refreshKey={refreshKey}
          floodWatches={markers.floodWatches}
          specialWarnings={markers.specialWarnings}
          friendLocations={markers.friendLocation}
          onLocationChange={setUserLocation}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          maxDynamicContentSize={screenHeight * 0.6}
          snapPoints={['4%']}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={{backgroundColor:'gray'}}
        >
          <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <>
                {filteredFloodWatches.length > 0 && (
                  <View>
                    <Text style={styles.header}>Nearby Flood Watches</Text>
                    {filteredFloodWatches.map(fw => (
                      <TouchableOpacity
                        key={fw.id}
                        style={styles.floodWatchContainer}
                        onPress={() => handlePress(fw.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.floodWatchText}>{fw.name}</Text>
                          <Text style={styles.floodWatchDescription}>{fw.class}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="white" style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {filteredSpecialWarnings.length > 0 && (
                  <View>
                    <Text style={styles.header}>Nearby Special Warnings</Text>
                    {filteredSpecialWarnings.map(sw => (
                      <TouchableOpacity key={sw.id} style={styles.specialWarningContainer} onPress={() => handlePress(sw.id)}>
                        <Image source={{ uri: sw.image_url }} style={styles.warningImage} />
                        <View style={styles.warningTextContainer}>
                          <Text style={styles.warningText}>{sw.description}</Text>
                          <View style={styles.metadataContainer}>
                            <Image source={sw.profile_picture ? { uri: sw.profile_picture } : require('@/assets/images/default_icon.png')} style={styles.profilePicture} />
                            <View style={styles.metadataTextContainer}>
                              <Text style={styles.username}>{sw.created_by}</Text>
                              <Text style={styles.createdAt}>{moment(sw.created_at).fromNow()}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: "#1e1e30",
  },
  buttonContainer: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: [{ translateX: -50 }],
    zIndex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#1e1e30",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: 10,
    marginLeft: 5,
  },
  floodWatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
},
  floodWatchText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  floodWatchDescription: {
    fontSize: 12,
    color: "#999",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  bottomSpace: {
    height: 100,
  },
  specialWarningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2b2b4b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  warningImage: {
    width: '40%',
    height: 80,
    borderRadius: 10,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#fff",
    flex: 1,
  },
  warningTextContainer: {
    width: '60%',
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  metadataTextContainer: {
    marginLeft: 15,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  createdAt: {
    fontSize: 10,
    color: '#999',
  },
});
