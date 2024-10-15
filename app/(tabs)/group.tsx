import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from '@/context/GlobalContext';
import Cloud from '../../components/Cloud';

type Friend = {
    id: string;
    username: string;
    telephone_number: string;
    profile_picture: string;
};

export default function Group() {
    const router = useRouter();
    const [groupRefreshKey, setGroupRefreshKey] = useState(0);
    const [friends, setFriends] = useState<Friend[]>([]);
    const { authState } = useAuth();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/listFriend`, {
                    headers: {
                        'Authorization': `Token ${authState?.token}`,
                    },
                });

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

    const handleCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

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
                style={styles.actionButton}
                onPress={() => {
                    setGroupRefreshKey((prev) => prev + 1);
                    router.push({ 
                        pathname:'/', 
                        params: {
                            groupRefreshKey: `${groupRefreshKey}`,
                            mapFocusId: item.username,
                        }
                    });
                }}
            >
                <Text style={styles.buttonText}>View Loc</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(item.telephone_number)}
            >
                <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Friend & Family</Text>
                <Animated.FlatList
                    data={friends}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    style={styles.list}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/group_related/add_friend')}
                >
                    <Text style={styles.addButtonText}>+ Add Friend</Text>
                </TouchableOpacity>
            </View>
            
            <Cloud scrollY={scrollY} orientation="left" style={styles.cloudLeft} />
            <Cloud scrollY={scrollY} orientation="right" style={styles.cloudRight} />
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
        padding: 20,
        zIndex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        marginLeft: 15
    },
    list: {
        flex: 1,
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
    actionButton: {
        backgroundColor: '#444',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 5,
    },
    callButton: {
        backgroundColor: '#4CAF50', // Green color for the call button
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
        marginBottom: 25,
        zIndex: 2,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    cloudLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
    },
    cloudRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
    },
});