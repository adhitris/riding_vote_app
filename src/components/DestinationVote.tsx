'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Destination } from '@/types'

interface DestinationVoteProps {
  onVote: (destinationId: string) => void
  selectedDestination?: string
}

export default function DestinationVote({ onVote, selectedDestination }: DestinationVoteProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [newDestination, setNewDestination] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setDestinations(data || [])
    } catch (error) {
      console.error('Error fetching destinations:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDestination.trim()) return

    try {
      const { data, error } = await supabase
        .from('destinations')
        .insert({
          name: newDestination.trim(),
          description: newDescription.trim() || null
        })
        .select()

      if (error) throw error
      
      setDestinations([...destinations, data[0]])
      setNewDestination('')
      setNewDescription('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding destination:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading destinations...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pilih Destinasi</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? 'Batal' : 'Tambah Destinasi'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addDestination} className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <input
              type="text"
              placeholder="Nama destinasi"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Deskripsi (opsional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Tambah
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            onClick={() => onVote(destination.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedDestination === destination.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-medium">{destination.name}</h3>
            {destination.description && (
              <p className="text-sm text-gray-600 mt-1">{destination.description}</p>
            )}
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Belum ada destinasi. Tambahkan destinasi pertama!
        </div>
      )}
    </div>
  )
}
