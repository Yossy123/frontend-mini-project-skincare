/**
 * Facts the legal pages quote. Review them and the wording in `content.ts` with someone who can
 * give legal advice, then set `isDraft` to false: while it is true every legal page shows a
 * "draft" banner.
 */
export const LEGAL = {
  isDraft: true,
  brand: 'NOBYDERM',
  /** Registered business name, e.g. "PT Nobyderm Indonesia". Leave empty to use the brand name. */
  legalEntity: '',
  /** Postal address shown under "Kontak". Leave empty to hide it. */
  address: '',
  /** Public contact email. Leave empty to hide it. */
  contactEmail: '',
  whatsapp: process.env.NEXT_PUBLIC_CLINIC_WA_NUMBER || '6281211462862',
  lastUpdated: '9 Oktober 2026',
  /** How long an unpaid order stays open before it expires. */
  paymentWindowHours: 24,
  /** How long after delivery a customer has to report a damaged or wrong item. */
  reportWindowHours: 48,
  /** Days after delivery before an unconfirmed order completes by itself (see ORDER_AUTO_COMPLETE_DAYS on the server). */
  autoCompleteDays: 3,
  /** Time the store needs to pay a refund once approved. */
  refundProcessTime: '7 sampai 14 hari kerja',
} as const;

export function legalName(): string {
  return LEGAL.legalEntity || LEGAL.brand;
}

/** Contact lines for the "Kontak" section; empty details are left out. */
export function contactLines(): string[] {
  const whatsapp = LEGAL.whatsapp.replace(/^0/, '62');
  return [
    `WhatsApp: +${whatsapp}`,
    ...(LEGAL.contactEmail ? [`Email: ${LEGAL.contactEmail}`] : []),
    ...(LEGAL.address ? [`Alamat: ${LEGAL.address}`] : []),
  ];
}
