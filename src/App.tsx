import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface HealthResponse {
  status: string
  timestamp: string
  dbRow: {
    id: string
    message: string
    createdAt: string
  } | null
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Prestamos</h1>
        {error && <p className="text-red-500">Error: {error}</p>}
        {health && (
          <div className="mt-4 p-4 bg-white rounded shadow">
            <p className="text-green-600">Status: {health.status}</p>
            <p className="text-gray-600 text-sm">DB: {health.dbRow?.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
