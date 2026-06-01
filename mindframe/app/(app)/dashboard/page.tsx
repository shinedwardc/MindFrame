import { apiFetch } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { DashboardEntry } from '@/lib/types';
import EmotionTrend from './_components/EmotionTrend';
import RecentEntries from './_components/RecentEntries';
import StatsBar from './_components/StatsBar';
import SuggestedExercise from './_components/SuggestedExercise';
import TodayCheckin from './_components/TodayCheckin';
import { TopDistortions, TopPositivePatterns } from './_components/TopPatterns';

interface DashboardSummary {
	today_entry: {
		id: number;
		mood_score: number;
		content_preview: string;
		created_at: string;
	} | null;
	recent_entries: DashboardEntry[];
	streak_days: number;
	entries_this_week: number;
	mood_trend: { date: string; avg_mood: number }[];
	emotions_summary: { word: string; count: number }[];
	top_distortions: string[];
	top_positive_patterns: string[];
	suggested_exercise: {
		title: string;
		description: string;
		steps: string[];
		exercise_type: string;
	};
}

const greeting = (name: string) => {
	const hour = new Date().getHours();
	const prefix = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	return `${prefix}, ${name.split(' ')[0]}`;
};

const DashboardPage = async () => {
	const session = await auth();
	const summary = await apiFetch<DashboardSummary>('/dashboard/summary');

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<p className="mb-4 mt-7 text-xs font-medium uppercase tracking-widest text-brand-500">
						Dashboard
					</p>
					<h1 className="font-heading text-5xl font-light tracking-tight text-foreground">
						{greeting(session?.user?.name ?? 'there')}
					</h1>
					<p className="mt-3 max-w-md text-lg text-muted-foreground">
						Here&apos;s how your week is unfolding.
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
				<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-75">
					<TodayCheckin entry={summary.today_entry} />
				</div>

				<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150">
					<StatsBar streakDays={summary.streak_days} entriesThisWeek={summary.entries_this_week} />
				</div>

				<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-200">
					<EmotionTrend emotions={summary.emotions_summary} />
				</div>

				<div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-300 sm:grid-cols-5">
					<div className="flex h-full flex-col gap-4 sm:col-span-2">
						<div className="flex-1 min-h-0 items-center">
							<TopDistortions distortions={summary.top_distortions} />
						</div>
						<div className="flex-1 min-h-0">
							<TopPositivePatterns positivePatterns={summary.top_positive_patterns} />
						</div>
					</div>
					<div className="sm:col-span-3">
						<SuggestedExercise exercise={summary.suggested_exercise} />
					</div>
				</div>

				<hr className="border-border" />

				<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-300">
					<h2 className="mb-4 font-heading text-xl font-medium text-foreground">Recent entries</h2>
					<RecentEntries entries={summary.recent_entries} />
				</section>
			</div>
		</div>
	);
};

export default DashboardPage;
