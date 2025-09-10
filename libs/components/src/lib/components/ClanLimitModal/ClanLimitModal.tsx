import { useEscapeKeyClose } from '@mezon/core';
import { resetClanLimitModalTrigger, useAppDispatch, useAppSelector } from '@mezon/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';

export interface ClanLimitModalProps {
	type: 'create' | 'join';
	clanCount: number;
}

const ClanLimitModalContent = ({ type, clanCount, onClose }: ClanLimitModalProps & { onClose: () => void }) => {
	const modalRef = useRef<HTMLDivElement>(null);

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) {
				onClose();
			}
		},
		[onClose]
	);

	const handleEnterKey = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				onClose();
			}
		},
		[onClose]
	);

	useEscapeKeyClose(modalRef, onClose);

	useEffect(() => {
		document.addEventListener('keydown', handleEnterKey);
		return () => {
			document.removeEventListener('keydown', handleEnterKey);
		};
	}, [handleEnterKey]);

	const isCreateType = type === 'create';
	const title = isCreateType ? 'Clan Creation Limit Reached' : 'Clan Join Limit Reached';
	const bodyText = isCreateType
		? `You've reached the maximum number of clans you can create on your account (${clanCount} clans). To create a new one, you'll need to delete or leaving one of your existing clans.`
		: `You've reached the maximum number of clans you can join on your account (${clanCount} clans). To join this new clan, you'll need to delete or leaving one of your existing clans.`;

	return (
		<div ref={modalRef} tabIndex={-1} className='fixed inset-0 flex items-center justify-center z-50' onClick={handleOverlayClick}>
			<div className='fixed inset-0 bg-black opacity-80' />
			<div className='relative z-10 w-[440px] max-w-[90vw]' onClick={(e) => e.stopPropagation()}>
				<div className='bg-theme-setting-primary pt-[16px] px-[16px] rounded-t-md'>
					<div className='text-theme-primary-active text-[20px] font-semibold pb-[16px]'>{title}</div>
					<div className='pb-[20px] text-theme-primary text-[14px] leading-relaxed'>{bodyText}</div>
				</div>
				<div className='bg-theme-setting-nav flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium rounded-b-md'>
					<button
						onClick={onClose}
						className='btn-primary btn-primary-hover text-white rounded-lg px-[25px] py-[8px] cursor-pointer transition-colors'
					>
						Okay
					</button>
				</div>
			</div>
		</div>
	);
};

export const useClanLimitModal = () => {
	const [modalProps, setModalProps] = useState<ClanLimitModalProps | null>(null);

	const [showModal, hideModal] = useModal(() => {
		if (!modalProps) return null;

		return (
			<ClanLimitModalContent
				type={modalProps.type}
				clanCount={modalProps.clanCount}
				onClose={() => {
					hideModal();
					setModalProps(null);
				}}
			/>
		);
	}, [modalProps]);

	const openModal = useCallback(
		(props: ClanLimitModalProps) => {
			setModalProps(props);
			showModal();
		},
		[showModal]
	);

	return [openModal, hideModal] as const;
};

export const useClanLimitModalErrorHandler = () => {
	const dispatch = useAppDispatch();
	const clanLimitModalTrigger = useAppSelector((state) => state.errors?.clanLimitModalTrigger);
	const clanLimitModalData = useAppSelector((state) => state.errors?.clanLimitModalData);
	const [openClanLimitModal] = useClanLimitModal();

	useEffect(() => {
		if (clanLimitModalTrigger && clanLimitModalData) {
			dispatch(resetClanLimitModalTrigger());
			openClanLimitModal(clanLimitModalData);
		}
	}, [clanLimitModalTrigger, clanLimitModalData, dispatch, openClanLimitModal]);

	return null;
};
