import type { Exercise } from '@/lib/types';
import { formatLabel } from '@/lib/utils';

const ExercisesSection = ({ exercises }: { exercises: Exercise[] }) => {
	if (exercises.length === 0) return null;

	return (
		<>
			<hr className="border-border" />
			<div className="space-y-4">
				<div className="flex flex-row items-center justify-between [&_p]:text-xs [&_p]:text-muted-foreground">
					<p className="font-medium uppercase tracking-widest">Suggested Exercises</p>
					<p className="pr-12">Category</p>
				</div>
				{exercises.map((exercise) => (
					<div key={exercise.title} className="rounded-md border border-border bg-surface p-5">
						<div className="mb-3 flex items-start justify-between gap-4">
							<p className="font-heading text-base font-medium text-foreground">{exercise.title}</p>
							<span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
								{formatLabel(exercise.exercise_type)}
							</span>
						</div>
						<p className="mb-4 text-sm leading-relaxed text-muted-foreground">
							{exercise.description}
						</p>
						<ol className="space-y-2">
							{exercise.steps.map((step, i) => (
								<li key={step} className="flex gap-3 text-sm">
									<span className="shrink-0 font-medium text-brand-500">{i + 1}.</span>
									<span className="text-foreground/80">{step}</span>
								</li>
							))}
						</ol>
					</div>
				))}
			</div>
		</>
	);
};

export default ExercisesSection;
