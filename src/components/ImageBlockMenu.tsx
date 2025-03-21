import { BubbleMenu } from "@tiptap/react";
import React, { useCallback, useRef } from "react";
import { useEditorState } from "@tiptap/react";
import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalDistributeStart,
  AlignHorizontalDistributeEnd,
} from "lucide-react";
import { ImageBlockWidthSlider } from "./ImageBlockWidthSlider";
import { sticky } from "tippy.js";

interface MenuProps {
  editor: any;
  appendTo?: React.RefObject<HTMLElement>;
}

const ImageBlockMenu: React.FC<MenuProps> = ({ editor, appendTo }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const shouldShow = useCallback(
    () => editor.isActive("customImage"),
    [editor],
  );

  const onAlignImageLeft = useCallback(() => {
    editor.chain().focus().setImageAlign("left").run();
  }, [editor]);

  const onAlignImageCenter = useCallback(() => {
    editor.chain().focus().setImageAlign("center").run();
  }, [editor]);

  const onAlignImageRight = useCallback(() => {
    editor.chain().focus().setImageAlign("right").run();
  }, [editor]);

  const onWidthChange = useCallback(
    (value: number) => {
      editor.chain().focus().setImageWidth(value).run();
    },
    [editor],
  );

  const { isImageLeft, isImageCenter, isImageRight, width } = useEditorState({
    editor,
    selector: (ctx) => {
      const widthAttr = ctx.editor.getAttributes("customImage").width || "50%";
      return {
        isImageLeft: ctx.editor.isActive("customImage", { align: "left" }),
        isImageCenter: ctx.editor.isActive("customImage", { align: "center" }),
        isImageRight: ctx.editor.isActive("customImage", { align: "right" }),
        width: parseInt(widthAttr, 10) || 50,
      };
    },
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBlockMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        appendTo: () => appendTo?.current || document.body,
        offset: [0, 8],
      }}
    >
      <div
        ref={menuRef}
        className={`rounded-md flex gap-2 p-2 bg-[var(--sidebar-bg)] ${shouldShow() ? "flex" : "hidden"}`}
      >
        <AlignHorizontalDistributeStart
          onClick={onAlignImageLeft}
          className={`${isImageLeft ? "" : "text-[#494949]"}`}
        />
        <AlignHorizontalDistributeCenter
          onClick={onAlignImageCenter}
          className={`${isImageCenter ? "" : "text-[#494949]"}`}
        />
        <AlignHorizontalDistributeEnd
          onClick={onAlignImageRight}
          className={`${isImageRight ? "" : "text-[#494949]"}`}
        />

        <ImageBlockWidthSlider onChange={onWidthChange} value={width} />
      </div>
    </BubbleMenu>
  );
};

export default ImageBlockMenu;
