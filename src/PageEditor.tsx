import { useEffect, useState, useCallback } from "react";
import { usePages } from "./PageContext";
import TitleEditor from "./TitleEditor";
import TiptapEditor from "./TiptapEditor";
import "./styles.css";

const PageEditor = () => {
  const { pages, selectedPageId, updatePageInContext } = usePages();
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [initialContent, setInitialContent] = useState("");

  const page = pages.find((p) => p._id === selectedPageId) || null;

  const debouncedUpdate = useCallback(
    debounce((pageId, content) => {
      console.log(`Debounced save for page ${pageId}: ${content}`);
      updatePageInContext(pageId, { content });
    }, 500),
    [updatePageInContext]
  );

  const handleContentUpdate = (newContent) => {
    if (page) {
      debouncedUpdate(page._id, newContent);
    }
  };

  useEffect(() => {
    if (selectedPageId && page) {
      setIsActive(false);
      console.log(`Loading page ${selectedPageId}: title=${page.title}, content=${page.content || ""}`);
      setTitle(page.title);
      setInitialContent(page.content || "");
      setIsActive(true);
    }
  }, [selectedPageId]);

  return page ? (
    <div className="page-editor active">
      <TitleEditor
        title={title}
        onChange={setTitle}
        pageId={page._id}
        updatePageInContext={updatePageInContext}
      />
      <TiptapEditor content={initialContent} onUpdate={handleContentUpdate} />
    </div>
  ) : (
    <p className="p-6">Select a page...</p>
  );
};

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default PageEditor;