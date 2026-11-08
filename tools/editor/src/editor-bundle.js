import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";

const lowlight = createLowlight({ bash, css, javascript, json, python, sql, xml });
export function createBlogEditor(element, content, onUpdate) {
  return new Editor({
    element,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }, codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }), Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, protocols: ["https"] }), Placeholder.configure({ placeholder: "Start writing your note…" }),
      Underline, Highlight.configure({ multicolor: false }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ nocookie: true, controls: true, modestBranding: true, width: 720, height: 405 }),
    ],
    content: content || "<p></p>",
    editorProps: { attributes: { class: "tiptap-content" } },
    onUpdate: ({ editor }) => onUpdate(editor),
  });
}
