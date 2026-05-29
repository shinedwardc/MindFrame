import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { apiFetch } from '@/lib/api';
import ExercisesSection from './_components/ExercisesSection';
import ExercisesSkeleton from './_components/ExercisesSkeleton';

type Distortion = { type: string; evidence: string };

type JournalEntry = {
	id: number;
	content: string;
	mood_score: number;
	sentiment: string | null;
	distortions: Distortion[] | null;
	created_at: string;
};

const formatDistortionType = (type: string): string =>
	type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const moodLabel = (score: number): string => {
	if (score <= 3) return 'Struggling';
	if (score <= 5) return 'Low';
	if (score <= 6) return 'Okay';
	if (score <= 8) return 'Good';
	return 'Great';
};

const moodTextColor = (score: number): string => {
	if (score <= 4) return 'text-dusk-500';
	if (score <= 6) return 'text-muted-foreground';
	return 'text-brand-500';
};

type Params = Promise<{ id: string }>;

const EntryDetailPage = async ({ params }: { params: Params }) => {
	const { id } = await params;

	const entry = await apiFetch<JournalEntry>(`/journal/${id}`).catch(() => null);
	if (!entry) notFound();

	const date = new Date(entry.created_at);

	return (
		<div className="min-h-screen">
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<Link
						href="/journal/entries"
						className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
					>
						<span>←</span>
						<span>All entries</span>
					</Link>
					<p className="mb-4 text-xs font-medium uppercase tracking-widest text-brand-500">
						Journal Entry
					</p>
					<h1 className="font-heading text-4xl font-light tracking-tight text-foreground">
						{date.toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})}
					</h1>
				</div>
			</div>

			<div className="mx-auto max-w-3xl space-y-10 px-8 py-10">
				{/* Entry text */}
				<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-75">
					<p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
						{entry.content}
					</p>
				</section>

				<hr className="border-border" />

				{/* Analysis */}
				<section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150 space-y-8">
					<h2 className="font-heading text-xl font-medium text-foreground">Entry Analysis</h2>

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

					{/* Distortions */}
					{entry.distortions && entry.distortions.length > 0 ? (
						<div>
							<p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
								Thought Patterns Identified
							</p>
							<ul className="space-y-3">
								{entry.distortions.map((d) => (
									<li key={d.type} className="rounded-md border border-border bg-surface p-4">
										<p className="text-sm font-medium text-foreground">
											{formatDistortionType(d.type)}
										</p>
										<blockquote className="mt-2 border-l-2 border-brand-200 pl-3 text-sm italic text-muted-foreground">
											&ldquo;{d.evidence}&rdquo;
										</blockquote>
									</li>
								))}
							</ul>
						</div>
					) : (
						<div>
							<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
								Thought Patterns
							</p>
							<p className="text-sm text-muted-foreground">
								No cognitive distortions detected in this entry.
							</p>
						</div>
					)}
				</section>

				<hr className="border-border" />

				{/* Exercises */}
				<Suspense fallback={<ExercisesSkeleton />}>
					<ExercisesSection
						moodScore={entry.mood_score}
						distortionTypes={entry.distortions?.map((d) => d.type) ?? []}
					/>
				</Suspense>
			</div>
		</div>
	);
};

export default EntryDetailPage;
