import Link from 'next/link';
import { Suspense } from 'react';
import EntryList from './_components/EntryList';
import EntryListSkeleton from './_components/EntryListSkeleton';

const JournalEntriesPage = () => {
	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<Link
						href="/journal"
						className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
					>
						<span>←</span>
						<span>Back to journal</span>
					</Link>
					<p className="mb-4 text-xs font-medium uppercase tracking-widest text-brand-500">
						All Entries
					</p>
					<h1 className="font-heading text-5xl font-light tracking-tight text-foreground">
						Your journey.
					</h1>
					<p className="mt-3 max-w-md text-lg text-muted-foreground">
						Every entry you&apos;ve written, in one place.
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-3xl px-8 py-8">
				<Suspense fallback={<EntryListSkeleton />}>
					<EntryList />
				</Suspense>
			</div>
		</div>
	);
};

export default JournalEntriesPage;
