import { useEffect, useState, useCallback } from "react";
import { usePages } from "../contexts/PageContext";
import TitleEditor from "../components/TitleEditor";
import TiptapEditor from "../components/TiptapEditor";

const PageEditor = () => {
  const { pages, selectedPageId, updatePageInContext } = usePages();
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [initialContent, setInitialContent] = useState("");

  const page = pages.find((p) => p._id === selectedPageId) || null;

  const debouncedUpdate = useCallback(
    debounce((pageId: string, content: string) => {
      console.log(`Debounced save for page ${pageId}: ${content}`);
      updatePageInContext(pageId, { content });
    }, 500),
    [updatePageInContext]
  );

  const handleContentUpdate = (newContent: string) => {
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

  {/* add a key param to parent div so react knows to re-render the component when the page changes */}
  return page ? (
    <div className="page-editor active" key={page._id}>
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