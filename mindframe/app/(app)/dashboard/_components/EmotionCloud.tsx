'use client';

import { useEffect, useRef, useState } from 'react';
// NOTE: react-d3-cloud is unmaintained — its peer range caps at React 18 and we
// run it on 19 via an `overrides` pin in package.json. It works because it's a
// thin wrapper over `d3-cloud` using only stable React APIs. If a FUTURE React
// major ever breaks it (no upstream fix will come), the escape hatch is to
// vendor it: run `cloud()` from `d3-cloud` in an effect and render the
// <svg>/<text> here yourself. d3-cloud exposes each word's bounding box
// (x0/y0/x1/y1 around its center), which also unlocks true per-word <rect>
// backgrounds — the one thing this library can't render.
import WordCloud from 'react-d3-cloud';

interface EmotionCount {
	word: string;
	count: number;
}

// Minimal shape of a laid-out word; structurally a supertype of the lib's
// `Word`, so callbacks typed against it stay assignable to the props.
type CloudWord = { text: string; value: number };

interface Props {
	emotions: EmotionCount[];
}

const HEAVY = new Set(['Anxious', 'Overwhelmed', 'Sad', 'Lonely', 'Frustrated', 'Drained']);
const LIGHT = new Set(['Hopeful', 'Content', 'Grateful', 'Connected', 'Proud']);

// Stable per-word hash so each word always gets the same shade across renders.
const hashWord = (word: string): number => {
	let h = 0;
	for (let i = 0; i < word.length; i++) {
		h = (h * 31 + word.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
};

const familyOf = (word: string): 'heavy' | 'light' | 'steady' => {
	if (HEAVY.has(word)) return 'heavy';
	if (LIGHT.has(word)) return 'light';
	return 'steady';
};

// d3-cloud applies fill via d3-selection's .style(), so CSS var() resolves
// correctly. All families reference the shared tokens from globals.css:
//   heavy → dusk (dusty blue: low without alarm, no red/yellow)
//   light → brand (sage/green)
//   steady → stone (warm neutral)
const TONES: Record<'heavy' | 'light' | 'steady', string[]> = {
	heavy: ['var(--color-dusk-500)', 'var(--color-dusk-600)', 'var(--color-dusk-400)'],
	light: ['var(--color-brand-500)', 'var(--color-brand-700)', 'var(--color-brand-600)'],
	steady: ['var(--color-stone-500)', 'var(--color-stone-600)', 'var(--color-stone-400)'],
};

const fillFor = (word: string): string => {
	const palette = TONES[familyOf(word)];
	return palette[hashWord(word) % palette.length];
};

const HEIGHT = 220;
const MIN_PX = 15;
const MAX_PX = 46;

const EmotionCloud = ({ emotions }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [fontReady, setFontReady] = useState(false);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			setWidth(entry.contentRect.width);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// Fraunces is web-font loaded; relayout once it's ready so d3-cloud measures
	// glyphs with the correct metrics instead of a fallback font.
	useEffect(() => {
		let active = true;
		document.fonts.ready.then(() => {
			if (active) setFontReady(true);
		});
		return () => {
			active = false;
		};
	}, []);

	const counts = emotions.map((e) => e.count);
	const maxCount = Math.max(...counts, 1);
	const minCount = Math.min(...counts, 1);

	const data = emotions.map((e) => ({ text: e.word, value: e.count }));

	const fontSize = (word: CloudWord): number => {
		const t = maxCount === minCount ? 0.5 : (word.value - minCount) / (maxCount - minCount);
		return MIN_PX + t * (MAX_PX - MIN_PX);
	};

	return (
		<div ref={containerRef} style={{ height: HEIGHT }}>
			{width > 0 && (
				<WordCloud
					// remount when the real font loads so the layout re-measures
					key={fontReady ? 'font-ready' : 'font-pending'}
					data={data}
					width={width}
					height={HEIGHT}
					font="Fraunces"
					fontWeight={300}
					fontSize={fontSize}
					rotate={0}
					padding={4}
					fill={(word: CloudWord) => fillFor(word.text)}
					// constant "random" keeps the spiral packing deterministic
					random={() => 0.5}
				/>
			)}
		</div>
	);
};

export default EmotionCloud;
