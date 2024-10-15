import React, { useState, useCallback, useRef } from "react";
import { SafeAreaView, View, Image, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Alert } from "react-native";
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
    Alert.alert(
      "Confirm Sign out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: async () => {
            if (onSignout) {
              await onSignout();
            }
            router.replace("/(auth)/signin");
          },
          style: "destructive"
        }
      ]
    );
  };

  const hasPhoto = Boolean(photoState.uri);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.signoutButton} onPress={handleSignout}>
        <Ionicons name="log-out" size={24} color="#ff5b5b" />
      </TouchableOpacity>
      <Text style={styles.signOutText}>Sign Out</Text>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.profileSection}>
          <Image
            style={styles.photoFullImage}
            resizeMode="cover"
            source={hasPhoto ? { uri: photoState.uri } : require('@/assets/images/default_icon.png')}
          />
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <MenuItem icon="person" title="Profile Setting" onPress={() => router.push('../profile_page_related/update_profile')} />
        <MenuItem icon="id-card" title="Preferences" onPress={() => router.push('../profile_page_related/preferences')} />
        <MenuItem icon="call" title="Contact Us" onPress={() => router.push('../profile_page_related/contactUs')} />
        <MenuItem icon="chatbubbles" title="FAQ" onPress={() => router.push('../profile_page_related/faq')} />
        <MenuItem icon="mail-open" title="Send Us Feedback" onPress={() => router.push('../profile_page_related/feedback')} />

        <Text style={styles.aboutText}>
          Emergency Contacts:{"\n"}
          Call 000: Police, Fire, Ambulance (life-threatening){"\n"}
          Call 132 500: SES (flood/storm damage){"\n\n"}
          Tip: Stay informed and follow official advice.
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
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
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
  signOutText: {
    position: "absolute",
    top: 90, // Adjust this value based on your layout
    right: 20,
    color: "#ff5b5b",
    fontSize: 14,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 17,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    width: "90%",
    marginBottom: 10,
    marginHorizontal: 20,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 7,
  },
  signoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#2b2b4b",
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
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
