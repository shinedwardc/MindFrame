'use client';

import { useRef, useState, useTransition } from 'react';
import { createJournalEntry } from '../actions';

const moodOptions = [
	{ label: 'Struggling', score: 2 },
	{ label: 'Low', score: 4 },
	{ label: 'Okay', score: 6 },
	{ label: 'Good', score: 8 },
	{ label: 'Great', score: 10 },
];

const NewEntryForm = ({ prompt, showPrompt }: { prompt: string; showPrompt: boolean }) => {
	const [content, setContent] = useState('');
	const [mood, setMood] = useState<number | null>(null);
	const [isPending, startTransition] = useTransition();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleInput = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || mood === null) return;
		startTransition(async () => {
			await createJournalEntry(content, mood);
		});
	};

	const canSubmit = content.trim().length > 0 && mood !== null && !isPending;

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4 p-4">
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
					onChange={(e) => setContent(e.target.value)}
					onInput={handleInput}
					placeholder="Start writing…"
					rows={8}
					className="w-full resize-none rounded-md border border-border bg-surface/60 p-4 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
				/>
				<div className="mt-2 text-right">
					<span className="text-xs text-muted-foreground">
						{content.trim().split(/\s+/).filter(Boolean).length} words
					</span>
				</div>
			</div>

			<hr className="border-border" />

			{/* Mood selector */}
			<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards delay-150">
				<p className="mb-4 text-sm font-medium text-foreground">How are you feeling right now?</p>
				<div className="flex flex-wrap gap-2">
					{moodOptions.map((option) => (
						<button
							key={option.score}
							type="button"
							onClick={() => setMood(option.score)}
							className={`rounded-full px-5 py-2 text-sm transition-colors duration-200 ${
								mood === option.score
									? 'bg-brand-500 text-white'
									: 'border border-border text-muted-foreground hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			{/* Actions */}
			<div className="animate-in fade-in duration-300 fill-mode-backwards delay-200 flex items-center justify-between">
				<a
					href="/journal"
					className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
				>
					Discard
				</a>
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
