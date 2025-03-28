// Part above the title editor which has the breadcrumbs and options

import { LockKeyholeIcon, MessageSquareIcon, MoreHorizontalIcon, StarIcon } from "lucide-react";
import React from "react";
import { Page } from "../types"

interface PageEditorHeaderProps {
  page: Page
  setSelectedPageId: (id: string) => void;
  pages: Page[];
}

const PageEditorHeader: React.FC<PageEditorHeaderProps> = ({ page, setSelectedPageId, pages }) => {
  return (
    <div className="flex items-center justify-between mb-4 p-1 mt-1 rounded-md gap-3">
    <div className="flex items-center gap-3">
        {(() => {
          const parentPages: Page[] = [];
          let currentPage = page;
          while (currentPage?.parent) {
          const parentPage = pages.find((p) => p._id === currentPage.parent);
          if (parentPage) {
            parentPages.unshift(parentPage);
            currentPage = parentPage;
          } else {
            break;
          }
          }
  
          const maxBreadcrumbs = 3;
          const visiblePages = parentPages.slice(-maxBreadcrumbs);
          const isTruncated = parentPages.length > maxBreadcrumbs;
  
          return (
          <>
            {isTruncated && (
            <div
              className="flex items-center rounded-md gap-2 p-1 hover:bg-[var(--active-item)]"
              onClick={() => setSelectedPageId(parentPages[0]?._id)}
            >
              <p className="text-md flex items-center">...</p>
            </div>
            )}
            {visiblePages.map((parentPage, index) => (
            <React.Fragment key={parentPage._id}>
                <div
                  className="flex items-center rounded-md gap-2 p-1 hover:bg-[var(--active-item)]"
                  onClick={() => setSelectedPageId(parentPage._id)}
                >
                <p className="h-5 w-5 text-[var(--muted-text)] flex items-center justify-center">{parentPage.icon}</p>
                <p className="text-md flex items-center">{parentPage.title || "Untitled Page"}</p>
                </div>
              {index < visiblePages.length && <p> &gt; </p>}
            </React.Fragment>
            ))}
          </>
          );
        })()}
        <div className="flex items-center rounded-md gap-2 p-1 hover:bg-[var(--active-item)]">
          <p className="h-5 w-5 text-[var(--muted-text)] flex items-center justify-center">{page.icon}</p>
          <p className="text-md flex items-center">{page.title || "Untitled Page"}</p>
        </div>
      <div className="flex items-center gap-2 p-1 hover:bg-[var(--active-item)] rounded-md text-[var(--muted-text)]">
        <LockKeyholeIcon className="h-5 w-5" />
        <span className="text-md">Private</span>
      </div>
    </div>
  
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 text-[var(--muted-text)] rounded-md p-1 hover:bg-[var(--active-item)]">
        <span className="text-md">Share</span>
      </button>
      <button className="text-[var(--muted-text)] hover:text-[var(--text-color)] rounded-md p-1 hover:bg-[var(--active-item)]">
        <MessageSquareIcon className="h-5 w-5" />
      </button>
      <button className="text-[var(--muted-text)] hover:text-[var(--text-color)] rounded-md p-1 hover:bg-[var(--active-item)]">
        <StarIcon className="h-5 w-5" />
      </button>
      <button className="text-[var(--muted-text)] hover:text-[var(--text-color)] rounded-md p-1 hover:bg-[var(--active-item)]">
        <MoreHorizontalIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
  )
}

export default PageEditorHeader