import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';  // Import useRouter from expo-router

export default function AddFriendResult() {
    const router = useRouter();  // Use useRouter for navigation
    const searchQuery = "John Doe"; // Replace this with dynamic query from your state or props

    const handleAddFriend = () => {
        // Simulate adding a friend (could be a network request)
        const isSuccess = Math.random() > 0.5; // Randomly simulate success or failure

        if (isSuccess) {
            router.push('../group_related/AddFriendSuccess'); // Navigate to success page
        } else {
            router.push('../group_related/AddFriendFail'); // Navigate to fail page
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Adding New Friend</Text>

            <View style={styles.profileContainer}>
                {/* Replace with the user's profile image, here it is a placeholder */}
                <Image 
                    source={require('../../assets/images/profile-placeholder.png')} 
                    style={styles.profileImage}
                />
                <Text style={styles.friendName}>{searchQuery}</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
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
});
