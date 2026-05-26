import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function ExercisesPage() {
	const session = await auth();
	if (!session) redirect('/');

	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold">Exercises</h1>
			<p className="text-gray-500 mt-1">CBT exercises recommended for you.</p>
		</main>
	);
}
