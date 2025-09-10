import { convertTimestampToTimeAgo } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectClanById, useAppSelector } from '@mezon/store-mobile';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MezonAvatar from '../../../componentUI/MezonAvatar';
import { parseObject } from '../NotificationMentionItem';
import { ENotifyBsToShow, NotifyProps } from '../types';
import MessageWebhookClan from './MessageWebhookClan';
import { style } from './styles';

const NotificationWebhookClan = ({ notify, onLongPressNotify }: NotifyProps) => {
	const clan = useAppSelector(selectClanById(notify?.content?.clan_id as string));
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const unixTimestamp = Math.floor(new Date(notify?.content?.create_time || notify?.create_time).getTime() / 1000);
	const messageTimeDifference = convertTimestampToTimeAgo(unixTimestamp);
	const data = parseObject(notify?.content);

	return (
		<TouchableOpacity onLongPress={() => onLongPressNotify(ENotifyBsToShow.removeNotification, notify)}>
			<View style={styles.notifyContainer}>
				<View style={styles.notifyHeader}>
					<View style={styles.boxImage}>
						<MezonAvatar avatarUrl={notify?.content?.avatar} username={notify?.content?.display_name}></MezonAvatar>
					</View>
					<View style={styles.notifyContent}>
						{clan?.clan_name && (
							<Text numberOfLines={2} style={styles.notifyHeaderTitle}>
								<Text style={styles.username}>{notify?.content?.display_name} </Text>
								{clan?.clan_name}
							</Text>
						)}
						<View style={styles.contentMessage}>{<MessageWebhookClan message={data} />}</View>
					</View>
					<Text style={styles.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};
export default React.memo(NotificationWebhookClan);
