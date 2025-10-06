import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createInternalAgencyClient, type InternalAgencyClient } from '@simmcomm/internal-agency-client';
import { createUniversalFridStore } from './universalFridStore';
import { useSearchParams } from 'next/navigation';

type InternalAgencyClientContext = {
  client: InternalAgencyClient | undefined;
  initialized: boolean;
  initializing: boolean;
  error: unknown;
};

export const InternalAgencyClientContext = createContext<InternalAgencyClientContext | undefined>(undefined);

type Provider = React.FC<React.PropsWithChildren<{
  config: Parameters<typeof createInternalAgencyClient>[0],
}>>;

export const InternalAgencyClientProvider: Provider = ({ config, children }) => {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const searchParams = useSearchParams();

  if (config.fridStore === undefined) {
    config.fridStore = createUniversalFridStore();
  }

  const client = useMemo(
    () => createInternalAgencyClient(config),
    [config],
  );

  useEffect(() => {
    if (initialized) return;
    if (searchParams && searchParams.has('frid')) {
      client.fridStore.setFrid(searchParams.get('frid')!);
    }

    client.saveEvent('client_init').then(() => {
      setInitialized(true);
    }).catch((e) => {
      setError(e);
      setInitialized(false);
    }).finally(() => {
      setInitializing(false);
    });
  }, []);

  return (
    <InternalAgencyClientContext.Provider value={{ client, initialized, initializing, error }}>
      {children}
    </InternalAgencyClientContext.Provider>
  );
};

export function useInternalAgencyClient() {
  const ctx = useContext(InternalAgencyClientContext);
  if (!ctx) throw new Error('useInternalAgencyClient must be used within an InternalAgencyClientProvider');
  return ctx;
}
