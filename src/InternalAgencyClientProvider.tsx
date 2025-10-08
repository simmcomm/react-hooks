import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createInternalAgencyClient, type InternalAgencyClient } from '@simmcomm/internal-agency-client';
import { createUniversalFridStore } from './universalFridStore';
import { useSearchParams } from 'next/navigation';

type InternalAgencyClientContext<T extends boolean = boolean> = {
  client: InternalAgencyClient | undefined;
  initialized: boolean;
  initializing: boolean;
  error: unknown;
  init: T extends true ? () => Promise<void> : never;
};

type Provider = React.FC<React.PropsWithChildren<{
  config: Parameters<typeof createInternalAgencyClient>[0],
}>>;

export const InternalAgencyClientContext = createContext<InternalAgencyClientContext | undefined>(undefined);

export const InternalAgencyClientProvider: Provider = ({ config, children }) => {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const searchParams = useSearchParams();

  if (config.fridStore === undefined) {
    config.fridStore = createUniversalFridStore();
  }

  const client = useMemo(
    () => createInternalAgencyClient(config),
    [config],
  );

  const init = useCallback(async () => {
    try {
      await client.saveEvent('client_init');
      setInitialized(true);
    } catch (e) {
      setError(e);
      setInitialized(false);
    } finally {
      setInitializing(false);
    }
  }, [client]);

  useEffect(() => {
    if (initialized) { return; }
    if (searchParams && searchParams.has('frid')) {
      client.fridStore.setFrid(searchParams.get('frid')!);
    }
  }, []);

  return (
    <InternalAgencyClientContext.Provider value={{ client, initialized, initializing, error, init }}>
      {children}
    </InternalAgencyClientContext.Provider>
  );
};

export function useInternalAgencyClient<T extends boolean = boolean>(options?: { manualInit?: T }): InternalAgencyClientContext<T> {
  const ctx = useContext(InternalAgencyClientContext);
  if (!ctx) throw new Error('useInternalAgencyClient must be used within an InternalAgencyClientProvider');
  const manualInit = options?.manualInit ?? false;
  useEffect(() => {
    if (!manualInit && !ctx.initializing && !ctx.initialized) {
      ctx.initializing = true;
      void ctx.init();
    }
  }, [ctx]);

  return ctx;
}
