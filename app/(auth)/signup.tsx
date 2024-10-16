import React, { FC, useState } from 'react';
import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '@/context/GlobalContext';

const Signup: FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const { onSignup } = useAuth();
    const navigation = useNavigation();

  const handleSignup = async () => {
    setLoading(true); // Set loading to true when signup process starts
    const response = await onSignup!(username, password, password2);
    setLoading(false); // Set loading to false when signup process ends

    if (response && response.error) {
      alert(response.msg);
    } else {
      router.replace("/(auth)/signin");
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Image source={require('@/assets/images/sibanjir.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Proactive Flood Alerts:</Text>
        <Text style={styles.subtitle}>Predict and Prepare with SiBanjir</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        style={styles.input}
        placeholder="Re-enter Password"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={password2}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]} // Disable button when loading
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" /> // Show spinner when loading
        ) : (
          <Text style={styles.buttonText}>Sign up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'signin',
            })
          );
        }}
      >
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.signInLink}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1D1D2E',
      padding: 20,
    },
    logoContainer: {
      marginBottom: 40,
    },
    logo: {
      width: 80,
      height: 80,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 30,
    },
    input: {
      width: '100%',
      height: 50,
      backgroundColor: '#333',
      borderRadius: 8,
      paddingHorizontal: 10,
      color: '#fff',
      marginBottom: 20,
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#6C63FF',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonDisabled: {
      backgroundColor: '#999', // Style for the button when disabled
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    signInText: {
      color: '#fff',
      fontSize: 14,
    },
    signInLink: {
      color: '#6C63FF',
      fontWeight: 'bold',
    },
  });
