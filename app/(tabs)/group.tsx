import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from '@/context/GlobalContext';

type Friend = {
    id: string;
    username: string;
    telephone_number: string;
    profile_picture: string; // URL of the image
};

export default function Group() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const router = useRouter();
    const { authState } = useAuth();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/listFriend`, {
                    headers: {
                        'Authorization': `Token ${authState?.token}`,
                    },
                });

                // Remove duplicates based on username
                const uniqueFriendsMap = new Map();
                response.data.forEach((friend: Friend) => {
                    if (!uniqueFriendsMap.has(friend.username)) {
                        uniqueFriendsMap.set(friend.username, friend);
                    }
                });
                const uniqueFriends = Array.from(uniqueFriendsMap.values());

                setFriends(uniqueFriends);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };
        fetchFriends();
    }, [authState]);

    const renderItem = ({ item }: { item: Friend }) => (
        <View style={styles.friendItem}>
            {item.profile_picture ? (
                <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
            ) : (
                <View style={styles.profileImagePlaceholder}></View>
            )}
            <View style={{ flex: 1 }}>
                <Text style={styles.friendName}>{item.username}</Text>
                <Text style={styles.friendPhone}>{item.telephone_number}</Text>
            </View>
            <TouchableOpacity
                style={styles.viewLocButton}
                onPress={() => router.push({ pathname: '/', params: { username: item.username } })}
            >
                <Text style={styles.buttonText}>View Loc</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Friend & Family</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/group_related/add_friend')}
            >
                <Text style={styles.addButtonText}>+ Add Friend</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1e1e30',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2b2b4b',
        borderRadius: 10,
        marginBottom: 10,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    profileImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ccc',
        marginRight: 15,
    },
    friendName: {
        fontSize: 18,
        color: '#fff',
    },
    friendPhone: {
        color: '#bbb',
    },
    viewLocButton: {
        backgroundColor: '#444',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#333',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
