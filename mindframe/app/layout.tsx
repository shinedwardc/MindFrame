import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-heading', style: ['normal', 'italic'] });

export const metadata: Metadata = {
	title: 'MindFrame',
	description: 'CBT-powered mood journal',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" className={cn('font-sans', dmSans.variable, fraunces.variable)} suppressHydrationWarning>
			<body suppressHydrationWarning>
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
};

export default RootLayout;
