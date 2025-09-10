import { debounce, IS_ANDROID, LoadMoreDirection, requestForcedReflow, resetScroll, useLastCallback } from '@mezon/utils';
import type { FC, RefObject } from 'react';
import { useLayoutEffect, useMemo, useRef, type UIEvent } from 'react';

declare module 'react' {
	interface HTMLAttributes<T> {
		teactFastList?: boolean;
	}
}

type OwnProps = {
	ref?: RefObject<HTMLDivElement>;
	style?: React.CSSProperties;
	className?: string;
	items?: any[];
	itemSelector?: string;
	preloadBackwards?: number;
	sensitiveArea?: number;
	withAbsolutePositioning?: boolean;
	maxHeight?: number;
	noScrollRestore?: boolean;
	noScrollRestoreOnTop?: boolean;
	noFastList?: boolean;
	cacheBuster?: any;
	beforeChildren?: React.ReactNode;
	scrollContainerClosest?: string;
	children: React.ReactNode;
	onLoadMore?: ({ direction }: { direction: LoadMoreDirection; noScroll?: boolean }) => void;
	onScroll?: (e: UIEvent<HTMLDivElement>) => void;
	onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<any>) => void;
	onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
};

const DEFAULT_LIST_SELECTOR = '.ListItem';
const DEFAULT_PRELOAD_BACKWARDS = 20;
const DEFAULT_SENSITIVE_AREA = 200;

