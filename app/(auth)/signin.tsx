import React, { FC, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1D1D2E',
    padding: 20,
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
  signUpText: {
    color: '#fff',
    fontSize: 14,
  },
  signUpLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});

const Signin: FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignin = async () => {
    try {
      const response = await axios.post('https://si-banjir-be.vercel.app/api/user/login', {
        username,
        password,
      });

      if (response.data.message === 'Login successful') {
        // Navigate to the (tabs) screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: '(tabs)' }],
          })
        );
      } else {
        // Handle login error
        console.error('Login error:', response.data.error);
      }
    } catch (error) {
      console.error('Signin error:', error);
    }
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={styles.button} onPress={handleSignin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'signup',
            })
          );
        }}
      >
        <Text style={styles.signUpText}>
          Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signin;