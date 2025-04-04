import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePages } from '../../contexts/PageContext';
import { setDbUrl, getDbUrl } from '../../services/db'

const GeneralSettings: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { pages = [] } = usePages();
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');


  if (!currentWorkspace) return <p>No workspace selected</p>;

  return (
    <div className="space-y-8">
      <h3 className="text-lg mb-4">Workspace Settings</h3>

      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--text-color)]">
          Name
        </label>
        <input
          type="text"
          placeholder="Enter your workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full p-2 bg-[var(--bg-color)] border border-[var(--sidebar-border)] rounded-md sm:text-sm"
        />
        <p className="text-sm text-[var(--muted-text)] mt-1">
          You can use your organization or company name. Keep it simple.
        </p>
      </div>

      <div>
        <div className="flex items-center space-x-3">
          <span className="block text-sm font-medium mb-1 text-[var(--text-color)]">
            Icon
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
              Coming soon
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-[var(--muted-text)]">
            Upload an image or pick an emoji. It will show up in your sidebar and
            notifications.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-3">
          <span className="block text-sm font-medium text-[var(--text-color)]">
            Export content
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
            Coming soon
          </span>
        </div>
        <p className="text-sm text-[var(--muted-text)] mt-1 mb-3">
          Export all your workspace content. This will include all pages.
        </p>

        <button
          className="bg-[var(--bg-color)] shadow-md border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm"
        >
          Export all workspace content
        </button>
      </div>

      <div className="flex justify-start space-x-2">
        <button
          className="outline-[#3184de] outline-solid outline-1 px-4 py-2 rounded-md hover:bg-[#3184de] transition-colors"
        >
          Update
        </button>
        <button
          className="px-4 py-2 text-[var(--text-color)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;