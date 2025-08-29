'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CreateTripModalProps {
  isOpen: boolean
  onClose: () => void
  onTripCreated: () => void
}

export default function CreateTripModal({ isOpen, onClose, onTripCreated }: CreateTripModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passcode, setPasscode] = useState('')
  const [destinations, setDestinations] = useState<string[]>([''])
  const [dates, setDates] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addDestination = () => {
    setDestinations([...destinations, ''])
  }

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index))
    }
  }

  const updateDestination = (index: number, value: string) => {
    const updated = [...destinations]
    updated[index] = value
    setDestinations(updated)
  }

  const addDate = () => {
    setDates([...dates, ''])
  }

  const removeDate = (index: number) => {
    if (dates.length > 1) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }

  const updateDate = (index: number, value: string) => {
    const updated = [...dates]
    updated[index] = value
    setDates(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      // Create trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          passcode: passcode.trim(),
          status: 'planning'
        })
        .select()
        .single()

      if (tripError) throw tripError

      // Create destinations
      const validDestinations = destinations.filter(d => d.trim())
      if (validDestinations.length > 0) {
        const { error: destError } = await supabase
          .from('destinations')
          .insert(
            validDestinations.map(name => ({
              trip_id: trip.id,
              name: name.trim()
            }))
          )

        if (destError) throw destError
      }

      // Create dates
      const validDates = dates.filter(d => d.trim())
      if (validDates.length > 0) {
        const { error: dateError } = await supabase
          .from('riding_dates')
          .insert(
            validDates.map(date => ({
              trip_id: trip.id,
              date: date.trim()
            }))
          )

        if (dateError) throw dateError
      }

      // Reset form and close modal
      setTitle('')
      setDescription('')
      setPasscode('')
      setDestinations([''])
      setDates([''])
      onTripCreated()
      onClose()
    } catch (error) {
      console.error('Error creating trip:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setPasscode('')
    setDestinations([''])
    setDates([''])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Trip Details</h2>
          <p className="text-gray-400 mt-1">Create a new riding trip and add options for dates and destinations that people can vote on</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Trip Title</label>
            <input
              type="text"
              placeholder="e.g., Mountain Bike Adventure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Describe your riding trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-sm font-medium mb-2">Trip Passcode</label>
            <input
              type="text"
              placeholder="e.g., RIDE2025 (required for members to vote)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
            <p className="text-gray-400 text-sm mt-1">Members will need this passcode to vote on this trip</p>
          </div>

          {/* Date Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Date Options</label>
              <button
                type="button"
                onClick={addDate}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Date
              </button>
            </div>
            <div className="space-y-2">
              {dates.map((date, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => updateDate(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                  {dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Destination Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Destination Options</label>
              <button
                type="button"
                onClick={addDestination}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Destination
              </button>
            </div>
            <div className="space-y-2">
              {destinations.map((destination, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., Blue Ridge Mountains"
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                  {destinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 bg-white text-gray-900 py-3 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-md font-medium hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
