import { apiFetch } from '@/lib/api';

type JournalEntry = {
	id: number;
	content: string;
	mood_score: number;
	sentiment: string | null;
	distortions: string[] | null;
	created_at: string;
};

const RecentEntries = async () => {
	const entries = await apiFetch<JournalEntry[]>('/journal?limit=10');

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards delay-300">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-heading text-xl font-medium text-foreground">Recent Entries</h2>
				<span className="text-sm text-muted-foreground">
					{entries.length} {entries.length === 1 ? 'entry' : 'entries'}
				</span>
			</div>

			{entries.length === 0 ? (
				<div className="py-12 text-center">
					<p className="font-heading text-2xl font-light italic text-muted-foreground">
						Your journal is waiting.
					</p>
					<p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
						Start writing to see your entries, mood patterns, and AI-generated insights here.
					</p>
					<a
						href="/journal/new"
						className="mt-6 inline-block rounded-md border border-brand-200 px-5 py-2.5 text-sm text-brand-700 transition-colors duration-300 hover:bg-brand-50"
					>
						Write your first entry
					</a>
				</div>
			) : (
				<>
					<ul className="space-y-4">
						{entries.map((entry) => (
							<li key={entry.id} className="border-b border-border pb-4 last:border-0">
								<div className="mb-1 flex items-center justify-between">
									<time className="text-xs text-muted-foreground">
										{new Date(entry.created_at).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</time>
									{entry.sentiment && (
										<span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
											{entry.sentiment}
										</span>
									)}
								</div>
								<p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
									{entry.content}
								</p>
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
};

export default RecentEntries;
