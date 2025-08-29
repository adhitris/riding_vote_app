export interface Trip {
  id: string
  title: string
  description: string
  passcode: string
  status: 'planning' | 'active' | 'completed'
  created_at: string
  participant_count: number
}

export interface Destination {
  id: string
  trip_id: string
  name: string
  description?: string
  vote_count: number
  created_at: string
}

export interface RidingDate {
  id: string
  trip_id: string
  date: string
  description?: string
  vote_count: number
  created_at: string
}

export interface Vote {
  id: string
  voter_name: string
  trip_id: string
  destination_id?: string
  date_id?: string
  created_at: string
}

export interface VoteDetail {
  destination_id?: string
  date_id?: string
  voter_names: string[]
}
