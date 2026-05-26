import { Roboto } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/actions/auth-actions';

const roboto = Roboto({ subsets: ['latin'], weight: '500' });

function GoogleIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 48 48"
			aria-hidden="true"
		>
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.61c-.54 2.84-2.15 5.25-4.56 6.87l7.1 5.51C43.3 36.33 46.5 30.74 46.5 24z"
			/>
			<path
				fill="#FBBC05"
				d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.51c-1.97 1.32-4.49 2.1-8.79 2.1-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</svg>
	);
}

export default function GoogleSignInButton() {
	return (
		<form action={signInWithGoogle}>
			<Button
				type="submit"
				variant="outline"
				size="lg"
				className={`${roboto.className} bg-white text-[#1F1F1F] border-[#DADCE0] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200 hover:bg-white hover:cursor-pointer active:translate-y-0 transition-all duration-150 gap-3 px-6`}
			>
				<GoogleIcon />
				Sign in with Google
			</Button>
		</form>
	);
}
