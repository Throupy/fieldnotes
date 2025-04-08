import React, { createContext, useContext, useState, useEffect } from 'react';
import { setWorkspace } from '../services/db';
import { Workspace } from '../types';

type RegisterInput = {
  email: string;
  username: string;
  password: string;
  profilePic?: File | null;
};

type User = {
  username: string;
  email: string;
  ownedWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  profilePicture?: string;
};

type UpdateProfileInput = {
  email?: string;
  password?: string;
  currentPassword?: string;
  profilePic?: File;
};

type AuthContextType = {
  user: User | null;
  ownedWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  currentWorkspace: Workspace | null;
  authUrl: string;
  setCurrentWorkspace: (workspace: Workspace) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (input: RegisterInput) => Promise<boolean>;
  createWorkspace: (name: string) => Promise<boolean>;
  updateProfile: (updates: UpdateProfileInput) => Promise<boolean>;
  setAuthUrl: (url: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [authUrl, setAuthUrl] = useState(() => localStorage.getItem('authUrl') || 'http://localhost:4001');

  const getWorkspaceById = async (authUrl: string, id: string) => {
    const res = await fetch(`${authUrl}/workspaces/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch workspace: ${id}`);
    return await res.json();
  };

  const updateAuthUrl = (url: string) => {
    if (!url.match(/^https?:\/\//)) {
      url = `http://${url}`;
    }
    localStorage.setItem('authUrl', url);
    setAuthUrl(url);
  };

  const fetchFullWorkspaces = async (workspaceIds: string[]): Promise<Workspace[]> => {
    return await Promise.all(
      workspaceIds.map(id => getWorkspaceById(authUrl, id))
    );
  };

  useEffect(() => {
    // Restore session if AuthSession cookie exists
    fetch(`${authUrl}/session`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(async data => {
        const owned = await fetchFullWorkspaces(data.ownedWorkspaceIds || []);
        const shared = await fetchFullWorkspaces(data.sharedWorkspaceIds || []);

        const fullUser: User = {
          username: data.username,
          email: data.email,
          ownedWorkspaces: owned,
          sharedWorkspaces: shared,
          profilePicture: data.profilePicture,
        };

        setUser(fullUser);
        setOwnedWorkspaces(owned);
        setSharedWorkspaces(shared);
        setCurrentWorkspace(owned[0] || shared[0] || null);
      })
      .catch(() => {
        setUser(null);
        setOwnedWorkspaces([]);
        setSharedWorkspaces([]);
        setCurrentWorkspace(null);
      });
  }, [authUrl]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Login failed');
      const { email, username: userName, profilePicture, ownedWorkspaceIds, sharedWorkspaceIds } = await response.json();

      const owned = await fetchFullWorkspaces(ownedWorkspaceIds || []);
      const shared = await fetchFullWorkspaces(sharedWorkspaceIds || []);

      const userObj: User = {
        username: userName,
        email,
        ownedWorkspaces: owned,
        sharedWorkspaces: shared,
        profilePicture,
      };

      setUser(userObj);
      setOwnedWorkspaces(owned);
      setSharedWorkspaces(shared);
      setCurrentWorkspace(owned[0] || shared[0] || null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${authUrl}/logout`, { credentials: 'include' });
    setUser(null);
    setOwnedWorkspaces([]);
    setSharedWorkspaces([]);
    setCurrentWorkspace(null);
  };

  const register = async ({ email, username, password, profilePic }: RegisterInput) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }

    const response = await fetch(`${authUrl}/register`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    return response.ok ? await login(username, password) : false;
  };

  const createWorkspace = async (name: string) => {
    try {
      const response = await fetch(`${authUrl}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceName: name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Workspace creation failed');
      }

      const { workspace } = await response.json();
      const newWorkspace: Workspace = { ...workspace };

      setOwnedWorkspaces(prev => [...prev, newWorkspace]);
      setUser(prev => prev ? { ...prev, ownedWorkspaces: [...prev.ownedWorkspaces, newWorkspace] } : prev);
      setCurrentWorkspace(newWorkspace);
      return true;
    } catch (err) {
      console.error("Error creating workspace", err);
      return false;
    }
  };

  const updateProfile = async ({ email, password, currentPassword, profilePic }: UpdateProfileInput) => {
    if (!user) return false;

    try {
      const formData = new FormData();
      if (email) formData.append('email', email);
      if (password && currentPassword) {
        formData.append('password', password);
        formData.append('currentPassword', currentPassword);
      }
      if (profilePic) formData.append('profilePic', profilePic);

      const response = await fetch(`${authUrl}/update-profile`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Update failed');
      const updated = await response.json();

      setUser(prev => prev ? {
        ...prev,
        email: updated.email || prev.email,
        profilePicture: updated.profilePicture || prev.profilePicture
      } : null);

      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      return false;
    }
  };

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
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};
