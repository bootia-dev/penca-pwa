export interface User {
  id: string       // email address
  name: string
  image: string | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  team_a: string
  team_b: string
  flag_a: string
  flag_b: string
  stage: 'group' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
  group_name: string | null
  scheduled_at: string
  result_a: number | null
  result_b: number | null
  status: 'upcoming' | 'live' | 'finished'
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_a: number
  predicted_b: number
  points: number | null
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  image: string | null
  total_points: number
  predictions_count: number
  exact_scores: number
}

export interface MatchWithPrediction extends Match {
  prediction?: Prediction | null
}
