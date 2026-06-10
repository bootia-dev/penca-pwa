import { auth } from '@/auth'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  if (!adminEmails.includes(session?.user?.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  let role = 'unknown'
  try {
    role = JSON.parse(Buffer.from(key.split('.')[1] + '==', 'base64').toString()).role
  } catch {}

  let buckets: string[] = []
  let uploadTest = ''
  try {
    const storage = createClient(url, key).storage
    const { data, error } = await storage.listBuckets()
    if (error) uploadTest = `listBuckets error: ${error.message}`
    else {
      buckets = (data ?? []).map((b: any) => b.name)
      const buf = Buffer.from('test')
      const { error: upErr } = await storage.from('group-images').upload('__debug.txt', buf, { upsert: true, contentType: 'text/plain' })
      uploadTest = upErr ? `upload error: ${upErr.message}` : 'upload OK'
    }
  } catch (e: any) {
    uploadTest = `exception: ${e.message}`
  }

  return NextResponse.json({ url: url.slice(0, 30), keyLength: key.length, role, buckets, uploadTest })
}
