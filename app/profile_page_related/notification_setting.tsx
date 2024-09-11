import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1e1e30"
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 30
    },
    iconContainer: {
        backgroundColor: "#fff",
        width: height / 6,
        height: height / 6,
        borderRadius: height / 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginHorizontal: 10
    },
    activeButton: {
        backgroundColor: "#444", // Bright color for active state
    },
    inactiveButton: {
        backgroundColor: "#fff", // Darker color for inactive state
    },
    buttonText: {
        fontSize: 16,
        color: "#fff" // Black text for active button
    },
    inactiveButtonText: {
        color: "#000" // White text for inactive button
    }
});

export default function NotificationSetting() {
    const [isNotificationOn, setIsNotificationOn] = useState(true); // Notifications are ON by default

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Notification Setting</Text>

            <View style={styles.iconContainer}>
                {isNotificationOn ? (
                    <FontAwesome name="bell" size={60} color="#000" />
                ) : (
                    <FontAwesome name="bell-slash" size={60} color="#000" />
                )}
            </View>

            <View style={styles.buttonContainer}>
                {/* Turn On Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        isNotificationOn ? styles.inactiveButton : styles.activeButton
                    ]}
                    onPress={() => setIsNotificationOn(true)}
                    disabled={isNotificationOn} // Disable if notifications are already ON
                >
                    <Text style={[
                        styles.buttonText,
                        isNotificationOn ? styles.inactiveButtonText : null
                    ]}>
                        Turn On
                    </Text>
                </TouchableOpacity>

                {/* Turn Off Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        isNotificationOn ? styles.activeButton : styles.inactiveButton
                    ]}
                    onPress={() => setIsNotificationOn(false)}
                    disabled={!isNotificationOn} // Disable if notifications are already OFF
                >
                    <Text style={[
                        styles.buttonText,
                        isNotificationOn ? null : styles.inactiveButtonText
                    ]}>
                        Turn Off
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
