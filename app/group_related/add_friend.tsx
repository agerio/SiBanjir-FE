import React, { useState } from 'react';
import { SafeAreaView, TextInput, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddFriendSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Adding New Friend</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => router.push({ pathname: '../group_related/AddFriendResult', params: { searchQuery } })}
                >
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
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
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 15,
        width: '85%', // Reduced width to create space on sides
        color: '#000', // Ensure text is visible
    },
    searchButton: {
        backgroundColor: '#444',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '35%', // Match input width
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});