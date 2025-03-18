import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronDown, FaBook, FaPen, FaPlus } from "react-icons/fa6";
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
    <div className="workspace-switcher flex items-center justify-between w-full p-3 rounded-lg shadow-md">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-2 transition-all">
          <span>📚</span>
            <span className="font-medium">
              {currentWorkspaceId ? workspaceIdToDisplayName(currentWorkspaceId) : "Select Workspace"}
            </span>
            <FaChevronDown className=" text-sm" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="workspace-switcher w-68 ml-2 p-0 border rounded-lg shadow-lg bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]"
        >
          <div className='flex items-center justify-between p-2'>
          <span className="space-y-1 ml-1 p-1 text-sm">Your workspaces:</span>
            <FaPlus
              className='plus-icon mr-1'
            />
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
                  className={`text-md m-2 p-2 rounded-md cursor-pointer text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-[var(--active-item)] transition-all ${
                    workspaceId === currentWorkspaceId ? "bg-[var(--active-item)]" : ""
                  }`}
                >
                  {workspaceIdToDisplayName(workspaceId)}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {/* Edit Button */}
      <button className=" transition-all">
        <FaPen
          className="w-4 h-4"
          onClick={() => addPage('Untitled Page', null)}
        />

      </button>
    </div>
  );
};

export default WorkspaceSwitcher;
