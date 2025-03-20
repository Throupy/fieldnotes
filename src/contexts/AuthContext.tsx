import React, { createContext, useContext, useState, useEffect } from 'react'
import { setWorkspace } from '../services/db'

type Workspace = {
  id: string,
  name?: string // got from backend, or derived from id
}

type AuthContextType = {
  user: string | null
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, password: string) => Promise<boolean>
  createWorkspace: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  console.log("AuthProvider called")
  
  useEffect(() => {
    // Check if user is already logged in via cookie
    fetch('http://localhost:4000/login', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            setUser(data.name);
            const workspaceList = data.workspaceIds.map((id: string) => ({
              id,
              name: idToName(id), // Derive name if backend doesn't provide it
            }));
            setWorkspaces(workspaceList);
            if (data.workspaceIds?.length > 0) {
                setCurrentWorkspace(workspaceList[0]);
                // dont set workspace here - let pagecontext handle it.
                //console.log("Calling setWorkspace from useEffect in AuthProvider, setting value to ", data.workspaceIds[0]);
                //setWorkspace(data.workspaceIds[0]);
            }
        })
        .catch(() => {
            setUser(null);
            setWorkspaces([]);
            setCurrentWorkspace(null);
        });
  }, []);

  const idToName = (id: string): string => {
    // workspace id -> name
    // workspace_owen_personal -> Personal
    const nameParts = id.split('_').slice(2);
    return nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };
  
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
        const workspaceList = workspaceIds.map((id: string) => ({
          id,
          name: idToName(id),
        }));
        setUser(username);
        setWorkspaces(workspaceList);
        if (workspaceList.length > 0) {
          setCurrentWorkspace(workspaceList[0]);
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
    setWorkspaces([]);
    setCurrentWorkspace(null);
  };

  const createWorkspace = async(name: string) => {
    try {
      const response = await fetch('http://localhost:4000/workspaces', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceName: name }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Workspace creation failed');
      }
      const { workspaceId, workspaceName } = await response.json();
      const newWorkspace = { id: workspaceId, name: workspaceName };
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      return true;
    } catch (err) {
      console.error("error creation workspace", err)
      return false
    }
  }

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
    <AuthContext.Provider
      value={{ user, workspaces, currentWorkspace, setCurrentWorkspace, login, logout, register, createWorkspace }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider tags")
  return context
}