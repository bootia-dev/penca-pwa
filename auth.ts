import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { db } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      // Upsert user record so profile info stays fresh
      await db().from('users').upsert(
        {
          id: user.email,
          name: user.name ?? user.email,
          image: user.image ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      return true
    },
    session({ session }) {
      // Use email as the stable user ID across providers
      if (session.user.email) session.user.id = session.user.email
      return session
    },
  },
  pages: {
    signIn: '/',
  },
})
