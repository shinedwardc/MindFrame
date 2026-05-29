'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { deleteJournalEntry } from '../actions';

const DeleteEntryButton = ({ entryId }: { entryId: number }) => {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			await deleteJournalEntry(entryId);
		});
	};

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground/40 hover:bg-transparent hover:text-destructive/60"
					/>
				}
			>
				Delete entry
			</DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Delete this entry?</DialogTitle>
					<DialogDescription>
						This cannot be undone. Your writing and its analysis will be permanently removed.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
					<Button variant="destructive" disabled={isPending} onClick={handleDelete}>
						{isPending ? 'Deleting…' : 'Delete entry'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteEntryButton;
