/*
NextAuth config using JWT strategy (no DB writes from Next.js). Exports auth, handlers, signIn, signOut —
the four things you'll import throughout the app. The jwt callback attaches the user ID to the token; the session
callback exposes it to client components.
*/
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
