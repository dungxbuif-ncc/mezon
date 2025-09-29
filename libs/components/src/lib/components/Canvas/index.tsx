import { canvasActions, createEditCanvas, selectTheme } from '@mezon/store';
import { EEventAction } from '@mezon/utils';
import { CanvasProps, Whiteboard, isWhiteboardCanvas } from 'libs/components/src/lib/components';
import { useCanvas } from 'libs/components/src/lib/components/Canvas/hooks/useCanvas';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

const CanvasContent = lazy(() => import('./CanvasContent'));

const CanvasContentPlaceholder = () => <div className="w-full h-[calc(100vh-120px)] animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>;

const TextCanvas = ({ idCanvas, content, title, isEditAndDelCanvas, canvasById, currentChannel, currentClanId, showLoading, error }: CanvasProps) => {
	const dispatch = useDispatch();
	const appearanceTheme = useSelector(selectTheme);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (textAreaRef.current) {
			textAreaRef.current.style.height = 'auto';
			textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
		}
	}, [title]);

	const callCreateEditCanvas = useCallback(
		async (isCreate: number) => {
			if (currentChannel?.id && currentClanId) {
				const body = {
					channel_id: currentChannel?.id,
					clan_id: currentClanId?.toString(),
					content,
					...(idCanvas && { id: idCanvas }),
					...(canvasById?.is_default && { is_default: true }),
					title,
					status: isCreate
				};
				const response = await dispatch(createEditCanvas(body) as any);
				if (response) {
					dispatch(canvasActions.setIdCanvas(response?.payload?.id));
				}
			}
		},
		[currentChannel?.id, currentClanId, content, idCanvas, canvasById?.is_default, title, dispatch]
	);

	const debouncedSave = useDebouncedCallback(() => {
		let isCreate: number = EEventAction.UPDATE;
		if (!idCanvas || (title && title !== canvasById?.title) || (content && content !== canvasById?.content)) {
			isCreate = EEventAction.CREATED;
		}

		callCreateEditCanvas(isCreate);
	}, 1000);

	const handleCanvasChange = useCallback(() => {
		if (!isEditAndDelCanvas) return;
		debouncedSave();
	}, [isEditAndDelCanvas, debouncedSave]);

	const handleInputChange = (e: { target: { value: any } }) => {
		if (!isEditAndDelCanvas) return;
		const newTitle = e.target.value;
		dispatch(canvasActions.setTitle(newTitle));
		handleCanvasChange();
	};

	return (
		<div className="w-full h-[calc(100vh-50px)] max-w-[80%]">
			<textarea
				ref={textAreaRef}
				placeholder="Your canvas title"
				value={title || ''}
				onChange={handleInputChange}
				rows={1}
				disabled={!isEditAndDelCanvas}
				className="w-full px-4 py-2 mt-[25px] text-theme-message bg-inherit focus:outline-none text-[28px] resize-none leading-[34px] font-bold "
			/>
			<div className="w-full">
				<Suspense fallback={<CanvasContentPlaceholder />}>
					<CanvasContent
						key={idCanvas}
						idCanvas={idCanvas || ''}
						isLightMode={appearanceTheme === 'light'}
						content={content || ''}
						isEditAndDelCanvas={isEditAndDelCanvas}
						onCanvasChange={handleCanvasChange}
					/>
				</Suspense>
			</div>
		</div>
	);
};
const Canvas = () => {
	const props = useCanvas();
	const isWhiteboard = useMemo(() => {
		return isWhiteboardCanvas(props.content);
	}, [props.content]);

	if (props.error) {
		return (
			<div className="w-full h-[calc(100vh-50px)] max-w-[80%] flex items-center justify-center text-theme-message">
				<div className="flex flex-col items-center gap-4">
					<div className="text-red-500 text-lg">
						<span role="img" aria-label="warning">
							⚠️
						</span>
						Error
					</div>
					<span className="">{props.error}</span>
				</div>
			</div>
		);
	}

	if (props.showLoading) {
		return (
			<div className="w-full h-[calc(100vh-50px)] max-w-[80%] flex items-center justify-center text-theme-message">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
					<span className="">Loading canvas...</span>
				</div>
			</div>
		);
	}

	if (isWhiteboard) {
		return <Whiteboard {...props} />;
	}

	return <TextCanvas {...props} />;
};

export default Canvas;
