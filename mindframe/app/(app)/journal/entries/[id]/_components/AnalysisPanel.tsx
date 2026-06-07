'use client';

import { TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { moodLabel, moodTextColor } from '@/lib/mood';
import type { JournalEntry } from '@/lib/types';
import { formatLabel } from '@/lib/utils';
import ExercisesSection from './ExercisesSection';

const ANALYSIS_PHRASES = [
	'Reading your entry…',
	'Looking for patterns…',
	'Weighing your mood…',
	'Preparing suggestions…',
	'Almost there…',
];

const CyclingText = () => {
	const [index, setIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const cycle = setInterval(() => {
			setVisible(false);
			setTimeout(() => {
				setIndex((i) => (i + 1) % ANALYSIS_PHRASES.length);
				setVisible(true);
			}, 350);
		}, 1800);
		return () => clearInterval(cycle);
	}, []);

	return (
		<p
			className="font-heading text-base font-light italic text-muted-foreground transition-opacity duration-300"
			style={{ opacity: visible ? 1 : 0 }}
		>
			{ANALYSIS_PHRASES[index]}
		</p>
	);
};

type Entry = Omit<JournalEntry, 'id' | 'content' | 'created_at'>;

const PendingState = () => (
	<div className="space-y-8">
		<div className="flex flex-col items-center gap-4 py-10">
			<div className="flex items-center gap-1.5">
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500/50"
						style={{ animationDelay: `${i * 200}ms` }}
					/>
				))}
			</div>
			<CyclingText />
		</div>
		<div className="space-y-3">
			<Skeleton className="h-3 w-12" />
			<Skeleton className="h-9 w-10" />
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="space-y-2">
			<Skeleton className="h-3 w-36" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-3/4" />
		</div>
	</div>
);

const AnalysisContent = ({ entry }: { entry: Entry }) => (
	<>
		{/* Thought Patterns / Acute Risk */}
		{entry.acute_risk_detected ? (
			<div className="rounded-xl border-2 border-dusk-400/60 bg-dusk-400/10 p-6 shadow-sm">
				<div className="mb-4 flex items-start gap-3">
					<span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dusk-400/20">
						<TriangleAlert className="h-4 w-4 text-dusk-500" />
					</span>
					<div>
						<p className="font-heading text-lg font-medium text-foreground">
							If you're struggling right now
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Your entry suggests you may be going through a difficult time.
						</p>
					</div>
				</div>
				<p className="mb-5 text-sm leading-relaxed text-foreground/80">
					You don't have to face this alone. Please reach out to someone you trust, or connect with
					a crisis counselor — they're there to listen, any time.
				</p>
				<a
					href="https://988lifeline.org"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-lg bg-dusk-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-dusk-600"
				>
					988 Suicide &amp; Crisis Lifeline — call or text 988
				</a>
			</div>
		) : (
			<>
				{/* Mood + Sentiment */}
				<div className="flex gap-10">
					<div>
						<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
							Mood
						</p>
						<div className="flex items-baseline gap-1.5">
							<span
								className={`font-heading text-3xl font-light ${moodTextColor(entry.mood_score)}`}
							>
								{entry.mood_score}
							</span>
							<span className="text-sm text-muted-foreground">/ 10</span>
						</div>
						<p className="mt-1 text-sm text-muted-foreground">{moodLabel(entry.mood_score)}</p>
					</div>
					{entry.sentiment && (
						<div>
							<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
								Sentiment
							</p>
							<span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-sm capitalize text-brand-700">
								{entry.sentiment}
							</span>
						</div>
					)}
				</div>
				<div className="space-y-6">
					{entry.distortions && entry.distortions.length > 0 && (
						<div className="space-y-3">
							<div className="[&_p]:text-xs [&_p]:text-muted-foreground flex flex-row items-center justify-between">
								<p className="font-medium uppercase tracking-widest">Thought Patterns</p>
								<p className="pr-2">Confidence</p>
							</div>
							<ul className="space-y-3">
								{entry.distortions.map((d) => (
									<li
										key={d.type}
										className="rounded-lg border border-dusk-400/25 bg-dusk-500/[0.04] p-4"
									>
										<div className="mb-2.5 flex items-start justify-between gap-3">
											<p className="font-heading text-sm font-medium text-foreground">
												{formatLabel(d.type)}
											</p>
											{d.confidence && (
												<span className="shrink-0 rounded-full bg-dusk-500/10 px-2 py-0.5 text-xs text-dusk-600">
													{d.confidence}
												</span>
											)}
										</div>
										<blockquote className="border-l-2 border-dusk-400/50 pl-3 text-sm italic leading-relaxed text-foreground/70">
											&ldquo;{d.quote}&rdquo;
										</blockquote>
										{d.reasoning && (
											<p className="mt-2 pl-3 text-xs leading-relaxed text-muted-foreground">
												{d.reasoning}
											</p>
										)}
									</li>
								))}
							</ul>
						</div>
					)}

					{entry.positive_patterns && entry.positive_patterns.length > 0 && (
						<div className="space-y-3">
							<div className="[&_p]:text-xs [&_p]:text-muted-foreground flex flex-row items-center justify-between">
								<p className="font-medium uppercase tracking-widest">Strengths</p>
								<p className="pr-2">Confidence</p>
							</div>
							<ul className="space-y-3">
								{entry.positive_patterns.map((p) => (
									<li
										key={p.type}
										className="rounded-lg border border-brand-100 bg-brand-50/60 p-4"
									>
										<div className="mb-2.5 flex items-start justify-between gap-3">
											<p className="font-heading text-sm font-medium text-foreground">
												{formatLabel(p.type)}
											</p>
											{p.confidence && (
												<span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
													{p.confidence}
												</span>
											)}
										</div>
										<blockquote className="border-l-2 border-brand-300 pl-3 text-sm italic leading-relaxed text-foreground/70">
											&ldquo;{p.quote}&rdquo;
										</blockquote>
										{p.reasoning && (
											<p className="mt-2 pl-3 text-xs leading-relaxed text-muted-foreground">
												{p.reasoning}
											</p>
										)}
									</li>
								))}
							</ul>
						</div>
					)}

					{(!entry.distortions || entry.distortions.length === 0) &&
						(!entry.positive_patterns || entry.positive_patterns.length === 0) && (
							<p className="text-sm text-muted-foreground">
								No notable thought patterns in this entry.
							</p>
						)}
				</div>

				{entry.recommended_exercises && entry.recommended_exercises.length > 0 && (
					<ExercisesSection exercises={entry.recommended_exercises} />
				)}
			</>
		)}
	</>
);

const AnalysisPanel = ({ entry }: { entry: Entry }) => {
	const router = useRouter();

	useEffect(() => {
		if (entry.analysis_status !== 'pending') return;
		const interval = setInterval(() => router.refresh(), 2000);
		return () => clearInterval(interval);
	}, [entry.analysis_status, router]);

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150 space-y-8">
			<h2 className="font-heading text-xl font-medium text-foreground">Entry Analysis</h2>
			{entry.analysis_status === 'pending' && <PendingState />}
			{entry.analysis_status === 'failed' && (
				<p className="text-sm text-muted-foreground">
					Analysis couldn't be completed for this entry.
				</p>
			)}
			{entry.analysis_status === 'complete' && <AnalysisContent entry={entry} />}
		</section>
	);
};

export default AnalysisPanel;
