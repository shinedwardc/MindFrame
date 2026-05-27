import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
	const session = await auth();

	return (
		<SidebarProvider>
			<AppSidebar
				userName={session?.user?.name ?? undefined}
				userEmail={session?.user?.email ?? undefined}
				userImage={session?.user?.image ?? undefined}
			/>
			<main className="flex flex-col flex-1 min-h-screen">
				{/* Toggle button — collapses/expands the sidebar */}
				<header className="flex items-center h-14 px-4 border-b border-gray-100">
					<SidebarTrigger />
				</header>
				<div className="flex-1 p-8">{children}</div>
			</main>
		</SidebarProvider>
	);
};

export default DashboardLayout;
