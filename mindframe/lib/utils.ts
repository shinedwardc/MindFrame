import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const formatLabel = (type: string): string =>
	type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
