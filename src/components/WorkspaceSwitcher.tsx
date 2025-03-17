import React from "react";
import { useAuth } from "../contexts/AuthContext";

const WorkspaceSwitcher: React.FC = () => {
  const { workspaceIds, currentWorkspaceId, setCurrentWorkspaceId } = useAuth();

  const handleWorkspaceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentWorkspaceId(event.target.value);
  };

  return (
    <div className="workspace-switcher">
      <label htmlFor="workspace-select" className="text-sm font-medium text-[var(--text-color)]">
        Workspace:
      </label>
      <select
        id="workspace-select"
        value={currentWorkspaceId || ""}
        onChange={handleWorkspaceChange}
        className="w-full p-2 mt-1 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)]"
      >
        {workspaceIds.map((workspaceId) => (
          <option key={workspaceId} value={workspaceId}>
            {workspaceId}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WorkspaceSwitcher;