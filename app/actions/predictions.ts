'use server'

import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function upsertPrediction(matchId: string, predictedA: number, predictedB: number) {
  const session = await auth()
  const userId = session?.user?.email
  if (!userId) throw new Error('Not authenticated')

  // Ensure user row exists
  const { error: userError } = await db().from('users').upsert(
    {
      id: userId,
      name: session.user?.name ?? userId,
      image: session.user?.image ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )
  if (userError) throw new Error(`Could not save user: ${userError.message}`)

  const match = await db()
    .from('matches')
    .select('scheduled_at, status')
    .eq('id', matchId)
    .single()

  if (match.error || !match.data) throw new Error('Match not found')
  if (match.data.status !== 'upcoming') throw new Error('Match has already started')
  if (new Date() >= new Date(match.data.scheduled_at)) throw new Error('Prediction window closed')

  const { error } = await db().from('predictions').upsert(
    {
      user_id: userId,
      match_id: matchId,
      predicted_a: predictedA,
      predicted_b: predictedB,
      points: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' }
  )

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}
