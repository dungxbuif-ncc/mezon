import { createWhiteboardContent, ECanvasMode, ECanvasType, isWhiteboardCanvas, isWhiteboardMode } from '@mezon/components';
import { useEscapeKeyClose, useOnClickOutside } from '@mezon/core';
import {
	appActions,
	canvasActions,
	CanvasAPIEntity,
	selectCanvasIdsByChannelId,
	selectCurrentChannel,
	selectCurrentClanId,
	selectIdCanvas,
	selectTheme,
	setCanvasMode,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { CanvasSelector } from 'libs/components/src/lib/components/ChannelTopbar/TopBarComponents/Canvas/CanvasModal/CanvasSelector';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import EmptyCanvas from './EmptyCanvas';
import GroupCanvas from './GroupCanvas';
import SearchCanvas from './SearchCanvas';
type CanvasProps = {
	onClose: () => void;
	rootRef?: RefObject<HTMLElement>;
};

interface ICanvasModalConfig {
	createButtonText: string;
	filterFunction: (canvases: (CanvasAPIEntity & { title: string })[], keyword: string) => any[];
}

class CanvasModalFactory {
	static createConfig(mode: ECanvasMode, t: any): ICanvasModalConfig {
		switch (mode) {
			case ECanvasMode.CANVAS:
				return {
					createButtonText: t('modals.canvas.create'),
					filterFunction: (canvases, keyword) => {
						if (!keyword) return canvases.filter((entity) => !isWhiteboardCanvas(entity.content));
						const lowerCaseQuery = keyword.toLowerCase().trim();
						return canvases.filter(
							(entity) => !isWhiteboardCanvas(entity.content) && entity.title.toLowerCase().includes(lowerCaseQuery)
						);
					}
				};
			case ECanvasMode.WHITEBOARD:
				return {
					createButtonText: 'Create',
					filterFunction: (canvases, keyword) => {
						if (!keyword) return canvases.filter((entity) => isWhiteboardCanvas(entity.content));
						const lowerCaseQuery = keyword.toLowerCase().trim();
						return canvases.filter((entity) => isWhiteboardCanvas(entity.content) && entity.title.toLowerCase().includes(lowerCaseQuery));
					}
				};
			default:
				throw new Error(`Unknown canvas type: ${mode}`);
		}
	}
}

const CanvasModal = ({ onClose, rootRef }: CanvasProps) => {
	const { t } = useTranslation('channelTopbar');
	const dispatch = useAppDispatch();
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const appearanceTheme = useSelector(selectTheme);
	const [keywordSearch, setKeywordSearch] = useState('');
	const currentIdCanvas = useSelector(selectIdCanvas);
	const mode = useSelector(setCanvasMode);

	const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(currentIdCanvas);
	const canvases = useAppSelector((state) => selectCanvasIdsByChannelId(state, currentChannel?.channel_id ?? '', currentChannel?.parent_id));
	const config = useMemo(() => CanvasModalFactory.createConfig(mode, t), [mode, t]);
	const filteredCanvases = useMemo(() => {
		return config.filterFunction(canvases, keywordSearch);
	}, [canvases, keywordSearch, config]);

	useEffect(() => {
		if (currentIdCanvas && !selectedCanvasId) {
			setSelectedCanvasId(currentIdCanvas);
		}
	}, [currentIdCanvas, selectedCanvasId]);
	const handleCreateCanvas = () => {
		const isThread = Boolean(currentChannel?.parent_id && currentChannel?.parent_id !== '0');
		const id = isThread ? currentChannel?.channel_id : currentChannel?.channel_id;

		if (!id) {
			console.error('Error: ID is undefined. Check currentChannel data:', currentChannel);
			return;
		}
		const type = isThread ? ECanvasType.THREAD : ECanvasType.CHANNEL;
		const canvasContent = isWhiteboardMode(mode) ? createWhiteboardContent([]) : '';
		dispatch(canvasActions.setParentId(isThread ? currentChannel?.parent_id || null : id));
		dispatch(canvasActions.setType(type));
		dispatch(appActions.setIsShowCanvas(true));
		dispatch(canvasActions.setContent(canvasContent));
		dispatch(canvasActions.setIdCanvas(null));
		onClose();
	};

	const handleSelectCanvas = (canvasId: string) => {
		setSelectedCanvasId(canvasId);
	};

	const modalRef = useRef<HTMLDivElement>(null);
	useEscapeKeyClose(modalRef, onClose);
	useOnClickOutside(modalRef, onClose, rootRef);

	return (
		<div
			ref={modalRef}
			tabIndex={-1}
			className="absolute top-8 right-0 rounded-md dark:shadow-shadowBorder shadow-shadowInbox z-[99999999] origin-top-right"
		>
			<div className="flex flex-col bg-theme-setting-primary rounded-md h-[400px] md:w-[480px] max-h-[80vh] lg:w-[540px] justify-between shadow-sm overflow-hidden">
				<div className="flex flex-row items-center bg-theme-setting-nav border-b-theme-primary justify-between p-[16px] h-12 ">
					<div className="flex flex-row items-center border-r-[1px] border-color-theme pr-[16px] gap-4">
						<Icons.CanvasIcon />
						<CanvasSelector />
					</div>
					<SearchCanvas setKeywordSearch={setKeywordSearch} />
					<div className="flex flex-row items-center gap-4">
						<button onClick={handleCreateCanvas} className="px-3 h-6 rounded-lg btn-primary btn-primary-hover text-sm">
							{config.createButtonText}
						</button>
						<button onClick={onClose} className="text-theme-primary text-theme-primary-hover">
							<Icons.Close defaultSize="w-4 h-4 " />
						</button>
					</div>
				</div>
				<div
					className={`flex flex-col gap-2 py-2 px-[16px] flex-1 overflow-y-auto ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
				>
					{filteredCanvases?.map((canvas) => {
						return (
							<GroupCanvas
								onClose={onClose}
								key={canvas.id}
								canvas={canvas}
								channelId={currentChannel?.channel_id}
								clanId={currentClanId || ''}
								creatorIdChannel={currentChannel?.creator_id}
								selectedCanvasId={selectedCanvasId}
								onSelectCanvas={handleSelectCanvas}
							/>
						);
					})}

					{!filteredCanvases?.length && <EmptyCanvas onClick={handleCreateCanvas} mode={mode} />}
				</div>
			</div>
		</div>
	);
};

export default CanvasModal;
