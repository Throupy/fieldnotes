import { useEffect, useState, useRef, useCallback } from 'react';
import { FaPlus, FaTrash, FaChevronRight, FaChevronDown, FaSearch, FaMagic, FaHome, FaInbox, FaCog, FaEdit } from 'react-icons/fa';
import { usePages } from '../contexts/PageContext';
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const Sidebar = ({ onSettingsClick }: { onSettingsClick: () => void }) => {
  const { pages, setSelectedPageId, addPage, deletePageInContext } = usePages();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pageId: string;
  } | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const nestedRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle sidebar resizing
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const sidebarLeft = sidebarRef.current.getBoundingClientRect().left;
        const newWidth = Math.max(
          200,
          Math.min(mouseMoveEvent.clientX - sidebarLeft, 500),
        );
        setSidebarWidth(newWidth);
      }
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Context menu
  const handleRightClick = (event: React.MouseEvent, pageId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, pageId });
  };

  const handleAddPage = async (pageId: string) => {
    addPage('Untitled Page', pageId);
    setExpanded((prev) => ({ ...prev, [pageId]: true }));
    setContextMenu(null);
  };

  const handleDeletePage = async (pageId: string) => {
    deletePageInContext(pageId);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderPages = (parentId: string | null, depth = 0) => {
    return pages
      .filter((page) => page.parent === parentId)
      .map((page) => {
        const isExpanded = expanded[page._id];
  
        return (
          <div key={page._id} className="sidebar-page">
            <div
              className="sidebar-page-item"
              onClick={() => setSelectedPageId(page._id)}
              onContextMenu={(e) => handleRightClick(e, page._id)}
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              {pages.some((child) => child.parent === page._id) ? (
                <span
                  className="page-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => ({
                      ...prev,
                      [page._id]: !prev[page._id],
                    }));
                  }}
                >
                  <FaChevronRight
                    className={`sidebar-expand-arrow ${
                      isExpanded ? "collapsed" : "expanded"
                    }`}
                  />
                  <FaChevronDown
                    className={`sidebar-expand-arrow ${
                      isExpanded ? "expanded" : "collapsed"
                    }`}
                  />
                  <span className="page-icon-has-children">{page.icon}</span>
                </span>
                
              ) : (
                <span className="page-toggle">
                  <span className="page-icon">{page.icon}</span>
                </span>
              )}
              <span className="sidebar-page-title">{page.title || "Untitled"}</span>
            </div>

            {isExpanded && (
              <div className={`nested-pages ${isExpanded ? "expanded" : ""}`}>
                {renderPages(page._id, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div
      ref={sidebarRef}
      className='sidebar-container'
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className='sidebar'>
        <div className="text-md sidebar-buttons-section">
          <WorkspaceSwitcher />
          <div className="sidebar-button">
            <FaSearch className="sidebar-icon" />
            <span className="sidebar-page-title">Search</span>
          </div>
          <div className="sidebar-button">
            <FaHome className="sidebar-icon" />
            <span className="sidebar-page-title">Home</span>
          </div>
          <div className="sidebar-button" onClick={onSettingsClick}>
            <FaCog className="sidebar-icon" />
            <span className="sidebar-page-title">Settings</span>
          </div>
        </div>
        <div className="sidebar-divider"></div>

        <div className='sidebar-header'>
          <span className='text-sm'>Workspace Pages ({pages.length})</span>
          <FaPlus
            className='plus-icon'
            onClick={() => addPage('Untitled Page', null)}
          />
        </div>

        <div className="sidebar-pages-section">
          {renderPages(null)}
        </div>

        {contextMenu && (
          <div
            ref={contextMenuRef}
            className='context-menu active'
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div
              onClick={() => handleAddPage(contextMenu.pageId)}
              className='context-menu-item'
            >
              <FaPlus /> New Subpage
            </div>
            <div
              onClick={() => handleDeletePage(contextMenu.pageId)}
              className='context-menu-item delete'
            >
              <FaTrash /> Delete Page
            </div>
          </div>
        )}

        <div className='resize-handle' onMouseDown={startResizing}></div>
      </div>
    </div>
  );
};

export default Sidebar;