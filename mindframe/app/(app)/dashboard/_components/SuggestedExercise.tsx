import Link from 'next/link';

interface Props {
	exercise: {
		title: string;
		description: string;
		steps: string[];
		exercise_type: string;
	};
}

const SuggestedExercise = ({ exercise }: Props) => {
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
