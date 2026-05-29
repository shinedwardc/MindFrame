const prompts = [
	// Checking in — honestly, no judgement
	'How are you actually doing today?',
	"If you're honest with yourself, what's your mood right now?",
	"What's on your mind today — the real version?",
	'How would you describe today, without dressing it up?',

	// How you're really feeling
	"What's been taking up the most space in your head today?",
	'Did any feeling catch you off guard today?',
	"What's something you felt today but didn't say out loud?",
	'If today had a mood, what would it be?',

	// Hard to say out loud
	"What's something you wish you could tell someone close to you?",
	"Is there a thank-you you've been meaning to say to someone?",
	'What do you wish your family understood about you?',
	"What would you tell a friend if it didn't feel awkward to bring up?",
	"What's a small thing someone did that meant more than you let on?",
	"What's something you're quietly proud of?",

	// Self-kindness
	"What would you say to a friend who'd had your exact day?",
	"What's one thing you did today that deserves some credit?",
	'Where could you ease up on yourself today?',
	"What's something you're slowly making peace with?",

	// Small & good
	"What's one ordinary thing today you'd miss if it were gone?",
	'When did you feel most like yourself today?',
	"What's something small you're looking forward to?",
	'What made today a little easier than it could have been?',

	// Gentle reframing
	"What's a story you're telling yourself today that might have another side?",
	"What's something you assumed today that you didn't actually check?",
	'How might your day look to a friend watching from the outside?',

	// Rest & release
	'What would feel like enough for today?',
	"What's one thing you could set down before tomorrow?",
	'What do you need right now that you could give yourself?',
	"What's something that's okay to leave unfinished tonight?",
] as const;

const getDailyPrompt = (): string => {
	const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
	return prompts[dayIndex % prompts.length];
};

export default getDailyPrompt;
