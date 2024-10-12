import React, { useState, useCallback, useRef } from "react";
import { SafeAreaView, View, Image, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from "@/context/GlobalContext";
import { useFocusEffect } from '@react-navigation/native';
import Cloud from '../../components/Cloud';

const { width, height } = Dimensions.get("window");
const imageSize = height / 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e30"
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    paddingTop: 60, // Added to account for the logout button
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
    borderRadius: imageSize / 2,
    marginTop: 15
  },
  usernameText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 12
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    width: "90%",
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20
  },
  menuItemText: {
    color: "#fff",
    fontSize: 18,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    marginTop: 10
  },
  logoutText: {
    color: "#ff5b5b",
    fontSize: 16
  },
  aboutText: {
    color: "#999",
    textAlign: "center",
    marginTop: 50
  },
  bottomSpace: {
    height: 100,
  },
});

export default function Profile() {
  const [photoState, setPhotoState] = useState<{ uri?: string }>({});
  const [username, setUsername] = useState("");
  const router = useRouter();
  const { authState, onSignout } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
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

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
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
          The developer team of international students aims to help Australian communities facing flood challenges.
        </Text>
        
        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
      <Cloud scrollY={scrollY} orientation="left" />
      <Cloud scrollY={scrollY} orientation="right" />
    </SafeAreaView>
  );
}