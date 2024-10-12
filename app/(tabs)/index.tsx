import React from "react";
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import ShowMap from '../../components/ShowMap';

export default function App() {
    const params = useLocalSearchParams();
    const initialLocation = params.initialLocation;
    return (
        <ShowMap initialLocation={initialLocation}/>
    );
}
