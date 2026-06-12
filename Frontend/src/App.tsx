import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('')
  const [health, setHealth] = useState<string>('')

  useEffect(() => {
    // Test API connection
    fetch('/api/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('API Error:', err))

    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(err => console.error('Health check error:', err))
  }, [])

  return (
    <div className="App">
      <h1>NaniGo</h1>
      <div className="card">
        <p>Backend API: {message || 'Loading...'}</p>
        <p>Health Status: {health || 'Checking...'}</p>
      </div>
    </div>
  )
}

export default App
