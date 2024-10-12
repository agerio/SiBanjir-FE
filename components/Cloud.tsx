import React from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const Cloud = ({ scrollY, orientation = 'left' }) => {
  if (!scrollY || typeof scrollY.interpolate !== 'function') {
    console.error('Invalid scrollY prop provided to Cloud component');
    return null;
  }

  const translateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  const getPath = (points) => {
    let pathData = `M${points[0][0]} ${points[0][1]} `;
    for (let i = 1; i < points.length; i++) {
      pathData += `Q${points[i][0]} ${points[i][1]} ${points[i+1]?.[0] ?? width} ${points[i+1]?.[1] ?? points[i][1]} `;
    }
    pathData += `L${width} 120 L0 120 Z`;
    return pathData;
  };

  const paths = [
    [
      [0, 120], [width * 0.1, 100], [width * 0.25, 110], [width * 0.4, 105],
      [width * 0.5, 110], [width * 0.65, 100], [width * 0.8, 105], [width, 100]
    ],
    [
      [0, 120], [width * 0.2, 95], [width * 0.4, 105], [width * 0.6, 95],
      [width * 0.8, 100], [width, 90]
    ],
    [
      [0, 120], [width * 0.25, 90], [width * 0.5, 100], [width * 0.75, 95],
      [width, 85]
    ]
  ].map(points => getPath(points));

  return (
    <Animated.View style={[
      styles.cloudContainer, 
      { transform: [{ translateY }] },
      orientation === 'right' ? styles.rightOrientation : null
    ]}>
      <Svg height="120" width={width} viewBox={`0 0 ${width} 120`} preserveAspectRatio="none">
        <Path d={paths[0]} fill="#ffffff" fillOpacity="0.8" />
        <Path d={paths[1]} fill="#ffffff" fillOpacity="0.6" />
        <Path d={paths[2]} fill="#ffffff" fillOpacity="0.4" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cloudContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  rightOrientation: {
    transform: [{ scaleX: -1 }],
  },
});

export default Cloud;