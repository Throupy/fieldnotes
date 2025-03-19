import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronDown, FaGears, FaUserPlus, FaPenToSquare, FaPen, FaPlus } from "react-icons/fa6";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { usePages } from "../contexts/PageContext";

const WorkspaceSwitcher: React.FC = () => {
  const { addPage, setSelectedPageId } = usePages();
  const { workspaceIds, currentWorkspaceId, setCurrentWorkspaceId } = useAuth();

  const workspaceIdToDisplayName = (workspaceId: string): string => {
    const nameParts = workspaceId.split("_").slice(2);
    return nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="workspace-switcher hover:bg-[var(--active-item)] flex items-center justify-between w-full rounded-lg shadow-md">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-2 transition-all">
          <span>📔</span>
            <span className="font-medium">
              {currentWorkspaceId ? workspaceIdToDisplayName(currentWorkspaceId) : "Select Workspace"}
            </span>
            <FaChevronDown className="cursor-pointer text-sm" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="workspace-switcher w-68 ml-2 p-0 border rounded-lg shadow-lg bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]"
        >

      <div className="flex items-center justify-between px-2 py-1 rounded-md">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center">
            <span className="text-3xl">📔</span>
          </div>
          <div className="ml-1 flex flex-col">
            <span className="text-sm font-medium">
              {currentWorkspaceId ? workspaceIdToDisplayName(currentWorkspaceId) : "Unkown Workspace"}
            </span>
            <span className="text-xs">Free Plan • 1 member</span>
          </div>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between px-2 py-1 rounded-md">
        <div className="flex items-center space-x-2">
          <button className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-border)]">
        <FaGears className="w-4 h-4" />
        <span className="text-xs">Settings</span>
          </button>
          <button className="hover:bg-[var(--active-item)] rounded-md py-1 px-2 transition-all flex items-center space-x-1 border border-[var(--sidebar-border)]">
        <FaUserPlus className="w-4 h-4" />
        <span className="text-xs">Invite Members</span>
          </button>
        </div>
      </div>
      <div className="sidebar-divider"></div>
          {workspaceIds.length === 0 ? (
            <p className="text-center">No workspaces found</p>
          ) : (
            <ul className="space-y-1">
              {workspaceIds.map((workspaceId) => (
                <li
                  key={workspaceId}
                  onClick={() => setCurrentWorkspaceId(workspaceId)}
                  className={`text-sm m-1 p-1 rounded-md cursor-pointer text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-[var(--active-item)] transition-all ${
                    workspaceId === currentWorkspaceId ? "bg-[var(--active-item)]" : ""
                  }`}
                >
                  <span className="mr-1 text-md inline-flex items-center align-middle">📔 {workspaceIdToDisplayName(workspaceId)}</span>
                </li>
              ))}
            {/* Placeholder workspaces */}
            <li
              key="placeholder-workspace"
              className="text-sm m-1 p-1 rounded-md cursor-pointer text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-[var(--active-item)] transition-all"
            >
                <span className="mr-1 text-md inline-flex items-center align-middle">💼 Work</span>
            </li>
            <li
              key="placeholder-workspace"
              className="text-sm m-1 p-1 rounded-md cursor-pointer text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-[var(--active-item)] transition-all"
            >
              <span className="mr-1 text-md inline-flex items-center align-middle">💸 Finances</span>
            </li>
            </ul>
          )}

          <div className="sidebar-divider"></div>

          <div className="text-sm rounded-lg shadow-lg">
            <ul className="flex flex-col">
              <li>
                <button
                  className="rounded-md w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] hover:text-white transition-all"
                >
                  Create work account
                </button>
              </li>
              <li>
                <button
                  className="rounded-md w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] hover:text-white transition-all"
                >
                  Add another account
                </button>
              </li>
              <li>
                <button
                  className="rounded-md text-red-500 w-full text-left px-2 py-2 text-sm hover:bg-[var(--active-item)] hover:text-red-600 transition-all"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>

        </PopoverContent>
      </Popover>

      {/* Edit Button */}
      <button className=" transition-all">
        <FaPenToSquare
          className="w-4 h-4 cursor-pointer"
          onClick={() => addPage('Untitled Page', null)}
        />

      </button>
    </div>
  );
};

export default WorkspaceSwitcher;
