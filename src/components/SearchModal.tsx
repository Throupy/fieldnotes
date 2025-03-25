import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { usePages } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "../components/ui/dialog";

const SearchModal = ({ pages }) => {
  const { currentWorkspace } = useAuth();
  const { setSelectedPageId } = usePages();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')

  // used for stripping html tags from page.content for context match
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  const filteredPages = (pages || []).filter(page => {
    const query = searchQuery.toLowerCase();
    const title = (page.title || '').toLowerCase();
    const category = (page.category || '').toLowerCase();
    const content = stripHtml(page.content || '').toLowerCase();
    return title.includes(query) || category.includes(query) || content.includes(query);
  });

  const displayedPages = searchQuery
    ? filteredPages
    : (pages || [])
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getMatchedSnippet = (text, query) => {
    if (!text || !query) return null;

    const cleanText = stripHtml(text);
    const lowerText = cleanText.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return null;

    const start = Math.max(0, lowerText.lastIndexOf('.', index) + 1);
    const end = lowerText.indexOf('.', index + lowerQuery.length);
    const sentenceEnd = end === -1 ? cleanText.length : end + 1;

    let sentence = cleanText.slice(start, sentenceEnd).trim();

    const maxLength = 50;
    if (sentence.length > maxLength) {
      const queryStartInSentence = index - start;
      const snippetStart = Math.max(0, queryStartInSentence - 20);
      sentence = (snippetStart > 0 ? '...' : '') + sentence.slice(snippetStart, snippetStart + maxLength) + '...';
    }

    return sentence;
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="bg-yellow-500 text-black">{match}</span>
        {after}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--active-item)] hover:text-white min-h-8">
          <FaSearch className="text-base min-w-5 text-center" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            Search
          </span>
        </div>
      </DialogTrigger>
    <DialogContent className="bg-[var(--sidebar-bg)] border-0 rounded-lg p-0 max-w-lg w-full [&>button]:hidden">
      <div className="p-4">

        <div className="relative mb-4">
          <div className="relative flex items-center w-full bg-[var(--active-item)] rounded-md">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder={`Search or ask a question in ${currentWorkspace?.name || 'this workspace'}`}
            className="w-full bg-transparent pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--active-item)] rounded-md"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          </div>
        </div>

        {!searchQuery && displayedPages.some(page => {
            const pageDate = new Date(page.updatedAt);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return pageDate.toDateString() === yesterday.toDateString();
          }) && (
            <div className="mb-4">
              <h3 className="text-sm text-gray-400 mb-2">Yesterday</h3>
              {displayedPages
                .filter(page => {
                  const pageDate = new Date(page.updatedAt);
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return pageDate.toDateString() === yesterday.toDateString();
                })
                .map(page => (
                  <div
                    key={page._id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--active-item)] cursor-pointer"
                    onClick={() => setSelectedPageId(page._id)}
                  >
                    <span className="text-2xl">{page.icon || '📄'}</span>
                    <div className="flex-1">
                      <p className="text-gray-200 truncate">{page.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400">{page.category || 'Uncategorized'}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <div>
            <h3 className="text-sm text-gray-400 mb-2">
              {searchQuery ? 'Search Results' : 'Past week'}
            </h3>
            {displayedPages.length === 0 ? (
              <p className="text-gray-400 text-sm">No matching pages found.</p>
            ) : (
              displayedPages.map(page => {
                const lowerQuery = searchQuery.toLowerCase();
                const titleMatch = (page.title || '').toLowerCase().includes(lowerQuery);
                const contentMatch = (page.content || '').toLowerCase().includes(lowerQuery);
                let snippet = null;

                if (searchQuery) {
                  if (contentMatch) {
                    snippet = getMatchedSnippet(page.content, searchQuery);
                  } else if (titleMatch) {
                    snippet = getMatchedSnippet(page.title, searchQuery);
                  }
                }
                return (
                    <div
                    key={page._id}
                    onClick={() => {
                      setSelectedPageId(page._id);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--active-item)] cursor-pointer"
                    >
                    <span className="text-2xl">{page.icon || '📄'}</span>
                    <div className="flex-1">
                      <p className="text-gray-200 truncate">{page.title || 'Untitled'}</p>
                      {searchQuery && snippet ? (
                      <p className="text-xs text-gray-400 truncate">
                        {highlightMatch(snippet, searchQuery)}
                      </p>
                      ) : (
                      <p className="text-xs text-gray-400">{page.category || 'Uncategorized'}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    </div>
                );
              })
            )}
          </div>
        </div>
    </DialogContent>
  </Dialog>
  )
}

export default SearchModal;