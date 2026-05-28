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
			<main className="relative flex flex-col flex-1 min-h-screen">
				<div className="absolute top-3 left-3 z-10">
					<SidebarTrigger />
				</div>
				<div className="flex-1">{children}</div>
			</main>
		</SidebarProvider>
	);
};

export default DashboardLayout;
