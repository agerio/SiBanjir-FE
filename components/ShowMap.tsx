import React, { useState, useEffect } from "react";
import { StyleSheet, Appearance, View, SafeAreaView, Text, Image, Dimensions } from "react-native";
import MapView, { Circle, Marker, Callout } from "react-native-maps";
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getDistance } from "geolib";
import { API_URL } from "@/context/GlobalContext";
import axios from 'axios';

interface FloodWatch {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: {
    metres: number;
    nearby: boolean;
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

interface MapState {
  locationPermission: boolean;
  floodwatches: FloodWatch[];
  specialWarnings: SpecialWarning[];
  userLocation: {
    latitude: number;
    longitude: number;
  };
  nearbyFloodwatch?: FloodWatch;
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

const NearbyFloodwatch: React.FC<FloodWatch> = ({ name, distance }) => {
  if (!name) return null;

  return (
    <SafeAreaView style={styles.nearbyFloodwatchSafeAreaView}>
      <View style={styles.nearbyFloodwatchView}>
        <Text style={styles.nearbyFloodwatchText}>{name}</Text>
        {distance?.nearby && (
          <Text style={[styles.nearbyFloodwatchText, styles.nearbyFloodwatchTextBold]}>
            Within 100 Metres!
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
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

export default function ShowMap() {
  const [mapState, setMapState] = useState<MapState>({
    locationPermission: false,
    floodwatches: [],
    specialWarnings: [],
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
            distance: {
              metres: 0,
              nearby: false
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
            id: warning.id,
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

  // Calculate distances to floodwatches
  useEffect(() => {
    if (!mapState.locationPermission) return;

    const calculateDistance = (userLocation: { latitude: number; longitude: number }) => {
      return mapState.floodwatches.map(floodwatch => {
        const distanceMetres = getDistance(userLocation, floodwatch.coordinates);
        
        // console.log('Floodwatch coordinates:', floodwatch.coordinates);
        // console.log('Distance calculated:', distanceMetres);

        return {
            ...floodwatch,
            distance: {
                metres: distanceMetres,
                nearby: distanceMetres <= 100
            }
        };
    }).sort((a, b) => a.distance.metres - b.distance.metres)[0];
    };

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
        console.log(calculateDistance(userLocation));
        const nearbyFloodwatch = calculateDistance(userLocation);
        setMapState(prevState => ({
          ...prevState,
          userLocation,
          nearbyFloodwatch
        }));
      }
    );

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [mapState.locationPermission, mapState.floodwatches]);

  const renderSpecialWarningMarker = (warning: SpecialWarning) => (
    <Marker
      image={require('@/assets/images/special_warning.png')}
      key={warning.id}
      coordinate={warning.coordinates}
      title="Special Warning"
    >
      <Callout>
        {/* Method 1: style*/}
        {/* <Text style={{height: 200,flex: 1,marginTop: -85,width: 330,}}>
          <Image resizeMode="cover" source={{ uri: warning.image_url }} style={{height: 200,width: 330}}></Image>
        </Text> */}

        {/* Method 2: svg*/}
        {/* <Svg width={240} height={120}>
          <ImageSvg 
            width={"100%"}
            height={"100%"}
            preserveAspectRatio="xMidYMid slice"
            href={{ uri: warning.image_url }}
          />
        </Svg> */}

        {/* Method 3: webview*/}
        <View>
          {/* <Text style={styles.calloutTitle}>Special Warning</Text> */}
          <WebView style={{ height: 0.45*screenWidth , width: 0.7*screenWidth}} source={{ uri: warning.image_url }} />
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutDescription}>{warning.description}</Text>
            <Text style={styles.calloutDate}>{warning.created_at}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );

  return (
    <>
      <MapView
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
        {mapState.floodwatches.map(floodwatch => (
          <React.Fragment key={floodwatch.id}>
            <Marker
              image={floodWatchImage[floodwatch.class]}
              coordinate={floodwatch.coordinates}
              title={floodwatch.name}
              description={`${floodwatch.class.toUpperCase()}${floodwatch.tendency ? ` (${floodwatch.distance.metres})` : ''}`}
            />
            <Circle
              center={floodwatch.coordinates}
              radius={500}
              strokeWidth={0}
              strokeColor={floodClassColor[floodwatch.class]}
              fillColor={`${floodClassColor[floodwatch.class]}30`}
            />
          </React.Fragment>
        ))}

        {/* Render SpecialWarning Markers */}
        {mapState.specialWarnings.map(renderSpecialWarningMarker)}
      </MapView>
      {mapState.nearbyFloodwatch && <NearbyFloodwatch {...mapState.nearbyFloodwatch} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nearbyFloodwatchSafeAreaView: {
    backgroundColor: "black",
  },
  nearbyFloodwatchView: {
    padding: 20,
  },
  nearbyFloodwatchText: {
    color: "white",
    lineHeight: 25
  },
  nearbyFloodwatchTextBold: {
    fontWeight: "bold"
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
});