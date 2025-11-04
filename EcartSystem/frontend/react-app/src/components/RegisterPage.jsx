import { useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../state/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    try {
      const res = await api.register(email, name)
      if (res.success) {
        setMessage('Registration successful! Logging you in...')
        const success = await login(email)
        if (success) {
          navigate('/')
        } else {
          setError('Registration successful, but automatic login failed.')
        }
      } else {
        setError(res.message || 'Registration failed.')
      }
    } catch (e) {
      console.error('Registration failed:', e)
      setError(e.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
        <button
          type="submit"
          className="w-full btn"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Login here</a>
      </p>
    </div>
  )
}