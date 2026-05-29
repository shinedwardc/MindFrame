import EmotionCloud from './EmotionCloud';

interface EmotionCount {
	word: string;
	count: number;
}

interface MoodPoint {
	date: string;
	avg_mood: number;
}

interface Props {
	emotions: EmotionCount[];
	trend: MoodPoint[];
}

const bandTone = (mood: number): string => {
	// low = dusk (cloud's "heavy" family), mid = muted, high = sage — no amber
	if (mood <= 4) return 'bg-dusk-500/50';
	if (mood <= 6) return 'bg-muted-foreground/25';
	return 'bg-brand-500/60';
};

const formatDay = (dateStr: string) =>
	new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const EmotionTrend = ({ emotions, trend }: Props) => {
	return (
		<div className="rounded-xl border border-border bg-surface p-5">
			<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
				This week, in words
			</p>

			{emotions.length === 0 ? (
				<p className="font-heading text-base font-light italic text-muted-foreground">
					No feelings tagged yet this week.
				</p>
			) : (
				<EmotionCloud emotions={emotions} />
			)}

			{/* Mood demoted to a quiet 7-day band — no axis, no decimals, just texture */}
			{trend.length > 0 && (
				<div className="border-t border-border pt-4">
					<div className="flex h-8 items-end gap-1">
						{trend.map((point) => (
							<div
								key={point.date}
								className={`flex-1 rounded-sm ${bandTone(point.avg_mood)}`}
								// floor at 30% so a low day reads as "present", never "empty/failing"
								style={{ height: `${30 + (point.avg_mood / 10) * 70}%` }}
								title={formatDay(point.date)}
							/>
						))}
					</div>
					<p className="mt-2 text-[11px] text-muted-foreground">Mood across the week</p>
				</div>
			)}
		</div>
	);
};

export default EmotionTrend;
