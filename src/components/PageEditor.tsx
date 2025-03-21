import { useEffect, useState, useCallback, useMemo } from "react";
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
  
  // find the page once to prevent unnecessary re-renders
  const page = useMemo(
    () => pages.find((p) => p._id === selectedPageId) || null,
    [pages, selectedPageId],
  );

  // Handle page changes with animation
  useEffect(() => {
    if (selectedPageId && page) {
      // Hide current editor
      setShowEditor(false);
      
      // Wait for fade-out animation (adjust time as needed)
      setTimeout(() => {
        // Update editor state with new page content
        setEditorState({
          title: page.title || "",
          initialContent: page.content || "",
          editorKey: page._id
        });
        
        // Show editor again (triggers fade-in animation)
        setShowEditor(true);
      }, 200); // Animation duration
    }
  }, [selectedPageId, page]);

  // Rest of your component logic remains the same
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