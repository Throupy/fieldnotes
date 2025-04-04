import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePages } from '../../contexts/PageContext';
import { setDbUrl, getDbUrl } from '../../services/db'
import { HandIcon } from 'lucide-react';

const PeopleSettings: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { pages = [] } = usePages();

  if (!currentWorkspace) return <p>No workspace selected</p>;

  const members = currentWorkspace.members || [];
  const pageCount = pages.filter(p => p.workspaceId === currentWorkspace.id).length;
  const lastUpdated = pages
    .filter(p => p.workspaceId === currentWorkspace.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt;

  return (
    <div className="space-y-8">
      <h3 className="text-lg mb-4">People</h3>
      <div>
        <p className="text-sm">
          Invite link to add members
        </p>
        <div className="flex items-center mt-2 justify-between">
          <span className="text-sm text-[var(--muted-text)]">
            Only people with permission to invite members can see this.
          </span>
          <button
            className="text-sm outline-[#3184de] outline-solid outline-1 px-4 py-2 rounded-md hover:bg-[#3184de] transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm">
          Workspace Members
        </p>
        <div className="flex items-center mt-2 justify-between">
          <div className="relative w-full shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right mt-1">
                <thead className="text-xs border-b uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Access Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((username, index) => (
                    <tr key={index} className="">
                      <th scope="row" className="px-6 py-4 font-medium ">
                        {username}
                      </th>
                      <td className="px-6 py-4">
                        Full
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 text-red-500 cursor-pointer hover:underline">
                          <HandIcon className="w-4 h-4" />
                          <span>Remove</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleSettings;