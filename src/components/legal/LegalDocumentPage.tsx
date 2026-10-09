import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LEGAL } from '@/lib/legal/config';
import { LEGAL_DOCUMENTS, LEGAL_PATHS, type LegalDocumentKey } from '@/lib/legal/content';

const OTHER_LINKS: Record<LegalDocumentKey, string> = {
  privacy: 'Kebijakan Privasi',
  terms: 'Syarat dan Ketentuan',
  refund: 'Kebijakan Refund',
};

/** Shared layout of the legal pages: table of contents, numbered sections and links to the sibling documents. */
export function LegalDocumentPage({ documentKey }: { documentKey: LegalDocumentKey }) {
  const document = LEGAL_DOCUMENTS[documentKey];

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:px-8">
        {LEGAL.isDraft && (
          <p role="note" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <strong>Draf, belum ditinjau.</strong> Dokumen ini masih berupa rancangan dan belum menjadi ketentuan resmi sebelum ditinjau dan disahkan oleh pemilik usaha.
          </p>
        )}

        <header className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="font-serif text-3xl font-normal text-zinc-900 sm:text-4xl">{document.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">{document.summary}</p>
          <p className="mt-3 text-xs text-zinc-400">Terakhir diperbarui: {LEGAL.lastUpdated}</p>
        </header>

        <nav aria-label="Daftar isi" className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Daftar isi</h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {document.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[#8d6228] hover:underline">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8">
          {document.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-zinc-900">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-zinc-700">
                {section.body.map((block, position) =>
                  typeof block === 'string' ? (
                    <p key={position}>{block}</p>
                  ) : (
                    <ul key={position} className="list-disc space-y-1.5 pl-5">
                      {block.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        <nav aria-label="Dokumen terkait" className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-200 pt-6 text-sm">
          {(Object.keys(LEGAL_PATHS) as LegalDocumentKey[])
            .filter((key) => key !== documentKey)
            .map((key) => (
              <Link key={key} href={LEGAL_PATHS[key]} className="font-medium text-[#8d6228] hover:underline">
                {OTHER_LINKS[key]}
              </Link>
            ))}
        </nav>
      </main>
      <Footer />
    </div>
  );
}
