import React, { useRef, useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, StyleSheet, Dimensions, Animated, Switch, ActivityIndicator } from "react-native";
import { API_URL, ALLOW_LOCATION_SHARING } from "@/context/GlobalContext";
import Cloud from '../../components/Cloud';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

export default function PrivacySetting() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const fetchPrivacySetting = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/user/switchLocation`);
            setIsEnabled(response.data.allow_location);
            await AsyncStorage.setItem(ALLOW_LOCATION_SHARING, JSON.stringify(response.data.allow_location));
        } catch (error) {
            console.error("Error fetching setting:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSwitch = async () => {
        if (loading) return;

        setLoading(true);
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        
        try {
            const response = await axios.post(`${API_URL}/user/switchLocation`, { allow_location: newValue });
            await AsyncStorage.setItem(ALLOW_LOCATION_SHARING, JSON.stringify(response.data.allow_location));
        } catch (error) {
            console.error("Error updating privacy setting:", error);
            Alert.alert('Switch failed. Please try again...');
            setIsEnabled(!newValue);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPrivacySetting();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Text style={styles.header}>Privacy Setting</Text>

                <View style={styles.settingItemContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.settingText}>Location Sharing</Text>
                        <Text style={styles.settingDescription}>
                            When turned off, your friends won't be able to see your location.
                        </Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={toggleSwitch}
                        style={{ marginLeft: 10 }}
                        disabled={loading}
                    />
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size={24} color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpace} />
            </Animated.ScrollView>

            <View style={styles.bottomPattern}>
            </View>
            
            <Cloud scrollY={scrollY} orientation="right" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e30"
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 40
    },
    settingItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        position: 'relative',
    },
    settingText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
    },
    settingDescription: {
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
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: dark overlay
        borderRadius: 10,
    },
    bottomPattern: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height / 6,
        backgroundColor: "#1e1e30",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    bottomSpace: {
        height: 100,
    },
});
