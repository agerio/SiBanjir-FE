import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, StyleSheet, View, Image, TouchableOpacity, Appearance, Dimensions } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import ShowMap from "../../components/ShowMap";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markers, FloodWatch, SpecialWarning } from "@/types/Marker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker';
import RefreshButton from "@/components/RefreshButton";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { getDistance } from "geolib";
import moment from 'moment';

const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function App() {
  const bottomSheetRef = useRef(null);
  
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  const [filteredFloodWatches, setFilteredFloodWatches] = useState<FloodWatch[]>([]);
  const [filteredSpecialWarnings, setFilteredSpecialWarnings] = useState<SpecialWarning[]>([]);

  const params = useLocalSearchParams();
  const [initialLocation, setInitialLocation] = useState(params.initialLocation?.toString());
  useEffect(() => {
    setInitialLocation(params.initialLocation?.toString());
  }, [params.initialLocation]);

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

      if (userLocation.latitude && userLocation.longitude) {
        const filteredFloodWatches = floodwatches.filter(fw => {
          const distance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: fw.coordinates.latitude, longitude: fw.coordinates.longitude }
          );
          return distance <= 3000;
        });

        const filteredSpecialWarnings = specialWarnings.filter(sw => {
          const distance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: sw.coordinates.latitude, longitude: sw.coordinates.longitude }
          );
          return distance <= 3000;
        });

        setFilteredFloodWatches(filteredFloodWatches);
        setFilteredSpecialWarnings(filteredSpecialWarnings);
      }

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleFloodWatchPress = useCallback((id) => {
    setRefreshKey((prev) => prev + 1);
    setInitialLocation(id)

    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <View style={styles.buttonContainer}>
            <RefreshButton onRefresh={refreshData} loading={loading} />
          </View>
        </View>

        <ShowMap
          initialLocation={initialLocation}
          refreshKey={refreshKey}
          floodWatches={markers.floodwatches}
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
            {filteredFloodWatches.length > 0 && (
              <View>
                <Text style={styles.header}>Nearby Flood Watches</Text>
                {filteredFloodWatches.map(fw => (
                  <TouchableOpacity
                    key={fw.id}
                    style={styles.floodWatchContainer}
                    onPress={() => handleFloodWatchPress(fw.id)}  // Handle click
                  >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.floodWatchText}>{fw.name}</Text>
                        <Text style={styles.floodWatchDescription}>
                            {fw.class}
                        </Text>
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
      <View key={sw.id} style={styles.specialWarningContainer}>
        <Image source={{ uri: sw.image_url }} style={styles.warningImage} />

        <View style={styles.warningTextContainer}>
          <Text style={styles.floodWatchText}>{sw.description}</Text>
          
          <View style={styles.metadataContainer}>
            <Image source={sw.profile_picture ? { uri: sw.profile_picture } : require('@/assets/images/default_icon.png')} style={styles.profilePicture} />
            <View style={styles.metadataTextContainer}>
              <Text style={styles.username}>{sw.created_by}</Text>
              <Text style={styles.createdAt}>{moment(sw.created_at).fromNow()}</Text>
            </View>
          </View>
        </View>
      </View>
    ))}
  </View>
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
    width: '40%', // 6:4 ratio, with left side taking 40%
    height: 80, // Fixed height for the image
    borderRadius: 10,
  },
  warningTextContainer: {
    width: '60%', // 6:4 ratio, with right side taking 60%
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15, // Circular profile picture
  },
  metadataTextContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '70%', // Adjust width as needed
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
