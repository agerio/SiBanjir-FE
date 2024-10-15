import React, { useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
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
    },
    bottomSpace: {
        height: 100, // Space to ensure content isn't hidden behind the cloud
    },
});

export default function ContactUs() {
    const scrollY = useRef(new Animated.Value(0)).current;

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
                <Text style={styles.header}>Contact Us</Text>

                <View style={styles.contactItem}>
                    <FontAwesome name="phone" size={24} color="#fff" />
                    <Text style={styles.contactText}>+61 455 990 234</Text>
                </View>

                <View style={styles.contactItem}>
                    <FontAwesome name="envelope" size={24} color="#fff" />
                    <Text style={styles.contactText}>dekoderteam@gmail.com</Text>
                </View>

                <View style={styles.contactItem}>
                    <FontAwesome name="paper-plane" size={24} color="#fff" />
                    <Text style={styles.contactText}>id: dekoder_team</Text>
                </View>

                <Text style={styles.attentionText}>
                    For further questions please contact the contact listed. We are committed to listening to all your aspirations.
                </Text>

                <View style={styles.bottomSpace} />
            </Animated.ScrollView>

            <View style={styles.bottomPattern}>
                {/* Here you can add a pattern or an image if needed */}
            </View>
            
            <Cloud scrollY={scrollY} orientation="right" />
        </SafeAreaView>
    );
}