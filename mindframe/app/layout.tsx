import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: 'MindFrame',
	description: 'CBT-powered mood journal',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" className={cn('font-sans', inter.variable)} suppressHydrationWarning>
			<body suppressHydrationWarning>
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
};

export default RootLayout;
