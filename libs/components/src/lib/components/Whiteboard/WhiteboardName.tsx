import { canvasActions, selectTitle } from '@mezon/store';
import { UpsertWhiteboardContent } from 'libs/components/src/lib/components/Whiteboard/Whiteboard';
import { useDispatch, useSelector } from 'react-redux';

export const WhiteBoardName = ({ onChange }: { onChange: (option: UpsertWhiteboardContent) => void }) => {
	const dispatch = useDispatch();
	const title = useSelector(selectTitle);
	return (
		<input
			className="w-full text-right font-bold text-xl text-theme-primary-hover text-theme-primary truncate cursor-pointer !border-0 !shadow-none bg-transparent focus:cursor-text focus:!text-color-text focus:!outline-none"
			value={title}
			onChange={(e) => {
				dispatch(canvasActions.setTitle(e.target.value));
				onChange({ newTitle: e.target.value });
			}}
			placeholder="Change name..."
		/>
	);
};
