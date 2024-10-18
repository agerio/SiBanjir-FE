import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import axios from 'axios';
import { API_URL } from '@/context/GlobalContext';

const { height } = Dimensions.get('window');

interface Notification {
  id: string;
  name: string;
  created_at: string;
}

export default function NotificationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notification/history`);
        const allNotifications: Notification[] = response.data;

        const currentTime = new Date().getTime();
        const recentNotifications: Notification[] = [];
        const pastNotifications: Notification[] = [];
        const seenNotifications = new Set<string>();

        allNotifications.forEach((notification: Notification) => {
          const notificationTime = new Date(notification.created_at).getTime();
          const timeDiff = currentTime - notificationTime;
          const key = `${notification.name}-${Math.floor(notificationTime / (2 * 60 * 60 * 1000))}`;

          if (timeDiff < 24 * 60 * 60 * 1000) {
            if (!seenNotifications.has(key)) {
              recentNotifications.push(notification);
              seenNotifications.add(key);
            }
          } else {
            pastNotifications.push(notification);
          }
        });

        // Sort notifications with the latest at the bottom
        recentNotifications.sort((b, a) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        pastNotifications.sort((b, a) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setNotifications(recentNotifications);
        setHistory(pastNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour12: false,
    });
  };

  const renderNoNotification = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="bell-slash" size={60} color="#fff" />
      </View>
      <Text style={styles.noDataText}>There's no notifications</Text>
      <Text style={styles.subText}>Your notifications will appear on this page</Text>
    </View>
  );

  const renderNotificationList = () => (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.notificationItem}>
          <FontAwesome name="bell" size={30} color="#fff" />
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.name}</Text>
            <Text style={styles.notificationSubText}>
              A flood warning was issued near you.
            </Text>
            <Text style={styles.notificationTime}>{formatTimestamp(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );

  const renderNoHistory = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="clock-o" size={60} color="#fff" />
      </View>
      <Text style={styles.noDataText}>There's no history</Text>
      <Text style={styles.subText}>Flood's history will appear on this page</Text>
    </View>
  );

  const renderHistoryList = () => (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.historyItem}>
          <FontAwesome name="exclamation-triangle" size={30} color="red" />
          <View style={styles.historyText}>
            <Text style={styles.historyTitle}>{item.name}</Text>
            <Text style={styles.historyDescription}>
              This warning was issued in the past.
            </Text>
            <Text style={styles.historyTime}>{formatTimestamp(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );

  const renderFollowRequests = () => (
    <TouchableOpacity style={styles.minimalistContainer} onPress={() => router.push('../notif_related/FollowerRequest')}>
      <Image
        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_0Ba7uGEgF3hq5AYSaTQEQ80VtxtHPKF3Zg&s' }}
        style={styles.minimalistAvatar}
      />
      <View style={styles.minimalistTextContainer}>
        <Text style={styles.minimalistTitle}>Family Requests</Text>
        <Text style={styles.minimalistSubText}>Click to view your requests</Text>
      </View>
      <FontAwesome name="chevron-right" size={20} color="#fff" />
    </TouchableOpacity>
  );

  const renderSpecialWarnings = () => (
    <TouchableOpacity style={styles.minimalistContainer} onPress={() => router.push('../notif_related/SpecialWarningRequest')}>
      <FontAwesome name="exclamation-triangle" size={25} color="#FFD700" />
      <View style={styles.minimalistTextContainer}>
        <Text style={styles.minimalistTitle}>Special Warnings</Text>
        <Text style={styles.minimalistSubText}>Click to view important alerts</Text>
      </View>
      <FontAwesome name="chevron-right" size={20} color="#fff" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeTab === 'notifications') {
      return (
        <>
          {renderFollowRequests()}
          {renderSpecialWarnings()}
          {notifications.length > 0 ? renderNotificationList() : renderNoNotification()}
        </>
      );
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
          onPress={() => setActiveTab('notifications')}
          disabled={activeTab === 'notifications'}
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
          onPress={() => setActiveTab('history')}
          disabled={activeTab === 'history'}
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
    backgroundColor: "#1e1e30",
    // backgroundColor: "blue",
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#1e1e30",
    marginBottom: 10,
    // backgroundColor: "red",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  inactiveTab: {
    backgroundColor: "#444",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#000",
  },
  inactiveTabText: {
    color: "#fff",
  },
  iconContainer: {
    backgroundColor: "#444",
    width: height / 6,
    height: height / 6,
    borderRadius: height / 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    alignSelf: "center",
  },
  noDataText: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  notificationText: {
    marginLeft: 15,
    flex: 1,
  },
  notificationTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationSubText: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 5,
  },
  notificationTime: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },
  historyItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  historyText: {
    marginLeft: 15,
    flex: 1,
  },
  historyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyDescription: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 5,
  },
  historyTime: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },
  minimalistContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2b2b4b",
    borderRadius: 10,
    marginBottom: 10,
  },
  minimalistAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  minimalistTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  minimalistTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  minimalistSubText: {
    color: "#bbb",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});

