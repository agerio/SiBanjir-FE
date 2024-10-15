import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import Cloud from '../../components/Cloud'; // Make sure to import the new component

const DropdownQuestion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
  
    const toggleDropdown = () => {
      const finalValue = isOpen ? 0 : 150;
      setIsOpen(!isOpen);
      Animated.spring(animatedHeight, {
        toValue: finalValue,
        useNativeDriver: false,
      }).start();
    };
  
    return (
      <TouchableOpacity style={styles.questionContainer} onPress={toggleDropdown} activeOpacity={0.7}>
        <Text style={styles.questionText}>{question}</Text>
        <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
          <Text style={styles.answerHeader}>Answer:</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  
  export default function FAQPage() {
    const scrollY = useRef(new Animated.Value(0)).current;
  
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
  
    return (
      <View style={styles.container}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <Text style={styles.header}>FAQ</Text>
          {questions.map((item, index) => (
            <DropdownQuestion key={index} question={item.question} answer={item.answer} />
          ))}
          <View style={styles.bottomSpace} />
        </Animated.ScrollView>
        <Cloud scrollY={scrollY} orientation="left" />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#1e1e30",
      position: 'relative',
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
      marginBottom: 20
    },
    questionContainer: {
      backgroundColor: "#2b2b4b",
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      overflow: 'hidden'
    },
    questionText: {
      fontSize: 18,
      color: "#fff"
    },
    answerHeader: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
      marginTop: 25,
      marginBottom: 5,
      marginLeft: 10
    },
    answerText: {
      fontSize: 16,
      color: "#fff",
      marginTop: 10,
      marginLeft: 10
    },
    bottomSpace: {
      height: 100, // Space to ensure content isn't hidden behind the cloud
    },
  });