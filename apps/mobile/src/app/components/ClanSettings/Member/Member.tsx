import { useTheme } from '@mezon/mobile-ui';
import { UsersClanEntity } from '@mezon/utils';
import { useCallback } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { APP_SCREEN, MenuClanScreenProps } from '../../../navigation/ScreenTypes';
import { MemberList } from './MemberList';

type MemberClanScreen = typeof APP_SCREEN.MENU_CLAN.MEMBER_SETTING;
export function MemberSetting({ navigation }: MenuClanScreenProps<MemberClanScreen>) {
	const { themeValue } = useTheme();

	const onMemberSelect = useCallback((member: UsersClanEntity) => {
		navigation.navigate(APP_SCREEN.MENU_CLAN.MANAGE_USER, {
			user: member
		});
	}, [navigation]);

	return (
		<KeyboardAvoidingView style={{ flex: 1 }}>
			<View style={{ flex: 1, backgroundColor: themeValue.secondary }}>
				<MemberList onMemberSelect={onMemberSelect} />
			</View>
		</KeyboardAvoidingView>
	);
}
