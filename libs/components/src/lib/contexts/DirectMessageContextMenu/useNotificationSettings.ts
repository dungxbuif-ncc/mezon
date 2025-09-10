import { SetMuteNotificationPayload, SetNotificationPayload, notificationSettingActions, useAppDispatch } from '@mezon/store';
import { EMuteState } from '@mezon/utils';
import { format } from 'date-fns';
import { ChannelType } from 'mezon-js';
import { useCallback, useEffect, useState } from 'react';

interface UseNotificationSettingsParams {
	channelId?: string;
	notificationSettings?: any;
	getChannelId?: string;
}

export function useNotificationSettings({ channelId, notificationSettings, getChannelId }: UseNotificationSettingsParams) {
	const dispatch = useAppDispatch();
	const [mutedUntilText, setMutedUntilText] = useState<string>('');
	const [nameChildren, setNameChildren] = useState<string>('');

	const muteOrUnMuteChannel = useCallback(
		(channelId: string, active: number, channelType?: number) => {
			if (!channelId) return;
			dispatch(notificationSettingActions.updateNotiState({ channelId, active }));
			const now = new Date();
			const unmuteTimeISO = now.toISOString();

			const body = {
				channel_id: channelId,
				notification_type: 0,
				clan_id: '',
				active: active,
				time_mute: active === EMuteState.UN_MUTE ? undefined : unmuteTimeISO,
				is_current_channel: true,
				is_direct: channelType === ChannelType.CHANNEL_TYPE_DM || channelType === ChannelType.CHANNEL_TYPE_GROUP
			};
			dispatch(notificationSettingActions.setMuteNotificationSetting(body));
			dispatch(notificationSettingActions.setNotificationSetting(body));
		},
		[dispatch]
	);

	const handleScheduleMute = useCallback(
		(channelId: string, channelType: number, duration: number) => {
			if (!channelId) return;

			if (duration !== Infinity) {
				dispatch(notificationSettingActions.updateNotiState({ channelId, active: EMuteState.MUTED }));
				const now = new Date();
				const unmuteTime = new Date(now.getTime() + duration);
				const unmuteTimeISO = unmuteTime.toISOString();

				const body: SetNotificationPayload = {
					channel_id: channelId,
					notification_type: 0,
					clan_id: '',
					time_mute: unmuteTimeISO,
					is_current_channel: true,
					is_direct: channelType === ChannelType.CHANNEL_TYPE_DM || channelType === ChannelType.CHANNEL_TYPE_GROUP
				};
				dispatch(notificationSettingActions.setNotificationSetting(body));
			} else {
				dispatch(notificationSettingActions.updateNotiState({ channelId, active: EMuteState.MUTED }));
				const body: SetMuteNotificationPayload = {
					channel_id: channelId,
					notification_type: 0,
					clan_id: '',
					active: EMuteState.MUTED,
					is_current_channel: true
				};
				dispatch(notificationSettingActions.setMuteNotificationSetting(body));
			}
		},
		[dispatch]
	);

	const getNotificationSetting = useCallback(
		async (channelId?: string) => {
			if (channelId) {
				await dispatch(
					notificationSettingActions.getNotificationSetting({
						channelId: channelId
					})
				);
			}
		},
		[dispatch]
	);

	useEffect(() => {
		const isDefaultSetting = !notificationSettings?.id || notificationSettings?.id === '0';
		const isCurrentlyMuted = !isDefaultSetting && notificationSettings?.active === EMuteState.MUTED;
		const hasActiveMuteTime =
			!isDefaultSetting && notificationSettings?.time_mute ? new Date(notificationSettings.time_mute) > new Date() : false;
		const shouldShowUnmute = isCurrentlyMuted || hasActiveMuteTime;

		setNameChildren(shouldShowUnmute ? `UnMute` : `Mute`);

		setMutedUntilText(
			hasActiveMuteTime && notificationSettings?.time_mute
				? `Muted until ${format(new Date(notificationSettings.time_mute), 'dd/MM, HH:mm')}`
				: ''
		);
	}, [notificationSettings, dispatch, getChannelId]);

	return {
		mutedUntilText,
		nameChildren,
		muteOrUnMuteChannel,
		handleScheduleMute,
		getNotificationSetting
	};
}
