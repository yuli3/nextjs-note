import { NoteEditor } from '@/components/note-editor'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4"><Link href="https://ahoxy.com">AHOXY</Link> NOTE, Fast and Easy to use</h1>
        <ThemeToggle />
      </div>
      <NoteEditor />
      <section className="w-full py-12 px-4">
        <ol className="list-decimal">
          <li>This page is literally for free and easy to use. This online note pad can auto save what you wrote.</li>
          <li><strong>New</strong> button is for clearing the note pad.</li>
          <li><strong>Import and Export</strong> buttons to open text files from your local device and to save as a text file.</li>
          <li><strong>Print</strong> is for print. Instead of saving as a file and press print, you can just click this button.</li>
          <li><strong>Dark Mode</strong> is for night-time use.</li>
          <li>It is <strong>recommended</strong> not to make very long notes for twitter, instagram, facebook.</li>
          <li><Link href="https://ahoxy.com" rel="follow">https://ahoxy.com</Link> This is my original website that I&apos;m working on to learn front-end programming. Feel free to report any issues in this website.</li>
        </ol>
        </section>
    </main>
  )
}

