import { usePermissionChecker } from '@mezon/core';
import { selectCurrentChannelId } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EOverriddenPermission, EPermission } from '@mezon/utils';
import { ECanvasMode } from 'libs/components/src/lib/components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface IEmptyCanvasConfig {
	title: string;
	description: string;
	buttonText: string;
	iconComponent: React.ReactNode;
}

class EmptyCanvasFactory {
	static createConfig(mode: ECanvasMode, t: any): IEmptyCanvasConfig {
		switch (mode) {
			case ECanvasMode.CANVAS:
				return {
					title: t('canvas.emptyTitle'),
					description: t('canvas.emptyDescription'),
					buttonText: t('canvas.createCanvas'),
					iconComponent: (
						<>
							<Icons.ThreadEmpty className="w-9 h-9 " />
							<Icons.EmptyUnreadStyle className="w-[104px] h-[80px] absolute top-0 left-[-10px] " />
						</>
					)
				};
			case ECanvasMode.WHITEBOARD:
				return {
					title: t('whiteboard.emptyTitle'),
					description: t('whiteboard.emptyDescription'),
					buttonText: t('whiteboard.createWhiteboard'),
					iconComponent: (
						<>
							<Icons.ThreadEmpty className="w-9 h-9 " />
							<Icons.EmptyUnreadStyle className="w-[104px] h-[80px] absolute top-0 left-[-10px] " />
						</>
					)
				};
			default:
				throw new Error(`Unknown canvas mode: ${mode}`);
		}
	}
}

type EmptyCanvasProps = {
	mode: ECanvasMode;
	onClick: () => void;
};

const EmptyCanvas = ({ mode, onClick }: EmptyCanvasProps) => {
	const { t } = useTranslation('channelTopbar');
	const currentChannelId = useSelector(selectCurrentChannelId);
	const [canManageThread] = usePermissionChecker([EOverriddenPermission.manageThread, EPermission.viewChannel], currentChannelId ?? '');
	const handleCreateCanvas = () => {
		onClick();
	};

	const config = useMemo(() => EmptyCanvasFactory.createConfig(mode, t), [mode, t]);
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-12">
			<button className="relative mx-auto mb-4 p-[22px] rounded-full cursor-default">{config.iconComponent}</button>
			<h2 className="text-2xl font-semibold mb-2">{config.title}</h2>
			<p className="text-base text-center">{config.description}</p>
			{canManageThread && (
				<button
					onClick={handleCreateCanvas}
					className="mt-6 py-3 px-2  font-medium text-sm rounded-lg focus:ring-transparent btn-primary btn-primary-hover"
				>
					{config.buttonText}
				</button>
			)}
		</div>
	);
};

export default EmptyCanvas;
