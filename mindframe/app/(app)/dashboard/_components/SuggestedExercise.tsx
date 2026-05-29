import Link from 'next/link';

interface Props {
	exercise: {
		title: string;
		description: string;
		technique: string;
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
			<p className="rounded-md border border-brand-100 bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
				{exercise.technique}
			</p>
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
