import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '@/context/GlobalContext'; // Import the GlobalContext

interface FriendRequest {
  sender: string;
}

export default function FollowerRequest() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [senderUsername, setSenderUsername] = useState(''); // State to store the sender's username

  // Fetch the current user's info to get the sender_username
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/me`);
        setSenderUsername(response.data.username); // Assuming the API returns the username field
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user info.');
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch the friend requests from the API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/listInvitation`);
        setFriendRequests(response.data); // Assuming the API returns a list of requests
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch friend requests.');
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleConfirm = async (username: string) => {
    try {
      await axios.post(`${API_URL}/user/createFriend`, { sender: username });
      Alert.alert('Success', `You have accepted the request from ${username}`);
      setFriendRequests(friendRequests.filter((request) => request.sender !== username)); // Remove from list after confirmation
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to confirm the request.');
    }
  };

  const handleDelete = async (recipientUsername: string) => {
    try {
      await axios.delete(`${API_URL}/user/deleteInvitation`, {
        data: {
          sender_username: recipientUsername, // Use the sender_username from /me endpoint
          recipient_username: senderUsername,
        },
      });
      Alert.alert('Success', `You have deleted the request from ${recipientUsername}`);
      setFriendRequests(friendRequests.filter((request) => request.sender !== recipientUsername)); // Remove from list after deletion
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the request.');
    }
  };

  const renderItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.sender}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item.sender)}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.sender)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.sender}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e30',
    padding: 10,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#555',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
