import { Skeleton } from '@/components/ui/skeleton';

const ExercisesSkeleton = () => (
	<section className="space-y-4">
		<Skeleton className="h-3 w-36" />
		{['a', 'b', 'c'].map((id) => (
			<div key={id} className="rounded-md border border-border bg-surface p-5">
				<div className="mb-3 flex items-start justify-between gap-4">
					<Skeleton className="h-5 w-44" />
					<Skeleton className="h-4 w-24 rounded-full" />
				</div>
				<Skeleton className="mb-1 h-4 w-full" />
				<Skeleton className="mb-4 h-4 w-4/5" />
				<div className="space-y-2">
					<div className="flex gap-3">
						<Skeleton className="h-4 w-4 shrink-0" />
						<Skeleton className="h-4 w-full" />
					</div>
					<div className="flex gap-3">
						<Skeleton className="h-4 w-4 shrink-0" />
						<Skeleton className="h-4 w-5/6" />
					</div>
					<div className="flex gap-3">
						<Skeleton className="h-4 w-4 shrink-0" />
						<Skeleton className="h-4 w-3/5" />
					</div>
				</div>
			</div>
		))}
	</section>
);

export default ExercisesSkeleton;
