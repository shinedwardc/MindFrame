import { redirect } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { auth } from '@/lib/auth';

export default async function HomePage() {
	const session = await auth();
	if (session) redirect('/dashboard');

	return (
		<main className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold text-gray-900">MindFrame</h1>
				<p className="text-gray-500">Your CBT-powered mood journal</p>
				<GoogleSignInButton />
			</div>
		</main>
	);
}
