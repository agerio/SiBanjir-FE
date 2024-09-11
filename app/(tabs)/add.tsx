import React, { useState } from "react";
import { SafeAreaView, View, Image, TextInput, Text, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        alignItems: "center",
        backgroundColor: "#1e1e30"
    },
    formContainer: {
        backgroundColor: "#2b2b4b",
        borderRadius: 10,
        padding: 20,
        width: "90%",
        alignItems: "center"
    },
    label: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 10,
        alignSelf: "flex-start"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 15,
        width: "100%"
    },
    uploadBox: {
        width: "100%",
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
    },
    photoImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    uploadText: {
        color: "#555",
        fontSize: 16,
    },
    descriptionText: {
        color: "#ccc",
        fontSize: 12,
        marginBottom: 15,
        textAlign: "center"
    },
    actionButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        backgroundColor: "#444",
        alignItems: "center",
        marginHorizontal: 10
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16
    },
    submitButton: {
        backgroundColor: "#333",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16
    },
    cancelText: {
        color: "#aaa",
        fontSize: 16,
        marginTop: 20
    },
    modalView: {
        backgroundColor: "#333",
        padding: 20,
        borderRadius: 10,
        alignItems: "center"
    },
    modalButton: {
        backgroundColor: "#444",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: "100%",
        alignItems: "center"
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16
    }
});

export default function ReportFlood() {
    const [description, setDescription] = useState("");
    const [photoState, setPhotoState] = useState<{ uri?: string }>({});
    const [permissionStatus, requestPermission] = Camera.useCameraPermissions();
    const [modalVisible, setModalVisible] = useState(false);

    async function handleImageLibraryPress() {
        setModalVisible(false);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoState(result.assets[0]);
        }
    }

    async function handleCameraPress() {
        setModalVisible(false);
        // Check if permissionStatus is null or undefined
        if (!permissionStatus || !permissionStatus.granted) {
            const { granted } = await requestPermission();
            if (!granted) return; // Exit if permission is not granted
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

    function handleRetake() {
        setPhotoState({});
    }

    function handleSubmit() {
        if (!description || !photoState.uri) {
            Alert.alert("Missing Fields", "Please provide a description and upload an image.");
            return;
        }
        // handle submission logic here
        Alert.alert("Success", "Flood report submitted!");
    }

    function openModal() {
        setModalVisible(true);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter description"
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity style={styles.uploadBox} onPress={openModal}>
                    {photoState.uri ? (
                        <Image
                            source={{ uri: photoState.uri }}
                            style={styles.photoImage}
                        />
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

                <TouchableOpacity onPress={() => {}}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </View>

            {/* Modal for Upload Options */}
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
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ color: "#aaa", marginTop: 10 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
