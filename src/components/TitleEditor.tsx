import { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { usePages } from "../contexts/PageContext";

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
  const page = pages.find((p) => p._id === pageId);

  interface EmojiClickData {
    emoji: string;
    [key: string]: any;
  }

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
        className="flex-grow font-bold bg-transparent text-white border-none outline-none p-3 border-b border-stone-600"
      />

      <div
        className={`absolute top-full left-0 z-[1000] ${
          showEmojiPicker
            ? "animate-in zoom-in-95 duration-200"
            : "animate-out zoom-out-95 duration-200 opacity-0"
        }`}
      >
        {showEmojiPicker && (
          <EmojiPicker
            theme={Theme.DARK}
            className="fieldnotes-emoji-picker"
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
          />
        )}
      </div>
    </div>
  );
};

export default TitleEditor;
