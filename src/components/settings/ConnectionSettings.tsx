import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { setDbUrl, getDbUrl } from '../../services/db'

const ConnectionSettings: React.FC = () => {
  const { authUrl, setAuthUrl } = useAuth();
  const [localAuthUrl, setLocalAuthUrl] = useState(authUrl);
  const [localDbUrl, setLocalDbUrl] = useState(getDbUrl());

  const handleAuthUrlBlur = () => {
    setAuthUrl(localAuthUrl); // Update AuthContext
  };

  const handleDbUrlBlur = () => {
    setDbUrl(localDbUrl); // Update db.ts
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Connection Settings</h3>

        {/* Auth Server URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
            Auth Server URL
          </label>
          <input
            type="text"
            spellCheck="false"
            placeholder="e.g. http://your-server:4000"
            value={localAuthUrl}
            onChange={(e) => setLocalAuthUrl(e.target.value)}
            onBlur={handleAuthUrlBlur}
            className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
          />
          <p className="text-sm text-[var(--muted-text)] mt-1">
            The URL of your self-hosted authentication server.
          </p>
        </div>

        {/* Database Server URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
            Database Server URL
          </label>
          <input
            type="text"
            spellCheck="false"
            placeholder="e.g. http://your-server:5984"
            value={localDbUrl}
            onChange={(e) => setLocalDbUrl(e.target.value)}
            onBlur={handleDbUrlBlur}
            className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
          />
          <p className="text-sm text-[var(--muted-text)] mt-1">
            The base URL of your CouchDB instance (without workspace ID).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSettings;