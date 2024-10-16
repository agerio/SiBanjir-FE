import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Marker, Callout, Circle } from 'react-native-maps';
import { WebView } from 'react-native-webview';

const screenWidth = Dimensions.get("window").width;

const FloodWatchMarker = React.memo(({ fw, floodWatchImage, floodClassColor }) => {
  const [showCallout, setShowCallout] = useState(false);
  const markerRef = useRef(null);

  const handleMarkerPress = useCallback(() => {
    setShowCallout(true);
    markerRef.current?.showCallout();
  }, []);

  return (
    <>
      <Marker
        ref={markerRef}
        image={floodWatchImage[fw.class]}
        coordinate={fw.coordinates}
        title={fw.name}
        description='Tap again to view details'
        onPress={handleMarkerPress}
      >
        {showCallout && (
          <Callout tooltip={true}>
            <View style={styles.calloutWrapper}>
              <WebView
                style={styles.floodWatchImage}
                source={{ uri: `http://www.bom.gov.au/fwo/IDQ${fw.area_id}/IDQ${fw.area_id}.${String(fw.id).padStart(6, '0')}.png`}}
              />
              <Text style={styles.fwName}>{fw.name}</Text>
              <View style={styles.metadataContainer}>
                <View style={styles.heightContainer}>
                    <Text style={{fontSize: 24, color: 'white'}}>{fw.hgt.toFixed(2)}</Text>
                    <Text style={{fontSize: 10, color: 'white', textAlign:'right'}}>meter</Text>
                </View>
                {/* <View style={styles.profilePicture}>
                </View> */}
                <View style={styles.metadataTextContainer}>
                  <Text style={styles.username}>{fw.class.toUpperCase()}</Text>
                  <Text style={styles.createdAt}>Last observed: {fw.obs_time}</Text>
                </View>
              </View>
            </View>
            <View style={styles.triangle}/>
          </Callout>
        )}
      </Marker>
      <Circle
        center={fw.coordinates}
        radius={500}
        strokeWidth={0}
        strokeColor={floodClassColor[fw.class]}
        fillColor={`${floodClassColor[fw.class]}30`}
      />
    </>
  );
});

const renderFloodWatchMarkers = (floodWatches, floodWatchImage, floodClassColor) => {
  return floodWatches.map(fw => (
    <FloodWatchMarker
      key={fw.id}
      fw={fw}
      floodWatchImage={floodWatchImage}
      floodClassColor={floodClassColor}
    />
  ));
};

export { renderFloodWatchMarkers };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#1e1e30",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '60%',
      backgroundColor: '#2b2b4b',
      borderRadius: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#1e1e30',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    modalTitle: {
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    legendImage: {
      width: 50,
      height: 50,
      marginRight: 10,
    },
    legendTextContainer: {
      flex: 1,
      paddingRight: 20,
    },
    legendTitle: {
      fontWeight: 'bold',
      color: '#fff',
    },
    legendDescription: {
      fontSize: 12,
      color: '#999',
      textAlign: 'justify',
    },
    legendButton: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 2,
      elevation: 5,
      opacity: 0.75,
    },
    legendButtonText: {
      fontWeight: 'bold',
      color: '#fff',
    },
    calloutWrapper: {
      backgroundColor: '#1e1e30',
      width: 0.8 * screenWidth,
      padding: 15,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginTop: 10,
    },
    triangle: {
      width: 0,
      height: 0,
      marginLeft: 'auto',
      marginRight: 'auto',
      borderTopWidth: 15,
      borderTopColor: '#1e1e30',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftWidth: 10,
      borderRightWidth: 10,
    },
    image: {
      height: 0.45 * screenWidth,
      width: '100%',
      marginBottom: 5,
    },
    floodWatchImage: {
      height: 0.3 * screenWidth,
      width: '100%',
      marginBottom: 5,
    },
    fwName: {
      fontSize: 16,
      fontWeight: 'semibold',
      marginBottom: 10,
      color: '#fff',
    },
    metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        // backgroundColor: 'blue',
    },
    heightContainer: {
        // alignItems: 'center',
        // backgroundColor: 'red',
    },
    metadataTextContainer: {
      flex: 1,
    //   marginRight: 5,
      marginLeft: 15,
    //   backgroundColor: 'green',
    },
    profilePicture: {
      overflow: 'hidden',
      flex: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    username: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#fff',
    },
    createdAt: {
      fontSize: 12,
      color: '#999',
    },
    verifDenyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    verificationCount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'green',
      marginRight: 3,
    },
    denialCount: {
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 5,
      color: 'crimson',
      marginRight: 3,
    },
    iconCloseButton: {
      marginLeft: 5,
      backgroundColor: '#912424',
      padding: 5,
      borderRadius: 5,
      alignItems: 'center',
    },
    iconCheckButton: {
      marginLeft: 5,
      backgroundColor: '#53964e',
      padding: 5,
      borderRadius: 5,
      alignItems: 'center',
    },
    friendMarker: {
      width: 50,
      height: 50,
      overflow: 'hidden',
      resizeMode: 'center',
      borderRadius: 25,
      borderWidth: 4,
      borderColor: "darkgreen",
    },
  });