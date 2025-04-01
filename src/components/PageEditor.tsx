import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { BookOpenIcon, LockIcon, LockKeyholeIcon, MessageSquareIcon, MoreHorizontalIcon, StarIcon } from "lucide-react"
import DragHandle from '@tiptap-pro/extension-drag-handle-react'
import { usePages } from "../contexts/PageContext";
import TitleEditor from "../components/TitleEditor";
import TiptapEditor from "../components/TiptapEditor";
import HomePage from "./HomePage";
import PageEditorHeader from "./PageEditorHeader";

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PageEditor = () => {
  const { pages, selectedPageId, updatePageInContext, setSelectedPageId } = usePages();
  const [editorState, setEditorState] = useState({
    title: "",
    initialContent: "",
    editorKey: ""
  });
  const [showEditor, setShowEditor] = useState(true);
  const lastPageIdRef = useRef<string | null>(null);
  
  // find the page once to prevent unnecessary re-renders
  const page = useMemo(
    () => pages.find((p) => p._id === selectedPageId) || null,
    [pages, selectedPageId],
  );

  useEffect(() => {
    if (selectedPageId && page) {
      // If the page ID changed (not just the page content), play animation
      if (lastPageIdRef.current !== selectedPageId) {
        lastPageIdRef.current = selectedPageId;
        
        setShowEditor(false);
        
        setTimeout(() => {
          setEditorState({
            title: page.title || "",
            initialContent: page.content || "",
            editorKey: page._id
          });
          
          setShowEditor(true);
        }, 200);
      } else {
        // If just the page content changed, update without animation
        setEditorState({
          title: page.title || "",
          initialContent: page.content || "",
          editorKey: page._id
        });
      }
    }
  }, [selectedPageId, page]);

  const debouncedUpdateContent = useCallback(
    debounce((pageId: string, content: string) => {
      updatePageInContext(pageId, { content });
    }, 500),
    [updatePageInContext],
  );

  const debouncedUpdateTitle = useCallback(
    debounce((pageId: string, title: string) => {
      updatePageInContext(pageId, { title });
    }, 500),
    [updatePageInContext],
  );

  const handleContentUpdate = useCallback(
    (newContent: string) => {
      if (page) {
        debouncedUpdateContent(page._id, newContent);
      }
    },
    [page, debouncedUpdateContent],
  );

  const handleTitleUpdate = useCallback(
    (newTitle: string) => {
      if (page) {
        setEditorState(prev => ({ ...prev, title: newTitle }));
        debouncedUpdateTitle(page._id, newTitle);
      }
    },
    [page, debouncedUpdateTitle],
  );

  if (!page) {
    return <HomePage />;
  }

  return (
    <div
      className={`flex-grow h-full overflow-y-auto px-6 ${
        showEditor
          ? 'animate-in fade-in slide-in-from-bottom-5 duration-300'
          : 'opacity-0'
      }`}
    >
      {showEditor && (
        <>
          <PageEditorHeader page={page} pages={pages} setSelectedPageId={setSelectedPageId}/>
          <TitleEditor
            title={editorState.title}
            onUpdate={handleTitleUpdate}
            pageId={page._id}
          />
          <TiptapEditor
            content={editorState.initialContent}
            onUpdate={handleContentUpdate}
          />
        </>
      )}
    </div>
  );
};

export default PageEditor;