import React, { useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, Animated, Switch } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import Cloud from '../../components/Cloud'; // Import the Cloud component

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e30"
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120, // Increased to accommodate the cloud pattern
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
        flexWrap: "wrap", // Allow wrapping if needed
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
        height: 100, // Space to ensure content isn't hidden behind the cloud
    },
});

export default function PrivacySetting() {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const scrollY = useRef(new Animated.Value(0)).current;

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
                        style={{ marginLeft: 10 }} // Add some margin for spacing
                    />
                </View>



                <View style={styles.bottomSpace} />
            </Animated.ScrollView>

            <View style={styles.bottomPattern}>
            </View>
            
            <Cloud scrollY={scrollY} orientation="right" />
        </SafeAreaView>
    );
}