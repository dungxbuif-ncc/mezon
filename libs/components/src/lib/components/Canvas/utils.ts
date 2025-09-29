import { MIME_TYPES } from '@excalidraw/excalidraw';
import { FileId, OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import { BinaryFileData, BinaryFiles } from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import { ECanvasMode, WhiteCanvasContent } from '@mezon/components';

export const isCanvasMode = (mode: ECanvasMode) => mode === ECanvasMode.CANVAS;
export const isWhiteboardMode = (mode: ECanvasMode) => mode === ECanvasMode.WHITEBOARD;
export const isWhiteboardCanvas = (content: string = '') => {
	if (!content) return false;
	try {
		const parsedContent = JSON.parse(content) as WhiteCanvasContent;
		return parsedContent?.type === 'whiteboard';
	} catch {
		return false;
	}
};
export const createWhiteboardContent = (elements: readonly OrderedExcalidrawElement[], files?: { [key: string]: string }): string => {
	return JSON.stringify({
		type: 'whiteboard',
		elements,
		...(files && Object.keys(files).length > 0 && { files })
	});
};

export const parseWhiteboardContent = (content: string = ''): WhiteCanvasContent => {
	if (!content)
		return {
			type: 'whiteboard',
			elements: [],
			files: {}
		};
	try {
		const parsedContent = JSON.parse(content) as WhiteCanvasContent;
		if (parsedContent?.type === 'whiteboard') {
			return parsedContent;
		}
		return {
			type: 'whiteboard',
			elements: [],
			files: {}
		};
	} catch {
		return {
			type: 'whiteboard',
			elements: [],
			files: {}
		};
	}
};

export const extractWhiteboardElements = (content: string = ''): OrderedExcalidrawElement[] => {
	if (!content) return [];
	try {
		const parsedContent = JSON.parse(content) as WhiteCanvasContent;
		if (parsedContent?.type === 'whiteboard') {
			return parsedContent.elements;
		}
		return [];
	} catch {
		return [];
	}
};

export const updateFilesToWhiteboard = ({
	state,
	deletedFileIds,
	files
}: {
	state: WhiteCanvasContent;
	deletedFileIds: string[];
	files: { [key: string]: string };
}): WhiteCanvasContent => {
	const updatedFiles = { ...state.files };
	deletedFileIds.forEach((fileId) => {
		delete updatedFiles[fileId];
	});
	const newFiles = { ...updatedFiles, ...files };
	return {
		...state,
		files: newFiles
	};
};

export const extractWhiteboardFiles = (content: string = ''): { [key: string]: string } => {
	if (!content) return {};
	try {
		const parsedContent = JSON.parse(content) as WhiteCanvasContent;
		if (parsedContent?.type === 'whiteboard') {
			return parsedContent.files || {};
		}
		return {};
	} catch {
		return {};
	}
};

/**
 * Creates a resolvable promise utility
 */
export const createResolvablePromise = <T>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: any) => void;
} => {
	let resolve: (value: T) => void;
	let reject: (reason?: any) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve: resolve!, reject: reject! };
};

/**
 * Determines MIME type from file extension
 */
export const getMimeTypeFromExtension = (url: string): string => {
	const extension = url.split('.').pop()?.toLowerCase();
	switch (extension) {
		case 'png':
			return MIME_TYPES.png;
		case 'jpg':
		case 'jpeg':
			return MIME_TYPES.jpg;
		default:
			return MIME_TYPES.jpg;
	}
};

/**
 * Converts a blob to data URL
 */
export const blobToDataURL = (blob: Blob): Promise<string> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.readAsDataURL(blob);
	});
};

/**
 * Fetches file from URL and converts to binary file format
 */
export const fetchAndConvertToBinaryFile = async (
	url: string,
	fileId: string
): Promise<{ success: true; file: BinaryFiles[string] } | { success: false; error: string }> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
		}

		const blob = await response.blob();
		const dataURL = await blobToDataURL(blob);

		// Determine MIME type
		let mimeType: string = blob.type;
		if (!mimeType || !Object.values(MIME_TYPES).includes(mimeType as any)) {
			mimeType = getMimeTypeFromExtension(url);
		}

		return {
			success: true,
			file: {
				mimeType: mimeType as any,
				id: fileId as FileId,
				dataURL: dataURL as any,
				created: Date.now(),
				lastRetrieved: Date.now()
			}
		};
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

/**
 * Loads files from URLs and converts them to binary files for Excalidraw
 */
export const loadFilesFromUrls = async (extractedFiles: { [key: string]: string }): Promise<BinaryFileData[]> => {
	const files: BinaryFileData[] = [];
	const erroredFiles: string[] = [];

	await Promise.all(
		Object.entries(extractedFiles).map(async ([fileId, url]) => {
			const result = await fetchAndConvertToBinaryFile(url, fileId);
			if (result.success) {
				files.push(result.file);
			} else {
				console.error(`Error loading file ${fileId}:`, result.error);
				erroredFiles.push(fileId);
			}
		})
	);
	return files;
};

/**
 * Updates the browser URL to reflect the canvas endpoint when creating a new canvas
 * @param canvasId - The ID of the newly created canvas
 */
export const updateCanvasUrl = (canvasId: string): void => {
	if (typeof window === 'undefined') return; // SSR safety check

	const currentPath = window.location.pathname;
	const expectedCanvasPath = `/canvas/${canvasId}`;

	// Check if current endpoint doesn't end with canvas/:canvasid
	if (!currentPath.endsWith(expectedCanvasPath)) {
		// Replace the URL to match the canvas endpoint
		const newPath = currentPath.replace(/\/canvas\/[^\/]*$/, '') + expectedCanvasPath;
		window.history.replaceState(null, '', newPath);
	}
};
