import { ECanvasMode, isCanvasMode, isWhiteboardMode } from '@mezon/components';
import { canvasActions, setCanvasMode } from '@mezon/store';
import { ChevronDownIcon } from 'libs/ui/src/lib/Icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export const CanvasSelector = () => {
	const { t } = useTranslation('channelTopbar');
	const dispatch = useDispatch();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const mode = useSelector(setCanvasMode);

	const setMode = (mode: ECanvasMode) => {
		dispatch(canvasActions.setMode(mode));
	};

	return (
		<div className="flex flex-row items-center gap-1 relative">
			<div
				className="text-base font-semibold cursor-pointer flex justify-end items-center gap-1 px-2 py-1 rounded hover:bg-theme-setting-primary/60 w-[120px]"
				onClick={() => setPopoverOpen((v) => !v)}
			>
				{isCanvasMode(mode) ? t('modals.canvas.title') : 'Whiteboard'}
				<ChevronDownIcon className="w-4 h-4" />
			</div>
			{popoverOpen && (
				<div className="absolute top-full right-2 mt-2 bg-theme-setting-primary border rounded shadow z-50 gap-1 flex flex-col p-2">
					<button
						className={`w-full text-right p-2 border-b bg-item-hover ${isCanvasMode(mode) ? 'font-bold' : ''}`}
						onClick={() => {
							setMode(ECanvasMode.CANVAS);
							setPopoverOpen(false);
						}}
					>
						{t('modals.canvas.title')}
					</button>
					<button
						className={`w-full text-right p-2 bg-item-hover ${isWhiteboardMode(mode) ? 'font-bold' : ''}`}
						onClick={() => {
							setMode(ECanvasMode.WHITEBOARD);
							setPopoverOpen(false);
						}}
					>
						Whiteboard
					</button>
				</div>
			)}
		</div>
	);
};
