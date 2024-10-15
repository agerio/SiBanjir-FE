import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Appearance, View, Text, Image, Dimensions, Platform, Button, ActivityIndicator, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from "react-native";
import MapView, { Circle, Marker, Callout, Region } from "react-native-maps";
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { API_URL, ALLOW_LOCATION_SHARING } from "@/context/GlobalContext";
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { floodClassColor, floodWatchImage } from "@/constants/FloodWatch";
import { FloodWatch, SpecialWarning, FriendLocation } from "@/types/Marker";
import moment from 'moment';
import { getDistance } from "geolib";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

// Your usePushNotifications hook
export const usePushNotifications = () => {
  const router = useRouter();
  const navigation = useNavigation();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined
  ); // Added type
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined); // Added type

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }
  
      // Ensure the projectId is a valid GUID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId || projectId === "your-fallback-project-id") {
        return;
      }
  
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } else {
      alert("Must be using a physical device for Push notifications");
    }
  
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  
    return token;
  }
  

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { type } = response.notification.request.content.data as {
          type: string;
        };

        // Navigate to the confirmation screen if it's a special warning
        if (type === "special") {
          router.push("../notif_related/SpecialWarningRequest");
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
  
const colorScheme = Appearance.getColorScheme();
const screenWidth = Dimensions.get("window").width;

interface MapState {
  locationPermission: boolean;
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

interface ShowMapProps {
  initialLocation?: string;
  refreshKey?: number;
  floodWatches: FloodWatch[];
  specialWarnings: SpecialWarning[];
  friendLocations: FriendLocation[];
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
}

const ShowMap: React.FC<ShowMapProps> = ({ initialLocation, refreshKey, floodWatches, specialWarnings, friendLocations, onLocationChange }) => {
  const { expoPushToken, notification } = usePushNotifications();
  const mapRef = useRef<MapView | null>(null);
  const markersRef = useRef<Record<string, Marker | null>>({});
  const [mapState, setMapState] = useState<MapState>({
    locationPermission: false,
    userLocation: {
      latitude: -27.5263381,
      longitude: 153.0954163,
    },
  });
    
  const notifiedFloodsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<Record<string, number>>({});

  const colorScheme = Appearance.getColorScheme();
  const screenWidth = Dimensions.get("window").width;
        
  const showNotification = (
    floodwatchName: string | undefined, // floodwatchName can be undefined
    distance: number,
    type: string
  ) => {
    // If floodwatchName is undefined for a special warning, use 'description' instead
    if (!floodwatchName && type === 'special') {
      floodwatchName = 'Special Warning'; // You can provide a fallback name here or skip if no description
    }
  
    if (!floodwatchName) {
      console.warn("Skipping notification because floodwatchName is undefined.");
      return;
    }
  
    const notificationKey = `${floodwatchName}_${type}`;
    const currentTime = Date.now();
  
    // Check if this flood has been notified in the last 15 minutes
    if (
      !notifiedFloodsRef.current.has(notificationKey) ||
      currentTime - lastNotificationTimeRef.current[notificationKey] >
        15 * 60 * 1000
    ) {
      let title, body;
  
      if (type === "govapi") {
        title = "Flood Warning Nearby!";
        body = `You are within ${distance} meters of the flood warning: ${floodwatchName}`;
      } else if (type === "special") {
        title = "Special Warning Nearby!";
        body = `Special alert: ${floodwatchName} within ${distance} meters. Confirm if this is accurate.`;
      }
  
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { floodwatchName, distance, type }, 
          sound: true,
        },
        trigger: { seconds: 1 },
      })
        .then(() => {
          // Notification successfully scheduled
        })
        .catch((error) => {
          console.error("Error scheduling notification:", error);
        });
  
      // Post the notification to the API
      axios
      .post(
        `${API_URL}/notification/history`,
        { name: floodwatchName},  // Add distance here
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      )
      .then((response) => {
        // Handle success response
      })
      .catch((error) => {
        console.error(
          "Error posting notification history:",
          error.response?.data || error.message
        ); // Log detailed error message
      });
  
      // Update the notified floods set and last notification time
      notifiedFloodsRef.current.add(notificationKey);
      lastNotificationTimeRef.current[notificationKey] = currentTime;
    }
  };
        
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setMapState(prevState => ({ ...prevState, locationPermission: true }));
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handle location updates and notifications
  useEffect(() => {
    if (!mapState.locationPermission) return;
  
    let lastCheckedLocation: Location.LocationObjectCoords | null = null;
  
    const calculateDistance = (
      userLocation: Location.LocationObjectCoords,
      floodWatches: any[],
      type: string
    ) => {
      return floodWatches
        .map((floodwatch) => {
          const distance = getDistance(userLocation, floodwatch.coordinates);
          const isNearby = distance <= 1000;
  
          if (isNearby) {
            showNotification(floodwatch.name, distance, type);
          }
  
          return {
            ...floodwatch,
            distance: {
              metres: distance,
              nearby: distance <= 100,
            },
          };
        })
        .sort((a, b) => a.distance.metres - b.distance.metres)[0];
    };
  
    let subscription: Location.LocationSubscription | undefined;
  
    const startLocationTracking = async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 100, // Only update if user has moved 100 meters
          timeInterval: 60000, // Or every 60 seconds, whichever comes first
        },
        (location) => {
          const userLocation = location.coords;
  
          // Only recalculate distances if the user has moved significantly
          if (
            !lastCheckedLocation ||
            getDistance(lastCheckedLocation, userLocation) > 50
          ) {
            calculateDistance(userLocation, floodWatches, "govapi");
            calculateDistance(userLocation, specialWarnings, "special");
            lastCheckedLocation = userLocation;
          }
  
          setMapState((prevState) => ({
            ...prevState,
            userLocation,
          }));
          
          onLocationChange(userLocation);
        }
      );
    };
  
    startLocationTracking();
    
    return () => {
      if (subscription) {
        subscription.remove(); // This now works after awaiting subscription
      }
    };
  }, [mapState.locationPermission]);

  // Handle location change
  const lastFetchRef = useRef(0);
  const fetchInterval = 5000;
  useEffect(() => {
    if (!mapState.locationPermission) return;

    const sendUserLocation = async () => {
      const isAllowed = await AsyncStorage.getItem(ALLOW_LOCATION_SHARING);
      const parsedIsAllowed = isAllowed !== null ? JSON.parse(isAllowed) : true;
      if (!parsedIsAllowed) {
        return;
      }
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
      sendUserLocation();
      lastFetchRef.current = now;
    }
  }, [mapState.userLocation]);

  // Handle initial location
  useEffect(() => {
    if (initialLocation) {
      focusOnMarker(initialLocation);
    }
  }, [initialLocation, refreshKey]);

  // Function to focus on a marker by ID
  const focusOnMarker = (id: string) => {
    const marker = markersRef.current[id];
    if (marker) {
      const markerLocation = 
        floodWatches.find(fw => fw.id === id)?.coordinates || 
        specialWarnings.find(sw => sw.id === id)?.coordinates ||
        friendLocations.find(fl => fl.id === id)?.coordinates;

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
  const renderFloodWatchMarker = (floodWatch: FloodWatch) => (
    <React.Fragment key={floodWatch.id}>
      <Marker
        ref={ref => (markersRef.current[floodWatch.id] = ref)}
        image={floodWatchImage[floodWatch.class]}
        coordinate={floodWatch.coordinates}
        title={floodWatch.name}
        description={`${floodWatch.class.toUpperCase()}${floodWatch.tendency ? ` (${floodWatch.tendency})` : ''}`}
      />
      <Circle
        center={floodWatch.coordinates}
        radius={500}
        strokeWidth={0}
        strokeColor={floodClassColor[floodWatch.class]}
        fillColor={`${floodClassColor[floodWatch.class]}30`}
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
      <Callout tooltip={true}>
        <View style={styles.calloutWrapper}>
          <WebView
            style={styles.image}
            source={{ uri: warning.image_url }}
          />
          <Text style={styles.description}>{warning.description}</Text>
          <View style={styles.metadataContainer}>
            <View style={styles.profilePicture}>
              <WebView
                style={{flex:1}}
                source={warning.profile_picture ? { uri: warning.profile_picture } : require('@/assets/images/default_icon.png')}
              />
            </View>
            <View style={styles.metadataTextContainer}>
              <Text style={styles.username}>{warning.created_by}</Text>
              <Text style={styles.createdAt}>{moment(warning.created_at).fromNow()}</Text>
            </View>
            <View style={styles.verifDenyContainer}>
              <Text style={styles.verificationCount}>{warning.verified_count}</Text>
              <Ionicons name={warning.has_verified ? "checkmark-circle" : "checkmark-circle-outline"}  size={24} color="green" />
              <Text style={styles.denialCount}>{warning.denied_count}</Text>
              <Ionicons name={warning.has_denied ? "close-circle" : "close-circle-outline"} size={24} color="crimson" />
            </View>
          </View>
        </View>
        <View style={styles.triangle}/>
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
        description={`Last seen ${moment(friendloc.last_login).fromNow()}`}
      >
        <View style={styles.friendMarker}>
          <Image 
            style={{ width: '100%', height: '100%' }}
            source={friendloc.image_url ? { uri: friendloc.image_url } : require('@/assets/images/default_icon.png')} />
        </View>
      </Marker>
    </React.Fragment>
  );

  // Render the modal for legends
  const renderLegendModal = () => (
    <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Information</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 8,}}>
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollContainer}>
            {legendData.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <Image source={item.image} style={styles.legendImage} />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendTitle}>{item.title}</Text>
                  <Text style={styles.legendDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
            <View style={{marginBottom: 30}}></View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
    <View style={{ flex: 1, position: 'relative' }}>

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
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
        style={styles.container}
      >
        {/* Render FriendLocation Markers */}
        {friendLocations.map(renderFriendLocation)}

        {/* Render SpecialWarning Markers */}
        {specialWarnings.map(renderSpecialWarningMarker)}

        {/* Render Floodwatch Markers */}
        {floodWatches.map(renderFloodWatchMarker)}
      </MapView>
      
      {/* Legends Button */}
      {renderLegendModal()}
      <TouchableOpacity
        style={styles.legendButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="information-circle-outline" size={20} color="grey" />
      </TouchableOpacity>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e30",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '60%',
    backgroundColor: '#2b2b4b',
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1e1e30',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  legendTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  legendDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'justify',
  },
  legendButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 2,
    elevation: 5,
    opacity: 0.75,
  },
  legendButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  calloutWrapper: {
    backgroundColor: '#1e1e30',
    width: 0.8 * screenWidth,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
  },
  triangle: {
    width: 0,
    height: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderTopWidth: 15,
    borderTopColor: '#1e1e30',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftWidth: 10,
    borderRightWidth: 10,
  },
  image: {
    height: 0.45 * screenWidth,
    width: '100%',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: '#fff',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profilePicture: {
    overflow: 'hidden',
    flex: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  metadataTextContainer: {
    flex: 1,
    marginRight: 5,
    marginLeft: 15,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
  },
  verifDenyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  verificationCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
    marginRight: 3,
  },
  denialCount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
    color: 'crimson',
    marginRight: 3,
  },
  iconCloseButton: {
    marginLeft: 5,
    backgroundColor: '#912424',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  iconCheckButton: {
    marginLeft: 5,
    backgroundColor: '#53964e',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  friendMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
});


