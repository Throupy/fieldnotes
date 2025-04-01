import React, { createContext, useContext, useState, useEffect } from 'react'
import { setWorkspace } from '../services/db'

type OwnedWorkspace = {
  workspaceId: string,
  ownerUsername: string,
  memberCount: number,
  name?: string // derive from id or get from backend
}

type SharedWorkspace = {
  workspaceId: string,
  ownerUsername: string,
  name?: string // derive from id or get from backend
}

type RegisterInput = {
  email: string,
  username: string,
  password: string,
  profilePic?: File | null
}

type User = {
  username: string;
  email: string;
  ownedWorkspaces: OwnedWorkspace[];
  sharedWorkspaces: SharedWorkspace[];
  profilePicture?: string;
};

type UpdateProfileInput = {
  email?: string;
  password?: string;
  currentPassword?: string;
  profilePic?: File;
}

type AuthContextType = {
  user: User | null
  ownedWorkspaces: OwnedWorkspace[],
  sharedWorkspaces: SharedWorkspace[],
  currentWorkspace: OwnedWorkspace | SharedWorkspace | null
  authUrl: string
  setCurrentWorkspace: (workspace: OwnedWorkspace | SharedWorkspace) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: ({email, username, password, profilePic}: RegisterInput) => Promise<boolean>
  createWorkspace: (name: string) => Promise<boolean>;
  updateProfile: (updates: UpdateProfileInput) => Promise<boolean>
  setAuthUrl: (url: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<OwnedWorkspace[]>([])
  const [sharedWorkspaces, setSharedWorkspaces] = useState<SharedWorkspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<OwnedWorkspace | SharedWorkspace | null>(null);
  const [authUrl, setAuthUrl] = useState(() => {
    // Load from localStorage, fallback to a default
    return localStorage.getItem('authUrl') || 'http://localhost:4000';
  });

  console.log("AuthProvider called")
  
  const updateAuthUrl = (url: string) => {
    if (!url.match(/^https?:\/\//)) {
      url = `http://${url}`;
    }
    localStorage.setItem('authUrl', url);
    setAuthUrl(url);
  };

  useEffect(() => {
    // Check if user is already logged in via cookie
    fetch(`${authUrl}/login`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          const owned = (data.ownedWorkspaces || []).map((ws: OwnedWorkspace) => ({
            ...WSH,
            name: idToName(ws.workspaceId) // Derive name if backend doesn't provide it
          }))
          const shared = (data.sharedWorkspaces || []).map((ws: SharedWorkspace) => ({
            ...ws,
            name: idToName(ws.workspaceId) // Derive name if backend doesn't provide it
          }))
          setUser({
            username: data.name,
            email: data.email,
            ownedWorkspaces: owned,
            sharedWorkspaces: shared,
            profilePicture: data.profilePicture
          })
          setOwnedWorkspaces(owned)
          setSharedWorkspaces(shared)

          if (owned.length > 0) {
            setCurrentWorkspace(owned[0])
          } else if (shared.length > 0) {
            setCurrentWorkspace(shared[0])
          }
        })
        .catch(() => {
            setUser(null);
            setOwnedWorkspaces([]);
            setSharedWorkspaces([])
            setCurrentWorkspace(null);
        });
  }, [authUrl]);

  const idToName = (id: string): string => {
    // workspace id -> name
    // workspace_owen_personal -> Personal
    const nameParts = id.split('_').slice(2);
    return nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };
  
  const login = async (_username: string, password: string) => {
    try {
        const response = await fetch(`${authUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: _username, password }),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Login failed');
        const {
          username: userName,
          email,
          ownedWorkspaces: owned,
          sharedWorkspaces: shared,
          profilePicture
        } = await response.json();

        const ownedList = owned.map((ws: OwnedWorkspace) => ({
          ...ws,
          name: idToName(ws.workspaceId) // Derive name if backend doesn't provide it
        }))
        const sharedList = shared.map((ws: SharedWorkspace) => ({
          ...ws,
          name: idToName(ws.workspaceId) // Derive name if backend doesn't provide it
        }))
        setUser({
          username: userName,
          email,
          ownedWorkspaces: ownedList,
          sharedWorkspaces: sharedList,
          profilePicture
        })
        setOwnedWorkspaces(ownedList)
        setSharedWorkspaces(sharedList)
        if (ownedList.length > 0) {
          setCurrentWorkspace(ownedList[0])
        } else if (sharedList.length > 0) {
          setCurrentWorkspace(sharedList[0])
        }
        return true;
    } catch (err) {
        console.error('Login error:', err);
        return false;
    }
  };

  const logout = async () => {
    await fetch(`${authUrl}/logout`, { credentials: 'include' });
    setUser(null);
    setOwnedWorkspaces([])
    setSharedWorkspaces([])
    setCurrentWorkspace(null);
  };

  const createWorkspace = async(name: string) => {
    try {
      const response = await fetch(`${authUrl}/workspaces`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceName: name }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Workspace creation failed');
      }

      const { workspace } = await response.json()
      const newWorkspace: OwnedWorkspace = {
        ...workspace,
        name: name
      }
      setOwnedWorkspaces(prev => [...prev, newWorkspace])
      setUser(prev => prev ? { ...prev, ownedWorkspaces: [...prev.ownedWorkspaces, newWorkspace] } : prev)
      setCurrentWorkspace(newWorkspace)
      return true;
    } catch (err) {
      console.error("error creation workspace", err)
      return false
    }
  }

  const register = async ({ email, username, password, profilePic }: RegisterInput) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('username', username)
    formData.append('password', password)
    if (profilePic) {
      formData.append('profilePic', profilePic)
    }

    const response = await fetch(`${authUrl}/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return response.ok ? await login(username, password) : false;
  };

  const updateProfile = async({ email, password, currentPassword, profilePic }: UpdateProfileInput) => {
    if (!user) return false

    try {
      const formData = new FormData()
      if (email) formData.append('email', email)
      if (password && currentPassword) {
        formData.append('password', password)
        formData.append('currentPassword', currentPassword)
      }
      if (profilePic) formData.append('profilePic', profilePic)

      const response = await fetch(`${authUrl}/update-profile`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedData = await response.json();
      setUser(prev => ({
        ...prev!,
        email: updatedData.email || prev!.email,
        profilePicture: updatedData.profilePicture || prev!.profilePicture
      }))
      return true
    } catch (err) {
      console.error("Profile update error: ", err)
      return false
    }
  }

  return (
    <AuthContext.Provider
    value={{
      user,
      ownedWorkspaces,
      sharedWorkspaces,
      currentWorkspace,
      setCurrentWorkspace,
      login,
      logout,
      register,
      createWorkspace,
      updateProfile,
      authUrl,
      setAuthUrl: updateAuthUrl,
    }}
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