const InfiniteScroll: FC<OwnProps> = ({
	ref,
	style,
	className,
	items,
	itemSelector = DEFAULT_LIST_SELECTOR,
	preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
	sensitiveArea = DEFAULT_SENSITIVE_AREA,
	withAbsolutePositioning,
	maxHeight,
	noScrollRestore = false,
	noScrollRestoreOnTop = false,
	noFastList,
	cacheBuster,
	beforeChildren,
	children,
	scrollContainerClosest,
	onLoadMore,
	onScroll,
	onWheel,
	onClick,
	onKeyDown,
	onDragOver,
	onDragLeave
}: OwnProps) => {
	const innerRef = useRef<HTMLDivElement>(null);
	const containerRef = ref ?? innerRef;

	const stateRef = useRef<{
		listItemElements?: NodeListOf<HTMLDivElement>;
		isScrollTopJustUpdated?: boolean;
		currentAnchor?: HTMLDivElement | undefined;
		currentAnchorTop?: number;
	}>({});

	const [loadMoreBackwards, loadMoreForwards] = useMemo(() => {
		if (!onLoadMore) {
			return [];
		}

		return [
			debounce(
				(noScroll = false) => {
					onLoadMore({ direction: LoadMoreDirection.Backwards, noScroll });
				},
				1000,
				true,
				false
			),
			debounce(
				() => {
					onLoadMore({ direction: LoadMoreDirection.Forwards });
				},
				1000,
				true,
				false
			)
		];
	}, [onLoadMore, items]);

	useLayoutEffect(() => {
		const scrollContainer = scrollContainerClosest
			? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
			: containerRef.current!;

		const container = containerRef.current!;

		requestForcedReflow(() => {
			const state = stateRef.current;

			state.listItemElements = container.querySelectorAll<HTMLDivElement>(itemSelector);

			let newScrollTop: number;

			if (state.currentAnchor && Array.from(state.listItemElements).includes(state.currentAnchor)) {
				const { scrollTop } = scrollContainer;
				const newAnchorTop = state.currentAnchor.getBoundingClientRect().top;
				newScrollTop = scrollTop + (newAnchorTop - state.currentAnchorTop!);
			} else {
				const nextAnchor = state.listItemElements[0];
				if (nextAnchor) {
					state.currentAnchor = nextAnchor;
					state.currentAnchorTop = nextAnchor.getBoundingClientRect().top;
				}
			}

			if (withAbsolutePositioning || noScrollRestore) {
				return undefined;
			}

			const { scrollTop } = scrollContainer;
			if (noScrollRestoreOnTop && scrollTop === 0) {
				return undefined;
			}

			return () => {
				resetScroll(scrollContainer, newScrollTop);

				state.isScrollTopJustUpdated = true;
			};
		});
	}, [items, itemSelector, noScrollRestore, noScrollRestoreOnTop, cacheBuster, withAbsolutePositioning, scrollContainerClosest]);

	const handleScroll = useLastCallback((e: UIEvent<HTMLDivElement>) => {
		if (loadMoreForwards && loadMoreBackwards) {
			const { isScrollTopJustUpdated, currentAnchor, currentAnchorTop } = stateRef.current;
			const listItemElements = stateRef.current.listItemElements!;

			if (isScrollTopJustUpdated) {
				stateRef.current.isScrollTopJustUpdated = false;
				return;
			}

			const listLength = listItemElements.length;
			const scrollContainer = scrollContainerClosest
				? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
				: containerRef.current!;
			const { scrollTop, scrollHeight, offsetHeight } = scrollContainer;
			const top = listLength ? listItemElements[0].offsetTop : 0;
			const isNearTop = scrollTop <= top + sensitiveArea;
			const bottom = listLength ? listItemElements[listLength - 1].offsetTop + listItemElements[listLength - 1].offsetHeight : scrollHeight;

			const isNearBottom = bottom - (scrollTop + offsetHeight) <= sensitiveArea;
			let isUpdated = false;

			if (isNearTop) {
				const nextAnchor = listItemElements[0];
				if (nextAnchor) {
					const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
					const newAnchorTop =
						currentAnchor?.offsetParent && currentAnchor !== nextAnchor ? currentAnchor.getBoundingClientRect().top : nextAnchorTop;
					const isMovingUp = currentAnchor && currentAnchorTop !== undefined && newAnchorTop > currentAnchorTop;

					if (isMovingUp) {
						stateRef.current.currentAnchor = nextAnchor;
						stateRef.current.currentAnchorTop = nextAnchorTop;
						isUpdated = true;
						loadMoreForwards();
					}
				}
			}

			if (isNearBottom) {
				const nextAnchor = listItemElements[listLength - 1];
				if (nextAnchor) {
					const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
					const newAnchorTop =
						currentAnchor?.offsetParent && currentAnchor !== nextAnchor ? currentAnchor.getBoundingClientRect().top : nextAnchorTop;
					const isMovingDown = currentAnchor && currentAnchorTop !== undefined && newAnchorTop < currentAnchorTop;

					if (isMovingDown) {
						stateRef.current.currentAnchor = nextAnchor;
						stateRef.current.currentAnchorTop = nextAnchorTop;
						isUpdated = true;
						loadMoreBackwards();
					}
				}
			}

			if (!isUpdated) {
				if (currentAnchor?.offsetParent) {
					stateRef.current.currentAnchorTop = currentAnchor.getBoundingClientRect().top;
				} else {
					const nextAnchor = listItemElements[0];

					if (nextAnchor) {
						stateRef.current.currentAnchor = nextAnchor;
						stateRef.current.currentAnchorTop = nextAnchor.getBoundingClientRect().top;
					}
				}
			}
		}

		if (onScroll) {
			onScroll(e);
		}
	});

	useLayoutEffect(() => {
		const scrollContainer = scrollContainerClosest
			? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
			: containerRef.current!;
		if (!scrollContainer) return undefined;

		const handleNativeScroll = (e: Event) => handleScroll(e as unknown as UIEvent<HTMLDivElement>);

		scrollContainer.addEventListener('scroll', handleNativeScroll);

		return () => {
			scrollContainer.removeEventListener('scroll', handleNativeScroll);
		};
	}, [handleScroll, scrollContainerClosest]);

	return (
		<div
			ref={containerRef}
			className={className}
			onWheel={onWheel}
			teactFastList={!noFastList && !withAbsolutePositioning}
			onKeyDown={onKeyDown}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onClick={onClick}
			style={style}
		>
			{beforeChildren}
			{withAbsolutePositioning && items?.length ? (
				<div
					teactFastList={!noFastList}
					style={{
						position: 'relative',
						...(IS_ANDROID && maxHeight ? { height: maxHeight } : {})
					}}
				>
					{children}
				</div>
			) : (
				children
			)}
		</div>
	);
};

export default InfiniteScroll;
