import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Distortion = { type: string; evidence: string };

type JournalEntry = {
	id: number;
	content: string;
	mood_score: number;
	sentiment: string | null;
	distortions: Distortion[] | null;
	created_at: string;
};

type DateGroup = {
	dateKey: string;
	label: string;
	entries: JournalEntry[];
};

const moodBarColor = (score: number): string => {
	if (score <= 4) return 'bg-amber-400';
	if (score <= 6) return 'bg-muted-foreground/40';
	return 'bg-brand-500';
};

const groupByDate = (entries: JournalEntry[]): DateGroup[] => {
	const groups: DateGroup[] = [];

	for (const entry of entries) {
		const date = new Date(entry.created_at);
		const dateKey = date.toDateString();
		const existing = groups.find((g) => g.dateKey === dateKey);

		if (existing) {
			existing.entries.push(entry);
		} else {
			groups.push({
				dateKey,
				label: date.toLocaleDateString('en-US', {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				}),
				entries: [entry],
			});
		}
	}

	return groups;
};

const EntryList = async () => {
	const entries = await apiFetch<JournalEntry[]>('/journal?limit=100');

	if (entries.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="font-heading text-2xl font-light italic text-muted-foreground">
					No entries yet.
				</p>
				<p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
					Your journal is waiting for its first story.
				</p>
				<Link
					href="/journal/new"
					className="mt-6 inline-block rounded-md border border-brand-200 px-5 py-2.5 text-sm text-brand-700 transition-colors duration-300 hover:bg-brand-50"
				>
					Write your first entry
				</Link>
			</div>
		);
	}

	const groups = groupByDate(entries);

	return (
		<div className="rounded-xl border border-border bg-surface p-4">
			<div className="space-y-6">
				{groups.map((group, groupIndex) => (
					<div key={group.dateKey}>
						{/* Parent date header */}
						<div className="mb-3 flex items-center gap-3">
							<time className="text-xs font-medium uppercase tracking-widest text-brand-500">
								{group.label}
							</time>
							<div className="h-px flex-1 bg-border" />
						</div>

						{/* Entry boxes for this date */}
						<div className="flex flex-col gap-2">
							{group.entries.map((entry) => (
								<Link
									key={entry.id}
									href={`/journal/entries/${entry.id}`}
									className="group rounded-lg border border-border bg-background p-4 transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50/20"
								>
									<p className="line-clamp-3 text-sm leading-relaxed text-foreground/75">
										{entry.content}
									</p>
									<div className="mt-4 space-y-1.5">
										<div className="h-1 w-full overflow-hidden rounded-full bg-border">
											<div
												className={`h-full rounded-full transition-all duration-300 ${moodBarColor(entry.mood_score)}`}
												style={{ width: `${entry.mood_score * 10}%` }}
											/>
										</div>
										<div className="flex items-center gap-2.5">
											<span className="text-xs text-muted-foreground">{entry.mood_score}/10</span>
											{entry.sentiment && (
												<span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
													{entry.sentiment}
												</span>
											)}
											{entry.distortions && entry.distortions.length > 0 && (
												<span className="ml-auto text-xs text-muted-foreground">
													{entry.distortions.length}{' '}
													{entry.distortions.length === 1 ? 'pattern' : 'patterns'}
												</span>
											)}
										</div>
									</div>
								</Link>
							))}
						</div>

						{/* Divider between date groups */}
						{groupIndex < groups.length - 1 && <div className="mt-6 border-b border-border" />}
					</div>
				))}
			</div>
		</div>
	);
};

export default EntryList;
