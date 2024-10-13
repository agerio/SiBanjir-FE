import React, { FC, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, Animated, Dimensions, Platform, Linking } from 'react-native';
import { useAuth } from '@/context/GlobalContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { API_URL } from "@/context/GlobalContext";
import Cloud from '../../components/Cloud';

const { width, height } = Dimensions.get("window");

const AddFloodWarning: FC = () => {
    const [description, setDescription] = useState('');
    const [photoState, setPhotoState] = useState<{ uri?: string }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const { authState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            // Request location permission
            let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: currentLocation.coords.latitude,
                long: currentLocation.coords.longitude,
            });

            // Request camera permission for iOS
            if (Platform.OS === 'ios') {
                const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus !== 'granted') {
                    Alert.alert('Camera Permission', 'Please grant camera permission in your device settings to use this feature.');
                }
            }
        })();
    }, []);

    async function handleImageLibraryPress() {
        setModalVisible(false);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoState(result.assets[0]);
        }
    }

    async function handleCameraPress() {
        if (Platform.OS ==='ios'){
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Required',
                    'This app needs access to your camera. Please grant permission in your device settings.',
                    [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhotoState(result.assets[0]);
                setModalVisible(false);
            }

        }
        else {
            setModalVisible(false);
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhotoState(result.assets[0]);
            }
        }
    }

    function handleRetake() {
        setPhotoState({});
    }

    const resetForm = () => {
        setDescription('');
        setPhotoState({});
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!description || !photoState.uri || !location) {
            Alert.alert("Missing Fields", "Please provide a description, upload an image, and ensure location access.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(photoState.uri);
            const blob = await response.blob();

            let formData = new FormData();
            formData.append('name', description);
            formData.append('image', { uri: photoState.uri, type: 'image/jpeg', name: 'upload.jpeg' });
            formData.append('lat', location.lat.toString());
            formData.append('long', location.long.toString());

            const header = new Headers();
            header.append('Authorization', `Token ${authState?.token}`);

            const requestOptions = {
                method: "POST",
                headers: header,
                body: formData,
            };

            const apiResponse = await fetch(`${API_URL}/specialwarning/warnings`, requestOptions);
            const result = await apiResponse.json();

            if (apiResponse.status === 201) {
                Alert.alert('Success', 'Flood warning submitted successfully!');
                resetForm();
            } else {
                Alert.alert('Error', result.message || 'An error occurred while submitting.');
            }
        } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Failed to submit the flood warning.');
        } finally {
            setLoading(false);
        }
    };

    function openModal() {
        setModalVisible(true);
    }

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter description"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.uploadBox} onPress={openModal}>
                    {photoState.uri ? (
                        <Image source={{ uri: photoState.uri }} style={styles.photoImage} />
                    ) : (
                        <Text style={styles.uploadText}>Upload Image</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.descriptionText}>Image will be shown to other users for verification</Text>

                {photoState.uri ? (
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleRetake}>
                            <Text style={styles.actionButtonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>SUBMIT</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>SUBMIT</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.bottomSpace} />
            </Animated.ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleCameraPress}>
                            <Text style={styles.modalButtonText}>Capture Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={handleImageLibraryPress}>
                            <Text style={styles.modalButtonText}>Upload from Library</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Cloud scrollY={scrollY} orientation="left" />
            <Cloud scrollY={scrollY} orientation="right" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D1D2E',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 120,
    },
    label: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
        marginTop: 100,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        marginTop: 10
    },
    uploadBox: {
        width: '100%',
        height: 200,
        backgroundColor: '#444',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 5,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    uploadText: {
        color: '#bbb',
        fontSize: 16,
    },
    actionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#555',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#6C63FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    modalView: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButton: {
        backgroundColor: '#444',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    descriptionText: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 15,
    },
    bottomSpace: {
        height: 100,
    },
});

export default AddFloodWarning;