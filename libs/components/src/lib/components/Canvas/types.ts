import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import type { CanvasAPIEntity, ChannelsEntity } from '@mezon/store';

export interface WhiteCanvasContent {
	type: 'whiteboard';
	elements: OrderedExcalidrawElement[];
	files?: { [key: string]: string };
}

export interface CanvasProps {
	idCanvas: string | null;
	content: string;
	title: string;
	isEditAndDelCanvas: boolean;
	canvasById: CanvasAPIEntity;
	currentChannel: ChannelsEntity | null;
	currentClanId?: string | null;
	showLoading: boolean;
	error: string | null;
}
