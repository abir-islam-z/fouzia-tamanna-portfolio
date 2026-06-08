import { cn } from "@/lib/utils"
import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiH3,
  RiImageAddLine,
  RiItalic,
  RiLink,
  RiLinkUnlink,
  RiListOrdered2,
  RiListUnordered,
  RiStrikethrough,
} from "@remixicon/react"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { common, createLowlight } from "lowlight"
import { useEffect } from "react"
import { MediaPicker } from "./media-picker"

// Create a lowlight instance with common languages
const lowlight = createLowlight(common)

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  minHeight = 240,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // Disable default codeBlock in favor of CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-primary underline underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "my-4 max-w-full rounded-lg border border-border",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none px-4 py-3 outline-none",
          "prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:font-mono prose-p:text-sm prose-p:leading-relaxed",
          "prose-strong:text-primary prose-em:text-primary/80",
          "prose-a:text-primary prose-a:underline",
          "prose-ul:font-mono prose-ol:font-mono prose-li:my-1",
          "prose-blockquote:border-l-primary prose-blockquote:font-mono",
          "prose-code:font-mono prose-code:bg-muted prose-code:px-1.5 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto",
          "prose-pre:font-mono prose-pre:text-sm prose-pre:leading-relaxed",
          "focus:outline-none"
        ),
        "data-placeholder": placeholder,
        style: `min-height: ${minHeight}px;`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  // Keep editor in sync if value prop changes externally
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-background",
          className
        )}
        style={{ minHeight: minHeight + 50 }}
      />
    )
  }

  const addLink = () => {
    const previous = editor.getAttributes("link").href
    const url = window.prompt("URL", previous || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background focus-within:border-primary",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2">
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
        >
          <RiH1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          <RiH2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
        >
          <RiH3 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <RiBold size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <RiItalic size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <RiStrikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <RiCodeLine size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted list"
        >
          <RiListUnordered size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <RiListOrdered2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <RiDoubleQuotesL size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive("link")}
          onClick={addLink}
          title="Link"
        >
          <RiLink size={16} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove link"
          >
            <RiLinkUnlink size={16} />
          </ToolbarButton>
        )}

        <MediaPicker
          onSelect={(media) => {
            editor
              .chain()
              .focus()
              .setImage({
                src: media.url,
                alt: media.alt ?? media.originalName,
              })
              .run()
          }}
          trigger={
            <ToolbarButton title="Insert image from library" asChild>
              <span>
                <RiImageAddLine size={16} />
              </span>
            </ToolbarButton>
          }
        />

        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <RiArrowGoBackLine size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <RiArrowGoForwardLine size={16} />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  asChild,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
  asChild?: boolean
  children: React.ReactNode
}) {
  if (asChild) {
    return (
      <button
        type="button"
        title={title}
        className={cn(
          "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          active && "bg-primary/15 text-primary",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        {children}
      </button>
    )
  }
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-primary/15 text-primary",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}
