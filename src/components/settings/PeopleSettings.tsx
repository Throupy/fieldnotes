import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePages } from '../../contexts/PageContext';
import { setDbUrl, getDbUrl } from '../../services/db'

const PeopleSettings: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { pages = [] } = usePages();

  if (!currentWorkspace) return <p>No workspace selected</p>;

  const members = currentWorkspace.memberCount || [];
  const pageCount = pages.filter(p => p.workspaceId === currentWorkspace.id).length;
  const lastUpdated = pages
    .filter(p => p.workspaceId === currentWorkspace.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Workspace Info</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--bg-color)] p-4 rounded-lg shadow-sm border border-[var(--sidebar-border)]">
            <p className="text-sm font-medium text-[var(--text-color)] mb-1">
              Name
            </p>
            <p className="text-sm text-[var(--muted-text)]">
              {currentWorkspace.name}
            </p>
          </div>
          <div className="bg-[var(--bg-color)] p-4 rounded-lg shadow-sm border border-[var(--sidebar-border)]">
            <p className="text-sm font-medium text-[var(--text-color)] mb-1">
              Owned By
            </p>
            <p className="text-sm text-[var(--muted-text)]">
              {currentWorkspace.ownerUsername}
            </p>
          </div>
          <div className="bg-[var(--bg-color)] p-4 rounded-lg shadow-sm border border-[var(--sidebar-border)]">
            <p className="text-sm font-medium text-[var(--text-color)] mb-1">
              Member Count
            </p>
            <p className="text-sm text-[var(--muted-text)]">
              {currentWorkspace.members.length || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Workspace Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--sidebar-border)]">
            <p className="text-sm font-medium text-[var(--text-color)]">
              Pages
            </p>
            <p className="text-xl text-[var(--muted-text)] font-semibold">
              {pageCount}
            </p>
          </div>
          <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--sidebar-border)]">
            <p className="text-sm font-medium text-[var(--text-color)]">
              Last Updated
            </p>
            <p className="text-sm text-[var(--muted-text)]">
              {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Workspace Members</h3>
        <div className="grid grid-cols-3 gap-4">
          {currentWorkspace.members.map((member, index) => (
            <div
              key={index}
              className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--sidebar-border)]"
            >
              <p className="text-sm font-medium text-[var(--text-color)]">
                {member}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeopleSettings;