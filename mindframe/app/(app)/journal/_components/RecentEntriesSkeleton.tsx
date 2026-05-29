import { Skeleton } from '@/components/ui/skeleton';

const RecentEntriesSkeleton = () => {
	return (
		<section>
			<div className="mb-6 flex items-center justify-between">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-16" />
			</div>
			<ul className="space-y-4">
				{[1, 2, 3].map((i) => (
					<li key={i} className="border-b border-border pb-4 last:border-0">
						<div className="mb-2 flex items-center justify-between">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-4 w-16 rounded-full" />
						</div>
						<div className="space-y-1.5">
							<Skeleton className="h-3.5 w-full" />
							<Skeleton className="h-3.5 w-4/5" />
							<Skeleton className="h-3.5 w-2/3" />
						</div>
					</li>
				))}
			</ul>
		</section>
	);
};

export default RecentEntriesSkeleton;
