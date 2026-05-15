import { cookies } from 'next/headers'

export const translations = {
  en: {
    nav: { admin: 'Admin' },
    bottomNav: { matches: 'Matches', rankings: 'Rankings', profile: 'Profile' },
    landing: {
      description: 'Predict World Cup results and compete with friends for the top spot.',
      withGoogle: 'Continue with Google',
      withGithub: 'Continue with GitHub',
      rightWinner: 'Right winner',
      goalDiff: 'Goal difference',
      exactScore: 'Exact score',
    },
    dashboard: {
      totalPoints: 'Your total points',
      predictions: 'Predictions',
      upcoming: 'Upcoming',
      results: 'Results',
      noMatches: 'No matches scheduled yet. Check back soon!',
    },
    leaderboard: {
      title: 'Leaderboard',
      noPredictions: 'No predictions yet.',
      picks: 'picks',
      exact: 'exact',
      pts: 'pts',
      you: 'you',
      back: 'Back',
      noFinishedPicks: 'No finished matches yet.',
    },
    profile: {
      signOut: 'Sign out',
      points: 'Points',
      predictions: 'Predictions',
      exactScores: 'Exact scores',
    },
    admin: {
      title: 'Admin Panel',
      addMatch: 'Add Match',
      teamA: 'Team A',
      teamB: 'Team B',
      flagA: 'Flag A (emoji)',
      flagB: 'Flag B (emoji)',
      stage: 'Stage',
      group: 'Group (optional)',
      kickoff: 'Kickoff (local time)',
      allMatches: 'All Matches',
      noMatches: 'No matches yet.',
      setResult: 'Set result',
      deleteMatch: 'Delete match',
    },
    matchCard: {
      yourPick: 'Your pick:',
      noPrediction: 'No prediction',
    },
    predictionForm: { save: 'Save', saved: 'Saved!' },
    stages: {
      group: 'Group',
      round_of_16: 'Round of 16',
      quarterfinal: 'Quarterfinal',
      semifinal: 'Semifinal',
      final: 'Final',
    },
  },
  es: {
    nav: { admin: 'Admin' },
    bottomNav: { matches: 'Partidos', rankings: 'Tabla', profile: 'Perfil' },
    landing: {
      description: 'Predecí los resultados del Mundial y competí con tus amigos.',
      withGoogle: 'Continuar con Google',
      withGithub: 'Continuar con GitHub',
      rightWinner: 'Ganador correcto',
      goalDiff: 'Diferencia de goles',
      exactScore: 'Resultado exacto',
    },
    dashboard: {
      totalPoints: 'Tu puntaje total',
      predictions: 'Predicciones',
      upcoming: 'Próximos partidos',
      results: 'Resultados',
      noMatches: '¡No hay partidos programados aún. Volvé pronto!',
    },
    leaderboard: {
      title: 'Tabla de posiciones',
      noPredictions: 'Aún no hay predicciones.',
      picks: 'pronósticos',
      exact: 'exactos',
      pts: 'pts',
      you: 'vos',
      back: 'Volver',
      noFinishedPicks: 'No hay partidos finalizados aún.',
    },
    profile: {
      signOut: 'Cerrar sesión',
      points: 'Puntos',
      predictions: 'Predicciones',
      exactScores: 'Resultados exactos',
    },
    admin: {
      title: 'Panel de administración',
      addMatch: 'Agregar partido',
      teamA: 'Equipo A',
      teamB: 'Equipo B',
      flagA: 'Bandera A (emoji)',
      flagB: 'Bandera B (emoji)',
      stage: 'Fase',
      group: 'Grupo (opcional)',
      kickoff: 'Inicio (hora local)',
      allMatches: 'Todos los partidos',
      noMatches: 'No hay partidos aún.',
      setResult: 'Cargar resultado',
      deleteMatch: 'Eliminar partido',
    },
    matchCard: {
      yourPick: 'Tu pronóstico:',
      noPrediction: 'Sin pronóstico',
    },
    predictionForm: { save: 'Guardar', saved: '¡Guardado!' },
    stages: {
      group: 'Fase de grupos',
      round_of_16: 'Octavos de final',
      quarterfinal: 'Cuartos de final',
      semifinal: 'Semifinal',
      final: 'Final',
    },
  },
} as const

export type Locale = keyof typeof translations
export type T = typeof translations.en

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const val = store.get('locale')?.value
  return val === 'es' ? 'es' : 'en'
}

export function t(locale: Locale): T {
  return translations[locale] as unknown as T
}
