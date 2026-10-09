'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuideView } from '@/components/guide/GuideView';

export default function AccountGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        <GuideView role="customer" tone="light" />
      </main>
      <Footer />
    </div>
  );
}
