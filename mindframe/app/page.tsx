import { redirect } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { auth } from '@/lib/auth';

const HomePage = async () => {
	const session = await auth();
	if (session) redirect('/dashboard');

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-6">
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,var(--color-brand-100),transparent)]" />

			<div className="relative w-full max-w-md text-center animate-in fade-in duration-500 fill-mode-backwards">
				<p className="mb-5 text-xs font-medium uppercase tracking-widest text-brand-500 animate-in fade-in duration-500 fill-mode-backwards">
					MindFrame
				</p>

				<h1 className="font-heading text-5xl font-light tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards delay-75">
					Make room for your mind.
				</h1>

				<p className="mx-auto mt-4 max-w-sm font-heading text-lg italic text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards delay-150">
					A CBT-powered journal for noticing patterns, softening hard thoughts, and showing up for
					yourself.
				</p>

				<div className="mt-9 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards delay-200">
					<GoogleSignInButton />
				</div>
			</div>
		</main>
	);
};

export default HomePage;
