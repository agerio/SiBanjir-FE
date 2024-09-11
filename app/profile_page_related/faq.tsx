import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: "#1e1e30",
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
    answerText: {
        fontSize: 18,
        color: "#fff",
        marginTop: 10
    },
    backButton: {
        fontSize: 16,
        color: "#fff",
        marginTop: 20,
        textDecorationLine: "underline",
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

export default function FAQPage() {
    const [currentPage, setCurrentPage] = useState('FAQ'); // 'FAQ', 'Question1', 'Question2'

    const renderFAQ = () => (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>FAQ</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search"
            />
            <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => setCurrentPage('Question1')}
            >
                <Text style={styles.questionText}>Question 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => setCurrentPage('Question2')}
            >
                <Text style={styles.questionText}>Question 2</Text>
            </TouchableOpacity>
            <View style={styles.bottomPattern}>
                {/* Bottom pattern can go here */}
            </View>
        </SafeAreaView>
    );

    const renderQuestion1 = () => (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Question 1</Text>
            <Text style={styles.answerText}>What is Si Banjir?</Text>
            <Text style={styles.answerText}>Answer: Is that the flood prediction app based on the rainfall</Text>
            <TouchableOpacity onPress={() => setCurrentPage('FAQ')}>
                <Text style={styles.backButton}>Back to FAQ</Text>
            </TouchableOpacity>
            <View style={styles.bottomPattern}>
                {/* Bottom pattern can go here */}
            </View>
        </SafeAreaView>
    );

    const renderQuestion2 = () => (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Question 2</Text>
            <Text style={styles.answerText}>Who is the owner?</Text>
            <Text style={styles.answerText}>Answer: Raja meksiko, elmatodore</Text>
            <TouchableOpacity onPress={() => setCurrentPage('FAQ')}>
                <Text style={styles.backButton}>Back to FAQ</Text>
            </TouchableOpacity>
            <View style={styles.bottomPattern}>
                {/* Bottom pattern can go here */}
            </View>
        </SafeAreaView>
    );

    if (currentPage === 'FAQ') {
        return renderFAQ();
    } else if (currentPage === 'Question1') {
        return renderQuestion1();
    } else if (currentPage === 'Question2') {
        return renderQuestion2();
    }
}
