import { useState } from 'react'
import Chat from './components/Chat'
import FileUpload from './components/FileUpload'
import './App.css'

function App() {
  const [token, setToken] = useState("");

  return (
    <div className="app-wrapper">
      <div className="config-header glass-card">
        <input
          type="text"
          placeholder="Paste JWT Token here..."
          value={token}
          onChange={(e) => setToken(e.target.value.trim().replace(/^['"]|['"]$/g, ''))}
          className="token-input"
        />
      </div>
      
      <main className="main-content">
        <aside className="sidebar">
          <FileUpload token={token} />
        </aside>
        
        <section className="chat-area">
          <Chat token={token} />
        </section>
      </main>
    </div>
  )
}

export default App
