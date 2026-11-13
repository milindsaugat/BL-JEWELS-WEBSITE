import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  RemoveFormatting,
  Code2,
  Loader2,
} from 'lucide-react';
import { uploadService } from '../services/api';
import { toast } from 'sonner';

const ToolbarButton = ({ onClick, title, active = false, children }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault(); // Preserve editor selection
      onClick();
    }}
    title={title}
    className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
      active
        ? 'bg-[#930303] text-white'
        : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
    }`}
  >
    {children}
  </button>
);

export const RichTextEditor = ({ value = '', onChange, placeholder = 'Write your royal editorial story here...' }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastHtmlRef = useRef(value);
  const [sourceMode, setSourceMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (!sourceMode && editorRef.current && value !== lastHtmlRef.current) {
      editorRef.current.innerHTML = value || '';
      lastHtmlRef.current = value;
    }
  }, [value, sourceMode]);

  useEffect(() => {
    if (!sourceMode && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastHtmlRef.current = value;
    }
  }, [sourceMode]);

  const emitChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastHtmlRef.current = html;
    onChange?.(html);
  };

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const handleOpenLinkBar = () => {
    saveSelection();
    setLinkUrl('https://');
    setShowLinkInput((v) => !v);
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      setShowLinkInput(false);
      return;
    }
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('createLink', false, linkUrl.trim());
    emitChange();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleInsertImageUrl = () => {
    saveSelection();
    const url = window.prompt('Paste image URL (https://...)');
    if (!url || !url.trim()) return;
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('insertImage', false, url.trim());
    emitChange();
  };

  const handleUploadInlineImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/blogs');
      if (res.success && res.url) {
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand('insertImage', false, res.url);
        emitChange();
        toast.success('Image inserted into article!');
      } else {
        toast.error(res.message || 'Image upload failed');
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const plainText = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(' ').length : 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden bg-white focus-within:border-[#930303] transition-colors">
      {/* WYSIWYG Toolbar */}
      <div className="bg-stone-50 border-b border-stone-200 px-2.5 py-2 flex items-center gap-1 flex-wrap">
        {!sourceMode && (
          <>
            <select
              onChange={(e) => {
                if (e.target.value) exec('formatBlock', e.target.value);
              }}
              defaultValue="P"
              aria-label="Text block format"
              className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="P">Paragraph</option>
              <option value="H1">Heading 1</option>
              <option value="H2">Heading 2</option>
              <option value="H3">Heading 3</option>
              <option value="BLOCKQUOTE">Editorial Quote</option>
            </select>

            <span className="h-4 w-px bg-stone-300 mx-1" />

            <ToolbarButton onClick={() => exec('bold')} title="Bold">
              <Bold className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('italic')} title="Italic">
              <Italic className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('underline')} title="Underline">
              <Underline className="w-3.5 h-3.5" />
            </ToolbarButton>

            <span className="h-4 w-px bg-stone-300 mx-1" />

            <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List">
              <List className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List">
              <ListOrdered className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('formatBlock', 'BLOCKQUOTE')} title="Quote Block">
              <Quote className="w-3.5 h-3.5" />
            </ToolbarButton>

            <span className="h-4 w-px bg-stone-300 mx-1" />

            <ToolbarButton onClick={() => exec('justifyLeft')} title="Align Left">
              <AlignLeft className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('justifyCenter')} title="Align Center">
              <AlignCenter className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('justifyRight')} title="Align Right">
              <AlignRight className="w-3.5 h-3.5" />
            </ToolbarButton>

            <span className="h-4 w-px bg-stone-300 mx-1" />

            {/* Brand Ink Palette Swatches */}
            <ToolbarButton onClick={() => exec('foreColor', '#1C1410')} title="Dark Ink">
              <span className="w-3 h-3 rounded-full bg-[#1C1410] block border border-stone-300" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('foreColor', '#8B1A1A')} title="BL Crimson Ink">
              <span className="w-3 h-3 rounded-full bg-[#8B1A1A] block border border-stone-300" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('foreColor', '#9A7420')} title="Royal Gold Ink">
              <span className="w-3 h-3 rounded-full bg-[#C9A44A] block border border-stone-300" />
            </ToolbarButton>

            <span className="h-4 w-px bg-stone-300 mx-1" />

            <ToolbarButton onClick={handleOpenLinkBar} title="Insert Hyperlink" active={showLinkInput}>
              <LinkIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                saveSelection();
                fileInputRef.current?.click();
              }}
              title="Upload Image into Article"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#930303]" /> : <ImageIcon className="w-3.5 h-3.5" />}
            </ToolbarButton>
            <ToolbarButton onClick={handleInsertImageUrl} title="Insert Image by URL">
              <span className="text-[10px] font-bold px-1">IMG URL</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('insertHorizontalRule')} title="Insert Divider Line">
              <Minus className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => exec('removeFormat')} title="Clear Formatting">
              <RemoveFormatting className="w-3.5 h-3.5" />
            </ToolbarButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadInlineImage}
              className="hidden"
            />
          </>
        )}

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setSourceMode((v) => !v)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition-colors ${
              sourceMode
                ? 'bg-[#930303] text-white border-[#930303]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            title="Toggle HTML Source View"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{sourceMode ? 'Visual Editor' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Inline Link Inserter */}
      {showLinkInput && !sourceMode && (
        <form
          onSubmit={handleInsertLink}
          className="bg-amber-50/70 border-b border-amber-200 px-3 py-2 flex items-center gap-2 text-xs"
        >
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#930303]"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#930303] text-white rounded-lg font-semibold cursor-pointer"
          >
            Apply Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1.5 text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Editable Surface or Raw HTML */}
      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={12}
          className="w-full p-4 font-mono text-xs text-stone-800 bg-stone-50 focus:outline-none leading-relaxed"
          placeholder="<p>Write HTML here...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder}
          className="min-h-[260px] max-h-[420px] overflow-y-auto p-4 text-sm text-stone-800 leading-relaxed focus:outline-none [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#8B1A1A] [&_h1]:my-2 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#8B1A1A] [&_h2]:my-2 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A44A] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:bg-[#FAF7F2] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_a]:text-[#8B1A1A] [&_a]:underline [&_img]:rounded-xl [&_img]:my-3 [&_img]:max-h-64 [&_p]:my-2 empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400"
        />
      )}

      {/* Footer Word / Read Time Meta */}
      <div className="bg-stone-50 border-t border-stone-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-stone-500">
        <span>WYSIWYG Rich Editorial Canvas</span>
        <span>
          {wordCount} words • ~{readMins} min read
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;

