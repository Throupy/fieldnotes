import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePages } from '../contexts/PageContext';
import { FaChevronDown, FaGears, FaUserPlus, FaPenToSquare } from 'react-icons/fa6';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import CreateWorkspaceModal from './CreateWorkspaceModal';

const WorkspaceSwitcher: React.FC = () => {
  const { addPage } = usePages();
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateWorkspace = async (name: string) => {
    const success = await createWorkspace(name);
    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full rounded-lg hover:bg-[var(--active-item)] shadow-md p-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-2 transition-all">
            <span className="text-base">📔</span>
            <span className="text-base font-medium ">
              {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
            </span>
            <FaChevronDown className="cursor-pointer text-sm " />
          </button>
        </PopoverTrigger>

        <PopoverContent className="text-[var(--muted-text)] w-72 ml-2 p-2 rounded-lg shadow-2xl border border-[var(--sidebar-divider)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center justify-between px-2 py-1 rounded-md">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center">
                <span className="text-3xl">📔</span>
              </div>
              <div className="ml-1 flex flex-col">
                <span className="text-sm font-medium ">
                  {currentWorkspace ? currentWorkspace.name : 'Unknown Workspace'}
                </span>
                <span className="text-xs ">Free Plan • 1 member</span>
              </div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between px-2 py-1 rounded-md">
            <div className="flex items-center space-x-2">
              <button className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-divider)]">
                <FaGears className="w-4 h-4 " />
                <span className="text-xs ">Settings</span>
              </button>
              <button className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-divider)]">
                <FaUserPlus className="w-4 h-4 " />
                <span className="text-xs ">Invite</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-[var(--sidebar-divider)] my-1"></div>
          {workspaces.length === 0 ? (
            <p className="text-center  text-sm">No workspaces found</p>
          ) : (
            <ul className="space-y-1">
              {workspaces.map((workspace) => (
                <li
                  key={workspace.id}
                  onClick={() => setCurrentWorkspace(workspace)}
                  className={`text-sm m-1 p-1 rounded-md cursor-pointer  hover:bg-[var(--active-item)] transition-all ${
                    workspace.id === currentWorkspace?.id ? 'bg-[var(--active-item)]' : ''
                  }`}
                >
                  <span className="mr-1 inline-flex items-center align-middle">
                    📔 {workspace.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="h-px bg-[var(--sidebar-divider)] my-1"></div>
            <ul className="flex flex-col">
              <li>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-md w-full text-left px-2 py-2 text-sm  hover:bg-[var(--active-item)] transition-all"
                >
                  Create Workspace
                </button>
              </li>
              <li>
                <button className="rounded-md w-full text-left px-2 py-2 text-sm  hover:bg-[var(--active-item)] transition-all">
                  Add another account
                </button>
              </li>
              <li>
                <button
                  className="rounded-md text-red-500 w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] hover:text-red-600 transition-all"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </li>
            </ul>
        </PopoverContent>
      </Popover>

      <button className="transition-all">
        <FaPenToSquare 
          className="w-4 h-4 cursor-pointer  hover:" 
          onClick={() => addPage('Untitled Page', null)} 
        />
      </button>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWorkspace}
      />
    </div>
  );
};

export default WorkspaceSwitcher;