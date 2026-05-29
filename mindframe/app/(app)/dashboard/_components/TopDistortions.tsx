interface Props {
	distortions: string[];
}

const formatDistortionType = (type: string): string =>
	type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const TopDistortions = ({ distortions }: Props) => {
	return (
		<div className="h-full rounded-xl border border-border bg-surface p-5">
			<p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
				Patterns this week
			</p>
			{distortions.length === 0 ? (
				<p className="text-sm text-muted-foreground">No patterns detected yet.</p>
			) : (
				<ul className="space-y-3">
					{distortions.map((d, i) => (
						<li key={d} className="flex items-center gap-3">
							<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-medium text-brand-700">
								{i + 1}
							</span>
							<span className="text-sm text-foreground/80">{formatDistortionType(d)}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default TopDistortions;
