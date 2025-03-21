import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { usePages } from "../contexts/PageContext";
import TitleEditor from "../components/TitleEditor";
import TiptapEditor from "../components/TiptapEditor";

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PageEditor = () => {
  const { pages, selectedPageId, updatePageInContext } = usePages();
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
    return <p className="p-6">Select a page...</p>;
  }

  return (
    <div className={`page-editor ${showEditor ? 'active' : ''}`}>
      {showEditor && (
        <>
          <TitleEditor
            title={editorState.title}
            onUpdate={handleTitleUpdate}
            pageId={page._id}
          />
          <TiptapEditor
            key={editorState.editorKey}
            content={editorState.initialContent}
            onUpdate={handleContentUpdate}
          />
        </>
      )}
    </div>
  );
};

export default PageEditor;