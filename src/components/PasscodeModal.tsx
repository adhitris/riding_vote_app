'use client'

import { useState } from 'react'

interface PasscodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (passcode: string) => void
  tripTitle: string
}

export default function PasscodeModal({ isOpen, onClose, onSuccess, tripTitle }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim()) return

    setIsVerifying(true)
    setError('')

    try {
      // Pass the entered passcode to the parent component for verification
      onSuccess(passcode.trim())
      setPasscode('')
    } catch (error) {
      setError('Invalid passcode. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setPasscode('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Enter Passcode</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              Enter the passcode to access <strong>{tripTitle}</strong>
            </p>
            
            <div className="mb-4">
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                Passcode
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter trip passcode"
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !passcode.trim()}
              className="flex-1 bg-gray-800 text-white py-2 rounded-md font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Access Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
