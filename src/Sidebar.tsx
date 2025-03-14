import { useEffect, useState, useRef } from "react";
import { FaPlus, FaTrash, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { usePages } from "./PageContext";

const Sidebar = () => {
  const { pages, setSelectedPageId, addPage, deletePageInContext } = usePages();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pageId: string } | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewPage = async (parent: string | null = null) => {
    await addPage("Untitled Page", parent);
    setContextMenu(null);
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePageInContext(pageId);
    setContextMenu(null);
  };

  const handleRightClick = (event: React.MouseEvent, pageId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, pageId });
  };

  const toggleExpand = (pageId: string) => {
    setExpanded((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const renderPages = (parentId: string | null, depth = 0) => {
    return pages
      .filter((page) => page.parent === parentId)
      .map((page) => (
        <div key={page._id} className="sidebar-page" style={{ paddingLeft: `${depth * 20}px` }}>
          <div
            className="page-item"
            onClick={() => setSelectedPageId(page._id)}
            onContextMenu={(e) => handleRightClick(e, page._id)}
          >
            {pages.some((child) => child.parent === page._id) ? (
              <span onClick={() => toggleExpand(page._id)} className="toggle-icon">
                {expanded[page._id] ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            ) : (
              <span className="spacer"></span>
            )}
            <span className="page-icon">{page.icon}</span>
            <span className="text-lg sidebar-page-title">{page.title || 'Untitled'}</span>
          </div>

          {expanded[page._id] && <div className="nested-pages">{renderPages(page._id, depth + 1)}</div>}
        </div>
      ));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>Private</span>
        <FaPlus className="plus-icon" onClick={() => handleNewPage(null)} />
      </div>

      {renderPages(null)}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu active"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div onClick={() => handleNewPage(contextMenu.pageId)} className="context-menu-item">
            <FaPlus /> New Subpage
          </div>
          <div onClick={() => handleDeletePage(contextMenu.pageId)} className="context-menu-item delete">
            <FaTrash /> Delete Page
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;