import { ActionEmitEvent } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import {
	clansActions,
	selectAllUserClans,
	selectCurrentClan,
	selectCurrentClanId,
	useAppDispatch
} from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { APP_SCREEN, MenuClanScreenProps } from 'apps/mobile/src/app/navigation/ScreenTypes';
import { ERequestStatus } from 'apps/mobile/src/app/screens/channelPermissionSetting/types/channelPermission.enum';
import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DeviceEventEmitter, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../componentUI/MezonAvatar';
import MezonButton, { EMezonButtonSize, EMezonButtonTheme } from '../../componentUI/MezonButton';
import MezonIconCDN from '../../componentUI/MezonIconCDN';
import { IconCDN } from '../../constants/icon_cdn';
import { style } from './styles';

type TransferOwnershipScreenProps = MenuClanScreenProps<typeof APP_SCREEN.MENU_CLAN.TRANSFER_OWNERSHIP>;

const TransferOwnershipScreen = ({ route }: TransferOwnershipScreenProps) => {
	const { user } = route.params;
	const dispatch = useAppDispatch();
	const navigation = useNavigation();
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['userProfile', 'clanOverviewSetting']);
	const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
	const currentClan = useSelector(selectCurrentClan);
	const currentClanId = useSelector(selectCurrentClanId);
	const clanMembers = useSelector(selectAllUserClans);
	
	const currentOwner = useMemo(() => {
		if (!currentClan?.creator_id || !clanMembers?.length) return null;
		return clanMembers.find(member => member.user?.id === currentClan.creator_id);
	}, [currentClan?.creator_id, clanMembers]);

	const handleTransferOwnership = useCallback(async (newOwnerId: string) => {
		if (!currentClanId || !newOwnerId) return;

		try {
			const response = await dispatch(clansActions.transferClan({ 
				clanId: currentClanId, 
				new_clan_owner: newOwnerId 
			}));
			
			if (response?.meta?.requestStatus === ERequestStatus.Fulfilled) {
				Toast.show({
					type: 'success',
					props: {
						text2: t('clanOverviewSetting:permissions.toast.transferOwnershipSuccess'),
						leadingIcon: <MezonIconCDN icon={IconCDN.checkmarkLargeIcon} color={baseColor.green} />
					}
				});
				DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: true });
				navigation.navigate(APP_SCREEN.HOME as never);
			} else {
				throw new Error();
			}
		} catch (error) {
			Toast.show({
				type: 'success',
				props: {
					text2: t('clanOverviewSetting:permissions.toast.transferOwnershipFailed'),
					leadingIcon: <MezonIconCDN icon={IconCDN.closeIcon} color={baseColor.redStrong} />
				}
			});
		}
	}, [currentClanId, dispatch, t, navigation]);

	const handleTransfer = () => {
		if (isAcknowledged && user?.user?.id) {
			handleTransferOwnership(user.user.id);
		}
	};

	if (!currentOwner) {
		return (
			<View style={{ flex: 1, backgroundColor: themeValue.primary, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: themeValue.text }}>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} style={{ flex: 1 }}>
				<View style={styles.transferVisual}>
					<View style={styles.arrowContainer}>
						<View style={styles.arrowDown} />
					</View>
					<View style={styles.userCircle}>
						<MezonAvatar
							width={size.s_90}
							height={size.s_90}
							avatarUrl={currentOwner?.user?.avatar_url}
							username={currentOwner?.user?.username || ''}
							isBorderBoxImage={true}
						/>
					</View>
					<View style={styles.userCircle}>
						<MezonAvatar
							width={size.s_90}
							height={size.s_90}
							avatarUrl={user?.user?.avatar_url}
							username={user?.user?.username || ''}
							isBorderBoxImage={true}
						/>
					</View>
				</View>

				<Text style={styles.serverName}>{currentClan?.clan_name}</Text>

				<Text style={styles.warningText}>
					<Trans
						i18nKey={"userProfile:transferOwnershipModal.warning"}
						values={{
							clanName: currentClan?.clan_name,
							username: user?.user?.username || user?.['username']
						}}
						components={{ 
							highlightClan: <Text key="highlightClan" style={styles.highlightText} />,
							highlightUser: <Text key="highlightUser" style={styles.highlightText} />
						}}
					/>
				</Text>

				<View style={styles.acknowledgmentSection}>
					<Text style={styles.sectionTitle}>{t('userProfile:transferOwnershipModal.sectionTitle')}</Text>
					<TouchableOpacity 
						style={styles.checkboxContainer}
						onPress={() => setIsAcknowledged(!isAcknowledged)}
					>
						<View style={[styles.checkbox, isAcknowledged && styles.checkboxChecked]}>
							{isAcknowledged && (
								<MezonIconCDN
									icon={IconCDN.checkmarkSmallIcon}
									width={size.s_16}
									height={size.s_16}
									color={themeValue.text}
								/>
							)}
						</View>
						<Text style={styles.acknowledgmentText}>
							{t('userProfile:transferOwnershipModal.acknowledgment', { 
								username: user?.user?.username || user?.['username']
							})}
						</Text>
					</TouchableOpacity>
				</View>

				<MezonButton
					onPress={handleTransfer}
					title={t('userProfile:transferOwnershipModal.transferButton')}
					type={EMezonButtonTheme.THEME}
					size={EMezonButtonSize.LG}
					containerStyle={[styles.button, !isAcknowledged && styles.buttonDisabled]}
					titleStyle={styles.textButton}
					disabled={!isAcknowledged}
				/>
			</KeyboardAvoidingView>
		</View>
	);
};

export default TransferOwnershipScreen;
