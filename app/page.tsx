import { NoteEditor } from '@/components/note-editor'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="glass-panel w-full space-y-8 p-6 sm:space-y-10 sm:p-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            <Link href="https://ahoxy.com">AHOXY</Link> NOTE, Fast and Easy to use
          </h1>
        </div>
        <div className="glass-surface p-5 sm:p-8">
          <NoteEditor />
        </div>
        <section className="glass-surface p-5 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight sm:mb-6 sm:text-xl bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
            Quick tips for getting started
          </h2>
          <ol className="liquid-list">
            <li>This page is literally for free and easy to use. This online note pad can auto save what you wrote.</li>
            <li><strong>New</strong> button is for clearing the note pad.</li>
            <li><strong>Import and Export</strong> buttons to open text files from your local device and to save as a text file.</li>
            <li><strong>Print</strong> is for print. Instead of saving as a file and press print, you can just click this button.</li>
            <li>It is <strong>recommended</strong> not to make very long notes for twitter, instagram, facebook.</li>
            <li>
              <Link href="https://ahoxy.com" rel="follow">https://ahoxy.com</Link> This is my original website that I&apos;m working on to learn front-end programming. Feel free to report any issues in this website.
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}
