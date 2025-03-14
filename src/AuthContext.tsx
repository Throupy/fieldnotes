import React, { createContext, useContext, useState, useEffect } from 'react'

type AuthContextType = {
  user: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null)
  console.log("AuthProvider called")
  
  useEffect(() => {
    const token = sessionStorage.getItem('jwt')
    if (token) {
      fetch('http://localhost:4000/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => response.json())
        .then((data) => setUser(data.username))
        .catch(() => sessionStorage.removeItem('jwt'))
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) throw new Error('Login failed')
      
      const { token } = await response.json()
      sessionStorage.setItem('jwt', token)
      setUser(username)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const logout = () => {
    sessionStorage.removeItem('jwt')
    setUser(null)
  }

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      return response.ok ? await login(username, password) : false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider tags")
  return context
}