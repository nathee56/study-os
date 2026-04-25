'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { IconBold, IconItalic, IconUnderline, IconList, IconCode, IconLink } from '@/components/ui/Icons';
import { useEffect } from 'react';

interface NoteEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function NoteEditor({ content, onChange }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'เริ่มเขียนโน้ตที่นี่...' }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolBtn = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={active ? 'active' : ''}>
      {children}
    </button>
  );

  return (
    <div>
      <div className="editor-toolbar">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <IconBold size={16} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <IconItalic size={16} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <IconUnderline size={16} />
        </ToolBtn>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>H1</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>H2</span>
        </ToolBtn>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <IconList size={16} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <IconCode size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => {
          const url = prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>
          <IconLink size={16} />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
