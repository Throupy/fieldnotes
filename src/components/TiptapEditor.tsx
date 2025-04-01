import { useEffect, memo, useCallback, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { GripVerticalIcon } from "lucide-react";
import { common, createLowlight } from "lowlight";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { ImageBlock } from "../extensions/ImageBlock";
import ImageBlockMenu from "../components/ImageBlockMenu";
import DragHandle from "@tiptap-pro/extension-drag-handle-react";

interface TiptapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    autofocus: true,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        exitOnArrowDown: true,
        HTMLAttributes: { spellcheck: "false" },
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem,
      Link,
      Highlight,
      ImageBlock.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      FileHandler.configure({
        allowedMimeTypes: ["image/*"],
        onDrop: (editor, files) => handleFiles(files, editor),
        onPaste: (editor, files) => handleFiles(files, editor),
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onUpdate(newContent);
    },
    shouldRerenderOnTransaction: false,
  });

  const handleFiles = useCallback(
    (files: File[], editor: any) => {
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          editor
            .chain()
            .focus()
            .setImageBlock({ src: base64, width: "100", align: "center" })
            .run();
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  useEffect(() => {
    console.count("TiptapEditor render");
    console.log("TiptapEditor render caused by:", {
      content,
      editor: editor ? "exists" : "null",
    });
  }, [content, editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  return (
    <div ref={menuContainerRef} className="relative w-full">
      <DragHandle editor={editor}>
        <GripVerticalIcon strokeWidth={1} opacity={0.4}/>
      </DragHandle>
      <EditorContent editor={editor} className="editor-content" />
      {editor && <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />}
    </div>
  );
};

export default memo(TiptapEditor);