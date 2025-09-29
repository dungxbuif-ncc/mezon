import { useAuth } from '@mezon/core';
import {
	appActions,
	canvasAPIActions,
	canvasActions,
	selectCanvasEntityById,
	selectContent,
	selectCurrentChannel,
	selectCurrentClanId,
	selectIdCanvas,
	selectTitle
} from '@mezon/store';
import { CanvasProps } from 'libs/components/src/lib/components';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export const useCanvas = (): CanvasProps => {
	const dispatch = useDispatch();

	const { clanId, channelId, canvasId } = useParams<{
		clanId: string;
		channelId: string;
		canvasId: string;
	}>();

	const title = useSelector(selectTitle);
	const content = useSelector(selectContent);
	const idCanvas = useSelector(selectIdCanvas);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const canvasById = useSelector((state) => selectCanvasEntityById(state, currentChannel?.id, currentChannel?.parent_id, idCanvas));

	useEffect(() => {
		if (canvasById) {
			dispatch(canvasActions.setTitle(canvasById?.title || ''));
			dispatch(canvasActions.setContent(canvasById?.content || ''));
			dispatch(canvasActions.setIdCanvas(canvasById?.id || ''));
		}
	}, [canvasById]);

	const { userProfile } = useAuth();
	const isEditAndDelCanvas = Boolean(canvasById?.creator_id === userProfile?.user?.id || !canvasById?.creator_id);

	const [showLoading, setShowLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const refreshCanvasData = useCallback(
		async (forceRefresh = false) => {
			if (!canvasId || !channelId || !clanId) return;

			try {
				setShowLoading(false);
				setError(null);
				const loadingTimeout = setTimeout(() => {
					setShowLoading(true);
				}, 1000);

				const listBody = {
					channel_id: channelId,
					clan_id: clanId,
					noCache: forceRefresh
				};
				await dispatch(canvasAPIActions.getChannelCanvasList(listBody) as any);

				dispatch(canvasActions.setIdCanvas(canvasId));

				const detailBody = {
					id: canvasId,
					channel_id: channelId,
					clan_id: clanId,
					noCache: forceRefresh
				};
				const results = await dispatch(canvasAPIActions.getChannelCanvasDetail(detailBody) as any);
				const dataUpdate = results?.payload;

				if (dataUpdate && dataUpdate.content !== undefined) {
					const { content: canvasContent } = dataUpdate;
					dispatch(canvasActions.setContent(canvasContent));
					dispatch(canvasAPIActions.updateCanvas({ channelId, dataUpdate }));
				}

				clearTimeout(loadingTimeout);
			} catch (err) {
				setError('Failed to refresh canvas data');
			} finally {
				setShowLoading(false);
			}
		},
		[canvasId, channelId, clanId, dispatch]
	);

	useEffect(() => {
		dispatch(appActions.setIsShowCanvas(true));
		refreshCanvasData(false);
	}, [canvasId, channelId, clanId, dispatch, refreshCanvasData]);

	useEffect(() => {
		return () => {
			dispatch(canvasActions.setTitle(''));
			dispatch(canvasActions.setContent(''));
			dispatch(canvasActions.setIdCanvas(''));
			dispatch(appActions.setIsShowCanvas(false));
		};
	}, []);

	return { idCanvas, content, title, isEditAndDelCanvas, canvasById, currentChannel, currentClanId, showLoading, error };
};
