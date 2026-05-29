import { apiFetch } from '@/lib/api';

type Exercise = {
	title: string;
	description: string;
	steps: string[];
	exercise_type: string;
};

const exerciseTypeLabel: Record<string, string> = {
	thought_record: 'Thought Record',
	behavioral_activation: 'Behavioral Activation',
	breathing: 'Breathing',
	grounding: 'Grounding',
};

const ExercisesSection = async ({
	moodScore,
	distortionTypes,
}: {
	moodScore: number;
	distortionTypes: string[];
}) => {
	const exercises = await apiFetch<Exercise[]>('/exercises/recommend', {
		method: 'POST',
		body: JSON.stringify({
			mood_score: moodScore,
			distortions: distortionTypes,
		}),
	});

	if (!exercises || exercises.length === 0) return null;

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards space-y-4">
			<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
				Suggested Exercises
			</p>
			<div className="space-y-4">
				{exercises.map((exercise) => (
					<div key={exercise.title} className="rounded-md border border-border bg-surface p-5">
						<div className="mb-3 flex items-start justify-between gap-4">
							<p className="font-heading text-base font-medium text-foreground">{exercise.title}</p>
							<span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
								{exerciseTypeLabel[exercise.exercise_type] ?? exercise.exercise_type}
							</span>
						</div>
						<p className="mb-4 text-sm leading-relaxed text-muted-foreground">
							{exercise.description}
						</p>
						<ol className="space-y-2">
							{exercise.steps.map((step, i) => (
								<li key={i} className="flex gap-3 text-sm">
									<span className="shrink-0 font-medium text-brand-500">{i + 1}.</span>
									<span className="text-foreground/80">{step}</span>
								</li>
							))}
						</ol>
					</div>
				))}
			</div>
		</section>
	);
};

export default ExercisesSection;
