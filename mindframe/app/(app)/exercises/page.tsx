import { apiFetch } from '@/lib/api';
import type { Exercise, JournalEntry } from '@/lib/types';
import ExerciseCard from './_components/ExerciseCard';
import SuggestedPanel from './_components/SuggestedPanel';

type DashboardSnippet = {
	suggested_exercise: Exercise | null;
};

const ExercisesPage = async () => {
	const [summary, entries] = await Promise.all([
		apiFetch<DashboardSnippet>('/dashboard/summary'),
		apiFetch<JournalEntry[]>('/journal?limit=100'),
	]);

	const seen = new Set<string>();
	const library: Exercise[] = [];

	for (const entry of entries) {
		if (entry.analysis_status !== 'complete' || !entry.recommended_exercises?.length) continue;
		for (const ex of entry.recommended_exercises) {
			if (!seen.has(ex.exercise_type)) {
				seen.add(ex.exercise_type);
				library.push(ex);
			}
		}
	}

	return (
		<div className="min-h-full bg-linear-to-b from-background to-brand-50/30">
			<div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
				<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards space-y-1">
					<h1 className="font-heading text-4xl font-light tracking-tight text-foreground">
						Exercises
					</h1>
					<p className="text-sm text-muted-foreground">
						Practices tailored to what you've been working through.
					</p>
				</div>

				<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-75">
					<SuggestedPanel exercise={summary.suggested_exercise} />
				</div>

				{library.length > 0 &&
					(() => {
						const colLeft: Exercise[] = [];
						const colRight: Exercise[] = [];
						let heightLeft = 0;
						let heightRight = 0;

						for (const exercise of library) {
							if (heightLeft <= heightRight) {
								colLeft.push(exercise);
								heightLeft += exercise.steps.length;
							} else {
								colRight.push(exercise);
								heightRight += exercise.steps.length;
							}
						}

						return (
							<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150 space-y-4">
								<h2 className="font-heading text-xl font-medium text-foreground">
									From your entries
								</h2>
								<div className="flex gap-4">
									<div className="flex flex-1 flex-col gap-4">
										{colLeft.map((exercise) => (
											<ExerciseCard key={exercise.exercise_type} exercise={exercise} />
										))}
									</div>
									<div className="flex flex-1 flex-col gap-4">
										{colRight.map((exercise) => (
											<ExerciseCard key={exercise.exercise_type} exercise={exercise} />
										))}
									</div>
								</div>
							</div>
						);
					})()}
			</div>
		</div>
	);
};

export default ExercisesPage;
