import { Excalidraw } from '@excalidraw/excalidraw';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import { BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import { handleUploadFile, useMezon } from '@mezon/transport';
import {
	CanvasProps,
	extractWhiteboardFiles,
	loadFilesFromUrls,
	parseWhiteboardContent,
	updateCanvasUrl,
	updateFilesToWhiteboard,
	WhiteCanvasContent
} from 'libs/components/src/lib/components';
import { useCallbackRefState } from 'libs/components/src/lib/components/Whiteboard/hooks/useCallbackRefState';
import { WhiteBoardName } from 'libs/components/src/lib/components/Whiteboard/WhiteboardName';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import '@excalidraw/excalidraw/index.css';
import { canvasActions, createEditCanvas } from '@mezon/store';
import { dataURLtoFile, EEventAction } from '@mezon/utils';

export interface UpsertWhiteboardContent {
	newTitle?: string;
	elements?: OrderedExcalidrawElement[];
	files?: BinaryFiles;
}

const Whiteboard = ({ currentChannel, currentClanId, idCanvas, title, isEditAndDelCanvas, canvasById }: CanvasProps) => {
	const dispatch = useDispatch();
	const content = canvasById?.content;
	const { sessionRef, clientRef } = useMezon();
	const [excalidrawAPI, excalidrawRefCallback] = useCallbackRefState<ExcalidrawImperativeAPI>();
	const [wbCanvasContext, setWbCanvasContext] = useState<WhiteCanvasContent>(parseWhiteboardContent(content));

	const loadImages = useCallback(async () => {
		const extractedFiles = extractWhiteboardFiles(content);
		if (!excalidrawAPI || !extractedFiles || Object.keys(extractedFiles).length === 0) {
			return;
		}

		const loadedFiles = await loadFilesFromUrls(extractedFiles);

		if (loadedFiles.length) {
			excalidrawAPI.addFiles(loadedFiles);
		}
	}, [excalidrawAPI, content]);

	const handleCanvasChange = async ({ newTitle, elements, files }: UpsertWhiteboardContent) => {
		if (!newTitle && !elements?.length && !files?.length) return;
		const newCWbState = files ? await handleFilesChange(files) : { ...wbCanvasContext };
		if (!newCWbState) return;
		if (elements?.length) {
			newCWbState.elements = elements;
		}
		const newContent = JSON.stringify(newCWbState);
		const status = idCanvas ? EEventAction.UPDATE : EEventAction.CREATED;
		const body = {
			channel_id: currentChannel?.id,
			clan_id: currentClanId?.toString(),
			content: newContent,
			...(idCanvas && { id: idCanvas }),
			...(canvasById?.is_default && { is_default: true }),
			title: newTitle || title,
			status
		};
		const response = await dispatch(createEditCanvas(body) as any);
		if (response) {
			dispatch(canvasActions.setIdCanvas(response?.payload?.id));
			dispatch(canvasActions.setContent(newContent));
			dispatch(canvasActions.setTitle(newTitle || title));
			setWbCanvasContext(newCWbState);

			if (status === EEventAction.CREATED && response?.payload?.id) {
				updateCanvasUrl(response.payload.id);
			}
		}
	};
	const handleFilesChange = useCallback(
		async (files: BinaryFiles) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			if (!client || !session || !currentClanId) {
				return null;
			}
			const currentFileIds = wbCanvasContext.files ? Object.keys(wbCanvasContext.files) : [];
			const updatedFileIds = Object.keys(files);
			const newFileIds = updatedFileIds.filter((fileId) => !currentFileIds.includes(fileId));
			const deletedFileIds = currentFileIds.filter((fileId) => !updatedFileIds.includes(fileId));
			const attachments = await Promise.all(
				newFileIds.map(async (fileId) => {
					const file = dataURLtoFile(files[fileId].dataURL, fileId);
					if (!file) return null;
					const attachment = await handleUploadFile(client, session, currentClanId, currentChannel?.id || '', fileId, file);
					return {
						fileId,
						url: attachment.url || null
					};
				})
			);
			const newCWbState = updateFilesToWhiteboard({
				state: wbCanvasContext,
				deletedFileIds,
				files: attachments.reduce(
					(acc, curr) => {
						if (curr && curr.fileId && curr.url) {
							acc[curr.fileId] = curr.url;
						}
						return acc;
					},
					{} as { [key: string]: string }
				)
			});
			return newCWbState;
		},
		[sessionRef, clientRef, currentClanId, currentChannel?.id]
	);

	const handleCanvasChangeDebounce = useDebouncedCallback(
		(payload: { newTitle?: string; elements?: OrderedExcalidrawElement[]; files?: BinaryFiles }) => {
			if (!isEditAndDelCanvas) return;
			handleCanvasChange(payload);
		},
		500
	);
	const handleExcalidrawChange = useDebouncedCallback((elements: readonly OrderedExcalidrawElement[], _: any, files: BinaryFiles) => {
		if (!isEditAndDelCanvas) return;
		handleCanvasChange({
			elements: elements as OrderedExcalidrawElement[],
			files
		});
	}, 500);
	const renderTopRightUI = useCallback(() => {
		return <WhiteBoardName onChange={handleCanvasChangeDebounce} />;
	}, [handleCanvasChangeDebounce]);
	const loadScene = () => {
		if (!excalidrawAPI) return;
		const canvasContent = canvasById?.content || content;
		const canvasState = parseWhiteboardContent(canvasContent);
		setWbCanvasContext(canvasState);
		excalidrawAPI.updateScene({
			elements: canvasState?.elements
		});
		loadImages();
	};
	useEffect(() => {
		loadScene();
	}, [idCanvas, excalidrawAPI]);
	return (
		<Excalidraw
			excalidrawAPI={excalidrawRefCallback}
			renderTopRightUI={renderTopRightUI}
			onChange={handleExcalidrawChange}
			initialData={{
				elements: wbCanvasContext.elements
			}}
		/>
	);
};

export default Whiteboard;
