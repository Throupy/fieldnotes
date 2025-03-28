import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { usePages } from "../contexts/PageContext";
import { useSettings } from "../contexts/SettingsContext";

const TitleEditor = ({
  title,
  onUpdate,
  pageId,
}: {
  title: string;
  onUpdate: (title: string) => void;
  pageId: string;
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { updatePageInContext, pages } = usePages();
  const { theme } = useSettings()
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const page = pages.find((p) => p._id === pageId);

  const resolvedTheme: Theme =
    theme === "dark" ? Theme.DARK :
    theme === "light" ? Theme.LIGHT :
    window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;

  interface EmojiClickData {
    emoji: string;
    [key: string]: any;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
  
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    if (page) {
      updatePageInContext(pageId, { icon: emoji.emoji });
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className="relative flex items-center mb-2.5 text-3xl">
      <div
        className="mr-2.5 cursor-pointer p-1.5 text-3xl"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        {page?.icon || "📄"}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Untitled"
        className="flex-grow font-bold bg-transparentborder-none outline-none p-3 border-b border-stone-600"
      />

      <div
        ref={pickerRef}
        className={`absolute top-full left-0 z-[1000] ${
          showEmojiPicker
            ? "animate-in zoom-in-95 duration-200"
            : "animate-out zoom-out-95 duration-200 opacity-0"
        }`}
      >
        {showEmojiPicker && (
          <EmojiPicker
            theme={resolvedTheme}
            className="fieldnotes-emoji-picker text-sm"
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
          />
        )}
      </div>
    </div>
  );
};

export default TitleEditor;
