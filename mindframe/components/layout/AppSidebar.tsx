'use client';

import { Bird, BookOpenIcon, BrainIcon, Settings2Icon, TrendingUpIcon } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';

const data = {
	navMain: [
		{
			title: 'Mood Journal',
			url: '/journal',
			icon: <BookOpenIcon />,
			items: [],
		},
		{
			title: 'Exercises',
			url: '/exercises',
			icon: <BrainIcon />,
			items: [],
		},
		{
			title: 'Insights',
			url: '/insights',
			icon: <TrendingUpIcon />,
			items: [],
		},
	],
};

export function AppSidebar({
	userName,
	userEmail,
	userImage,
}: {
	userName?: string;
	userEmail?: string;
	userImage?: string;
}) {
	const user = {
		name: userName ?? 'User',
		email: userEmail ?? '',
		avatar: userImage ?? '',
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" render={<a href="/dashboard" />}>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-500 text-white">
								<Bird className="size-4" />
							</div>
							<span className="truncate font-semibold">MindFrame</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
