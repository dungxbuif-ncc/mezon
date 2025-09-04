import { size, useTheme } from '@mezon/mobile-ui';
import { Text, TouchableOpacity, View } from 'react-native';
import StatusBarHeight from '../../../components/StatusBarHeight/StatusBarHeight';
import WebviewBase from '../../../components/WebviewBase';
import MezonIconCDN from '../../../componentUI/MezonIconCDN';
import { IconCDN } from '../../../constants/icon_cdn';
import { style } from './styles';

const AppBrowser = ({ navigation, route }) => {
	const { url, title } = route?.params;
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const handleGoback = () => {
		navigation?.goBack();
	};
	return (
		<View style={styles.wrapper}>
			<StatusBarHeight />
			<View style={styles.container}>
				<TouchableOpacity onPress={handleGoback}>
					<MezonIconCDN icon={IconCDN.backArrowLarge} height={size.s_24} width={size.s_24} color={themeValue.black} />
				</TouchableOpacity>

				<View style={styles.webTitle}>
					<Text style={styles.title} numberOfLines={1}>
						{title || url}
					</Text>
					<Text style={styles.appName}>Mezon</Text>
				</View>
			</View>
			<WebviewBase url={url} />
		</View>
	);
};

export default AppBrowser;
