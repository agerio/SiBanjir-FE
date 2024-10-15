import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL, useAuth } from '@/context/GlobalContext';
import Cloud from '../../components/Cloud';
import { Ionicons } from '@expo/vector-icons';

type Friend = {
    id: string;
    username: string;
    telephone_number: string;
    profile_picture: string;
    allow_location: boolean;
};

export default function Group() {
    const router = useRouter();
    const [groupRefreshKey, setGroupRefreshKey] = useState(0);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/user/listFriend`)
                setFriends(response.data);
            } catch (error) {
                console.error('Error fetching friends:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, [authState]);

    const handleCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const renderItem = ({ item }: { item: Friend }) => (
        <View style={styles.friendItem}>
            <Image 
                source={item.profile_picture ? { uri: item.profile_picture } : require('@/assets/images/default_icon.png')}
                style={styles.profileImage} 
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.friendName}>{item.username}</Text>
                <Text style={styles.friendPhone}>{item.telephone_number}</Text>
            </View>
            <TouchableOpacity
                disabled={!(item.telephone_number?.length > 0)}
                style={[styles.actionButton, (item.telephone_number?.length > 0 ? styles.callButton : styles.disabledButton)]}
                onPress={() => handleCall(item.telephone_number)}
            >
                <Ionicons name='call' size={16} color='white' />
                <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
                disabled={!item.allow_location}
                style={[styles.actionButton, (item.allow_location ? styles.locateButton : styles.disabledButton)]}
                onPress={() => {
                    setGroupRefreshKey((prev) => prev + 1);
                    router.push({
                        pathname: '/',
                        params: {
                            groupRefreshKey: `${groupRefreshKey}`,
                            mapFocusId: item.username,
                        }
                    });
                }}
            >
                <Ionicons name='locate' size={16} color='white' />
                <Text style={styles.buttonText}>Locate</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Friend & Family</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
                ) : (
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
                )}
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
        marginTop: 30,
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
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2b2b4b',
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 5,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-start",
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
    },
    disabledButton: {
        backgroundColor: '#858594',
    },
    locateButton: {
        backgroundColor: '#46468a',
    },
    callButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        marginLeft: 5,
        color: 'white',
        fontSize: 14,
        fontWeight: 'semibold',
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
