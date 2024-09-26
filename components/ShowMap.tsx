import React, { useState, useEffect } from "react";
import { StyleSheet, Appearance, View, SafeAreaView, Text } from "react-native";
import MapView, { Circle } from "react-native-maps";
import * as Location from 'expo-location';
import { getDistance } from "geolib";
import { API_URL } from "@/context/GlobalContext";
import axios from 'axios';

// Define Stylesheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nearbyLocationSafeAreaView: {
        backgroundColor: "black",
    },
    nearbyLocationView: {
        padding: 20,
    },
    nearbyLocationText: {
        color: "white",
        lineHeight: 25
    }
});

const colorScheme = Appearance.getColorScheme();

// Component for displaying nearest location and whether it's within 100 metres
function NearbyLocation(props) {
    if (typeof props.location !== "undefined") {
        return (
            <SafeAreaView style={styles.nearbyLocationSafeAreaView}>
                <View style={styles.nearbyLocationView}>
                    <Text style={styles.nearbyLocationText}>
                        {props.location}
                    </Text>
                    {props.distance?.nearby &&
                        <Text style={{
                            ...styles.nearbyLocationText,
                            fontWeight: "bold"
                        }}>
                            Within 100 Metres!
                        </Text>
                    }
                </View>
            </SafeAreaView>
        );
    }
    return null;
}

// Function to validate latitude and longitude
function isValidCoordinates(lat, long) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);

    return (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
}

export default function ShowMap() {
    // Setup state for map data
    const initialMapState = {
        locationPermission: false,
        locations: [],
        userLocation: {
            latitude: -27.5263381,
            longitude: 153.0954163,
        },
        nearbyLocation: {}
    };
    const [mapState, setMapState] = useState(initialMapState);

    // Fetch location data from API
    useEffect(() => {
        async function fetchLocations() {
            try {
                const response = await axios.get(`${API_URL}/govapi`);
                const locations = response.data
                    .filter(location => isValidCoordinates(location.lat, location.long)) // Filter invalid coordinates
                    .map(location => ({
                        id: location.stn_num,
                        name: location.name,
                        coordinates: {
                            latitude: parseFloat(location.lat),
                            longitude: parseFloat(location.long)
                        },
                        distance: {
                            metres: 0,
                            nearby: false
                        }
                    }));
                setMapState(prevState => ({
                    ...prevState,
                    locations
                }));
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        }
        fetchLocations();
    }, []);

    // Request location permission
    useEffect(() => {
        async function requestLocationPermission() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setMapState({
                    ...mapState,
                    locationPermission: true
                });
            }
        }
        requestLocationPermission();
    }, []);

    // Track user location and find nearest location
    useEffect(() => {
        function calculateDistance(userLocation) {
            const nearestLocations = mapState.locations.map(location => {
                const metres = getDistance(userLocation, location.coordinates);
                location.distance = {
                    metres: metres,
                    nearby: metres <= 100
                };
                return location;
            }).sort((a, b) => a.distance.metres - b.distance.metres);
            return nearestLocations[0];
        }

        if (mapState.locationPermission) {
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
                    const nearbyLocation = calculateDistance(userLocation);
                    setMapState(prevState => ({
                        ...prevState,
                        userLocation,
                        nearbyLocation
                    }));
                }
            );

            // Cleanup function
            return () => {
                if (subscription && typeof subscription.remove === 'function') {
                    subscription.remove();
                }
            };
        }
    }, [mapState.locationPermission]);

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
                {mapState.locations.map(location => (
                    <Circle
                        key={location.id}
                        center={location.coordinates}
                        radius={100}
                        strokeWidth={3}
                        strokeColor="#A42DE8"
                        fillColor={colorScheme === "dark" ? "rgba(128,0,128,0.5)" : "rgba(210,169,210,0.5)"}
                    />
                ))}
            </MapView>
            <NearbyLocation {...mapState.nearbyLocation} />
        </>
    );
}
