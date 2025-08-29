'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { VoteSummary } from '@/types'

export default function VoteResults() {
  const [results, setResults] = useState<VoteSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      // Get destination votes
      const { data: destinationVotes, error: destError } = await supabase
        .from('votes')
        .select(`
          destination_id,
          destinations (
            id,
            name,
            description,
            created_at
          )
        `)
        .not('destination_id', 'is', null)

      if (destError) throw destError

      // Get date votes
      const { data: dateVotes, error: dateError } = await supabase
        .from('votes')
        .select(`
          date_id,
          riding_dates (
            id,
            date,
            description,
            created_at
          )
        `)
        .not('date_id', 'is', null)

      if (dateError) throw dateError

      // Process destination results
      const destinationCounts = new Map()
      destinationVotes?.forEach((vote: any) => {
        if (vote.destinations) {
          const dest = vote.destinations
          const current = destinationCounts.get(dest.id) || { destination: dest, vote_count: 0 }
          destinationCounts.set(dest.id, { ...current, vote_count: current.vote_count + 1 })
        }
      })

      // Process date results
      const dateCounts = new Map()
      dateVotes?.forEach((vote: any) => {
        if (vote.riding_dates) {
          const date = vote.riding_dates
          const current = dateCounts.get(date.id) || { date: date, vote_count: 0 }
          dateCounts.set(date.id, { ...current, vote_count: current.vote_count + 1 })
        }
      })

      const summary: VoteSummary = {
        destinations: Array.from(destinationCounts.values()).sort((a, b) => b.vote_count - a.vote_count),
        dates: Array.from(dateCounts.values()).sort((a, b) => b.vote_count - a.vote_count)
      }

      setResults(summary)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-4">Loading results...</div>
  }

  if (!results) {
    return <div className="text-center py-4">No results available</div>
  }

  const totalDestinationVotes = results.destinations.reduce((sum, item) => sum + item.vote_count, 0)
  const totalDateVotes = results.dates.reduce((sum, item) => sum + item.vote_count, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Hasil Voting</h2>
      
      {/* Destination Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Destinasi</h3>
        {results.destinations.length > 0 ? (
          <div className="space-y-2">
            {results.destinations.map((item, index) => {
              const percentage = totalDestinationVotes > 0 ? (item.vote_count / totalDestinationVotes * 100) : 0
              return (
                <div key={item.destination.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {index === 0 && '🏆 '}
                      {item.destination.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.vote_count} vote{item.vote_count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {item.destination.description && (
                    <p className="text-sm text-gray-600 mt-2">{item.destination.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500">Belum ada vote untuk destinasi</p>
        )}
      </div>

      {/* Date Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tanggal</h3>
        {results.dates.length > 0 ? (
          <div className="space-y-2">
            {results.dates.map((item, index) => {
              const percentage = totalDateVotes > 0 ? (item.vote_count / totalDateVotes * 100) : 0
              return (
                <div key={item.date.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {index === 0 && '🏆 '}
                      {formatDate(item.date.date)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.vote_count} vote{item.vote_count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {item.date.description && (
                    <p className="text-sm text-gray-600 mt-2">{item.date.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500">Belum ada vote untuk tanggal</p>
        )}
      </div>

      <button
        onClick={fetchResults}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Refresh Results
      </button>
    </div>
  )
}
