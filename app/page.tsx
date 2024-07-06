"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CryptoJS from 'crypto-js';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from '@/components/mode-toggle';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import Link from 'next/link';

import { Suspense } from 'react'


interface Draft {
  id: number;
  content: string;
}

const NoteApp: React.FC = () => {
  const [note, setNote] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem('drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }

    // Load font preferences
    const savedFontFamily = localStorage.getItem('fontFamily');
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
    }
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }

    // Check for shared note in URL
    const o = searchParams.get('o');
    if (o) {
      const decryptedNote = decryptNote(o);
      setNote(decryptedNote);
    }
  }, [searchParams]);

  useEffect(() => {
    // Save note to localStorage as user types
    localStorage.setItem('currentNote', note);

    // Update URL with encrypted note
    const encryptedNote = encryptNote(note);
    const params = new URLSearchParams(searchParams);
    params.set('o', encryptedNote);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    autoResize();
  }, [note, searchParams, pathname, router]);

  const saveDraft = () => {
    const newDraft: Draft = { id: Date.now(), content: note };
    const updatedDrafts = [newDraft, ...drafts.slice(0, 9)];
    setDrafts(updatedDrafts);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    toast('Saved draft');
  };

  const loadDraft = (draft: Draft) => {
    setNote(draft.content);
    autoResize();
    toast('Loaded draft');
  };

  const deleteDraft = (id: number) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setNote(content);
        autoResize();
      };
      reader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = () => {
    const blob = new Blob([note], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = document.createElement('iframe');
    printContent.style.position = 'absolute';
    printContent.style.width = '0';
    printContent.style.height = '0';
    printContent.style.border = '0';
    document.body.appendChild(printContent);

    printContent.contentDocument?.write(`
      <html>
        <head>
          <title>Print Note</title>
          <style>
            body { font-family: ${fontFamily}; font-size: ${fontSize}px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${note}</pre>
        </body>
      </html>
    `);

    printContent.contentDocument?.close();
    printContent.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(printContent);
    }, 100);
  };

  const handleShareURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard
     .writeText(currentURL)
     .then(() => toast("Copied URL"));
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const handleUndo = () => {
    textareaRef.current?.focus();
    document.execCommand('undo');
  };

  const handleRedo = () => {
    textareaRef.current?.focus();
    document.execCommand('redo');
  };

  const handleCut = async () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = note.slice(start, end);

      try {
        await navigator.clipboard.writeText(selectedText);
        const newText = note.slice(0, start) + note.slice(end);
        setNote(newText);
        toast("Text cut to clipboard");
      } catch (err) {
        console.error('Failed to cut text: ', err);
        toast("Failed to cut text");
      }
    }
  };

  const handleCopy = async () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = note.slice(start, end);

      try {
        await navigator.clipboard.writeText(selectedText);
        toast("Text copied to clipboard");
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast("Failed to copy text");
      }
    }
  };

  const handlePaste = async () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;

      try {
        const clipboardText = await navigator.clipboard.readText();
        const newText = note.slice(0, start) + clipboardText + note.slice(end);
        setNote(newText);
        toast("Text pasted from clipboard");
      } catch (err) {
        console.error('Failed to paste text: ', err);
        toast("Failed to paste text");
      }
    }
  };

  const changeFontFamily = (value: string) => {
    setFontFamily(value);
    localStorage.setItem('fontFamily', value);
  };

  const changeFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
  };

  const encryptNote = (text: string): string => {
    return CryptoJS.AES.encrypt(text, 'secret_key').toString();
  };

  const decryptNote = (encrypted: string): string => {
    const bytes = CryptoJS.AES.decrypt(encrypted, 'secret_key');
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <main className="md:container md:mx-auto flex min-h-screen flex-col items-center justify-between p-2">
      <div className="md:container md:mx-auto z-10 w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4"><Link href="https://door.ahoxy.com">AHOXY</Link> NOTE, Fast and Easy to use</h1>
          <Suspense>
            <div className="controls space-y-2">
              <div className="flex space-x-2 flex-wrap">
                <Button onClick={saveDraft}>Save Draft</Button>
                <Separator orientation="vertical" />
                <Button onClick={handleExport}>Export</Button>
                <Button onClick={handleImportClick}>Import</Button>
                <Input 
                  type="file" 
                  accept=".txt" 
                  id="fileImport" 
                  onChange={handleImport} 
                  className="hidden"
                  ref={fileInputRef}
                />
                <Separator orientation="vertical" />
                <Button onClick={handlePrint}>Print</Button>
                <Button onClick={handleShareURL}>Share</Button>
                <Separator orientation="vertical" />
                <ModeToggle />
              </div>
              <Separator />
              <div className="flex space-x-2 flex-wrap">
                <Button onClick={handleUndo}>Undo</Button>
                <Button onClick={handleRedo}>Redo</Button>
                <Separator orientation="vertical" />
                <Button onClick={handleCut}>Cut</Button>
                <Button onClick={handleCopy}>Copy</Button>
                <Button onClick={handlePaste}>Paste</Button>
              </div>
              <Separator />
              <div className="flex space-x-2 flex-wrap">
                <Select onValueChange={changeFontFamily}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Font Family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Cosmic Sans MS">Cosmic Sans MS</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Segoe UI">Segoe UI</SelectItem>
                    <SelectItem value="-apple-system, BlinkMacSystemFont, system-ui">System Font</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={changeFontSize}
                  min="8"
                  max="24"
                  className="w-20"
                />
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onInput={autoResize}
              className="w-full leading-snug overflow-hidden mt-4 min-h-[200px]"
              style={{ fontFamily, fontSize: `${fontSize}px` }}
            />
            <div className="drafts mt-4">
              <h2 className="text-xl font-semibold mb-2">Drafts</h2>
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div key={draft.id} className="flex space-x-2">
                    <Button onClick={() => loadDraft(draft)} variant="outline" className="flex-grow">
                      Draft {truncateContent(draft.content, 15)} : {new Date(draft.id).toLocaleString()}
                    </Button>
                    <Button onClick={() => deleteDraft(draft.id)} variant="destructive">
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Suspense>
        </div>
      </div>
      <section className="w-full p-12 flex justify-center items-end">
        <ol className="list-decimal">
          <li>This page is literally for free and easy to use. This online note pad can auto save what you wrote.</li>
          <li><strong>New</strong> button is for clearing the note pad.</li>
          <li><strong>Import and Export</strong> buttons to open text files from your local device and to save as a text file.</li>
          <li><strong>Print</strong> is for print. Instead of saving as a file and press print, you can just click this button.</li>
          <li><strong>Dark Mode</strong> is for night-time use.</li>
          <li><strong>Share</strong> Button is for sharing your work with friends. Your work is saved in URL so that anyone with this url can see what you wrote by visiting that url. And that url is saved by clicking <strong>Share</strong> Button</li>
          <li><strong>Undo, Redo, Cut, Copy, Paste</strong> is not working well in some browsers like Safari. But This works well in other browsers</li>
          <li>Save Draft by clicking <strong>Save</strong> Button below. But all the drafts and auto saved works are on you local storage. So it is not shared by our web sites. But In case of malware attack on your device, do not write any privacy or important issues in this page. We do not use your cookie or local storage to run a business here.</li>
          <li>Drafts are listed below and you can add drafts, load drafts, and also delete drafts by clicking buttons</li>
          <li>This site is made with NextJS, React, Tailwindcss, Shadcn-ui</li>
          <li><Link href="https://door.ahoxy.com" rel="follow">https://door.ahoxy.com</Link> This is my original website that I&apos;m working on to learn front-end programming. Feel free to report any issues in this website.</li>
        </ol>
      </section>

      <Toaster />
    </main>
  );
};

export default NoteApp;