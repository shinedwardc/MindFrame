interface Props {
	streakDays: number;
	entriesThisWeek: number;
}

const StatsBar = ({ streakDays, entriesThisWeek }: Props) => {
	return (
		<div className="flex items-stretch gap-6 rounded-xl border border-border bg-surface p-5">
			<div className="flex-1">
				<p className="font-heading text-3xl font-light text-foreground">{streakDays}</p>
				<p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
					{streakDays === 1 ? 'day' : 'days'} journaling
				</p>
			</div>
			<div className="w-px bg-border" />
			<div className="flex-1">
				<p className="font-heading text-3xl font-light text-foreground">{entriesThisWeek}</p>
				<p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
					{entriesThisWeek === 1 ? 'entry' : 'entries'} this week
				</p>
			</div>
		</div>
	);
};

export default StatsBar;
