'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trip, Destination, RidingDate } from '@/types'
import { supabase } from '@/lib/supabase'

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
  onVoteSuccess?: () => void
}

export default function VoteModal({ isOpen, onClose, trip, onVoteSuccess }: VoteModalProps) {
  const [voterName, setVoterName] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [dates, setDates] = useState<RidingDate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (trip && isOpen) {
      fetchTripOptions()
    }
  }, [trip, isOpen, fetchTripOptions])

  const fetchTripOptions = useCallback(async () => {
    if (!trip) return

    try {
      // Fetch destinations with vote counts - try RPC first, fall back to regular query
      const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select('*')
        .eq('trip_id', trip.id)

      if (destError) throw destError

      // Fetch dates with vote counts  
      const { data: dates, error: datesError } = await supabase
        .from('riding_dates')
        .select('*')
        .eq('trip_id', trip.id)

      if (datesError) throw datesError

      // Get vote counts for each destination
      const destinationsWithVotes = await Promise.all(
        (destinations || []).map(async (dest) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('destination_id', dest.id)

          return { ...dest, vote_count: count || 0 }
        })
      )

      // Get vote counts for each date
      const datesWithVotes = await Promise.all(
        (dates || []).map(async (date) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('date_id', date.id)

          return { ...date, vote_count: count || 0 }
        })
      )

      setDestinations(destinationsWithVotes)
      setDates(datesWithVotes)
    } catch (error) {
      console.error('Error fetching trip options:', error)
    }
  }, [trip])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trip || !voterName.trim()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          voter_name: voterName.trim(),
          trip_id: trip.id,
          destination_id: selectedDestination || null,
          date_id: selectedDate || null
        })

      if (error) throw error

      console.log('Vote successful, calling onVoteSuccess callback')
      
      // Call the success callback to refresh parent components
      onVoteSuccess?.()

      // Reset form and close modal
      setVoterName('')
      setSelectedDate('')
      setSelectedDestination('')
      
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose()
      }, 500)
      
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('Error submitting vote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen || !trip) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Vote on {trip.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-gray-600">Enter your name and select your preferred date and destination</p>

          {/* Voter Name */}
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Date Selection */}
          {dates.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Select a Date</h3>
              <div className="space-y-2">
                {dates.map((date) => (
                  <label
                    key={date.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedDate === date.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="date"
                        value={date.id}
                        checked={selectedDate === date.id}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mr-3 w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">{formatDate(date.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">{date.vote_count}</span>
                      <span className="text-xs text-gray-500">votes</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Destination Selection */}
          {destinations.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Select a Destination</h3>
              <div className="space-y-2">
                {destinations.map((destination) => (
                  <label
                    key={destination.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedDestination === destination.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="destination"
                        value={destination.id}
                        checked={selectedDestination === destination.id}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                        className="mr-3 w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">{destination.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">{destination.vote_count}</span>
                      <span className="text-xs text-gray-500">votes</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !voterName.trim()}
            className="w-full bg-gray-800 text-white py-3 rounded-md font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </form>
      </div>
    </div>
  )
}
