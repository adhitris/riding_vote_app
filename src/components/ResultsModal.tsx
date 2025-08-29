'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trip } from '@/types'
import { supabase } from '@/lib/supabase'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
}

interface VoteResult {
  id: string
  name: string
  vote_count: number
  voters: string[]
  type: 'date' | 'destination'
}

export default function ResultsModal({ isOpen, onClose, trip }: ResultsModalProps) {
  const [dateResults, setDateResults] = useState<VoteResult[]>([])
  const [destinationResults, setDestinationResults] = useState<VoteResult[]>([])
  const [loading, setLoading] = useState(false)

  const fetchResults = useCallback(async () => {
    if (!trip) return

    setLoading(true)
    try {
      // Fetch destination votes
      const { data: destinationVotes, error: destError } = await supabase
        .from('votes')
        .select(`
          destination_id,
          voter_name,
          destinations (
            id,
            name
          )
        `)
        .eq('trip_id', trip.id)
        .not('destination_id', 'is', null)

      if (destError) throw destError

      // Fetch date votes
      const { data: dateVotes, error: dateError } = await supabase
        .from('votes')
        .select(`
          date_id,
          voter_name,
          riding_dates (
            id,
            date
          )
        `)
        .eq('trip_id', trip.id)
        .not('date_id', 'is', null)

      if (dateError) throw dateError

      // Process destination results
      const destMap = new Map<string, VoteResult>()
      destinationVotes?.forEach((vote: {destinations: {id: string, name: string}[], voter_name: string}) => {
        if (vote.destinations && vote.destinations.length > 0) {
          const dest = vote.destinations[0] // Take the first destination
          const existing = destMap.get(dest.id) || {
            id: dest.id,
            name: dest.name,
            vote_count: 0,
            voters: [] as string[],
            type: 'destination' as const
          }
          existing.vote_count++
          existing.voters.push(vote.voter_name)
          destMap.set(dest.id, existing)
        }
      })

      // Process date results
      const dateMap = new Map<string, VoteResult>()
      dateVotes?.forEach((vote: {riding_dates: {id: string, date: string}[], voter_name: string}) => {
        if (vote.riding_dates && vote.riding_dates.length > 0) {
          const date = vote.riding_dates[0] // Take the first date
          const existing = dateMap.get(date.id) || {
            id: date.id,
            name: formatDate(date.date),
            vote_count: 0,
            voters: [] as string[],
            type: 'date' as const
          }
          existing.vote_count++
          existing.voters.push(vote.voter_name)
          dateMap.set(date.id, existing)
        }
      })

      setDestinationResults(Array.from(destMap.values()).sort((a, b) => b.vote_count - a.vote_count))
      setDateResults(Array.from(dateMap.values()).sort((a, b) => b.vote_count - a.vote_count))
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }, [trip])

  useEffect(() => {
    if (trip && isOpen) {
      fetchResults()
    }
  }, [trip, isOpen, fetchResults])

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
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{trip.title} - Voting Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading results...</div>
            </div>
          ) : (
            <>
              <p className="text-gray-600">Current voting status</p>

              {/* Date Votes */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Date Votes</h3>
                {dateResults.length > 0 ? (
                  <div className="space-y-2">
                    {dateResults.map((result, index) => {
                      const totalDateVotes = dateResults.reduce((sum, r) => sum + r.vote_count, 0)
                      const percentage = totalDateVotes > 0 ? (result.vote_count / totalDateVotes * 100) : 0
                      const isWinning = index === 0 && result.vote_count > 0
                      
                      return (
                        <div key={result.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                              {isWinning && '🏆 '}{result.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{result.vote_count}</span>
                              <span className="text-sm text-gray-500">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isWinning ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {result.voters.join(', ')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No date votes yet</p>
                )}
              </div>

              {/* Destination Votes */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Destination Votes</h3>
                {destinationResults.length > 0 ? (
                  <div className="space-y-2">
                    {destinationResults.map((result, index) => {
                      const totalDestVotes = destinationResults.reduce((sum, r) => sum + r.vote_count, 0)
                      const percentage = totalDestVotes > 0 ? (result.vote_count / totalDestVotes * 100) : 0
                      const isWinning = index === 0 && result.vote_count > 0
                      
                      return (
                        <div key={result.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                              {isWinning && '🏆 '}{result.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{result.vote_count}</span>
                              <span className="text-sm text-gray-500">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isWinning ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {result.voters.join(', ')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No destination votes yet</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
