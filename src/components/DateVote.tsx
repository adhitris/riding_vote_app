'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RidingDate } from '@/types'

interface DateVoteProps {
  onVote: (dateId: string) => void
  selectedDate?: string
}

export default function DateVote({ onVote, selectedDate }: DateVoteProps) {
  const [ridingDates, setRidingDates] = useState<RidingDate[]>([])
  const [loading, setLoading] = useState(true)
  const [newDate, setNewDate] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchDates()
  }, [])

  const fetchDates = async () => {
    try {
      const { data, error } = await supabase
        .from('riding_dates')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setRidingDates(data || [])
    } catch (error) {
      console.error('Error fetching dates:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate.trim()) return

    try {
      const { data, error } = await supabase
        .from('riding_dates')
        .insert({
          date: newDate,
          description: newDescription.trim() || null
        })
        .select()

      if (error) throw error
      
      setRidingDates([...ridingDates, data[0]])
      setNewDate('')
      setNewDescription('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding date:', error)
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
    return <div className="text-center py-4">Loading dates...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pilih Tanggal</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? 'Batal' : 'Tambah Tanggal'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addDate} className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
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
        {ridingDates.map((ridingDate) => (
          <div
            key={ridingDate.id}
            onClick={() => onVote(ridingDate.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedDate === ridingDate.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-medium">{formatDate(ridingDate.date)}</h3>
            {ridingDate.description && (
              <p className="text-sm text-gray-600 mt-1">{ridingDate.description}</p>
            )}
          </div>
        ))}
      </div>

      {ridingDates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Belum ada tanggal. Tambahkan tanggal pertama!
        </div>
      )}
    </div>
  )
}
