import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Kebijakan Refund dan Pengembalian | NOBYDERM',
};

export default function RefundPolicyPage() {
  return <LegalDocumentPage documentKey="refund" />;
}
