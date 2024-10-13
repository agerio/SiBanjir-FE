import React, { useState, useCallback, useRef } from "react";
import { SafeAreaView, View, Image, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from "@/context/GlobalContext";
import { useFocusEffect } from '@react-navigation/native';
import Cloud from '../../components/Cloud';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get("window");
const imageSize = height / 6;


interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="white" style={{ marginRight: 10 }} />
    <Text style={styles.menuItemText}>{title}</Text>
    <Ionicons name="chevron-forward" size={24} color="white" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

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
            },
          });
          setUsername(response.data.username || "");
          setPhotoState(response.data.profile_picture ? { uri: response.data.profile_picture } : {});
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }, [authState])
  );

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
        <Text style={styles.logoutText}>Sign Out</Text>
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
            <Image
              style={styles.photoFullImage}
              resizeMode="cover"
              source={require('@/assets/images/default_icon.png')}
            />
          )}
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <MenuItem icon="person" title="Profile Setting" onPress={() => router.push('../profile_page_related/update_profile')} />
        <MenuItem icon="notifications" title="Notification" onPress={() => router.push('../profile_page_related/notification_setting')} />
        <MenuItem icon="lock-closed" title="Privacy Setting" onPress={() => router.push('../profile_page_related/privacy_setting')} />
        <MenuItem icon="call" title="Contact Us" onPress={() => router.push('../profile_page_related/contactUs')} />
        <MenuItem icon="chatbubbles" title="FAQ" onPress={() => router.push('../profile_page_related/faq')} />
        <MenuItem icon="mail-open" title="Send Us Feedback" onPress={() => router.push('../profile_page_related/feedback')} />

        <Text style={styles.aboutText}>
          Our developer team consists of international students that aims to help Australian communities face flood challenges!
        </Text>

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
      <Cloud scrollY={scrollY} orientation="left" />
      <Cloud scrollY={scrollY} orientation="right" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e30",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    paddingTop: 60,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  photoFullImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
    marginTop: 15,
  },
  usernameText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    width: "90%",
    marginBottom: 15,
    marginHorizontal: 20,
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
  },
  logoutText: {
    color: "#ff5b5b",
    fontSize: 16,
  },
  aboutText: {
    color: "#999",
    textAlign: "center",
    marginTop: 50,
  },
  bottomSpace: {
    height: 100,
  },
});