import { signIn } from '@/lib/auth';

export default function HomePage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold text-gray-900">MindFrame</h1>
				<p className="text-gray-500">Your CBT-powered mood journal</p>
				<form
					action={async () => {
						'use server';
						await signIn('google');
					}}
				>
					<button
						type="submit"
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
					>
						Sign in with Google
					</button>
				</form>
			</div>
		</main>
	);
}
