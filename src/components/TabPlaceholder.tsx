import React from 'react';
import { AccountButton } from './AccountButton';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';

/** Screen title only: stands in for a tab until its own phase builds it. */
export const TabPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <>
    <Header title={title} rightAction={<AccountButton />} />
    <OfflineBanner />
  </>
);
