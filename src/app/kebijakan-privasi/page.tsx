import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | NOBYDERM',
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage documentKey="privacy" />;
}
