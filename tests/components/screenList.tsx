import React from 'react';
import { vi } from 'vitest';
import * as ask from '@/lib/api/ask';
import * as guides from '@/lib/api/guides';
import * as money from '@/lib/api/moneyProfile';
import * as tx from '@/lib/api/transactions';
import { S1Welcome } from '@/pages/S1Welcome';
import { S2SignUp } from '@/pages/S2SignUp';
import { S3LogIn } from '@/pages/S3LogIn';
import { S4ForgotPassword } from '@/pages/S4ForgotPassword';
import { S5SetUp } from '@/pages/S5SetUp';
import { S6Snapshot } from '@/pages/S6Snapshot';
import { S7MyMoney } from '@/pages/S7MyMoney';
import { S8Transactions } from '@/pages/S8Transactions';
import { S9AskCreditWise } from '@/pages/S9AskCreditWise';
import { S10GetReady } from '@/pages/S10GetReady';
import { S11SetNewPassword } from '@/pages/S11SetNewPassword';
import { S12Account } from '@/pages/S12Account';
import { thandoAuth } from './helpers';
import { newUser, thando } from './fixtures';
import { guideList, vehicleGuide } from './guideFixtures';
import { allRows, flagged, page } from './transactionFixtures';

const loggedOut = { ...thandoAuth, session: null, account: null };

/** A loaded-data stand-in for every API module. Call from beforeEach in files that vi.mock those modules. */
export function mockLoadedData() {
  vi.mocked(money.getMoneyProfile).mockResolvedValue(thando);
  vi.mocked(tx.listTransactions).mockImplementation(async (filter) => page(filter === 'flagged' ? flagged : allRows));
  vi.mocked(tx.getOpenFlagCount).mockResolvedValue(3);
  vi.mocked(tx.getTransactionCount).mockResolvedValue(62);
  vi.mocked(tx.getEarlierPayments).mockResolvedValue([]);
  vi.mocked(ask.getChat).mockResolvedValue({ messages: [], questionsLeft: 18 });
  vi.mocked(guides.listGuides).mockResolvedValue(guideList);
  vi.mocked(guides.getGuide).mockResolvedValue(vehicleGuide);
}

export function mockSetUpData() {
  vi.mocked(money.getMoneyProfile).mockResolvedValue(newUser);
}

export interface ScreenCase {
  name: string;
  ui: React.ReactElement;
  path: string;
  auth?: typeof thandoAuth;
  /** Text that shows once the screen has loaded. */
  ready: string;
  /** Buttons that must be disabled while offline. */
  disabledOffline: string[];
  setUp?: boolean;
}

export const SCREENS: ScreenCase[] = [
  { name: 'S1', ui: <S1Welcome />, path: '/', auth: loggedOut, ready: 'Know your DTI and status band', disabledOffline: [] },
  { name: 'S2', ui: <S2SignUp />, path: '/sign-up', auth: loggedOut, ready: 'Already have an account?', disabledOffline: ['Create account'] },
  { name: 'S3', ui: <S3LogIn />, path: '/log-in', auth: loggedOut, ready: 'New to CreditWise AI?', disabledOffline: ['Log in'] },
  { name: 'S4', ui: <S4ForgotPassword />, path: '/forgot-password', auth: loggedOut, ready: 'Back to log in', disabledOffline: ['Send link'] },
  { name: 'S5', ui: <S5SetUp />, path: '/set-up', ready: 'Your income', disabledOffline: ['Next'], setUp: true },
  { name: 'S6', ui: <S6Snapshot />, path: '/snapshot', ready: 'Hi Thando', disabledOffline: ['What if I settle a debt?', 'Ask about my Snapshot'] },
  { name: 'S7', ui: <S7MyMoney />, path: '/my-money', ready: 'Take-home pay (net)', disabledOffline: ['Edit', 'Add expense', 'Add debt'] },
  { name: 'S8', ui: <S8Transactions />, path: '/transactions', ready: 'FITZONE GYM DEBIT', disabledOffline: ['Add transactions'] },
  { name: 'S9', ui: <S9AskCreditWise />, path: '/ask', ready: '18 questions left today', disabledOffline: ['Send question'] },
  { name: 'S10', ui: <S10GetReady />, path: '/get-ready', ready: '2 of 6 done', disabledOffline: [] },
  { name: 'S11', ui: <S11SetNewPassword />, path: '/set-new-password', auth: { ...thandoAuth, recovery: true }, ready: 'Choose a new password', disabledOffline: ['Save password'] },
  { name: 'S12', ui: <S12Account />, path: '/account', ready: 'thando.nkosi@example.com', disabledOffline: ['Change password', 'Delete all transactions', 'Delete account'] },
];
