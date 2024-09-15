import React, { useState, useEffect } from "react";
import { StyleSheet, Appearance, View, SafeAreaView, Text, Image, Platform } from "react-native";
import MapView, { Circle } from "react-native-maps";

// Use expo-location instead of Geolocation
import * as Location from 'expo-location';
import { getDistance } from "geolib";

import { locations } from "../data/locations";

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

// Get light or dark mode
const colorScheme = Appearance.getColorScheme();

// Component for displaying nearest location and whether it's within 100 metres
function NearbyLocation(props) {
    if(typeof props.location != "undefined") {
        return (
            <SafeAreaView style={styles.nearbyLocationSafeAreaView}>
                <View style={styles.nearbyLocationView}>
                    <Text style={styles.nearbyLocationText}>
                        {props.location}
                    </Text>
                    {props.distance.nearby &&
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
}

export default function ShowMap() {
    // Convert string-based latlong to object-based on each location
    const updatedLocations = locations.map(location => {
        const latlong = location.latlong.split(", ");

        location.coordinates = {
            latitude: parseFloat(latlong[0]),
            longitude: parseFloat(latlong[1])
        };
      
        return location;
    });

    // Setup state for map data
    const initialMapState = {
        locationPermission: false,
        locations: updatedLocations,
        userLocation: {
            latitude: -27.5263381,
            longitude: 153.0954163,
            // Starts at "Indooroopilly Shopping Centre"
        },
        nearbyLocation: {}
    };
    const [ mapState, setMapState ] = useState(initialMapState);

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

    useEffect(() => {

        // Function to retrieve location nearest to current user location
        function calculateDistance(userLocation) {
            const nearestLocations = mapState.locations.map(location => {
                const metres = getDistance(
                    userLocation,
                    location.coordinates
                );
                location["distance"] = {
                    metres: metres, 
                    nearby: metres <= 100 ? true : false
                };
                return location;
            }).sort((previousLocation, thisLocation) => {
                return previousLocation.distance.metres - thisLocation.distance.metres;
            });
            return nearestLocations.shift();
        }

        if(mapState.locationPermission) {
            const subscription = Location.watchPositionAsync(
                {
                accuracy: Location.Accuracy.High,
                distanceInterval: 10 // in meters
                },
                location => {
                const userLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
                const nearbyLocation = calculateDistance(userLocation);
                setMapState({
                    ...mapState,
                    userLocation,
                    nearbyLocation: nearbyLocation
                });
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
                    pitch: 0, // Angle of 3D map
                    heading: 0, // Compass direction
                    altitude: 3000, // Zoom level for iOS
                    zoom: 15 // Zoom level For Android
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
                        fillColor={colorScheme == "dark" ? "rgba(128,0,128,0.5)" : "rgba(210,169,210,0.5)"}
                    />
                ))}
            </MapView>
            <NearbyLocation
                {...mapState.nearbyLocation}
            />
        </>
    );
}