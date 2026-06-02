import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { moodBgColor } from '@/lib/mood';
import type { JournalEntry } from '@/lib/types';

const RecentEntries = async () => {
	const entries = await apiFetch<JournalEntry[]>('/journal?limit=10');

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-300">
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
					<Link
						href="/journal/new"
						className="mt-6 inline-block rounded-md border border-brand-200 px-5 py-2.5 text-sm text-brand-700 transition-colors duration-300 hover:bg-brand-50"
					>
						Write your first entry
					</Link>
				</div>
			) : (
				<ul className="space-y-1">
					{entries.map((entry) => (
						<li key={entry.id}>
							<Link
								href={`/journal/entries/${entry.id}`}
								className={`block border-b border-border py-4 px-2 last:border-0 transition-colors duration-300`}
							>
								<div className="mb-1 flex items-center justify-between">
									<time className="text-xs text-muted-foreground">
										{new Date(entry.created_at).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</time>
									{!entry.acute_risk_detected && entry.sentiment && (
										<span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
											{entry.sentiment}
										</span>
									)}
								</div>
								<p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
									{entry.content}
								</p>
								<div className="mt-2 flex items-center gap-2.5">
									{entry.acute_risk_detected ? (
										<span className="flex items-center gap-1.5">
											<TriangleAlert className="h-3 w-3 text-dusk-500" />
											<span className="text-xs text-dusk-500">It's okay to ask for help</span>
										</span>
									) : (
										<>
											<span className="flex items-center gap-1.5">
												<span
													className={`h-2 w-2 rounded-full ${moodBgColor(entry.mood_score)}`}
												/>
												<span className="text-xs text-muted-foreground">{entry.mood_score}/10</span>
											</span>
											{(entry.distortions?.length ?? 0) + (entry.positive_patterns?.length ?? 0) >
												0 && (
												<span className="ml-auto text-xs text-muted-foreground">
													{entry.distortions?.length ?? 0}{' '}
													{(entry.distortions?.length ?? 0) === 1 ? 'thought pattern' : 'thought patterns'}
													{' · '}
													{entry.positive_patterns?.length ?? 0} strengths
												</span>
											)}
										</>
									)}
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default RecentEntries;
