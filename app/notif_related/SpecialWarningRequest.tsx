import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { getDistance } from 'geolib';

const API_URL = 'https://si-banjir-be.vercel.app/api/specialwarning/warnings';

interface Warning {
  id: string;
  name: string;
  created_at: string;
  lat: string;
  long: string;
  image?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function SpecialWarningRequest() {
  const [specialWarnings, setSpecialWarnings] = useState<Warning[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifiedWarnings, setVerifiedWarnings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    const fetchWarnings = async () => {
      try {
        const response = await axios.get(API_URL);
        setSpecialWarnings(response.data);
      } catch (error) {
        console.error('Error fetching special warnings:', error);
      }
    };

    const loadData = async () => {
      await fetchUserLocation();
      await fetchWarnings();
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
      .getDate()
      .toString()
      .padStart(2, '0')} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const filterWarningsByDistance = () => {
    if (!userLocation) return [];

    return specialWarnings
      .map((warning) => {
        const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: parseFloat(warning.lat), longitude: parseFloat(warning.long) }
        );

        return {
          ...warning,
          distance, // distance in meters
        };
      })
      .filter((warning) => warning.distance <= 100 && !verifiedWarnings.has(warning.id));
  };

  const nearbyWarnings = filterWarningsByDistance();

  const handleVerify = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/verify`);
      if (response.data.detail === 'Warning verified successfully.') {
        setVerifiedWarnings((prev) => new Set([...prev, id]));
        Alert.alert('Success', 'Warning verified successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify the warning.');
      console.error('Error verifying warning:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Special Warnings</Text>
      </View>
      {nearbyWarnings.length > 0 ? (
        <FlatList
          data={nearbyWarnings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.warningItem}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.description}>{formatDateTime(item.created_at)}</Text>
              <Text style={styles.distanceText}>{item.distance} m from your location</Text>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.warningImage}
                  resizeMode="cover"
                />
              )}
              {!verifiedWarnings.has(item.id) && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => handleVerify(item.id)}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.noWarnings}>
          <Text style={styles.noWarningsText}>No special warnings nearby within 100 meters.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e30',
  },
  header: {
    backgroundColor: '#1e1e30',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b4b',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  warningItem: {
    backgroundColor: '#2b2b4b',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  warningImage: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 8,
  },
  verifyButton: {
    marginTop: 10,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noWarnings: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noWarningsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
  