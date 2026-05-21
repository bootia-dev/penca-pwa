'use server'

import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

function makeInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createGroup(name: string, password: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Not authenticated')
  const userId = session.user.email

  const passwordHash = await bcrypt.hash(password, 10)
  const inviteCode = makeInviteCode()

  const { data: group, error } = await db()
    .from('groups')
    .insert({ name: name.trim(), invite_code: inviteCode, password_hash: passwordHash, created_by: userId })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  await db().from('group_members').insert({ group_id: group.id, user_id: userId })

  revalidatePath('/groups')
  return { inviteCode }
}

export async function joinGroup(inviteCode: string, password: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Not authenticated')
  const userId = session.user.email

  const { data: group } = await db()
    .from('groups')
    .select('id, password_hash')
    .eq('invite_code', inviteCode.toUpperCase().trim())
    .single()

  if (!group) return { error: 'groupNotFound' as const }

  const ok = await bcrypt.compare(password, group.password_hash)
  if (!ok) return { error: 'wrongPassword' as const }

  const { error: memberError } = await db()
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })

  if (memberError?.code === '23505') return { error: 'alreadyMember' as const }
  if (memberError) throw new Error(memberError.message)

  revalidatePath('/groups')
  return { success: true as const }
}
