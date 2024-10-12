import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Appearance, View, SafeAreaView, Text, Image, Dimensions, Alert, Button } from "react-native";
import MapView, { Circle, Marker, Callout, Region } from "react-native-maps";
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { API_URL } from "@/context/GlobalContext";
import axios from 'axios';

interface FloodWatch {
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

interface SpecialWarning {
  id: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image_url: string;
  created_at: string;
}

interface FriendLocation {
  id: string;
  last_login: string;
  image_url: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MapState {
  locationPermission: boolean;
  floodwatches: FloodWatch[];
  specialWarnings: SpecialWarning[];
  friendLocation: FriendLocation[];
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;

const floodClassColor: Record<string, string> = {
  "unknown": "#707070",
  "below minor": "#007502",
  "minor": "#29ccb9",
  "moderate": "#f0b01d",
  "major": "#c71c1c"
};

const floodWatchImage = {
  "unknown": require('@/assets/images/bom_floodwatch_unknown.png'),
  "below minor": require('@/assets/images/bom_floodwatch_below_minor.png'),
  "minor": require('@/assets/images/bom_floodwatch_minor.png'),
  "moderate": require('@/assets/images/bom_floodwatch_moderate.png'),
  "major": require('@/assets/images/bom_floodwatch_major.png')
};

const isValidCoordinates = (lat: string, long: string): boolean => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(long);

  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

interface ShowMapProps {
  initialLocation?: string | string[];
}

const ShowMap: React.FC<ShowMapProps> = ({ initialLocation }) => {
  const mapRef = useRef<MapView | null>(null); // Ref for MapView
  const markersRef = useRef<Record<string, Marker | null>>({}); // Refs for Markers

  const [mapState, setMapState] = useState<MapState>({
    locationPermission: false,
    floodwatches: [],
    specialWarnings: [],
    friendLocation: [],
    userLocation: {
      latitude: -27.5263381,
      longitude: 153.0954163,
    },
  });

  // Fetch flood watches
  useEffect(() => {
    const fetchFloodwatches = async () => {
      try {
        const response = await axios.get(`${API_URL}/govapi`);
        const floodwatches = response.data
          .filter((floodwatch: any) => isValidCoordinates(floodwatch.lat, floodwatch.long))
          .map((floodwatch: any) => ({
            id: floodwatch.stn_num,
            name: floodwatch.name,
            coordinates: {
              latitude: parseFloat(floodwatch.lat),
              longitude: parseFloat(floodwatch.long)
            },
            xingname: floodwatch.xingname,
            class: floodwatch.class.toLowerCase(),
            tendency: floodwatch.tendency,
            hgt: floodwatch.hgt,
            obs_time: floodwatch.obs_time,
          }));
        setMapState(prevState => ({ ...prevState, floodwatches }));
      } catch (error) {
        console.error('Error fetching floodwatches:', error);
      }
    };
    fetchFloodwatches();
  }, []);

  // Fetch special warnings
  useEffect(() => {
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
        setMapState(prevState => ({ ...prevState, specialWarnings }));
      } catch (error) {
        console.error('Error fetching special warnings:', error);
      }
    };
    fetchSpecialWarnings();
  }, []);

