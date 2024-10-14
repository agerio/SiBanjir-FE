import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
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
          <ActivityIndicator size="small" color="gray" style={styles.icon} />
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
    borderRadius: 30,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
