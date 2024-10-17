import React, { useState } from 'react';
import { SafeAreaView, TextInput, Text, TouchableOpacity, StyleSheet, View, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from "@/context/GlobalContext";

export default function AddFriendSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isLoadingAdd, setIsLoadingAdd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState(null);

    const handleSearch = async () => {
        if (!searchQuery) {
            setError('Please enter a username to search.');
            return;
        }

        setIsLoadingSearch(true);
        setError(null);
        setUserData(null);

        try {
            const response = await axios.post(`${API_URL}/user/searchFriend`, {
                recipient_username: searchQuery
            });

            if (response.data && response.data.username) {
                setUserData(response.data);
            }
        } catch (error) {
            setError('User not found.');
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleAddFriend = async () => {
        setIsLoadingAdd(true);
        try {
            const response = await axios.post(`${API_URL}/user/sendInvitation`, { 
                recipient_username: userData.username
            });
            if (response.data.message === "Invitation sent successfully") {
                Alert.alert("Success", "Successfully sent a friend request! Please wait for their response.");
            }
        } catch (error) {
            Alert.alert("Fail", "An error occurred. Please try again.");
        } finally {
            setIsLoadingAdd(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Add New Friend</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={isLoadingSearch}
                    >
                        {isLoadingSearch ? (
                            <ActivityIndicator size={24} color="#fff" />
                        ) : (
                            <Ionicons name="search" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}

                {userData && (
                    <View style={styles.profileContainer}>
                        <Image 
                            source={userData.profile_picture ? { uri: userData.profile_picture } : require('../../assets/images/user-icon.png')} 
                            style={styles.profileImage}
                        />
                        <Text style={styles.friendName}>{userData.username}</Text>
                        <TouchableOpacity 
                            style={styles.addButton} 
                            onPress={handleAddFriend}
                            disabled={isLoadingAdd}
                        >
                            {isLoadingAdd ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Add User</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e30',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    searchContainer: {
        width: '100%',
        flexDirection: 'row',
        padding: 10,
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 10,
        color: '#fff',
    },
    searchButton: {
        alignItems: 'center',
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        backgroundColor: '#46468a',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 10,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 30,
        padding: 15,
        borderRadius: 10,
        width: '100%',
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
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#46468a',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 7,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
