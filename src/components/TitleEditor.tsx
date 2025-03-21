import { useState, useRef, useEffect, memo } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { usePages } from "../contexts/PageContext";

const TitleEditor = ({ title, onUpdate, pageId }) => {
  const { pages, updatePageInContext } = usePages();
  const [icon, setIcon] = useState("📄");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pageId) {
      const page = pages.find((p) => p._id === pageId);
      if (page?.icon) {
        setIcon(page.icon);
      }
    }
  }, [pageId, pages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    onUpdate(newTitle);
  };

  const handleEmojiSelect = async (emoji) => {
    const newIcon = emoji.native;
    setIcon(newIcon);
    setShowPicker(false);
    if (pageId) {
      await updatePageInContext(pageId, { icon: newIcon });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="title-editor">
      <span className="title-icon" onClick={() => setShowPicker(!showPicker)}>
        {icon}
      </span>
      <input
        type="text"
        className="title-input"
        value={title}
        onChange={handleChange}
        placeholder="Untitled"
      />
      {showPicker && (
        <div ref={pickerRef} className={`emoji-picker ${showPicker ? "active" : ""}`}>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default TitleEditor;