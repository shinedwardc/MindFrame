import Link from 'next/link';
import type { Exercise } from '@/lib/types';

interface Props {
	exercise: Exercise | null;
}

const SuggestedExercise = ({ exercise }: Props) => {
	if (!exercise) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 p-5 text-center">
				<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Suggested exercise
				</p>
				<p className="font-heading text-base font-light italic text-muted-foreground">
					Nothing to suggest yet.
				</p>
				<p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
					Write a journal entry and exercises will be recommended as your analysis completes.
				</p>
				<Link
					href="/journal/new"
					className="mt-1 rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 transition-colors duration-300 hover:bg-brand-50"
				>
					Write an entry
				</Link>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-3 rounded-xl border border-brand-100 bg-linear-to-br from-brand-50/60 to-surface p-5">
			<p className="text-xs font-medium uppercase tracking-widest text-brand-700">
				Suggested exercise
			</p>
			<div>
				<p className="font-heading text-base font-medium text-foreground">{exercise.title}</p>
				<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
			</div>
			<ol className="space-y-1.5 rounded-md border border-brand-100 bg-background/60 p-3">
				{exercise.steps.map((step, i) => (
					<li key={step} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
						<span className="shrink-0 font-medium text-brand-500">{i + 1}.</span>
						{step}
					</li>
				))}
			</ol>
			<Link
				href="/exercises"
				className="mt-auto text-sm text-brand-700 transition-colors duration-300 hover:text-brand-900"
			>
				See all exercises →
			</Link>
		</div>
	);
};

export default SuggestedExercise;
