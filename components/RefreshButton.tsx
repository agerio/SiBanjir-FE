import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, loading }) => {
  return (
    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
      {loading ? (
        <>
          <ActivityIndicator size={24} color="gray" style={styles.icon} />
          <Text style={styles.text}>Loading</Text>
        </>
      ) : (
        <>
          <Ionicons name="refresh" size={24} color="gray" style={styles.icon} />
          <Text style={styles.text}>Refresh</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    refreshButton: {
        backgroundColor: 'white',
        opacity: 0.85,
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start', // Adjusts the button width to content
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: 'gray',
        fontWeight: 'bold',
    },
});
  
export default RefreshButton;
