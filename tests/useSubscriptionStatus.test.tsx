import { act, renderHook } from '@testing-library/react';
import { useSubscriptionStatus } from '../src/useSubscriptionStatus';
import { InternalAgencyClientProvider, useInternalAgencyClient } from '../src/InternalAgencyClientProvider';
import { describe, expect, it, type Mock, vi } from 'vitest';
import type { JSXElementConstructor, ReactNode } from 'react';
import { clientConfigMock } from './shared';

vi.mock('../src/InternalAgencyClientProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/InternalAgencyClientProvider')>();
  return ({
    ...actual,
    useInternalAgencyClient: vi.fn(),
  });
});

describe('useSubscriptionStatus', () => {
  const mockClient = {
    fridStore: { getFrid: vi.fn(() => 'test-frid' as string | undefined) },
    checkSubscription: vi.fn(() => Promise.resolve({ active: true })),
  };

  const ClientProvider: JSXElementConstructor<{ children: ReactNode }> = ({ children }) => InternalAgencyClientProvider({ config: clientConfigMock, children });

  it('returns loading=true initially', async () => {
    vi.restoreAllMocks();
    (useInternalAgencyClient as Mock).mockReturnValue({
      client: mockClient,
      initialized: false,
    });

    const { result } = renderHook(
      () => useSubscriptionStatus(),
      { wrapper: ClientProvider },
    );
    expect(result.current.loading).toBe(true);
  });

  it('fetches subscription status when client is initialized', async () => {
    vi.useFakeTimers();
    // const spies = vi.spyOn(mockClient, 'checkSubscription');

    (useInternalAgencyClient as Mock).mockReturnValue({
      client: mockClient,
      initialized: true,
    });

    const { result } = renderHook(
      () => useSubscriptionStatus(),
      { wrapper: ClientProvider },
    );

    await act(async () => {
      await vi.advanceTimersByTime(0);
    });

    expect(mockClient.checkSubscription).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.subscriptionActive).toBe(true);
  });

  it('does not fetch subscription status if frid is absent', async () => {
    vi.restoreAllMocks();
    vi.useFakeTimers();

    mockClient.fridStore.getFrid.mockReturnValueOnce(undefined);
    (useInternalAgencyClient as Mock).mockReturnValue({
      client: mockClient,
      initialized: true,
    });

    renderHook(() => useSubscriptionStatus(), {
      wrapper: ClientProvider,
    });

    await act(async () => {
      await vi.advanceTimersByTime(0);
    });

    expect(mockClient.checkSubscription).not.toHaveBeenCalled();
  });
});
