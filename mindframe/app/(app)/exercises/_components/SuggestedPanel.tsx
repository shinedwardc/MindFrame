import Link from 'next/link';
import type { Exercise } from '@/lib/types';
import { formatLabel } from '@/lib/utils';

const SuggestedPanel = ({ exercise }: { exercise: Exercise | null }) => {
	if (!exercise) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 px-8 py-12 text-center">
				<p className="font-heading text-xl font-light italic text-muted-foreground">
					Nothing to suggest yet.
				</p>
				<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
					Write a journal entry and a personalized exercise will be recommended here once your
					analysis completes.
				</p>
				<Link
					href="/journal/new"
					className="mt-1 rounded-md border border-brand-200 px-5 py-2.5 text-sm text-brand-700 transition-colors duration-300 hover:bg-brand-50"
				>
					Write an entry
				</Link>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-brand-100 bg-linear-to-br from-brand-50/60 to-surface p-6">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div>
					<p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-brand-500">
						Suggested for you
					</p>
					<p className="font-heading text-2xl font-light tracking-tight text-foreground">
						{exercise.title}
					</p>
				</div>
				<span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs text-brand-700">
					{formatLabel(exercise.exercise_type)}
				</span>
			</div>
			<p className="mb-5 text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
			<ol className="space-y-2.5 rounded-lg border border-brand-100 bg-background/60 p-4">
				{exercise.steps.map((step, i) => (
					<li key={step} className="flex gap-3 text-sm">
						<span className="mt-px shrink-0 font-medium text-brand-500">{i + 1}.</span>
						<span className="leading-relaxed text-foreground/80">{step}</span>
					</li>
				))}
			</ol>
		</div>
	);
};

export default SuggestedPanel;
