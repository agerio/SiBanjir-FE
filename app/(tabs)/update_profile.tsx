import React, { useState } from "react";
import { SafeAreaView, View, Image, Dimensions, Button, TextInput, Text, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get("window");

const imageSize = height / 6;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        alignItems: "center"
    },
    photoFullView: {
        marginBottom: 20
    },
    photoEmptyView: {
        borderWidth: 3,
        borderRadius: imageSize / 2,
        borderColor: "#999",
        borderStyle: "dashed",
        width: imageSize,
        height: imageSize,
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    photoFullImage: {
        width: imageSize,
        height: imageSize,
        borderRadius: imageSize / 2
    },
    buttonView: {
        justifyContent: "center",
        marginBottom: 20
    },
    usernameContainer: {
        width: "100%",
        paddingHorizontal: 10,
        marginBottom: 10
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 15
    },
    passwordSection: {
        width: "100%",
        paddingHorizontal: 10,
        marginTop: 20
    },
    dashedLine: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderStyle: "dashed",
        marginVertical: 10,
        marginBottom: 20,
    },
    saveButtonContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: "center"
    }
});

export default function Profile() {
    const [photoState, setPhotoState] = useState<{ uri?: string }>({});
    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [reenterNewPassword, setReenterNewPassword] = useState("");

    async function handleChangePress() {
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

    const hasPhoto = Boolean(photoState.uri);

    function Photo() {
        if (hasPhoto) {
            return (
                <View style={styles.photoFullView}>
                    <Image
                        style={styles.photoFullImage}
                        resizeMode="cover"
                        source={{ uri: photoState.uri }}
                    />
                </View>
            );
        } else {
            return <View style={styles.photoEmptyView} />;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Photo />
            <View style={styles.buttonView}>
                <Button
                    onPress={handleChangePress}
                    title={hasPhoto ? "Edit Photo" : "Add Photo"}
                />
            </View>
            <View style={styles.usernameContainer}>
                <Text style={styles.label}>Edit Username</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                />
            </View>
            <View style={styles.passwordSection}>
                <Text style={styles.label}>Update Password</Text>
                <View style={styles.dashedLine} />
                <Text style={styles.label}>Old Password</Text>
                <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Old Password"
                    secureTextEntry
                />
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    secureTextEntry
                />
                <Text style={styles.label}>Re-enter New Password</Text>
                <TextInput
                    style={styles.input}
                    value={reenterNewPassword}
                    onChangeText={setReenterNewPassword}
                    placeholder="Re-enter New Password"
                    secureTextEntry
                />
            </View>
            <View style={styles.saveButtonContainer}>
                <Button title="Save" onPress={() => { /* Handle save action */ }} />
            </View>
        </SafeAreaView>
    );
}