'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { Progress } from '@/components/ui/progress';
import { emotionChipClass, emotionFamily, emotionPalette } from '@/lib/emotions';
import { moodOptions, moodSelectedStyle } from '@/lib/mood';
import { createJournalEntry } from '../actions';

const MAX_EMOTIONS = 3;
const MIN_WORDS = 50;

const NewEntryForm = ({ prompt, showPrompt }: { prompt: string; showPrompt: boolean }) => {
	const [content, setContent] = useState('');
	const [mood, setMood] = useState<string | null>(null);
	const [emotions, setEmotions] = useState<string[]>([]);
	const [progress, setProgress] = useState(0);
	const [isPending, startTransition] = useTransition();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const toggleEmotion = (word: string) => {
		setEmotions((prev) => {
			if (prev.includes(word)) return prev.filter((w) => w !== word);
			if (prev.length >= MAX_EMOTIONS) return prev;
			return [...prev, word];
		});
	};

	const handleInput = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!content.trim() || mood === null) return;
		startTransition(async () => {
			await createJournalEntry(content, mood, emotions);
		});
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		setContent(val);
		const wc = val.trim().split(/\s+/).filter(Boolean).length;
		setProgress(Math.min(Math.round((wc / MIN_WORDS) * 100), 100));
	};

	const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
	const hasMinWords = wordCount >= MIN_WORDS;
	const canSubmit = hasMinWords && mood !== null && !isPending;

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
			{/* Today's prompt — only shown when navigated from "Respond to this prompt" */}
			{showPrompt && (
				<>
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-75">
						<span className="text-xs font-medium uppercase tracking-widest text-brand-500">
							Today's Suggested Prompt
						</span>
						<blockquote className="mt-3 border-l-2 border-brand-200 pl-5 font-heading text-xl font-light italic leading-relaxed text-foreground/70">
							"{prompt}"
						</blockquote>
					</div>
					<hr className="border-border" />
				</>
			)}

			{/* Writing area */}
			<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-100">
				<textarea
					ref={textareaRef}
					value={content}
					onChange={handleContentChange}
					onInput={handleInput}
					placeholder="Start writing…"
					rows={8}
					className="w-full resize-none rounded-md border border-border bg-surface/60 p-4 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-brand-300 transition-colors duration-200"
				/>

				{/* Word count progress */}
				<div className="mt-2 space-y-1.5">
					<Progress
						value={progress}
						className={`w-full ${hasMinWords ? '**:data-[slot=progress-indicator]:bg-brand-500' : '**:data-[slot=progress-indicator]:bg-brand-300'}`}
					/>
					<div className="flex items-center justify-between">
						{!hasMinWords && wordCount > 0 && (
							<p className="text-xs text-muted-foreground">
								Write at least {MIN_WORDS} words to have a better chance of uncovering insights and
								patterns in your thoughts and feelings.
							</p>
						)}
						<span
							className={`ml-auto shrink-0 text-xs tabular-nums transition-colors duration-300 ${hasMinWords ? 'text-brand-600' : 'text-muted-foreground'}`}
						>
							{hasMinWords ? `✓ ${wordCount} words` : `${wordCount} / ${MIN_WORDS} words`}
						</span>
					</div>
				</div>
			</div>

			<hr className="border-border" />

			{/* Mood selector */}
			<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150">
				<p className="mb-4 text-sm font-medium text-foreground">How are you feeling right now?*</p>
				<div className="flex flex-row justify-around">
					{moodOptions.map((label) => (
						<button
							key={label}
							type="button"
							onClick={() => setMood(label)}
							className={`rounded-full border px-5 py-2 text-sm transition-colors duration-300 ${
								mood === label
									? moodSelectedStyle[label]
									: 'border-border text-muted-foreground hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Emotion words — optional, pairs feeling words with the mood number */}
			<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-200">
				<p className="mb-1 text-sm font-medium text-foreground">
					Any words for it? <span className="font-normal text-muted-foreground">(optional)</span>
				</p>
				<p className="mb-4 text-xs text-muted-foreground">Pick up to three.</p>
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
					{emotionPalette.map((word) => {
						const selected = emotions.includes(word);
						const disabled = !selected && emotions.length >= MAX_EMOTIONS;
						return (
							<button
								key={word}
								type="button"
								onClick={() => toggleEmotion(word)}
								disabled={disabled}
								className={`rounded-full px-4 py-1.5 text-center text-sm transition-colors duration-300 ${
									selected
										? emotionChipClass[emotionFamily(word)]
										: 'border border-border text-muted-foreground hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
								}`}
							>
								{word}
							</button>
						);
					})}
				</div>
			</div>

			{/* Actions */}
			<div className="animate-in fade-in duration-300 fill-mode-backwards delay-300 flex items-center justify-between mb-4">
				<Link
					href="/journal"
					className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
				>
					Discard
				</Link>
				<button
					type="submit"
					disabled={!canSubmit}
					className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{isPending ? 'Saving…' : 'Save entry'}
				</button>
			</div>
		</form>
	);
};

export default NewEntryForm;
