export function dataURLtoFile(dataurl: string, filename: string): File | null {
	const arr = dataurl.split(',');
	if (!Array.isArray(arr) || !arr?.[0]) {
		return null;
	}
	const mimeMatch = arr[0].match(/:(.*?);/);
	if (!mimeMatch || !mimeMatch[1]) {
		return null;
	}
	const mime = mimeMatch[1];
	const bstr = atob(arr[arr.length - 1]);
	const n = bstr.length;
	const u8arr = new Uint8Array(n);
	for (let i = 0; i < n; i++) {
		u8arr[i] = bstr.charCodeAt(i);
	}
	return new File([u8arr], filename, { type: mime });
}
