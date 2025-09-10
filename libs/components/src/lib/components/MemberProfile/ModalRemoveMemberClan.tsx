import { selectCurrentClan } from '@mezon/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalLayout } from '../../components';

type ModalRemoveMemberClanProps = {
	username?: string;
	onClose: () => void;
	onRemoveMember: (value: string) => void;
};

const ModalRemoveMemberClan = ({ username, onClose, onRemoveMember }: ModalRemoveMemberClanProps) => {
	const [value, setValue] = useState<string>('');
	const currentClan = useSelector(selectCurrentClan);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	const handleSave = () => {
		onRemoveMember(value);
		setValue('');
	};

	return (
		<ModalLayout onClose={onClose}>
			<div className="bg-theme-setting-primary pt-4 rounded w-[440px]">
				<div className="px-4">
					<h1 className="text-theme-primary-active text-xl font-semibold">{`Kick ${username} from ${currentClan?.clan_name || 'clan'}`}</h1>
				</div>
				<div className="px-4">
					<div className="block">
						<p className="text-theme-primary text-base font-normal">{`Are you sure you want to kick @${username} from ${currentClan?.clan_name || 'the clan'}? They will be able to rejoin again with a new invite.`}</p>
					</div>
				</div>
				<div className="px-4">
					<div className="mb-2 block">
						<p className="text-theme-primary text-xs uppercase font-semibold">Reason for Kick</p>
					</div>
					<textarea
						rows={2}
						value={value ?? ''}
						onChange={handleChange}
						className="text-theme-primary-active outline-none w-full h-16 p-[10px] bg-input-theme text-base rounded placeholder:text-sm"
					/>
				</div>
				<div className="flex justify-end gap-3 p-4 rounded-b bg-theme-setting-nav">
					<button
						className="w-20 py-2.5 h-10 text-sm font-medium text-theme-primary-active dark:text-zinc-50 bg-bgTextarea dark:bg-gray-700 border border-color-theme hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm"
						type="button"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="w-20 py-2.5 h-10 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:bg-red-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
					>
						Kick
					</button>
				</div>
			</div>
		</ModalLayout>
	);
};

export default ModalRemoveMemberClan;
