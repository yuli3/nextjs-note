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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"




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
      <Accordion type="single" collapsible className="w-full p-12">
        <AccordionItem value="item-1">
          <AccordionTrigger>About Us</AccordionTrigger>
          <AccordionContent>
          Welcome to AHOXY NOTE, NOTE.AHOXY.com where we want to share information related to text editor. We&apos;re dedicated to providing you the very best information and knowledge of the above mentioned topics. Especially we want to serve the newest and the very best knowledge of Games, Technology, and our Reviews for the newest content.<br /> 
          <br />
          We hope you found all of the information on AHOXY NOTE helpful, as we love to share them with you. If you require any more information or have any questions about our site, please feel free to contact us by email at kobasolos@icloud.com.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Disclaimer</AccordionTrigger>
          <AccordionContent>
          If you require any more information or have any questions about our site&apos;s disclaimer, please feel free to contact us by email at kobasolos@icloud.com.<br />
          <br />
          Disclaimers for AHOXY NOTE<br />
          All the information on this website - https://note.ahoxy.com - is published in good faith and for general information purpose only. AHOXY NOTE does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website (AHOXY), is strictly at your own risk. AHOXY will not be liable for any losses and/or damages in connection with the use of our website.<br />
          <br />
          From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone &apos;bad&apos;.<br />
          Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their &apos;Terms of Service&apos; before engaging in any business or uploading any information.<br />
          <br />
          Consent<br />
          By using our website, you hereby consent to our disclaimer and agree to its terms.<br />
          <br />
          Update<br />
          Should we update, amend or make any changes to this document, those changes will be prominently posted here.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Privacy Policy</AccordionTrigger>
          <AccordionContent>
          Privacy policy<br />
          We respect your privacy and are committed to protecting it through our compliance with this privacy policy (“Policy”). This Policy describes the types of information we may collect from you or that you may provide (“Personal Information”) on the note.ahoxy.com website (“Website” or “Service”) and any of its related products and services (collectively, “Services”), and our practices for collecting, using, maintaining, protecting, and disclosing that Personal Information. It also describes the choices available to you regarding our use of your Personal Information and how you can access and update it.<br />
          <br />
          This Policy is a legally binding agreement between you (“User”, “you” or “your”) and this Website operator (“Operator”, “we”, “us” or “our”). If you are entering into this agreement on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this agreement, in which case the terms “User”, “you” or “your” shall refer to such entity. If you do not have such authority, or if you do not agree with the terms of this agreement, you must not accept this agreement and may not access and use the Website and Services. By accessing and using the Website and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy. This Policy does not apply to the practices of companies that we do not own or control, or to individuals that we do not employ or manage.<br />
          <br />
          <br />

          Automatic collection of information<br />
          When you open the Website, our servers automatically record information that your browser sends. This data may include information such as your device’s IP address, browser type, and version, operating system type and version, language preferences or the webpage you were visiting before you came to the Website and Services, pages of the Website and Services that you visit, the time spent on those pages, information you search for on the Website, access times and dates, and other statistics.<br />
          <br />
          Information collected automatically is used only to identify potential cases of abuse and establish statistical information regarding the usage and traffic of the Website and Services. This statistical information is not otherwise aggregated in such a way that would identify any particular User of the system.<br />
          <br />
          <br />

          Collection of personal information<br />
          You can access and use the Website and Services without telling us who you are or revealing any information by which someone could identify you as a specific, identifiable individual. If, however, you wish to use some of the features offered on the Website, you may be asked to provide certain Personal Information (for example, your name and e-mail address).<br />
          <br />
          We receive and store any information you knowingly provide to us when you fill any forms on the Website.<br />
          <br />
          You can choose not to provide us with your Personal Information, but then you may not be able to take advantage of some of the features on the Website. Users who are uncertain about what information is mandatory are welcome to contact us.<br />
          <br />
          <br />

          Privacy of children<br />
          We do not knowingly collect any Personal Information from children under the age of 13. If you are under the age of 13, please do not submit any Personal Information through the Website and Services. If you have reason to believe that a child under the age of 13 has provided Personal Information to us through the Website and Services, please contact us to request that we delete that child’s Personal Information from our Services.<br />
          <br />
          We encourage parents and legal guardians to monitor their children&aps;s Internet usage and to help enforce this Policy by instructing their children never to provide Personal Information through the Website and Services without their permission. We also ask that all parents and legal guardians overseeing the care of children take the necessary precautions to ensure that their children are instructed to never give out Personal Information when online without their permission.<br />
          <br />
          <br />

          Use and processing of collected information<br />
          We act as a data controller and a data processor when handling Personal Information, unless we have entered into a data processing agreement with you in which case you would be the data controller and we would be the data processor.<br />
          <br />
          Our role may also differ depending on the specific situation involving Personal Information. We act in the capacity of a data controller when we ask you to submit your Personal Information that is necessary to ensure your access and use of the Website and Services. In such instances, we are a data controller because we determine the purposes and means of the processing of Personal Information.<br />
          <br />
          We act in the capacity of a data processor in situations when you submit Personal Information through the Website and Services. We do not own, control, or make decisions about the submitted Personal Information, and such Personal Information is processed only in accordance with your instructions. In such instances, the User providing Personal Information acts as a data controller.<br />
          <br />
          In order to make the Website and Services available to you, or to meet a legal obligation, we may need to collect and use certain Personal Information. If you do not provide the information that we request, we may not be able to provide you with the requested products or services. Any of the information we collect from you may be used to help us run and operate the Website and Services.<br />
          <br />
          Processing your Personal Information depends on how you interact with the Website and Services, where you are located in the world and if one of the following applies: (i) you have given your consent for one or more specific purposes; (ii) provision of information is necessary for the performance of an agreement with you and/or for any pre-contractual obligations thereof; (iii) processing is necessary for compliance with a legal obligation to which you are subject; (iv) processing is related to a task that is carried out in the public interest or in the exercise of official authority vested in us; (v) processing is necessary for the purposes of the legitimate interests pursued by us or by a third party.<br />
          <br />
          Note that under some legislations we may be allowed to process information until you object to such processing by opting out, without having to rely on consent or any other of the legal bases. In any case, we will be happy to clarify the specific legal basis that applies to the processing, and in particular whether the provision of Personal Information is a statutory or contractual requirement, or a requirement necessary to enter into a contract.<br />
          <br />
          <br />

          Disclosure of information<br />
          Depending on the requested Services or as necessary to complete any transaction or provide any Service you have requested, we may share your information with our affiliates, contracted companies, and service providers (collectively, “Service Providers”) we rely upon to assist in the operation of the Website and Services available to you and whose privacy policies are consistent with ours or who agree to abide by our policies with respect to Personal Information. We will not share any personally identifiable information with third parties and will not share any information with unaffiliated third parties.<br />
          <br />
          Service Providers are not authorized to use or disclose your information except as necessary to perform services on our behalf or comply with legal requirements. Service Providers are given the information they need only in order to perform their designated functions, and we do not authorize them to use or disclose any of the provided information for their own marketing or other purposes.<br />
          <br />
          <br />

          Retention of information<br />
          We will retain and use your Personal Information for the period necessary to comply with our legal obligations, to enforce our agreements, resolve disputes, and unless a longer retention period is required or permitted by law.<br />
          <br />
          We may use any aggregated data derived from or incorporating your Personal Information after you update or delete it, but not in a manner that would identify you personally. Once the retention period expires, Personal Information shall be deleted. Therefore, the right to access, the right to erasure, the right to rectification, and the right to data portability cannot be enforced after the expiration of the retention period.<br />
          <br />
          <br />

          Cookies<br />
          Our Website and Services use &aps;cookies&aps; to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you.
          <br />
          We may use cookies to collect, store, and track information for security and personalization, and for statistical purposes. Please note that you have the ability to accept or decline cookies. Most web browsers automatically accept cookies by default, but you can modify your browser settings to decline cookies if you prefer.
          <br />
          <br />

          Data analytics<br />
          Our Website and Services may use third-party analytics tools that use cookies, web beacons, or other similar information-gathering technologies to collect standard internet activity and usage information. The information gathered is used to compile statistical reports on User activity such as how often Users visit our Website and Services, what pages they visit and for how long, etc. We use the information obtained from these analytics tools to monitor the performance and improve our Website and Services. We do not use third-party analytics tools to track or to collect any personally identifiable information of our Users and we will not associate any information gathered from the statistical reports with any individual User.
          <br />
          <br />
          <br />
          Do Not Track signals<br />
          Some browsers incorporate a Do Not Track feature that signals to websites you visit that you do not want to have your online activity tracked. Tracking is not the same as using or collecting information in connection with a website. For these purposes, tracking refers to collecting personally identifiable information from consumers who use or visit a website or online service as they move across different websites over time. How browsers communicate the Do Not Track signal is not yet uniform. As a result, the Website and Services are not yet set up to interpret or respond to Do Not Track signals communicated by your browser. Even so, as described in more detail throughout this Policy, we limit our use and collection of your Personal Information. For a description of Do Not Track protocols for browsers and mobile devices or to learn more about the choices available to you, visit internetcookies.com
          <br />
          <br />

          Links to other resources<br />
          The Website and Services contain links to other resources that are not owned or controlled by us. Please be aware that we are not responsible for the privacy practices of such other resources or third parties. We encourage you to be aware when you leave the Website and Services and to read the privacy statements of each and every resource that may collect Personal Information.
          <br />
          <br />
          <br />
          Information security<br />
          We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in our control and custody. However, no data transmission over the Internet or wireless network can be guaranteed.
          <br />
          Therefore, while we strive to protect your Personal Information, you acknowledge that (i) there are security and privacy limitations of the Internet which are beyond our control; (ii) the security, integrity, and privacy of any and all information and data exchanged between you and the Website and Services cannot be guaranteed; and (iii) any such information and data may be viewed or tampered with in transit by a third party, despite best efforts.
          <br />
          <br />

          Data breach<br />
          In the event we become aware that the security of the Website and Services has been compromised or Users’ Personal Information has been disclosed to unrelated third parties as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities. In the event of a data breach, we will make reasonable efforts to notify affected individuals if we believe that there is a reasonable risk of harm to the User as a result of the breach or if notice is otherwise required by law. When we do, we will post a notice on the Website.
          <br />
          <br />

          Changes and amendments<br />
          <br />
          <br />
          We reserve the right to modify this Policy or its terms related to the Website and Services at any time at our discretion. When we do, we will post a notification on the main page of the Website. We may also provide notice to you in other ways at our discretion, such as through the contact information you have provided.
          <br />
          An updated version of this Policy will be effective immediately upon the posting of the revised Policy unless otherwise specified. Your continued use of the Website and Services after the effective date of the revised Policy (or such other act specified at that time) will constitute your consent to those changes. However, we will not, without your consent, use your Personal Information in a manner materially different than what was stated at the time your Personal Information was collected.
          <br />
          <br />

          Acceptance of this policy<br />
          You acknowledge that you have read this Policy and agree to all its terms and conditions. By accessing and using the Website and Services and submitting your information you agree to be bound by this Policy. If you do not agree to abide by the terms of this Policy, you are not authorized to access or use the Website and Services. This privacy policy was created with the help of https://www.websitepolicies.com/privacy-policy-generator
          <br />
          <br />

          Contacting us<br />
          If you have any questions, concerns, or complaints regarding this Policy, the information we hold about you, or if you wish to exercise your rights, we encourage you to contact us using the details below:
          <br />
          kobasolos@icloud.com<br />
          <br />
          We will attempt to resolve complaints and disputes and make every reasonable effort to honor your wish to exercise your rights as quickly as possible and in any event, within the timescales provided by applicable data protection laws.
          <br /><br />
          This document was last updated on May 10, 2024
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Toaster />
    </main>
  );
};

export default NoteApp;