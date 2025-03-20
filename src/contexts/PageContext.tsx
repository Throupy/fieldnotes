import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getPages, updatePage, createPage, deletePage } from "../services/pagesService";
import { setWorkspace } from "../services/db";
import { useAuth } from "./AuthContext";

interface Page {
  _id: string;
  title: string;
  content: string;
  icon: string;
  parent: string | null;
}

interface PageContextType {
  pages: Page[];
  selectedPageId: string | null;
  setSelectedPageId: (pageId: string | null) => void;
  fetchPages: () => Promise<void>;
  updatePageInContext: (pageId: string, updates: Partial<Page>) => Promise<void>;
  addPage: (title: string, parentId?: string | null) => Promise<void>;
  deletePageInContext: (pageId: string) => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const { currentWorkspace } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [lastWorkspaceId, setLastWorkspaceId] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    const updatedPages = await getPages();
    setPages(updatedPages);
  }, []);

  // set up the workspace and fetch pages when the currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace && currentWorkspace.id !== lastWorkspaceId) {
      setWorkspace(currentWorkspace.id);
      setLastWorkspaceId(currentWorkspace.id);
      fetchPages();
    }
  }, [currentWorkspace, fetchPages]);;

  // updates a single page in app context and local DB (synced to remote)
  const updatePageInContext = useCallback(async (pageId: string, updates: Partial<Page>) => {
    await updatePage(pageId, updates);
    setPages((prev) =>
      prev.map((page) => (page._id === pageId ? { ...page, ...updates } : page))
    );
  }, []);

  const addPage = useCallback(async (title: string, parentId: string | null = null) => {
    const newPage = await createPage(title, parentId);
    await fetchPages();
    setSelectedPageId(newPage._id);
  }, [fetchPages]);

  const deletePageInContext = useCallback(async (pageId: string) => {
    await deletePage(pageId);
    setPages((prev) => prev.filter((page) => page._id !== pageId));
    if (selectedPageId === pageId) setSelectedPageId(null);
  }, [selectedPageId]);


  return (
    <PageContext.Provider
      value={{
        pages,
        selectedPageId,
        setSelectedPageId,
        fetchPages,
        updatePageInContext,
        addPage,
        deletePageInContext,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePages = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePages must be used within a PageProvider");
  }
  return context;
};