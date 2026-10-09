'use client';

import React from 'react';
import { BookOpen, Lightbulb, PlayCircle } from 'lucide-react';
import { GUIDES, type GuideRole } from '@/lib/guide/content';
import { startGuideTour } from '@/components/guide/GuideTour';

const TONES = {
  dark: {
    heading: 'text-white',
    text: 'text-zinc-400',
    card: 'border-zinc-800 bg-zinc-900',
    cardTitle: 'text-zinc-100',
    step: 'text-zinc-300',
    badge: 'bg-zinc-800 text-zinc-300',
    tip: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    link: 'text-zinc-300 hover:text-white',
    button: 'bg-rose-500 hover:bg-rose-600 text-white',
  },
  light: {
    heading: 'text-zinc-900',
    text: 'text-zinc-600',
    card: 'border-zinc-200 bg-white',
    cardTitle: 'text-zinc-900',
    step: 'text-zinc-700',
    badge: 'bg-[#fbf3e6] text-[#8d6228]',
    tip: 'border-amber-200 bg-amber-50 text-amber-900',
    link: 'text-[#8d6228] hover:text-[#6d4a1d]',
    button: 'bg-[#b77d32] hover:bg-[#9d6928] text-white',
  },
} as const;

interface GuideViewProps {
  role: GuideRole;
  tone: keyof typeof TONES;
}

/** Full written guide for one role: every task as numbered steps, with a button to replay the tour. */
export function GuideView({ role, tone }: GuideViewProps) {
  const guide = GUIDES[role];
  const palette = TONES[tone];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className={`flex items-center gap-2 text-2xl font-semibold ${palette.heading}`}>
            <BookOpen className="h-6 w-6" />
            {guide.title}
          </h1>
          <button
            type="button"
            onClick={() => startGuideTour(role)}
            className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-xs font-semibold transition ${palette.button}`}
          >
            <PlayCircle className="h-4 w-4" />
            Mulai tur
          </button>
        </div>
        <p className={`max-w-3xl text-sm leading-relaxed ${palette.text}`}>{guide.intro}</p>
        <nav aria-label="Daftar topik" className="flex flex-wrap gap-2">
          {guide.topics.map((topic) => (
            <a key={topic.id} href={`#${topic.id}`} className={`rounded-full px-3 py-1 text-xs font-medium ${palette.badge}`}>
              {topic.title}
            </a>
          ))}
        </nav>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {guide.topics.map((topic) => (
          <section key={topic.id} id={topic.id} className={`scroll-mt-24 rounded-2xl border p-4 sm:p-5 ${palette.card}`}>
            <h2 className={`text-base font-semibold ${palette.cardTitle}`}>{topic.title}</h2>
            <p className={`mt-0.5 text-xs ${palette.text}`}>{topic.summary}</p>
            <ol className="mt-3 space-y-2.5">
              {topic.steps.map((text, position) => (
                <li key={text} className={`flex gap-2.5 text-xs leading-relaxed ${palette.step}`}>
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${palette.badge}`}>
                    {position + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            {topic.tips?.map((tip) => (
              <p key={tip} className={`mt-3 flex items-start gap-2 rounded-xl border p-2.5 text-[11px] leading-relaxed ${palette.tip}`}>
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{tip}</span>
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
