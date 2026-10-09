import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan | NOBYDERM',
};

export default function TermsPage() {
  return <LegalDocumentPage documentKey="terms" />;
}
