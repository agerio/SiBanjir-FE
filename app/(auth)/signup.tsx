import React, { FC, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import axios from 'axios';

const Signup: FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setConfirmPassword] = useState('');
    const navigation = useNavigation();

  const handleSignup = async () => {
    try {
      const response = await axios.post('https://si-banjir-be.vercel.app/api/user/register', {
        username,
        password,
        password2,
      });


      if (response.data.message === "User created successfully") {
        // Navigate to the signin screen
        navigation.dispatch(
          CommonActions.navigate({
            name: 'signin',
          })
        );
      } else {
        // Handle registration error
        console.log(response.data.message)
        console.error('Registration error:', response.data.error);
      }
    } catch (error) {
      console.error('Signup error:', error);
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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign up</Text>
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