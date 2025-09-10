import { getFirstMessageOfTopic, messagesActions, selectCurrentChannelId, selectCurrentClanId, topicsActions, useAppDispatch, useAppSelector } from '@mezon/store';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseNotificationJumpProps {
	messageId?: string;
	channelId?: string;
	clanId?: string;
	topicId?: string;
	isTopic: boolean;
	mode?: number;
}

export const useNotificationJump = ({ messageId, channelId, clanId, topicId, isTopic, mode }: UseNotificationJumpProps) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const currentClanId = useAppSelector(selectCurrentClanId);
	const currentChannelId = useAppSelector(selectCurrentChannelId);

	const handleJumpToTopic = useCallback(async () => {
		if (!topicId || !channelId || !clanId || !messageId) return;

		const isClanChanged = currentClanId !== clanId;
		const isChannelChanged = currentChannelId !== channelId;
		const channelPath = `/chat/clans/${clanId}/channels/${channelId}`;

		if (isClanChanged || isChannelChanged) {
			await navigate(channelPath);
		} else if (navigate) {
			navigate(channelPath);
		}

		dispatch(topicsActions.setIsShowCreateTopic(true));
		dispatch(topicsActions.setCurrentTopicId(topicId));
		dispatch(getFirstMessageOfTopic(topicId));
		
		dispatch(messagesActions.setIdMessageToJump({ id: messageId, navigate: false }));
	}, [currentClanId, currentChannelId, clanId, channelId, topicId, messageId, navigate, dispatch]);

	const handleJumpToMessage = useCallback(() => {
		if (!messageId || !channelId || !clanId) return;

		dispatch(messagesActions.jumpToMessage({
			clanId: clanId || '',
			messageId: messageId,
			channelId: channelId,
			mode: mode,
			navigate
		}));
	}, [dispatch, messageId, channelId, clanId, mode, navigate]);

	const handleClickJump = useCallback(async () => {
		if (isTopic) {
			await handleJumpToTopic();
			return;
		}
		
		handleJumpToMessage();
	}, [isTopic, handleJumpToTopic, handleJumpToMessage]);

	return {
		handleClickJump,
		handleJumpToTopic,
		handleJumpToMessage
	};
};
