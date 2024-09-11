import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // Import useRouter from expo-router

export default function AddFriendFail() {
    const router = useRouter();  // Use useRouter for navigation

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.failText}>You failed to add your friend. Please try again.</Text>
            <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => router.push('../group_related/add_friend')} // Navigate back to add friend search page
            >
                <Text style={styles.buttonText}>Back to Add Friend Page</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e1e30',
    },
    failText: {
        color: 'red',
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    goBackButton: {
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
