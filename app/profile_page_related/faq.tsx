import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e30",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20
    },
    searchInput: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 20
    },
    questionContainer: {
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15
    },
    questionText: {
        fontSize: 18,
        color: "#fff"
    },
    questionNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 10
    },
    questionTitle: {
        fontSize: 20,
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
        marginTop: 6
    },
    questionLine: {
        height: 1,
        backgroundColor: "#fff",
        marginBottom: 20
    },
    answerHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "left",
        marginTop: 20,
        marginBottom: 10
    },
    answerText: {
        fontSize: 18,
        color: "#fff",
        marginTop: 10
    },
    backButton: {
        fontSize: 16,
        color: "#fff",
        textDecorationLine: "underline",
        textAlign: "left",
        marginTop: 60,
        marginBottom: 20,
        paddingLeft: 10,
    },
    bottomPattern: {
        height: 100,
        backgroundColor: "#1e1e30",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 20,
    },
    spacer: {
        height: 100,
    }
});

export default function FAQPage() {
    const [currentPage, setCurrentPage] = useState('FAQ');

    const renderFAQ = () => (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>FAQ</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search"
            />
            {[...Array(10)].map((_, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.questionContainer}
                    onPress={() => setCurrentPage(`Question${index + 1}`)}
                >
                    <Text style={styles.questionText}>Question {index + 1}</Text>
                </TouchableOpacity>
            ))}
            <View style={styles.bottomPattern} />
        </ScrollView>
    );

    const renderQuestion = (questionNumber, question, answer) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.questionNumber}>Question {questionNumber}</Text>
            <Text style={styles.questionTitle}>{question}</Text>
            <View style={styles.questionLine} />
            <Text style={styles.answerHeader}>Answer:</Text>
            <Text style={styles.answerText}>{answer}</Text>
            <View style={styles.spacer} />
            <TouchableOpacity onPress={() => setCurrentPage('FAQ')}>
                <Text style={styles.backButton}>← Back to FAQ</Text>
            </TouchableOpacity>
            <View style={styles.bottomPattern} />
        </ScrollView>
    );

    const questions = [
        { question: "What is SiBanjir?", answer: "SiBanjir is a mobile app that provides real-time flood alerts and location tracking for family members during flood events in Queensland." },
        { question: "How does SiBanjir work?", answer: "The app uses real-time environmental data to send alerts to users in potential flood zones and allows users to track the location of their family members during emergencies." },
        { question: "Is SiBanjir free to use?", answer: "Yes, SiBanjir is free to download and use." },
        { question: "How accurate are the flood alerts?", answer: "Our alerts are based on the latest data from Australia Bureau of Meteorology, but we always recommend following official government advice as well." },
        { question: "Can I use SiBanjir outside of Queensland?", answer: "Currently, SiBanjir is optimized for use in Queensland, Australia. We may expand to other regions in the future." },
        { question: "How do I add family members to track their location?", answer: "Go to the \"Friend & Family\" section, tap \"Add Friend,\" and follow the prompts to send an invitation." },
        { question: "Is my location data secure?", answer: "Yes, we use encryption to protect all user data, including location information." },
        { question: "How often are flood alerts updated?", answer: "Alerts are updated in real-time as new information becomes available." },
        { question: "What should I do if I receive a flood alert?", answer: "Follow the instructions in the alert, prepare for potential evacuation, and stay tuned for further updates." },
        { question: "How can I provide feedback or report an issue?", answer: "Use the \"Send Us Feedback\" option in the app's profile section to share your thoughts or report any issues." }
    ];

    if (currentPage === 'FAQ') {
        return renderFAQ();
    } else {
        const questionNumber = parseInt(currentPage.replace('Question', ''));
        const { question, answer } = questions[questionNumber - 1];
        return renderQuestion(questionNumber, question, answer);
    }
}