import React, { useState, useCallback } from "react";
import { SafeAreaView, View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from "@/context/GlobalContext";
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

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
  const [username, setUsername] = useState("");
  const router = useRouter();
  const { authState, onSignout } = useAuth(); // Include authState to get the token

  // Use useFocusEffect to refetch data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_URL}/user/me`, {
            headers: {
              'Authorization': `Token ${authState?.token}`,
            }
          });
          setUsername(response.data.username || "");

          // Set the profile picture URI if available
          if (response.data.profile_picture) {
            setPhotoState({ uri: response.data.profile_picture });
          } else {
            setPhotoState({});
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }, [authState])
  );

  async function handleChangePress() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoState(result.assets[0]);
      // Optionally, you can implement code to upload the new profile picture to the server here
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
        onPress={() => router.push('../profile_page_related/update_profile')}
      >
        <Text style={styles.menuItemText}>Profile Setting</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('../profile_page_related/notification_setting')}
      >
        <Text style={styles.menuItemText}>Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('../profile_page_related/contactUs')}
      >
        <Text style={styles.menuItemText}>Contact Us</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('../profile_page_related/faq')}
      >
        <Text style={styles.menuItemText}>FAQ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('../profile_page_related/feedback')}
      >
        <Text style={styles.menuItemText}>Send Us Feedback</Text>
      </TouchableOpacity>

      <Text style={styles.aboutText}>
        The developer team as international students want to help Australia's community related to floods
      </Text>
    </SafeAreaView>
  );
}
