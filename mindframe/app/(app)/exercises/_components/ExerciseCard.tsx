import { formatLabel } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
            <p className="font-heading text-base font-medium leading-snug text-foreground">
                {exercise.title}
            </p>
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
                {formatLabel(exercise.exercise_type)}
            </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
        <ol className="space-y-2 rounded-lg border border-border bg-background/60 p-3">
            {exercise.steps.map((step, i) => (
                <li key={step} className="flex gap-2.5 text-xs">
                    <span className="mt-px shrink-0 font-medium text-brand-500">{i + 1}.</span>
                    <span className="leading-relaxed text-foreground/80">{step}</span>
                </li>
            ))}
        </ol>
    </div>
);

export default ExerciseCard;