import React from 'react';
import { InternalAgencyClientProvider } from '../../src';
import { DumpClientState } from './DumpClientState';

export function App() {
  return (
    <InternalAgencyClientProvider config={{
      apiEndpoint: 'https://subscribe.mybrainiq.com/internal/',
      serviceId: 'MBIQ000001',
      campaignId: 'MBIQ000001',
    }}>
      <DumpClientState/>
    </InternalAgencyClientProvider>
  );
}
