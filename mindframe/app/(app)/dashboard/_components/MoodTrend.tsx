interface MoodPoint {
	date: string;
	avg_mood: number;
}

interface Props {
	trend: MoodPoint[];
}

const barColor = (mood: number): string => {
	if (mood <= 4) return 'bg-amber-400';
	if (mood <= 6) return 'bg-muted-foreground/40';
	return 'bg-brand-500';
};

const formatDay = (dateStr: string) =>
	new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const MoodTrend = ({ trend }: Props) => {
	const isEmpty = trend.length === 0;

	return (
		<div className="rounded-xl border border-border bg-surface p-5">
			<p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
				7-day mood
			</p>
			{isEmpty ? (
				<div className="flex h-24 items-center justify-center font-heading text-base font-light italic text-muted-foreground">
					No entries yet this week
				</div>
			) : (
				<div className="flex h-24 items-end gap-2">
					{trend.map((point) => {
						const heightPct = (point.avg_mood / 10) * 100;
						return (
							<div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
								<div className="flex w-full items-end" style={{ height: '72px' }}>
									<div
										className={`w-full rounded-t-md ${barColor(point.avg_mood)} transition-all duration-300`}
										style={{ height: `${heightPct}%` }}
										title={`${formatDay(point.date)}: ${point.avg_mood}`}
									/>
								</div>
								<span className="w-full truncate text-center text-[11px] text-muted-foreground">
									{formatDay(point.date)}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default MoodTrend;
