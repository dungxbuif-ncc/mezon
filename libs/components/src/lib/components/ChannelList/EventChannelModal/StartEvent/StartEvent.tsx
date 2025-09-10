import { useEventManagementQuantity } from '@mezon/core';
import { selectCurrentClanId, selectEventsByClanId, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ListEventManagement from './ListEventManagement';

type StartEventModalProps = {
	onClose: () => void;
	onOpenCreate: () => void;
	onEventUpdateId: (eventId: string) => void;
};

export const StartEventModal = (props: StartEventModalProps) => {
	const { onClose, onOpenCreate, onEventUpdateId } = props;
	const { numberEventManagement } = useEventManagementQuantity();
	const currentClanId = useSelector(selectCurrentClanId);
	const allEventManagement = useAppSelector((state) => selectEventsByClanId(state, currentClanId as string));
	const { t } = useTranslation(['eventCreator']);

	return (
		<>
			<div className=" flex justify-between items-center p-4 border-b-theme-primary">
				<div className="flex items-center gap-x-4">
					<div className="gap-x-2 flex items-center">
						<Icons.IconEvents />
						<h4 className="font-bold">
							{numberEventManagement === 0 && t("actions.noEvent")}
							{numberEventManagement === 1 && t('actions.event_one')}
							{numberEventManagement > 1 && t('actions.event_other', { count: numberEventManagement })}
						</h4>
					</div>
					<div className="w-[0.1px] h-4 bg-gray-400"></div>
					<div className="btn-primary btn-primary-hover  px-2 py-1 rounded-lg text-white font-medium cursor-pointer" onClick={onOpenCreate}>
						{t('actions.create')}
					</div>
				</div>
				<span className="text-5xl leading-3 text-theme-primary-hover cursor-pointer" onClick={onClose}>
					×
				</span>
			</div>

			{allEventManagement.length !== 0 ? (
				<div className=" h-fit min-h-80 max-h-[80vh]  overflow-y-scroll hide-scrollbar p-4 gap-y-4 flex flex-col">
					<ListEventManagement
						allEventManagement={allEventManagement}
						openModelUpdate={onOpenCreate}
						onUpdateEventId={onEventUpdateId}
						onClose={onClose}
					/>
				</div>
			) : (
				<div className=" h-80 flex justify-center items-center">
					<Icons.IconEvents defaultSize="size-[100px] " />
				</div>
			)}
		</>
	);
};
