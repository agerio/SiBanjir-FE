import React, { useState } from "react";
import { SafeAreaView, View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { FontAwesome } from '@expo/vector-icons'; // For the stars

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: "#1e1e30"
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
    }
});

export default function Feedback() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(4); // Default rating is 4
    const [comment, setComment] = useState("");

    const handleRatingPress = (value: number) => {
        setRating(value);
    };

    return (
        <SafeAreaView style={styles.container}>
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
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
