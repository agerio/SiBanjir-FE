import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

// Dummy data for notification and history lists
const notifications = [
  { id: '1', title: 'Floods Near your place', distance: '1.7 Km' },
  { id: '2', title: 'Floods Near your place', distance: '1.7 Km' },
  { id: '3', title: 'Floods Near your place', distance: '1.7 Km' },
];

const history = [
  { id: '1', title: 'Brisbane River', description: 'Flood event recorded on Brisbane City.', time: '2 Hour Ago' },
  { id: '2', title: 'Brisbane River', description: 'Flood event recorded on Brisbane City.', time: 'Yesterday' },
  { id: '3', title: 'Brisbane River', description: 'Flood event recorded on Brisbane City.', time: '2 Days Ago' },
  { id: '4', title: 'Brisbane River', description: 'Flood event recorded on Brisbane City.', time: '4 Days Ago' },
];

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'history'

  const renderNoNotification = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="bell-slash" size={60} color="#000" />
      </View>
      <Text style={styles.noDataText}>There's no notifications</Text>
      <Text style={styles.subText}>Your notifications will appear on this page</Text>
    </SafeAreaView>
  );

  const renderNotificationList = () => (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.notificationItem}>
          <FontAwesome name="bell" size={30} color="#fff" />
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationSubText}>There's a nearby flood. Approximately {item.distance} from your place</Text>
          </View>
        </View>
      )}
    />
  );

  const renderNoHistory = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="clock-o" size={60} color="#000" />
      </View>
      <Text style={styles.noDataText}>There's no history</Text>
      <Text style={styles.subText}>Flood's history will appear on this page</Text>
    </SafeAreaView>
  );

  const renderHistoryList = () => (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.historyItem}>
          <FontAwesome name="exclamation-triangle" size={30} color="red" />
          <View style={styles.historyText}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <Text style={styles.historyDescription}>{item.description}</Text>
            <Text style={styles.historyTime}>{item.time}</Text>
          </View>
        </View>
      )}
    />
  );

  const renderContent = () => {
    if (activeTab === 'notifications') {
      return notifications.length > 0 ? renderNotificationList() : renderNoNotification();
    } else {
      return history.length > 0 ? renderHistoryList() : renderNoHistory();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'notifications' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('history')}
          disabled={activeTab === 'history'} // Disable Notifications button if already active
        >
          <Text style={[styles.tabText, activeTab === 'notifications' ? styles.activeTabText : styles.inactiveTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('notifications')}
          disabled={activeTab === 'notifications'} // Disable History button if already active
        >
          <Text style={[styles.tabText, activeTab === 'history' ? styles.activeTabText : styles.inactiveTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e30',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: '#444',
  },
  inactiveTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#000',
  },
  iconContainer: {
    backgroundColor: '#fff',
    width: height / 6,
    height: height / 6,
    borderRadius: height / 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    alignSelf: 'center',
  },
  noDataText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#2b2b4b',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  notificationText: {
    marginLeft: 15,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationSubText: {
    color: '#bbb',
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#2b2b4b',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  historyText: {
    marginLeft: 15,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDescription: {
    color: '#bbb',
    fontSize: 14,
  },
  historyTime: {
    color: '#777',
    fontSize: 12,
  },
});
