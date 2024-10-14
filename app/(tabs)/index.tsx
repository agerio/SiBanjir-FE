import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Appearance, Dimensions } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import ShowMap from "../../components/ShowMap";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markers } from "@/types/Marker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchAllowLocationSharing, fetchFloodwatches, fetchSpecialWarnings, fetchFriendLocation } from '@/api/marker';
import RefreshButton from "@/components/RefreshButton";
import BottomSheet, { BottomSheetSectionList } from "@gorhom/bottom-sheet";

const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function App() {
  const bottomSheetRef = useRef(null);
  
  const data = useMemo(() => [
    {
      title: 'Fruits',
      data: ['Apple', 'Banana', 'Cherry', 'Uwu', 'UWU', 'UWwU'],
    },
    {
      title: 'Vegetables',
      data: ['Carrot', 'Lettuce', 'Tomato'],
    },
  ], []);

  const params = useLocalSearchParams();
  const initialLocation = params.initialLocation?.toString();

  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [markers, setMarkers] = useState<Markers>({
    floodwatches: [],
    specialWarnings: [],
    friendLocation: [],
  });
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

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

  const buttonBottom = bottomSheetIndex === 0 ? '60%' : '10%'; // Adjust as needed

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
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={bottomSheetIndex}
          maxDynamicContentSize={screenHeight * 0.6}
          snapPoints={['3%', '40%']}
          onChange={index => setBottomSheetIndex(index)}
          backgroundStyle={styles.bottomSheetBackground} // Apply background style here
        >
          <BottomSheetSectionList
            contentContainerStyle={styles.contentContainer}
            sections={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.markerItemContainer}>
                <Text style={styles.markerText}>{item}</Text>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
          />
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  markerItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
  },
  markerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  markerDescription: {
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
});
