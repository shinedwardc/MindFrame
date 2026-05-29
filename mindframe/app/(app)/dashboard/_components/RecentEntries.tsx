import Link from 'next/link';

interface Entry {
	id: number;
	mood_score: number;
	content_preview: string;
	created_at: string;
}

interface Props {
	entries: Entry[];
}

const moodDotColor = (score: number): string => {
	// low = dusk (cloud's "heavy" family), mid = muted, high = sage — no amber
	if (score <= 4) return 'bg-dusk-500';
	if (score <= 6) return 'bg-muted-foreground/40';
	return 'bg-brand-500';
};

const formatDate = (dateStr: string) => {
	const d = new Date(dateStr);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (d.toDateString() === today.toDateString()) return 'Today';
	if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const RecentEntries = ({ entries }: Props) => {
	if (entries.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-8 text-center">
				<p className="font-heading text-lg font-light italic text-muted-foreground">
					No journal entries yet.
				</p>
				<Link
					href="/journal/new"
					className="mt-3 inline-block text-sm text-brand-700 transition-colors duration-300 hover:text-brand-900"
				>
					Write your first entry →
				</Link>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface p-2">
			<ul>
				{entries.map((entry) => (
					<li key={entry.id}>
						<Link
							href={`/journal/entries/${entry.id}`}
							className="block rounded-lg px-3 py-3 transition-colors duration-300 hover:bg-brand-50/40"
						>
							<div className="mb-1 flex items-center gap-2.5">
								<span className="flex items-center gap-1.5">
									<span className={`h-2 w-2 rounded-full ${moodDotColor(entry.mood_score)}`} />
									<span className="text-xs text-muted-foreground">{entry.mood_score}/10</span>
								</span>
								<span className="text-xs text-muted-foreground">
									·&nbsp;{formatDate(entry.created_at)}
								</span>
							</div>
							<p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
								{entry.content_preview}
							</p>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default RecentEntries;
