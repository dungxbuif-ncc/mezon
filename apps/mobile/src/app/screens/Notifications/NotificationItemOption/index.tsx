import { ActionEmitEvent } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { notificationActions, useAppDispatch } from '@mezon/store-mobile';
import { INotification, NotificationCategory } from '@mezon/utils';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, View } from 'react-native';
import { InboxType } from '..';
import MezonIconCDN from '../../../componentUI/MezonIconCDN';
import MezonMenu, { IMezonMenuSectionProps } from '../../../componentUI/MezonMenu';
import { IconCDN } from '../../../constants/icon_cdn';

const mappingCategory = (selectedTab: string) => {
	switch (selectedTab) {
		case InboxType.INDIVIDUAL:
			return NotificationCategory.FOR_YOU;
		case InboxType.MESSAGES:
			return NotificationCategory.MESSAGES;
		case InboxType.MENTIONS:
			return NotificationCategory.MENTIONS;
		default:
			return NotificationCategory.MENTIONS;
	}
};

export default memo(function NotificationItemOption({ currentNotify, currentCategory }: { currentNotify: INotification; currentCategory: string }) {
	const { t } = useTranslation(['notification']);
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();

	const handleDeleteNotify = useCallback(() => {
		const category = mappingCategory(currentCategory);
		if (currentNotify?.id) {
			dispatch(notificationActions.deleteNotify({ ids: [currentNotify.id], category }));
		}

		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: true });
	}, [currentCategory, currentNotify?.id, dispatch]);

	const menu = useMemo(
		() =>
			[
				{
					items: [
						{
							title: t('removeNotification'),
							icon: <MezonIconCDN icon={IconCDN.trashIcon} height={20} width={20} color={themeValue.textStrong} />,
							onPress: handleDeleteNotify
						}
					]
				}
			] satisfies IMezonMenuSectionProps[],
		[handleDeleteNotify, t, themeValue.textStrong]
	);

	return (
		<View style={{ paddingHorizontal: size.s_20, marginVertical: -size.s_12 }}>
			<MezonMenu menu={menu} />
		</View>
	);
});
