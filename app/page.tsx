import { NoteEditor } from '@/components/note-editor'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full space-y-10 p-6 sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            <Link href="https://ahoxy.com">AHOXY</Link> NOTE, Fast and Easy to use
          </h1>
          <ThemeToggle />
        </div>
        <div className="glass-surface p-6 sm:p-8">
          <NoteEditor />
        </div>
        <section className="glass-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground/80 sm:text-xl">
            Quick tips for getting started
          </h2>
          <ol className="liquid-list mt-6">
            <li>This page is literally for free and easy to use. This online note pad can auto save what you wrote.</li>
            <li><strong>New</strong> button is for clearing the note pad.</li>
            <li><strong>Import and Export</strong> buttons to open text files from your local device and to save as a text file.</li>
            <li><strong>Print</strong> is for print. Instead of saving as a file and press print, you can just click this button.</li>
            <li><strong>Dark Mode</strong> is for night-time use.</li>
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
