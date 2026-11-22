import { useEffect } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import {
  Bold,
  Braces,
  ChevronDown,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/** Merge variables available in templates; rendered per recipient by <EmailPreview />. */
export const TEMPLATE_VARIABLES = [
  { token: 'first_name', label: 'First name' },
  { token: 'last_name', label: 'Last name' },
  { token: 'company', label: 'Company' },
  { token: 'title', label: 'Job title' },
  { token: 'sender_first_name', label: 'Sender first name' },
]

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-neutral-600 hover:bg-accent hover:text-foreground [&_svg]:size-3.5',
        active && 'bg-accent text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      link: e.isActive('link'),
    }),
  })
  const chain = () => editor.chain().focus()
  const sep = <span className="mx-1 h-4 w-px bg-border" />
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1">
      <span className="flex h-7 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-neutral-600">
        Sans serif <ChevronDown className="size-3" />
      </span>
      <span className="flex h-7 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-neutral-600">
        11 <ChevronDown className="size-3" />
      </span>
      {sep}
      <ToolbarButton label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}><Bold /></ToolbarButton>
      <ToolbarButton label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}><Italic /></ToolbarButton>
      <ToolbarButton label="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()}><Underline /></ToolbarButton>
      {sep}
      <ToolbarButton label="Bulleted list" active={s.bullet} onClick={() => chain().toggleBulletList().run()}><List /></ToolbarButton>
      <ToolbarButton label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
      <ToolbarButton
        label="Link"
        active={s.link}
        onClick={() => {
          if (s.link) return chain().unsetLink().run()
          const url = window.prompt('Link URL', 'https://')
          if (url) chain().setLink({ href: url }).run()
        }}
      >
        <Link2 />
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Insert variable"
            className="flex size-7 items-center justify-center rounded-md text-neutral-600 hover:bg-accent hover:text-foreground"
          >
            <Braces className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Insert variable</DropdownMenuLabel>
          {TEMPLATE_VARIABLES.map((v) => (
            <DropdownMenuItem key={v.token} onSelect={() => chain().insertContent(`{{${v.token}}}`).run()}>
              <Braces /> {v.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {sep}
      <ToolbarButton label="Undo" onClick={() => chain().undo().run()}><Undo2 /></ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => chain().redo().run()}><Redo2 /></ToolbarButton>
    </div>
  )
}

/**
 * Email body editor (Tiptap). Controlled by HTML: `value` sets content when it changes
 * from outside (e.g. AI draft streaming in), `onChange` reports edits.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your email…',
  className,
  minHeight = 240,
}: {
  value: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Placeholder.configure({ placeholder })],
    content: value,
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'pact-prose outline-none px-4 py-3',
        style: `min-height:${minHeight}px`,
      },
    },
  })

  // Sync external value changes without clobbering the cursor on our own edits
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border bg-background', className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-0 flex-1 overflow-y-auto" />
    </div>
  )
}