  // Fetch friend location
  useEffect(() => {
    const fetchFriendLocation = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/sendLocation`);
        const friendLocation = response.data
          .filter((friend_location: any) => isValidCoordinates(friend_location.lat, friend_location.long))
          .map((friend_location: any) => ({
            id: friend_location.friend_username,
            last_login: friend_location.last_login,
            coordinates: {
              latitude: parseFloat(friend_location.lat),
              longitude: parseFloat(friend_location.long),
            },
            image_url: friend_location.friend_profile_picture,
            created_at: friend_location.created_at,
          }));
        setMapState(prevState => ({ ...prevState, friendLocation }));
      } catch (error) {
        console.error('Error fetching special friend_locations:', error);
      }
    };
    fetchFriendLocation();
  }, []);

  // Handle location permissions
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setMapState(prevState => ({ ...prevState, locationPermission: true }));
      }
    };
    requestLocationPermission();
  }, []);

  // Handle granted permission
  useEffect(() => {
    if (!mapState.locationPermission) return;

    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10
      },
      location => {
        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        setMapState(prevState => ({
          ...prevState,
          userLocation,
        }));
      }
    );

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [mapState.locationPermission]);

  // Handle location change
  const lastFetchRef = useRef(0);
  const fetchInterval = 5000;
  useEffect(() => {
    if (!mapState.locationPermission) return;

    const fetchFloodwatches = async () => {
      const lat = mapState.userLocation.latitude;
      const long = mapState.userLocation.longitude;
      try {
        await axios.post(`${API_URL}/user/sendLocation`, { lat, long });
      } catch (error) {
        console.error('Error sending location:', error);
      }
    };

    const now = Date.now();
    if (now - lastFetchRef.current >= fetchInterval) {
      fetchFloodwatches();
      lastFetchRef.current = now;
    }
  }, [mapState.userLocation]);

  // Handle initial location
  useEffect(() => {
    if (initialLocation) {
      focusOnMarker(initialLocation);
    }
  }, [initialLocation]);

  // Function to focus on a marker by ID
  const focusOnMarker = (id: string) => {
    const marker = markersRef.current[id];
    if (marker) {
      const markerLocation = 
        mapState.floodwatches.find(fw => fw.id === id)?.coordinates || 
        mapState.specialWarnings.find(sw => sw.id === id)?.coordinates ||
        mapState.friendLocation.find(fl => fl.id === id )?.coordinates;

      if (markerLocation) {
        const region: Region = {
          latitude: markerLocation.latitude,
          longitude: markerLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        mapRef.current?.animateToRegion(region, 500);
        setTimeout(() => {
          marker.showCallout();
        }, 500);
      }
    }
  };
  
  // Flood Watch renderer
  const renderFloodWatchMarker = (floodwatch: FloodWatch) => (
    <React.Fragment key={floodwatch.id}>
      <Marker
        ref={ref => (markersRef.current[floodwatch.id] = ref)}
        image={floodWatchImage[floodwatch.class]}
        coordinate={floodwatch.coordinates}
        title={floodwatch.name}
        description={`${floodwatch.class.toUpperCase()}${floodwatch.tendency ? ` (${floodwatch.tendency})` : ''}`}
      />
      <Circle
        center={floodwatch.coordinates}
        radius={500}
        strokeWidth={0}
        strokeColor={floodClassColor[floodwatch.class]}
        fillColor={`${floodClassColor[floodwatch.class]}30`}
      />
    </React.Fragment>
  );
  
    // Special Warning renderer
    const renderSpecialWarningMarker = (warning: SpecialWarning) => (
      <Marker
      ref={ref => (markersRef.current[warning.id] = ref)}
      image={require('@/assets/images/special_warning.png')}
      key={warning.id}
      coordinate={warning.coordinates}
      title="Special Warning"
      >
        <Callout>
          <View>
            <WebView style={{ height: 0.45*screenWidth , width: 0.7*screenWidth}} source={{ uri: warning.image_url }} />
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutDescription}>{warning.description}</Text>
              <Text style={styles.calloutDate}>{warning.created_at}</Text>
            </View>
          </View>
        </Callout>
      </Marker>
    );
    
    // Friend Location renderer
    const renderFriendLocation = (friendloc: FriendLocation) => (
      <React.Fragment key={friendloc.id}>
        <Marker
          ref={ref => (markersRef.current[friendloc.id] = ref)}
          coordinate={friendloc.coordinates}
          title={`${friendloc.id}`}
          description={`${friendloc.last_login}`}
        >
          {/* Custom marker with image */}
          <View style={styles.friendMarker}>
            <Image 
              style={{width:'100%', height:'100%'}}
              source={friendloc.image_url ? { uri: friendloc.image_url } : require('@/assets/images/default_icon.png')}/>
          </View>
        </Marker>
      </React.Fragment>
    );

  return (
    <>
      <MapView
        ref={mapRef}
        camera={{
          center: mapState.userLocation,
          pitch: 0,
          heading: 0,
          altitude: 3000,
          zoom: 15
        }}
        showsUserLocation={mapState.locationPermission}
        style={styles.container}
      >
        {/* Render Floodwatch Markers */}
        {mapState.floodwatches.map(renderFloodWatchMarker)}

        {/* Render SpecialWarning Markers */}
        {mapState.specialWarnings.map(renderSpecialWarningMarker)}

        {/* Render FriendLocation Markers */}
        {mapState.friendLocation.map(renderFriendLocation)}
      </MapView>
      {/* <Button title="Focus on a Flood Watch" onPress={() => focusOnMarker('bangsat')} /> */}
    </>
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
});

export default ShowMap;
