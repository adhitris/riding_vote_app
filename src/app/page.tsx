'use client'

import { useState, useEffect } from 'react'
import { Trip } from '@/types'
import { supabase } from '@/lib/supabase'
import TripCard from '@/components/TripCard'
import VoteModal from '@/components/VoteModal'
import ResultsModal from '@/components/ResultsModal'
import CreateTripModal from '@/components/CreateTripModal'
import PasscodeModal from '@/components/PasscodeModal'

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)
  const [createTripModalOpen, setCreateTripModalOpen] = useState(false)
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'vote' | 'results' | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh key to force re-render

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get participant counts for each trip
      const tripsWithCounts = await Promise.all(
        (data || []).map(async (trip) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('voter_name')
            .eq('trip_id', trip.id)

          const uniqueParticipants = new Set(votes?.map(v => v.voter_name) || [])
          
          return {
            ...trip,
            participant_count: uniqueParticipants.size
          }
        })
      )

      setTrips(tripsWithCounts)
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId)
    if (trip) {
      setSelectedTrip(trip)
      setPendingAction('vote')
      setPasscodeModalOpen(true)
    }
  }

  const handleViewResults = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId)
    if (trip) {
      setSelectedTrip(trip)
      setPendingAction('results')
      setPasscodeModalOpen(true)
    }
  }

  const handleVoteSuccess = () => {
    console.log('handleVoteSuccess called, refreshing data...')
    fetchTrips() // Refresh trips data after successful vote
    setRefreshKey(prev => prev + 1) // Force re-render of TripCards
  }

  const handlePasscodeSuccess = (enteredPasscode: string) => {
    if (!selectedTrip) return
    
    // Verify passcode
    if (enteredPasscode !== selectedTrip.passcode) {
      alert('Invalid passcode. Please try again.')
      return
    }

    // Passcode is correct, proceed with the pending action
    setPasscodeModalOpen(false)
    
    if (pendingAction === 'vote') {
      setVoteModalOpen(true)
    } else if (pendingAction === 'results') {
      setResultsModalOpen(true)
    }
    
    setPendingAction(null)
  }

  const handleVoteModalClose = () => {
    setVoteModalOpen(false)
    setSelectedTrip(null)
  }

  const handleResultsModalClose = () => {
    setResultsModalOpen(false)
    setSelectedTrip(null)
  }

  const handleCreateTrip = () => {
    setCreateTripModalOpen(true)
  }

  const handleTripCreated = () => {
    fetchTrips() // Refresh trips list
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold">Riding Trip Vote App</h1>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              onClick={handleCreateTrip}
              className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Trip</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Plan and vote on your next riding adventure</h2>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-gray-400 mb-6">Create your first riding trip to start collecting votes from your group.</p>
            <button
              onClick={handleCreateTrip}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard
                key={`${trip.id}-${refreshKey}`}
                trip={trip}
                onVote={handleVote}
                onViewResults={handleViewResults}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <PasscodeModal
        isOpen={passcodeModalOpen}
        onClose={() => {
          setPasscodeModalOpen(false)
          setSelectedTrip(null)
          setPendingAction(null)
        }}
        onSuccess={handlePasscodeSuccess}
        tripTitle={selectedTrip?.title || ''}
      />

      <VoteModal
        isOpen={voteModalOpen}
        onClose={handleVoteModalClose}
        trip={selectedTrip}
        onVoteSuccess={handleVoteSuccess}
      />

      <ResultsModal
        isOpen={resultsModalOpen}
        onClose={handleResultsModalClose}
        trip={selectedTrip}
      />

      <CreateTripModal
        isOpen={createTripModalOpen}
        onClose={() => setCreateTripModalOpen(false)}
        onTripCreated={handleTripCreated}
      />
    </div>
  )
}
