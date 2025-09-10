import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface ErrorState {
	errors: string[];
	clanLimitModalTrigger: boolean;
	clanLimitModalData: ClanLimitModalPayload | null;
}

export const ERRORS_FEATURE_KEY = 'errors';

export const initialErrorState: ErrorState = {
	errors: [],
	clanLimitModalTrigger: false,
	clanLimitModalData: null
};

export type ErrorPayload = {
	message?: string;
};

export type ClanLimitModalPayload = {
	type: 'create' | 'join';
	clanCount: number;
};

export type ErrorAction = PayloadAction<ErrorPayload>;

export const errorsSlice = createSlice({
	name: 'errors',
	initialState: initialErrorState,
	reducers: {
		addError: (state, action: PayloadAction<string>) => {
			state.errors.push(action.payload);
		},
		removeError: (state, action: PayloadAction<number>) => {
			state.errors.splice(action.payload, 1);
		},
		clearErrors: (state) => {
			state.errors = [];
		},
		triggerClanLimitModal: (state, action: PayloadAction<ClanLimitModalPayload>) => {
			state.clanLimitModalTrigger = true;
			state.clanLimitModalData = action.payload;
		},
		resetClanLimitModalTrigger: (state) => {
			state.clanLimitModalTrigger = false;
			state.clanLimitModalData = null;
		}
	}
});

export const { addError, removeError, clearErrors, triggerClanLimitModal, resetClanLimitModalTrigger } = errorsSlice.actions;

export const selectErrors = (state: { errors: ErrorState }) => state.errors.errors;

export const errorsReducer = errorsSlice.reducer;
