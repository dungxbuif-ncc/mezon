import { setCanvasMode } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { isCanvasMode } from 'libs/components/src/lib/components';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const SearchCanvas = ({ setKeywordSearch }: { setKeywordSearch: React.Dispatch<React.SetStateAction<string>> }) => {
	const { t } = useTranslation('channelMenu');
	const mode = useSelector(setCanvasMode);

	const hanldeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setKeywordSearch(event.target.value.trim());
	};
	return (
		<div className="relative">
			<div className={`transition-all duration-300 w-56 h-6 pl-4 pr-2 py-3 bg-theme-input rounded items-center inline-flex`}>
				<input
					type="text"
					placeholder={isCanvasMode(mode) ? t('menu.thread.searchCanvas') : t('menu.thread.searchWhiteboard')}
					className=" outline-none bg-transparent w-full placeholder:text-sm text-sm"
					onChange={(event) => hanldeChange(event)}
				/>
			</div>
			<div className="w-5 h-6 flex flex-row items-center pl-1 absolute right-1 bg-transparent top-1/2 transform -translate-y-1/2">
				<Icons.Search />
			</div>
		</div>
	);
};

export default SearchCanvas;
