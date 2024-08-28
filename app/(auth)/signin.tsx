import React, { FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Login: FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* <View style={styles.logoContainer}>
        <Image source={require('../assets/images/mars.jpg')} style={styles.logo} />
      </View> */}
      <Text style={styles.title}>Proactive Flood Alerts:</Text>
      <Text style={styles.subtitle}>Predict and Prepare with SiBanjir</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'tabs' }],
            })
          );
        }}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.registerText}>
          Don’t have an account? <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

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
  registerText: {
    color: '#fff',
    fontSize: 14,
  },
  registerLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});
