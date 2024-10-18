import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Marker, Callout, Circle } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { FloodWatch } from '@/types/Marker';
import { floodClassColor, floodWatchImage } from '@/constants/FloodWatch';

interface FloodWatchMarkerProps {
  floodWatch: FloodWatch;
  markerRef: React.RefObject<any>;
}

const screenWidth = Dimensions.get("window").width;
const FloodWatchMarker: React.FC<FloodWatchMarkerProps> = ({ floodWatch, markerRef }) => {
  const [showCallout, setShowCallout] = useState(false);
  const handleMarkerPress = useCallback(() => {
    setShowCallout(true);
    markerRef.current?.showCallout();
  }, []);

  return (
    <React.Fragment>
      <Marker
        ref={markerRef}
        image={floodWatchImage[floodWatch.class]}
        coordinate={floodWatch.coordinates}
        title={floodWatch.name}
        description='Tap again to view details'
        onPress={handleMarkerPress}
      >
        {showCallout && (
          <Callout tooltip={true} onPress={handleMarkerPress}>
            <View style={styles.calloutWrapper}>
              <Text style={styles.fwName}>{floodWatch.name}</Text>
              <WebView
                style={styles.floodWatchImage}
                source={{ uri: `http://www.bom.gov.au/fwo/IDQ${floodWatch.area_id}/IDQ${floodWatch.area_id}.${String(floodWatch.id).padStart(6, '0')}.png`}}
              />
              <View style={styles.metadataContainer}>
                <View style={styles.hgtContainer}>
                    <Text style={styles.heightText}>Height</Text>
                    <Text style={styles.hgtText}>{floodWatch.hgt.toFixed(2)}m</Text>
                </View>
                <View style={styles.metadataTextContainer}>
                  <Text style={styles.fwClass}>Class: {floodWatch.class.toUpperCase()}</Text>
                  <Text style={styles.fwObsTime}>Last observed: {floodWatch.obs_time}</Text>
                </View>
              </View>
            </View>
            <View style={styles.triangle}/>
          </Callout>
        )}
      </Marker>
      <Circle
        center={floodWatch.coordinates}
        radius={500}
        strokeWidth={0}
        strokeColor={floodClassColor[floodWatch.class]}
        fillColor={`${floodClassColor[floodWatch.class]}30`}
      />
    </React.Fragment>
  );
};

export default FloodWatchMarker;

const styles = StyleSheet.create({
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
  floodWatchImage: {
    height: 0.33 * screenWidth,
    width: '100%',
    marginBottom: 10,
  },
  fwName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hgtContainer: {
    flex: 3,
    alignItems: 'flex-end',
    marginRight: 5,
  },
  hgtText: {
    fontSize: 24,
    color: 'white',
  },
  heightText: {
    fontSize: 10,
    color: 'white',
  },
  metadataTextContainer: {
    flex: 5,
    marginLeft: 15,
  },
  fwObsTime: {
    fontSize: 12,
    color: '#999',
  },
  fwClass: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
});
