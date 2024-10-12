import React, { useState, useRef } from "react";
import { SafeAreaView, View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Animated } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Cloud from '../../components/Cloud'; // Import the Cloud component

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e30"
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120, // Increased to accommodate the cloud pattern
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 30
    },
    inputContainer: {
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20
    },
    input: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16
    },
    label: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 5
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20
    },
    star: {
        marginHorizontal: 5
    },
    commentBox: {
        backgroundColor: "#fff",
        padding: 10,
        height: 100,
        textAlignVertical: "top",
        borderRadius: 10,
        marginBottom: 15
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    button: {
        backgroundColor: "#444",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10
    },
    buttonText: {
        color: "#fff",
        fontSize: 16
    },
    submitButton: {
        backgroundColor: "#000",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16
    },
    bottomSpace: {
        height: 100, // Space to ensure content isn't hidden behind the cloud
    },
});

export default function Feedback() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(4);
    const [comment, setComment] = useState("");

    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleRatingPress = (value) => {
        setRating(value);
    };

    const handleSubmit = () => {
        Alert.alert(
            "Feedback Sent",
            "Thank you for your feedback!",
            [
                {
                    text: "OK",
                    onPress: () => navigation.navigate('profile'),
                },
            ],
            { cancelable: false }
        );
    };

    const handleCancel = () => {
        navigation.navigate('profile');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Text style={styles.header}>Send Us your Feedback</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Share your experience in scaling</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => handleRatingPress(star)}>
                                <FontAwesome
                                    name={star <= rating ? "star" : "star-o"}
                                    size={32}
                                    color={star <= rating ? "#ffd700" : "#ccc"}
                                    style={styles.star}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Comments</Text>
                    <TextInput
                        style={styles.commentBox}
                        placeholder="Add your comments..."
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpace} />
            </Animated.ScrollView>
            
            <Cloud scrollY={scrollY} orientation="right" />
        </SafeAreaView>
    );
}