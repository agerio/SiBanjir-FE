import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Image, Dimensions, Button, TextInput, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/GlobalContext';
import { API_URL } from "@/context/GlobalContext";
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get("window");
const imageSize = height / 6;

const styles = StyleSheet.create({
  // ... (existing styles)
  container: {
    padding: 20,
    flex: 1,
    alignItems: "center",
  },
  photoFullView: {
    marginBottom: 20,
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
    alignItems: "center",
  },
  photoFullImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  buttonView: {
    justifyContent: "center",
    marginBottom: 20,
  },
  usernameContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  passwordSection: {
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 20,
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    marginVertical: 10,
    marginBottom: 20,
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function UpdateProfile() {
  const [photoState, setPhotoState] = useState<{ uri?: string }>({});
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reenterNewPassword, setReenterNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const headers = new Headers();
        headers.append('Authorization', `Token ${authState?.token}`);

        // Fetch user data from the correct endpoint
        const response = await fetch(`${API_URL}/user/me`, {
          method: "GET",
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();

          // Set username and original username
          setUsername(data.username || "");
          setOriginalUsername(data.username || "");

          // Set phone number and original phone number
          const telephoneNumber = data.telephone_number || "";
          setPhoneNumber(telephoneNumber);
          setOriginalPhoneNumber(telephoneNumber);

          // Set profile picture if available
          if (data.profile_picture) {
            setPhotoState({ uri: data.profile_picture });
          }
        } else {
          console.error("Failed to fetch user data:", await response.text());
          Alert.alert("Error", "Failed to fetch user data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "An error occurred while fetching user data. Please check your internet connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authState]);

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

  const hasPhoto = Boolean(photoState.uri);

  async function handleUpdateProfile() {
    try {
      // Only update username if it has changed
      if (username && username !== originalUsername) {
        await updateUsername();
      }

      // Only update phone number if it has changed
      if (phoneNumber !== originalPhoneNumber) {
        await updatePhoneNumber();
      }

      // Update password if all fields are filled
      if (oldPassword && newPassword && reenterNewPassword) {
        await updatePassword();
      }

      // Update profile picture if a new photo is selected
      if (hasPhoto) {
        await updateProfilePicture();
      }

      Alert.alert("Success", "Profile updated successfully.");
      navigation.goBack(); // Navigate back to previous screen
    } catch (error) {
      console.error("Error in handleUpdateProfile:", error);
      Alert.alert("Error", "An unexpected error occurred while updating your profile. Please try again.");
    }
  }

  const updateUsername = async () => {
    try {
      let formData = new FormData();
      formData.append('username', username);

      const response = await fetch(`${API_URL}/user/profile/update/username`, {
        method: "POST",
        headers: {
          'Authorization': `Token ${authState?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update username: ${text}`);
      }
    } catch (error) {
      console.error("Error in updateUsername:", error);
      Alert.alert("Error", error.message || "An error occurred while updating the username.");
    }
  };

  const updatePhoneNumber = async () => {
    try {
      let formData = new FormData();
      formData.append('telephone_number', phoneNumber);

      const response = await fetch(`${API_URL}/user/profile/update/telephoneNumber`, {
        method: "PATCH", // Use PATCH as per your backend implementation
        headers: {
          'Authorization': `Token ${authState?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update phone number: ${text}`);
      }
    } catch (error) {
      console.error("Error in updatePhoneNumber:", error);
      Alert.alert("Error", error.message || "An error occurred while updating the phone number.");
    }
  };

  const updatePassword = async () => {
    if (newPassword !== reenterNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    try {
      let formData = new FormData();
      formData.append('old_password', oldPassword);
      formData.append('password', newPassword);
      formData.append('password2', reenterNewPassword);

      const response = await fetch(`${API_URL}/user/profile/update/password`, {
        method: "POST",
        headers: {
          'Authorization': `Token ${authState?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update password: ${text}`);
      }
    } catch (error) {
      console.error("Error in updatePassword:", error);
      Alert.alert("Error", error.message || "An error occurred while updating the password.");
    }
  };

  const updateProfilePicture = async () => {
    try {
      const photoUri = photoState.uri;

      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photoUri,
        [{ resize: { width: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      let formData = new FormData();
      formData.append('profile_picture', {
        uri: resizedPhoto.uri,
        type: 'image/jpeg',
        name: 'profile_picture.jpg',
      });

      const apiResponse = await fetch(`${API_URL}/user/profile/update/picture`, {
        method: "POST",
        headers: {
          'Authorization': `Token ${authState?.token}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const text = await apiResponse.text();
        throw new Error(`Failed to update profile picture: ${text}`);
      }
    } catch (error) {
      console.error("Error in updateProfilePicture:", error);
      Alert.alert("Error", error.message || "An error occurred while updating the profile picture.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={hasPhoto ? styles.photoFullView : styles.photoEmptyView}>
        {hasPhoto ? (
          <Image style={styles.photoFullImage} resizeMode="cover" source={{ uri: photoState.uri }} />
        ) : (
          <Text>No Photo</Text>
        )}
      </View>
      <View style={styles.buttonView}>
        <Button onPress={handleChangePress} title={hasPhoto ? "Change Photo" : "Add Photo"} />
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.label}>Edit Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
        />
      </View>
      {/* Phone number input field */}
      <View style={styles.usernameContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.passwordSection}>
        <Text style={styles.label}>Update Password</Text>
        <View style={styles.dashedLine} />
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Old Password"
          secureTextEntry
        />
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New Password"
          secureTextEntry
        />
        <Text style={styles.label}>Re-enter New Password</Text>
        <TextInput
          style={styles.input}
          value={reenterNewPassword}
          onChangeText={setReenterNewPassword}
          placeholder="Re-enter New Password"
          secureTextEntry
        />
      </View>
      <View style={styles.saveButtonContainer}>
        <Button title="Save" onPress={handleUpdateProfile} />
      </View>
    </SafeAreaView>
  );
}
