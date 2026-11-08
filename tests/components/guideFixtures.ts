import type { GuideDetail, GuideSummary } from '@/lib/api/guides';

export const guideList: GuideSummary[] = [
  { slug: 'vehicle-finance', title: 'Vehicle finance', summary: 'Instalments, balloon payments and what dealers check.', icon: 'car', done: 2, total: 6 },
  { slug: 'personal-loans', title: 'Personal loans', summary: 'How personal loans work and what they really cost.', icon: 'hand-coins', done: 0, total: 6 },
  { slug: 'credit-cards', title: 'Credit cards', summary: 'Limits, interest-free days and minimum payments.', icon: 'credit-card', done: 0, total: 6 },
];

const texts = ['I have my 3 latest payslips', "I have my last 3 months' bank statements", "I have my ID and driver's licence", 'I have proof of address from the last 3 months', "I've checked my free credit report", 'My Room covers the instalment I\'m planning'];

export const vehicleGuide: GuideDetail = {
  slug: 'vehicle-finance',
  title: 'Vehicle finance',
  body: '#### How it works\n\nVehicle finance lets you buy a car.\n\n#### Words to know\n\n- **Deposit:** money you pay upfront.\n\n#### What lenders check\n\n- Your income.',
  items: texts.map((text, i) => ({ id: `i${i}`, text, ticked: false })),
};
