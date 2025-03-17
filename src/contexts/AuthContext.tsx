import React, { createContext, useContext, useState, useEffect } from 'react'
import { setWorkspace } from '../services/db'

type AuthContextType = {
  user: string | null
  workspaceIds: string[]
  currentWorkspaceId: string | null
  setCurrentWorkspaceId: (workspaceId: string) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null)
  const [workspaceIds, setWorkspaceIds] = useState<string[]>([])
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null)

  console.log("AuthProvider called")
  
  useEffect(() => {
    // Check if user is already logged in via cookie
    fetch('http://localhost:4000/login', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            setUser(data.name);
            setWorkspaceIds(data.workspaceIds);
            if (data.workspaceIds?.length > 0) {
                setCurrentWorkspaceId(data.workspaceIds[0]);
                // dont set workspace here - let pagecontext handle it.
                //console.log("Calling setWorkspace from useEffect in AuthProvider, setting value to ", data.workspaceIds[0]);
                //setWorkspace(data.workspaceIds[0]);
            }
        })
        .catch(() => {
            setUser(null);
            setWorkspaceIds([]);
            setCurrentWorkspaceId(null);
        });
  }, []);

  const login = async (username: string, password: string) => {
    try {
        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Login failed');
        const { workspaceIds } = await response.json();

        setUser(username);
        setWorkspaceIds(workspaceIds);
        if (workspaceIds?.length > 0) {
            setCurrentWorkspaceId(workspaceIds[0]);
            // dont set workspace here - let pagecontext handle it.
            //setWorkspace(workspaceIds[0]);
        }
        return true;
    } catch (err) {
        console.error('Login error:', err);
        return false;
    }
  };

  const logout = async () => {
    await fetch('http://localhost:4000/logout', { credentials: 'include' });
    setUser(null);
    setWorkspaceIds([]);
    setCurrentWorkspaceId(null);
  };

  const register = async (username: string, password: string) => {
    const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    return response.ok ? await login(username, password) : false;
  };

  return (
    <AuthContext.Provider value={{ user, workspaceIds, currentWorkspaceId, login, logout, register, setCurrentWorkspaceId }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider tags")
  return context
}