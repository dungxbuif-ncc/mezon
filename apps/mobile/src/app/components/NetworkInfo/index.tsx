import { size } from '@mezon/mobile-ui';
import { appActions, selectHasInternetMobile } from '@mezon/store-mobile';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MezonIconCDN from '../../componentUI/MezonIconCDN';
import { IconCDN } from '../../constants/icon_cdn';

const NetInfoComp = () => {
	const hasInternet = useSelector(selectHasInternetMobile);
	const dispatch = useDispatch();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { t } = useTranslation(['common']);
	const [isVisible, setIsVisible] = React.useState(false);
	const fetchWithTimeout = async (url, timeout = 8000) => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				cache: 'no-cache',
				signal: controller.signal
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			console.error('log  => error', error);
			clearTimeout(timeoutId);
			if (error.name === 'AbortError') {
				throw new Error('Request timed out');
			}
			throw error;
		}
	};
	const checkConnectionQuality = async () => {
		try {
			const startTime = Date.now();
			const response = await fetchWithTimeout(`${process.env.NX_CHAT_APP_REDIRECT_URI}/favicon.ico`, 8000);

			if (!response.ok) {
				dispatch(appActions.setHasInternetMobile(false));
				setIsVisible(true);
				return false;
			}

			// Calculate response time
			const endTime = Date.now();
			const responseTime = endTime - startTime;

			// If response time is too high (e.g., > 3 seconds), consider it a poor connection
			if (responseTime > 8000) {
				dispatch(appActions.setHasInternetMobile(false));
				setIsVisible(true);
				return false;
			}
			timeoutRef?.current && clearInterval(timeoutRef.current);
			dispatch(appActions.setHasInternetMobile(true));
			setIsVisible(false);
			return true;
		} catch (error) {
			setIsVisible(true);
			dispatch(appActions.setHasInternetMobile(false));
			console.error('log  => error checkConnectionQuality', error);
			return false;
		}
	};

	const checkInitConnection = async () => {
		const isCheckConnect = await checkConnectionQuality();
		if (!isCheckConnect) {
			timeoutRef.current = setInterval(async () => {
				await checkConnectionQuality();
			}, 8000);
		}
	};

	const handleAppStateChangeListener = async (nextAppState: string) => {
		if (nextAppState === 'active') {
			const state = await NetInfo.fetch();
			setIsVisible(!state.isConnected);
			dispatch(appActions.setHasInternetMobile(state.isConnected));
			await checkInitConnection();
		}
	};

	useEffect(() => {
		checkInitConnection();
		AppState.addEventListener('change', handleAppStateChangeListener);
		NetInfo.addEventListener((state) => {
			setIsVisible(!state.isConnected);
			dispatch(appActions.setHasInternetMobile(state.isConnected));
		});
	}, []);

	const onClose = () => {
		setIsVisible(false);
	};

	return isVisible && !hasInternet ? (
		<View style={styles.container}>
			<MezonIconCDN icon={IconCDN.noSignalIcon} useOriginalColor={true} height={size.s_30} width={size.s_30} />
			<View>
				<Text style={styles.text1}>{t('poorConnection')}</Text>
				<Text numberOfLines={2} style={styles.text2}>
					{t('descPoorConnection')}
				</Text>
			</View>
			<Pressable onPress={onClose}>
				<MezonIconCDN icon={IconCDN.closeIcon} color={'white'} height={size.s_24} width={size.s_30} />
			</Pressable>
		</View>
	) : null;
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: size.s_10,
		gap: size.s_10,
		paddingVertical: size.s_6,
		position: 'absolute',
		zIndex: 110,
		top: Platform.OS === 'android' ? size.s_40 : size.s_60,
		marginHorizontal: 10,
		alignSelf: 'center',
		backgroundColor: 'rgba(63,69,75,0.89)',
		borderRadius: 10,
		elevation: 5, // Android shadow
		shadowColor: 'black', // iOS shadow
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		borderStartWidth: 5,
		borderColor: '#F44336'
	},
	text1: { textAlign: 'left', fontSize: size.medium, fontWeight: 'bold', marginBottom: size.s_2, color: 'white' },
	text2: { textAlign: 'left', fontSize: size.small, fontWeight: '500', color: '#999' }
});

export default NetInfoComp;
