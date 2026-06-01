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

import { emotionCloudTones, emotionFamily } from '@/lib/emotions';
import type { EmotionCount } from '@/lib/types';

// Minimal shape of a laid-out word; structurally a supertype of the lib's
// `Word`, so callbacks typed against it stay assignable to the props.
type CloudWord = { text: string; value: number };

interface Props {
	emotions: EmotionCount[];
}

// Stable per-word hash so each word always gets the same shade across renders.
const hashWord = (word: string): number => {
	let h = 0;
	for (let i = 0; i < word.length; i++) {
		h = (h * 31 + word.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
};

// d3-cloud applies fill via d3-selection's .style(), so the CSS var() shades
// from the shared taxonomy resolve correctly.
const fillFor = (word: string): string => {
	const palette = emotionCloudTones[emotionFamily(word)];
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
