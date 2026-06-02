import { formatLabel } from '@/lib/utils';

const PatternList = ({ items, tone }: { items: string[]; tone: 'dusk' | 'brand' }) => (
	<ul className="space-y-4">
		{items.map((item, i) => (
			<li key={item} className="flex items-center gap-3">
				<span
					className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
						tone === 'dusk' ? 'bg-dusk-400/15 text-dusk-500' : 'bg-brand-50 text-brand-700'
					}`}
				>
					{i + 1}
				</span>
				<span className="text-sm text-foreground/80">{formatLabel(item)}</span>
			</li>
		))}
	</ul>
);

const TopDistortions = ({ distortions }: { distortions: string[] }) => (
	<div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
		<p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
			Thought patterns this week
		</p>
		<div className="flex flex-1 items-center">
			{distortions.length === 0 ? (
				<p className="text-sm text-muted-foreground">None detected.</p>
			) : (
				<PatternList items={distortions} tone="dusk" />
			)}
		</div>
	</div>
);

const TopPositivePatterns = ({ positivePatterns }: { positivePatterns: string[] }) => (
	<div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
		<p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
			Strengths this week
		</p>
		<div className="flex flex-1 items-center">
			{positivePatterns.length === 0 ? (
				<p className="text-sm text-muted-foreground">None detected.</p>
			) : (
				<PatternList items={positivePatterns} tone="brand" />
			)}
		</div>
	</div>
);

export { TopDistortions, TopPositivePatterns };
