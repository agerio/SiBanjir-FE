import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // Import the useRouter from expo-router

export default function AddFriendSuccess() {
    const router = useRouter();  // Use router instead of navigation

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.successText}>You successfully added your new friend!</Text>
            <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => router.push('../(tabs)/group')} // Navigate back to the friend list page
            >
                <Text style={styles.buttonText}>Go Back</Text>
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
    successText: {
        color: 'green',
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
