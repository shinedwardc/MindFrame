import Link from 'next/link';
import { moodLabel, moodTextColor } from '@/lib/mood';

interface Props {
	entry: {
		id: number;
		mood_score: number;
		content_preview: string;
		created_at: string;
	} | null;
}

const TodayCheckin = ({ entry }: Props) => {
	if (!entry) {
		return (
			<div className="flex items-center justify-between gap-4 rounded-xl border border-brand-100 bg-linear-to-br from-brand-50/60 to-surface p-6">
				<div>
					<p className="font-heading text-xl font-medium text-foreground">No entry yet today</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Take a moment to check in with yourself.
					</p>
				</div>
				<Link
					href="/journal/new"
					className="shrink-0 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-brand-700"
				>
					+ New Entry
				</Link>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Today&apos;s check-in
					</p>
					<div className="flex items-baseline gap-1.5">
						<span className={`font-heading text-3xl font-light ${moodTextColor(entry.mood_score)}`}>
							{entry.mood_score}
						</span>
						<span className="text-sm text-muted-foreground">/ 10</span>
						<span className="ml-1.5 text-sm text-muted-foreground">
							· {moodLabel(entry.mood_score)}
						</span>
					</div>
					<p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">
						{entry.content_preview}
					</p>
				</div>
				<Link
					href={`/journal/entries/${entry.id}`}
					className="shrink-0 text-sm text-brand-700 transition-colors duration-300 hover:text-brand-900"
				>
					View →
				</Link>
			</div>
		</div>
	);
};

export default TodayCheckin;
