import { ActionEmitEvent } from '@mezon/mobile-components';
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { IChannel } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useCallback } from 'react';
import { ActivityIndicator, DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BuzzBadge from '../../../../../../components/BuzzBadge/BuzzBadge';
import ChannelMenu from '../../ChannelMenu';
import { ChannelBadgeUnread } from '../ChannelBadgeUnread';
import { EventBadge } from '../ChannelEventBadge';
import { StatusVoiceChannel } from '../ChannelListItem';
import { style } from '../ChannelListItem/styles';
import ChannelListThreadItem from '../ChannelListThreadItem';
import { ChannelStatusIcon } from '../ChannelStatusIcon';

interface IChannelItemProps {
	data: IChannel;
	isUnRead?: boolean;
	isActive?: boolean;
}

function ChannelItem({ data, isUnRead, isActive }: IChannelItemProps) {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const numberNotification = data?.count_mess_unread ? data?.count_mess_unread : 0;

	const onPress = useCallback(() => {
		DeviceEventEmitter.emit(ActionEmitEvent.ON_CHANNEL_ROUTER, { channel: data });
	}, [data]);

	const onLongPress = useCallback(() => {
		const dataBottomSheet = {
			heightFitContent: true,
			children: <ChannelMenu channel={data} />
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: false, data: dataBottomSheet });
	}, [data]);

	if (data.type === ChannelType.CHANNEL_TYPE_THREAD) {
		return <ChannelListThreadItem thread={data} isActive={isActive} onLongPress={onLongPress} />;
	}

	return (
		<View
			style={[
				{ backgroundColor: themeBasic === ThemeModeBase.LIGHT ? themeValue.secondaryWeight : themeValue.secondaryLight },
				isActive && styles.channelListItemActive
			]}
		>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={onPress}
				onLongPress={onLongPress}
				style={[
					styles.channelListLink,
					isActive && styles.channelListItemActive,
					isActive && {
						backgroundColor: themeBasic === ThemeModeBase.LIGHT ? themeValue.secondaryWeight : themeValue.secondaryLight,
						shadowColor: themeValue.primary,
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
						zIndex: 1
					}
				]}
			>
				{!isActive && (
					<LinearGradient
						start={{ x: 1, y: 0 }}
						end={{ x: 0, y: 0 }}
						colors={[themeValue.secondary, themeValue?.primaryGradiant || themeValue.secondary]}
						style={[StyleSheet.absoluteFillObject]}
					/>
				)}
				<View style={[styles.channelListItem]}>
					{(isUnRead || Number(numberNotification || 0) > 0) && <View style={styles.dotIsNew} />}

					<ChannelStatusIcon channel={data} isUnRead={isUnRead || Number(numberNotification || 0) > 0} />
					<EventBadge clanId={data?.clan_id} channelId={data?.channel_id} />
					<Text
						style={[styles.channelListItemTitle, (isUnRead || Number(numberNotification || 0) > 0) && styles.channelListItemTitleActive]}
						numberOfLines={1}
					>
						{data?.channel_label}
					</Text>
				</View>
				{(data?.type === ChannelType.CHANNEL_TYPE_GMEET_VOICE || data?.type === ChannelType.CHANNEL_TYPE_MEZON_VOICE) &&
					data?.status === StatusVoiceChannel.No_Active && <ActivityIndicator color={themeValue.white} />}

				<BuzzBadge channelId={data?.channel_id as string} clanId={data?.clan_id as string} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />

				{Number(numberNotification || 0) > 0 && <ChannelBadgeUnread countMessageUnread={Number(numberNotification || 0)} />}
			</TouchableOpacity>
		</View>
	);
}
export default React.memo(ChannelItem, (prevProps, nextProps) => {
	return (
		prevProps?.data?.channel_label === nextProps?.data?.channel_label &&
		prevProps?.data?.channel_id === nextProps?.data?.channel_id &&
		prevProps?.data?.count_mess_unread === nextProps?.data?.count_mess_unread &&
		prevProps?.isUnRead === nextProps?.isUnRead &&
		prevProps?.isActive === nextProps?.isActive
	);
});
