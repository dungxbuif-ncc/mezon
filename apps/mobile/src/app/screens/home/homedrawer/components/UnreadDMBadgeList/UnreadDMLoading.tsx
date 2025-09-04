import { size, useTheme } from '@mezon/mobile-ui';
import { selectIsLoadDMData } from '@mezon/store-mobile';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useSelector } from 'react-redux';

export const UnreadDMLoading = React.memo(() => {
	const { themeValue } = useTheme();
	const isLoading = useSelector(selectIsLoadDMData);
	const opacity = useRef(new Animated.Value(!isLoading ? 1 : 0)).current;
	const containerHeight = useRef(new Animated.Value(!isLoading ? size.s_50 : 0)).current;

	useEffect(() => {
		// Animate opacity first
		Animated.timing(opacity, {
			toValue: isLoading ? 0 : 1,
			duration: 300,
			useNativeDriver: true
		}).start();

		// Then animate height with a slight delay when hiding
		Animated.timing(containerHeight, {
			toValue: isLoading ? 0 : size.s_50,
			duration: 300,
			delay: isLoading ? 150 : 0, // Slight delay when hiding
			useNativeDriver: false // Height animations can't use native driver
		}).start();
	}, [isLoading, opacity, containerHeight]);

	// Return an animated container that will smoothly hide/show
	return (
		<Animated.View style={{ height: containerHeight, overflow: 'hidden' }}>
			<Animated.View style={{ paddingVertical: size.s_20, opacity }}>
				<Flow color={themeValue.textDisabled} size={size.s_30} />
			</Animated.View>
		</Animated.View>
	);
});
