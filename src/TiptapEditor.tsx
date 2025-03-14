import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";
import HardBreak from "@tiptap/extension-hard-break";

const TiptapEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    autofocus: true,
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem,
      Link,
      Highlight,
      Blockquote,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      BulletList,
      OrderedList,
      Heading.configure({ levels: [1, 2, 3] }),
      HardBreak,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log(`Editor updated: ${newContent}`);
      onUpdate(newContent);
    },
    shouldRerenderOnTransaction: false, // Prevent re-renders on every update
  });

  useEffect(() => {
    console.count("TiptapEditor render");
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]); // Update content only when prop changes

  return <EditorContent editor={editor} className="editor-content" />;
};

export default TiptapEditor;