import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';  // Import useRouter from expo-router

// Define a type for your friend items
type Friend = {
    id: string;
    name: string;
    phone: string;
    image: any;  // Add image field
};

const friends: Friend[] = [
    { id: '1', name: 'Andrew', phone: '894 4390', image: require('../../assets/images/Andrew.png') },
    { id: '2', name: 'Amber', phone: '984 3920', image: require('../../assets/images/Amber.png') },
    { id: '3', name: 'Dave', phone: '435 8912', image: require('../../assets/images/Dave.png') },
    { id: '4', name: 'Daniella', phone: '687 2340', image: require('../../assets/images/daniella.png') },
    { id: '5', name: 'Ellen', phone: '989 9744', image: require('../../assets/images/ellen.png') },
    { id: '6', name: 'Elliote', phone: '676 0053', image: require('../../assets/images/Elliote.png') },
];

export default function Group() {
    const router = useRouter();  // Use useRouter for navigation

    const renderItem = ({ item }: { item: Friend }) => (  // Provide explicit typing for item
        <View style={styles.friendItem}>
            {/* Display the friend's profile image */}
            <Image source={item.image} style={styles.profileImage} />

            <View>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendPhone}>{item.phone}</Text>
            </View>

            <TouchableOpacity
                style={styles.viewLocButton}
                onPress={() => router.push('../(tabs)/index')} // Navigate to the location page
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
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('../group_related/add_friend')} // Navigate to Add Friend Search Page
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
        justifyContent: 'space-between',
        alignItems: 'center',  // Align items vertically
        padding: 15,
        backgroundColor: '#2b2b4b',
        borderRadius: 10,
        marginBottom: 10,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,  // To make the image round
        marginRight: 15,  // Add some space between the image and the text
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
