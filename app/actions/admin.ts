'use server'

import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { calculatePoints } from '@/lib/scoring'
import { revalidatePath } from 'next/cache'

function isAdmin(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return Boolean(email && adminEmails.includes(email))
}

async function requireAdmin() {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) throw new Error('Forbidden')
  return session!
}

export async function createMatch(formData: FormData) {
  await requireAdmin()

  const { error } = await db().from('matches').insert({
    team_a: formData.get('team_a') as string,
    team_b: formData.get('team_b') as string,
    flag_a: formData.get('flag_a') as string,
    flag_b: formData.get('flag_b') as string,
    stage: formData.get('stage') as string,
    group_name: (formData.get('group_name') as string) || null,
    scheduled_at: formData.get('scheduled_at') as string,
    status: 'upcoming',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

export async function setMatchResult(matchId: string, resultA: number, resultB: number) {
  await requireAdmin()

  const { error: updateError } = await db()
    .from('matches')
    .update({ result_a: resultA, result_b: resultB, status: 'finished', updated_at: new Date().toISOString() })
    .eq('id', matchId)

  if (updateError) throw new Error(updateError.message)

  const { data: predictions } = await db()
    .from('predictions')
    .select('id, predicted_a, predicted_b')
    .eq('match_id', matchId)

  if (predictions && predictions.length > 0) {
    await Promise.all(
      predictions.map((p) =>
        db()
          .from('predictions')
          .update({ points: calculatePoints(p.predicted_a, p.predicted_b, resultA, resultB) })
          .eq('id', p.id)
      )
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/leaderboard')
  revalidatePath('/admin')
}

export async function deleteMatch(matchId: string) {
  await requireAdmin()
  const { error } = await db().from('matches').delete().eq('id', matchId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}
