import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { getLocale, t } from '@/lib/i18n'

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  const locale = await getLocale()
  const tr = t(locale).landing

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-4xl font-bold text-white mb-2">Penca</h1>
        <p className="text-gray-400 mb-8">{tr.description}</p>

        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/dashboard' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <GoogleIcon />
              {tr.withGoogle}
            </button>
          </form>

        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">3pts</div>
            <div className="text-xs text-gray-500 mt-1">{tr.rightWinner}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">+2pts</div>
            <div className="text-xs text-gray-500 mt-1">{tr.goalDiff}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">+1pt</div>
            <div className="text-xs text-gray-500 mt-1">{tr.exactScore}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

