import { Skeleton } from '@/components/ui/skeleton';

const EntryListSkeleton = () => {
	return (
		<div className="rounded-xl border border-border bg-surface p-4">
			<div className="flex flex-col gap-3">
				{['a', 'b', 'c', 'd', 'e'].map((id) => (
					<div key={id} className="rounded-lg border border-border bg-background p-4">
						<div className="mb-3 border-b border-border pb-2">
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-4 w-full" />
						<Skeleton className="mt-2 h-4 w-5/6" />
						<Skeleton className="mt-2 h-4 w-3/5" />
						<div className="mt-4 space-y-1.5">
							<Skeleton className="h-1 w-full rounded-full" />
							<div className="flex items-center gap-2.5">
								<Skeleton className="h-3 w-8" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default EntryListSkeleton;
