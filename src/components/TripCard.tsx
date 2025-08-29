'use client'

import { useState, useEffect } from 'react'
import { Trip, Destination, RidingDate } from '@/types'
import { supabase } from '@/lib/supabase'

interface TripCardProps {
  trip: Trip
  onVote: (tripId: string) => void
  onViewResults: (tripId: string) => void
  onRefresh?: () => void
}

export default function TripCard({ trip, onVote, onViewResults, onRefresh }: TripCardProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [dates, setDates] = useState<RidingDate[]>([])
  const [participantCount, setParticipantCount] = useState(0)

  const refreshData = () => {
    fetchTripData()
    onRefresh?.()
  }

  useEffect(() => {
    fetchTripData()
  }, [trip.id, trip]) // Add trip as dependency so it re-fetches when trip data changes

  const fetchTripData = async () => {
    try {
      // Fetch destinations
      const { data: destinationsData, error: destError } = await supabase
        .from('destinations')
        .select('*')
        .eq('trip_id', trip.id)

      if (destError) throw destError

      // Fetch dates
      const { data: datesData, error: datesError } = await supabase
        .from('riding_dates')
        .select('*')
        .eq('trip_id', trip.id)

      if (datesError) throw datesError

      // Fetch vote counts for destinations
      const destinationsWithVotes = await Promise.all(
        (destinationsData || []).map(async (dest) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('destination_id', dest.id)

          return { ...dest, vote_count: count || 0 }
        })
      )

      // Fetch vote counts for dates
      const datesWithVotes = await Promise.all(
        (datesData || []).map(async (date) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('date_id', date.id)

          return { ...date, vote_count: count || 0 }
        })
      )

      // Fetch unique participants count
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('voter_name')
        .eq('trip_id', trip.id)

      if (votesError) throw votesError

      const uniqueParticipants = new Set(votesData?.map(v => v.voter_name) || [])
      
      setDestinations(destinationsWithVotes)
      setDates(datesWithVotes)
      setParticipantCount(uniqueParticipants.size)
    } catch (error) {
      console.error('Error fetching trip data:', error)
    }
  }

  const getTopDestination = () => {
    if (destinations.length === 0) return null
    return destinations.reduce((prev, current) => 
      (prev.vote_count > current.vote_count) ? prev : current
    )
  }

  const getTopDate = () => {
    if (dates.length === 0) return null
    return dates.reduce((prev, current) => 
      (prev.vote_count > current.vote_count) ? prev : current
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const topDestination = getTopDestination()
  const topDate = getTopDate()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{trip.title}</h3>
          <p className="text-gray-400 mt-1">{trip.description}</p>
        </div>
        <span className="px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">
          {trip.status}
        </span>
      </div>

      {/* Trip Details */}
      <div className="space-y-3">
        {/* Date */}
        {topDate && (
          <div className="flex items-center text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(topDate.date)}</span>
            <span className="ml-auto text-sm text-gray-400">{topDate.vote_count} votes</span>
          </div>
        )}

        {/* Destination */}
        {topDestination && (
          <div className="flex items-center text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{topDestination.name}</span>
            <span className="ml-auto text-sm text-gray-400">{topDestination.vote_count} votes</span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center text-gray-300">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>{participantCount} participants</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <button
          onClick={() => onVote(trip.id)}
          className="flex-1 bg-white text-gray-900 py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Vote
        </button>
        <button
          onClick={() => onViewResults(trip.id)}
          className="flex-1 bg-gray-700 text-gray-300 py-2 px-4 rounded-md font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Results
        </button>
      </div>
    </div>
  )
}
