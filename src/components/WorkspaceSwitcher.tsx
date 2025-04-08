import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePages } from '../contexts/PageContext';
import { FaChevronDown, FaGears, FaUserPlus, FaPenToSquare } from 'react-icons/fa6';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import InviteUserModal from './InviteUserModal';

const WorkspaceSwitcher: React.FC = () => {
  const { addPage } = usePages();
  const {
    ownedWorkspaces,
    sharedWorkspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    logout,
    authUrl,
  } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleCreateWorkspace = async (name: string) => {
    const success = await createWorkspace(name);
    if (success) setIsCreateModalOpen(false);
  };

  const handleInviteUser = async (inviteeUsername: string) => {
    if (!currentWorkspace) return;

    setInviteError(null);
    try {

      console.log("Inviting user to workspace:", currentWorkspace, inviteeUsername);

      const response = await fetch(`${authUrl}/workspaces/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: currentWorkspace.workspaceId, inviteeUsername }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite user');
      }

      console.log(`Invited ${inviteeUsername} to ${currentWorkspace.name}`);
      setIsInviteModalOpen(false);
      // TODO: toast?
    } catch (err: any) {
      console.error('Invite error:', err);
      setInviteError(err.message);
    }
  };

  const isOwner = currentWorkspace
    ? ownedWorkspaces.some(ws => ws.workspaceId === currentWorkspace.workspaceId)
    : false;

  return (
    <div className="flex items-center justify-between w-full rounded-lg hover:bg-[var(--active-item)] shadow-md p-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-2 transition-all">
            <span className="text-base">{currentWorkspace?.icon ?? '📄'}</span>
            <span className="text-base font-medium">
              {currentWorkspace?.name ?? 'Select Workspace'}
            </span>
            <FaChevronDown className="cursor-pointer text-sm" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="text-[var(--muted-text)] w-72 ml-2 p-2 rounded-lg shadow-2xl border border-[var(--sidebar-divider)] bg-[var(--sidebar-bg)]">
          {currentWorkspace && (
            <div className="flex items-center justify-between px-2 py-1 rounded-md">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center">
                  <span className="text-3xl">{currentWorkspace.icon}</span>
                </div>
                <div className="ml-1 flex flex-col">
                  <span className="text-sm font-medium">{currentWorkspace.name}</span>
                  <span className="text-xs">
                    Free Plan • {currentWorkspace.members.length} member{currentWorkspace.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="mb-2 flex items-center justify-between px-2 py-1 rounded-md">
              <div className="flex items-center space-x-2">
                <button className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-divider)]">
                  <FaGears className="w-4 h-4" />
                  <span className="text-xs">Settings</span>
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-divider)]"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span className="text-xs">Invite</span>
                </button>
              </div>
            </div>
          )}

          <div className="h-px bg-[var(--sidebar-divider)] my-1" />

          {(ownedWorkspaces.length === 0 && sharedWorkspaces.length === 0) ? (
            <p className="text-center text-sm">No workspaces found</p>
          ) : (
            <>
              {ownedWorkspaces.length > 0 && (
                <>
                  <span className="text-xs font-semibold px-2">Your Workspaces</span>
                  <ul className="space-y-1">
                    {ownedWorkspaces.map(workspace => (
                      <li
                        key={workspace.workspaceId}
                        onClick={() => setCurrentWorkspace(workspace)}
                        className={`text-sm m-1 p-1 rounded-md cursor-pointer hover:bg-[var(--active-item)] transition-all ${
                          workspace.workspaceId === currentWorkspace?.workspaceId ? 'bg-[var(--active-item)]' : ''
                        }`}
                      >
                        {workspace.icon} {workspace.name}{" "}
                        {workspace.members.length > 1 ? '(Sharing)' : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sharedWorkspaces.length > 0 && (
                <>
                  <div className="h-px bg-[var(--sidebar-divider)] my-1" />
                  <span className="text-xs font-semibold px-2">Shared with You</span>
                  <ul className="space-y-1">
                    {sharedWorkspaces.map(workspace => (
                      <li
                        key={workspace.workspaceId}
                        onClick={() => setCurrentWorkspace(workspace)}
                        className={`text-sm m-1 p-1 rounded-md cursor-pointer hover:bg-[var(--active-item)] transition-all ${
                          workspace.workspaceId === currentWorkspace?.workspaceId ? 'bg-[var(--active-item)]' : ''
                        }`}
                      >
                        📔 {workspace.name} (by {workspace.ownerUsername})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          <div className="h-px bg-[var(--sidebar-divider)] my-1" />
          <ul className="flex flex-col">
            <li>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-md w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] transition-all"
              >
                Create Workspace
              </button>
            </li>
            <li>
              <button className="rounded-md w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] transition-all">
                Add another account
              </button>
            </li>
            <li>
              <button
                className="rounded-md text-red-500 w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] hover:text-red-600 transition-all"
                onClick={logout}
              >
                Log out
              </button>
            </li>
          </ul>
        </PopoverContent>
      </Popover>

      <button className="transition-all">
        <FaPenToSquare
          className="w-4 h-4 cursor-pointer"
          onClick={() => addPage('Untitled Page')}
        />
      </button>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkspace}
      />
      {currentWorkspace && isOwner && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSubmit={handleInviteUser}
          workspace={currentWorkspace}
          error={inviteError}
        />
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
