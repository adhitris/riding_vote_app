'use client'

import { useState } from 'react'
import DestinationVote from '@/components/DestinationVote'
import DateVote from '@/components/DateVote'
import VoteResults from '@/components/VoteResults'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'vote' | 'results'>('vote')
  const [voterName, setVoterName] = useState('')
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmitVote = async () => {
    if (!voterName.trim()) {
      setMessage('Masukkan nama Anda')
      return
    }

    if (!selectedDestination && !selectedDate) {
      setMessage('Pilih minimal satu (destinasi atau tanggal)')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          voter_name: voterName.trim(),
          destination_id: selectedDestination || null,
          date_id: selectedDate || null
        })

      if (error) throw error

      setMessage('Vote berhasil disimpan!')
      setVoterName('')
      setSelectedDestination('')
      setSelectedDate('')
      
      // Auto switch to results after successful vote
      setTimeout(() => {
        setActiveTab('results')
        setMessage('')
      }, 2000)
    } catch (error) {
      console.error('Error submitting vote:', error)
      setMessage('Gagal menyimpan vote. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏍️ Riding Trip Voting</h1>
          <p className="text-gray-600">Vote untuk destinasi dan tanggal riding trip favorit Anda</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab('vote')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'vote'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Vote
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Hasil
          </button>
        </div>

        {/* Content */}
        {activeTab === 'vote' ? (
          <div className="space-y-6">
            {/* Voter Name Input */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Anda
              </label>
              <input
                id="voterName"
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Voting Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Destination Vote */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <DestinationVote
                  onVote={setSelectedDestination}
                  selectedDestination={selectedDestination}
                />
              </div>

              {/* Date Vote */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <DateVote
                  onVote={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center space-y-4">
                {message && (
                  <div className={`text-center p-3 rounded ${
                    message.includes('berhasil') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}
                
                <button
                  onClick={handleSubmitVote}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Submit Vote'}
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  Anda dapat memilih destinasi saja, tanggal saja, atau keduanya
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <VoteResults />
          </div>
        )}
      </div>
    </div>
  )
}
