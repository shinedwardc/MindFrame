export type PatternItem = {
	type: string;
	quote?: string;
	reasoning?: string;
	confidence?: string;
};

export type GroupedPattern = {
	type: string;
	items: PatternItem[];
};

export type Exercise = {
	title: string;
	description: string;
	steps: string[];
	exercise_type: string;
};

export type JournalEntry = {
	id: number;
	content: string;
	mood_score: number;
	sentiment: string | null;
	distortions: PatternItem[] | null;
	positive_patterns: PatternItem[] | null;
	acute_risk_detected: boolean;
	recommended_exercises?: Exercise[] | null;
	analysis_status?: string;
	created_at: string;
};

export type EmotionCount = {
	word: string;
	count: number;
};

export type DashboardEntry = {
	id: number;
	mood_score: number;
	content_preview: string;
	acute_risk_detected: boolean;
	created_at: string;
};
