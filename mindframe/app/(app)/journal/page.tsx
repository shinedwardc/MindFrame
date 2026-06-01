import { Suspense } from 'react';
import getDailyPrompt from '@/lib/prompts';
import JournalPrompt from './_components/JournalPrompt';
import RecentEntries from './_components/RecentEntries';
import RecentEntriesSkeleton from './_components/RecentEntriesSkeleton';

const JournalPage = () => {
	const todayPrompt = getDailyPrompt();

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<p className="mb-4 mt-7 text-xs font-medium uppercase tracking-widest text-brand-500">
						Mood Journal
					</p>
					<h1 className="font-heading text-5xl font-light tracking-tight text-foreground">
						A space to reflect.
					</h1>
					<p className="mt-3 max-w-md text-lg text-muted-foreground">
						Write freely. Notice patterns. Understand yourself.
					</p>
					<div className="mt-6">
						<a
							href="/journal/new"
							className="inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-brand-700"
						>
							+ New Entry
						</a>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-3xl space-y-6 px-6 py-4">
				<JournalPrompt prompt={todayPrompt} />
				<hr className="border-border" />
				<Suspense fallback={<RecentEntriesSkeleton />}>
					<RecentEntries />
				</Suspense>
			</div>
		</div>
	);
};

export default JournalPage;
