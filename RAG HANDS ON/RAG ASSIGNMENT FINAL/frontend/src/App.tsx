import { useState, useEffect } from 'react'
import Chat from './components/Chat'
import FileUpload from './components/FileUpload'
import Login from './components/Login'
import './App.css'

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  // Show login screen if not authenticated
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      <div className="config-header glass-card">
        <div className="header-left">
          <span className="brand-icon">🧠</span>
          <span className="brand-name gradient-text">DocuMind</span>
        </div>
        <div className="header-right">
          <span className="user-badge">👤 {username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
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
