import { E2eKeyType } from './constants';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export function generateE2eId(path: E2eKeyType | '' = '', identifier = ''): string | undefined {
	if (!IS_DEVELOPMENT) return undefined;
	return [...path.split('.'), identifier].filter(Boolean).join('-');
}