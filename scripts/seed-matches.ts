import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const matches = [
  // ── GROUP A ──────────────────────────────────────────
  { team_a: 'Mexico',       flag_a: '🇲🇽', team_b: 'South Africa', flag_b: '🇿🇦', group_name: 'A', scheduled_at: '2026-06-11T19:00:00Z' },
  { team_a: 'South Korea',  flag_a: '🇰🇷', team_b: 'Czechia',      flag_b: '🇨🇿', group_name: 'A', scheduled_at: '2026-06-12T02:00:00Z' },
  { team_a: 'Czechia',      flag_a: '🇨🇿', team_b: 'South Africa', flag_b: '🇿🇦', group_name: 'A', scheduled_at: '2026-06-18T17:00:00Z' },
  { team_a: 'Mexico',       flag_a: '🇲🇽', team_b: 'South Korea',  flag_b: '🇰🇷', group_name: 'A', scheduled_at: '2026-06-19T03:00:00Z' },
  { team_a: 'Czechia',      flag_a: '🇨🇿', team_b: 'Mexico',       flag_b: '🇲🇽', group_name: 'A', scheduled_at: '2026-06-25T03:00:00Z' },
  { team_a: 'South Africa', flag_a: '🇿🇦', team_b: 'South Korea',  flag_b: '🇰🇷', group_name: 'A', scheduled_at: '2026-06-25T03:00:00Z' },

  // ── GROUP B ──────────────────────────────────────────
  { team_a: 'Canada',               flag_a: '🇨🇦', team_b: 'Bosnia & Herzegovina', flag_b: '🇧🇦', group_name: 'B', scheduled_at: '2026-06-12T19:00:00Z' },
  { team_a: 'Qatar',                flag_a: '🇶🇦', team_b: 'Switzerland',           flag_b: '🇨🇭', group_name: 'B', scheduled_at: '2026-06-13T19:00:00Z' },
  { team_a: 'Switzerland',          flag_a: '🇨🇭', team_b: 'Bosnia & Herzegovina', flag_b: '🇧🇦', group_name: 'B', scheduled_at: '2026-06-18T23:00:00Z' },
  { team_a: 'Canada',               flag_a: '🇨🇦', team_b: 'Qatar',                flag_b: '🇶🇦', group_name: 'B', scheduled_at: '2026-06-19T02:00:00Z' },
  { team_a: 'Switzerland',          flag_a: '🇨🇭', team_b: 'Canada',               flag_b: '🇨🇦', group_name: 'B', scheduled_at: '2026-06-24T23:00:00Z' },
  { team_a: 'Bosnia & Herzegovina', flag_a: '🇧🇦', team_b: 'Qatar',                flag_b: '🇶🇦', group_name: 'B', scheduled_at: '2026-06-24T23:00:00Z' },

  // ── GROUP C ──────────────────────────────────────────
  { team_a: 'Brazil',   flag_a: '🇧🇷', team_b: 'Morocco',  flag_b: '🇲🇦', group_name: 'C', scheduled_at: '2026-06-13T23:00:00Z' },
  { team_a: 'Haiti',    flag_a: '🇭🇹', team_b: 'Scotland', flag_b: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group_name: 'C', scheduled_at: '2026-06-14T01:00:00Z' },
  { team_a: 'Scotland', flag_a: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', team_b: 'Morocco',  flag_b: '🇲🇦', group_name: 'C', scheduled_at: '2026-06-19T23:00:00Z' },
  { team_a: 'Brazil',   flag_a: '🇧🇷', team_b: 'Haiti',    flag_b: '🇭🇹', group_name: 'C', scheduled_at: '2026-06-20T02:00:00Z' },
  { team_a: 'Scotland', flag_a: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', team_b: 'Brazil',   flag_b: '🇧🇷', group_name: 'C', scheduled_at: '2026-06-24T23:00:00Z' },
  { team_a: 'Morocco',  flag_a: '🇲🇦', team_b: 'Haiti',    flag_b: '🇭🇹', group_name: 'C', scheduled_at: '2026-06-24T23:00:00Z' },

  // ── GROUP D ──────────────────────────────────────────
  { team_a: 'USA',       flag_a: '🇺🇸', team_b: 'Paraguay',  flag_b: '🇵🇾', group_name: 'D', scheduled_at: '2026-06-13T01:00:00Z' },
  { team_a: 'Australia', flag_a: '🇦🇺', team_b: 'Turkey',    flag_b: '🇹🇷', group_name: 'D', scheduled_at: '2026-06-14T04:00:00Z' },
  { team_a: 'USA',       flag_a: '🇺🇸', team_b: 'Australia', flag_b: '🇦🇺', group_name: 'D', scheduled_at: '2026-06-19T23:00:00Z' },
  { team_a: 'Turkey',    flag_a: '🇹🇷', team_b: 'Paraguay',  flag_b: '🇵🇾', group_name: 'D', scheduled_at: '2026-06-20T08:00:00Z' },
  { team_a: 'Turkey',    flag_a: '🇹🇷', team_b: 'USA',       flag_b: '🇺🇸', group_name: 'D', scheduled_at: '2026-06-26T06:00:00Z' },
  { team_a: 'Paraguay',  flag_a: '🇵🇾', team_b: 'Australia', flag_b: '🇦🇺', group_name: 'D', scheduled_at: '2026-06-26T06:00:00Z' },

  // ── GROUP E ──────────────────────────────────────────
  { team_a: 'Germany',     flag_a: '🇩🇪', team_b: 'Curaçao',     flag_b: '🇨🇼', group_name: 'E', scheduled_at: '2026-06-14T18:00:00Z' },
  { team_a: 'Ivory Coast', flag_a: '🇨🇮', team_b: 'Ecuador',     flag_b: '🇪🇨', group_name: 'E', scheduled_at: '2026-06-15T00:00:00Z' },
  { team_a: 'Germany',     flag_a: '🇩🇪', team_b: 'Ivory Coast', flag_b: '🇨🇮', group_name: 'E', scheduled_at: '2026-06-20T21:00:00Z' },
  { team_a: 'Ecuador',     flag_a: '🇪🇨', team_b: 'Curaçao',     flag_b: '🇨🇼', group_name: 'E', scheduled_at: '2026-06-21T04:00:00Z' },
  { team_a: 'Ecuador',     flag_a: '🇪🇨', team_b: 'Germany',     flag_b: '🇩🇪', group_name: 'E', scheduled_at: '2026-06-25T21:00:00Z' },
  { team_a: 'Curaçao',     flag_a: '🇨🇼', team_b: 'Ivory Coast', flag_b: '🇨🇮', group_name: 'E', scheduled_at: '2026-06-25T21:00:00Z' },

  // ── GROUP F ──────────────────────────────────────────
  { team_a: 'Netherlands', flag_a: '🇳🇱', team_b: 'Japan',       flag_b: '🇯🇵', group_name: 'F', scheduled_at: '2026-06-14T21:00:00Z' },
  { team_a: 'Sweden',      flag_a: '🇸🇪', team_b: 'Tunisia',     flag_b: '🇹🇳', group_name: 'F', scheduled_at: '2026-06-15T04:00:00Z' },
  { team_a: 'Netherlands', flag_a: '🇳🇱', team_b: 'Sweden',      flag_b: '🇸🇪', group_name: 'F', scheduled_at: '2026-06-20T19:00:00Z' },
  { team_a: 'Tunisia',     flag_a: '🇹🇳', team_b: 'Japan',       flag_b: '🇯🇵', group_name: 'F', scheduled_at: '2026-06-21T06:00:00Z' },
  { team_a: 'Japan',       flag_a: '🇯🇵', team_b: 'Sweden',      flag_b: '🇸🇪', group_name: 'F', scheduled_at: '2026-06-26T01:00:00Z' },
  { team_a: 'Tunisia',     flag_a: '🇹🇳', team_b: 'Netherlands', flag_b: '🇳🇱', group_name: 'F', scheduled_at: '2026-06-26T01:00:00Z' },

  // ── GROUP G ──────────────────────────────────────────
  { team_a: 'Belgium',     flag_a: '🇧🇪', team_b: 'Egypt',       flag_b: '🇪🇬', group_name: 'G', scheduled_at: '2026-06-15T23:00:00Z' },
  { team_a: 'Iran',        flag_a: '🇮🇷', team_b: 'New Zealand', flag_b: '🇳🇿', group_name: 'G', scheduled_at: '2026-06-16T05:00:00Z' },
  { team_a: 'Belgium',     flag_a: '🇧🇪', team_b: 'Iran',        flag_b: '🇮🇷', group_name: 'G', scheduled_at: '2026-06-21T23:00:00Z' },
  { team_a: 'New Zealand', flag_a: '🇳🇿', team_b: 'Egypt',       flag_b: '🇪🇬', group_name: 'G', scheduled_at: '2026-06-22T05:00:00Z' },
  { team_a: 'Egypt',       flag_a: '🇪🇬', team_b: 'Iran',        flag_b: '🇮🇷', group_name: 'G', scheduled_at: '2026-06-27T07:00:00Z' },
  { team_a: 'New Zealand', flag_a: '🇳🇿', team_b: 'Belgium',     flag_b: '🇧🇪', group_name: 'G', scheduled_at: '2026-06-27T07:00:00Z' },

  // ── GROUP H ──────────────────────────────────────────
  { team_a: 'Spain',        flag_a: '🇪🇸', team_b: 'Cape Verde',   flag_b: '🇨🇻', group_name: 'H', scheduled_at: '2026-06-15T17:00:00Z' },
  { team_a: 'Saudi Arabia', flag_a: '🇸🇦', team_b: 'Uruguay',      flag_b: '🇺🇾', group_name: 'H', scheduled_at: '2026-06-15T23:00:00Z' },
  { team_a: 'Spain',        flag_a: '🇪🇸', team_b: 'Saudi Arabia', flag_b: '🇸🇦', group_name: 'H', scheduled_at: '2026-06-21T17:00:00Z' },
  { team_a: 'Uruguay',      flag_a: '🇺🇾', team_b: 'Cape Verde',   flag_b: '🇨🇻', group_name: 'H', scheduled_at: '2026-06-21T23:00:00Z' },
  { team_a: 'Cape Verde',   flag_a: '🇨🇻', team_b: 'Saudi Arabia', flag_b: '🇸🇦', group_name: 'H', scheduled_at: '2026-06-27T02:00:00Z' },
  { team_a: 'Uruguay',      flag_a: '🇺🇾', team_b: 'Spain',        flag_b: '🇪🇸', group_name: 'H', scheduled_at: '2026-06-27T02:00:00Z' },

  // ── GROUP I ──────────────────────────────────────────
  { team_a: 'France',   flag_a: '🇫🇷', team_b: 'Senegal', flag_b: '🇸🇳', group_name: 'I', scheduled_at: '2026-06-16T20:00:00Z' },
  { team_a: 'Iraq',     flag_a: '🇮🇶', team_b: 'Norway',  flag_b: '🇳🇴', group_name: 'I', scheduled_at: '2026-06-16T23:00:00Z' },
  { team_a: 'France',   flag_a: '🇫🇷', team_b: 'Iraq',    flag_b: '🇮🇶', group_name: 'I', scheduled_at: '2026-06-22T22:00:00Z' },
  { team_a: 'Norway',   flag_a: '🇳🇴', team_b: 'Senegal', flag_b: '🇸🇳', group_name: 'I', scheduled_at: '2026-06-23T01:00:00Z' },
  { team_a: 'Norway',   flag_a: '🇳🇴', team_b: 'France',  flag_b: '🇫🇷', group_name: 'I', scheduled_at: '2026-06-26T20:00:00Z' },
  { team_a: 'Senegal',  flag_a: '🇸🇳', team_b: 'Iraq',    flag_b: '🇮🇶', group_name: 'I', scheduled_at: '2026-06-26T20:00:00Z' },

  // ── GROUP J ──────────────────────────────────────────
  { team_a: 'Argentina', flag_a: '🇦🇷', team_b: 'Algeria', flag_b: '🇩🇿', group_name: 'J', scheduled_at: '2026-06-17T03:00:00Z' },
  { team_a: 'Austria',   flag_a: '🇦🇹', team_b: 'Jordan',  flag_b: '🇯🇴', group_name: 'J', scheduled_at: '2026-06-17T08:00:00Z' },
  { team_a: 'Argentina', flag_a: '🇦🇷', team_b: 'Austria', flag_b: '🇦🇹', group_name: 'J', scheduled_at: '2026-06-22T19:00:00Z' },
  { team_a: 'Jordan',    flag_a: '🇯🇴', team_b: 'Algeria', flag_b: '🇩🇿', group_name: 'J', scheduled_at: '2026-06-23T07:00:00Z' },
  { team_a: 'Algeria',   flag_a: '🇩🇿', team_b: 'Austria', flag_b: '🇦🇹', group_name: 'J', scheduled_at: '2026-06-28T04:00:00Z' },
  { team_a: 'Jordan',    flag_a: '🇯🇴', team_b: 'Argentina',flag_b: '🇦🇷', group_name: 'J', scheduled_at: '2026-06-28T04:00:00Z' },

  // ── GROUP K ──────────────────────────────────────────
  { team_a: 'Portugal',  flag_a: '🇵🇹', team_b: 'DR Congo',   flag_b: '🇨🇩', group_name: 'K', scheduled_at: '2026-06-17T19:00:00Z' },
  { team_a: 'Uzbekistan',flag_a: '🇺🇿', team_b: 'Colombia',   flag_b: '🇨🇴', group_name: 'K', scheduled_at: '2026-06-18T04:00:00Z' },
  { team_a: 'Portugal',  flag_a: '🇵🇹', team_b: 'Uzbekistan', flag_b: '🇺🇿', group_name: 'K', scheduled_at: '2026-06-23T19:00:00Z' },
  { team_a: 'Colombia',  flag_a: '🇨🇴', team_b: 'DR Congo',   flag_b: '🇨🇩', group_name: 'K', scheduled_at: '2026-06-24T04:00:00Z' },
  { team_a: 'Colombia',  flag_a: '🇨🇴', team_b: 'Portugal',   flag_b: '🇵🇹', group_name: 'K', scheduled_at: '2026-06-28T02:30:00Z' },
  { team_a: 'DR Congo',  flag_a: '🇨🇩', team_b: 'Uzbekistan', flag_b: '🇺🇿', group_name: 'K', scheduled_at: '2026-06-28T02:30:00Z' },

  // ── GROUP L ──────────────────────────────────────────
  { team_a: 'England', flag_a: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team_b: 'Croatia', flag_b: '🇭🇷', group_name: 'L', scheduled_at: '2026-06-17T22:00:00Z' },
  { team_a: 'Ghana',   flag_a: '🇬🇭', team_b: 'Panama',  flag_b: '🇵🇦', group_name: 'L', scheduled_at: '2026-06-18T00:00:00Z' },
  { team_a: 'England', flag_a: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team_b: 'Ghana',   flag_b: '🇬🇭', group_name: 'L', scheduled_at: '2026-06-23T21:00:00Z' },
  { team_a: 'Panama',  flag_a: '🇵🇦', team_b: 'Croatia', flag_b: '🇭🇷', group_name: 'L', scheduled_at: '2026-06-24T00:00:00Z' },
  { team_a: 'Panama',  flag_a: '🇵🇦', team_b: 'England', flag_b: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group_name: 'L', scheduled_at: '2026-06-27T22:00:00Z' },
  { team_a: 'Croatia', flag_a: '🇭🇷', team_b: 'Ghana',   flag_b: '🇬🇭', group_name: 'L', scheduled_at: '2026-06-27T22:00:00Z' },
]

async function seed() {
  console.log(`Seeding ${matches.length} group stage matches…`)

  const rows = matches.map((m) => ({
    ...m,
    stage: 'group',
    status: 'upcoming',
  }))

  const { error } = await supabase.from('matches').insert(rows)

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Done! ${matches.length} matches inserted.`)
}

seed()
