import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';  // Import the useRouter from expo-router
import axios from 'axios';
import { API_URL, useAuth } from "@/context/GlobalContext";

const { width, height } = Dimensions.get("window");
const imageSize = height / 6;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        alignItems: "center",
        backgroundColor: "#1e1e30"
    },
    profileSection: {
        alignItems: "center",
        marginBottom: 30
    },
    photoFullView: {
        marginBottom: 20
    },
    photoEmptyView: {
        borderWidth: 3,
        borderRadius: imageSize / 2,
        borderColor: "#999",
        borderStyle: "dashed",
        width: imageSize,
        height: imageSize,
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    photoFullImage: {
        width: imageSize,
        height: imageSize,
        borderRadius: imageSize / 2
    },
    usernameText: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 10
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        width: "100%",
        marginBottom: 15
    },
    menuItemText: {
        color: "#fff",
        fontSize: 18
    },
    logoutButton: {
        position: "absolute",
        top: 20,
        right: 20
    },
    logoutText: {
        color: "#ff5b5b",
        fontSize: 16
    },
    aboutText: {
        color: "#999",
        textAlign: "center",
        marginTop: 30
    }
});

export default function Profile() {
    const [photoState, setPhotoState] = useState<{ uri?: string }>({});
    const [username, setUsername] = useState("John Doe");
    const router = useRouter();  // Use router from expo-router
    const { onSignout } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/me`);
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    async function handleChangePress() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoState(result.assets[0]);
        }
    }

    const handleSignout = async () => {
        if (onSignout) {
            await onSignout();
        } 
        router.replace("/(auth)/signin");
      };

    const hasPhoto = Boolean(photoState.uri);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <View style={styles.profileSection}>
                {hasPhoto ? (
                    <Image
                        style={styles.photoFullImage}
                        resizeMode="cover"
                        source={{ uri: photoState.uri }}
                    />
                ) : (
                    <View style={styles.photoEmptyView}></View>
                )}
                <Text style={styles.usernameText}>{username}</Text>
            </View>

            {/* Menu options with navigation to different pages */}
            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('../profile_page_related/update_profile')}  // Navigate to update_profile page
            >
                <Text style={styles.menuItemText}>Profile Setting</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('../profile_page_related/notification_setting')}  // Navigate to notification_setting page
            >
                <Text style={styles.menuItemText}>Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('../profile_page_related/contactUs')}  // Navigate to contactUs page
            >
                <Text style={styles.menuItemText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('../profile_page_related/faq')}  // Navigate to faq page
            >
                <Text style={styles.menuItemText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('../profile_page_related/feedback')}  // Navigate to feedback page
            >
                <Text style={styles.menuItemText}>Send Us Feedback</Text>
            </TouchableOpacity>

            <Text style={styles.aboutText}>
                The developer team as international students want to help Australia's community related to floods
            </Text>
        </SafeAreaView>
    );
}
