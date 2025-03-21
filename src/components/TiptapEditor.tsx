import { useEffect, memo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { ReactNode } from "react";
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

interface TiptapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  key?: string | number;
}

const TiptapEditor = ({ content, onUpdate, key }: TiptapEditorProps) => {
  const editor = useEditor({
    autofocus: true,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ 
        lowlight: createLowlight(common),
        exitOnArrowDown: true, 
        HTMLAttributes: {
          spellcheck: "false",
        }
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem,
      Link,
      Highlight,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onUpdate(newContent);
    },
    shouldRerenderOnTransaction: false,
  });

  useEffect(() => {
    console.count("TiptapEditor render");
    console.log("TiptapEditor render caused by:", {
      content: content,
      editor: editor ? "exists" : "null",
      keyProp: key
    });
  }, [content, editor, key]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  return <EditorContent editor={editor} className="editor-content" />;
};

export default TiptapEditor;