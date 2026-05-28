import Link from 'next/link';

const JournalPrompt = ({ prompt }: { prompt: string }) => {
	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards delay-150">
			<span className="text-md tracking-widest text-brand-500">
				Don't know what to write? Here's a prompt for today to get you started.
			</span>
			<blockquote className="mt-4 border-l-2 border-brand-200 pl-6 font-heading text-2xl font-light italic leading-relaxed text-foreground/80">
				"{prompt}"
			</blockquote>
			<Link
				href="/journal/new?prompt=true"
				className="mt-4 inline-block text-sm text-brand-500 transition-colors duration-300 hover:text-brand-700"
			>
				Respond to this prompt →
			</Link>
		</section>
	);
};

export default JournalPrompt;
