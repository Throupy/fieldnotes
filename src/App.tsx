import { useAuth } from "./contexts/AuthContext"
import Login from "./components/Login"
import Sidebar from "./components/Sidebar"
import PageEditor from "./components/PageEditor"
import { useEffect, useState } from "react"
import { PageProvider } from "./contexts/PageContext"

const App = () => {
  const { user, authUrl, setAuthUrl } = useAuth()
  const [authReachable, setAuthReachable] = useState<boolean | null>(null)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [tempAuthUrl, setTempAuthUrl] = useState(authUrl)

  useEffect(() => {
    setTempAuthUrl(authUrl)
  }, [authUrl])

  const checkAuthReachable = async (url: string) => {
    try {
      const response = await window.electronAuth.isAuthReachable(url)
      setAuthReachable(response)
    } catch (error) {
      console.error("Error checking auth reachability:", error)
      setAuthReachable(false)
    }
  }

  const handleSave = async () => {
    setAuthReachable(null)
    const isReachable = await checkAuthReachable(tempAuthUrl)
    if (isReachable) {
      setAuthUrl(tempAuthUrl)
      setIsEditingUrl(false)
    }
  }

  useEffect(() => {
    checkAuthReachable(authUrl) 
  }, [authUrl])


  useEffect(() => {
    const handleZoom = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return
      if (e.key === '=') {
        window.electronZoom.zoomIn()
        e.preventDefault()
      } else if (e.key === '-') {
        window.electronZoom.zoomOut()
        e.preventDefault()
      } else if (e.key === '0') {
        window.electronZoom.resetZoom()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleZoom)
    return () => window.removeEventListener('keydown', handleZoom)
  }, [])

  if (authReachable === false || isEditingUrl) {
    return (
      <div className="text-center p-8">
        {authReachable === false && !isEditingUrl && (
          <p>🚫 Cannot reach authentication server. Please check your connection or update the URL.</p>
        )}
        {authReachable === false && isEditingUrl && (
          <p>🚫 Server not reachable. Please enter a valid URL.</p>
        )}
        <div className="mt-4">
          <input
            type="text"
            value={tempAuthUrl}
            onChange={(e) => setTempAuthUrl(e.target.value)}
            placeholder="Enter auth server URL (e.g., http://localhost:4001)"
            className="border p-2 rounded w-64"
          />
          <button
            onClick={handleSave}
            className="ml-2 bg-blue-500 text-white p-2 rounded"
          >
            Save
          </button>
          {isEditingUrl && (
            <button
              onClick={() => {
                setIsEditingUrl(false)
                setTempAuthUrl(authUrl)
                setAuthReachable(null)
              }}
              className="ml-2 bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  if (authReachable === null) {
    return <div className="text-center p-8">⏳ Checking server availability...</div>
  }

  return user ? (
    <PageProvider>
      <div className="app-container">
        <Sidebar />
        <div className="page-editor">
          <PageEditor />
        </div>
      </div>
    </PageProvider>
  ) : (
    <Login />
  )
}

export default App