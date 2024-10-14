import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Appearance,
  View,
  SafeAreaView,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Circle, Marker, Callout } from "react-native-maps";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { API_URL } from "@/context/GlobalContext";
import axios from "axios";
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

// Main Map Component
export default function ShowMap() {
  const { expoPushToken, notification } = usePushNotifications();
  const [mapState, setMapState] = useState({
    locationPermission: false,
    floodwatches: [] as any[],
    specialWarnings: [] as any[],
    userLocation: {
      latitude: -27.5263381,
      longitude: 153.0954163,
    },
  });
  const notifiedFloodsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<Record<string, number>>({});

  const colorScheme = Appearance.getColorScheme();
  const screenWidth = Dimensions.get("window").width;

  const floodClassColor: Record<string, string> = {
    unknown: "#707070",
    "below minor": "#007502",
    minor: "#29ccb9",
    moderate: "#f0b01d",
    major: "#c71c1c",
  };

  const floodWatchImage: Record<string, any> = {
    unknown: require("@/assets/images/bom_floodwatch_unknown.png"),
    "below minor": require("@/assets/images/bom_floodwatch_below_minor.png"),
    minor: require("@/assets/images/bom_floodwatch_minor.png"),
    moderate: require("@/assets/images/bom_floodwatch_moderate.png"),
    major: require("@/assets/images/bom_floodwatch_major.png"),
  };

  const isValidCoordinates = (lat: number, long: number) => {
    const latitude = parseFloat(lat as any);
    const longitude = parseFloat(long as any);

    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

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

  // Fetch flood watches
  useEffect(() => {
    const fetchFloodwatches = () => {
      axios
        .get(`${API_URL}/govapi`)
        .then((response) => {
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
              distance: {
                metres: 0,
                nearby: false,
              },
              xingname: floodwatch.xingname,
              class: floodwatch.class.toLowerCase(),
              tendency: floodwatch.tendency,
              hgt: floodwatch.hgt,
              obs_time: floodwatch.obs_time,
            }));
          setMapState((prevState) => ({ ...prevState, floodwatches }));
        })
        .catch((error) => {
          console.error("Error fetching floodwatches:", error);
        });
    };
    fetchFloodwatches();
  }, []);

  // Fetch special warnings
  useEffect(() => {
    const fetchSpecialWarnings = () => {
      axios
        .get(`${API_URL}/specialwarning/warnings`)
        .then((response) => {
          const specialWarnings = response.data
            .filter((warning: any) =>
              isValidCoordinates(warning.lat, warning.long)
            )
            .map((warning: any) => ({
              description: warning.name,
              coordinates: {
                latitude: parseFloat(warning.lat),
                longitude: parseFloat(warning.long),
              },
              imageUrl: warning.image,
            }));
          setMapState((prevState) => ({ ...prevState, specialWarnings }));
        })
        .catch((error) => {
          console.error("Error fetching special warnings:", error);
        });
    };
    fetchSpecialWarnings();
  }, []);

  // Handle location permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setMapState((prevState) => ({
          ...prevState,
          locationPermission: true,
        }));
      }
    };
    requestPermissions();
  }, []);

  // Handle location updates and notifications
  useEffect(() => {
    if (!mapState.locationPermission) return;
  
    let lastCheckedLocation: Location.LocationObjectCoords | null = null;
  
    const calculateDistance = (
      userLocation: Location.LocationObjectCoords,
      floodwatches: any[],
      type: string
    ) => {
      return floodwatches
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
            calculateDistance(userLocation, mapState.floodwatches, "govapi");
            calculateDistance(userLocation, mapState.specialWarnings, "special");
            lastCheckedLocation = userLocation;
          }
  
          setMapState((prevState) => ({
            ...prevState,
            userLocation,
          }));
        }
      );
    };
  
    startLocationTracking();
  
    return () => {
      if (subscription) {
        subscription.remove(); // This now works after awaiting subscription
      }
    };
  }, [mapState.locationPermission, mapState.floodwatches, mapState.specialWarnings]);
  

  const renderSpecialWarningMarker = (warning: any) => (
    <Marker
      image={require("@/assets/images/special_warning.png")}
      key={warning.description}
      coordinate={warning.coordinates}
      title="Special Warning"
    >
      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutDescription}>{warning.description}</Text>
          <WebView
            style={{ height: 0.45 * screenWidth, width: 0.6 * screenWidth }}
            source={{ uri: warning.imageUrl }}
          />
        </View>
      </Callout>
    </Marker>
  );

  return (
    <MapView
      camera={{
        center: mapState.userLocation,
        pitch: 0,
        heading: 0,
        altitude: 3000,
        zoom: 15,
      }}
      showsUserLocation={mapState.locationPermission}
      style={styles.container}
    >
      {mapState.floodwatches.map((floodwatch, index) => (
        <React.Fragment key={floodwatch.id || index}>
          <Marker
            image={floodWatchImage[floodwatch.class]}
            coordinate={floodwatch.coordinates}
            title={floodwatch.name}
            description={`${floodwatch.class.toUpperCase()}${
              floodwatch.tendency ? ` (${floodwatch.tendency})` : ""
            }`}
          />
          <Circle
            center={floodwatch.coordinates}
            radius={500}
            strokeWidth={0}
            strokeColor={floodClassColor[floodwatch.class]}
            fillColor={
              colorScheme === "dark"
                ? "rgba(128,0,128,0.5)"
                : `${floodClassColor[floodwatch.class]}30`
            }
          />
        </React.Fragment>
      ))}

      {mapState.specialWarnings.map((warning, index) => (
        <Marker
          image={require("@/assets/images/special_warning.png")}
          key={warning.id || warning.description + index} // Use warning.id or combine description with index for uniqueness
          coordinate={warning.coordinates}
          title="Special Warning"
        >
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutDescription}>
                {warning.description}
              </Text>
              <WebView
                style={{ height: 0.45 * screenWidth, width: 0.6 * screenWidth }}
                source={{ uri: warning.imageUrl }}
              />
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calloutContainer: {
    width: 0.7 * Dimensions.get("window").width,
    padding: 10,
  },
  calloutDescription: {
    fontSize: 14,
  },
});