export default ShowMap;


const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0a1c2d" // Even darker muted blue-gray
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4a6662" // Softer, less saturated teal
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#0b1d2d" // Darker stroke with less intensity
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#31484e" // More muted gray-blue
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4b5f6c" // Even more muted slate gray
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#31484e" // More muted gray-blue stroke
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#253f5c" // Darker, less vibrant bluish-gray
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#01172a" // More muted, dark blue
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1c2c46" // Less vibrant, more muted dark blue-gray
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4d6b74" // Even more subdued blue-gray
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#0a1c2d" // Darker muted stroke color
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#01172a" // Darker, more muted park color
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#2a5b59" // Softer, grayish green
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1f334e" // Darker road color with less vibrancy
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#5e6c7c" // Softer, muted road text
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#0a1c2d" // Darker muted stroke for roads
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1a3e4a" // Slightly darker highway color
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#163d46" // Muted highway stroke
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7c9299" // More muted highway text
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#01172a" // Darker highway label stroke
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#5e6e7a" // Softer, more muted transit text
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#0a1c2d" // Darker muted stroke
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1c2c46" // Less vibrant, muted transit line
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#253645" // Muted dark gray
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#060c18" // Darker water with more gray
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3e5854" // More muted water text
      }
    ]
  }
];

const legendData = [
  {
    image: require('@/assets/images/special_warning.png'),
    title: "Special Warning",
    description: "A user-reported flood warning. If you are within the area, you can verify or deny the warning!"
  },
  {
    image: floodWatchImage['unknown'],
    title: "Unknown / No Classification",
    description: "No reliable data available. Conditions are uncertain, and potential flooding risks are unclear. Monitoring efforts may be hampered, making it difficult to provide an accurate assessment."
  },
  {
    image: floodWatchImage['below minor'],
    title: "Below Minor",
    description: "Water levels are rising but remain below thresholds that cause noticeable impacts. Some low-lying areas may experience minor inundation, but no significant disruptions to daily life are expected. Residents may notice wet ground conditions, but roads and access routes remain open."
  },
  {
    image: floodWatchImage['minor'],
    title: "Minor",
    description: "Causes inconvenience. Low-lying areas adjacent to watercourses are inundated, with minor roads potentially closed and low-level bridges submerged. In urban settings, backyards and buildings below floor level may be affected, as well as bicycle and pedestrian paths. In rural areas, removal of livestock and equipment may be necessary."
  },
  {
    image: floodWatchImage['moderate'],
    title: "Moderate",
    description: "In addition to minor flooding impacts, inundation coverage is more extensive. Main traffic routes may be affected, and some buildings could experience flooding above floor level. Evacuations from at-risk areas may be required. In rural regions, livestock removal becomes essential."
  },
  {
    image: floodWatchImage['major'],
    title: "Major",
    description: "Extensive flooding occurs in both rural and urban areas. Many buildings may be impacted above floor level, and properties, as well as entire towns, are likely to be isolated. Major rail and traffic routes may be closed, and evacuation of flood-affected areas is often necessary. Utility services such as electricity and water may be significantly disrupted."
  },
];
