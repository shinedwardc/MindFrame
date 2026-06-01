import type { EmotionCount } from '@/lib/types';
import EmotionCloud from './EmotionCloud';

interface Props {
	emotions: EmotionCount[];
}

const EmotionTrend = ({ emotions }: Props) => {
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
		</div>
	);
};

export default EmotionTrend;
