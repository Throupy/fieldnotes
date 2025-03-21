import { Image } from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export const ImageBlock = Image.extend({
  name: "customImage", 

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: "",
      },
      width: {
        default: "50%",
        renderHTML: (attributes) => ({ width: attributes.width }),
        parseHTML: (element) => element.getAttribute("width") || "50%",
      },
      align: {
        default: "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
        parseHTML: (element) => element.getAttribute("data-align") || "center",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setCustomImage:
        (attributes) =>
        ({ commands }) => {
          return commands.setImage(attributes);
        },
      setImageWidth:
        (width) =>
        ({ commands }) => {
          return commands.updateAttributes("customImage", { width: `${width}%` });
        },
      setImageAlign:
        (align) =>
        ({ commands }) => {
          return commands.updateAttributes("customImage", { align });
        },
    };
  },
});

export default ImageBlock;