import React from "react";
import { StyleSheet, Text, View } from 'react-native';
import ShowMap from '../../components/ShowMap';

// export default function App() {
//     return (
//         <ShowMap />
//     );
// }

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    color: '#000',
  },
});

export default App;
