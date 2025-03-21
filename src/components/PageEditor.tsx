import { useEffect, useState, useCallback, useMemo, memo } from "react";
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

  // find the page once to prevent unnecessary re-renders
  const page = useMemo(
    () => pages.find((p) => p._id === selectedPageId) || null,
    [pages, selectedPageId],
  );

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

  useEffect(() => {
    if (selectedPageId && page) {
      setEditorState({
        title: page.title || "",
        initialContent: page.content || "",
        editorKey: page._id
      });
    }
  }, [selectedPageId, page]);

  if (!page) {
    return <p className="p-6">Select a page...</p>;
  }

  return (
    <div className="page-editor active">
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
    </div>
  );
};

export default PageEditor;