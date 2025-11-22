import React, { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { Mark } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Plus,
  Minus,
  Columns,
  Rows,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

const MenuBar = ({ editor, updateTrigger }) => {
  if (!editor) {
    return null;
  }

  // Helper function to check text alignment
  const getTextAlign = () => {
    try {
      // Get the current node's attributes
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      
      // Find the node that can have text alignment (paragraph or heading)
      let node = $from.parent;
      
      // If we're in a list item, check the paragraph inside it
      if (node.type.name === 'listItem' && node.firstChild) {
        node = node.firstChild;
      }
      
      // Check if this node type supports text alignment
      if (node.type.name === 'paragraph' || node.type.name.startsWith('heading')) {
        return node.attrs.textAlign || null;
      }
      
      // Fallback: check parent if current node doesn't support alignment
      const parent = $from.node(-1);
      if (parent && (parent.type.name === 'paragraph' || parent.type.name.startsWith('heading'))) {
        return parent.attrs.textAlign || null;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  const currentAlign = getTextAlign();

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          editor.isActive("bold") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          editor.isActive("italic") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          editor.isActive("underline") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          editor.isActive("strike") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          currentAlign === "left" ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          currentAlign === "center" ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          currentAlign === "right" ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={`p-2 rounded hover:bg-gray-200 ${
          currentAlign === "justify" ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-100 text-blue-700"
            : ""
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-100 text-blue-700"
            : ""
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-100 text-blue-700"
            : ""
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
          editor.isActive("bulletList") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
          editor.isActive("orderedList") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Links */}
      <button
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-200 ${
          editor.isActive("link") ? "bg-blue-100 text-blue-700" : ""
        }`}
        title="Insert Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      {/* Table */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className="p-2 rounded hover:bg-gray-200"
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>

      {/* Table Controls - Show when table is active */}
      {editor.isActive("table") && (
        <>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Column Controls */}
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Add Column Before"
          >
            <Columns className="w-4 h-4" />
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Add Column After"
          >
            <Plus className="w-3 h-3" />
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Delete Column"
          >
            <Columns className="w-4 h-4" />
            <Minus className="w-3 h-3" />
          </button>

          {/* Row Controls */}
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Add Row Before"
          >
            <Rows className="w-4 h-4" />
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Add Row After"
          >
            <Plus className="w-3 h-3" />
            <Rows className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Delete Row"
          >
            <Rows className="w-4 h-4" />
            <Minus className="w-3 h-3" />
          </button>

          {/* Delete Table */}
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            title="Delete Table"
          >
            <TableIcon className="w-4 h-4" />
            <Minus className="w-3 h-3" />
          </button>
        </>
      )}

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

// Underline extension for TipTap using Mark
const UnderlineExtension = Mark.create({
  name: "underline",
  parseHTML() {
    return [
      {
        tag: "u",
      },
      {
        style: "text-decoration",
        getAttrs: (value) => value === "underline" && null,
      },
    ];
  },
  renderHTML() {
    return ["u", 0];
  },
  addCommands() {
    return {
      toggleUnderline: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your policy content..." }) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Explicitly enable heading levels
        heading: {
          levels: [1, 2, 3],
        },
        // Exclude table from StarterKit since we're adding it separately
        table: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      UnderlineExtension,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-400",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-400",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-400 bg-gray-100 px-4 py-2 font-bold cursor-text",
          style: "caret-color: #000; min-height: 1.5em;",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-400 px-4 py-2 cursor-text",
          style: "caret-color: #000; min-height: 1.5em;",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML();
        const text = editor.getText();
        onChange({ html, text });
      }
      setUpdateTrigger((prev) => prev + 1);
    },
    onSelectionUpdate: () => {
      setUpdateTrigger((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: "p-4 min-h-[400px] focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        // Handle Tab key to insert tab character instead of moving focus
        if (event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          // Insert real tab character using ProseMirror API
          const { state, dispatch } = view;
          const { selection } = state;
          const { from } = selection;
          const tr = state.tr.insertText("\t", from, from); // Insert tab character
          dispatch(tr);
          return true;
        }
        // Handle Shift+Tab for outdent (optional, can be removed if not needed)
        if (event.key === "Tab" && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
          // Allow default behavior for Shift+Tab (outdent in lists)
          return false;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <>
      <style>{`
        .tiptap-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap-editor li {
          display: list-item;
          margin: 0.25rem 0;
        }
        .tiptap-editor li p {
          margin: 0;
        }
        .tiptap-editor h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-editor h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-editor h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .tiptap-editor {
          tab-size: 4;
          -moz-tab-size: 4;
        }
        .tiptap-editor table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        .tiptap-editor table td,
        .tiptap-editor table th {
          border: 1px solid #cbd5e0;
          box-sizing: border-box;
          min-width: 1em;
          padding: 8px;
          position: relative;
          vertical-align: top;
        }
        .tiptap-editor table td > *,
        .tiptap-editor table th > * {
          margin-bottom: 0;
        }
        .tiptap-editor table th {
          background-color: #f7fafc;
          font-weight: bold;
        }
        .tiptap-editor table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        .tiptap-editor table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
        /* Fix cursor visibility in table cells */
        .tiptap-editor table td p,
        .tiptap-editor table th p {
          margin: 0;
          min-height: 1.5em;
        }
        .tiptap-editor table td:focus,
        .tiptap-editor table th:focus {
          outline: none;
        }
        .tiptap-editor table td[contenteditable="true"]:empty:before,
        .tiptap-editor table th[contenteditable="true"]:empty:before {
          content: " ";
          white-space: pre-wrap;
        }
        /* Ensure cursor is visible */
        .tiptap-editor table td,
        .tiptap-editor table th {
          caret-color: #000;
        }
        /* Text Alignment Styles */
        .tiptap-editor p[style*="text-align: left"],
        .tiptap-editor h1[style*="text-align: left"],
        .tiptap-editor h2[style*="text-align: left"],
        .tiptap-editor h3[style*="text-align: left"] {
          text-align: left;
        }
        .tiptap-editor p[style*="text-align: center"],
        .tiptap-editor h1[style*="text-align: center"],
        .tiptap-editor h2[style*="text-align: center"],
        .tiptap-editor h3[style*="text-align: center"] {
          text-align: center;
        }
        .tiptap-editor p[style*="text-align: right"],
        .tiptap-editor h1[style*="text-align: right"],
        .tiptap-editor h2[style*="text-align: right"],
        .tiptap-editor h3[style*="text-align: right"] {
          text-align: right;
        }
        .tiptap-editor p[style*="text-align: justify"],
        .tiptap-editor h1[style*="text-align: justify"],
        .tiptap-editor h2[style*="text-align: justify"],
        .tiptap-editor h3[style*="text-align: justify"] {
          text-align: justify;
        }
      `}</style>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col h-full">
        <MenuBar editor={editor} updateTrigger={updateTrigger} />
        <div className="tiptap-editor flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;

