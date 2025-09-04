import { useMemberContext } from '@mezon/core';
import { Icons, Menu, Pagination } from '@mezon/ui';
import { ReactElement, useMemo, useState } from 'react';
import MemberTopBar from './MemberTopBar';
import TableMember from './TableMember';

const MemberClan = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const { filteredMembers } = useMemberContext();
	const totalPages = useMemo(() => {
		return Math.ceil(filteredMembers.length / pageSize);
	}, [filteredMembers.length, pageSize]);

	const onPageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleChangePageSize = (pageSize: number) => {
		setPageSize(pageSize);
		setCurrentPage(1);
	};
	const menu = useMemo(() => {
		const menuItems: ReactElement[] = [
			<Menu.Item className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'} onClick={() => handleChangePageSize(10)}>
				10
			</Menu.Item>,
			<Menu.Item className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'} onClick={() => handleChangePageSize(50)}>
				50
			</Menu.Item>,
			<Menu.Item className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'} onClick={() => handleChangePageSize(100)}>
				100
			</Menu.Item>
		];
		return <>{menuItems}</>;
	}, []);
	return (
		<div className="flex flex-col flex-1 shrink min-w-0 w-full bg-theme-chat text-theme-primary h-[100%] z-0 p-4 thread-scroll">
			<div className="flex flex-col rounded-lg">
				<MemberTopBar />

				<TableMember dataMember={filteredMembers} currentPage={currentPage} pageSize={pageSize} />

				<div className="flex flex-row justify-center lg:justify-between items-center px-4 h-[54px] my-2">
					<div className={'hidden lg:flex flex-row items-center'}>
						Show
						<Menu menu={menu}>
							<div className={'flex flex-row items-center justify-center text-center rounded mx-1 px-3 w-12'}>
								<span className="mr-1">{pageSize}</span>
								<Icons.ArrowDown />
							</div>
						</Menu>
						members of {filteredMembers.length}
					</div>
					<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
				</div>
			</div>
		</div>
	);
};

export default MemberClan;
