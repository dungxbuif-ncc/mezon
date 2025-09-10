import { LIMIT_CLAN_ITEM } from '../constant';

export interface ClanLimitCheckResult {
	canProceed: boolean;
	currentCount: number;
	maxCount: number;
	reason?: string;
}

export const checkClanLimit = (currentClanCount: number, action: 'create' | 'join' = 'create'): ClanLimitCheckResult => {
	const maxCount = LIMIT_CLAN_ITEM;
	const canProceed = currentClanCount < maxCount;

	return {
		canProceed,
		currentCount: currentClanCount,
		maxCount,
		reason: canProceed ? undefined : `You've reached the maximum number of clans you can ${action} on your account (${maxCount} clans).`
	};
};

export const hasReachedClanLimit = (currentClanCount: number): boolean => {
	return currentClanCount >= LIMIT_CLAN_ITEM;
};

export const getClanLimit = (): number => {
	return LIMIT_CLAN_ITEM;
};
