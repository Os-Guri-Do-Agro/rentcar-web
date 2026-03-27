import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Quote, Minus, Heading1, Heading2, Heading3
} from 'lucide-react';

const ToolbarBtn = ({ onMouseDown, active, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={onMouseDown}
    className={`p-1.5 rounded transition-colors ${active ? 'bg-[#0E3A2F] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 self-center" />;

const TiptapEditor = forwardRef(({ value, onChange, minHeight = '16rem' }, ref) => {
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction: () => forceUpdate(n => n + 1),
  });

  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    setContent: (html) => {
      if (!editor) return;
      editor.commands.setContent(html || '');
    },
  }));

  if (!editor) return null;

  const cmd = (action) => (e) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-visible shadow-sm focus-within:ring-2 focus-within:ring-[#00D166] focus-within:border-transparent transition-all">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <ToolbarBtn title="Título 1" onMouseDown={cmd(() => editor.chain().toggleHeading({ level: 1 }).run())} active={editor.isActive('heading', { level: 1 })}><Heading1 size={15} /></ToolbarBtn>
        <ToolbarBtn title="Título 2" onMouseDown={cmd(() => editor.chain().toggleHeading({ level: 2 }).run())} active={editor.isActive('heading', { level: 2 })}><Heading2 size={15} /></ToolbarBtn>
        <ToolbarBtn title="Título 3" onMouseDown={cmd(() => editor.chain().toggleHeading({ level: 3 }).run())} active={editor.isActive('heading', { level: 3 })}><Heading3 size={15} /></ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Negrito" onMouseDown={cmd(() => editor.chain().toggleBold().run())} active={editor.isActive('bold')}><Bold size={15} /></ToolbarBtn>
        <ToolbarBtn title="Itálico" onMouseDown={cmd(() => editor.chain().toggleItalic().run())} active={editor.isActive('italic')}><Italic size={15} /></ToolbarBtn>
        <ToolbarBtn title="Sublinhado" onMouseDown={cmd(() => editor.chain().toggleUnderline().run())} active={editor.isActive('underline')}><Underline size={15} /></ToolbarBtn>
        <ToolbarBtn title="Tachado" onMouseDown={cmd(() => editor.chain().toggleStrike().run())} active={editor.isActive('strike')}><Strikethrough size={15} /></ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Citação" onMouseDown={cmd(() => editor.chain().toggleBlockquote().run())} active={editor.isActive('blockquote')}><Quote size={15} /></ToolbarBtn>
        <ToolbarBtn title="Lista" onMouseDown={cmd(() => editor.chain().toggleBulletList().run())} active={editor.isActive('bulletList')}><List size={15} /></ToolbarBtn>
        <ToolbarBtn title="Lista numerada" onMouseDown={cmd(() => editor.chain().toggleOrderedList().run())} active={editor.isActive('orderedList')}><ListOrdered size={15} /></ToolbarBtn>
        <ToolbarBtn title="Linha horizontal" onMouseDown={cmd(() => editor.chain().setHorizontalRule().run())} active={false}><Minus size={15} /></ToolbarBtn>
      </div>

      <EditorContent
        editor={editor}
        className="p-4 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[var(--editor-min-h)]"
        style={{ '--editor-min-h': minHeight }}
      />
    </div>
  );
});

export default TiptapEditor;
