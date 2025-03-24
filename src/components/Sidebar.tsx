import { useEffect, useState, useRef, useCallback } from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronRight,
  FaChevronDown,
  FaSearch,
  FaHome,
  FaCog,
} from "react-icons/fa";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../components/ui/context-menu";
import { usePages } from "../contexts/PageContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const Sidebar = ({ onSettingsClick }: { onSettingsClick: () => void }) => {
  const { pages, setSelectedPageId, addPage, deletePageInContext } = usePages();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

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
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleAddPage = async (pageId: string) => {
    addPage("Untitled Page", pageId);
    setExpanded((prev) => ({ ...prev, [pageId]: true }));
  };

  const handleDeletePage = async (pageId: string) => {
    const recursiveDelete = (id: string) => {
      const children = pages.filter((page) => page.parent === id);
      for (const child of children) {
        recursiveDelete(child._id);
      }
      deletePageInContext(id);
    };
    recursiveDelete(pageId);
  };

  const renderPages = (parentId: string | null, depth = 0) => {
    return pages
      .filter((page) => page.parent === parentId)
      .map((page) => {
        const isExpanded = expanded[page._id];
        const hasChildren = pages.some((child) => child.parent === page._id);

        return (
          <div key={page._id} className="animate-in duration-200 ease-in">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div
                  className="relative flex items-center gap-2 w-full py-1.5 px-0 rounded-md cursor-pointer transition-colors hover:bg-[var(--active-item)] group"
                  onClick={() => setSelectedPageId(page._id)}
                  style={{ paddingLeft: `${depth * 16}px` }}
                >
                  <span
                    className="w-5 flex items-center justify-center relative"
                    onClick={(e) => {
                      if (hasChildren) {
                        e.stopPropagation();
                        setExpanded((prev) => ({
                          ...prev,
                          [page._id]: !prev[page._id],
                        }));
                      }
                    }}
                  >
                    {hasChildren ? (
                      <>
                        <span className="absolute flex items-center justify-center transition-opacity duration-200 opacity-100 group-hover:opacity-0">
                          {page.icon}
                        </span>
                        {isExpanded ? (
                          <FaChevronDown className="absolute flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                        ) : (
                          <FaChevronRight className="absolute flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                        )}
                      </>
                    ) : (
                      <span className="flex items-center justify-center">
                        {page.icon}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {page.title || "Untitled"}
                  </span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 bg-[var(--sidebar-bg)] border border-stone-700 text-[var(--muted-text)]">
                <ContextMenuItem
                  className="flex items-center gap-2 hover:bg-[var(--active-item)]"
                  onClick={() => handleAddPage(page._id)}
                >
                  <FaPlus className="w-4 h-4" />
                  Add Page
                </ContextMenuItem>
                <ContextMenuItem
                  className="flex items-center gap-2 text-red-500 hover:bg-[var(--active-item)]"
                  onClick={() => handleDeletePage(page._id)}
                >
                  <FaTrash className="w-4 h-4" />
                  Delete Page
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "max-h-[1000px] opacity-100 animate-expand"
                  : "max-h-0 opacity-0 animate-collapse"
              }`}
            >
              {renderPages(page._id, depth + 1)}
            </div>
          </div>
        );
      });
  };

  return (
    <div
      ref={sidebarRef}
      className="relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="relative bg-[var(--sidebar-bg)] h-full overflow-y-auto overflow-x-hidden transition-all duration-200 ease border-r border-stone-700">
        <div className="flex flex-col gap-0.5 p-1 text-sm">
          <WorkspaceSwitcher />
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--active-item)] hover:text-white min-h-8">
            <FaSearch className="text-base min-w-5 text-center" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Search
            </span>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--active-item)] hover:text-white min-h-8">
            <FaHome className="text-base min-w-5 text-center" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Home
            </span>
          </div>
          <div
            className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--active-item)] hover:text-white min-h-8"
            onClick={onSettingsClick}
          >
            <FaCog className="text-base min-w-5 text-center" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Settings
            </span>
          </div>
        </div>
        <div className="h-px bg-stone-700"></div>

        <div className="flex justify-between items-center text-stone-400 p-2">
          <span className="text-xs">Workspace Pages ({pages.length})</span>
          <FaPlus
            className="cursor-pointer text-stone-400 transition-colors hover:text-white"
            onClick={() => addPage("Untitled Page", null)}
          />
        </div>

        <div className="px-3 py-1.5">{renderPages(null)}</div>

        <div
          className="absolute top-0 right-[-5px] w-2.5 h-full cursor-ew-resize bg-transparent z-10 hover:bg-white/20 active:bg-white/30"
          onMouseDown={startResizing}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;