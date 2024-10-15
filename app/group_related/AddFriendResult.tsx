import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_URL } from "@/context/GlobalContext";

export default function AddFriendResult() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    const fetchUserData = useCallback(async (searchQuery, retryCount = 0) => {
        if (!searchQuery) {
            console.log("No search query provided");
            setError('Please provide a username to search.');
            setIsLoading(false);
            return;
        }
    
        try {
            const response = await axios.post(`${API_URL}/user/searchFriend`, {
                recipient_username: searchQuery
            }, {
                timeout: 10000 // 10 seconds timeout
            });
            console.log("API response:", response.data);
            
            if (response.data && response.data.username) {
                setUserData(response.data);
                if (response.data.username !== searchQuery) {
                    console.log(`Note: Searched for "${searchQuery}" but received data for "${response.data.username}"`);
                }
            } else {
                setError('User not found. Please check the username and try again.');
            }
        } catch (error) {
            console.log('Error fetching user data:', error);
            console.log('Error details:', error.response?.data || error.message);
            
            if (error.response && error.response.status === 400) {
                if (error.response.data.non_field_errors && error.response.data.non_field_errors.length > 0) {
                    setError(error.response.data.non_field_errors[0]);
                } else {
                    setError('Invalid request. Please check the username and try again.');
                }
            } else if (error.code === 'ECONNABORTED' && retryCount < 3) {
                console.log(`Retrying... Attempt ${retryCount + 1}`);
                await fetchUserData(searchQuery, retryCount + 1);
                return;
            } else if (error.response) {
                setError(`Server error: ${error.response.status}. Please try again later.`);
            } else if (error.request) {
                setError('Network error. Please check your internet connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log("Params received:", params);
        const searchQuery = params.searchQuery;
        console.log("Search Query:", searchQuery);

        setIsLoading(true);
        setError(null);
        fetchUserData(searchQuery);
    }, [params.searchQuery, fetchUserData]);

    const handleAddFriend = async () => {
        try {
            const response = await axios.post(`${API_URL}/user/sendInvitation`, { 
                recipient_username: userData.username
            });
            if (response.data.message === "Invitation sent successfully") {
                router.push('/group_related/AddFriendSuccess');
            } else {
                console.log('Unexpected response:', response.data);
                router.push('/group_related/AddFriendFail');
            }
        } catch (error) {
            console.log('Error sending invitation:', error.response?.data || error.message);
            if (error.response && error.response.data.non_field_errors && error.response.data.non_field_errors.length > 0) {
                setError(error.response.data.non_field_errors[0]);
            } else {
                router.push('/group_related/AddFriendFail');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Adding New Friend</Text>
            <Text style={styles.queryText}>Searched for: {params.searchQuery || 'N/A'}</Text>

            {isLoading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : userData ? (
                <View style={styles.profileContainer}>
                    {userData.username !== params.searchQuery && (
                        <Text style={styles.warningText}>Note: Showing result for "{userData.username}"</Text>
                    )}
                    <Image 
                        source={userData.profile_picture ? { uri: userData.profile_picture } : require('../../assets/images/user-icon.png')} 
                        style={styles.profileImage}
                    />
                    <Text style={styles.friendName}>{userData.username}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                        <Text style={styles.buttonText}>Add Friend</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.errorText}>No user data available</Text>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1e1e30',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        marginTop: 50,
    },
    queryText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    friendName: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#444',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
    warningText: {
        color: 'yellow',
        fontSize: 16,
        marginBottom: 10,
    },
});