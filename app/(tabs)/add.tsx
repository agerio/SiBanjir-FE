import React, { FC, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ScrollView } from 'react-native';
import { useAuth } from '@/context/GlobalContext'; // Assuming you have an auth context
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location'; // Import module for location
import { API_URL } from "@/context/GlobalContext";

const AddFloodWarning: FC = () => {
    const [description, setDescription] = useState('');
    const [photoState, setPhotoState] = useState<{ uri?: string }>({});
    const [permissionStatus, requestPermission] = Camera.useCameraPermissions();
    const [modalVisible, setModalVisible] = useState(false);
    const { authState } = useAuth(); // Get the authentication state (token)
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null); // Store location

    // Request permission and get user's location on component mount
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: currentLocation.coords.latitude,
                long: currentLocation.coords.longitude,
            });
        })();
    }, []);

    // Function to handle image selection from the library
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

    // Function to handle image capture from the camera
    async function handleCameraPress() {
        setModalVisible(false);
        if (!permissionStatus || !permissionStatus.granted) {
            const { granted } = await requestPermission();
            if (!granted) return;
        }

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

    // Function to handle retaking the photo
    function handleRetake() {
        setPhotoState({});
    }

    // Reset form after submission
    const resetForm = () => {
        setDescription('');
        setPhotoState({});
        setLoading(false);
    };

    // Function to submit the flood warning
    const handleSubmit = async () => {
        if (!description || !photoState.uri || !location) {
            Alert.alert("Missing Fields", "Please provide a description, upload an image, and ensure location access.");
            return;
        }

        setLoading(true);
        console.log('meow') 
        console.log(photoState)
        try {
            const response = await fetch(photoState.uri); // Fetch the image as a blob
            const blob = await response.blob(); // Convert the response to a blob

            let formData = new FormData();
            formData.append('name', description); // Description becomes 'name' in the backend
            formData.append('image', {uri:photoState.uri, type:'image/jpeg', name:'upload.jpeg'}); // Append blob with a filename
            // formData.append('image', blob, 'flood_image.jpg'); // Append blob with a filename
            formData.append('lat', location.lat.toString()); // Append latitude
            formData.append('long', location.long.toString()); // Append longitude
            console.log(formData)

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
                resetForm();  // Reset the form on success
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.container}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter description"
                    value={description}
                    onChangeText={setDescription}
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
            </View>
        </ScrollView>
    );
};

export default AddFloodWarning;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#1D1D2E',
    },
    label: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    uploadBox: {
        width: '100%',
        height: 200,
        backgroundColor: '#444',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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
        marginTop: 20,
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
    },
});