import React, { useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => void
}

const CreateWorkspaceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim().length > 15) {
      setError('Workspace name must be 15 characters or less.')
      return
    }
    if (inputValue.trim()) {
      onSubmit(inputValue)
      setInputValue('')
      setError('')
      onClose()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-color)] rounded-lg p-6 w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create new workspace</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Enter workspace name...'
            className="w-full p-2 border border-[var(--active-item)] rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--active-item)] focus:border-transparent"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="outline-[#3184de] outline-solid outline-1 px-4 py-2 rounded-md hover:bg-[#3184de] transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="outline-gray-300 outline-solid outline-1 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspaceModal