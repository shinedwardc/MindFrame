import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { GroupedPattern, PatternItem } from '@/lib/types';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const formatLabel = (type: string): string =>
	type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const groupPatternsByType = (
	patterns: PatternItem[] | null | undefined,
): GroupedPattern[] => {
	const groups = new Map<string, GroupedPattern>();
	for (const pattern of patterns ?? []) {
		const existing = groups.get(pattern.type);
		if (existing) existing.items.push(pattern);
		else groups.set(pattern.type, { type: pattern.type, items: [pattern] });
	}
	return [...groups.values()];
};

export const distinctPatternCount = (patterns: PatternItem[] | null | undefined): number =>
	groupPatternsByType(patterns).length;
