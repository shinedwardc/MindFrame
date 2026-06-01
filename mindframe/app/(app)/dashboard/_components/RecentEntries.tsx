import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { moodBgColor } from '@/lib/mood';
import type { DashboardEntry } from '@/lib/types';

interface Props {
	entries: DashboardEntry[];
}

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
							className={`group block rounded-lg px-3 py-3 transition-colors duration-300 ${
								entry.acute_risk_detected ? 'hover:bg-dusk-500/5' : 'hover:bg-brand-50/40'
							}`}
						>
							<div className="mb-1 flex items-center gap-2.5">
								{entry.acute_risk_detected ? (
									<>
										<span className="flex items-center gap-1.5">
											<TriangleAlert className="h-3 w-3 text-dusk-500" />
											<span className="text-xs text-dusk-500">It's okay to ask for help</span>
										</span>
										<span className="text-xs text-muted-foreground">
											·&nbsp;{formatDate(entry.created_at)}
										</span>
									</>
								) : (
									<>
										<span className="flex items-center gap-1.5">
											<span className={`h-2 w-2 rounded-full ${moodBgColor(entry.mood_score)}`} />
											<span className="text-xs text-muted-foreground">{entry.mood_score}/10</span>
										</span>
										<span className="text-xs text-muted-foreground">
											·&nbsp;{formatDate(entry.created_at)}
										</span>
									</>
								)}
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
