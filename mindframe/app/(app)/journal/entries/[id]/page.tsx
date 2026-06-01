import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { JournalEntry } from '@/lib/types';
import AnalysisPanel from './_components/AnalysisPanel';
import DeleteEntryButton from './_components/DeleteEntryButton';

type Params = Promise<{ id: string }>;

const EntryDetailPage = async ({ params }: { params: Params }) => {
	const { id } = await params;

	const entry = await apiFetch<JournalEntry>(`/journal/${id}`).catch(() => null);
	if (!entry) notFound();

	const date = new Date(entry.created_at);

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<Link
						href="/journal/entries"
						className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
					>
						<span>←</span>
						<span>All entries</span>
					</Link>
					<p className="mb-4 text-xs font-medium uppercase tracking-widest text-brand-500">
						Journal Entry
					</p>
					<h1 className="font-heading text-4xl font-light tracking-tight text-foreground">
						{date.toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-3xl space-y-10 px-8 py-10">
				{/* Entry text */}
				<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-75">
					<div className="max-w-prose">
						{entry.content
							.split(/\n+/)
							.filter(Boolean)
							.map((paragraph) => (
								<p
									key={paragraph}
									className="font-heading text-lg font-light leading-[1.85] tracking-tight text-foreground/85"
								>
									{paragraph}
								</p>
							))}
					</div>
				</section>

				<hr className="border-border" />

				<AnalysisPanel entry={entry} />

				<div className="flex justify-center pb-4 pt-10">
					<DeleteEntryButton entryId={entry.id} />
				</div>
			</div>
		</div>
	);
};

export default EntryDetailPage;
