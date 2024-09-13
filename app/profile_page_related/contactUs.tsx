import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

const { height } = Dimensions.get("window");

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
        marginBottom: 40
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20
    },
    contactText: {
        fontSize: 18,
        color: "#fff",
        flex: 1,
        marginLeft: 20
    },
    contactIcon: {
        marginLeft: 10,
    },
    attentionText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginTop: 40
    },
    bottomPattern: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height / 6,
        backgroundColor: "#1e1e30",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    }
});

export default function ContactUs() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Contact Us</Text>

            <View style={styles.contactItem}>
                <FontAwesome name="phone" size={24} color="#fff" />
                <Text style={styles.contactText}>+61 455 990 234</Text>
            </View>

            <View style={styles.contactItem}>
                <FontAwesome name="envelope" size={24} color="#fff" />
                <Text style={styles.contactText}>grandsarah@gmail.com</Text>
            </View>

            <View style={styles.contactItem}>
                <FontAwesome name="paper-plane" size={24} color="#fff" />
                <Text style={styles.contactText}>id: grandsarah14</Text>
            </View>

            <Text style={styles.attentionText}>
                For further questions please contact the contact listed. We are committed to listening to all your aspirations.
            </Text>

            <View style={styles.bottomPattern}>
                {/* Here you can add a pattern or an image if needed */}
            </View>
        </SafeAreaView>
    );
}
