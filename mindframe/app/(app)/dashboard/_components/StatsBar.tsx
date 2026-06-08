interface Props {
	lastEntryDate: string | null;
	totalEntries: number;
}

const formatLastWrote = (lastEntryDate: string | null): string => {
	if (!lastEntryDate) return 'Never';
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const last = new Date(lastEntryDate);
	last.setHours(0, 0, 0, 0);
	const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 30) return `${diffDays} days ago`;
	const diffMonths = Math.round(diffDays / 30);
	if (diffMonths < 12) return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
	const diffYears = Math.round(diffDays / 365);
	return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

const StatsBar = ({ lastEntryDate, totalEntries }: Props) => {
	return (
		<div className="flex items-stretch gap-6 rounded-xl border border-border bg-surface p-5">
			<div className="flex-1">
				<p className="font-heading text-xl font-light text-foreground">
					{formatLastWrote(lastEntryDate)}
				</p>
				<p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Last wrote</p>
			</div>
			<div className="w-px bg-border" />
			<div className="flex-1">
				<p className="font-heading text-xl font-light text-foreground">{totalEntries}</p>
				<p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
					{totalEntries === 1 ? 'entry' : 'entries'} total
				</p>
			</div>
		</div>
	);
};

export default StatsBar;
