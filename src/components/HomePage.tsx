import React from 'react';
import { usePages } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import { FaClock } from 'react-icons/fa';

const HomePage = () => {
  const { user } = useAuth();
  const { pages, setSelectedPageId } = usePages(); 

  const displayedPages = (pages || []).slice(0, 4);

  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-bottom-5 duration-300">
      <h1 className="p-5 text-4xl text-center capitalize">Welcome, {user}</h1>
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="text-lg p-5">
            <FaClock className="inline mr-2" />
            Jump back in
          </div>
          {displayedPages.length === 0 ? (
            <p className="text-gray-400 px-5">No recently visited pages.</p>
          ) : (
            <div className="grid grid-cols-4 gap-5 p-5">
              {displayedPages.map((page) => (
                <div
                  key={page._id} 
                  onClick={() => setSelectedPageId(page._id)}
                  className="hover:bg-[var(--active-item)] cursor-pointer relative rounded-lg bg-[var(--sidebar-bg)] transition-colors duration-200 overflow-hidden"
                >
                  <div
                    className={"absolute top-0 left-0 w-full h-[30%] bg-[var(--active-item)] rounded-t-lg"}
                  />

                  <div className="absolute left-4 top-6">
                    <span className="text-2xl">{page.icon || '📄'}</span>
                  </div>
                  <div className="pt-12 pb-4 px-4 mt-2">
                    <h3 className="text-lg font-medium text-white truncate">
                      {page.title || 'Untitled'}
                    </h3>

                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">
                        {user ? user.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {/* FOR WHEN I ADD DATE TO PAGE */}
                      <p className="text-gray-400 text-xs">
                        2 Days Ago 
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