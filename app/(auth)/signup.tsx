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
  signInText: {
    color: '#fff',
    fontSize: 14,
  },
  signInLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});

const Signup: FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setConfirmPassword] = useState('');

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