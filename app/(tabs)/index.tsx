import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet, View, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import moment from 'moment';
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useLocalSearchParams } from "expo-router";
import { getDistance } from "geolib";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Markers, FloodWatch, SpecialWarning } from "@/types/Marker";
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker';
import { API_URL, VERIFY_MINIMUM_RADIUS } from "@/context/GlobalContext";

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

  const refreshSpecialWarning = async () => {
    setLoading(true);
    try {
        const specialWarnings = await fetchSpecialWarnings();
        setMarkers(prevState => ({
            ...prevState,
            specialWarnings
        }));
    } catch (error) {
        console.error('Error refreshing special warnings:', error);
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
        .filter(fw => fw.distance <= 3000)
        .sort((a, b) => a.distance - b.distance);
  
      setFilteredFloodWatches(filteredFloodWatches);
    }
  };
  
  const getNearbySpecialWarning = async () => {
    if (userLocation.latitude && userLocation.longitude) {
      const filteredSpecialWarning: SpecialWarningWithDistance[] = markers.specialWarnings
        .map((sw) => ({
          ...sw,
          distance: getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: sw.coordinates.latitude, longitude: sw.coordinates.longitude }
          ),
        }))
        .filter(sw => sw.distance <= VERIFY_MINIMUM_RADIUS)
        .sort((a, b) => a.distance - b.distance);
  
      setFilteredSpecialWarnings(filteredSpecialWarning);
    }
  };

  const handleVerifyDeny = (id: string, isVerify: boolean, hasHistory: boolean) => {
    const action = isVerify ? 'verify' : 'deny';
    const altAction = isVerify ? 'denied' : 'verified'
    Alert.alert(
      'Confirmation', 
      `${hasHistory ? `You have ${altAction} this warning before. ` : ''}Are you sure you want to ${action} this warning?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await axios.get(`${API_URL}/specialwarning/warnings/${id}/${action}`);
              Alert.alert('Success', `${isVerify ? 'Verified' : 'Denied'} successfully!`);
              refreshSpecialWarning();
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    setInitialLocation(params.initialLocation?.toString());
  }, [params.initialLocation]);

  // Handle new special warning submission
  useEffect(() => {
    console.log(`addRefreshKey: ${params.addRefreshKey}`);
    (async () => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current?.snapToIndex(1);
      }
      await refreshSpecialWarning();
      setRefreshKey((prev) => prev + 1);
      setInitialLocation(params.mapFocusId?.toString());
    })();

  }, [params.addRefreshKey]);
  
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
      bottomSheetRef.current?.snapToIndex(1);
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
          index={1}
          maxDynamicContentSize={screenHeight * 0.6}
          snapPoints={['4%', '30%']}
          backgroundStyle={styles.bottomSheetBackground}
          handleStyle={{ height: 40 }}
          handleIndicatorStyle={{ backgroundColor: 'gray' }}
        >
          <View style={{ flex: 1 }}>
            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
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
                        <Text style={styles.floodWatchDescription}>{`${fw.class.toUpperCase()} (${fw.hgt})`}</Text>
                        <Text style={styles.floodWatchDescription}>{`${(fw.distance / 1000).toFixed(2)} km away from you!`}</Text>
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
                        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.warningText}>{sw.description}</Text>
                        <View style={styles.metadataContainer}>
                          <Image source={sw.profile_picture ? { uri: sw.profile_picture } : require('@/assets/images/default_icon.png')} style={styles.profilePicture} />
                          <View style={styles.metadataTextContainer}>
                            <Text style={styles.username}>{sw.created_by}</Text>
                            <Text style={styles.createdAt}>{moment(sw.created_at).fromNow()}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.verifDenyContainer}>
                        <TouchableOpacity 
                          onPress={() => {
                            if (!sw.has_verified && !sw.is_creator) {
                              handleVerifyDeny(sw.id, true, sw.has_denied);
                            }
                          }} 
                        >
                          <Ionicons 
                            style={styles.touchableShadow} 
                            name={sw.has_verified ? "checkmark-circle" : "checkmark-circle-outline"} 
                            size={20} 
                            color="green" 
                          />
                        </TouchableOpacity>
                        <Text
                          style={{
                            marginVertical: 3,
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: (sw.verified_count >= sw.denied_count ? 'darkgreen' : 'crimson')
                          }}
                        >
                          {sw.verified_count - sw.denied_count}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => {
                            if (!sw.has_denied && !sw.is_creator) {
                              handleVerifyDeny(sw.id, false, sw.has_verified);
                            }
                          }} 
                        >
                          <Ionicons 
                            style={styles.touchableShadow} 
                            name={sw.has_denied ? "close-circle" : "close-circle-outline"} 
                            size={20} 
                            color="crimson" 
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </BottomSheetScrollView>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
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
    marginBottom: 10,
  },
  warningImage: {
    width: '35%',
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#fff",
    flex: 1,
    textAlign: "justify",
  },
  warningTextContainer: {
    width: '55%',
    height: 100,
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  verifDenyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'red',
    marginTop: 17,
  },
  touchableShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  }
});
