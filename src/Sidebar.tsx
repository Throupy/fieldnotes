import { useEffect, useState, useRef, useCallback } from "react";
import { FaPlus, FaTrash, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { usePages } from "./PageContext";

const Sidebar = () => {
  const { pages, setSelectedPageId, addPage, deletePageInContext } = usePages();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pageId: string } | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Handle sidebar resizing start
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const sidebarLeft = sidebarRef.current.getBoundingClientRect().left; 
      const newWidth = Math.max(200, Math.min(mouseMoveEvent.clientX - sidebarLeft, 500));
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);
  // resize end

  // context menu
  const handleRightClick = (event: React.MouseEvent, pageId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, pageId });
  };

  const renderPages = (parentId: string | null, depth = 0) => {
    return pages
      .filter((page) => page.parent === parentId)
      .map((page) => (
        <div key={page._id} className="sidebar-page">
          <div
            className="page-item"
            onClick={() => setSelectedPageId(page._id)}
            onContextMenu={(e) => handleRightClick(e, page._id)}
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            {pages.some((child) => child.parent === page._id) ? (
              <span onClick={() => setExpanded((prev) => ({ ...prev, [page._id]: !prev[page._id] }))} className="toggle-icon">
                {expanded[page._id] ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            ) : (
              <span className="spacer"></span>
            )}
            <span className="page-icon">{page.icon}</span>
            <span className="sidebar-page-title">{page.title || "Untitled"}</span>
          </div>

          {expanded[page._id] && <div className="nested-pages">{renderPages(page._id, depth + 1)}</div>}
        </div>
      ));
  };

  // cllicking outside the context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // context menu end

  return (
    <div ref={sidebarRef} className="sidebar-container" style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Private ({pages.length})</span>
          <FaPlus className="plus-icon" onClick={() => addPage("Untitled Page", null)} />
        </div>

        {renderPages(null)}

        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="context-menu active"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div onClick={() => addPage("Untitled Page", contextMenu.pageId)} className="context-menu-item">
              <FaPlus /> New Subpage
            </div>
            <div onClick={() => deletePageInContext(contextMenu.pageId)} className="context-menu-item delete">
              <FaTrash /> Delete Page
            </div>
          </div>
        )}

        <div className="resize-handle" onMouseDown={startResizing}></div>
      </div>
    </div>
  );
};

export default Sidebar;
