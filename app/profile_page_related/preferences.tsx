import React, { FC, useRef, useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, StyleSheet, Dimensions, Animated, Switch, ActivityIndicator } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cloud from '../../components/Cloud';
import { API_URL, ALLOW_LOCATION_SHARING, ALLOW_NOTIFICATION } from "@/context/GlobalContext";

const { width, height } = Dimensions.get("window");

interface SettingItemProps {
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    loading?: boolean;
}

const SettingItem: FC<SettingItemProps> = ({ label, description, value, onToggle, loading = false }) => {
    return (
        <View style={styles.settingItemContainer}>
            <View style={{ flex: 1 }}>
                <Text style={styles.settingText}>{label}</Text>
                <Text style={styles.settingDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                style={{ marginLeft: 10 }}
                disabled={loading}
            />
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size={24} color="#fff" />
                </View>
            )}
        </View>
    );
};

export default function Preferences() {
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/user/switchLocation`);
            setLocationEnabled(response.data.allow_location);
            await AsyncStorage.setItem(ALLOW_LOCATION_SHARING, JSON.stringify(response.data.allow_location));

            const notificationSetting = await AsyncStorage.getItem(ALLOW_NOTIFICATION)
            const parsedNotififcationSetting = notificationSetting !== null ? JSON.parse(notificationSetting) : true;
            setNotificationsEnabled(parsedNotififcationSetting);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLocationSwitch = async () => {
        setLoading(true);
        const newValue = !locationEnabled;
        setLocationEnabled(newValue);

        try {
            const response = await axios.post(`${API_URL}/user/switchLocation`, { allow_location: newValue });
            await AsyncStorage.setItem(ALLOW_LOCATION_SHARING, JSON.stringify(response.data.allow_location));
        } catch (error) {
            console.error("Error updating location setting:", error);
            Alert.alert('Switch failed. Please try again...');
            setLocationEnabled(!newValue);
        } finally {
            setLoading(false);
        }
    };

    const toggleNotificationSwitch = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        await AsyncStorage.setItem(ALLOW_NOTIFICATION, JSON.stringify(newValue));
    };

    useEffect(() => {
        fetchSettings();
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
                <Text style={styles.header}>Preferences</Text>
                
                <SettingItem 
                    label="Notifications"
                    description="Receive flood warning notifications."
                    value={notificationsEnabled}
                    onToggle={toggleNotificationSwitch}
                />
                
                <SettingItem 
                    label="Location Sharing"
                    description="Allow your family member to track your location."
                    value={locationEnabled}
                    onToggle={toggleLocationSwitch}
                    loading={loading}
                />

                <View style={styles.bottomSpace} />
            </Animated.ScrollView>

            <View style={styles.bottomPattern} />
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
        marginBottom: 15,
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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
