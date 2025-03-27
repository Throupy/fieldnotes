import React from 'react';
import { usePages } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import { FaClock } from 'react-icons/fa';
import UserProfilePicture from './UserProfilePicture';

const HomePage = () => {
  const { user } = useAuth();
  const { pages, setSelectedPageId } = usePages(); 

  const displayedPages = (pages || []).slice(0, 20);

  const formatTimeSince = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(date.getTime())) return "some time ago";

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;

    if (seconds < 10) return "Just Now";

    return `${Math.floor(seconds)} seconds ago`;
  }

  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-bottom-5 duration-300">
      <h1 className="p-7 font-bold text-[#d4d4d4] text-4xl text-center capitalize">Welcome, {user?.username}</h1>
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="text-sm px-5 py-3 text-gray-400 flex items-center">
            <FaClock className="inline mr-2" />
            Jump back in
          </div>
          {displayedPages.length === 0 ? (
            <p className="text-gray-400 px-5">No recently visited pages.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
              {displayedPages.map((page) => (
                <div
                  key={page._id} 
                  onClick={() => setSelectedPageId(page._id)}
                                  className="hover:bg-[var(--active-item)] cursor-pointer relative rounded-lg bg-[var(--sidebar-bg)] transition-colors duration-200 overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[30%] bg-[var(--active-item)] rounded-t-lg"
                  />
                  <div className="absolute left-4 top-6">
                    <span className="text-2xl">{page.icon || '📄'}</span>
                  </div>
                  <div className="pt-12 pb-4 px-4 mt-2">
                    <h3 className="text-lg font-medium text-white truncate">
                      {page.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <UserProfilePicture user={user} className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs"/>
                      <p className="text-gray-400 text-xs">
                        {formatTimeSince(page.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;