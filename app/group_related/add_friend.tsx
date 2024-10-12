import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL, useAuth } from "@/context/GlobalContext";
import axios from 'axios';

export default function AddFriend() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const searchUser = async () => {
        if (!searchQuery.trim()) return;
    
        try {
            const response = await axios.get(`${API_URL}/searchFriend?username=${searchQuery}`);
            if (response.data) {
                setFoundUser(response.data);
                setNotFound(false);
            } else {
                setFoundUser(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error searching for user:', error);
            setFoundUser(null);
            setNotFound(true);
        }
    };

    const handleAddFriend = async () => {
        if (!foundUser) return;

        try {
            const response = await axios.post(`${API_URL}/friends/add`, { friendId: foundUser.id });
            if (response.data.success) {
                router.push('../group_related/AddFriendSuccess');
            } else {
                router.push('../group_related/AddFriendFail');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            router.push('../group_related/AddFriendFail');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Adding New Friend</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchUser}
                returnKeyType="search"
            />

            {foundUser ? (
                <View style={styles.profileContainer}>
                    <Image 
                        source={foundUser.profileImage ? { uri: foundUser.profileImage } : require('../../assets/images/profile-placeholder.png')} 
                        style={styles.profileImage}
                    />
                    <Text style={styles.friendName}>{foundUser.username}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            ) : notFound ? (
                <Text style={styles.notFoundText}>User profile not found</Text>
            ) : null}
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
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#2a2a40',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
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
    notFoundText: {
        color: '#ff6b6b',
        fontSize: 18,
        marginTop: 20,
    },
});