/*
NextAuth config using JWT strategy (no DB writes from Next.js). Exports auth, handlers, signIn, signOut —
the four things you'll import throughout the app. The jwt callback attaches the user ID to the token; the session
callback exposes it to client components.
*/
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { auth, handlers, signIn, signOut } = NextAuth({
	providers: [Google],
	session: { strategy: 'jwt' },
	callbacks: {
		jwt({ token, user }) {
			// Called on every JWT creation or access (login + every request).
			// On login: user is defined (Google's data) — this is the only time token fields are set.
			// On every subsequent request (auth() calls, middleware): user is undefined, token passes through unchanged.
			// Returns: { id, picture, name, email, iat, exp }
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
				token.picture = user.image;
			}
			return token;
		},
		session({ session, token }) {
			// Called on every auth() call after jwt() runs — never called on login directly.
			// Receives the token jwt() returned and shapes it into the session object your app sees.
			// Returns: { user: { name, email, image, id }, expires }
			session.user.id = token.id as string;
			session.user.name = token.name as string;
			session.user.email = token.email as string;
			session.user.image = token.picture as string;
			return session;
		},
	},
});

/* Server component auth flow breakdown example: 
  - Middleware runs first on every request, calls auth() to check for valid session cookie; if missing/invalid, redirects to landing page
  - Server component calls auth()
  - Auth.js calls cookies() from next/headers
  - cookies() reads from Next.js AsyncLocalStorage — the request context Next.js stored before your
  component ran
  - Reads authjs.session-token cookie value
  - Verifies JWT signature with AUTH_SECRET
  - Decodes payload: { id, name, email, picture, iat, exp }
  - Runs jwt() callback — user is undefined here so if (user) is skipped, token passes through unchanged
  - Builds session object: { user: { name, email, image }, expires }
  - Runs your session() callback (auth.ts:17): session.user.id = token.id
  - Returns the final session object
  */

/* Login flow breakdown example:
  - User clicks "Sign in with Google" button in client component, which calls signIn('google')
  - NextAuth redirects to Google login page; user enters credentials
  - Google redirects back to /api/auth/callback/google with code in query string
  - NextAuth gets user info from Google
  - Runs jwt() callback — this time user is defined, so token.id = user.id is set
  - JWT is signed with AUTH_SECRET and set as authjs.session-token cookie
  - session() callback is run on next request, exposing token.id as session.user.id
  - Redirects to dashboard page
  */
