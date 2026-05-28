import getDailyPrompt from '@/lib/prompts';
import NewEntryForm from './_components/NewEntryForm';

type SearchParams = Promise<{ prompt?: string }>;

const NewJournalEntryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
	const params = await searchParams;
	const prompt = getDailyPrompt();
	const showPrompt = params.prompt === 'true';

	return (
		<div className="min-h-screen">
			{/* Server-rendered header */}
			<div className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-background px-8 py-8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
				<div className="relative mx-auto max-w-3xl animate-in fade-in duration-500 fill-mode-backwards">
					<a
						href="/journal"
						className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
					>
						<span>←</span>
						<span>Back to journal</span>
					</a>
					<p className="mb-4 text-xs font-medium uppercase tracking-widest text-brand-500">
						New Entry
					</p>
					<h1 className="font-heading text-5xl font-light tracking-tight text-foreground">
						What's on your mind?
					</h1>
					<p className="mt-3 max-w-md text-lg text-muted-foreground">
						{new Date().toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
						})}
					</p>
				</div>
			</div>

			{/* Client component */}
			<NewEntryForm prompt={prompt} showPrompt={showPrompt} />
		</div>
	);
};

export default NewJournalEntryPage;
