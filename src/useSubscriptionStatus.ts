import { useEffect, useMemo, useState } from 'react';
import { useInternalAgencyClient } from './index';
import type { CheckSubscriptionResponse } from '@simmcomm/internal-agency-client';

let firstLoad = false;

export function useSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<CheckSubscriptionResponse>();
  const [loading, setLoading] = useState(true);
  const { client, initialized: clientInitialized } = useInternalAgencyClient();

  useEffect(() => {
    if (!client) return;
    if (!clientInitialized) return;
    if (subscriptionStatus) return;
    const { getFrid } = client.fridStore;
    const frid = getFrid();
    if (!frid) return;
    if (firstLoad && loading) return;
    firstLoad = true;

    client.checkSubscription().then((status) => {
      setSubscriptionStatus(status);
    }).finally(() => {
      setLoading(false);
    });
  });

  return {
    loading,
    subscriptionStatus: useMemo(() => subscriptionStatus, [subscriptionStatus]),
    subscriptionActive: useMemo(() => subscriptionStatus?.active ?? false, [subscriptionStatus]),
  };
}
