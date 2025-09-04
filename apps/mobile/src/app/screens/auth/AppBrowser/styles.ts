import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.white,
			height: size.s_50,
			borderBottomWidth: 1,
			borderBottomColor: colors.text,
			justifyContent: 'space-between',
			alignItems: 'center',
			flexDirection: 'row',
			paddingHorizontal: size.s_10
		},
		wrapper: {
			flex: 1
		},
		webTitle: {
			alignItems: 'center',
			position: 'absolute',
			left: '30%',
			right: '30%'
		},
        title: {
            color: colors.black,
        },
        appName: {
            color: colors.textDisabled,
        }
	});
